"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BadgeCheck, Zap, Headphones, Users, TrendingUp, Check, Wallet } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

const BADGE_PRICE = 1000;

export default function VerificationPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const fr = lang === "fr";
  const [balance, setBalance] = useState(0);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.status === 401) { router.push("/login"); return; }
      const json = await res.json();
      setBalance(json.user?.balance ?? 0);
      setVerified(!!json.user?.isVerified);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const perks = [
    { icon: Zap, title: fr ? "Retraits prioritaires" : "Priority withdrawals", desc: fr ? "Vos demandes de retrait sont traitées en priorité." : "Your withdrawal requests are processed first." },
    { icon: Headphones, title: fr ? "Support prioritaire" : "Priority support", desc: fr ? "Vos tickets passent en tête de file chez les admins." : "Your tickets jump to the top of the admin queue." },
    { icon: Users, title: fr ? "+5% de parrainage" : "+5% referral", desc: fr ? "Touchez 15% au lieu de 10% sur les investissements de vos filleuls." : "Earn 15% instead of 10% on your referrals' investments." },
    { icon: TrendingUp, title: fr ? "+10% de gains" : "+10% earnings", desc: fr ? "Un bonus de 10% sur tous vos revenus journaliers de pass." : "A 10% bonus on all your daily pass earnings." },
  ];

  const buy = async () => {
    setBuying(true);
    try {
      const res = await fetch("/api/verification/buy", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        if (data.needTopUp) {
          toast.error(fr ? "Solde insuffisant — rechargez votre compte." : "Insufficient balance — top up first.");
          router.push("/deposit");
          return;
        }
        toast.error(data.error || "Erreur");
        return;
      }
      toast.success(fr ? "Compte vérifié ! 🎉" : "Account verified! 🎉");
      setVerified(true);
      load();
    } catch {
      toast.error("Erreur");
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <div className="p-6 space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>;

  return (
    <div className="max-w-xl mx-auto px-4 pt-8 pb-10 space-y-5">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative rounded-3xl overflow-hidden p-7 text-center"
          style={{ background: "linear-gradient(145deg, #3b6fd4 0%, #2d5bcc 58%, #1e3a8a 100%)", color: "#fff", boxShadow: "0 18px 40px rgba(59,111,212,0.35)" }}>
          <div className="absolute -top-12 -right-10 w-44 h-44 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.14)", filter: "blur(40px)" }} />
          <div className="relative w-16 h-16 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-3">
            <BadgeCheck size={34} style={{ color: "#fff" }} />
          </div>
          <h1 className="relative text-2xl font-display font-bold" style={{ color: "#fff" }}>
            {fr ? "Badge de vérification" : "Verification badge"}
          </h1>
          <p className="relative text-sm mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>
            {verified
              ? (fr ? "Votre compte est vérifié ✅" : "Your account is verified ✅")
              : (fr ? "Débloquez tous les avantages premium" : "Unlock all the premium perks")}
          </p>
        </div>
      </motion.div>

      {/* Perks */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid sm:grid-cols-2 gap-3">
        {perks.map((p) => (
          <Card key={p.title} className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3b6fd4]/15 flex items-center justify-center text-[#3b6fd4] flex-shrink-0">
              <p.icon size={18} />
            </div>
            <div>
              <p className="font-semibold text-white text-sm flex items-center gap-1.5">{p.title}</p>
              <p className="text-xs text-white/50 leading-relaxed mt-0.5">{p.desc}</p>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Buy */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        {verified ? (
          <Card className="text-center py-8 space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-400/10 flex items-center justify-center">
              <Check size={28} className="text-emerald-400" />
            </div>
            <p className="font-display font-bold text-white">{fr ? "Vous êtes vérifié" : "You are verified"}</p>
            <p className="text-sm text-white/50">{fr ? "Tous les avantages premium sont actifs sur votre compte." : "All premium perks are active on your account."}</p>
          </Card>
        ) : (
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50">{fr ? "Prix unique" : "One-time price"}</p>
                <p className="text-3xl font-display font-bold text-white">{formatCurrency(BADGE_PRICE)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40 flex items-center gap-1 justify-end"><Wallet size={12} /> {fr ? "Votre solde" : "Your balance"}</p>
                <p className={`font-bold ${balance >= BADGE_PRICE ? "text-emerald-400" : "text-red-400"}`}>{formatCurrency(balance)}</p>
              </div>
            </div>
            {balance >= BADGE_PRICE ? (
              <Button variant="primary" size="lg" className="w-full" loading={buying} onClick={buy}>
                <BadgeCheck size={18} /> {fr ? "Acheter le badge" : "Buy the badge"}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="w-full py-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm text-center font-medium">
                  {fr ? "Solde insuffisant" : "Insufficient balance"}
                </div>
                <Button variant="secondary" size="lg" className="w-full" onClick={() => router.push("/deposit")}>
                  <Wallet size={18} /> {fr ? "Recharger mon solde" : "Top up my balance"}
                </Button>
              </div>
            )}
            <p className="text-[11px] text-white/30 text-center">{fr ? "Le montant est débité de votre solde." : "The amount is debited from your balance."}</p>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
