"use client";

import { useEffect, useMemo, useState } from "react";
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

// Small, semi-transparent marquee that continuously scrolls many live purchases
// (TikTok-style). Colors are inline so the light-theme `.text-white` overrides
// can't wash them out.
export default function PurchaseTicker() {
  const { lang } = useLanguage();
  const [items, setItems] = useState<Purchase[]>([]);

  useEffect(() => {
    fetch("/api/purchases/recent")
      .then((res) => res.json())
      .then((data) => setItems(data.purchases || []))
      .catch(() => setItems([]));
  }, []);

  // Duplicate the list so the marquee loops seamlessly (track animates to -50%).
  const doubled = useMemo(() => [...items, ...items], [items]);
  if (!items.length) return null;

  return (
    <div className="relative z-30 px-4 pt-3">
      <div className="ticker-mask mx-auto max-w-4xl overflow-hidden">
        <div className="ticker-track flex gap-2">
          {doubled.map((p, i) => (
            <div
              key={`${p.id}-${i}`}
              className="flex flex-shrink-0 items-center gap-2 rounded-full px-2.5 py-1 backdrop-blur-md"
              style={{
                background: "rgba(10,15,30,0.5)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <span
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[8px] font-bold"
                style={{
                  color: "#fff",
                  background: p.color || "linear-gradient(135deg,#e23744,#b51d2c)",
                }}
              >
                {initials(p.user)}
              </span>
              <span className="whitespace-nowrap text-xs" style={{ color: "rgba(255,255,255,0.9)" }}>
                <span className="font-semibold" style={{ color: "#fff" }}>{p.user.split(" ")[0]}</span>
                {p.verified && <BadgeCheck size={10} className="mx-0.5 inline" style={{ color: "#34d399" }} />}
                <span style={{ color: "rgba(255,255,255,0.55)" }}> {lang === "fr" ? "a pris" : "got"} </span>
                <span style={{ color: "rgba(255,255,255,0.9)" }}>{p.pass}</span>
              </span>
              <span
                className="whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{ color: "#34d399", background: "rgba(52,211,153,0.15)" }}
              >
                {formatCurrency(p.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
