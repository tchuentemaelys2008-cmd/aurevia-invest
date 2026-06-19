export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, hashPassword } from "@/lib/auth";
import { nanoid } from "nanoid";

function getOrigin(req: NextRequest) {
  return process.env.NEXT_PUBLIC_URL || req.nextUrl.origin;
}

async function uniqueReferralCode(): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const code = nanoid(8).toUpperCase();
    const exists = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!exists) return code;
  }
  return nanoid(10).toUpperCase();
}

export async function GET(req: NextRequest) {
  const origin = getOrigin(req);
  const fail = (notice: string) =>
    NextResponse.redirect(new URL(`/login?auth_notice=${notice}`, origin));

  try {
    const url = req.nextUrl;
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const savedState = req.cookies.get("g_oauth_state")?.value;

    if (url.searchParams.get("error") || !code) return fail("google_cancelled");
    if (!state || !savedState || state !== savedState) return fail("google_error");

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) return fail("google_soon");

    const redirectUri = `${origin}/api/auth/google/callback`;

    // Exchange the authorization code for tokens.
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) return fail("google_error");
    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token as string | undefined;
    if (!accessToken) return fail("google_error");

    // Fetch the verified profile.
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profileRes.ok) return fail("google_error");
    const profile = await profileRes.json();

    const email: string | undefined = profile.email;
    const name: string = profile.name || profile.given_name || (email ? email.split("@")[0] : "Utilisateur");
    if (!email) return fail("google_error");

    // Find or create the account.
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // `password` is required by the schema. OAuth users get a random,
      // unusable password — they sign in with Google (or "forgot password").
      const randomPassword = await hashPassword(nanoid(32));
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: randomPassword,
          referralCode: await uniqueReferralCode(),
          isVerified: Boolean(profile.email_verified),
        },
      });
      // Message de bienvenue (notification persistante).
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Bienvenue sur Aurevia Invest 🎉",
          message: `Bonjour ${user.name} ! Votre compte est créé. Achetez un pass pour démarrer vos revenus quotidiens, et rejoignez notre chaîne WhatsApp pour les actus. Bonne route avec Aurevia 🚀`,
          type: "success",
        },
      }).catch(() => {});
    }

    if (!user.isActive || user.isSuspended) return fail("account_disabled");

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const dest = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(user.role)
      ? "/admin/dashboard"
      : "/dashboard";
    const res = NextResponse.redirect(new URL(dest, origin));
    res.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 604800,
      path: "/",
    });
    // Clear the CSRF state cookie.
    res.cookies.set("g_oauth_state", "", { maxAge: 0, path: "/" });
    return res;
  } catch {
    return fail("google_error");
  }
}
