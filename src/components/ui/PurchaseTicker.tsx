"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

type Purchase = {
  id: string;
  user: string;
  verified?: boolean;
  pass: string;
  amount: number;
  color?: string;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

// Small, semi-transparent floating pill that shows one purchase at a time and
// rotates every 3.6s (TikTok LIVE style). Names come from the code (the API
// only returns the static displayNames list), not the database. Colors are
// inline so the light-theme `.text-white` overrides can't wash them out.
export default function PurchaseTicker() {
  const { lang } = useLanguage();
  const [items, setItems] = useState<Purchase[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetch("/api/purchases/recent")
      .then((res) => res.json())
      .then((data) => setItems(data.purchases || []))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % items.length), 3600);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;
  const p = items[idx % items.length];

  return (
    <div className="pointer-events-none relative z-30 flex justify-center px-4 pt-3">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${p.id}-${idx}`}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto flex items-center gap-2 rounded-full px-2.5 py-1.5 backdrop-blur-md"
          style={{
            maxWidth: "94vw",
            background: "rgba(10,15,30,0.5)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.28)",
          }}
        >
          <span className="dot-live flex-shrink-0" />
          <span
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
            style={{
              color: "#fff",
              background: p.color || "linear-gradient(135deg,#e23744,#b51d2c)",
            }}
          >
            {initials(p.user)}
          </span>
          <span className="flex min-w-0 items-center gap-1 truncate text-xs" style={{ color: "rgba(255,255,255,0.9)" }}>
            <span className="font-semibold" style={{ color: "#fff" }}>{p.user.split(" ")[0]}</span>
            {p.verified && <BadgeCheck size={11} className="flex-shrink-0" style={{ color: "#34d399" }} />}
            <span style={{ color: "rgba(255,255,255,0.55)" }}>{lang === "fr" ? "a pris" : "got"}</span>
            <span className="truncate" style={{ color: "rgba(255,255,255,0.9)" }}>{p.pass}</span>
          </span>
          <span
            className="flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
            style={{ color: "#34d399", background: "rgba(52,211,153,0.15)" }}
          >
            {formatCurrency(p.amount)}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
