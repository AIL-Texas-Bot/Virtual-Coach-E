// OAuth authorization URL builders

const OURA_AUTH_URL = "https://cloud.ouraring.com/oauth/authorize";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export function getOuraAuthUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_OURA_CLIENT_ID || "",
    response_type: "code",
    redirect_uri: process.env.NEXT_PUBLIC_OURA_REDIRECT_URI || "",
    state: userId,
    scope: "daily_sleep daily_readiness daily_activity heartrate daily_stress personal",
  });
  return `${OURA_AUTH_URL}?${params.toString()}`;
}

export function getGmailAuthUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID || "",
    redirect_uri: process.env.NEXT_PUBLIC_GMAIL_REDIRECT_URI || "",
    response_type: "code",
    scope: "https://www.googleapis.com/auth/gmail.readonly",
    state: userId,
    access_type: "offline",
    prompt: "consent",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}
