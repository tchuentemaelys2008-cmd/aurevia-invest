import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];
const ADMIN_PATHS = ["/admin"];
const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "MODERATOR"];

// In production JWT_SECRET MUST be set; the dev-only fallback keeps local dev
// working without exposing a forgeable default in production (fails closed).
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    (process.env.NODE_ENV !== "production" ? "aurevia-dev-only-secret-change-me" : "")
);

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get("auth-token")?.value;

  // Landing page publique — la page décide elle-même de rediriger les
  // utilisateurs connectés. Sans cette exception, les visiteurs (et les liens
  // de parrainage /?ref=CODE) étaient renvoyés vers /login.
  if (pathname === "/") return NextResponse.next();
  if (pathname.startsWith("/gift/")) return NextResponse.next();
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (pathname.startsWith("/api/auth")) return NextResponse.next();
  if (pathname.startsWith("/payment")) return NextResponse.next();
  if (pathname.startsWith("/api/events")) return NextResponse.next();
  if (pathname.startsWith("/api/leaderboard")) return NextResponse.next();
  if (pathname.startsWith("/api/settings/public")) return NextResponse.next();
  if (pathname.startsWith("/api/purchases/recent")) return NextResponse.next();
  if (pathname.startsWith("/api/brand-logo")) return NextResponse.next();
  // Le cron Vercel appelle cette route avec son propre header Authorization
  // (vérifié dans la route), sans cookie de session.
  if (pathname.startsWith("/api/cron/")) return NextResponse.next();
  // Payment provider webhooks must stay public — they arrive without an auth
  // cookie, so they must never be redirected to /login.
  if (
    pathname.startsWith("/api/payments/geniuspay/webhook") ||
    pathname.startsWith("/api/payments/fapshi/webhook")
  )
    return NextResponse.next();

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    // Conserve le chemin ET la query (ex: /passes?promo=x) pour revenir au bon
    // endroit après connexion.
    loginUrl.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && !ADMIN_ROLES.includes(String(payload.role))) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  // Exclude static assets (incl. .jpg/.jpeg/.webp/.gif) so image requests are
  // never auth-redirected — otherwise logos/images break for logged-out users
  // on public pages like /login and /register.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.avif|.*\\.ico).*)",
  ],
};
