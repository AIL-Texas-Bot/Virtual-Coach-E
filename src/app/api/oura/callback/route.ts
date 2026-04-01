import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// Oura Ring OAuth2 callback
// User authorizes → Oura redirects here with auth code → we exchange for tokens

const OURA_TOKEN_URL = "https://api.ouraring.com/oauth/token";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // userId
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/settings?oura_error=${error}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/settings?oura_error=missing_params", request.url)
    );
  }

  try {
    // Exchange auth code for tokens
    const tokenResponse = await fetch(OURA_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.OURA_CLIENT_ID || "",
        client_secret: process.env.OURA_CLIENT_SECRET || "",
        redirect_uri: process.env.OURA_REDIRECT_URI || "",
      }),
    });

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      console.error("Oura token exchange failed:", err);
      return NextResponse.redirect(
        new URL("/settings?oura_error=token_exchange_failed", request.url)
      );
    }

    const tokens = await tokenResponse.json();

    if (!adminDb) {
      return NextResponse.redirect(
        new URL("/settings?oura_error=server_config", request.url)
      );
    }

    // Store tokens in user document
    await adminDb.collection("users").doc(state).update({
      ouraAccessToken: tokens.access_token,
      ouraRefreshToken: tokens.refresh_token,
      ouraTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    });

    return NextResponse.redirect(
      new URL("/settings?oura_connected=true", request.url)
    );
  } catch (err) {
    console.error("Oura OAuth error:", err);
    return NextResponse.redirect(
      new URL("/settings?oura_error=server_error", request.url)
    );
  }
}
