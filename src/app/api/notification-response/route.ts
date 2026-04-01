import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

interface NotificationResponseBody {
  userId: string;
  date: string; // YYYY-MM-DD
  field: string; // e.g., "morningProtocol", "meal1", "cardio"
  status: "done" | "missed" | "skipped";
  time: string; // ISO string
  variation?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: NotificationResponseBody = await request.json();
    const { userId, date, field, status, time, variation } = body;

    if (!userId || !date || !field || !status) {
      return NextResponse.json(
        { error: "Missing required fields: userId, date, field, status" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin not configured" },
        { status: 503 }
      );
    }

    // Build the update object for the daily log
    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (status === "done") {
      updateData[`${field}.done`] = true;
      updateData[`${field}.time`] = new Date(time);
      updateData[`${field}.variation`] = null;
    } else if (status === "missed") {
      updateData[`${field}.done`] = false;
      updateData[`${field}.time`] = null;
      updateData[`${field}.variation`] = variation || "Missed";
    } else if (status === "skipped") {
      updateData[`${field}.done`] = false;
      updateData[`${field}.time`] = null;
      updateData[`${field}.variation`] = "Skipped";
    }

    // Update the daily log document (create if doesn't exist)
    const docRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("dailyLogs")
      .doc(date);

    await docRef.set(updateData, { merge: true });

    return NextResponse.json({ success: true, field, status });
  } catch (error) {
    console.error("Notification response error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
