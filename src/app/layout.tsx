import type { Metadata, Viewport } from "next";
import { Montserrat, Space_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

// Toute la gamme de graisses : sans elle, le navigateur synthétise les
// font-medium/bold/extrabold à partir de la seule graisse 600, ce qui donne
// une typographie plate et floue. Chargée via next/font (auto-hébergée,
// zéro requête externe bloquante).
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_URL || "https://aurevia-invest.online";
const siteName = "Aurevia Invest";
const siteTagline = "Investissez en Afrique, récoltez chaque jour";
const description =
  "Aurevia Invest — Plateforme d'investissement africaine. Achetez un pass, générez des revenus quotidiens en FCFA et retirez via Mobile Money (Orange, MTN, Wave).";
const ogDescription =
  "Investissez en Afrique et gagnez chaque jour. Revenus quotidiens en FCFA, retrait Mobile Money, programme de parrainage. Rejoignez Aurevia Invest maintenant !";
const logoUrl = "/photo_2026-05-25_14-14-19.jpg";
// Static OG card (1080x720, ~68KB JPEG) — reliably rendered by WhatsApp,
// Facebook, Telegram, X/Twitter and LinkedIn crawlers, unlike a dynamically
// generated edge image which they frequently fail to fetch in time.
const ogImage = {
  url: "/og-image.jpg",
  width: 1080,
  height: 720,
  alt: `${siteName} — ${siteTagline}`,
  type: "image/jpeg",
} as const;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: `${siteName} — ${siteTagline}`,
    template: `%s | ${siteName}`,
  },
  description,
  keywords: [
    "Aurevia Invest",
    "investissement Afrique",
    "revenus quotidiens FCFA",
    "passes investissement",
    "Mobile Money",
    "Orange Money",
    "MTN Mobile Money",
    "Wave",
    "Fapshi",
    "parrainage affiliation",
    "depot retrait Cameroun",
    "Côte d'Ivoire",
    "Sénégal",
    "investir en ligne Afrique",
    "revenus passifs",
  ],
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  category: "finance",
  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "/",
      "en-US": "/",
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: logoUrl, type: "image/jpeg" },
    ],
    shortcut: "/icon.svg",
    apple: { url: logoUrl, sizes: "180x180" },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["en_US"],
    url: siteUrl,
    siteName,
    title: `${siteName} — Make Money & Dream Big`,
    description: ogDescription,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Make Money & Dream Big`,
    description: ogDescription,
    images: [ogImage.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f7fb",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}${logoUrl}`,
  image: `${siteUrl}${logoUrl}`,
  description,
  foundingLocation: {
    "@type": "Place",
    name: "Afrique",
  },
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  description,
  inLanguage: ["fr-FR", "en-US"],
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/passes`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${spaceMono.variable} font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
        <Toaster
          position="top-center"
          gutter={10}
          toastOptions={{
            duration: 3500,
            style: {
              background: "rgba(12,20,40,0.94)",
              color: "#fff",
              border: "1px solid rgba(59,111,212,0.25)",
              borderRadius: "14px",
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: 600,
              boxShadow: "0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#04070f" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#04070f" } },
          }}
        />
      </body>
    </html>
  );
}
