import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://aurevia-invest.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/dashboard", "/wallet", "/settings"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
