"use client";
import { useLanguage } from "@/lib/i18n";
import LangToggle from "@/components/ui/LangToggle";
import { Settings, Bell, Shield, Globe, Info } from "lucide-react";

export default function SettingsPage() {
  const { t } = useLanguage();
  return (
    <div className="p-4 lg:p-8 max-w-xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1">Compte</p>
        <h1 className="text-2xl font-display font-bold text-white">{t("settings_title")}</h1>
      </div>

      <div className="space-y-4">
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
            <Globe size={15} className="text-[#3b6fd4]" />
            <span className="text-sm font-semibold text-white">{t("settings_language")}</span>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <p className="text-sm text-white/60">{t("settings_lang_desc")}</p>
            <LangToggle />
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
            <Info size={15} className="text-[#6c4de6]" />
            <span className="text-sm font-semibold text-white">{t("settings_about")}</span>
          </div>
          <div className="px-5 py-4 space-y-3 text-sm text-white/40">
            <div className="flex justify-between"><span>Version</span><span className="text-white">1.0.0</span></div>
            <div className="flex justify-between"><span>Plateforme</span><span className="text-white">Aurevia Invest</span></div>
            <div className="flex justify-between"><span>Support</span><span className="text-[#3b6fd4]">support@aurevia.com</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
