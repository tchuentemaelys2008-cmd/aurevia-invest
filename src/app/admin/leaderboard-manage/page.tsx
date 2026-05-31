"use client";

import { useEffect, useState } from "react";
import { Medal, RotateCcw, ShieldCheck, Star, Trophy } from "lucide-react";
import toast from "react-hot-toast";

interface Entry {
  id: string;
  name: string;
  email: string;
  totalInvested: number;
  totalEarnings: number;
  level: number;
  isVerified: boolean;
  rank: number;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={15} />;
  if (rank === 2) return <Medal size={15} />;
  return <Star size={15} />;
}

export default function AdminLeaderboardPage() {
  const [data, setData] = useState<Entry[]>([]);

  const load = () => fetch("/api/admin/leaderboard").then((r) => r.json()).then((d) => setData(d.leaderboard || []));
  useEffect(() => { load(); }, []);

  const reset = async () => {
    if (!confirm("Reinitialiser le classement ?")) return;
    await fetch("/api/admin/leaderboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reset" }) });
    toast.success("Classement reinitialise");
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#f59e0b]/20 rounded-xl flex items-center justify-center"><Trophy size={18} className="text-[#f59e0b]" /></div>
          <div><h1 className="font-display font-bold text-white text-lg">Classement</h1><p className="text-white/40 text-xs">Top {data.length} utilisateurs</p></div>
        </div>
        <button onClick={reset} className="flex items-center gap-2 bg-red-500/20 text-red-400 text-sm font-semibold px-4 py-2 rounded-xl border border-red-500/20 hover:bg-red-500/30 transition-all">
          <RotateCcw size={15} /> Reinitialiser
        </button>
      </div>

      <div className="bg-[var(--surface-card)] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5 text-white/40 text-xs uppercase">
            <th className="px-4 py-3 text-center w-12">#</th><th className="px-4 py-3 text-left">Utilisateur</th><th className="px-4 py-3 text-right">Investi</th><th className="px-4 py-3 text-right">Gains</th><th className="px-4 py-3 text-center">Niveau</th>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {data.slice(0, 50).map((u) => (
              <tr key={u.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-center font-bold" style={{ color: u.rank <= 3 ? ["#f59e0b", "#9ca3af", "#b45309"][u.rank - 1] : "rgba(255,255,255,0.3)" }}>
                  {u.rank <= 3 ? <span className="inline-flex justify-center"><RankIcon rank={u.rank} /></span> : `#${u.rank}`}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{u.name}</span>
                    {u.isVerified && <ShieldCheck size={12} className="text-[#5b6ef5]" />}
                  </div>
                  <p className="text-white/30 text-xs">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-white">{u.totalInvested.toLocaleString()} FCFA</td>
                <td className="px-4 py-3 text-right text-[#10b981]">{u.totalEarnings.toLocaleString()} FCFA</td>
                <td className="px-4 py-3 text-center"><span className="text-xs bg-white/5 text-white/50 px-2 py-0.5 rounded-full">Niv.{u.level}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
