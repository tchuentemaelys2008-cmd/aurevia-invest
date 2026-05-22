"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Withdrawal {
  id: string; amount: number; method: string; accountInfo: string;
  status: string; createdAt: string;
  user: { name: string; email: string };
}

const statusStyles: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-400/10",
  APPROVED: "text-emerald-400 bg-emerald-400/10",
  REJECTED: "text-red-400 bg-red-400/10",
  PROCESSED: "text-blue-400 bg-blue-400/10",
};

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/withdrawals");
    const data = await res.json();
    setWithdrawals(data.withdrawals || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setProcessing(id);
    const res = await fetch("/api/admin/withdrawals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withdrawalId: id, status }),
    });
    if (res.ok) {
      setWithdrawals((prev) => prev.map((w) => w.id === id ? { ...w, status } : w));
      toast.success(status === "APPROVED" ? "Retrait approuvé" : "Retrait refusé");
    } else toast.error("Erreur");
    setProcessing(null);
  };

  const pending = withdrawals.filter((w) => w.status === "PENDING");
  const processed = withdrawals.filter((w) => w.status !== "PENDING");

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Demandes de retrait</h1>
        <p className="text-white/40 text-sm">{pending.length} en attente d'approbation</p>
      </motion.div>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-yellow-400/80 uppercase tracking-wider mb-3">En attente</h2>
          <div className="space-y-3">
            {pending.map((w) => (
              <motion.div key={w.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                className="bg-[#0c1428] rounded-2xl border border-yellow-500/15 p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white">{w.user.name}</p>
                    <span className="text-xs text-white/40">{w.user.email}</span>
                  </div>
                  <p className="text-xs text-white/40">
                    {w.method} — {w.accountInfo} — {formatDate(w.createdAt)}
                  </p>
                </div>
                <p className="text-xl font-display font-bold text-white mr-2">{formatCurrency(w.amount)}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" loading={processing === w.id}
                    onClick={() => updateStatus(w.id, "APPROVED")} className="!px-3 !py-1.5 !rounded-xl gap-1.5">
                    <CheckCircle size={14} /> Approuver
                  </Button>
                  <Button size="sm" variant="danger" loading={processing === w.id}
                    onClick={() => updateStatus(w.id, "REJECTED")} className="!px-3 !py-1.5 !rounded-xl gap-1.5">
                    <XCircle size={14} /> Refuser
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Historique</h2>
        <div className="bg-[#0c1428] rounded-2xl border border-white/8 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
          ) : processed.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">Aucun historique</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Utilisateur", "Montant", "Méthode", "Compte", "Statut", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-white/40 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {processed.map((w) => (
                  <tr key={w.id} className="hover:bg-white/2">
                    <td className="px-4 py-3">
                      <p className="text-sm text-white">{w.user.name}</p>
                      <p className="text-xs text-white/30">{w.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-white">{formatCurrency(w.amount)}</td>
                    <td className="px-4 py-3 text-sm text-white/60">{w.method}</td>
                    <td className="px-4 py-3 text-xs text-white/40 max-w-[120px] truncate">{w.accountInfo}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[w.status] || "text-white/30 bg-white/5"}`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/30">{formatDate(w.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
