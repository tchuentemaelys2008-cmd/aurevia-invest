"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, ShoppingBag, Sparkles } from "lucide-react";
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

export default function PurchaseTicker() {
  const { lang } = useLanguage();
  const [items, setItems] = useState<Purchase[]>([]);

  useEffect(() => {
    fetch("/api/purchases/recent")
      .then((res) => res.json())
      .then((data) => setItems(data.purchases || []))
      .catch(() => setItems([]));
  }, []);

  const doubled = useMemo(() => [...items, ...items], [items]);
  if (!items.length) return null;

  return (
    <section className="px-4 pt-4">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface-card)] p-3 shine-card">
        <div className="relative flex items-center gap-3">
          <div className="hidden sm:block h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <img src="/photo_2026-05-25_14-14-19.jpg" alt="Aurevia pass" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#9fb9ff]">
              <Sparkles size={14} />
              <span>{lang === "fr" ? "Achats de passes en direct" : "Live pass purchases"}</span>
            </div>
            <div className="overflow-hidden">
              <div className="ticker-track flex gap-3">
                {doubled.map((purchase, index) => (
                  <div
                    key={`${purchase.id}-${index}`}
                    className="flex min-w-[250px] items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-3 py-2"
                  >
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ background: purchase.color || "linear-gradient(135deg,#3b6fd4,#6c4de6)" }}
                    >
                      <ShoppingBag size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 truncate text-sm font-semibold text-white">
                        {purchase.user}
                        {purchase.verified && <BadgeCheck size={13} className="text-emerald-400" />}
                      </p>
                      <p className="truncate text-xs text-white/45">
                        {lang === "fr" ? "a achete" : "bought"} {purchase.pass} · {formatCurrency(purchase.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
