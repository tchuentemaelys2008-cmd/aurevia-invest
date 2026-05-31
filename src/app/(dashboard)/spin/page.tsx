"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, Gift } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/i18n";

interface Segment { label: string; value: number; type: string; probability: number; color: string; }

function SpinWheel({ segments, isSpinning, spinAngle }: { segments: Segment[]; isSpinning: boolean; spinAngle: number }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const total = segments.length;
  const angleStep = (2 * Math.PI) / total;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
        <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[18px] border-l-transparent border-r-transparent border-b-white drop-shadow-lg" />
      </div>
      <motion.div
        animate={{ rotate: spinAngle }}
        transition={{ duration: 4, ease: [0.17, 0.67, 0.35, 1] }}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size}>
          <g transform={`translate(${cx},${cy})`}>
            {segments.map((seg, i) => {
              const startAngle = i * angleStep - Math.PI / 2;
              const endAngle = startAngle + angleStep;
              const x1 = Math.cos(startAngle) * r;
              const y1 = Math.sin(startAngle) * r;
              const x2 = Math.cos(endAngle) * r;
              const y2 = Math.sin(endAngle) * r;
              const midAngle = startAngle + angleStep / 2;
              const tx = Math.cos(midAngle) * (r * 0.65);
              const ty = Math.sin(midAngle) * (r * 0.65);
              return (
                <g key={i}>
                  <path d={`M0,0 L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`} fill={seg.color} stroke="#070d1a" strokeWidth="2" />
                  <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="11" fontWeight="bold" transform={`rotate(${(midAngle * 180) / Math.PI + 90},${tx},${ty})`}>
                    {seg.label.length > 8 ? seg.label.slice(0, 8) : seg.label}
                  </text>
                </g>
              );
            })}
            <circle r={18} fill="#070d1a" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <text textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="16">🎰</text>
          </g>
        </svg>
      </motion.div>
    </div>
  );
}

function countdown(next: Date) {
  const diff = next.getTime() - Date.now();
  if (diff <= 0) return "00:00:00";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

export default function SpinPage() {
  const { t } = useLanguage();
  const [state, setState] = useState<{ canSpin: boolean; nextSpin: string | null; segments: Segment[] } | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);
  const [result, setResult] = useState<Segment | null>(null);
  const [timer, setTimer] = useState("");

  const load = () => fetch("/api/spin").then(r => r.json()).then(setState);
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!state?.nextSpin) return;
    const id = setInterval(() => setTimer(countdown(new Date(state.nextSpin!))), 1000);
    return () => clearInterval(id);
  }, [state?.nextSpin]);

  const spin = async () => {
    if (!state?.canSpin || spinning) return;
    setSpinning(true);
    setResult(null);
    const res = await fetch("/api/spin", { method: "POST" });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); setSpinning(false); return; }

    const won = data.result;
    const segments = state.segments;
    const idx = segments.findIndex(s => s.label === won.label);
    const anglePerSeg = 360 / segments.length;
    const targetAngle = 360 * 6 + (360 - idx * anglePerSeg - anglePerSeg / 2);
    setSpinAngle(prev => prev + targetAngle);

    setTimeout(() => {
      setResult(won);
      setSpinning(false);
      if (won.type === "money" && won.value > 0) toast.success(`🎉 +${won.value} FCFA !`);
      else if (won.type === "empty") toast("Pas de chance cette fois !", { icon: "😅" });
      else toast.success(`✨ ${won.label}`);
      load();
    }, 4200);
  };

  const segs = state?.segments || [];

  return (
    <div className="p-4 lg:p-8 max-w-lg mx-auto">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold text-[#6c5ce7] uppercase tracking-widest mb-1">{t("spin_kicker")}</p>
        <h1 className="text-2xl font-display font-bold text-white">{t("spin_title")}</h1>
        <p className="text-white/40 text-sm mt-1">{t("spin_sub")}</p>
      </div>

      <div className="glass-card rounded-3xl p-8 flex flex-col items-center gap-8">
        {segs.length > 0 && <SpinWheel segments={segs} isSpinning={spinning} spinAngle={spinAngle} />}

        <AnimatePresence mode="wait">
          {result && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="glass-card rounded-2xl p-4 text-center w-full">
              <Gift size={24} className="text-[#f59e0b] mx-auto mb-2" />
              <p className="font-bold text-white">{result.label}</p>
              {result.type === "money" && result.value > 0 && <p className="text-[#f59e0b] text-lg font-bold">+{result.value} FCFA</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {state?.canSpin ? (
          <button onClick={spin} disabled={spinning}
            className="w-full py-4 bg-gradient-to-r from-[#6c5ce7] to-[#5b6ef5] text-white font-bold rounded-2xl text-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
            <Sparkles size={20} />
            {spinning ? t("spin_spinning") : t("spin_btn")}
          </button>
        ) : (
          <div className="w-full py-4 glass-card rounded-2xl text-center">
            <div className="flex items-center justify-center gap-2 text-white/50 mb-1">
              <Clock size={16} />
              <span className="text-sm">{t("spin_next")}</span>
            </div>
            <p className="font-mono text-xl font-bold text-white">{timer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
