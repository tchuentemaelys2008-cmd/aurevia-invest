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

export default function PurchaseTicker() {
  const { lang } = useLanguage();
  const [items, setItems] = useState<Purchase[]>([]);

  useEffect(() => {
    fetch("/api/purchases/recent")
      .then((res) => res.json())
      .then((data) => setItems(data.purchases || []))
      .catch(() => setItems([]));
  }, []);

  // Duplicate the list so the marquee loops seamlessly.
  const doubled = useMemo(() => [...items, ...items], [items]);
  if (!items.length) return null;

  return (
    <section className="px-4 pt-4">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface-card)] shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
              {lang === "fr" ? "Achats en direct" : "Live purchases"}
            </span>
          </div>
          <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
            {lang === "fr" ? "Vérifié" : "Verified"}
          </span>
        </div>

        {/* Marquee */}
        <div className="ticker-mask relative overflow-hidden px-4 py-3">
          <div className="ticker-track flex gap-2.5">
            {doubled.map((purchase, index) => (
              <div
                key={`${purchase.id}-${index}`}
                className="flex min-w-[238px] items-center gap-3 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 transition-colors hover:border-white/15"
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-inner"
                  style={{
                    background:
                      purchase.color || "linear-gradient(135deg,#5b6ef5,#6c5ce7)",
                  }}
                >
                  {initials(purchase.user)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate text-sm font-semibold text-white">
                    {purchase.user}
                    {purchase.verified && (
                      <BadgeCheck size={13} className="flex-shrink-0 text-emerald-400" />
                    )}
                  </p>
                  <p className="truncate text-xs text-white/45">
                    {lang === "fr" ? "vient d'acheter" : "just bought"}{" "}
                    <span className="text-white/70">{purchase.pass}</span>
                  </p>
                </div>
                <span className="flex-shrink-0 rounded-lg bg-emerald-400/10 px-2 py-1 text-xs font-bold text-emerald-400">
                  {formatCurrency(purchase.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
