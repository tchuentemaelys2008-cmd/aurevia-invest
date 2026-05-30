import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aurevia Invest",
    short_name: "Aurevia",
    description:
      "Plateforme d'investissement africaine — achetez un pass, générez des revenus quotidiens en FCFA et retirez via Mobile Money.",
    start_url: "/",
    display: "standalone",
    background_color: "#04070f",
    theme_color: "#04070f",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
