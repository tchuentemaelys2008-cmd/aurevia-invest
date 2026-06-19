import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-montserrat",
});

const siteUrl = process.env.NEXT_PUBLIC_URL || "https://aurevia-invest.online";
const siteName = "Aurevia Invest";
const siteTagline = "Investissez en Afrique, récoltez chaque jour";
const description =
  "Aurevia Invest — Plateforme d'investissement africaine. Achetez un pass, générez des revenus quotidiens en FCFA et retirez via Mobile Money (Orange, MTN, Wave).";
const ogDescription =
  "Investissez en Afrique et gagnez chaque jour. Revenus quotidiens en FCFA, retrait Mobile Money, programme de parrainage. Rejoignez Aurevia Invest maintenant !";
const logoUrl = "/photo_2026-05-25_14-14-19.jpg";

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
    // og:image is provided by the generated app/opengraph-image.tsx card.
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Make Money & Dream Big`,
    description: ogDescription,
    // twitter image falls back to the generated opengraph-image card.
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
      <body className={`${montserrat.variable} font-sans`}>
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
          toastOptions={{
            style: {
              background: "#0c1428",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />
      </body>
    </html>
  );
}
