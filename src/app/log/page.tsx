"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import PhotoUpload, { type PhotoAngle } from "@/components/PhotoUpload";
import { getWeekNumber } from "@/lib/protocol";

export default function LogPage() {
  const now = new Date();
  const weekNum = getWeekNumber(now);

  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [stress, setStress] = useState(5);
  const [bathroom, setBathroom] = useState(false);
  const [photos, setPhotos] = useState<Record<PhotoAngle, string | null>>({
    front: null,
    side: null,
    back: null,
  });
  // Files stored for upload to Firebase Storage when saving
  const [, setPhotoFiles] = useState<Record<string, File>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handlePhotoCaptured(angle: PhotoAngle, file: File, preview: string) {
    setPhotos((prev) => ({ ...prev, [angle]: preview }));
    setPhotoFiles((prev) => ({ ...prev, [angle]: file }));
  }

  async function handleSave() {
    setSaving(true);

    // TODO: Upload photos to Firebase Storage
    // TODO: Save log entry to Firestore
    // For now, simulate save
    await new Promise((resolve) => setTimeout(resolve, 800));

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const hasData = weight || notes || stress !== 5 || bathroom || Object.values(photos).some(Boolean);

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-text">Manual Log</h1>
          <p className="text-xs text-text-dim">
            Week {weekNum} &middot;{" "}
            {now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Weight */}
        <div className="bg-bg-card rounded-xl p-4 border border-white/5 space-y-3">
          <label className="text-xs font-medium text-text-mid">⚖️ Weight (lbs)</label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="257.8"
            className="w-full bg-bg px-4 py-3 rounded-lg text-lg font-mono text-text placeholder:text-text-dim/40 border border-white/10 focus:border-gold/40 focus:outline-none"
          />
        </div>

        {/* Stress */}
        <div className="bg-bg-card rounded-xl p-4 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-text-mid">😤 Stress Level</label>
            <span className="text-sm font-mono text-gold">{stress}/10</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={stress}
            onChange={(e) => setStress(Number(e.target.value))}
            className="w-full accent-gold"
          />
          <div className="flex justify-between text-xs text-text-dim">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {/* Bathroom */}
        <div className="bg-bg-card rounded-xl p-4 border border-white/5">
          <button
            onClick={() => setBathroom(!bathroom)}
            className="w-full flex items-center justify-between"
          >
            <span className="text-xs font-medium text-text-mid">🚽 Bathroom Regular Today?</span>
            <span
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                bathroom ? "bg-success/15 text-success" : "bg-bg-hover text-text-dim"
              }`}
            >
              {bathroom ? "Yes" : "No"}
            </span>
          </button>
        </div>

        {/* Photo Upload */}
        <div className="bg-bg-card rounded-xl p-4 border border-white/5 space-y-3">
          <label className="text-xs font-medium text-text-mid">📸 Progress Photos</label>
          <PhotoUpload onPhotoCaptured={handlePhotoCaptured} photos={photos} />
          <p className="text-xs text-text-dim text-center">
            Tap to capture fasted photos — front, side, back
          </p>
        </div>

        {/* Oura Summary (read-only) */}
        <div className="bg-bg-card rounded-xl p-4 border border-white/5">
          <p className="text-xs font-medium text-text-mid mb-3">🔗 Oura Ring Data</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Sleep Score", value: "—" },
              { label: "Readiness", value: "—" },
              { label: "HRV", value: "—" },
              { label: "RHR", value: "—" },
              { label: "Steps", value: "—" },
              { label: "Active Cal", value: "—" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-xs">
                <span className="text-text-dim">{item.label}</span>
                <span className="font-mono text-bio">{item.value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-dim text-center mt-2 italic">Auto-synced daily at 7 AM</p>
        </div>

        {/* Notes */}
        <div className="bg-bg-card rounded-xl p-4 border border-white/5 space-y-3">
          <label className="text-xs font-medium text-text-mid">📝 Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Anything notable today..."
            className="w-full bg-bg px-4 py-3 rounded-lg text-sm text-text placeholder:text-text-dim/40 border border-white/10 focus:border-gold/40 focus:outline-none resize-none"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!hasData || saving}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
            saved
              ? "bg-success/20 text-success"
              : "bg-gold text-bg hover:bg-gold-dim disabled:opacity-30 disabled:cursor-not-allowed"
          }`}
        >
          {saving ? "Saving..." : saved ? "✓ Saved" : "Save Log Entry"}
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
