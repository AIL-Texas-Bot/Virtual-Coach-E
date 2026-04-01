"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import BottomNav from "@/components/BottomNav";
import { useNotifications } from "@/hooks/useNotifications";
import { getOuraAuthUrl, getGmailAuthUrl } from "@/lib/oauth";

// Placeholder userId until Firebase Auth is wired up
const USER_ID = "demo-user";

function SettingsContent() {
  const searchParams = useSearchParams();
  const { status: notifStatus, requesting, requestPermission } = useNotifications();

  const ouraConnected = searchParams.get("oura_connected") === "true";
  const ouraError = searchParams.get("oura_error");
  const gmailConnected = searchParams.get("gmail_connected") === "true";
  const gmailError = searchParams.get("gmail_error");

  function handleOuraConnect() {
    const url = getOuraAuthUrl(USER_ID);
    if (!url.includes("client_id=&")) {
      window.location.href = url;
    } else {
      alert("Oura Client ID not configured. Add NEXT_PUBLIC_OURA_CLIENT_ID to .env.local");
    }
  }

  function handleGmailConnect() {
    const url = getGmailAuthUrl(USER_ID);
    if (!url.includes("client_id=&")) {
      window.location.href = url;
    } else {
      alert("Gmail Client ID not configured. Add NEXT_PUBLIC_GMAIL_CLIENT_ID to .env.local");
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-4 space-y-3">
      {/* Profile */}
      <div className="bg-bg-card rounded-xl p-4 border border-white/5 space-y-3">
        <p className="text-xs font-medium text-text-mid">👤 Profile</p>
        {[
          { label: "Name", value: "Andrew Batten" },
          { label: "Email", value: "ailandy216@gmail.com" },
          { label: "Program Start", value: "March 8, 2026" },
          { label: "Timezone", value: "America/Chicago" },
        ].map((field) => (
          <div key={field.label} className="flex justify-between text-xs">
            <span className="text-text-dim">{field.label}</span>
            <span className="text-text font-mono">{field.value}</span>
          </div>
        ))}
      </div>

      {/* Integrations */}
      <div className="bg-bg-card rounded-xl p-4 border border-white/5 space-y-3">
        <p className="text-xs font-medium text-text-mid">🔗 Integrations</p>

        {/* Oura Ring */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-text">Oura Ring</p>
            <p className="text-xs text-text-dim">Sleep, readiness, HRV, steps</p>
            {ouraError && (
              <p className="text-xs text-danger mt-0.5">Connection failed: {ouraError}</p>
            )}
          </div>
          {ouraConnected ? (
            <span className="text-xs bg-success/15 text-success px-3 py-1.5 rounded-lg font-medium">
              ✓ Connected
            </span>
          ) : (
            <button
              onClick={handleOuraConnect}
              className="text-xs bg-bio/15 text-bio px-3 py-1.5 rounded-lg font-medium hover:bg-bio/25 transition-colors"
            >
              Connect
            </button>
          )}
        </div>

        <div className="border-t border-white/5" />

        {/* Gmail */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-text">Gmail (Read-Only)</p>
            <p className="text-xs text-text-dim">Scan coach replies</p>
            {gmailError && (
              <p className="text-xs text-danger mt-0.5">Connection failed: {gmailError}</p>
            )}
          </div>
          {gmailConnected ? (
            <span className="text-xs bg-success/15 text-success px-3 py-1.5 rounded-lg font-medium">
              ✓ Connected
            </span>
          ) : (
            <button
              onClick={handleGmailConnect}
              className="text-xs bg-bio/15 text-bio px-3 py-1.5 rounded-lg font-medium hover:bg-bio/25 transition-colors"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {/* Coach */}
      <div className="bg-bg-card rounded-xl p-4 border border-white/5 space-y-3">
        <p className="text-xs font-medium text-text-mid">🏋️ Coach</p>
        <div className="flex justify-between text-xs">
          <span className="text-text-dim">Coach</span>
          <span className="text-text">Elias Ghazoul</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-text-dim">Email</span>
          <span className="text-text font-mono text-xs">naturalnutritioncoaching@gmail.com</span>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-bg-card rounded-xl p-4 border border-white/5 space-y-3">
        <p className="text-xs font-medium text-text-mid">🔔 Notifications</p>

        {notifStatus === "granted" ? (
          <div className="flex items-center gap-2">
            <span className="text-success text-sm">✓</span>
            <p className="text-xs text-success">Push notifications enabled</p>
          </div>
        ) : notifStatus === "denied" ? (
          <p className="text-xs text-danger">
            Notifications blocked. Enable in your browser settings to receive reminders.
          </p>
        ) : notifStatus === "unsupported" ? (
          <p className="text-xs text-text-dim">Push notifications not supported in this browser.</p>
        ) : (
          <button
            onClick={requestPermission}
            disabled={requesting}
            className="w-full py-2 rounded-lg text-xs font-medium bg-gold/15 text-gold hover:bg-gold/25 transition-colors disabled:opacity-50"
          >
            {requesting ? "Requesting..." : "Enable Push Notifications"}
          </button>
        )}
      </div>

      {/* Protocol */}
      <div className="bg-bg-card rounded-xl p-4 border border-white/5 space-y-3">
        <p className="text-xs font-medium text-text-mid">📋 Active Protocol</p>
        <p className="text-xs text-text-dim">Current meal plan, training schedule, and protocol change history.</p>
        <button className="w-full py-2 rounded-lg text-xs font-medium bg-bg-hover text-text-mid hover:text-text transition-colors">
          View Protocol Details
        </button>
      </div>
    </main>
  );
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-text">Settings</h1>
        </div>
      </header>

      <Suspense fallback={<div className="max-w-lg mx-auto px-4 py-8 text-center text-text-dim text-sm">Loading...</div>}>
        <SettingsContent />
      </Suspense>

      <BottomNav />
    </div>
  );
}
