"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import { Suspense } from "react";

function RegisterForm() {
  const router = useRouter();
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
      toast.success("Compte créé avec succès !");
      router.push("/dashboard");
    } catch {
      toast.error("Erreur d'inscription");
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-[#3b6fd4] to-[#6c4de6] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(59,111,212,0.4)]">
          <span className="text-white font-display font-bold text-2xl">A</span>
        </div>
        <h1 className="text-2xl font-display font-bold text-white">S'inscrire</h1>
        <p className="text-white/40 text-sm mt-1">Créez votre compte</p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nom complet" type="text" placeholder="Jean Dupont" value={form.name} onChange={(e) => set("name", e.target.value)} icon={<User size={15} />} required />
          <Input label="Email" type="email" placeholder="votre@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} icon={<Mail size={15} />} required />
          <Input label="Numéro de téléphone" type="tel" placeholder="+237 6XX XXX XXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} icon={<Phone size={15} />} />
          <Input label="Mot de passe" type="password" placeholder="Min. 8 caractères" value={form.password} onChange={(e) => set("password", e.target.value)} icon={<Lock size={15} />} required />
          <Input label="Confirmer le mot de passe" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} icon={<Lock size={15} />} required />
          {refCode && <p className="text-xs text-emerald-400 bg-emerald-400/10 px-3 py-2 rounded-xl">✓ Code de parrainage: {refCode}</p>}

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-[#3b6fd4]" />
            <span className="text-xs text-white/50">
              J'accepte les{" "}
              <Link href="/terms" className="text-[#3b6fd4] hover:underline">Conditions d'utilisation</Link>{" "}et la{" "}
              <Link href="/privacy" className="text-[#3b6fd4] hover:underline">Politique de confidentialité</Link>
            </span>
          </label>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            Créer un compte
          </Button>
        </form>
      </div>

      <p className="text-center text-white/40 text-sm mt-5">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-[#3b6fd4] hover:text-blue-300 font-semibold transition-colors">
          Se connecter
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
