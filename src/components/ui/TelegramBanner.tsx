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
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[var(--control-border)] bg-[var(--surface-card)] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.3)] shine-card sm:p-5">
        {/* Header */}
        <div className="relative mb-4 text-center">
          <p
            className="bg-gradient-to-r from-[#5b6ef5] via-[#7d8ff0] to-[#6c5ce7] bg-clip-text text-3xl font-display font-extrabold text-transparent sm:text-4xl"
            style={{ letterSpacing: "0.14em" }}
          >
            AUREVIA
          </p>
          <p className="mt-1.5 text-xs font-semibold sm:text-sm" style={{ color: "var(--control-text)", opacity: 0.7 }}>
            {lang === "fr"
              ? "Gagnez de l'argent et réalisez vos rêves"
              : "Make money and dream big"}
          </p>
        </div>

        {/* Marquee gallery with fade edges */}
        <div className="banner-mask relative overflow-hidden">
          <div className="banner-track flex gap-3">
            {loop.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="banner-slide group relative h-44 w-72 flex-shrink-0 overflow-hidden rounded-2xl border border-[var(--control-border)] bg-white/5 sm:h-56 sm:w-96"
              >
                <img
                  src={src}
                  alt="Aurevia Invest"
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                />
                {/* Bottom gradient for depth */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent" />
                {/* Sheen on hover */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-tr from-[#5b6ef5]/20 via-transparent to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
