# Virtual Coach-E — Complete Build Specification (v2)
## Firebase + Gmail Integration + Push-Response System

---

## Overview

Virtual Coach-E is a Progressive Web App (PWA) that implements a fitness coach's 12-week transformation protocol. It sends push notification REMINDERS throughout the day for meals, supplements, cardio, training, and sleep. The user responds to each reminder confirming completion or logging a variation. These responses accumulate daily into a formatted weekly report that auto-emails to the coach every Wednesday morning. The app also reads the coach's Gmail replies to detect plan adjustments and updates the active protocol accordingly.

**Coach:** Elias Ghazoul — Natural Nutrition Coaching
**Coach Email:** naturalnutritioncoaching@gmail.com
**Client Email:** ailandy216@gmail.com
**Website:** https://www.naturalnutritioncoaching.com/

---

## Tech Stack (Existing Infrastructure)

The following services are ALREADY in the client's stack and should be used:

| Layer | Technology | Status |
|-------|-----------|--------|
| Framework | Next.js 14 (App Router) | New for this project |
| Hosting | Netlify | Already connected |
| Database | Firebase Firestore (Blaze plan) | Already active |
| Auth | Firebase Authentication | Already active |
| Push Notifications | Firebase Cloud Messaging (FCM) | Already available via Firebase |
| Serverless Logic | Firebase Cloud Functions | Already available via Blaze plan |
| Automation / Orchestration | Make.com | Already active — USE THIS for scheduled workflows |
| AI Intelligence | Claude API (Max plan) | Already active — USE THIS for email parsing |
| Photo Storage | Firebase Storage | Already available |
| Biometrics | Oura Ring API v2 (OAuth2) | New integration |
| Email Sending | GoHighLevel (GHL) or Resend | GHL already active for email/SMS |
| Gmail Reading | Gmail API (OAuth2) — read-only | New integration |
| Version Control | GitHub | Already active with deployment tokens |
| Styling | Tailwind CSS | New for this project |
| PWA | next-pwa or custom service worker | New for this project |

### Architecture Decision: Make.com vs Firebase Cloud Functions

Use **Make.com scenarios** for scheduled/recurring automation:
- Daily notification scheduling (cron-based triggers)
- Oura Ring daily data sync (7:00 AM trigger → API call → Firestore write)
- Wednesday report generation (Wednesday 6 AM trigger → compile data → send email)
- Gmail coach reply scanner (Wednesday/Thursday polling → Claude API parse → Firestore update)

Use **Firebase Cloud Functions** for real-time/event-driven logic:
- Notification response handler (HTTP callable — when user taps Done/Variation)
- Firestore triggers (on-write hooks for data validation, aggregation)
- OAuth callbacks (Oura Ring, Gmail auth flows)

This split means Make.com handles the "when should things happen" orchestration (visual, easy to modify, no code deploys needed) while Firebase handles the "what happens when the user does something" reactive logic.

### Claude API for Email Intelligence

Instead of fragile regex parsing, coach emails from Elias are piped through the Claude API with a structured prompt:

```
Parse this coaching email reply. Extract any protocol changes into structured JSON.
Categories: cardio, meals, supplements, training, special_meals, general_notes.
If no changes are indicated, return { "changes": "none" }.
Coach email: [email body]
```

This handles Elias's natural writing style perfectly — whether he says "Cardio 25 minutes daily" or "bump the walks to 25" or "0 changes needed", Claude understands the intent and returns structured data the app can act on.

---

## Core Architecture

### How It Works (User Experience — Daily Flow)

1. **6:30 AM** — Push notification: "Morning Protocol — GI Integrity + Probio. ✅ Done? ⚠️ Variation?"
   - User taps ✅ from lock screen → logged as complete
   - User taps ⚠️ → app opens to quick variation input
