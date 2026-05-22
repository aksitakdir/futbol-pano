import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase";

const base = "https://scoutgamer.com";

const staticEntries = [
  { url: "",                          priority: 1.0 },
  { url: "/world-cup-2026",           priority: 0.92 },
  { url: "/world-cup-2026/squads",    priority: 0.88 },
  { url: "/world-cup-2026/lists",     priority: 0.85 },
  { url: "/transfers",                priority: 0.9 },
  { url: "/radar",                    priority: 0.85 },
  { url: "/lists",                     priority: 0.85 },
  { url: "/tactics-lab",              priority: 0.85 },
  { url: "/arena",                    priority: 0.75 },
];

const CAT_PATHS: Record<string, string> = {
  radar: "radar",
  listeler: "lists",
  "taktik-lab": "tactics-lab",
  "wc-2026": "world-cup-2026",
  transfer: "transfers",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const supabase = createClient();

  const [{ data: articles }, { data: arenaGames }] = await Promise.all([
    supabase.from("contents").select("slug,category,created_at").eq("status", "yayinda").order("created_at", { ascending: false }),
    supabase.from("arena_games").select("slug,created_at").eq("status", "published"),
  ]);

  const staticItems: MetadataRoute.Sitemap = staticEntries.map(({ url, priority }) => ({
    url: `${base}${url}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority,
  }));

  const articleItems: MetadataRoute.Sitemap = (articles ?? []).flatMap((a) => {
    const catPath = CAT_PATHS[a.category];
    if (!catPath) return [];
    return [{
      url: `${base}/${catPath}/${a.slug}`,
      lastModified: new Date(a.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }];
  });

  const arenaItems: MetadataRoute.Sitemap = (arenaGames ?? []).map((g) => ({
    url: `${base}/arena/${g.slug}`,
    lastModified: new Date(g.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));

  return [...staticItems, ...articleItems, ...arenaItems];
}
