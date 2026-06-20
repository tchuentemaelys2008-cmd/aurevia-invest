"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, TrendingUp, Users, Zap, Lock, HeartHandshake, Globe, LifeBuoy } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import WhatsAppChannelCard from "@/components/ui/WhatsAppChannelCard";
import { useLanguage } from "@/lib/i18n";

export default function AboutPage() {
  const { lang } = useLanguage();
  const fr = lang === "fr";

  const values = [
    {
      icon: TrendingUp,
      title: fr ? "Revenus quotidiens" : "Daily returns",
      desc: fr
        ? "Nos passes d'investissement génèrent un rendement chaque jour, crédité automatiquement sur votre solde."
        : "Our investment passes generate a return every day, automatically credited to your balance.",
    },
    {
      icon: ShieldCheck,
      title: fr ? "Sécurité & transparence" : "Security & transparency",
      desc: fr
        ? "Paiements sécurisés, historique clair de chaque opération et retraits traçables à tout moment."
        : "Secure payments, a clear history of every operation and traceable withdrawals at all times.",
    },
    {
      icon: Users,
      title: fr ? "Parrainage récompensé" : "Rewarded referrals",
      desc: fr
        ? "Invitez vos proches et touchez une commission sur leurs investissements."
        : "Invite your friends and earn a commission on their investments.",
    },
    {
      icon: Zap,
      title: fr ? "Activation instantanée" : "Instant activation",
      desc: fr
        ? "Dès le paiement confirmé, votre pass est actif et commence à produire des gains."
        : "As soon as the payment is confirmed, your pass is active and starts producing gains.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 pt-8 pb-10 space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative rounded-3xl overflow-hidden p-7"
          style={{ background: "linear-gradient(145deg, #3b6fd4 0%, #2d5bcc 58%, #1e3a8a 100%)", color: "#fff", boxShadow: "0 18px 40px rgba(59,111,212,0.35)" }}>
          <div className="absolute -top-12 -right-10 w-44 h-44 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.14)", filter: "blur(40px)" }} />
          <div className="flex items-center gap-3 mb-4">
            <img src="/photo_2026-05-25_14-14-19.jpg" alt="Aurevia" className="w-14 h-14 rounded-2xl object-cover border border-white/20" />
            <div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>{fr ? "À propos de" : "About"}</p>
              <h1 className="text-2xl font-display font-bold" style={{ color: "#fff" }}>Aurevia Invest</h1>
            </div>
          </div>
          <p className="relative text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
            {fr
              ? "Aurevia Invest est une plateforme d'investissement digital qui rend les revenus passifs simples et accessibles. Choisissez un pass, payez en toute sécurité, et laissez vos gains s'accumuler jour après jour."
              : "Aurevia Invest is a digital investment platform that makes passive income simple and accessible. Pick a pass, pay securely, and let your gains grow day after day."}
          </p>
        </div>
      </motion.div>

      {/* Values */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid sm:grid-cols-2 gap-3">
        {values.map((v) => (
          <Card key={v.title} className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#3b6fd4]/15 flex items-center justify-center text-[#3b6fd4]">
              <v.icon size={20} />
            </div>
            <p className="font-display font-bold text-white">{v.title}</p>
            <p className="text-sm text-white/55 leading-relaxed">{v.desc}</p>
          </Card>
        ))}
      </motion.div>

      {/* Mission */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-white">
            <HeartHandshake size={18} className="text-[#3b6fd4]" />
            <h2 className="font-display font-bold">{fr ? "Notre mission" : "Our mission"}</h2>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">
            {fr
              ? "Donner à chacun, partout en Afrique et au-delà, les outils pour faire fructifier son argent en toute confiance. Nous combinons une technologie fiable, des paiements locaux (Orange, MTN, Wave, Moov, carte bancaire) et un accompagnement humain."
              : "Give everyone, across Africa and beyond, the tools to grow their money with confidence. We combine reliable technology, local payments (Orange, MTN, Wave, Moov, bank card) and human support."}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { icon: Globe, label: fr ? "Disponible dans plusieurs pays" : "Available in several countries" },
              { icon: Lock, label: fr ? "Paiements sécurisés" : "Secure payments" },
            ].map((b) => (
              <span key={b.label} className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 bg-white/5 text-white/70 border border-white/10">
                <b.icon size={13} className="text-[#3b6fd4]" /> {b.label}
              </span>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* WhatsApp channel */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <WhatsAppChannelCard />
      </motion.div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3">
        <Link href="/passes">
          <Button variant="primary" size="lg" className="w-full">
            <TrendingUp size={18} /> {fr ? "Voir les passes" : "View passes"}
          </Button>
        </Link>
        <Link href="/support">
          <Button variant="secondary" size="lg" className="w-full">
            <LifeBuoy size={18} /> {fr ? "Contacter le support" : "Contact support"}
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