2. **Throughout the day** — Notifications fire at each protocol time (cardio, meals, supplements, training, screens off, sleep)
3. **Each response saves to Firestore** — no forms to fill out, no app to open
4. **Oura Ring data syncs automatically** each morning (sleep, readiness, HRV, steps)
5. **Wednesday 6:00 AM** — App compiles the week's data, generates coach report, emails with photos attached
6. **Wednesday (after coach replies)** — App scans Gmail for Elias's reply, parses changes, presents them for user confirmation, updates active protocol
7. **Dashboard** always shows current day status, weekly trends, quarterly transformation timeline

### Notification → Response → Log (Core Innovation)

This is NOT a logging app. It's a reminder system where the response IS the log.

Each notification has two action buttons:
- **✅ Done** — Tapping this immediately logs the item as completed in Firestore. No app open required.
- **⚠️ Variation** — Opens the app to a minimal screen with options:
  - "Missed entirely"
  - "Partial / Modified"
  - "Substituted — [free text]"
  - "Timing changed — [time picker]"
  - "Other — [free text]"

The variation gets stored with the log entry and automatically appears in the weekly report under DEVIATIONS.

---

## Notification Schedule

All times in user's local timezone (default: America/Chicago)

### Every Day
```
6:30 AM  → "☀️ Morning Protocol — GI Integrity + Probio + lime/cayenne"     [Done | Variation]
6:35 AM  → "🚶 Fasted Cardio — 25 min walk, 3.0/3.0, HR ~115"              [Done | Variation]
10:00 AM → "🍳 Meal 1 — Eggs, whites, avocado, apple"                       [Done | Variation]
10:05 AM → "💊 Meal 1 Supps — D3+K2, Quad Mag x2, Omega x2"                [Taken | Missed]
1:00 PM  → "🍗 Meal 2 — Lean protein, coconut oil, rice, veggies"           [Done | Variation]
4:00 PM  → "🥩 Meal 3 — Lean protein, EVOO, rice, veggies"                  [Done | Variation]
7:00 PM  → "🐟 Meal 4 (LAST) — Protein, avocado, rice, veggies"             [Done | Variation]
7:05 PM  → "💊 Meal 4 Supps — Quad Mag x2, Omega x2"                        [Taken | Missed]
7:30 PM  → "🔒 Kitchen CLOSED"                                               [info only]
8:30 PM  → "📵 Screens off — 90 min to sleep"                                [Done | Variation]
9:30 PM  → "⚖️ Weight check — step on scale"                                 [opens number input]
10:00 PM → "🌙 Lights out — Night Cap taken?"                                [Done | Variation]
```

### Training Days Only (before workout)
```
Pre-WO  → "💪 Pre-Workout — 1L water + salt + EDG Pre"                      [Done | Skip]
Pre-WO  → "🏋️ Today: [MUSCLE GROUP] — [rep scheme]. Ready?"                  [opens training view]
Post-WO → "✅ Training complete? Log your sets"                               [opens set tracker]
```

### Thursday (Treat Meal — if prescribed)
```
7:00 PM  → "🍔 Thursday Treat Meal — Burger + fries (~250g). 10-min walk after." [Done | Variation]
```

### Non-Training Days
Meal notifications adjust text: "🍗 Meal 2 — ½ carbs today (non-training)"

### Wednesday Morning
```
6:00 AM  → [SYSTEM] Auto-generate weekly report and email to coach
6:05 AM  → "📊 Weekly report sent to Coach Elias. Review it?"                [opens report view]
```

---

## Gmail Integration — Reading Coach Updates

### How It Works

After the Wednesday report is sent, a Cloud Function periodically checks Gmail for replies from `naturalnutritioncoaching@gmail.com` in the check-in thread.

### Parsing Elias's Updates

Based on actual email patterns, Elias's replies contain structured directives like:

**Example 1 (March 25):**
```
Cardio: 25 minutes daily
Training Days: Follow current base menu
Non-Training Days: Protein, fats, vegetables only
Thursday — Last Meal: Burger and fries (GF bun), ~250g fries, no cheese, 10-min walk post-meal
```

