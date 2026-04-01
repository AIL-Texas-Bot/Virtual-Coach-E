// ─── Current Protocol State (as of April 1, 2026 — Week 4) ─────

export const PROGRAM_START_DATE = "2026-03-08";
export const PROGRAM_WEEKS = 12;
export const TIMEZONE = "America/Chicago";

// ─── Notification Schedule ──────────────────────────────────────

export interface ScheduleItem {
  id: string;
  time: string; // HH:mm
  label: string;
  emoji: string;
  category: "morning" | "cardio" | "meal" | "supplement" | "training" | "compliance";
  actions: ("done" | "variation" | "taken" | "missed" | "skip" | "info" | "input")[];
  trainingDayOnly?: boolean;
  nonTrainingLabel?: string;
  field: string; // maps to DailyLog field
}

export const DAILY_SCHEDULE: ScheduleItem[] = [
  {
    id: "morning-protocol",
    time: "06:30",
    label: "Morning Protocol — GI Integrity + Probio + lime/cayenne",
    emoji: "☀️",
    category: "morning",
    actions: ["done", "variation"],
    field: "morningProtocol",
  },
  {
    id: "cardio",
    time: "06:35",
    label: "Fasted Cardio — 25 min walk, 3.0/3.0, HR ~115",
    emoji: "🚶",
    category: "cardio",
    actions: ["done", "variation"],
    field: "cardio",
  },
  {
    id: "meal-1",
    time: "10:00",
    label: "Meal 1 — Eggs, whites, avocado, apple",
    emoji: "🍳",
    category: "meal",
    actions: ["done", "variation"],
    field: "meal1",
  },
  {
    id: "meal-1-supps",
    time: "10:05",
    label: "Meal 1 Supps — D3+K2, Quad Mag x2, Omega x2",
    emoji: "💊",
    category: "supplement",
    actions: ["taken", "missed"],
    field: "meal1Supplements",
  },
  {
    id: "meal-2",
    time: "13:00",
    label: "Meal 2 — Lean protein, coconut oil, rice, veggies",
    emoji: "🍗",
    category: "meal",
    actions: ["done", "variation"],
    nonTrainingLabel: "Meal 2 — ½ carbs today (non-training)",
    field: "meal2",
  },
  {
    id: "meal-3",
    time: "16:00",
    label: "Meal 3 — Lean protein, EVOO, rice, veggies",
    emoji: "🥩",
    category: "meal",
    actions: ["done", "variation"],
    nonTrainingLabel: "Meal 3 — Protein, fats, vegetables only",
    field: "meal3",
  },
  {
    id: "meal-4",
    time: "19:00",
    label: "Meal 4 (LAST) — Protein, avocado, rice, veggies",
    emoji: "🐟",
    category: "meal",
    actions: ["done", "variation"],
    nonTrainingLabel: "Meal 4 — Protein, fats, vegetables only",
    field: "meal4",
  },
  {
    id: "meal-4-supps",
    time: "19:05",
    label: "Meal 4 Supps — Quad Mag x2, Omega x2",
    emoji: "💊",
    category: "supplement",
    actions: ["taken", "missed"],
    field: "meal4Supplements",
  },
  {
    id: "kitchen-closed",
    time: "19:30",
    label: "Kitchen CLOSED",
    emoji: "🔒",
    category: "compliance",
    actions: ["info"],
    field: "",
  },
  {
    id: "screens-off",
    time: "20:30",
    label: "Screens off — 90 min to sleep",
    emoji: "📵",
    category: "compliance",
    actions: ["done", "variation"],
    field: "screensOff",
  },
  {
    id: "weight-check",
    time: "21:30",
    label: "Weight check — step on scale",
    emoji: "⚖️",
    category: "compliance",
    actions: ["input"],
    field: "weight",
  },
  {
    id: "lights-out",
    time: "22:00",
    label: "Lights out — Night Cap taken?",
    emoji: "🌙",
    category: "compliance",
    actions: ["done", "variation"],
    field: "lightsOut",
  },
];

export const TRAINING_SCHEDULE: ScheduleItem[] = [
  {
    id: "pre-workout",
    time: "PRE",
    label: "Pre-Workout — 1L water + salt + EDG Pre",
    emoji: "💪",
    category: "training",
    actions: ["done", "skip"],
    trainingDayOnly: true,
    field: "preWorkoutStack",
  },
];

// ─── Training Split ─────────────────────────────────────────────

export interface TrainingDay {
  day: string; // e.g., "Monday"
  muscleGroup: string;
  exercises: Exercise[];
}

export interface Exercise {
  name: string;
  sets: number;
  repsOdd: string; // odd weeks (1, 3, 5...)
  repsEven: string; // even weeks (2, 4, 6...)
  notes?: string;
}

