import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// Make.com calls this daily at 7:00 AM to sync Oura Ring data
// Fetches sleep, readiness, activity, heart rate, and stress data

const OURA_BASE = "https://api.ouraring.com/v2/usercollection";
const OURA_TOKEN_URL = "https://api.ouraring.com/oauth/token";

interface OuraTokens {
  ouraAccessToken: string;
  ouraRefreshToken: string;
  ouraTokenExpiresAt: { toDate(): Date } | Date;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, date } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
    }

    // Get user's Oura tokens
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data() as OuraTokens | undefined;
    if (!userData?.ouraAccessToken) {
      return NextResponse.json({ error: "Oura not connected" }, { status: 400 });
    }

    // Check if token needs refresh
    let accessToken = userData.ouraAccessToken;
    const expiresAt = userData.ouraTokenExpiresAt instanceof Date
      ? userData.ouraTokenExpiresAt
      : userData.ouraTokenExpiresAt?.toDate();

    if (expiresAt && expiresAt.getTime() < Date.now() + 60000) {
      const refreshed = await refreshOuraToken(userId, userData.ouraRefreshToken);
      if (!refreshed) {
        return NextResponse.json({ error: "Token refresh failed" }, { status: 401 });
      }
      accessToken = refreshed;
    }

    const targetDate = date || new Date().toISOString().split("T")[0];

    // Fetch all Oura data in parallel
    const headers = { Authorization: `Bearer ${accessToken}` };
    const params = `?start_date=${targetDate}&end_date=${targetDate}`;

    const [sleepRes, readinessRes, activityRes, heartRateRes, stressRes] = await Promise.all([
      fetch(`${OURA_BASE}/daily_sleep${params}`, { headers }),
      fetch(`${OURA_BASE}/daily_readiness${params}`, { headers }),
      fetch(`${OURA_BASE}/daily_activity${params}`, { headers }),
      fetch(`${OURA_BASE}/heartrate${params}`, { headers }),
      fetch(`${OURA_BASE}/daily_stress${params}`, { headers }),
    ]);

    const [sleepData, readinessData, activityData, heartRateData, stressData] = await Promise.all([
      sleepRes.ok ? sleepRes.json() : { data: [] },
      readinessRes.ok ? readinessRes.json() : { data: [] },
      activityRes.ok ? activityRes.json() : { data: [] },
      heartRateRes.ok ? heartRateRes.json() : { data: [] },
      stressRes.ok ? stressRes.json() : { data: [] },
    ]);

    // Map Oura data to our schema
    const sleep = sleepData.data?.[0];
    const readiness = readinessData.data?.[0];
    const activity = activityData.data?.[0];
    const stress = stressData.data?.[0];

    // Calculate resting heart rate from heart rate samples
    const hrSamples = heartRateData.data || [];
    const restingHR = hrSamples.length > 0
      ? Math.round(hrSamples.reduce((sum: number, s: { bpm: number }) => sum + s.bpm, 0) / hrSamples.length)
      : null;

    const ouraData = {
      sleepScore: sleep?.score ?? null,
      readinessScore: readiness?.score ?? null,
      hrv: readiness?.contributors?.hrv_balance ?? null,
      rhr: restingHR,
      deepSleepMinutes: sleep?.contributors?.deep_sleep ? Math.round(sleep.contributors.deep_sleep / 60) : null,
      remSleepMinutes: sleep?.contributors?.rem_sleep ? Math.round(sleep.contributors.rem_sleep / 60) : null,
      totalSleepMinutes: sleep?.contributors?.total_sleep ? Math.round(sleep.contributors.total_sleep / 60) : null,
      sleepEfficiency: sleep?.contributors?.efficiency ?? null,
      tempDeviation: readiness?.contributors?.body_temperature ?? null,
      steps: activity?.steps ?? null,
      activeCalories: activity?.active_calories ?? null,
      stressLevel: stress?.stress_high ? "high" : stress?.recovery_high ? "low" : "moderate",
    };

    // Write to daily log
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("dailyLogs")
      .doc(targetDate)
      .set({ oura: ouraData, updatedAt: new Date() }, { merge: true });

    return NextResponse.json({
      success: true,
      date: targetDate,
      oura: ouraData,
    });
  } catch (error) {
    console.error("Oura sync error:", error);
    return NextResponse.json({ error: "Oura sync failed" }, { status: 500 });
  }
}

async function refreshOuraToken(userId: string, refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch(OURA_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.OURA_CLIENT_ID || "",
        client_secret: process.env.OURA_CLIENT_SECRET || "",
      }),
    });

    if (!response.ok) return null;

    const tokens = await response.json();

    if (adminDb) {
      await adminDb.collection("users").doc(userId).update({
        ouraAccessToken: tokens.access_token,
        ouraRefreshToken: tokens.refresh_token,
        ouraTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      });
    }

    return tokens.access_token;
  } catch {
    return null;
  }
}