**Example 2 (April 1):**
```
0 changes needed
Easter — Enjoy 1 meal with family
Keep training / Non-training day format going
```

### Parsing Strategy (Claude API — NOT regex)

The Make.com scenario handles the orchestration, and Claude API handles the intelligence:

1. **Make.com trigger** — Wednesday/Thursday, every 2 hours
2. **Gmail API module** — Fetch latest reply from `naturalnutritioncoaching@gmail.com` in check-in thread
3. **Text processing** — Strip email signatures and quoted text (everything after "Coach Elias J. Ghazoul" or "On [date]" lines)
4. **Claude API call** — Send cleaned email body with this system prompt:

```
You are parsing a fitness coaching email reply. The coach (Elias Ghazoul) is responding 
to a client's weekly check-in. Extract ALL protocol changes into structured JSON.

Categories:
- cardio: { duration, frequency, type, notes }
- meals: [{ meal_number, changes }]
- supplements: [{ name, dosage_change }]
- training: [{ exercise, modification }]
- special_meals: [{ day, description, rules }]
- non_training_days: { rules }
- general_notes: [string]
- changes_detected: boolean

If the coach says "no changes", "keep going", "locked in", "0 changes", 
return { changes_detected: false, general_notes: ["coach confirmed no changes"] }.

Coach's email reply:
---
{email_body}
---

Return ONLY valid JSON.
```

5. **Make.com processes response** — If changes_detected is true, write to Firestore `protocolVersions` collection and send user a push notification: "Coach Elias updated your plan. Review changes?"
6. **User reviews in app** — Confirms changes → active protocol updates
7. **Version tracking** — Every change is logged with before/after so user can see protocol evolution

This approach handles Elias's natural writing style perfectly — whether he writes structured directives or conversational instructions, Claude understands the intent.

### Gmail API Setup
- OAuth2 with scopes: `gmail.readonly`
- Only reads emails from `naturalnutritioncoaching@gmail.com`
- Only accesses threads where subject contains "Check-In" or "Andrew Batten"
- Read-only — never sends from Gmail (sending uses Resend)

---

## Firebase Data Structure (Firestore)

### Collection: `users/{userId}`
```javascript
{
  name: "Andrew Batten",
  email: "ailandy216@gmail.com",
  programStartDate: "2026-03-08",  // Timestamp
  timezone: "America/Chicago",
  coachEmail: "naturalnutritioncoaching@gmail.com",
  fcmToken: "...",  // Firebase Cloud Messaging token
  ouraAccessToken: "...",
  ouraRefreshToken: "...",
  ouraTokenExpiresAt: Timestamp,
  gmailAccessToken: "...",
  gmailRefreshToken: "...",
  createdAt: Timestamp
}
```

### Collection: `users/{userId}/dailyLogs/{YYYY-MM-DD}`
```javascript
{
  date: "2026-04-01",
  weekNumber: 4,
  isTrainingDay: true,
  trainingMuscleGroup: "CHEST/BACK",

  // Morning Protocol
  morningProtocol: { done: true, time: Timestamp, variation: null },
  
  // Cardio
  cardio: { done: true, time: Timestamp, variation: null, duration: 25 },
  
  // Meals
  meal1: { done: true, time: Timestamp, variation: null },
  meal2: { done: true, time: Timestamp, variation: null },
  meal3: { done: false, time: null, variation: "Missed — late meetings, no meal prep accessible" },
  meal4: { done: false, time: null, variation: "Missed — same reason" },
  
  // Supplements
  meal1Supplements: { done: true, time: Timestamp },
  meal4Supplements: { done: false, time: null },
  preWorkoutStack: { done: true, time: Timestamp },
  nightCap: { done: true, time: Timestamp },
  
  // Training
  trainingCompleted: true,
  exercises: {
    "T-Bar Row": [true, true, true],
    "Incline DB Press": [true, true, true],
    "Supinated Cable Pulldown": [true, true, false],
    // ... etc
  },
  trainingVariation: null,
  
  // Biometrics (manual)
  weight: 257.8,
  water: 4.0,
  stress: 9,
  bathroomRegular: false,
  
  // Deviations
  cheatMeal: false,
  alcohol: false,
  missedMeals: 2,
  notes: "Very high stress — close contact passing mid-week",
  
  // Oura Ring (auto-populated)
  oura: {
    sleepScore: 43,
    readinessScore: 62,
    hrv: 28,
    rhr: 68,
    deepSleepMinutes: 45,
    remSleepMinutes: 52,
    totalSleepMinutes: 252,
    sleepEfficiency: 71,
    tempDeviation: 0.3,
    steps: 5810,
    activeCalories: 320,
    stressLevel: "high"
  },
  
  // Compliance
  screensOff: { done: true, time: Timestamp },
  lightsOut: { done: true, time: Timestamp },
  
  updatedAt: Timestamp
}
```

