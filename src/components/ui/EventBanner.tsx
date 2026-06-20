"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface Event { id: string; title: string; titleEn: string | null; description: string | null; type: string; value: number; endsAt: string | null; }

function countdown(end: Date) {
  const diff = end.getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

export default function EventBanner() {
  const { lang } = useLanguage();
  const [event, setEvent] = useState<Event | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [timer, setTimer] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/events").then(r => r.json()).then(d => { if (d.events?.[0]) setEvent(d.events[0]); });
  }, []);

  useEffect(() => {
    if (!event?.endsAt) return;
    const id = setInterval(() => {
      const t = countdown(new Date(event.endsAt!));
      setTimer(t);
      if (!t) setEvent(null);
    }, 1000);
    return () => clearInterval(id);
  }, [event?.endsAt]);

  const typeColor: Record<string, string> = { double_earnings: "#10b981", discount: "#f59e0b", bonus: "#2d5bcc", xp_boost: "#3b6fd4" };
  const color = event ? (typeColor[event.type] || "#3b6fd4") : "#3b6fd4";

  return (
    <AnimatePresence>
      {event && !dismissed && (
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
          className="mx-4 lg:mx-8 mt-4 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${color}22, ${color}11)`, border: `1px solid ${color}33` }}
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
            <Zap size={16} style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm">{lang === "en" && event.titleEn ? event.titleEn : event.title}</p>
            {event.description && <p className="text-white/50 text-xs mt-0.5 truncate">{event.description}</p>}
          </div>
          {timer && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Clock size={13} className="text-white/40" />
              <span className="font-mono text-xs font-semibold text-white/60">{timer}</span>
            </div>
          )}
          <button onClick={() => setDismissed(true)} className="w-6 h-6 flex items-center justify-center text-white/30 hover:text-white rounded-lg transition-all flex-shrink-0">
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
