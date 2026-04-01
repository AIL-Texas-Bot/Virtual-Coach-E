"use client";

import { useEffect, useState } from "react";

interface ForegroundNotificationProps {
  title: string;
  body: string;
  field?: string;
  category?: string;
  onDone: () => void;
  onVariation: () => void;
  onDismiss: () => void;
}

export default function ForegroundNotification({
  title,
  body,
  category,
  onDone,
  onVariation,
  onDismiss,
}: ForegroundNotificationProps) {
  const [visible, setVisible] = useState(true);

  // Auto-dismiss after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 15000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible) return null;

  const isInfo = category === "info";
  const isSupplement = category === "supplement";

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] p-3 animate-slide-down">
      <div className="max-w-lg mx-auto bg-bg-card border border-gold/30 rounded-xl p-4 shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gold">{title}</p>
            <p className="text-xs text-text-mid mt-0.5">{body}</p>
          </div>
          <button
            onClick={() => { setVisible(false); onDismiss(); }}
            className="text-text-dim hover:text-text text-xs p-1"
          >
            ✕
          </button>
        </div>

        {!isInfo && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => { setVisible(false); onDone(); }}
              className="flex-1 text-xs bg-success/15 text-success py-2 rounded-lg font-medium"
            >
              {isSupplement ? "✅ Taken" : "✅ Done"}
            </button>
            <button
              onClick={() => { setVisible(false); onVariation(); }}
              className="flex-1 text-xs bg-danger/15 text-danger py-2 rounded-lg font-medium"
            >
              {isSupplement ? "❌ Missed" : "⚠️ Variation"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
