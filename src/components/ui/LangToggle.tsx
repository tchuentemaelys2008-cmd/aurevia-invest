"use client";

import { useLanguage } from "@/lib/i18n";

export default function LangToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "fr" ? "en" : "fr")}
      className="ui-action-button flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all text-xs font-bold select-none"
      title={lang === "fr" ? "Switch to English" : "Passer en Francais"}
    >
      {lang === "fr" ? "FR" : "EN"}
    </button>
  );
}
