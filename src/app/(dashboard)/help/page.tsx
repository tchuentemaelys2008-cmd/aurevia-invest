"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Banknote, HelpCircle, LogOut, Share2, Wallet, X } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useLanguage } from "@/lib/i18n";

export default function HelpPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success(t("nav_logout"));
    router.push("/login");
    setLoggingOut(false);
  };

  const helpCards = [
    { icon: HelpCircle, title: t("help_how_title"), text: [t("help_how_1"), t("help_how_2"), t("help_how_3"), t("help_how_4")].join(" ") },
    { icon: Banknote, title: t("help_deposit_title"), text: t("help_deposit_text") },
    { icon: Wallet, title: t("help_withdraw_title"), text: t("help_withdraw_text") },
    { icon: Share2, title: t("help_affiliate_title"), text: t("help_affiliate_text") },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 pt-8 pb-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-white/40 text-sm mb-1">{t("help_kicker")}</p>
        <h1 className="text-2xl font-display font-bold text-white">{t("help_title")}</h1>
        <p className="text-white/40 text-sm mt-1">{t("help_intro")}</p>
      </motion.div>

      <div className="space-y-3 mb-5">
        {helpCards.map(({ icon: Icon, title, text }, index) => (
          <motion.div key={title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3b6fd4]/15 text-[#3b6fd4] flex items-center justify-center flex-shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <h2 className="font-display font-bold text-white text-sm mb-1">{title}</h2>
                <p className="text-white/45 text-sm leading-relaxed">{text}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <h2 className="font-display font-bold text-white text-sm mb-1">{t("help_logout_title")}</h2>
        <p className="text-white/45 text-sm leading-relaxed mb-4">{t("help_logout_text")}</p>
        <Button variant="danger" className="w-full" onClick={() => setConfirmOpen(true)}>
          <LogOut size={16} />
          {t("help_logout_btn")}
        </Button>
      </Card>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-[#0c1428] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-white">{t("help_logout_confirm_title")}</h3>
              <button onClick={() => setConfirmOpen(false)} className="w-8 h-8 rounded-xl bg-white/6 flex items-center justify-center text-white/50 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <p className="text-white/50 text-sm mb-5">{t("help_logout_confirm_text")}</p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>{t("help_cancel")}</Button>
              <Button variant="danger" loading={loggingOut} onClick={logout}>{t("help_confirm_logout")}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
