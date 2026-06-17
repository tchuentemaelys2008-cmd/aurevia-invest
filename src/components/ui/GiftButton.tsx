"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

export default function GiftButton() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [won, setWon] = useState<number | null>(null);

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/gift-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok) {
        setWon(data.value);
      } else {
        const errKey = data.error as keyof typeof errMessages;
        const errMessages = {
          gift_invalid: t("gift_invalid"),
          gift_inactive: t("gift_inactive"),
          gift_already: t("gift_already"),
          gift_full: t("gift_full"),
        };
        toast.error(errMessages[errKey] || data.error);
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCode("");
    setWon(null);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center touch-manipulation lg:bottom-8"
        style={{ background: "linear-gradient(135deg, #e23744, #b51d2c)", boxShadow: "0 0 24px rgba(181,29,44,0.5)" }}
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        aria-label={t("gift_float_title")}
      >
        <Gift size={24} className="text-white" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm rounded-2xl p-6 border border-[var(--control-border)]"
              style={{ background: "var(--surface-card)" }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e23744] to-[#b51d2c] flex items-center justify-center">
                    <Gift size={18} className="text-white" />
                  </div>
                  <h3 className="font-display font-bold" style={{ color: "var(--control-text)" }}>{t("gift_float_title")}</h3>
                </div>
                <button type="button" onClick={handleClose} className="w-8 h-8 rounded-xl bg-white/6 flex items-center justify-center touch-manipulation" style={{ color: "var(--control-text)", opacity: 0.5 }}>
                  <X size={16} />
                </button>
              </div>

              {won !== null ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e23744]/20 to-[#b51d2c]/20 flex items-center justify-center mx-auto mb-3">
                    <Sparkles size={28} className="text-[#b51d2c]" />
                  </div>
                  <p className="font-display font-bold text-xl mb-1" style={{ color: "var(--control-text)" }}>
                    +{formatCurrency(won)}
                  </p>
                  <p className="text-sm" style={{ color: "var(--control-text)", opacity: 0.55 }}>{t("gift_success")}</p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-4 w-full bg-gradient-to-r from-[#e23744] to-[#b51d2c] text-white text-sm font-semibold py-3 rounded-xl touch-manipulation"
                  >
                    OK
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm" style={{ color: "var(--control-text)", opacity: 0.55 }}>
                    {t("gift_enter_code")}
                  </p>
                  <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: "var(--control-bg)", border: "1px solid var(--control-border)" }}>
                    <Gift size={15} style={{ color: "var(--control-text)", opacity: 0.4 }} />
                    <input
                      value={code}
                      onChange={e => setCode(e.target.value.toUpperCase())}
                      placeholder={t("gift_code_placeholder")}
                      className="flex-1 bg-transparent outline-none text-sm font-mono tracking-widest"
                      style={{ color: "var(--control-text)" }}
                      onKeyDown={e => { if (e.key === "Enter") handleRedeem(); }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRedeem}
                    disabled={loading || !code.trim()}
                    className="w-full bg-gradient-to-r from-[#e23744] to-[#b51d2c] text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all touch-manipulation"
                  >
                    {loading ? "..." : t("gift_submit")}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
