"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, ImageIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Payment {
  id: string; reference: string; amount: number; status: string; createdAt: string;
  metadata: { proofBase64?: string; proofName?: string; submittedAt?: string } | null;
  user: { name: string; email: string };
}

const statusStyles: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-400/10",
  SUCCESS: "text-emerald-400 bg-emerald-400/10",
  FAILED: "text-red-400 bg-red-400/10",
};
const statusLabel: Record<string, string> = {
  PENDING: "En attente", SUCCESS: "Approuvé", FAILED: "Refusé",
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/payments");
    const data = await res.json();
    setPayments(data.payments || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handle = async (reference: string, action: "approve" | "reject") => {
    setProcessing(reference);
    const res = await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, action }),
    });
    if (res.ok) {
      toast.success(action === "approve" ? "Pass activé !" : "Paiement refusé");
      setPayments((prev) => prev.map((p) => p.reference === reference ? { ...p, status: action === "approve" ? "SUCCESS" : "FAILED" } : p));
    } else toast.error("Erreur");
    setProcessing(null);
  };

  const pending = payments.filter((p) => p.status === "PENDING");
  const done = payments.filter((p) => p.status !== "PENDING");

  return (
    <div className="p-4 lg:p-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-xl font-display font-bold text-white">Virements bancaires</h1>
        <p className="text-white/40 text-sm">{pending.length} en attente de validation</p>
      </motion.div>

      {/* Image preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setPreview(null)}>
          <img src={preview} alt="Preuve de paiement" className="max-w-lg max-h-[80vh] rounded-2xl object-contain" />
        </div>
      )}

      {pending.length > 0 && (
        <div className="mb-6 space-y-3">
          <h2 className="text-xs font-semibold text-yellow-400/80 uppercase tracking-wider">En attente</h2>
          {pending.map((p) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              className="bg-[#0c1428] rounded-2xl border border-yellow-500/15 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{p.user.name}</p>
                  <p className="text-xs text-white/40 mb-1">{p.user.email}</p>
                  <p className="text-xs text-white/30">Réf: {p.reference} · {formatDate(p.createdAt)}</p>
                </div>
                <p className="text-xl font-display font-bold text-white">{formatCurrency(p.amount)}</p>
              </div>
              {p.metadata?.proofBase64 && (
                <button onClick={() => setPreview(p.metadata!.proofBase64!)}
                  className="mt-3 flex items-center gap-2 text-xs text-[#5b6ef5] hover:text-blue-300 transition-colors">
                  <ImageIcon size={13} /> Voir la preuve de paiement
                </button>
              )}
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="primary" loading={processing === p.reference}
                  onClick={() => handle(p.reference, "approve")} className="!px-3 !py-1.5 !rounded-xl gap-1.5">
                  <CheckCircle size={13} /> Approuver
                </Button>
                <Button size="sm" variant="danger" loading={processing === p.reference}
                  onClick={() => handle(p.reference, "reject")} className="!px-3 !py-1.5 !rounded-xl gap-1.5">
                  <XCircle size={13} /> Refuser
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Historique</h2>
        <div className="bg-[#0c1428] rounded-2xl border border-white/8 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
          ) : done.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">Aucun historique</p>
          ) : (
            <div className="divide-y divide-white/5">
              {done.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{p.user.name}</p>
                    <p className="text-xs text-white/30">{p.reference} · {formatDate(p.createdAt)}</p>
                  </div>
                  <p className="text-sm font-bold text-white">{formatCurrency(p.amount)}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[p.status] || "text-white/30 bg-white/5"}`}>
                    {statusLabel[p.status] || p.status}
                  </span>
                  {p.metadata?.proofBase64 && (
                    <button onClick={() => setPreview(p.metadata!.proofBase64!)} className="text-white/30 hover:text-white transition-colors">
                      <ImageIcon size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