### Collection: `users/{userId}/weeklyReports/{weekNumber}`
```javascript
{
  weekNumber: 4,
  weekStart: "2026-03-26",
  weekEnd: "2026-04-01",
  reportText: "...",  // Full formatted report
  sentAt: Timestamp,
  coachEmail: "naturalnutritioncoaching@gmail.com",
  
  // Aggregated stats
  startWeight: 258.0,
  endWeight: 257.8,
  weightChange: -0.2,
  totalWeightLoss: 13.0,  // since program start
  avgSleepHours: 4.2,
  avgSleepScore: 43,
  avgSteps: 5810,
  avgWater: 4.0,
  avgStress: 9,
  avgReadiness: 62,
  avgHRV: 28,
  cardioDays: 7,
  trainingSessions: 5,
  mealsCompliant: 22,  // out of 28
  supplementCompliance: 85,  // percentage
  bathroomDays: 2,
  deviations: [
    "Missed Meals 3+4 Wed — emotional stress",
    "Missed Meal 4 Mon/Tue — late meetings"
  ],
  photoUrls: ["...", "...", "..."],
  
  // Coach response (populated after Gmail scan)
  coachResponse: {
    receivedAt: Timestamp,
    rawText: "Super good, Andy — 0 changes needed...",
    parsedChanges: [],
    appliedAt: Timestamp
  }
}
```

### Collection: `users/{userId}/protocolVersions/{versionId}`
```javascript
{
  version: 4,
  effectiveDate: "2026-03-25",
  source: "coach_email",  // or "initial_setup"
  changes: [
    { field: "cardio.duration", from: 20, to: 25 },
    { field: "treatMeal.thursday", added: true, details: "Burger + fries ~250g, no cheese, 10-min walk" }
  ],
  
  // Current active protocol snapshot
  protocol: {
    cardio: { duration: 25, incline: 3.0, speed: 3.0, hrTarget: 115 },
    meals: { /* full meal plan */ },
    supplements: { /* full supplement schedule */ },
    training: { /* full training schedule */ },
    nonTrainingDayRules: "Protein, fats, vegetables only from base menu",
    specialMeals: {
      thursday: {
        type: "treat",
        details: "Burger + fries (GF bun), ~250g fries, no cheese, any toppings, moderate salt, 10-min walk post-meal"
      }
    }
  }
}
```

### Collection: `users/{userId}/progressPhotos/{photoId}`
```javascript
{
  date: "2026-04-01",
  weekNumber: 4,
  photoUrl: "gs://virtual-coach-e.appspot.com/photos/...",
  type: "front",  // front, side, back
  uploadedAt: Timestamp
}
```

---

## Oura Ring Integration

### OAuth2 Flow
1. User taps "Connect Oura Ring" in settings
2. Redirect to Oura auth URL: `https://cloud.ouraring.com/oauth/authorize`
3. Scopes: `daily_sleep daily_readiness daily_activity heartrate daily_stress personal`
4. Callback receives auth code → exchange for tokens → store in user doc

