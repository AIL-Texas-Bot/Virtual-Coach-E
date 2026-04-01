import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// Make.com calls this with the coach's email body
// We send it to Claude API for structured parsing, then write changes to Firestore

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `You are parsing a fitness coaching email reply. The coach (Elias Ghazoul) is responding to a client's weekly check-in. Extract ALL protocol changes into structured JSON.

Categories:
- cardio: { duration, frequency, type, notes }
- meals: [{ meal_number, changes }]
- supplements: [{ name, dosage_change }]
- training: [{ exercise, modification }]
- special_meals: [{ day, description, rules }]
- non_training_days: { rules }
- general_notes: [string]
- changes_detected: boolean

If the coach says "no changes", "keep going", "locked in", "0 changes", return { changes_detected: false, general_notes: ["coach confirmed no changes"] }.

Return ONLY valid JSON.`;

export async function POST(request: NextRequest) {
  try {
    const { userId, emailBody, weekNumber } = await request.json();

    if (!emailBody) {
      return NextResponse.json({ error: "Missing emailBody" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
    }

    // Strip email signatures and quoted text
    const cleanedBody = stripEmailSignature(emailBody);

    // Call Claude API
    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Coach's email reply:\n---\n${cleanedBody}\n---\n\nReturn ONLY valid JSON.`,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const err = await claudeResponse.text();
      console.error("Claude API error:", err);
      return NextResponse.json({ error: "Claude API call failed" }, { status: 502 });
    }

    const claudeResult = await claudeResponse.json();
    const responseText = claudeResult.content?.[0]?.text || "{}";

    // Parse Claude's JSON response
    let parsedChanges;
    try {
      parsedChanges = JSON.parse(responseText);
    } catch {
      // Try extracting JSON from markdown code block
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsedChanges = JSON.parse(jsonMatch[1]);
      } else {
        return NextResponse.json({
          error: "Failed to parse Claude response as JSON",
          rawResponse: responseText,
        }, { status: 422 });
      }
    }

    // Write to Firestore if we have a userId
    if (userId && adminDb) {
      // Update the weekly report with coach response
      if (weekNumber) {
        await adminDb
          .collection("users")
          .doc(userId)
          .collection("weeklyReports")
          .doc(String(weekNumber))
          .update({
            "coachResponse.receivedAt": new Date(),
            "coachResponse.rawText": cleanedBody,
            "coachResponse.parsedChanges": parsedChanges,
          });
      }

      // If changes detected, create a new protocol version
      if (parsedChanges.changes_detected) {
        const versionsSnapshot = await adminDb
          .collection("users")
          .doc(userId)
          .collection("protocolVersions")
          .orderBy("version", "desc")
          .limit(1)
          .get();

        const currentVersion = versionsSnapshot.empty ? 0 : versionsSnapshot.docs[0].data().version;

        await adminDb
          .collection("users")
          .doc(userId)
          .collection("protocolVersions")
          .add({
            version: currentVersion + 1,
            effectiveDate: new Date().toISOString().split("T")[0],
            source: "coach_email",
            changes: buildChangesList(parsedChanges),
            rawParsed: parsedChanges,
            createdAt: FieldValue.serverTimestamp(),
          });
      }
    }

    return NextResponse.json({
      success: true,
      changesDetected: parsedChanges.changes_detected ?? false,
      parsed: parsedChanges,
    });
  } catch (error) {
    console.error("Coach parse error:", error);
    return NextResponse.json({ error: "Coach email parsing failed" }, { status: 500 });
  }
}

function stripEmailSignature(body: string): string {
  // Remove everything after common signature markers
  const markers = [
    /\n--\s*\n/,
    /\nCoach Elias J\. Ghazoul/,
    /\nElias Ghazoul/,
    /\nNatural Nutrition Coaching/,
    /\nOn .+ wrote:/,
    /\n>+ /,
  ];

  let cleaned = body;
  for (const marker of markers) {
    const match = cleaned.search(marker);
    if (match > 0) {
      cleaned = cleaned.substring(0, match);
    }
  }

  return cleaned.trim();
}

interface ParsedChanges {
  cardio?: { duration?: number; frequency?: string; type?: string; notes?: string };
  meals?: Array<{ meal_number: number; changes: string }>;
  supplements?: Array<{ name: string; dosage_change: string }>;
  training?: Array<{ exercise: string; modification: string }>;
  special_meals?: Array<{ day: string; description: string; rules?: string }>;
  non_training_days?: { rules: string };
  general_notes?: string[];
}

function buildChangesList(parsed: ParsedChanges) {
  const changes: Array<{ field: string; details: string }> = [];

  if (parsed.cardio) {
    changes.push({ field: "cardio", details: JSON.stringify(parsed.cardio) });
  }
  if (parsed.meals?.length) {
    for (const m of parsed.meals) {
      changes.push({ field: `meal${m.meal_number}`, details: m.changes });
    }
  }
  if (parsed.supplements?.length) {
    for (const s of parsed.supplements) {
      changes.push({ field: `supplement.${s.name}`, details: s.dosage_change });
    }
  }
  if (parsed.training?.length) {
    for (const t of parsed.training) {
      changes.push({ field: `training.${t.exercise}`, details: t.modification });
    }
  }
  if (parsed.special_meals?.length) {
    for (const sm of parsed.special_meals) {
      changes.push({ field: `specialMeal.${sm.day}`, details: sm.description });
    }
  }
  if (parsed.non_training_days) {
    changes.push({ field: "nonTrainingDays", details: parsed.non_training_days.rules });
  }

  return changes;
}
