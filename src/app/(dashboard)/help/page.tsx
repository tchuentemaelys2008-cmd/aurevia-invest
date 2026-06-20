"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bot, Bell, Gift, LayoutDashboard, LogOut,
  Settings, Share2, ShoppingBag, Target, TrendingUp, Trophy, Users,
  Wallet, Zap, X, CheckSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useLanguage } from "@/lib/i18n";
import WhatsAppChannelCard from "@/components/ui/WhatsAppChannelCard";

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
    { icon: LayoutDashboard, title: t("help_page_dashboard"), text: t("help_page_dashboard_text") },
    { icon: ShoppingBag, title: t("help_page_passes"), text: t("help_page_passes_text") },
    { icon: CheckSquare, title: t("help_page_tasks"), text: t("help_page_tasks_text") },
    { icon: Target, title: t("help_page_missions"), text: t("help_page_missions_text") },
    { icon: Trophy, title: t("help_page_leaderboard"), text: t("help_page_leaderboard_text") },
    { icon: Users, title: t("help_page_team"), text: t("help_page_team_text") },
    { icon: Share2, title: t("help_page_affiliate"), text: t("help_page_affiliate_text") },
    { icon: Wallet, title: t("help_page_wallet"), text: t("help_page_wallet_text") },
    { icon: TrendingUp, title: t("help_page_simulator"), text: t("help_page_simulator_text") },
    { icon: Zap, title: t("help_page_spin"), text: t("help_page_spin_text") },
    { icon: Bell, title: t("help_page_notifications"), text: t("help_page_notifications_text") },
    { icon: Bot, title: t("help_page_ia"), text: t("help_page_ia_text") },
    { icon: Gift, title: t("help_page_gift"), text: t("help_page_gift_text") },
    { icon: Settings, title: t("help_page_settings"), text: t("help_page_settings_text") },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-[#3b6fd4] text-xs font-semibold uppercase tracking-widest mb-1">{t("help_kicker")}</p>
        <h1 className="text-2xl font-display font-bold" style={{ color: "var(--control-text)" }}>{t("help_title")}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--control-text)", opacity: 0.5 }}>{t("help_intro")}</p>
      </motion.div>

      {/* WhatsApp channel */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <WhatsAppChannelCard />
      </motion.div>

      <div className="space-y-3 mb-5">
        {helpCards.map(({ icon: Icon, title, text }, index) => (
          <motion.div key={title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
            <Card className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3b6fd4]/15 text-[#3b6fd4] flex items-center justify-center flex-shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <h2 className="font-display font-bold text-sm mb-1" style={{ color: "var(--control-text)" }}>{title}</h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--control-text)", opacity: 0.55 }}>{text}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <h2 className="font-display font-bold text-sm mb-1" style={{ color: "var(--control-text)" }}>{t("help_logout_title")}</h2>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--control-text)", opacity: 0.55 }}>{t("help_logout_text")}</p>
        <Button variant="danger" className="w-full" onClick={() => setConfirmOpen(true)}>
          <LogOut size={16} />
          {t("help_logout_btn")}
        </Button>
      </Card>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-[var(--surface-card)] border border-[var(--control-border)] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold" style={{ color: "var(--control-text)" }}>{t("help_logout_confirm_title")}</h3>
              <button type="button" onClick={() => setConfirmOpen(false)} className="w-8 h-8 rounded-xl bg-white/6 flex items-center justify-center" style={{ color: "var(--control-text)", opacity: 0.5 }}>
                <X size={16} />
              </button>
            </div>
            <p className="text-sm mb-5" style={{ color: "var(--control-text)", opacity: 0.5 }}>{t("help_logout_confirm_text")}</p>
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
