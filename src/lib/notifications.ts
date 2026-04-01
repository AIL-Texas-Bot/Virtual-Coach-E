import { getMessagingInstance } from "./firebase";
import { getToken, onMessage, type MessagePayload } from "firebase/messaging";

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || "";

export type NotificationStatus = "default" | "granted" | "denied" | "unsupported";

export function getNotificationStatus(): NotificationStatus {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission as NotificationStatus;
}

export async function requestPermissionAndGetToken(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    // Register service worker
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    return token;
  } catch (err) {
    console.error("Failed to get FCM token:", err);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: MessagePayload) => void): (() => void) | null {
  let unsubscribe: (() => void) | null = null;

  getMessagingInstance().then((messaging) => {
    if (messaging) {
      unsubscribe = onMessage(messaging, callback);
    }
  });

  return () => {
    if (unsubscribe) unsubscribe();
  };
}
