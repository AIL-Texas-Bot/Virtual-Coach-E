import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// Gmail OAuth2 callback (read-only scope)
// Used for scanning coach reply emails

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // userId
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/settings?gmail_error=${error}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/settings?gmail_error=missing_params", request.url)
    );
  }

  try {
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.GMAIL_CLIENT_ID || "",
        client_secret: process.env.GMAIL_CLIENT_SECRET || "",
        redirect_uri: process.env.GMAIL_REDIRECT_URI || "",
      }),
    });

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      console.error("Gmail token exchange failed:", err);
      return NextResponse.redirect(
        new URL("/settings?gmail_error=token_exchange_failed", request.url)
      );
    }

    const tokens = await tokenResponse.json();

    if (!adminDb) {
      return NextResponse.redirect(
        new URL("/settings?gmail_error=server_config", request.url)
      );
    }

    await adminDb.collection("users").doc(state).update({
      gmailAccessToken: tokens.access_token,
      gmailRefreshToken: tokens.refresh_token,
    });

    return NextResponse.redirect(
      new URL("/settings?gmail_connected=true", request.url)
    );
  } catch (err) {
    console.error("Gmail OAuth error:", err);
    return NextResponse.redirect(
      new URL("/settings?gmail_error=server_error", request.url)
    );
  }
}
