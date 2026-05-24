import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const siteUrl = process.env.NEXT_PUBLIC_URL || "https://aurevia-invest.vercel.app";
const siteName = "Aurevia Invest";
const description = "Aurevia Invest est une plateforme d'investissement avec passes, revenus quotidiens, depots, retraits et programme d'affiliation.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: `${siteName} - Passes, revenus et affiliation`,
    template: `%s | ${siteName}`,
  },
  description,
  keywords: [
    "Aurevia Invest",
    "investissement",
    "passes",
    "revenus quotidiens",
    "depot",
    "retrait",
    "affiliation",
    "mobile money",
    "FCFA",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "finance",
  alternates: {
    canonical: "/",
    languages: {
      fr: "/",
      en: "/",
    },
  },
  icons: {
    icon: "/api/brand-logo",
    shortcut: "/api/brand-logo",
    apple: "/api/brand-logo",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["en_US"],
    url: "/",
    siteName,
    title: `${siteName} - Investissez avec des passes simples`,
    description,
    images: [
      {
        url: "/api/brand-logo",
        width: 1200,
        height: 630,
        alt: `${siteName} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Passes, revenus et affiliation`,
    description,
    images: ["/api/brand-logo"],
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
  themeColor: "#070d1a",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}/api/brand-logo`,
  sameAs: [],
  description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <LanguageProvider>{children}</LanguageProvider>
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
