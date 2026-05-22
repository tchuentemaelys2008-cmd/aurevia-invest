import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Aurevia Invest — Investissez avec confiance",
  description: "Plateforme d'investissement premium avec des rendements journaliers garantis",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen bg-[#04070f] text-white antialiased">
        <LanguageProvider>
          <div className="relative min-h-screen overflow-x-hidden">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-blue-600/8 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-purple-600/6 rounded-full blur-[100px]" />
            </div>
            {children}
          </div>
        </LanguageProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0c1428",
              color: "#fff",
              border: "1px solid rgba(59,111,212,0.3)",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#3b6fd4", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
