"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, CreditCard, Smartphone } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

function PaymentSimulateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref = searchParams.get("ref") || "";
  const method = searchParams.get("method") || "fapshi";
  const amount = parseFloat(searchParams.get("amount") || "0");
  const [status, setStatus] = useState<"pending" | "processing" | "success" | "failed">("pending");
  const [loading, setLoading] = useState(false);

  const confirm = async (success: boolean) => {
    setLoading(true);
    setStatus("processing");
    await new Promise((r) => setTimeout(r, 1500)); // simulate payment delay
    if (success) {
      const res = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref }),
      });
      if (res.ok) {
        setStatus("success");
        toast.success("Paiement confirmé !");
        setTimeout(() => router.push("/dashboard"), 2500);
      } else {
        setStatus("failed");
      }
    } else {
      setStatus("failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="glass-card rounded-2xl p-6 text-center">
          {/* Provider header */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {method === "fapshi" ? <Smartphone size={20} className="text-[#3b6fd4]" /> : <CreditCard size={20} className="text-[#3b6fd4]" />}
            <span className="font-display font-bold text-white text-lg">
              {method === "fapshi" ? "FAPSHI Mobile Money" : "GeniusPay"}
            </span>
          </div>

          {/* Amount */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/8 mb-6">
            <p className="text-white/40 text-sm mb-1">Montant à payer</p>
            <p className="text-3xl font-display font-bold text-white">{formatCurrency(amount)}</p>
            <p className="text-xs text-white/30 mt-1">Réf: {ref}</p>
          </div>

          {/* Status displays */}
          {status === "pending" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#3b6fd4]/15 border-2 border-[#3b6fd4]/30 flex items-center justify-center">
                <Clock size={28} className="text-[#3b6fd4]" />
              </div>
              <p className="text-white font-semibold mb-2">En attente de paiement</p>
              <p className="text-white/40 text-sm mb-6">
                {method === "fapshi" ? "Confirmez le paiement sur votre téléphone" : "Entrez vos informations de carte"}
              </p>
              <div className="space-y-3">
                <Button variant="primary" size="lg" className="w-full" loading={loading} onClick={() => confirm(true)}>
                  ✓ Simuler paiement réussi
                </Button>
                <Button variant="danger" size="md" className="w-full" loading={loading} onClick={() => confirm(false)}>
                  ✗ Simuler échec
                </Button>
              </div>
              <p className="text-xs text-white/25 mt-3">Mode simulation — Remplacer par vraie API en production</p>
            </motion.div>
          )}

          {status === "processing" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-[#3b6fd4] border-t-transparent animate-spin" />
              <p className="text-white font-semibold">Traitement en cours...</p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-400/15 flex items-center justify-center">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <p className="text-white font-display font-bold text-xl mb-2">Paiement confirmé !</p>
              <p className="text-white/50 text-sm">Votre pass a été activé. Redirection...</p>
            </motion.div>
          )}

          {status === "failed" && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-400/15 flex items-center justify-center">
                <XCircle size={32} className="text-red-400" />
              </div>
              <p className="text-white font-display font-bold text-xl mb-2">Paiement échoué</p>
              <p className="text-white/50 text-sm mb-5">Le paiement n'a pas pu être traité.</p>
              <Button variant="primary" onClick={() => router.push("/passes")}>Réessayer</Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentSimulatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="skeleton w-80 h-80 rounded-2xl" /></div>}>
      <PaymentSimulateContent />
    </Suspense>
  );
}