export const TRAINING_SPLIT: TrainingDay[] = [
  {
    day: "Monday",
    muscleGroup: "CHEST / BACK",
    exercises: [
      { name: "T-Bar Row", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Incline DB Press", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Supinated Cable Pulldown", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Flat DB Fly", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Seated Cable Row", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Cable Crossover", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
    ],
  },
  {
    day: "Tuesday",
    muscleGroup: "SHOULDERS / ARMS",
    exercises: [
      { name: "Seated DB Shoulder Press", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Lateral Raise", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Rear Delt Fly", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "EZ Bar Curl", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Tricep Rope Pushdown", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Hammer Curl", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Overhead Tricep Extension", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
    ],
  },
  {
    day: "Wednesday",
    muscleGroup: "LEGS (Mobility/BW)",
    exercises: [
      { name: "Lying Leg Raises", sets: 3, repsOdd: "15", repsEven: "20", notes: "Warm-up" },
      { name: "Bodyweight Squat", sets: 3, repsOdd: "12-15", repsEven: "15-20" },
      { name: "Walking Lunge", sets: 3, repsOdd: "10/leg", repsEven: "12/leg" },
      { name: "Glute Bridge", sets: 3, repsOdd: "12-15", repsEven: "15-20" },
      { name: "Calf Raise", sets: 3, repsOdd: "15-20", repsEven: "20-25" },
    ],
  },
  {
    day: "Thursday",
    muscleGroup: "CHEST / BACK",
    exercises: [
      { name: "Barbell Row", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Flat Bench Press", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Lat Pulldown", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Incline DB Fly", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Cable Row (Wide)", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Pec Deck", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
    ],
  },
  {
    day: "Friday",
    muscleGroup: "SHOULDERS / ARMS",
    exercises: [
      { name: "Arnold Press", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Cable Lateral Raise", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Face Pull", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Incline DB Curl", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Skull Crusher", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Cable Curl", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
      { name: "Dip Machine", sets: 3, repsOdd: "8-10", repsEven: "12-15" },
    ],
  },
];

export const REST_DAYS = ["Saturday", "Sunday"];

// ─── Meals (Full Protocol) ──────────────────────────────────────

export interface MealItem {
  food: string;
  amount: string;
}

export interface Meal {
  id: string;
  number: number;
  time: string;
  label: string;
  trainingDay: MealItem[];
  nonTrainingDay: MealItem[];
  supplements?: string[];
}

export const MEALS: Meal[] = [
  {
    id: "meal-1",
    number: 1,
    time: "10:00 AM",
    label: "Meal 1",
    trainingDay: [
      { food: "Whole Eggs", amount: "2" },
      { food: "Egg Whites", amount: "200g" },
      { food: "Avocado", amount: "50g" },
      { food: "Apple", amount: "1 medium" },
    ],
    nonTrainingDay: [
      { food: "Whole Eggs", amount: "2" },
      { food: "Egg Whites", amount: "200g" },
      { food: "Avocado", amount: "50g" },
    ],
    supplements: ["D3 10,000 + K2 (1 cap)", "Quad Mag (2 caps)", "Omega 1000 (2 caps)"],
  },
  {
    id: "meal-2",
    number: 2,
    time: "1:00 PM",
    label: "Meal 2",
    trainingDay: [
      { food: "Lean Protein (chicken/turkey)", amount: "200g" },
      { food: "Coconut Oil", amount: "10g" },
      { food: "White Rice", amount: "150g cooked" },
      { food: "Mixed Vegetables", amount: "150g" },
    ],
    nonTrainingDay: [
      { food: "Lean Protein (chicken/turkey)", amount: "200g" },
      { food: "Coconut Oil", amount: "10g" },
      { food: "Mixed Vegetables", amount: "200g" },
    ],
  },
  {
    id: "meal-3",
    number: 3,
    time: "4:00 PM",
    label: "Meal 3",
    trainingDay: [
      { food: "Lean Protein (steak/bison)", amount: "200g" },
      { food: "EVOO", amount: "10g" },
      { food: "White Rice", amount: "150g cooked" },
      { food: "Mixed Vegetables", amount: "150g" },
    ],
    nonTrainingDay: [
      { food: "Lean Protein (steak/bison)", amount: "200g" },
      { food: "EVOO", amount: "10g" },
      { food: "Mixed Vegetables", amount: "200g" },
    ],
  },
  {
    id: "meal-4",
    number: 4,
    time: "7:00 PM",
    label: "Meal 4 (LAST)",
    trainingDay: [
      { food: "Lean Protein (fish/shrimp)", amount: "200g" },
      { food: "Avocado", amount: "50g" },
      { food: "White Rice", amount: "150g cooked" },
      { food: "Mixed Vegetables", amount: "150g" },
    ],
    nonTrainingDay: [
      { food: "Lean Protein (fish/shrimp)", amount: "200g" },
      { food: "Avocado", amount: "50g" },
      { food: "Mixed Vegetables", amount: "200g" },
    ],
    supplements: ["Quad Mag (2 caps)", "Omega 1000 (2 caps)"],
  },
];

export const MORNING_PROTOCOL = {
  time: "6:30 AM",
  items: [
    "Spore Probio — 2 caps",
    "GI Integrity — 1 scoop in 16oz water",
    "Lime juice + cayenne",
  ],
};

export const NIGHT_CAP = {
  time: "10:00 PM",
  items: ["Night Cap supplement"],
};

// ─── Helpers ────────────────────────────────────────────────────

export function getWeekNumber(date: Date): number {
  const start = new Date(PROGRAM_START_DATE);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}

export function isOddWeek(weekNumber: number): boolean {
  return weekNumber % 2 === 1;
}

export function getDayOfWeek(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

export function getTodayTraining(date: Date): TrainingDay | null {
  const day = getDayOfWeek(date);
  return TRAINING_SPLIT.find((t) => t.day === day) ?? null;
}

export function isTrainingDay(date: Date): boolean {
  const day = getDayOfWeek(date);
  return !REST_DAYS.includes(day);
}

export function isThursday(date: Date): boolean {
  return date.getDay() === 4;
}

export function getRepScheme(weekNumber: number): string {
  return isOddWeek(weekNumber) ? "3×8-10" : "3×12-15";
}
