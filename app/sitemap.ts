import type { MetadataRoute } from "next";

const base = "https://scoutgamer.com";

const staticPaths = [
  "",
  "/radar",
  "/listeler",
  "/taktik-lab",
  "/arena",
  "/oyuncular",
  "/turnuva",
  "/en",
  "/en/radar",
  "/en/listeler",
  "/en/taktik-lab",
  "/en/arena",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
}
