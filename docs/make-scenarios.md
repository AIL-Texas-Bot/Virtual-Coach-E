# Make.com Scenario Setup Guide

Base URL: `https://virtual-coach-e.netlify.app`

All endpoints expect `Content-Type: application/json`.

---

## Scenario 1: Daily Notification Scheduler

**Trigger:** Schedule — runs at each protocol time (see schedule below)

**Action:** HTTP POST to `{BASE_URL}/api/send-notification`

**Body:**
```json
{
  "userId": "{{firebase_user_id}}",
  "scheduleItemId": "{{item_id}}"
}
```

**Schedule & Item IDs:**

| Time (CT) | scheduleItemId | Description |
|-----------|---------------|-------------|
| 6:30 AM | `morning-protocol` | Morning Protocol |
| 6:35 AM | `cardio` | Fasted Cardio |
| 10:00 AM | `meal-1` | Meal 1 |
| 10:05 AM | `meal-1-supps` | Meal 1 Supplements |
| 1:00 PM | `meal-2` | Meal 2 |
| 4:00 PM | `meal-3` | Meal 3 |
| 7:00 PM | `meal-4` | Meal 4 |
| 7:05 PM | `meal-4-supps` | Meal 4 Supplements |
| 8:30 PM | `screens-off` | Screens Off |
| 9:30 PM | `weight-check` | Weight Check |
| 10:00 PM | `lights-out` | Lights Out |

**Training days only (check day of week):**

| Time | scheduleItemId | Description |
|------|---------------|-------------|
| Before workout | `pre-workout` | Pre-Workout Stack |

---

## Scenario 2: Oura Ring Daily Sync

**Trigger:** Schedule — Daily at 7:00 AM CT

**Action:** HTTP POST to `{BASE_URL}/api/oura/sync`

**Body:**
```json
{
  "userId": "{{firebase_user_id}}",
  "date": "{{formatDate(now; 'YYYY-MM-DD')}}"
}
```

**Response:** Returns synced Oura data (sleep score, readiness, HRV, steps, etc.)

---

## Scenario 3: Wednesday Report Generator + Sender

**Trigger:** Schedule — Wednesday at 6:00 AM CT

### Step 1: Generate Report
**Action:** HTTP POST to `{BASE_URL}/api/report/generate`

**Body:**
```json
{
  "userId": "{{firebase_user_id}}",
  "weekNumber": {{calculateWeekNumber}}
}
```

### Step 2: Send Report Email
**Action:** HTTP POST to `{BASE_URL}/api/report/send`

**Body:**
```json
{
  "userId": "{{firebase_user_id}}",
  "weekNumber": {{calculateWeekNumber}}
}
```

### Step 3: Notify User
**Action:** HTTP POST to `{BASE_URL}/api/send-notification`

**Body:**
```json
{
  "userId": "{{firebase_user_id}}",
  "scheduleItemId": "report-sent"
}
```

---

## Scenario 4: Coach Email Scanner

**Trigger:** Schedule — Every 2 hours on Wednesdays and Thursdays

### Step 1: Gmail API — Fetch Latest Reply
**Module:** Google Gmail > Search Emails
- From: `naturalnutritioncoaching@gmail.com`
- Subject contains: `Check-In` OR `Andrew Batten`
- After: last check timestamp
- Max results: 1

### Step 2: Check if New Email Found
**Module:** Router — if email found, continue

### Step 3: Parse with Claude API
**Action:** HTTP POST to `{BASE_URL}/api/coach/parse`

**Body:**
```json
{
  "userId": "{{firebase_user_id}}",
  "emailBody": "{{gmail_email_body}}",
  "weekNumber": {{current_week_number}}
}
```

### Step 4: If Changes Detected — Notify User
**Module:** Router — if `changesDetected` is true
**Action:** HTTP POST to `{BASE_URL}/api/send-notification`

**Body:**
```json
{
  "userId": "{{firebase_user_id}}",
  "scheduleItemId": "coach-update"
}
```

---

## OAuth Setup URLs

### Oura Ring Authorization
Redirect user to:
```
https://cloud.ouraring.com/oauth/authorize?client_id={{OURA_CLIENT_ID}}&response_type=code&redirect_uri={{OURA_REDIRECT_URI}}&state={{userId}}&scope=daily_sleep+daily_readiness+daily_activity+heartrate+daily_stress+personal
```

### Gmail Authorization (Read-Only)
Redirect user to:
```
https://accounts.google.com/o/oauth2/v2/auth?client_id={{GMAIL_CLIENT_ID}}&redirect_uri={{GMAIL_REDIRECT_URI}}&response_type=code&scope=https://www.googleapis.com/auth/gmail.readonly&state={{userId}}&access_type=offline&prompt=consent
```
