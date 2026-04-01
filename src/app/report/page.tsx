"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { getWeekNumber, PROGRAM_WEEKS } from "@/lib/protocol";

type Tab = "weekly" | "quarterly";

// Demo data — will be replaced with Firestore reads
const DEMO_WEEKLY = {
  weight: 257.8,
  change: -0.2,
  totalLoss: 13.0,
  sleep: 4.2,
  sleepScore: 43,
  steps: 5810,
  water: 4.0,
  stress: 9,
  readiness: 62,
  hrv: 28,
  cardioDays: 7,
  trainingSessions: 5,
  mealsCompliant: 22,
  supplementCompliance: 85,
  bathroomDays: 2,
};

const DEMO_COMPLIANCE: Record<string, Record<string, boolean | null>> = {
  Morning: { M: true, T: true, W: true, T2: true, F: true, S: true, S2: true },
  Cardio: { M: true, T: true, W: true, T2: true, F: true, S: true, S2: true },
  Meal1: { M: true, T: true, W: true, T2: true, F: true, S: true, S2: true },
  Meal2: { M: true, T: true, W: true, T2: true, F: true, S: true, S2: true },
  Meal3: { M: true, T: true, W: false, T2: true, F: true, S: true, S2: true },
  Meal4: { M: false, T: false, W: false, T2: true, F: true, S: true, S2: true },
  Supps: { M: true, T: true, W: false, T2: true, F: true, S: true, S2: true },
  Sleep: { M: true, T: false, W: false, T2: true, F: true, S: true, S2: true },
};

const DEMO_WEIGHT_HISTORY = [
  { week: 1, weight: 270.8 },
  { week: 2, weight: 265.2 },
  { week: 3, weight: 258.0 },
  { week: 4, weight: 257.8 },
];

const DEMO_DEVIATIONS = [
  "Missed Meals 3+4 Wed — emotional stress",
  "Missed Meal 4 Mon/Tue — late meetings",
  "Sleep under 5hrs Mon–Wed",
];

