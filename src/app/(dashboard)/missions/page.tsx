"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, CheckCircle, Lock, Gift } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/i18n";

interface Mission { id: string; title: string; titleEn: string | null; description: string | null; type: string; target: number; reward: number; rewardType: string; period: string; userProgress: { progress: number; completed: boolean } | null; }

export default function MissionsPage() {
  const { t, lang } = useLanguage();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/missions").then(r => r.json()).then(d => { setMissions(d.missions || []); setLoading(false); });
  }, []);

  const claim = async (id: string) => {
    setClaiming(id);
    const res = await fetch(`/api/missions/${id}/claim`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      toast.success(`+${data.reward} FCFA 🎉`);
      setMissions(prev => prev.map(m => m.id === id ? { ...m, userProgress: { progress: m.target, completed: true } } : m));
    } else {
      toast.error(data.error);
    }
    setClaiming(null);
  };

  const typeLabel = (type: string) => ({ invest: t("mission_type_invest"), invite: t("mission_type_invite"), task: t("mission_type_task"), daily: t("mission_type_daily"), weekly: t("mission_type_weekly") }[type] || type);

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-semibold text-[#e23744] uppercase tracking-widest mb-1">{t("missions_kicker")}</p>
        <h1 className="text-2xl font-display font-bold text-white">{t("missions_title")}</h1>
        <p className="text-white/40 text-sm mt-1">{t("missions_sub")}</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 glass-card rounded-2xl animate-pulse" />)}</div>
      ) : missions.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <Target size={36} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40">{t("missions_empty")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {missions.map((m, i) => {
            const progress = m.userProgress?.progress || 0;
            const completed = m.userProgress?.completed || false;
            const pct = Math.min(100, Math.round((progress / m.target) * 100));
            const name = lang === "en" && m.titleEn ? m.titleEn : m.title;

            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold text-[#e23744] bg-[#e23744]/10 px-2 py-0.5 rounded-full">{typeLabel(m.type)}</span>
                      {completed && <CheckCircle size={14} className="text-emerald-400" />}
                    </div>
                    <p className="font-semibold text-white text-sm">{name}</p>
                    {m.description && <p className="text-white/40 text-xs mt-0.5 line-clamp-2">{m.description}</p>}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-white/40 mb-1">
                        <span>{progress.toLocaleString()} / {m.target.toLocaleString()}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#e23744] to-[#b51d2c] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-white/30">{t("missions_reward")}</p>
                      <p className="font-bold text-[#f59e0b] text-sm">+{m.reward.toLocaleString()} FCFA</p>
                    </div>
                    {completed ? (
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-xl">{t("missions_done")}</span>
                    ) : pct >= 100 ? (
                      <button onClick={() => claim(m.id)} disabled={claiming === m.id}
                        className="text-xs font-semibold bg-gradient-to-r from-[#e23744] to-[#b51d2c] text-white px-3 py-1.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
                        {claiming === m.id ? "..." : t("missions_claim")}
                      </button>
                    ) : (
                      <span className="text-xs text-white/20 flex items-center gap-1"><Lock size={11} /> {t("missions_locked")}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
