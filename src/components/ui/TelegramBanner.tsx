"use client";

import { useLanguage } from "@/lib/i18n";

const bannerImages = [
  "/telegram-banners/photo_2026-05-25_13-10-48.jpg",
  "/telegram-banners/photo_2026-05-25_13-10-53.jpg",
  "/telegram-banners/photo_2026-05-25_13-10-57.jpg",
  "/telegram-banners/photo_2026-05-25_13-11-01.jpg",
  "/telegram-banners/photo_2026-05-25_13-11-05.jpg",
  "/telegram-banners/photo_2026-05-25_14-14-19.jpg",
];

export default function TelegramBanner() {
  const { lang } = useLanguage();
  const loop = [...bannerImages, ...bannerImages];

  return (
    <section className="px-4 pt-4">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[var(--surface-card)] p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">{lang === "fr" ? "Preuves et actualites Aurevia" : "Aurevia proofs and updates"}</p>
            <p className="text-xs text-white/40">{lang === "fr" ? "Les images Telegram defilent automatiquement" : "Telegram images scroll automatically"}</p>
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="banner-track flex gap-3">
            {loop.map((src, index) => (
              <div key={`${src}-${index}`} className="h-32 w-56 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:h-40 sm:w-72">
                <img src={src} alt="Aurevia Telegram" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
