import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// Make.com calls this after report generation to send the email via Resend (or GHL)

export async function POST(request: NextRequest) {
  try {
    const { userId, weekNumber } = await request.json();

    if (!userId || !weekNumber) {
      return NextResponse.json({ error: "Missing userId or weekNumber" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
    }

    // Fetch the generated report
    const reportDoc = await adminDb
      .collection("users")
      .doc(userId)
      .collection("weeklyReports")
      .doc(String(weekNumber))
      .get();

    if (!reportDoc.exists) {
      return NextResponse.json({ error: "Report not found — generate first" }, { status: 404 });
    }

    const report = reportDoc.data()!;

    // Get user profile for name
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const user = userDoc.data();
    const userName = user?.name || "Andrew Batten";
    const coachEmail = report.coachEmail || "naturalnutritioncoaching@gmail.com";

    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Send via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 503 });
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Coach-E <notifications@${process.env.RESEND_DOMAIN || "virtual-coach-e.netlify.app"}>`,
        to: [coachEmail],
        cc: [user?.email || "ailandy216@gmail.com"],
        subject: `Check-In - ${userName} - ${dateStr}`,
        text: report.reportText,
        // TODO: Attach progress photos from Firebase Storage URLs
      }),
    });

    if (!emailResponse.ok) {
      const err = await emailResponse.text();
      console.error("Resend error:", err);
      return NextResponse.json({ error: "Email send failed" }, { status: 500 });
    }

    const emailResult = await emailResponse.json();

    // Mark report as sent
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("weeklyReports")
      .doc(String(weekNumber))
      .update({ sentAt: new Date() });

    return NextResponse.json({
      success: true,
      emailId: emailResult.id,
      sentTo: coachEmail,
    });
  } catch (error) {
    console.error("Report send error:", error);
    return NextResponse.json({ error: "Report send failed" }, { status: 500 });
  }
}
