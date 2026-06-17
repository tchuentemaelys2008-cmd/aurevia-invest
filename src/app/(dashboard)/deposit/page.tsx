"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Smartphone, Globe, CreditCard, Wallet, ShieldCheck, Shield } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

const REGIONS = [
  { code: "CM", name: "Cameroun", nameEn: "Cameroon", rail: "FAPSHI" as const, icon: Smartphone, descFr: "MTN & Orange Money", descEn: "MTN & Orange Money" },
  { code: "AFRICA", name: "Afrique", nameEn: "Africa", rail: "GENIUSPAY" as const, icon: Globe, descFr: "Orange, MTN, Wave, Moov, carte", descEn: "Orange, MTN, Wave, Moov, card" },
  { code: "INTL", name: "International", nameEn: "International", rail: "GENIUSPAY" as const, icon: CreditCard, descFr: "Carte bancaire (Visa, Mastercard)", descEn: "Bank card (Visa, Mastercard)" },
];

const QUICK = [1000, 5000, 10000, 25000, 50000];

export default function DepositPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const fr = lang === "fr";
  const [amount, setAmount] = useState("");
  const [region, setRegion] = useState<typeof REGIONS[0] | null>(null);
  const [loading, setLoading] = useState(false);

  const amt = parseFloat(amount) || 0;

  const pay = async () => {
    if (amt < 500) { toast.error(fr ? "Montant minimum : 500 FCFA" : "Minimum: 500 FCFA"); return; }
    if (!region) { toast.error(fr ? "Choisissez un moyen de paiement" : "Choose a payment method"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, paymentMethod: region.rail, country: region.code }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Erreur"); setLoading(false); return; }
      if (!data.paymentUrl) { toast.error(fr ? "Aucune URL de paiement reçue" : "No payment URL"); setLoading(false); return; }
      toast.success(fr ? "Redirection..." : "Redirecting...");
      if (data.paymentUrl.startsWith("http")) window.location.href = data.paymentUrl;
      else router.push(data.paymentUrl);
    } catch {
      toast.error("Erreur");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-8 pb-10 space-y-5">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-white/40 text-xs mb-0.5">{fr ? "Recharger" : "Top up"}</p>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Wallet size={22} className="text-[#e23744]" /> {fr ? "Dépôt" : "Deposit"}
        </h1>
        <p className="text-sm text-white/50 mt-1">
          {fr ? "Ajoutez de l'argent à votre solde pour acheter vos pass en un clic." : "Add money to your balance to buy passes in one click."}
        </p>
      </motion.div>

      {/* Amount */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="space-y-3">
          <label className="text-sm font-medium text-white/70">{fr ? "Montant (FCFA)" : "Amount (FCFA)"}</label>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="5000"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl font-display font-bold text-white placeholder:text-white/25 focus:outline-none focus:border-[#e23744]/50"
          />
          <div className="flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button key={q} onClick={() => setAmount(String(q))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${amt === q ? "bg-[#e23744] text-white border-[#e23744]" : "bg-white/5 text-white/60 border-white/10 hover:border-[#e23744]/40"}`}>
                +{formatCurrency(q)}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Method */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <p className="font-display font-bold text-white mb-2">{fr ? "Moyen de paiement" : "Payment method"}</p>
        <div className="space-y-2">
          {REGIONS.map((r) => (
            <button key={r.code} onClick={() => setRegion(r)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${region?.code === r.code ? "border-[#e23744]/50 bg-[#e23744]/10" : "border-white/8 bg-white/4 hover:bg-white/7"}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e23744] to-[#b51d2c] flex items-center justify-center text-white flex-shrink-0">
                <r.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-semibold">{fr ? r.name : r.nameEn}</p>
                <p className="text-xs text-white/45 truncate">{fr ? r.descFr : r.descEn}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${region?.code === r.code ? "border-[#e23744]" : "border-white/20"}`}>
                {region?.code === r.code && <div className="w-2 h-2 bg-[#e23744] rounded-full" />}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      <Button variant="primary" size="lg" className="w-full" loading={loading} onClick={pay}>
        <ShieldCheck size={18} /> {fr ? "Payer" : "Pay"} {amt > 0 ? `· ${formatCurrency(amt)}` : ""}
      </Button>
      <p className="text-[11px] text-white/30 text-center flex items-center justify-center gap-1">
        <Shield size={11} /> {fr ? "Paiement 100% sécurisé · solde crédité après confirmation" : "100% secure · balance credited after confirmation"}
      </p>
    </div>
  );
}
