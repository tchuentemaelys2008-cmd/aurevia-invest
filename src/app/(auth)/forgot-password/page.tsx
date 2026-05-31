"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur serveur");
        return;
      }
      setSent(true);
      toast.success("Email envoyÃ© !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="text-center mb-8">
        <div className="w-32 h-32 rounded-2xl mx-auto mb-4 shadow-[0_0_60px_rgba(91,110,245,0.45)] overflow-hidden border border-white/10">
          <img src="/photo_2026-05-25_14-14-19.jpg" alt="Aurevia Invest" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white">{t("auth_forgot_title")}</h1>
        <p className="text-white/40 text-sm mt-1">{t("auth_forgot_sub")}</p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Send size={28} className="text-emerald-400" />
            </div>
            <h2 className="text-lg font-display font-bold text-white mb-2">{t("auth_forgot_sent_title")}</h2>
            <p className="text-white/50 text-sm mb-6">
              {email}
            </p>
            <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-[#5b6ef5] hover:text-blue-300 transition-colors">
              <ArrowLeft size={14} /> {t("auth_forgot_back")}
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-display font-bold text-white mb-1">{t("auth_forgot_title")}</h2>
            <p className="text-white/40 text-sm mb-6">{t("auth_reset_sub")}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label={t("auth_forgot_label")} type="email" placeholder="votre@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail size={15} />} required />
              <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
                {t("auth_forgot_btn")}
              </Button>
            </form>
          </>
        )}
      </div>

      <p className="text-center text-white/40 text-sm mt-5">
        <Link href="/login" className="flex items-center justify-center gap-1.5 text-[#5b6ef5] hover:text-blue-300 transition-colors">
          <ArrowLeft size={14} /> {t("auth_forgot_back")}
        </Link>
      </p>
    </motion.div>
  );
}
