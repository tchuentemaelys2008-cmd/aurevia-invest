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
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
    toast.success("Email envoyé !");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-[#3b6fd4] to-[#6c4de6] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(59,111,212,0.4)]">
          <span className="text-white font-display font-bold text-2xl">A</span>
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
            <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-[#3b6fd4] hover:text-blue-300 transition-colors">
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
        <Link href="/login" className="flex items-center justify-center gap-1.5 text-[#3b6fd4] hover:text-blue-300 transition-colors">
          <ArrowLeft size={14} /> {t("auth_forgot_back")}
        </Link>
      </p>
    </motion.div>
  );
}
