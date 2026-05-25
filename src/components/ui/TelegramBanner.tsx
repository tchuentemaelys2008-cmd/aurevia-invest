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
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[var(--control-border)] bg-[var(--surface-card)] p-4">
        <div className="mb-4 text-center">
          <p className="text-3xl font-display font-bold tracking-widest" style={{ color: "var(--control-text)", letterSpacing: "0.18em" }}>
            AUREVIA
          </p>
          <p className="mt-1 text-sm font-semibold" style={{ color: "var(--control-text)", opacity: 0.7 }}>
            {lang === "fr"
              ? "Aurevia Invest · Gagnez de l'argent et rêvez grand"
              : "Aurevia Invest · Make money and dream big"}
          </p>
        </div>
        <div className="overflow-hidden">
          <div className="banner-track flex gap-3">
            {loop.map((src, index) => (
              <div key={`${src}-${index}`} className="h-44 w-72 flex-shrink-0 overflow-hidden rounded-xl border border-[var(--control-border)] bg-white/5 sm:h-56 sm:w-96">
                <img src={src} alt="Aurevia" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