### Daily Auto-Sync (Cloud Function — 7:00 AM daily)
```
GET https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=YYYY-MM-DD
GET https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=YYYY-MM-DD
GET https://api.ouraring.com/v2/usercollection/daily_activity?start_date=YYYY-MM-DD
GET https://api.ouraring.com/v2/usercollection/heartrate?start_date=YYYY-MM-DD
GET https://api.ouraring.com/v2/usercollection/daily_stress?start_date=YYYY-MM-DD
```

### Data Mapped
- `daily_sleep` → sleepScore, totalSleepMinutes, deepSleepMinutes, remSleepMinutes, sleepEfficiency
- `daily_readiness` → readinessScore, tempDeviation, hrvBalance
- `daily_activity` → steps, activeCalories
- `heartrate` → restingHeartRate
- `daily_stress` → stressLevel

---

## Weekly Report — Auto-Generation + Email

### Report Format (Elias's Exact Template)
```
Subject: Check-In - Andrew Batten - [Date]

CURRENT WEIGHT: [latest] lbs
WEIGHT CHANGE SINCE LAST UPDATE: [calculated] lbs ([prev] → [current])
Total loss since start: ~[total] lbs

CARDIO — Type, Duration, Frequency:
[Type] daily — [duration] minutes AM fasted. [X]/7 days this week.

WEIGHT TRAINING SESSIONS: [count] sessions completed ([list muscle groups])

WATER INTAKE: [avg]L daily

STRESS LEVEL: [avg]/10

AVERAGE SLEEP: [avg] hours per night. Average sleep score [oura_avg].

BATHROOM REGULARITY: [X] days this week.

SUPPLEMENTS — All taken as prescribed:
Upon waking: Spore Probio 2 caps + GI Integrity in 16oz water with lime and cayenne
Meal 1: D3 10,000 + K2 (1 cap), Quad Mag (2 caps), Omega 1000 (2 caps)
Meal 4: Quad Mag (2 caps), Omega 1000 (2 caps)
Pre-training: EDG Pre (1 scoop)

ARE YOU TAKING THEM CONSISTENTLY? [X]/7 days

DO YOU NEED REFILLS? [auto-check based on days since last order]

AVERAGE DAILY STEP COUNT: ~[oura_avg] steps/day

CHANGES SINCE LAST CHECK-IN: [compiled from daily notes]

CURRENT MENU:
[Current active protocol meals — auto-populated from latest protocolVersion]

ANY DEVIATIONS:
[Compiled from all variation logs for the week]

[FASTED PHOTOS ATTACHED — front, side, back]
```

### Email Delivery
- Cloud Function runs Wednesday 6:00 AM CT
- Uses Resend API to send formatted email
- Attaches progress photos from Firebase Storage
- Stores sent report in weeklyReports collection
- Subject line matches Elias's required format exactly

---

## App Pages / Routes

### `/` — Today (Dashboard)
- Current protocol item highlighted (time-aware)
- Completion status for all daily items (green checkmarks / grey pending)
- Water tracker (tap blocks to fill)
- Oura data summary card (auto-populated)
- Today's training split + rep scheme badge
- Week X of 12 progress bar

### `/meals` — Today's Meals
- All 4 meals with exact foods and gram amounts
- Training day vs non-training day indicator
- Supplements listed with each relevant meal
- Tap to expand meal details
- Mark complete or log variation inline
- Special meals (Thursday treat) shown when applicable

### `/train` — Today's Workout
- Muscle group and exercise list for today
- Rep scheme (odd week 3×8-10, even week 3×12-15)
- Set tracker — tap to complete each set
- Warm-up reminder for leg days (lying leg raises)
- Pre-workout supplement reminder
- Rest day screen when applicable

### `/log` — Manual Entry / Fallback
- Weight input (if not captured via evening notification)
- Photo upload (camera integration for progress pics)
- Oura data display (read-only)
- Free-text notes
- This is the FALLBACK — most data comes from notification responses

