"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Clock, History as HistoryIcon } from "lucide-react";
import Card from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface WalletData {
  transactions: Array<{ id: string; type: string; amount: number; description: string; createdAt: string; status: string }>;
  withdrawals: Array<{ id: string; amount: number; method: string; status: string; createdAt: string }>;
}

type Row = {
  id: string;
  label: string;
  sub: string;
  amount: number;
  credit: boolean;
  status: string;
  createdAt: string;
};

const statusStyle = (status: string) => {
  const s = status.toUpperCase();
  if (["SUCCESS", "APPROVED", "PROCESSED", "COMPLETED"].includes(s)) return "text-emerald-400 bg-emerald-400/10";
  if (["PENDING"].includes(s)) return "text-yellow-400 bg-yellow-400/10";
  return "text-red-400 bg-red-400/10";
};

export default function HistoryPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const fr = lang === "fr";
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "pending">("all");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/wallet");
      if (res.status === 401) { router.push("/login"); return; }
      setData(await res.json());
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <div className="p-6 space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>;
  if (!data) return null;

  const statusLabel = (s: string) => {
    const u = s.toUpperCase();
    if (!fr) return u;
    return { PENDING: "En attente", SUCCESS: "Réussi", APPROVED: "Approuvé", PROCESSED: "Traité", REJECTED: "Rejeté", FAILED: "Échoué", CANCELLED: "Annulé" }[u] || u;
  };

  const txLabel: Record<string, string> = {
    PASS_PURCHASE: t("tx_PASS_PURCHASE"), DAILY_EARNING: t("tx_DAILY_EARNING"),
    TASK_REWARD: t("tx_TASK_REWARD"), AFFILIATE_COMMISSION: t("tx_AFFILIATE_COMMISSION"),
    WITHDRAWAL: t("tx_WITHDRAWAL"), REFERRAL_BONUS: t("tx_REFERRAL_BONUS"),
  };

  // Money movements only: deposits/payments (transactions) + withdrawals.
  const moneyTypes = ["PASS_PURCHASE", "DEPOSIT", "WITHDRAWAL"];
  const txRows: Row[] = (data.transactions || [])
    .filter((tx) => moneyTypes.includes(tx.type))
    .map((tx) => ({
      id: "tx-" + tx.id,
      label: tx.type === "DEPOSIT" ? (fr ? "Dépôt / Recharge" : "Deposit / Top-up") : (txLabel[tx.type] || tx.type),
      sub: tx.description,
      amount: Math.abs(tx.amount),
      credit: tx.amount > 0,
      status: tx.status,
      createdAt: tx.createdAt,
    }));

  const wRows: Row[] = (data.withdrawals || []).map((w) => ({
    id: "wd-" + w.id,
    label: fr ? "Retrait" : "Withdrawal",
    sub: w.method,
    amount: Math.abs(w.amount),
    credit: false,
    status: w.status,
    createdAt: w.createdAt,
  }));

  let rows = [...txRows, ...wRows].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  if (tab === "pending") rows = rows.filter((r) => r.status.toUpperCase() === "PENDING");

  const pendingCount = [...txRows, ...wRows].filter((r) => r.status.toUpperCase() === "PENDING").length;

  return (
    <div className="max-w-xl mx-auto px-4 pt-8 pb-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <p className="text-white/40 text-xs mb-0.5">{fr ? "Mouvements" : "Movements"}</p>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <HistoryIcon size={22} className="text-[#e23744]" /> {fr ? "Historique" : "History"}
        </h1>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("all")} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${tab === "all" ? "bg-[#e23744] text-white" : "bg-white/5 text-white/50"}`}>
          {fr ? "Tout" : "All"}
        </button>
        <button onClick={() => setTab("pending")} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${tab === "pending" ? "bg-yellow-400 text-black" : "bg-white/5 text-white/50"}`}>
          <Clock size={14} /> {fr ? "En attente" : "Pending"}
          {pendingCount > 0 && <span className={`text-[10px] font-bold px-1.5 rounded-full ${tab === "pending" ? "bg-black/20" : "bg-yellow-400/20 text-yellow-400"}`}>{pendingCount}</span>}
        </button>
      </div>

      <Card className="divide-y divide-white/5">
        {rows.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-10">
            {tab === "pending" ? (fr ? "Aucune opération en attente." : "Nothing pending.") : (fr ? "Aucun mouvement pour l'instant." : "No movements yet.")}
          </p>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${r.credit ? "bg-emerald-400/10" : "bg-red-400/10"}`}>
                {r.credit ? <ArrowDownRight size={16} className="text-emerald-400" /> : <ArrowUpRight size={16} className="text-red-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-semibold truncate">{r.label}</p>
                <p className="text-xs text-white/35 truncate">{r.sub} · {formatDate(r.createdAt)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-bold ${r.credit ? "text-emerald-400" : "text-white/70"}`}>
                  {r.credit ? "+" : "-"}{formatCurrency(r.amount)}
                </p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusStyle(r.status)}`}>{statusLabel(r.status)}</span>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
