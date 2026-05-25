"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Chrome, Apple } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); setLoading(false); return; }
      toast.success(t("auth_login_title") + " !");
      router.push("/dashboard");
    } catch {
      toast.error("Erreur de connexion");
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
        <h1 className="text-2xl font-display font-bold text-white">Aurevia Invest</h1>
        <p className="text-white/40 text-sm mt-1">Investissez intelligemment</p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-display font-bold text-white mb-1">{t("auth_login_title")}</h2>
        <p className="text-white/40 text-sm mb-6">{t("auth_login_sub")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t("auth_email")} type="email" placeholder="votre@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={15} />} error={errors.email} required />
          <Input label={t("auth_password")} type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            value={password} onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={15} />} error={errors.password} required />
          <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-[#3b6fd4] hover:text-blue-300 transition-colors">
              {t("auth_forgot")}
            </Link>
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" loading={loading}>
            {t("auth_submit_login")}
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/8" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#0c1428] px-3 text-xs text-white/30">{t("auth_or")}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 p-3 rounded-xl border border-white/10 bg-white/4 hover:bg-white/8 transition-colors text-sm text-white/70 font-medium">
            <Chrome size={15} /> Google
          </button>
          <button className="flex items-center justify-center gap-2 p-3 rounded-xl border border-white/10 bg-white/4 hover:bg-white/8 transition-colors text-sm text-white/70 font-medium">
            <Apple size={15} /> Apple
          </button>
        </div>
      </div>

      <p className="text-center text-white/40 text-sm mt-5">
        {t("auth_no_account")}{" "}
        <Link href="/register" className="text-[#3b6fd4] hover:text-blue-300 font-semibold transition-colors">
          {t("auth_signup")}
        </Link>
      </p>
    </motion.div>
  );
}
