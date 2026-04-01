import { Timestamp } from "firebase/firestore";

// ─── User Profile ───────────────────────────────────────────────
export interface UserProfile {
  name: string;
  email: string;
  programStartDate: Timestamp;
  timezone: string;
  coachEmail: string;
  fcmToken: string;
  ouraAccessToken?: string;
  ouraRefreshToken?: string;
  ouraTokenExpiresAt?: Timestamp;
  gmailAccessToken?: string;
  gmailRefreshToken?: string;
  createdAt: Timestamp;
}

// ─── Daily Log ──────────────────────────────────────────────────
export interface ProtocolEntry {
  done: boolean;
  time: Timestamp | null;
  variation: string | null;
}

export interface OuraData {
  sleepScore: number;
  readinessScore: number;
  hrv: number;
  rhr: number;
  deepSleepMinutes: number;
  remSleepMinutes: number;
  totalSleepMinutes: number;
  sleepEfficiency: number;
  tempDeviation: number;
  steps: number;
  activeCalories: number;
  stressLevel: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  weekNumber: number;
  isTrainingDay: boolean;
  trainingMuscleGroup?: string;

  // Protocol entries
  morningProtocol: ProtocolEntry;
  cardio: ProtocolEntry & { duration?: number };
  meal1: ProtocolEntry;
  meal2: ProtocolEntry;
  meal3: ProtocolEntry;
  meal4: ProtocolEntry;
  meal1Supplements: ProtocolEntry;
  meal4Supplements: ProtocolEntry;
  preWorkoutStack: ProtocolEntry;
  nightCap: ProtocolEntry;

  // Training
  trainingCompleted: boolean;
  exercises: Record<string, boolean[]>;
  trainingVariation: string | null;

  // Biometrics (manual)
  weight?: number;
  water?: number;
  stress?: number;
  bathroomRegular?: boolean;

  // Deviations
  cheatMeal: boolean;
  alcohol: boolean;
  missedMeals: number;
  notes: string;

  // Oura Ring (auto-populated)
  oura?: OuraData;

  // Compliance
  screensOff: ProtocolEntry;
  lightsOut: ProtocolEntry;

  updatedAt: Timestamp;
}

// ─── Weekly Report ──────────────────────────────────────────────
export interface CoachResponse {
  receivedAt: Timestamp;
  rawText: string;
  parsedChanges: ProtocolChange[];
  appliedAt?: Timestamp;
}

export interface WeeklyReport {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  reportText: string;
  sentAt: Timestamp;
  coachEmail: string;

  startWeight: number;
  endWeight: number;
  weightChange: number;
  totalWeightLoss: number;
  avgSleepHours: number;
  avgSleepScore: number;
  avgSteps: number;
  avgWater: number;
  avgStress: number;
  avgReadiness: number;
  avgHRV: number;
  cardioDays: number;
  trainingSessions: number;
  mealsCompliant: number;
  supplementCompliance: number;
  bathroomDays: number;
  deviations: string[];
  photoUrls: string[];

  coachResponse?: CoachResponse;
}

// ─── Protocol Versioning ────────────────────────────────────────
export interface ProtocolChange {
  field: string;
  from?: string | number | boolean;
  to?: string | number | boolean;
  added?: boolean;
  removed?: boolean;
  details?: string;
}

export interface ProtocolVersion {
  version: number;
  effectiveDate: string;
  source: "coach_email" | "initial_setup" | "manual";
  changes: ProtocolChange[];
  protocol: {
    cardio: { duration: number; incline: number; speed: number; hrTarget: number };
    meals: Record<string, unknown>;
    supplements: Record<string, unknown>;
    training: Record<string, unknown>;
    nonTrainingDayRules: string;
    specialMeals: Record<string, { type: string; details: string }>;
  };
}

// ─── Progress Photos ────────────────────────────────────────────
export interface ProgressPhoto {
  date: string;
  weekNumber: number;
  photoUrl: string;
  type: "front" | "side" | "back";
  uploadedAt: Timestamp;
}
