"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Star, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface Entry { id: string; name: string; totalInvested: number; totalEarnings: number; level: number; isVerified: boolean; rank: number; }

const MEDAL_COLORS = ["#f59e0b", "#9ca3af", "#b45309"];

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<{ leaderboard: Entry[]; myRank: Entry | null } | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard").then(r => r.json()).then(setData);
  }, []);

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-semibold text-[#f59e0b] uppercase tracking-widest mb-1">{t("lb_kicker")}</p>
        <h1 className="text-2xl font-display font-bold text-white">{t("lb_title")}</h1>
        <p className="text-white/40 text-sm mt-1">{t("lb_sub")}</p>
      </div>

      {/* My rank banner */}
      {data?.myRank && (
        <div className="glass-card rounded-2xl p-4 mb-6 flex items-center gap-4 border border-[#3b6fd4]/20">
          <div className="w-10 h-10 bg-[#3b6fd4]/20 rounded-xl flex items-center justify-center font-bold text-[#3b6fd4]">#{data.myRank.rank}</div>
          <div className="flex-1">
            <p className="font-semibold text-white text-sm">{t("lb_my_rank")}</p>
            <p className="text-white/40 text-xs">{data.myRank.totalInvested.toLocaleString()} FCFA {t("lb_invested")}</p>
          </div>
          <Star size={18} className="text-[#f59e0b]" />
        </div>
      )}

      {/* Top 3 podium */}
      {data && data.leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[data.leaderboard[1], data.leaderboard[0], data.leaderboard[2]].map((u, i) => {
            const positions = [1, 0, 2];
            const sizes = ["pt-4", "pt-0", "pt-6"];
            return u ? (
              <div key={u.id} className={`glass-card rounded-2xl p-4 text-center ${sizes[i]}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 font-bold text-lg`} style={{ background: `${MEDAL_COLORS[positions[i]]}20`, color: MEDAL_COLORS[positions[i]] }}>
                  {positions[i] === 0 ? "🥇" : positions[i] === 1 ? "🥈" : "🥉"}
                </div>
                <p className="text-white font-semibold text-xs truncate">{u.name.split(" ")[0]}</p>
                <p className="text-white/40 text-[10px]">Niv.{u.level}</p>
                <p className="text-[#f59e0b] text-xs font-bold mt-1">{(u.totalInvested / 1000).toFixed(0)}k</p>
              </div>
            ) : <div key={i} />;
          })}
        </div>
      )}

      {/* Full list */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {!data ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-[#3b6fd4] border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : (
          <div className="divide-y divide-white/5">
            {data.leaderboard.map((u, i) => (
              <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-8 text-center font-bold text-sm" style={{ color: i < 3 ? MEDAL_COLORS[i] : "rgba(255,255,255,0.3)" }}>
                  {i < 3 ? ["🥇","🥈","🥉"][i] : `#${u.rank}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-white text-sm truncate">{u.name}</span>
                    {u.isVerified && <ShieldCheck size={12} className="text-[#3b6fd4] flex-shrink-0" />}
                    <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded-full flex-shrink-0">Niv.{u.level}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{u.totalInvested.toLocaleString()}</p>
                  <p className="text-[10px] text-white/30">FCFA</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
