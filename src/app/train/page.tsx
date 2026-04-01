"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import {
  getTodayTraining,
  getWeekNumber,
  isOddWeek,
  getRepScheme,
  isTrainingDay,
} from "@/lib/protocol";

export default function TrainPage() {
  const now = new Date();
  const weekNum = getWeekNumber(now);
  const training = isTrainingDay(now);
  const todayTraining = getTodayTraining(now);
  const odd = isOddWeek(weekNum);
  const repScheme = getRepScheme(weekNum);

  // Track completed sets: { "Exercise Name": [true, false, true] }
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});
  const [preWorkoutDone, setPreWorkoutDone] = useState(false);

  function toggleSet(exerciseName: string, setIndex: number, totalSets: number) {
    setCompletedSets((prev) => {
      const current = prev[exerciseName] ?? Array(totalSets).fill(false);
      const updated = [...current];
      updated[setIndex] = !updated[setIndex];
      return { ...prev, [exerciseName]: updated };
    });
  }

  // Rest day screen
  if (!training || !todayTraining) {
    return (
      <div className="min-h-screen pb-20">
        <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md border-b border-white/5">
          <div className="max-w-lg mx-auto px-4 py-3">
            <h1 className="text-lg font-bold text-text">Training</h1>
            <p className="text-xs text-text-dim">Week {weekNum}</p>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-12 text-center space-y-6">
          <div className="text-6xl">🧘</div>
          <div>
            <h2 className="text-xl font-bold text-text">Rest Day</h2>
            <p className="text-sm text-text-mid mt-2">Recovery is part of the process.</p>
          </div>
          <div className="bg-bg-card rounded-xl p-4 border border-white/5 text-left space-y-2 max-w-xs mx-auto">
            <p className="text-xs font-medium text-gold">Today&apos;s Focus</p>
            <ul className="text-xs text-text-mid space-y-1.5">
              <li>• 25 min AM fasted walk</li>
              <li>• 15 min PM walk</li>
              <li>• Protein, fats, vegetables only</li>
              <li>• Stay hydrated — 4L water</li>
              <li>• Sleep by 10 PM</li>
            </ul>
          </div>
          <p className="text-xs text-text-dim italic">
            &ldquo;Precision. Consistency. Discipline.&rdquo;
          </p>
        </main>

        <BottomNav />
      </div>
    );
  }

  const totalExercises = todayTraining.exercises.length;
  const completedExercises = todayTraining.exercises.filter((ex) => {
    const sets = completedSets[ex.name];
    return sets && sets.every(Boolean);
  }).length;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-text">{todayTraining.muscleGroup}</h1>
              <p className="text-xs text-text-dim">
                Week {weekNum} &middot; {repScheme}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono font-semibold text-gold">
                {completedExercises}/{totalExercises}
              </p>
              <p className="text-xs text-text-dim">exercises</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-2 h-1 bg-bg-hover rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-500"
              style={{ width: `${(completedExercises / totalExercises) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {/* Pre-Workout */}
        <div
          className={`bg-bg-card rounded-xl p-4 border flex items-center justify-between ${
            preWorkoutDone ? "border-success/20" : "border-white/5"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">💪</span>
            <div>
              <p className={`text-sm font-medium ${preWorkoutDone ? "text-success/80 line-through" : "text-text"}`}>
                Pre-Workout Stack
              </p>
              <p className="text-xs text-text-dim">1L water + salt + EDG Pre</p>
            </div>
          </div>
          {!preWorkoutDone ? (
            <button
              onClick={() => setPreWorkoutDone(true)}
              className="text-xs bg-success/15 text-success px-3 py-1.5 rounded-lg font-medium"
            >
              ✅
            </button>
          ) : (
            <span className="text-success text-sm">✓</span>
          )}
        </div>

        {/* Warm-up reminder for legs */}
        {todayTraining.muscleGroup.includes("LEG") && (
          <div className="bg-gold/10 rounded-xl p-3 border border-gold/20">
            <p className="text-xs text-gold">
              ⚡ Warm-up: Lying Leg Raises before starting
            </p>
          </div>
        )}

        {/* Exercise List */}
        {todayTraining.exercises.map((exercise) => {
          const sets = completedSets[exercise.name] ?? Array(exercise.sets).fill(false);
          const allDone = sets.every(Boolean);
          const reps = odd ? exercise.repsOdd : exercise.repsEven;

          return (
            <div
              key={exercise.name}
              className={`bg-bg-card rounded-xl border overflow-hidden ${
                allDone ? "border-success/20" : "border-white/5"
              }`}
            >
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${allDone ? "text-success/80" : "text-text"}`}>
                      {exercise.name}
                    </p>
                    {exercise.notes && (
                      <p className="text-xs text-gold/70">{exercise.notes}</p>
                    )}
                  </div>
                  <p className="text-xs font-mono text-text-dim">
                    {exercise.sets}×{reps}
                  </p>
                </div>

                {/* Set buttons */}
                <div className="flex gap-2 mt-3">
                  {Array.from({ length: exercise.sets }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => toggleSet(exercise.name, i, exercise.sets)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
                        sets[i]
                          ? "bg-success/20 text-success border border-success/30"
                          : "bg-bg-hover text-text-dim border border-white/5 hover:border-white/10"
                      }`}
                    >
                      {sets[i] ? "✓" : `Set ${i + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* All Done Banner */}
        {completedExercises === totalExercises && (
          <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-center space-y-1">
            <p className="text-success font-semibold">🎉 Workout Complete!</p>
            <p className="text-xs text-text-mid">
              {todayTraining.muscleGroup} — {repScheme} — Week {weekNum}
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
