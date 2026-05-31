"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Smartphone, TrendingUp, Users, Zap, Star, ChevronRight } from "lucide-react";
import LangToggle from "@/components/ui/LangToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/lib/i18n";

const fade = { hidden: { opacity: 0, y: 24 }, show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }) };

const stats = [
  { value: "12 000+", label_fr: "Membres actifs", label_en: "Active members" },
  { value: "98M+ FCFA", label_fr: "Revenus distribués", label_en: "Revenue distributed" },
  { value: "90j", label_fr: "Durée par pass", label_en: "Duration per pass" },
  { value: "5%", label_fr: "Commission parrainage", label_en: "Referral commission" },
];

const features = [
  {
    icon: <ShoppingBag size={20} className="text-[#5b6ef5]" />,
    title_fr: "Achète un Pass", title_en: "Buy a Pass",
    desc_fr: "Investis à partir de 2 000 FCFA et génère un revenu journalier pendant 90 jours.",
    desc_en: "Invest from 2,000 FCFA and earn daily revenue for 90 days.",
  },
  {
    icon: <TrendingUp size={20} className="text-emerald-400" />,
    title_fr: "Gains chaque jour", title_en: "Daily earnings",
    desc_fr: "Ton solde est crédité automatiquement chaque jour. Suivi en temps réel.",
    desc_en: "Your balance is credited automatically every day. Real-time tracking.",
  },
  {
    icon: <Smartphone size={20} className="text-orange-400" />,
    title_fr: "Retrait Mobile Money", title_en: "Mobile Money withdrawal",
    desc_fr: "Retire via Orange Money, MTN, Wave ou virement. Disponible partout en Afrique.",
    desc_en: "Withdraw via Orange Money, MTN, Wave or bank transfer. Available across Africa.",
  },
  {
    icon: <Users size={20} className="text-[#6c5ce7]" />,
    title_fr: "Parrainage 5%", title_en: "5% Referral",
    desc_fr: "Partage ton lien. Tu gagnes 5% sur chaque investissement de tes filleuls.",
    desc_en: "Share your link. Earn 5% on every investment by your referrals.",
  },
];

export default function LandingClient() {
  const { lang } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--surface-panel)" }}>
      {/* Sticky header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-xl shadow-sm" : ""}`}
        style={{ background: scrolled ? "var(--surface-nav)" : "transparent", borderBottom: scrolled ? "1px solid var(--control-border)" : "none" }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/photo_2026-05-25_14-14-19.jpg" alt="Aurevia" className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0" />
            <span className="font-display font-bold text-white text-base">Aurevia</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LangToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center pt-24 pb-16 px-4 text-center relative overflow-hidden">
        {/* BG gradient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#5b6ef5]/8 blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-[#6c5ce7]/6 blur-[100px]" />
        </div>

        <motion.div initial="hidden" animate="show" custom={0} variants={fade} className="relative">
          <div className="w-36 h-36 rounded-3xl mx-auto mb-6 shadow-[0_0_80px_rgba(91,110,245,0.4)] overflow-hidden border-2 border-white/10">
            <img src="/photo_2026-05-25_14-14-19.jpg" alt="Aurevia Invest" className="w-full h-full object-cover" />
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="show" custom={1} variants={fade}>
          <div className="inline-flex items-center gap-2 bg-[#5b6ef5]/10 border border-[#5b6ef5]/20 text-[#5b6ef5] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Star size={11} fill="currentColor" />
            {lang === "fr" ? "Plateforme d'investissement africaine #1" : "Africa's #1 Investment Platform"}
          </div>
        </motion.div>

        <motion.h1 initial="hidden" animate="show" custom={2} variants={fade}
          className="text-4xl sm:text-5xl font-display font-bold mb-4 leading-tight max-w-2xl"
          style={{ color: "var(--control-text)" }}>
          {lang === "fr" ? "Investis, Gagne," : "Invest, Earn,"}
          <br />
          <span className="bg-gradient-to-r from-[#5b6ef5] to-[#6c5ce7] bg-clip-text text-transparent">
            {lang === "fr" ? "Réalise tes rêves" : "Dream Big"}
          </span>
        </motion.h1>

        <motion.p initial="hidden" animate="show" custom={3} variants={fade}
          className="text-base max-w-md mb-8 leading-relaxed"
          style={{ color: "var(--control-text)", opacity: 0.55 }}>
          {lang === "fr"
            ? "Achetez un pass, générez des revenus quotidiens en FCFA, retirez via Mobile Money. Simple, rapide, accessible partout en Afrique."
            : "Buy a pass, earn daily revenue in FCFA, withdraw via Mobile Money. Simple, fast, accessible across Africa."}
        </motion.p>

        <motion.div initial="hidden" animate="show" custom={4} variants={fade} className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-sm">
          <Link href="/register" className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#5b6ef5] to-[#6c5ce7] text-white font-semibold py-3.5 px-6 rounded-2xl hover:opacity-90 transition-all touch-manipulation shadow-lg shadow-[#5b6ef5]/25">
            {lang === "fr" ? "S'inscrire" : "Sign up"} <ArrowRight size={16} />
          </Link>
          <Link href="/login" className="flex-1 flex items-center justify-center gap-2 font-semibold py-3.5 px-6 rounded-2xl transition-all touch-manipulation"
            style={{ background: "var(--control-bg)", border: "1px solid var(--control-border)", color: "var(--control-text)" }}>
            {lang === "fr" ? "Se connecter" : "Sign in"}
          </Link>
        </motion.div>
      </section>

      {/* Stats */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} custom={0} variants={fade}
        className="px-4 pb-12 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="text-center p-4 rounded-2xl" style={{ background: "var(--surface-card)", border: "1px solid var(--control-border)" }}>
              <p className="text-xl font-display font-bold text-[#5b6ef5]">{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--control-text)", opacity: 0.5 }}>{lang === "fr" ? s.label_fr : s.label_en}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <section className="px-4 pb-16 max-w-4xl mx-auto w-full">
        <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-xl font-display font-bold text-center mb-6"
          style={{ color: "var(--control-text)" }}>
          {lang === "fr" ? "Comment ça marche ?" : "How does it work?"}
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="flex gap-3 p-4 rounded-2xl" style={{ background: "var(--surface-card)", border: "1px solid var(--control-border)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--control-bg)" }}>
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: "var(--control-text)" }}>{lang === "fr" ? f.title_fr : f.title_en}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--control-text)", opacity: 0.5 }}>{lang === "fr" ? f.desc_fr : f.desc_en}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="px-4 pb-12 max-w-sm mx-auto w-full text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Link href="/register" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#5b6ef5] to-[#6c5ce7] text-white font-semibold py-4 px-6 rounded-2xl hover:opacity-90 transition-all touch-manipulation shadow-lg shadow-[#5b6ef5]/25">
            <Zap size={16} />
            {lang === "fr" ? "Commencer maintenant" : "Start now"}
            <ChevronRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="text-center pb-8 px-4">
        <p className="text-xs" style={{ color: "var(--control-text)", opacity: 0.3 }}>
          © 2023 Aurevia Invest — All rights reserved
        </p>
      </footer>
    </div>
  );
}
