"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calculator } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface Pass { id: string; name: string; price: number; dailyReturn: number; duration: number; }

export default function SimulatorPage() {
  const { t } = useLanguage();
  const [passes, setPasses] = useState<Pass[]>([]);
  const [amount, setAmount] = useState(5000);
  const [days, setDays] = useState(30);
  const [dailyRate, setDailyRate] = useState(2.5);

  useEffect(() => {
    fetch("/api/passes/list").then(r => r.json()).then(d => {
      if (d.passes?.length) {
        setPasses(d.passes);
        const p = d.passes[0];
        setAmount(p.price);
        setDailyRate(p.dailyReturn);
        setDays(p.duration);
      }
    }).catch(() => {});
  }, []);

  const daily = amount * (dailyRate / 100);
  const total = daily * days;
  const roi = ((total / amount) * 100).toFixed(1);

  const chartMax = daily * days;
  const points = Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const d = Math.floor((i / 29) * days);
    return { d, val: daily * (d + 1) };
  });

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-semibold text-[#10b981] uppercase tracking-widest mb-1">{t("sim_kicker")}</p>
        <h1 className="text-2xl font-display font-bold text-white">{t("sim_title")}</h1>
        <p className="text-white/40 text-sm mt-1">{t("sim_sub")}</p>
      </div>

      <div className="glass-card rounded-2xl p-6 mb-6 space-y-5">
        <div>
          <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block">{t("sim_amount")} (FCFA)</label>
          <input type="number" min={1000} step={1000} value={amount} onChange={e => setAmount(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-semibold text-lg outline-none focus:border-[#10b981]/50" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block">{t("sim_daily_rate")} (%)</label>
            <input type="number" min={0.1} max={100} step={0.1} value={dailyRate} onChange={e => setDailyRate(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#10b981]/50" />
          </div>
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block">{t("sim_duration")} ({t("passes_days")})</label>
            <input type="number" min={1} max={365} value={days} onChange={e => setDays(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#10b981]/50" />
          </div>
        </div>

        {passes.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block">{t("sim_preset")}</label>
            <div className="flex flex-wrap gap-2">
              {passes.map(p => (
                <button key={p.id} onClick={() => { setAmount(p.price); setDailyRate(p.dailyReturn); setDays(p.duration); }}
                  className="text-xs px-3 py-1.5 rounded-xl bg-white/5 text-white/60 hover:bg-[#10b981]/10 hover:text-[#10b981] border border-white/10 hover:border-[#10b981]/30 transition-all">
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: t("sim_daily"), value: `${daily.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} FCFA`, color: "#10b981" },
          { label: t("sim_monthly"), value: `${(daily * 30).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} FCFA`, color: "#5b6ef5" },
          { label: t("sim_total"), value: `${total.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} FCFA`, color: "#f59e0b" },
          { label: "ROI", value: `+${roi}%`, color: "#6c5ce7" },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-4">
            <p className="text-xs text-white/40 mb-1">{item.label}</p>
            <p className="font-bold text-lg" style={{ color: item.color }}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Mini chart */}
      <div className="glass-card rounded-2xl p-5">
        <p className="text-sm font-semibold text-white mb-4">{t("sim_chart")}</p>
        <div className="relative h-32">
          <svg className="w-full h-full" viewBox={`0 0 300 120`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {chartMax > 0 && (
              <>
                <path
                  d={`M 0 120 ${points.map(p => `L ${(p.d / days) * 300} ${120 - (p.val / chartMax) * 110}`).join(" ")} L 300 ${120 - 110} L 300 120 Z`}
                  fill="url(#chartGrad)"
                />
                <polyline
                  points={points.map(p => `${(p.d / days) * 300},${120 - (p.val / chartMax) * 110}`).join(" ")}
                  fill="none" stroke="#10b981" strokeWidth="2"
                />
              </>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
