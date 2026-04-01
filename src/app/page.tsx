"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import VariationModal from "@/components/VariationModal";
import ForegroundNotification from "@/components/ForegroundNotification";
import { useNotifications } from "@/hooks/useNotifications";
import {
  DAILY_SCHEDULE,
  TRAINING_SCHEDULE,
  getWeekNumber,
  isTrainingDay,
  getTodayTraining,
  getRepScheme,
  type ScheduleItem,
} from "@/lib/protocol";

interface ItemStatus {
  done: boolean;
  variation: string | null;
}

const WATER_BLOCKS = 8; // 8 × 0.5L = 4L target

export default function TodayDashboard() {
  const now = new Date();
  const weekNum = getWeekNumber(now);
  const training = isTrainingDay(now);
  const todayTraining = getTodayTraining(now);
  const repScheme = getRepScheme(weekNum);

  // Notifications
  const { status: notifStatus, requesting, requestPermission, foregroundPayload, clearForeground } =
    useNotifications();

  // Local state (will connect to Firestore later)
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({});
  const [waterCount, setWaterCount] = useState(0);
  const [variationTarget, setVariationTarget] = useState<ScheduleItem | null>(null);

  const schedule = useMemo(() => {
    const items = [...DAILY_SCHEDULE];
    if (training) {
      // Insert training items before meal-2
      const meal2Idx = items.findIndex((i) => i.id === "meal-2");
      items.splice(meal2Idx, 0, ...TRAINING_SCHEDULE);
    }
    return items;
  }, [training]);

  function handleDone(item: ScheduleItem) {
    setStatuses((prev) => ({
      ...prev,
      [item.id]: { done: true, variation: null },
    }));
  }

  function handleVariation(item: ScheduleItem) {
    setVariationTarget(item);
  }

  function submitVariation(text: string) {
    if (variationTarget) {
      setStatuses((prev) => ({
        ...prev,
        [variationTarget.id]: { done: false, variation: text },
      }));
      setVariationTarget(null);
    }
  }

  // Determine current time slot
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const completedCount = Object.values(statuses).filter((s) => s.done).length;
  const totalActionable = schedule.filter((s) => !s.actions.includes("info")).length;

  return (
    <div className="min-h-screen pb-20">
      {/* Foreground Notification Banner */}
      {foregroundPayload && (
        <ForegroundNotification
          title={foregroundPayload.title}
          body={foregroundPayload.body}
          field={foregroundPayload.field}
          category={foregroundPayload.category}
          onDone={() => {
            const item = schedule.find((s) => s.field === foregroundPayload.field);
            if (item) handleDone(item);
            clearForeground();
          }}
          onVariation={() => {
            const item = schedule.find((s) => s.field === foregroundPayload.field);
            if (item) handleVariation(item);
            clearForeground();
          }}
          onDismiss={clearForeground}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="Natural Nutrition Coaching"
                width={28}
                height={33}
                className="opacity-90"
              />
              <div>
                <h1 className="text-lg font-bold text-text">
                  Coach<span className="text-gold">-E</span>
                </h1>
                <p className="text-xs text-text-dim">
                  Week {weekNum} of 12 &middot;{" "}
                  {now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-dim">Compliance</p>
              <p className="text-sm font-mono font-semibold text-gold">
                {completedCount}/{totalActionable}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1 bg-bg-hover rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-500"
              style={{ width: `${(weekNum / 12) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Training badge */}
        {training && todayTraining && (
          <div className="bg-bg-card rounded-xl p-3 flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-xl">🏋️</span>
              <div>
                <p className="text-sm font-semibold text-text">{todayTraining.muscleGroup}</p>
                <p className="text-xs text-text-dim">{repScheme} rep scheme</p>
              </div>
            </div>
            <span className="text-xs bg-gold/15 text-gold px-2 py-1 rounded-full font-medium">
              Training Day
            </span>
          </div>
        )}
        {!training && (
          <div className="bg-bg-card rounded-xl p-3 flex items-center gap-3 border border-white/5">
            <span className="text-xl">🧘</span>
            <div>
              <p className="text-sm font-semibold text-text">Rest Day</p>
              <p className="text-xs text-text-dim">Protein, fats, vegetables only</p>
            </div>
          </div>
        )}

        {/* Water Tracker */}
        <div className="bg-bg-card rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-text-mid">💧 Water Intake</p>
            <p className="text-xs font-mono text-bio">
              {(waterCount * 0.5).toFixed(1)}L / 4.0L
            </p>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: WATER_BLOCKS }).map((_, i) => (
              <button
                key={i}
                onClick={() => setWaterCount(i + 1)}
                className={`flex-1 h-6 rounded transition-colors ${
                  i < waterCount ? "bg-bio/80" : "bg-bg-hover"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-1">
          {schedule.map((item) => {
            const status = statuses[item.id];
            const isInfo = item.actions.includes("info");
            const isCurrent =
              item.time !== "PRE" &&
              item.time <= currentTime &&
              schedule.findIndex(
                (s) => s.time !== "PRE" && s.time > currentTime
              ) ===
                schedule.indexOf(item) + 1;

            const label =
              !training && item.nonTrainingLabel ? item.nonTrainingLabel : item.label;

            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors border ${
                  isCurrent
                    ? "border-gold/30 bg-gold/5"
                    : status?.done
                    ? "border-success/20 bg-success/5"
                    : status?.variation
                    ? "border-danger/20 bg-danger/5"
                    : "border-transparent bg-bg-card"
                }`}
              >
                {/* Time */}
                <span className="text-xs font-mono text-text-dim w-11 shrink-0">
                  {item.time === "PRE" ? "PRE" : item.time.replace(/^0/, "")}
                </span>

                {/* Emoji + label */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm truncate ${
                      status?.done
                        ? "text-success/80 line-through"
                        : status?.variation
                        ? "text-danger/80"
                        : isInfo
                        ? "text-text-dim"
                        : "text-text"
                    }`}
                  >
                    {item.emoji} {label}
                  </p>
                  {status?.variation && (
                    <p className="text-xs text-danger/60 truncate mt-0.5">{status.variation}</p>
                  )}
                </div>

                {/* Action buttons */}
                {!isInfo && !status?.done && !status?.variation && (
                  <div className="flex gap-1.5 shrink-0">
                    {(item.actions.includes("done") || item.actions.includes("taken")) && (
                      <button
                        onClick={() => handleDone(item)}
                        className="text-xs bg-success/15 text-success px-2.5 py-1.5 rounded-lg hover:bg-success/25 transition-colors font-medium"
                      >
                        ✅
                      </button>
                    )}
                    {(item.actions.includes("variation") || item.actions.includes("missed")) && (
                      <button
                        onClick={() => handleVariation(item)}
                        className="text-xs bg-danger/15 text-danger px-2.5 py-1.5 rounded-lg hover:bg-danger/25 transition-colors font-medium"
                      >
                        ⚠️
                      </button>
                    )}
                    {item.actions.includes("skip") && (
                      <button
                        onClick={() =>
                          setStatuses((prev) => ({
                            ...prev,
                            [item.id]: { done: false, variation: "Skipped" },
                          }))
                        }
                        className="text-xs bg-bg-hover text-text-dim px-2.5 py-1.5 rounded-lg hover:text-text-mid transition-colors"
                      >
                        Skip
                      </button>
                    )}
                  </div>
                )}

                {/* Completed indicator */}
                {status?.done && (
                  <span className="text-success text-sm shrink-0">✓</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Notification Permission Prompt */}
        {notifStatus !== "granted" && notifStatus !== "unsupported" && (
          <button
            onClick={requestPermission}
            disabled={requesting}
            className="w-full bg-gold/10 border border-gold/20 rounded-xl p-4 text-left flex items-center gap-3 hover:bg-gold/15 transition-colors disabled:opacity-50"
          >
            <span className="text-xl">🔔</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gold">
                {requesting ? "Requesting..." : "Enable Push Notifications"}
              </p>
              <p className="text-xs text-text-dim">
                {notifStatus === "denied"
                  ? "Blocked — enable in browser settings"
                  : "Get reminders for meals, supplements, cardio & more"}
              </p>
            </div>
          </button>
        )}

        {/* Oura Summary Placeholder */}
        <div className="bg-bg-card rounded-xl p-4 border border-white/5">
          <p className="text-xs font-medium text-text-mid mb-3">🔗 Oura Ring</p>
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { label: "Sleep", value: "—", color: "text-bio" },
              { label: "Readiness", value: "—", color: "text-bio" },
              { label: "HRV", value: "—", color: "text-bio" },
              { label: "Steps", value: "—", color: "text-bio" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className={`text-lg font-mono font-semibold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-text-dim">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-dim text-center mt-2">Connect in Settings</p>
        </div>
      </main>

      {/* Variation Modal */}
      {variationTarget && (
        <VariationModal
          itemLabel={`${variationTarget.emoji} ${variationTarget.label}`}
          onSubmit={submitVariation}
          onClose={() => setVariationTarget(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}
