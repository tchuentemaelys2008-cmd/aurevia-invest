export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

function getOrigin(req: NextRequest) {
  return process.env.NEXT_PUBLIC_URL || req.nextUrl.origin;
}

/**
 * Starts the Google OAuth flow.
 * Requires GOOGLE_CLIENT_ID (and GOOGLE_CLIENT_SECRET for the callback).
 * If the keys aren't configured yet, we bounce back to /login with a notice
 * so the UI can show a friendly "coming soon" message instead of erroring.
 */
export async function GET(req: NextRequest) {
  const origin = getOrigin(req);
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.redirect(new URL("/login?auth_notice=google_soon", origin));
  }

  const state = nanoid(24);
  const redirectUri = `${origin}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "select_account",
    state,
  });

  const res = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
  // Short-lived CSRF state cookie, validated in the callback.
  res.cookies.set("g_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
