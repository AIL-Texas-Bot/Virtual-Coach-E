"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getNotificationStatus,
  requestPermissionAndGetToken,
  onForegroundMessage,
  type NotificationStatus,
} from "@/lib/notifications";

interface UseNotificationsReturn {
  status: NotificationStatus;
  token: string | null;
  requesting: boolean;
  requestPermission: () => Promise<void>;
  foregroundPayload: ForegroundNotification | null;
  clearForeground: () => void;
}

interface ForegroundNotification {
  title: string;
  body: string;
  field?: string;
  category?: string;
}

export function useNotifications(): UseNotificationsReturn {
  const [status, setStatus] = useState<NotificationStatus>("default");
  const [token, setToken] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [foregroundPayload, setForegroundPayload] = useState<ForegroundNotification | null>(null);

  useEffect(() => {
    setStatus(getNotificationStatus());
  }, []);

  // Listen for foreground messages
  useEffect(() => {
    const cleanup = onForegroundMessage((payload) => {
      const notification = payload.notification;
      const data = payload.data;
      if (notification) {
        setForegroundPayload({
          title: notification.title || "Coach-E",
          body: notification.body || "",
          field: data?.field,
          category: data?.category,
        });
      }
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Listen for service worker messages (variation open requests)
  useEffect(() => {
    function handleSWMessage(event: MessageEvent) {
      if (event.data?.type === "OPEN_VARIATION") {
        // Dispatch custom event for the dashboard to handle
        window.dispatchEvent(
          new CustomEvent("open-variation", { detail: { field: event.data.field } })
        );
      }
    }

    navigator.serviceWorker?.addEventListener("message", handleSWMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleSWMessage);
    };
  }, []);

  const requestPermission = useCallback(async () => {
    setRequesting(true);
    const fcmToken = await requestPermissionAndGetToken();
    if (fcmToken) {
      setToken(fcmToken);
      setStatus("granted");
      // TODO: Save token to Firestore user doc
    } else {
      setStatus(getNotificationStatus());
    }
    setRequesting(false);
  }, []);

  const clearForeground = useCallback(() => {
    setForegroundPayload(null);
  }, []);

  return {
    status,
    token,
    requesting,
    requestPermission,
    foregroundPayload,
    clearForeground,
  };
}
