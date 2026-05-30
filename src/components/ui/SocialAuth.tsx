"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/i18n";

/** Official multicolor Google "G" mark. */
function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

/** Official Apple logo (monochrome, follows text color). */
function AppleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.536c-.026-2.69 2.197-3.98 2.297-4.043-1.252-1.83-3.198-2.08-3.888-2.107-1.654-.168-3.23.974-4.07.974-.838 0-2.133-.95-3.51-.924-1.806.027-3.473 1.05-4.402 2.667-1.878 3.255-.48 8.071 1.347 10.715.893 1.295 1.957 2.747 3.353 2.695 1.345-.054 1.853-.87 3.479-.87 1.626 0 2.083.87 3.508.843 1.448-.026 2.366-1.319 3.252-2.62 1.025-1.503 1.447-2.957 1.472-3.032-.032-.014-2.824-1.084-2.852-4.297zM14.39 4.594c.742-.9 1.243-2.151 1.106-3.394-1.069.043-2.364.712-3.13 1.611-.687.798-1.288 2.072-1.127 3.292 1.192.093 2.41-.606 3.151-1.509z" />
    </svg>
  );
}

const NOTICES: Record<string, { fr: string; en: string }> = {
  google_soon: {
    fr: "Connexion Google bientôt disponible — notre équipe la configure.",
    en: "Google sign-in coming soon — our team is setting it up.",
  },
  google_error: {
    fr: "Échec de la connexion Google. Veuillez réessayer.",
    en: "Google sign-in failed. Please try again.",
  },
  google_cancelled: {
    fr: "Connexion Google annulée.",
    en: "Google sign-in cancelled.",
  },
  account_disabled: {
    fr: "Ce compte est désactivé ou suspendu.",
    en: "This account is disabled or suspended.",
  },
};

export default function SocialAuth() {
  const { t, lang } = useLanguage();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Show a friendly message when the OAuth flow bounces back with a notice.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const notice = params.get("auth_notice");
    if (notice && NOTICES[notice]) {
      toast(lang === "fr" ? NOTICES[notice].fr : NOTICES[notice].en, { duration: 4000 });
      params.delete("auth_notice");
      const qs = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogle = () => {
    setGoogleLoading(true);
    // Server route builds the Google consent URL from env vars and redirects.
    // If the keys aren't configured yet, the route redirects back with a notice.
    window.location.href = "/api/auth/google";
  };

  const handleApple = () => {
    toast(
      lang === "fr"
        ? "Bientôt disponible — notre équipe travaille dessus."
        : "Coming soon — our team is working on it.",
      { icon: "🍎", duration: 3500 }
    );
  };

  return (
    <>
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[var(--surface-card)] px-3 text-xs text-white/40">
            {t("auth_or")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="social-btn disabled:opacity-60"
          aria-label="Google"
        >
          {googleLoading ? <span className="spinner" /> : <GoogleIcon />}
          Google
        </button>
        <button
          type="button"
          onClick={handleApple}
          className="social-btn"
          aria-label="Apple"
        >
          <AppleIcon />
          Apple
        </button>
      </div>
    </>
  );
}
