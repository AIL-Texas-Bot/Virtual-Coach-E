/* eslint-disable no-undef */
// Firebase Messaging Service Worker
// This runs in the background and handles push notifications when the app is closed/backgrounded

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: self.__FIREBASE_CONFIG__?.apiKey || "",
  authDomain: self.__FIREBASE_CONFIG__?.authDomain || "",
  projectId: self.__FIREBASE_CONFIG__?.projectId || "",
  storageBucket: self.__FIREBASE_CONFIG__?.storageBucket || "",
  messagingSenderId: self.__FIREBASE_CONFIG__?.messagingSenderId || "",
  appId: self.__FIREBASE_CONFIG__?.appId || "",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  const data = payload.data || {};

  const notificationOptions = {
    body: body || "",
    icon: icon || "/icon-192x192.png",
    badge: "/badge-72x72.png",
    tag: data.field || "coach-e",
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      field: data.field,
      date: data.date,
      userId: data.userId,
      category: data.category,
      url: data.url || "/",
    },
    actions: getActionsForCategory(data.category),
  };

  self.registration.showNotification(title || "Coach-E", notificationOptions);
});

// Map notification category to action buttons
function getActionsForCategory(category) {
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
    case "info":
      return [];
    case "input":
      return [{ action: "open", title: "📝 Log" }];
    default:
      return [
        { action: "done", title: "✅ Done" },
        { action: "variation", title: "⚠️ Variation" },
      ];
  }
}

// Handle notification click (tap on notification body)
self.addEventListener("notificationclick", (event) => {
  const { action } = event;
  const data = event.notification.data || {};

  event.notification.close();

  if (action === "done" || action === "taken") {
    // Log as complete immediately via API
    event.waitUntil(logResponse(data, "done"));
  } else if (action === "missed") {
    event.waitUntil(logResponse(data, "missed"));
  } else if (action === "skip") {
    event.waitUntil(logResponse(data, "skipped"));
  } else if (action === "variation" || action === "open") {
    // Open the app to variation input
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
        const url = data.field ? `/?variation=${data.field}` : "/";
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.postMessage({ type: "OPEN_VARIATION", field: data.field });
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
    );
  } else {
    // Default: open the app
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(data.url || "/");
      })
    );
  }
});

// Send response to API
async function logResponse(data, status) {
  const { field, date, userId } = data;
  if (!field || !userId) return;

  try {
    const response = await fetch("/api/notification-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        date: date || new Date().toISOString().split("T")[0],
        field,
        status,
        time: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error("Failed to log notification response:", response.status);
    }
  } catch (err) {
    console.error("Error logging notification response:", err);
  }
}
