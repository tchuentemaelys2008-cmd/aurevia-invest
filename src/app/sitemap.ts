import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://aurevia-invest.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    { path: "/", priority: 1, changeFrequency: "daily" as const },
    { path: "/register", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/login", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/help", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/forgot-password", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return routes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
