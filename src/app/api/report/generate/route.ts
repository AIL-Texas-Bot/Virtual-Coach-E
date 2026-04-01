import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { MEALS, MORNING_PROTOCOL } from "@/lib/protocol";

// Make.com calls this Wednesday 6:00 AM CT to compile the weekly report
// Queries past 7 days of dailyLogs, calculates aggregates, formats report text

export async function POST(request: NextRequest) {
  try {
    const { userId, weekNumber } = await request.json();

    if (!userId || !weekNumber) {
      return NextResponse.json({ error: "Missing userId or weekNumber" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
    }

    // Get user profile
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const user = userDoc.data()!;

    // Calculate date range (past 7 days)
    const today = new Date();
    const weekEnd = today.toISOString().split("T")[0];
    const weekStartDate = new Date(today);
    weekStartDate.setDate(weekStartDate.getDate() - 6);
    const weekStart = weekStartDate.toISOString().split("T")[0];

    // Query daily logs for the week
    const logsSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("dailyLogs")
      .where("date", ">=", weekStart)
      .where("date", "<=", weekEnd)
      .orderBy("date")
      .get();

    const logs = logsSnapshot.docs.map((doc) => doc.data());

    // Calculate aggregates
    const weights = logs.map((l) => l.weight).filter(Boolean) as number[];
    const startWeight = weights[0] ?? 0;
    const endWeight = weights[weights.length - 1] ?? 0;
    const weightChange = endWeight - startWeight;

    const startingWeight = 270.8; // From spec

    const sleepHours = logs
      .map((l) => l.oura?.totalSleepMinutes)
      .filter(Boolean) as number[];
    const avgSleepHours = sleepHours.length > 0
      ? Number((sleepHours.reduce((a: number, b: number) => a + b, 0) / sleepHours.length / 60).toFixed(1))
      : 0;

    const sleepScores = logs.map((l) => l.oura?.sleepScore).filter(Boolean) as number[];
    const avgSleepScore = sleepScores.length > 0
      ? Math.round(sleepScores.reduce((a: number, b: number) => a + b, 0) / sleepScores.length)
      : 0;

    const steps = logs.map((l) => l.oura?.steps).filter(Boolean) as number[];
    const avgSteps = steps.length > 0
      ? Math.round(steps.reduce((a: number, b: number) => a + b, 0) / steps.length)
      : 0;

    const waterValues = logs.map((l) => l.water).filter(Boolean) as number[];
    const avgWater = waterValues.length > 0
      ? Number((waterValues.reduce((a: number, b: number) => a + b, 0) / waterValues.length).toFixed(1))
      : 0;

    const stressValues = logs.map((l) => l.stress).filter(Boolean) as number[];
    const avgStress = stressValues.length > 0
      ? Math.round(stressValues.reduce((a: number, b: number) => a + b, 0) / stressValues.length)
      : 0;

    const readinessScores = logs.map((l) => l.oura?.readinessScore).filter(Boolean) as number[];
    const avgReadiness = readinessScores.length > 0
      ? Math.round(readinessScores.reduce((a: number, b: number) => a + b, 0) / readinessScores.length)
      : 0;

    const hrvValues = logs.map((l) => l.oura?.hrv).filter(Boolean) as number[];
    const avgHRV = hrvValues.length > 0
      ? Math.round(hrvValues.reduce((a: number, b: number) => a + b, 0) / hrvValues.length)
      : 0;

    const cardioDays = logs.filter((l) => l.cardio?.done).length;
    const trainingSessions = logs.filter((l) => l.trainingCompleted).length;

    const mealFields = ["meal1", "meal2", "meal3", "meal4"] as const;
    const mealsCompliant = logs.reduce((count, log) => {
      return count + mealFields.filter((f) => log[f]?.done).length;
    }, 0);

    const suppFields = ["meal1Supplements", "meal4Supplements"] as const;
    const totalSuppChecks = logs.length * suppFields.length;
    const suppsDone = logs.reduce((count, log) => {
      return count + suppFields.filter((f) => log[f]?.done).length;
    }, 0);
    const supplementCompliance = totalSuppChecks > 0
      ? Math.round((suppsDone / totalSuppChecks) * 100)
      : 0;

    const bathroomDays = logs.filter((l) => l.bathroomRegular).length;

    // Compile deviations
    const deviations: string[] = [];
    for (const log of logs) {
      const dayLabel = new Date(log.date).toLocaleDateString("en-US", { weekday: "short" });
      const allFields = [...mealFields, "morningProtocol", "cardio", "screensOff", "lightsOut"] as const;
      for (const field of allFields) {
        if (log[field]?.variation) {
          deviations.push(`${field} ${dayLabel} — ${log[field].variation}`);
        }
      }
      if (log.notes) {
        deviations.push(`Note ${dayLabel}: ${log.notes}`);
      }
    }

    // Get current protocol for menu section (reserved for future use)
    // const protocolSnapshot = await adminDb
    //   .collection("users").doc(userId)
    //   .collection("protocolVersions").orderBy("version", "desc").limit(1).get();

    // Fetch photo URLs
    const photosSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("progressPhotos")
      .where("weekNumber", "==", weekNumber)
      .get();

    const photoUrls = photosSnapshot.docs.map((doc) => doc.data().photoUrl);

    // Build report text (Elias's exact template)
    const totalLoss = startingWeight - endWeight;
    const trainingGroups = logs
      .filter((l) => l.trainingMuscleGroup)
      .map((l) => l.trainingMuscleGroup);

    const reportText = `Check-In - ${user.name || "Andrew Batten"} - ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}

CURRENT WEIGHT: ${endWeight || "—"} lbs
WEIGHT CHANGE SINCE LAST UPDATE: ${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} lbs (${startWeight || "—"} → ${endWeight || "—"})
Total loss since start: ~${totalLoss.toFixed(1)} lbs

CARDIO — Type, Duration, Frequency:
Walking daily — 25 minutes AM fasted + 15 minutes PM. ${cardioDays}/7 days this week.

WEIGHT TRAINING SESSIONS: ${trainingSessions} sessions completed (${trainingGroups.join(", ") || "—"})

WATER INTAKE: ${avgWater}L daily

STRESS LEVEL: ${avgStress}/10

AVERAGE SLEEP: ${avgSleepHours} hours per night. Average sleep score ${avgSleepScore}.

BATHROOM REGULARITY: ${bathroomDays} days this week.

SUPPLEMENTS — All taken as prescribed:
Upon waking: ${MORNING_PROTOCOL.items.join(", ")}
Meal 1: ${MEALS[0].supplements?.join(", ") || "—"}
Meal 4: ${MEALS[3].supplements?.join(", ") || "—"}
Pre-training: EDG Pre (1 scoop)

ARE YOU TAKING THEM CONSISTENTLY? ${suppsDone}/${totalSuppChecks} checks

AVERAGE DAILY STEP COUNT: ~${avgSteps} steps/day

CHANGES SINCE LAST CHECK-IN: ${deviations.length > 0 ? deviations.join("; ") : "None"}

CURRENT MENU:
Training Days: Base protocol — protein, carbs, fats at each meal
Non-Training Days: Protein, fats, vegetables only (no rice, no fruit)

ANY DEVIATIONS:
${deviations.length > 0 ? deviations.map((d) => `• ${d}`).join("\n") : "None"}

${photoUrls.length > 0 ? "[FASTED PHOTOS ATTACHED — front, side, back]" : "[No photos uploaded this week]"}`;

    // Save the weekly report
    const reportData = {
      weekNumber,
      weekStart,
      weekEnd,
      reportText,
      sentAt: null,
      coachEmail: user.coachEmail || "naturalnutritioncoaching@gmail.com",
      startWeight,
      endWeight,
      weightChange,
      totalWeightLoss: totalLoss,
      avgSleepHours,
      avgSleepScore,
      avgSteps,
      avgWater,
      avgStress,
      avgReadiness,
      avgHRV,
      cardioDays,
      trainingSessions,
      mealsCompliant,
      supplementCompliance,
      bathroomDays,
      deviations,
      photoUrls,
    };

    await adminDb
      .collection("users")
      .doc(userId)
      .collection("weeklyReports")
      .doc(String(weekNumber))
      .set(reportData, { merge: true });

    return NextResponse.json({
      success: true,
      weekNumber,
      reportText,
      stats: {
        startWeight, endWeight, weightChange, totalWeightLoss: totalLoss,
        avgSleepHours, avgSleepScore, avgSteps, avgWater, avgStress,
        cardioDays, trainingSessions, mealsCompliant, supplementCompliance,
      },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}
