"use client";

import { useState } from "react";

interface VariationModalProps {
  itemLabel: string;
  onSubmit: (variation: string) => void;
  onClose: () => void;
}

const QUICK_OPTIONS = [
  "Missed entirely",
  "Partial / Modified",
  "Timing changed",
];

export default function VariationModal({ itemLabel, onSubmit, onClose }: VariationModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [freeText, setFreeText] = useState("");

  function handleSubmit() {
    if (selected === "Other" || selected === "Substituted") {
      onSubmit(`${selected} — ${freeText}`);
    } else if (selected) {
      onSubmit(selected);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-bg-card rounded-t-2xl p-6 space-y-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text">Log Variation</h3>
          <button onClick={onClose} className="text-text-dim hover:text-text p-1">
            ✕
          </button>
        </div>

        <p className="text-text-mid text-xs">{itemLabel}</p>

        <div className="space-y-2">
          {QUICK_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setSelected(option)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                selected === option
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "bg-bg-hover text-text-mid hover:bg-bg-hover/80"
              }`}
            >
              {option}
            </button>
          ))}

          <button
            onClick={() => setSelected("Substituted")}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
              selected === "Substituted"
                ? "bg-gold/20 text-gold border border-gold/30"
                : "bg-bg-hover text-text-mid hover:bg-bg-hover/80"
            }`}
          >
            Substituted
          </button>

          <button
            onClick={() => setSelected("Other")}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
              selected === "Other"
                ? "bg-gold/20 text-gold border border-gold/30"
                : "bg-bg-hover text-text-mid hover:bg-bg-hover/80"
            }`}
          >
            Other
          </button>
        </div>

        {(selected === "Substituted" || selected === "Other") && (
          <input
            type="text"
            autoFocus
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder={selected === "Substituted" ? "What did you have instead?" : "Details..."}
            className="w-full bg-bg px-4 py-3 rounded-lg text-sm text-text placeholder:text-text-dim border border-white/10 focus:border-gold/40 focus:outline-none"
          />
        )}

        <button
          onClick={handleSubmit}
          disabled={!selected || ((selected === "Substituted" || selected === "Other") && !freeText)}
          className="w-full py-3 rounded-lg text-sm font-semibold bg-gold text-bg disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          Log Variation
        </button>
      </div>
    </div>
  );
}
