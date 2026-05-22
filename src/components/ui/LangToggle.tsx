"use client";
import { useLanguage } from "@/lib/i18n";

export default function LangToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <button
      onClick={() => setLang(lang === "fr" ? "en" : "fr")}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/6 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold text-white/70 hover:text-white select-none"
      title={lang === "fr" ? "Switch to English" : "Passer en Français"}
    >
      {lang === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}
    </button>
  );
}
