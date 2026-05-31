"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Gift, Sparkles, XCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

type State =
  | { kind: "loading" }
  | { kind: "success"; value: number }
  | { kind: "error"; message: string };

export default function GiftActivatePage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const code = String(params.code || "").toUpperCase();
  const [state, setState] = useState<State>({ kind: "loading" });
  const claimed = useRef(false);

  useEffect(() => {
    // Guard against React StrictMode double-invoke claiming twice.
    if (claimed.current || !code) return;
    claimed.current = true;

    const errMessages: Record<string, string> = {
      gift_invalid: t("gift_invalid"),
      gift_inactive: t("gift_inactive"),
      gift_already: t("gift_already"),
      gift_full: t("gift_full"),
    };

    (async () => {
      try {
        const res = await fetch("/api/gift-codes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (res.ok) setState({ kind: "success", value: data.value });
        else setState({ kind: "error", message: errMessages[data.error] || data.error || t("gift_invalid") });
      } catch {
        setState({ kind: "error", message: t("gift_invalid") });
      }
    })();
  }, [code, t]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 text-center border border-[var(--control-border)]"
          style={{ background: "var(--surface-card)" }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5b6ef5] to-[#6c5ce7] flex items-center justify-center">
              <Gift size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">{t("gift_float_title")}</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/8 mb-6">
            <p className="text-xs text-white/30">Code</p>
            <p className="text-lg font-mono font-bold text-white tracking-widest">{code}</p>
          </div>

          {state.kind === "loading" && (
            <div className="py-4">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full border-2 border-[#5b6ef5] border-t-transparent animate-spin" />
              <p className="text-white/60 text-sm">{t("gift_submit")}…</p>
            </div>
          )}

          {state.kind === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="py-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5b6ef5]/20 to-[#6c5ce7]/20 flex items-center justify-center mx-auto mb-3">
                <Sparkles size={30} className="text-[#6c5ce7]" />
              </div>
              <p className="font-display font-bold text-2xl mb-1 text-white">+{formatCurrency(state.value)}</p>
              <p className="text-sm text-white/55 mb-5">{t("gift_success")}</p>
              <button onClick={() => router.push("/dashboard")} className="w-full bg-gradient-to-r from-[#5b6ef5] to-[#6c5ce7] text-white text-sm font-semibold py-3 rounded-xl">
                {t("passes_back_dashboard")}
              </button>
            </motion.div>
          )}

          {state.kind === "error" && (
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="py-2">
              <div className="w-16 h-16 rounded-2xl bg-red-400/15 flex items-center justify-center mx-auto mb-3">
                <XCircle size={30} className="text-red-400" />
              </div>
              <p className="text-sm text-white/70 mb-5">{state.message}</p>
              <button onClick={() => router.push("/dashboard")} className="w-full bg-white/8 border border-white/12 text-white text-sm font-semibold py-3 rounded-xl">
                {t("passes_back_dashboard")}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
