"use client";

import { useState, useRef } from "react";

export type PhotoAngle = "front" | "side" | "back";

interface PhotoUploadProps {
  onPhotoCaptured: (angle: PhotoAngle, file: File, preview: string) => void;
  photos: Record<PhotoAngle, string | null>;
}

const ANGLES: { angle: PhotoAngle; label: string }[] = [
  { angle: "front", label: "Front" },
  { angle: "side", label: "Side" },
  { angle: "back", label: "Back" },
];

export default function PhotoUpload({ onPhotoCaptured, photos }: PhotoUploadProps) {
  const [activeAngle, setActiveAngle] = useState<PhotoAngle | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleCapture(angle: PhotoAngle) {
    setActiveAngle(angle);
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeAngle) return;

    // Create preview URL
    const preview = URL.createObjectURL(file);
    onPhotoCaptured(activeAngle, file, preview);

    // Reset input so same file can be re-selected
    e.target.value = "";
    setActiveAngle(null);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {ANGLES.map(({ angle, label }) => {
          const preview = photos[angle];
          return (
            <button
              key={angle}
              onClick={() => handleCapture(angle)}
              className="relative bg-bg-hover rounded-lg border border-dashed border-white/10 hover:border-gold/30 transition-colors overflow-hidden aspect-[3/4]"
            >
              {preview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt={`${label} photo`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium">Retake</span>
                  </div>
                  <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                    {label}
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-1 p-2">
                  <span className="text-2xl">📷</span>
                  <span className="text-xs text-text-dim">{label}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Hidden file input with camera capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {Object.values(photos).some(Boolean) && (
        <p className="text-xs text-success text-center">
          {Object.values(photos).filter(Boolean).length}/3 photos captured
        </p>
      )}
    </div>
  );
}
