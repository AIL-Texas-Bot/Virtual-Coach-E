"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import VariationModal from "@/components/VariationModal";
import {
  MEALS,
  MORNING_PROTOCOL,
  NIGHT_CAP,
  isTrainingDay,
  isThursday,
  getWeekNumber,
} from "@/lib/protocol";

export default function MealsPage() {
  const now = new Date();
  const training = isTrainingDay(now);
  const thursday = isThursday(now);
  const weekNum = getWeekNumber(now);

  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>({});
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [variationTarget, setVariationTarget] = useState<string | null>(null);
  const [variations, setVariations] = useState<Record<string, string>>({});

  function toggleMeal(id: string) {
    setExpandedMeal(expandedMeal === id ? null : id);
  }

  function markComplete(id: string) {
    setCompletedMeals((prev) => ({ ...prev, [id]: true }));
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-text">Today&apos;s Meals</h1>
              <p className="text-xs text-text-dim">Week {weekNum}</p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                training
                  ? "bg-gold/15 text-gold"
                  : "bg-bio/15 text-bio"
              }`}
            >
              {training ? "Training Day" : "Non-Training"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {/* Morning Protocol */}
        <div className="bg-bg-card rounded-xl border border-white/5 overflow-hidden">
          <button
            onClick={() => toggleMeal("morning")}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">☀️</span>
              <div className="text-left">
                <p className={`text-sm font-medium ${completedMeals.morning ? "text-success/80 line-through" : "text-text"}`}>
                  Morning Protocol
                </p>
                <p className="text-xs text-text-dim">{MORNING_PROTOCOL.time}</p>
              </div>
            </div>
            <span className="text-text-dim text-xs">{expandedMeal === "morning" ? "▲" : "▼"}</span>
          </button>
          {expandedMeal === "morning" && (
            <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
              {MORNING_PROTOCOL.items.map((item) => (
                <p key={item} className="text-xs text-text-mid pl-2 border-l border-gold/30">
                  {item}
                </p>
              ))}
              {!completedMeals.morning && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => markComplete("morning")}
                    className="flex-1 text-xs bg-success/15 text-success py-2 rounded-lg font-medium"
                  >
                    ✅ Done
                  </button>
                  <button
                    onClick={() => setVariationTarget("Morning Protocol")}
                    className="flex-1 text-xs bg-danger/15 text-danger py-2 rounded-lg font-medium"
                  >
                    ⚠️ Variation
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Meals */}
        {MEALS.map((meal) => {
          const items = training ? meal.trainingDay : meal.nonTrainingDay;
          const isExpanded = expandedMeal === meal.id;
          const isDone = completedMeals[meal.id];
          const hasVariation = variations[meal.id];

          return (
            <div
              key={meal.id}
              className={`bg-bg-card rounded-xl border overflow-hidden ${
                isDone
                  ? "border-success/20"
                  : hasVariation
                  ? "border-danger/20"
                  : "border-white/5"
              }`}
            >
              <button
                onClick={() => toggleMeal(meal.id)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {meal.number === 1 ? "🍳" : meal.number === 2 ? "🍗" : meal.number === 3 ? "🥩" : "🐟"}
                  </span>
                  <div className="text-left">
                    <p className={`text-sm font-medium ${isDone ? "text-success/80 line-through" : "text-text"}`}>
                      {meal.label}
                    </p>
                    <p className="text-xs text-text-dim">{meal.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isDone && <span className="text-success text-sm">✓</span>}
                  <span className="text-text-dim text-xs">{isExpanded ? "▲" : "▼"}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                  {/* Food items */}
                  <div className="space-y-1.5">
                    {items.map((food) => (
                      <div
                        key={food.food}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-text-mid">{food.food}</span>
                        <span className="font-mono text-text-dim">{food.amount}</span>
                      </div>
                    ))}
                  </div>

                  {/* Non-training indicator */}
                  {!training && (
                    <p className="text-xs text-bio/70 italic">
                      Non-training: {meal.number > 1 ? "No rice/carbs" : "No fruit"}
                    </p>
                  )}

                  {/* Supplements */}
                  {meal.supplements && (
                    <div className="bg-bg/50 rounded-lg p-2.5 space-y-1">
                      <p className="text-xs font-medium text-gold/80">💊 Supplements</p>
                      {meal.supplements.map((supp) => (
                        <p key={supp} className="text-xs text-text-dim pl-2">
                          {supp}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Variation note */}
                  {hasVariation && (
                    <p className="text-xs text-danger/70 italic">⚠️ {hasVariation}</p>
                  )}

                  {/* Actions */}
                  {!isDone && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => markComplete(meal.id)}
                        className="flex-1 text-xs bg-success/15 text-success py-2 rounded-lg font-medium"
                      >
                        ✅ Done
                      </button>
                      <button
                        onClick={() => setVariationTarget(meal.label)}
                        className="flex-1 text-xs bg-danger/15 text-danger py-2 rounded-lg font-medium"
                      >
                        ⚠️ Variation
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Thursday Treat Meal */}
        {thursday && (
          <div className="bg-bg-card rounded-xl border border-gold/20 overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-3">
              <span className="text-lg">🍔</span>
              <div>
                <p className="text-sm font-medium text-gold">Thursday Treat Meal</p>
                <p className="text-xs text-text-dim">
                  Burger + fries (~250g), GF bun, no cheese, 10-min walk post-meal
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Night Cap */}
        <div className="bg-bg-card rounded-xl border border-white/5 px-4 py-3 flex items-center gap-3">
          <span className="text-lg">🌙</span>
          <div>
            <p className={`text-sm font-medium ${completedMeals.nightcap ? "text-success/80 line-through" : "text-text"}`}>
              Night Cap
            </p>
            <p className="text-xs text-text-dim">{NIGHT_CAP.time}</p>
          </div>
          {!completedMeals.nightcap && (
            <button
              onClick={() => markComplete("nightcap")}
              className="ml-auto text-xs bg-success/15 text-success px-3 py-1.5 rounded-lg font-medium"
            >
              ✅
            </button>
          )}
          {completedMeals.nightcap && (
            <span className="ml-auto text-success text-sm">✓</span>
          )}
        </div>
      </main>

      {/* Variation Modal */}
      {variationTarget && (
        <VariationModal
          itemLabel={variationTarget}
          onSubmit={(text) => {
            const mealId = MEALS.find((m) => m.label === variationTarget)?.id ?? variationTarget;
            setVariations((prev) => ({ ...prev, [mealId]: text }));
            setVariationTarget(null);
          }}
          onClose={() => setVariationTarget(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}
