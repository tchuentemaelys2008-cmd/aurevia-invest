"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bot, Bell, Gift, LayoutDashboard, LogOut,
  Settings, Share2, ShoppingBag, Target, TrendingUp, Trophy, Users,
  Wallet, Zap, X, CheckSquare, ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useLanguage } from "@/lib/i18n";
import { WHATSAPP_CHANNEL } from "@/lib/socials";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function HelpPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
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
        <p className="text-[#5b6ef5] text-xs font-semibold uppercase tracking-widest mb-1">{t("help_kicker")}</p>
        <h1 className="text-2xl font-display font-bold" style={{ color: "var(--control-text)" }}>{t("help_title")}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--control-text)", opacity: 0.5 }}>{t("help_intro")}</p>
      </motion.div>

      {/* WhatsApp channel */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <a href={WHATSAPP_CHANNEL} target="_blank" rel="noopener noreferrer" className="block">
          <div className="flex items-center gap-3 rounded-2xl p-4 card-lift" style={{ background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)" }}>
            <div className="w-11 h-11 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0 text-white">
              <WhatsAppIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-sm text-[#25D366]">{lang === "fr" ? "Suivre la chaîne WhatsApp" : "Follow our WhatsApp channel"}</p>
              <p className="text-xs" style={{ color: "var(--control-text)", opacity: 0.6 }}>
                {lang === "fr" ? "Actus, preuves de paiement et mises à jour officielles." : "News, payment proofs and official updates."}
              </p>
            </div>
            <ExternalLink size={16} className="text-[#25D366] flex-shrink-0" />
          </div>
        </a>
      </motion.div>

      <div className="space-y-3 mb-5">
        {helpCards.map(({ icon: Icon, title, text }, index) => (
          <motion.div key={title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
            <Card className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5b6ef5]/15 text-[#5b6ef5] flex items-center justify-center flex-shrink-0">
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
