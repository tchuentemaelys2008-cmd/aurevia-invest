"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface SocialLinks { whatsapp_link?: string; telegram_link?: string; whatsapp_group_link?: string; }

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function WelcomePopup() {
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<SocialLinks>({});

  useEffect(() => {
    const shown = sessionStorage.getItem("aurevia-welcome-shown");
    if (shown) return;

    fetch("/api/settings/public")
      .then(r => r.json())
      .then(d => {
        const s: SocialLinks = d.settings || {};
        if (s.whatsapp_link || s.telegram_link || s.whatsapp_group_link) {
          setLinks(s);
          setTimeout(() => setOpen(true), 1200);
        } else {
          // No links configured — mark shown so we don't retry every visit
          sessionStorage.setItem("aurevia-welcome-shown", "1");
        }
      })
      .catch(() => {
        // On error mark shown to avoid retrying on every navigation
        sessionStorage.setItem("aurevia-welcome-shown", "1");
      });
  }, []);

  const dismiss = () => {
    setOpen(false);
    sessionStorage.setItem("aurevia-welcome-shown", "1");
  };

  const joinAndDismiss = (url: string) => {
    window.open(url, "_blank");
    dismiss();
  };

  if (!open) return null;

  const telegramLink = links.telegram_link;
  const whatsappLink = links.whatsapp_group_link || links.whatsapp_link;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="w-full max-w-sm rounded-3xl p-6 relative overflow-hidden"
          style={{ background: "var(--surface-card)", border: "1px solid var(--control-border)", boxShadow: "0 25px 60px rgba(0,0,0,0.4)" }}
        >
          {/* Glow bg */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#5b6ef5]/10 blur-[60px] rounded-full" />
          </div>

          <button type="button" onClick={dismiss} className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center touch-manipulation" style={{ background: "var(--control-bg)", color: "var(--control-text)", opacity: 0.5 }}>
            <X size={15} />
          </button>

          <div className="relative text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5b6ef5] to-[#6c5ce7] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#5b6ef5]/30">
              <img src="/photo_2026-05-25_14-14-19.jpg" alt="Aurevia" className="w-full h-full object-cover rounded-2xl" />
            </div>
            <h3 className="font-display font-bold text-lg" style={{ color: "var(--control-text)" }}>
              {lang === "fr" ? "Bienvenue sur Aurevia !" : "Welcome to Aurevia!"}
            </h3>
            <p className="text-sm mt-1" style={{ color: "var(--control-text)", opacity: 0.5 }}>
              {lang === "fr"
                ? "Rejoignez notre communauté pour les dernières nouvelles, preuves de paiement et mises à jour exclusives."
                : "Join our community for the latest news, payment proofs and exclusive updates."}
            </p>
          </div>

          <div className="relative space-y-3">
            {telegramLink && (
              <button
                type="button"
                onClick={() => joinAndDismiss(telegramLink)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all touch-manipulation"
                style={{ background: "rgba(0,136,204,0.1)", border: "1px solid rgba(0,136,204,0.25)" }}
              >
                <div className="w-10 h-10 rounded-xl bg-[#0088cc] flex items-center justify-center flex-shrink-0 text-white">
                  <TelegramIcon />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm text-[#0088cc]">Telegram</p>
                  <p className="text-xs" style={{ color: "var(--control-text)", opacity: 0.5 }}>
                    {lang === "fr" ? "Canal officiel Aurevia" : "Official Aurevia channel"}
                  </p>
                </div>
                <ExternalLink size={15} className="text-[#0088cc] flex-shrink-0" />
              </button>
            )}

            {whatsappLink && (
              <button
                type="button"
                onClick={() => joinAndDismiss(whatsappLink)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all touch-manipulation"
                style={{ background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.25)" }}
              >
                <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0 text-white">
                  <WhatsAppIcon />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm text-[#25D366]">WhatsApp</p>
                  <p className="text-xs" style={{ color: "var(--control-text)", opacity: 0.5 }}>
                    {lang === "fr" ? "Groupe communauté Aurevia" : "Aurevia community group"}
                  </p>
                </div>
                <ExternalLink size={15} className="text-[#25D366] flex-shrink-0" />
              </button>
            )}

            <button
              type="button"
              onClick={dismiss}
              className="w-full py-2.5 text-sm font-medium rounded-xl transition-all touch-manipulation"
              style={{ color: "var(--control-text)", opacity: 0.4 }}
            >
              {lang === "fr" ? "Plus tard" : "Maybe later"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