### `/report` — Weekly + Quarterly
**Weekly tab:**
- Stats grid (weight, sleep, steps, workouts, water, stress, compliance)
- Compliance heat map (7 days × items)
- Generated coach report preview
- "Email to Coach" button
- Coach response card (parsed changes from Gmail)

**Quarterly tab:**
- 12-week weight progression chart
- Progress photo timeline (before/after grid, chronological)
- Trend lines: weight, sleep score, HRV, readiness, steps
- Before/after photo comparison slider

### `/settings`
- Profile (name, email, start date, timezone)
- Oura Ring connection (OAuth)
- Gmail connection (OAuth — for reading coach replies)
- Notification preferences (toggle individual reminders)
- Coach email address
- Active protocol viewer (current meal plan, training schedule)
- Protocol change history (version log)

---

## Make.com Scenarios (Scheduled Automation)

### Scenario 1: Daily Notification Scheduler
- **Trigger:** Every minute (or use Make.com's scheduling to fire at each protocol time)
- **Logic:** Check user timezone, determine which notifications should fire NOW
- **Action:** Send FCM push via Firebase Cloud Messaging REST API
- **Notes:** Each notification includes action buttons (Done/Variation) and metadata (field name, date, user ID)

### Scenario 2: Oura Ring Daily Sync
- **Trigger:** Daily at 7:00 AM (user timezone)
- **Steps:**
  1. Check if Oura token needs refresh → refresh if expired
  2. GET daily_sleep, daily_readiness, daily_activity, heartrate, daily_stress from Oura API
  3. Map response data to Firestore fields
  4. Write to `users/{userId}/dailyLogs/{today}` → oura sub-document

### Scenario 3: Wednesday Report Generator
- **Trigger:** Wednesday at 6:00 AM CT
- **Steps:**
  1. Query Firestore for past 7 days of dailyLogs
  2. Calculate aggregates (avg sleep, avg steps, weight change, compliance %, etc.)
  3. Query latest protocolVersion for "CURRENT MENU" section
  4. Fetch progress photo URLs from Firebase Storage
  5. Format report text using Elias's exact template
  6. Send email via GHL (or Resend) with photos attached
  7. Write report to `users/{userId}/weeklyReports/{weekNumber}`
  8. Send user push: "Weekly report sent to Coach Elias. Review it?"

### Scenario 4: Coach Email Scanner
- **Trigger:** Every 2 hours on Wednesdays and Thursdays
- **Steps:**
  1. Gmail API → Search for latest reply from `naturalnutritioncoaching@gmail.com`
  2. Filter to check-in threads only (subject contains "Check-In" or "Andrew Batten")
  3. Strip signatures and quoted text
  4. Send cleaned email body to Claude API with structured parsing prompt
  5. If changes_detected → write to Firestore `protocolVersions` + send user push notification
  6. If no changes → log confirmation in weeklyReport.coachResponse

## Firebase Cloud Functions (Event-Driven Logic)

### 1. handleNotificationResponse — HTTP callable
- Receives notification response payload (done/variation + field + date + userId)
- Validates input
- Writes to appropriate field in `dailyLogs/{date}` document
- Returns confirmation

### 2. onDailyLogWrite — Firestore trigger
- Fires when any dailyLog document is created/updated
- Recalculates daily compliance score
- Updates any real-time dashboard counters

### 3. ouraOAuthCallback — HTTP endpoint
- Handles OAuth2 callback from Oura Ring authorization
- Exchanges auth code for access + refresh tokens
- Stores tokens in user document

### 4. gmailOAuthCallback — HTTP endpoint
- Handles OAuth2 callback from Gmail authorization
- Exchanges auth code for access + refresh tokens
- Stores tokens in user document (read-only scope only)

---

## Design Direction

Premium dark fitness app. NOT generic.

**Colors:**
- Background: #0a0b0e (deep black), #12141a (card), #181b23 (hover)
- Gold: #c9a84c (primary accent — represents the coaching brand)
- Green: #3ecf8e (completion/success)
- Red: #ef4444 (missed/deviation)
- Blue: #60a5fa (Oura data / biometrics)
- Text: #e8e6e1 (primary), #7a7d89 (dim), #a0a3b0 (mid)

**Typography:** 
- Geist or SF Pro Display — clean, modern
- Monospace for data values (Geist Mono or SF Mono)

**Feel:** High-end coaching tool. Like something an IFBB Pro would build for his elite clients. Every screen should feel intentional and precise — matching Elias's "Precision. Consistency. Discipline." ethos.

**Mobile-first:** This lives on the phone. Desktop is secondary.

---

## Environment Variables

```env
# Firebase (already on Blaze plan)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_SERVICE_ACCOUNT_KEY=  # JSON string for Cloud Functions

# Oura Ring
OURA_CLIENT_ID=
OURA_CLIENT_SECRET=
OURA_REDIRECT_URI=https://virtual-coach-e.netlify.app/api/oura/callback

# Gmail API (for reading coach replies)
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REDIRECT_URI=https://virtual-coach-e.netlify.app/api/gmail/callback

# Claude API (for email intelligence — parsing coach replies)
ANTHROPIC_API_KEY=  # Already have via Max plan

# Email Sending (use GHL if available, otherwise Resend)
RESEND_API_KEY=
# OR configure GHL email/SMS via Make.com webhook

# Make.com (webhook URLs for triggering scenarios)
MAKE_WEBHOOK_NOTIFICATION_RESPONSE=  # Called when user responds to push
MAKE_WEBHOOK_MANUAL_REPORT=  # Called when user manually triggers report

# FCM (auto-generated in Firebase console)
NEXT_PUBLIC_VAPID_KEY=

# GitHub
GITHUB_DEPLOY_TOKEN=  # For CI/CD to Netlify
```

---

## Setup Steps (In Order)

### 1. Firebase Project (ALREADY ON BLAZE PLAN)
- Open existing Firebase console or create new project: "virtual-coach-e"
- Enable: Authentication (email/password), Firestore, Storage, Cloud Messaging, Cloud Functions
- Get config values for environment variables
- Generate VAPID key in Cloud Messaging → Web Push certificates

### 2. Oura Developer App (NEW)
- Go to cloud.ouraring.com → Developer → Applications
- Create app "Virtual Coach-E"
- Set redirect URI
- Get Client ID + Secret

### 3. Google Cloud Console — Gmail API (NEW)
- In the same Google Cloud project linked to Firebase
- Enable Gmail API
- Create OAuth2 credentials (Web Application type)
- Set authorized redirect URI
- Get Client ID + Secret
- Scopes needed: `https://www.googleapis.com/auth/gmail.readonly`

### 4. Make.com Scenarios (ALREADY ACTIVE)
- Create 4 scenarios per the Make.com Scenarios section above
- Set up Firebase Firestore and FCM modules in Make.com
- Set up Gmail and Claude API (HTTP) modules
- Configure scheduling triggers for each scenario

### 5. Email Sending
- Option A: Use GHL's existing email capability via Make.com webhook
- Option B: Create Resend account at resend.com, get API key
- GHL is preferred since it's already in the stack and handles SMS too

### 6. Claude API Key
- Already available via Max plan
- Use existing API key in Make.com HTTP modules for email parsing

### 7. Netlify Deploy (ALREADY CONNECTED)
- Link GitHub repo to Netlify
- Set environment variables in Netlify dashboard
- Configure build command: `next build`

### 8. GitHub Repo (ALREADY ACTIVE)
- Create repo: `virtual-coach-e`
- Connect to Netlify for auto-deploy on push
- Use existing deployment tokens

---

## Priority Build Order

### Phase 1: Foundation (Claude Code)
1. **Project Init** — Next.js 14 + Tailwind + Firebase SDK setup
2. **Firebase Auth** — Email/password registration + login
3. **Firestore Schema** — Create collections, security rules
4. **GitHub Repo** — Init repo, connect to Netlify for auto-deploy

### Phase 2: Core App UI (Claude Code)
5. **Today Dashboard** — Timeline view, protocol awareness, tap to complete, water tracker
6. **Meals View** — Full protocol display with training/non-training awareness
7. **Training View** — Exercise list, set tracker, rep scheme logic, rest day screen
8. **Variation Input** — Quick screen for deviations (Missed/Partial/Substituted/Other)

### Phase 3: Push Notifications (Claude Code + Firebase)
9. **FCM Setup** — Service worker, VAPID keys, token registration
10. **Notification Response Handler** — Firebase Cloud Function (HTTP callable)
11. **Notification UI** — Action buttons that trigger the response handler

### Phase 4: Automation Layer (Make.com)
12. **Notification Scheduler Scenario** — Fires at protocol times, sends FCM pushes
13. **Oura Ring Sync Scenario** — Daily OAuth + API pull + Firestore write
14. **Weekly Report Scenario** — Wednesday compile + format + email via GHL/Resend
15. **Coach Email Scanner Scenario** — Gmail API + Claude API parse + Firestore update

### Phase 5: Integrations (Claude Code + Make.com)
16. **Oura OAuth Flow** — Firebase Cloud Function for callback
17. **Gmail OAuth Flow** — Firebase Cloud Function for callback
18. **Photo Upload** — Camera integration, Firebase Storage, timeline display

### Phase 6: Reporting & History (Claude Code)
19. **Weekly Report View** — Stats grid, compliance heat map, coach response card
20. **Quarterly Dashboard** — Weight chart, photo timeline, trend graphs, before/after
21. **Protocol Versioning** — Track changes over time, history view

### Phase 7: Polish & Deploy (Claude Code)
22. **PWA Config** — manifest.json, service worker, installable, offline basics
23. **Security Rules** — Firestore rules, one-way data flow, scoped API keys
24. **Testing & Deploy** — End-to-end test, Netlify production deploy

---

## Current Protocol State (as of April 1, 2026)

Based on latest coach correspondence:

- **Cardio:** 25 minutes daily (upgraded from 20), two walks daily (25 AM fasted + 15 PM)
- **Meals:** Base protocol with training/non-training day split
- **Non-Training Days:** Protein, fats, vegetables only (no rice, no fruit)
- **Thursday Treat Meal:** Burger + fries (~250g), GF bun if possible, no cheese, any toppings, moderate salt, 10-min walk post-meal
- **Supplements:** All as prescribed, no changes
- **Training:** Base schedule, leg days modified (mobility/bodyweight only due to injury)
- **Current weight:** 257.8 lbs (down ~13 lbs from start at ~270.8)
- **Week:** 4 of 12

## Security (Health Data Architecture)

Following the isolated workspace / scoped API key / one-way data flow principles from the existing infrastructure:

- **Firestore Security Rules** — Users can only read/write their own data. No cross-user access.
- **Scoped API Keys** — Each integration (Oura, Gmail, Claude) uses its own scoped credentials. Gmail is read-only. Oura is read-only. Claude API calls are server-side only (never exposed to client).
- **One-Way Data Flow** — Make.com scenarios write TO Firestore. The app reads FROM Firestore. Coach email parsing flows: Gmail → Make.com → Claude API → Make.com → Firestore. No direct client-to-external-API calls for sensitive operations.
- **OAuth Token Security** — Oura and Gmail refresh tokens stored in Firestore with security rules preventing client-side access. Token refresh handled server-side via Cloud Functions or Make.com.
- **Photo Privacy** — Firebase Storage rules ensure photos are only accessible by the uploading user and any explicitly authorized coach accounts.
- **No PII in URLs** — All sensitive data passed via POST bodies, never query parameters.
- **HTTPS Only** — Netlify provides SSL by default. FCM requires HTTPS.

---

*"Master the process — the results are inevitable."*
*— Natural Nutrition Coaching*
