"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractÃ¨res");
      return;
    }
    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de la rÃ©initialisation");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
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
        <h1 className="text-2xl font-display font-bold text-white">Nouveau mot de passe</h1>
        <p className="text-white/40 text-sm mt-1">Choisissez un mot de passe sÃ©curisÃ©</p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        {done ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-emerald-400" />
            </div>
            <h2 className="text-lg font-display font-bold text-white mb-2">Mot de passe mis Ã  jour !</h2>
            <p className="text-white/50 text-sm mb-6">Vous allez Ãªtre redirigÃ© vers la connexionâ€¦</p>
            <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-[#5b6ef5] hover:text-blue-300 transition-colors">
              <ArrowLeft size={14} /> Se connecter maintenant
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-display font-bold text-white mb-1">RÃ©initialiser le mot de passe</h2>
            <p className="text-white/40 text-sm mb-6">Entrez et confirmez votre nouveau mot de passe.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  label="Nouveau mot de passe"
                  type={showPwd ? "text" : "password"}
                  placeholder="Minimum 8 caractÃ¨res"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={15} />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-[38px] text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Input
                label="Confirmer le mot de passe"
                type={showPwd ? "text" : "password"}
                placeholder="RÃ©pÃ©tez le mot de passe"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                icon={<Lock size={15} />}
                required
              />
              <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
                Mettre Ã  jour le mot de passe
              </Button>
            </form>
          </>
        )}
      </div>

      <p className="text-center text-white/40 text-sm mt-5">
        <Link href="/login" className="flex items-center justify-center gap-1.5 text-[#5b6ef5] hover:text-blue-300 transition-colors">
          <ArrowLeft size={14} /> Retour Ã  la connexion
        </Link>
      </p>
    </motion.div>
  );
}
