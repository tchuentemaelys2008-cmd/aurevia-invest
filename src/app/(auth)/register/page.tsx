"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, Gift } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import { Suspense } from "react";
import { useLanguage } from "@/lib/i18n";

function RegisterForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", referralCode: refCode });
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error("Les mots de passe ne correspondent pas"); return; }
    if (!agreed) { toast.error("Acceptez les conditions d'utilisation"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone || undefined, password: form.password, referralCode: form.referralCode || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); setLoading(false); return; }
      toast.success("Compte crÃ©Ã© avec succÃ¨s !");
      router.push("/dashboard");
    } catch {
      toast.error("Erreur d'inscription");
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-2xl mx-auto mb-4 shadow-[0_0_40px_rgba(59,111,212,0.4)] overflow-hidden border border-white/10 flex-shrink-0">
          <img
            src="/photo_2026-05-25_14-14-19.jpg"
            alt="Aurevia Invest"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-display font-bold text-white">{t("auth_register_title")}</h1>
        <p className="text-white/40 text-sm mt-1">{t("auth_register_sub")}</p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t("auth_name")} type="text" placeholder="Jean Dupont"
            value={form.name} onChange={(e) => set("name", e.target.value)} icon={<User size={15} />} required />
          <Input label="Email" type="email" placeholder="votre@email.com"
            value={form.email} onChange={(e) => set("email", e.target.value)} icon={<Mail size={15} />} required />
          <Input label={t("auth_phone")} type="tel" placeholder="+237 6XX XXX XXX"
            value={form.phone} onChange={(e) => set("phone", e.target.value)} icon={<Phone size={15} />} />
          <Input label={t("auth_password")} type="password" placeholder="Min. 8 caractÃ¨res"
            value={form.password} onChange={(e) => set("password", e.target.value)} icon={<Lock size={15} />} required />
          <Input label={t("auth_confirm_password")} type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} icon={<Lock size={15} />} required />
          <div>
            <Input label={t("auth_referral")} type="text" placeholder="Ex: AB12CD34"
              value={form.referralCode} onChange={(e) => set("referralCode", e.target.value.toUpperCase())} icon={<Gift size={15} />} />
            {form.referralCode && (
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <Gift size={11} /> {t("auth_referral_applied")}
              </p>
            )}
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-[#3b6fd4]" />
            <span className="text-xs text-white/50">
              {t("auth_terms")}{" "}
              <Link href="/terms" className="text-[#3b6fd4] hover:underline">{t("auth_terms_link")}</Link>{" "}
              {t("auth_and")}{" "}
              <Link href="/privacy" className="text-[#3b6fd4] hover:underline">{t("auth_privacy")}</Link>
            </span>
          </label>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            {t("auth_submit_register")}
          </Button>
        </form>
      </div>

      <p className="text-center text-white/40 text-sm mt-5">
        {t("auth_have_account")}{" "}
        <Link href="/login" className="text-[#3b6fd4] hover:text-blue-300 font-semibold transition-colors">
          {t("auth_login_link")}
        </Link>
      </p>
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="glass-card rounded-2xl p-8 skeleton" />}>
      <RegisterForm />
    </Suspense>
  );
}
