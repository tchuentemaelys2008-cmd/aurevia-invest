"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, TrendingUp, ShoppingBag, ArrowDownCircle, DollarSign, Repeat2, Percent } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalDeposits: number;
  totalWithdrawals: number;
  conversionRate: number;
  activePasses: number;
  pendingWithdrawals: number;
  recentUsers: Array<{ id: string; name: string; email: string; balance: number; createdAt: string }>;
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`relative rounded-2xl p-4 bg-[#0c1428] border overflow-hidden ${color}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-white/40 uppercase tracking-wider">{title}</span>
        <div className="w-7 h-7 rounded-lg bg-white/6 flex items-center justify-center text-white/60">{icon}</div>
      </div>
      <p className="text-2xl font-display font-bold text-white">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/stats");
      if (res.status === 403) { toast.error("Accès refusé"); router.push("/login"); return; }
      const data = await res.json();
      setStats(data);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) return (
    <div className="p-8 space-y-4">
      {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
    </div>
  );
  if (!stats) return null;

  return (
    <div className="p-4 lg:p-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-xl font-display font-bold text-white">Tableau de bord Admin</h1>
        <p className="text-white/40 text-sm">Vue d'ensemble de la plateforme</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        <StatCard title="Utilisateurs" value={stats.totalUsers} icon={<Users size={18} />} color="border-blue-500/20" />
        <StatCard title="Actifs" value={stats.activeUsers} icon={<TrendingUp size={18} />} color="border-emerald-500/20" />
        <StatCard title="Revenu total" value={formatCurrency(stats.totalRevenue)} icon={<DollarSign size={18} />} color="border-purple-500/20" />
        <StatCard title="Depots" value={formatCurrency(stats.totalDeposits)} icon={<Repeat2 size={18} />} color="border-cyan-500/20" />
        <StatCard title="Conversion" value={`${stats.conversionRate}%`} icon={<Percent size={18} />} color="border-emerald-500/20" />
        <StatCard title="Retraits payes" value={formatCurrency(stats.totalWithdrawals)} icon={<ArrowDownCircle size={18} />} color="border-rose-500/20" />
        <StatCard title="Passes actifs" value={stats.activePasses} icon={<ShoppingBag size={18} />} color="border-orange-500/20" />
        <StatCard title="Retraits en attente" value={stats.pendingWithdrawals} icon={<ArrowDownCircle size={18} />} color="border-yellow-500/20" />
      </div>

      <div>
        <h2 className="font-display font-bold text-white text-sm mb-3">Nouveaux utilisateurs</h2>
        <div className="bg-[#0c1428] rounded-2xl border border-white/8 overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              {["Nom","Email","Solde","Inscrit"].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-xs text-white/40 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {stats.recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-2.5 text-sm text-white font-medium">{u.name}</td>
                  <td className="px-4 py-2.5 text-xs text-white/50">{u.email}</td>
                  <td className="px-4 py-2.5 text-sm text-emerald-400 font-semibold">{formatCurrency(u.balance)}</td>
                  <td className="px-4 py-2.5 text-xs text-white/30">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
