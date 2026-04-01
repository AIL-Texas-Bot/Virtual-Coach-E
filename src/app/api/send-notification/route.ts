import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { DAILY_SCHEDULE, TRAINING_SCHEDULE } from "@/lib/protocol";

// Make.com calls this endpoint at each protocol time to send FCM push notifications
// It sends the schedule item ID + user ID, and we look up the FCM token and send

interface SendNotificationBody {
  userId: string;
  scheduleItemId: string;
  date?: string; // YYYY-MM-DD, defaults to today
}

export async function POST(request: NextRequest) {
  try {
    const body: SendNotificationBody = await request.json();
    const { userId, scheduleItemId, date } = body;

    if (!userId || !scheduleItemId) {
      return NextResponse.json(
        { error: "Missing userId or scheduleItemId" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin not configured" },
        { status: 503 }
      );
    }

    // Look up user's FCM token
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const fcmToken = userData?.fcmToken;
    if (!fcmToken) {
      return NextResponse.json({ error: "No FCM token registered" }, { status: 400 });
    }

    // Find the schedule item
    const allItems = [...DAILY_SCHEDULE, ...TRAINING_SCHEDULE];
    const item = allItems.find((i) => i.id === scheduleItemId);
    if (!item) {
      return NextResponse.json({ error: "Schedule item not found" }, { status: 404 });
    }

    const today = date || new Date().toISOString().split("T")[0];

    // Build FCM message payload
    const message = {
      token: fcmToken,
      notification: {
        title: `${item.emoji} ${item.label.split(" — ")[0]}`,
        body: item.label.includes(" — ") ? item.label.split(" — ").slice(1).join(" — ") : item.label,
      },
      data: {
        field: item.field,
        date: today,
        userId,
        category: item.category,
        scheduleItemId: item.id,
        url: "/",
      },
      webpush: {
        notification: {
          requireInteraction: true,
          renotify: true,
          tag: item.field || item.id,
          badge: "/badge-72x72.png",
          icon: "/icon-192x192.png",
          vibrate: [200, 100, 200],
          actions: getActionsForCategory(item.category),
        },
        fcmOptions: {
          link: "/",
        },
      },
    };

    // Send via Firebase Admin Messaging
    const { getMessaging } = await import("firebase-admin/messaging");
    const adminApp = (await import("@/lib/firebase-admin")).default;
    if (!adminApp) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
    }

    const messaging = getMessaging(adminApp);
    const result = await messaging.send(message);

    return NextResponse.json({
      success: true,
      messageId: result,
      item: item.id,
    });
  } catch (error) {
    console.error("Send notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

function getActionsForCategory(category: string) {
  switch (category) {
    case "meal":
    case "morning":
    case "cardio":
    case "compliance":
      return [
        { action: "done", title: "✅ Done" },
        { action: "variation", title: "⚠️ Variation" },
      ];
    case "supplement":
      return [
        { action: "done", title: "✅ Taken" },
        { action: "missed", title: "❌ Missed" },
      ];
    case "training":
      return [
        { action: "done", title: "✅ Done" },
        { action: "skip", title: "⏭️ Skip" },
      ];
    default:
      return [
        { action: "done", title: "✅ Done" },
        { action: "variation", title: "⚠️ Variation" },
      ];
  }
}