export default function ReportPage() {
  const now = new Date();
  const weekNum = getWeekNumber(now);
  const [tab, setTab] = useState<Tab>("weekly");

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-text">Reports</h1>
              <p className="text-xs text-text-dim">Week {weekNum} of {PROGRAM_WEEKS}</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-3 bg-bg rounded-lg p-1">
            <button
              onClick={() => setTab("weekly")}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === "weekly" ? "bg-bg-card text-gold" : "text-text-dim hover:text-text-mid"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTab("quarterly")}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === "quarterly" ? "bg-bg-card text-gold" : "text-text-dim hover:text-text-mid"
              }`}
            >
              12-Week
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {tab === "weekly" ? <WeeklyTab weekNum={weekNum} /> : <QuarterlyTab weekNum={weekNum} />}
      </main>

      <BottomNav />
    </div>
  );
}

function WeeklyTab({ weekNum }: { weekNum: number }) {
  const d = DEMO_WEEKLY;

  return (
    <>
      {/* Stats Grid */}
      <div className="bg-bg-card rounded-xl p-4 border border-white/5">
        <p className="text-xs font-medium text-text-mid mb-3">📊 Week {weekNum} Summary</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Weight", value: d.weight, unit: "lbs", color: "text-text" },
            { label: "Change", value: `${d.change > 0 ? "+" : ""}${d.change}`, unit: "lbs", color: d.change <= 0 ? "text-success" : "text-danger" },
            { label: "Total Loss", value: d.totalLoss, unit: "lbs", color: "text-gold" },
            { label: "Sleep", value: d.sleep, unit: "hrs", color: "text-bio" },
            { label: "Steps", value: d.steps.toLocaleString(), unit: "avg", color: "text-bio" },
            { label: "Water", value: d.water, unit: "L", color: "text-bio" },
            { label: "Cardio", value: d.cardioDays, unit: "/7", color: "text-success" },
            { label: "Training", value: d.trainingSessions, unit: "sess", color: "text-success" },
            { label: "Meals", value: d.mealsCompliant, unit: "/28", color: "text-success" },
          ].map((stat) => (
            <div key={stat.label} className="bg-bg rounded-lg p-2">
              <p className={`text-base font-mono font-semibold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-text-dim">
                {stat.label} <span className="opacity-50">{stat.unit}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Biometrics Row */}
      <div className="bg-bg-card rounded-xl p-4 border border-white/5">
        <p className="text-xs font-medium text-text-mid mb-3">🔗 Oura Averages</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: "Sleep", value: d.sleepScore, color: d.sleepScore < 60 ? "text-danger" : "text-bio" },
            { label: "Ready", value: d.readiness, color: d.readiness < 70 ? "text-danger" : "text-bio" },
            { label: "HRV", value: d.hrv, color: "text-bio" },
            { label: "Stress", value: `${d.stress}/10`, color: d.stress > 7 ? "text-danger" : "text-bio" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className={`text-lg font-mono font-semibold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-text-dim">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Heat Map */}
      <div className="bg-bg-card rounded-xl p-4 border border-white/5">
        <p className="text-xs font-medium text-text-mid mb-3">🔥 Weekly Compliance</p>
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr>
                <th className="text-left text-[10px] text-text-dim font-normal pb-1 pr-2 w-14"></th>
                {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                  <th key={i} className="text-[10px] text-text-dim font-normal pb-1 w-8">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(DEMO_COMPLIANCE).map(([category, days]) => (
                <tr key={category}>
                  <td className="text-left text-[10px] text-text-dim py-0.5 pr-2">{category}</td>
                  {Object.values(days).map((done, i) => (
                    <td key={i} className="py-0.5">
                      <div
                        className={`w-6 h-6 mx-auto rounded-sm ${
                          done === true
                            ? "bg-success/70"
                            : done === false
                            ? "bg-danger/50"
                            : "bg-bg-hover"
                        }`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-success/70" />
            <span className="text-[10px] text-text-dim">Done</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-danger/50" />
            <span className="text-[10px] text-text-dim">Missed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-bg-hover" />
            <span className="text-[10px] text-text-dim">Pending</span>
          </div>
        </div>
      </div>

      {/* Deviations */}
      <div className="bg-bg-card rounded-xl p-4 border border-white/5 space-y-2">
        <p className="text-xs font-medium text-text-mid">⚠️ Deviations</p>
        {DEMO_DEVIATIONS.map((d, i) => (
          <p key={i} className="text-xs text-danger/80 pl-3 border-l-2 border-danger/30">{d}</p>
        ))}
      </div>

      {/* Coach Response */}
      <CoachResponseCard />

      {/* Report Preview */}
      <div className="bg-bg-card rounded-xl p-4 border border-white/5 space-y-3">
        <p className="text-xs font-medium text-text-mid">📋 Report Preview</p>
        <div className="bg-bg rounded-lg p-3 max-h-48 overflow-y-auto">
          <pre className="text-[10px] text-text-dim font-mono whitespace-pre-wrap leading-relaxed">
{`CURRENT WEIGHT: 257.8 lbs
WEIGHT CHANGE: -0.2 lbs (258.0 → 257.8)
Total loss since start: ~13.0 lbs

CARDIO: Walking daily — 25 min AM fasted. 7/7 days.
TRAINING: 5 sessions (Chest/Back, Shoulders/Arms, Legs, Chest/Back, Shoulders/Arms)
WATER: 4.0L daily
STRESS: 9/10
SLEEP: 4.2 hrs avg. Score 43.
BATHROOM: 2 days
SUPPLEMENTS: 85% compliance

DEVIATIONS:
• Missed Meals 3+4 Wed — emotional stress
• Missed Meal 4 Mon/Tue — late meetings
• Sleep under 5hrs Mon–Wed`}
          </pre>
        </div>
        <button className="w-full py-2 rounded-lg text-xs font-medium bg-gold/15 text-gold hover:bg-gold/25 transition-colors">
          Email Report to Coach
        </button>
      </div>
    </>
  );
}

function QuarterlyTab({ weekNum }: { weekNum: number }) {
  const maxWeight = Math.max(...DEMO_WEIGHT_HISTORY.map((w) => w.weight));
  const minWeight = Math.min(...DEMO_WEIGHT_HISTORY.map((w) => w.weight)) - 5;
  const range = maxWeight - minWeight;

  return (
    <>
      {/* Weight Progression Chart */}
      <div className="bg-bg-card rounded-xl p-4 border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-text-mid">📈 Weight Progression</p>
          <p className="text-xs font-mono text-gold">
            {DEMO_WEIGHT_HISTORY[0].weight} → {DEMO_WEIGHT_HISTORY[DEMO_WEIGHT_HISTORY.length - 1].weight} lbs
          </p>
        </div>

        {/* SVG Bar Chart */}
        <div className="relative h-40">
          <svg viewBox="0 0 300 140" className="w-full h-full" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
              <line
                key={pct}
                x1="0" y1={10 + pct * 110}
                x2="300" y2={10 + pct * 110}
                stroke="#181b23" strokeWidth="1"
              />
            ))}
            {/* Line + points */}
            {DEMO_WEIGHT_HISTORY.map((point, i) => {
              const x = 20 + (i / (PROGRAM_WEEKS - 1)) * 260;
              const y = 10 + ((maxWeight - point.weight) / range) * 110;
              const prevPoint = i > 0 ? DEMO_WEIGHT_HISTORY[i - 1] : null;
              const prevX = prevPoint ? 20 + ((i - 1) / (PROGRAM_WEEKS - 1)) * 260 : 0;
              const prevY = prevPoint ? 10 + ((maxWeight - prevPoint.weight) / range) * 110 : 0;

              return (
                <g key={i}>
                  {prevPoint && (
                    <line x1={prevX} y1={prevY} x2={x} y2={y} stroke="#c9a84c" strokeWidth="2" />
                  )}
                  <circle cx={x} cy={y} r="4" fill="#c9a84c" />
                  <text x={x} y={y - 8} textAnchor="middle" className="text-[8px]" fill="#a0a3b0">
                    {point.weight}
                  </text>
                </g>
              );
            })}
            {/* Week labels */}
            {DEMO_WEIGHT_HISTORY.map((point, i) => {
              const x = 20 + (i / (PROGRAM_WEEKS - 1)) * 260;
              return (
                <text key={`label-${i}`} x={x} y={135} textAnchor="middle" className="text-[8px]" fill="#7a7d89">
                  W{point.week}
                </text>
              );
            })}
            {/* Projected remaining weeks */}
            {Array.from({ length: PROGRAM_WEEKS - weekNum }).map((_, i) => {
              const weekIdx = weekNum + i;
              const x = 20 + (weekIdx / (PROGRAM_WEEKS - 1)) * 260;
              return (
                <text key={`future-${i}`} x={x} y={135} textAnchor="middle" className="text-[8px]" fill="#7a7d89" opacity="0.3">
                  W{weekIdx + 1}
                </text>
              );
            })}
          </svg>
        </div>

        <div className="flex items-center justify-between mt-2 text-[10px] text-text-dim">
          <span>Start: {DEMO_WEIGHT_HISTORY[0].weight} lbs</span>
          <span className="text-gold font-semibold">
            -{(DEMO_WEIGHT_HISTORY[0].weight - DEMO_WEIGHT_HISTORY[DEMO_WEIGHT_HISTORY.length - 1].weight).toFixed(1)} lbs total
          </span>
        </div>
      </div>

      {/* Trend Lines */}
      <div className="bg-bg-card rounded-xl p-4 border border-white/5">
        <p className="text-xs font-medium text-text-mid mb-3">📊 Weekly Trends</p>
        <div className="space-y-3">
          {[
            { label: "Sleep Score", values: [55, 48, 45, 43], unit: "", color: "bg-bio", low: true },
            { label: "Readiness", values: [70, 68, 65, 62], unit: "", color: "bg-bio", low: true },
            { label: "HRV", values: [35, 32, 30, 28], unit: "ms", color: "bg-bio", low: true },
            { label: "Avg Steps", values: [4200, 5100, 5500, 5810], unit: "", color: "bg-success", low: false },
          ].map((trend) => {
            const max = Math.max(...trend.values);
            const current = trend.values[trend.values.length - 1];
            const prev = trend.values[trend.values.length - 2];
            const improving = trend.low ? current > prev : current > prev;

            return (
              <div key={trend.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-dim">{trend.label}</span>
                  <span className={`text-xs font-mono ${improving ? "text-success" : "text-danger"}`}>
                    {current}{trend.unit} {improving ? "↑" : "↓"}
                  </span>
                </div>
                <div className="flex gap-1 items-end h-6">
                  {trend.values.map((v, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm ${trend.color} ${i === trend.values.length - 1 ? "opacity-100" : "opacity-40"}`}
                      style={{ height: `${(v / max) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Photo Timeline */}
      <div className="bg-bg-card rounded-xl p-4 border border-white/5">
        <p className="text-xs font-medium text-text-mid mb-3">📸 Progress Photos</p>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: weekNum }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="aspect-[3/4] rounded-lg bg-bg-hover flex items-center justify-center border border-white/5">
                <span className="text-[10px] text-text-dim/30">W{i + 1}</span>
              </div>
              <p className="text-[10px] text-text-dim mt-1">Week {i + 1}</p>
            </div>
          ))}
          {Array.from({ length: PROGRAM_WEEKS - weekNum }).map((_, i) => (
            <div key={`future-${i}`} className="text-center opacity-20">
              <div className="aspect-[3/4] rounded-lg bg-bg-hover border border-dashed border-white/5" />
              <p className="text-[10px] text-text-dim mt-1">W{weekNum + i + 1}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Before/After Comparison */}
      <div className="bg-bg-card rounded-xl p-4 border border-gold/10">
        <p className="text-xs font-medium text-gold mb-3">🔄 Before / Current</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="aspect-[3/4] rounded-lg bg-bg-hover flex items-center justify-center border border-white/5">
              <div className="text-center">
                <span className="text-2xl block">📷</span>
                <span className="text-[10px] text-text-dim">Week 1</span>
              </div>
            </div>
            <p className="text-xs text-text-dim mt-1">270.8 lbs</p>
          </div>
          <div className="text-center">
            <div className="aspect-[3/4] rounded-lg bg-bg-hover flex items-center justify-center border border-gold/20">
              <div className="text-center">
                <span className="text-2xl block">📷</span>
                <span className="text-[10px] text-gold">Week {weekNum}</span>
              </div>
            </div>
            <p className="text-xs text-gold mt-1">257.8 lbs</p>
          </div>
        </div>
        <p className="text-center text-xs text-success font-semibold mt-3">-13.0 lbs in {weekNum} weeks</p>
      </div>

      {/* Protocol History */}
      <ProtocolHistory />
    </>
  );
}

function CoachResponseCard() {
  // Demo: show a sample coach response
  const hasResponse = true;

  return (
    <div className="bg-bg-card rounded-xl p-4 border border-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-text-mid">💬 Coach Response</p>
        <span className={`text-xs ${hasResponse ? "text-success" : "text-text-dim"}`}>
          {hasResponse ? "Received" : "Pending"}
        </span>
      </div>
      {hasResponse ? (
        <div className="bg-bg rounded-lg p-3 space-y-2">
          <p className="text-xs text-text leading-relaxed">
            &ldquo;Super good, Andy — 0 changes needed. Easter — enjoy 1 meal with family.
            Keep training / non-training day format going.&rdquo;
          </p>
          <p className="text-[10px] text-text-dim">— Coach Elias, March 25</p>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] bg-success/15 text-success px-2 py-0.5 rounded-full">No changes</span>
          </div>
        </div>
      ) : (
        <div className="bg-bg rounded-lg p-3">
          <p className="text-xs text-text-dim italic">
            Report auto-sends Wednesday 6 AM. Coach typically replies same day.
          </p>
        </div>
      )}
    </div>
  );
}

function ProtocolHistory() {
  const versions = [
    {
      version: 4,
      date: "Mar 25",
      source: "Coach Email",
      changes: [
        "Cardio: 20 min → 25 min daily",
        "Added: Thursday treat meal (burger + fries)",
      ],
    },
    {
      version: 3,
      date: "Mar 18",
      source: "Coach Email",
      changes: ["Non-training days: Protein, fats, vegetables only"],
    },
    {
      version: 2,
      date: "Mar 11",
      source: "Coach Email",
      changes: ["Legs: Modified to mobility/bodyweight only (injury)"],
    },
    {
      version: 1,
      date: "Mar 8",
      source: "Initial Setup",
      changes: ["Base protocol established"],
    },
  ];

  return (
    <div className="bg-bg-card rounded-xl p-4 border border-white/5 space-y-3">
      <p className="text-xs font-medium text-text-mid">📋 Protocol History</p>
      <div className="space-y-3">
        {versions.map((v) => (
          <div key={v.version} className="relative pl-4 border-l border-gold/20">
            <div className="absolute left-0 top-0 w-2 h-2 rounded-full bg-gold -translate-x-[5px]" />
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gold">v{v.version}</span>
              <span className="text-[10px] text-text-dim">{v.date}</span>
              <span className="text-[10px] bg-bg-hover text-text-dim px-1.5 py-0.5 rounded">{v.source}</span>
            </div>
            {v.changes.map((change, i) => (
              <p key={i} className="text-xs text-text-mid leading-relaxed">{change}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
