import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase";

const base = "https://scoutgamer.com";

const staticEntries = [
  { url: "",           priority: 1.0 },
  { url: "/tr",        priority: 0.9 },
  { url: "/en",        priority: 1.0 },
  { url: "/dunya-kupasi-2026", priority: 0.92 },
  { url: "/transfer", priority: 0.9 },
  { url: "/radar",     priority: 0.85 },
  { url: "/listeler",  priority: 0.85 },
  { url: "/taktik-lab",priority: 0.85 },
  { url: "/arena",     priority: 0.75 },
  { url: "/oyuncular", priority: 0.65 },
  { url: "/turnuva",   priority: 0.65 },
  { url: "/en/world-cup-2026", priority: 0.92 },
  { url: "/en/transfers", priority: 0.9 },
  { url: "/en/radar",  priority: 0.85 },
  { url: "/en/listeler", priority: 0.85 },
  { url: "/en/taktik-lab", priority: 0.85 },
  { url: "/en/arena",  priority: 0.75 },
];

const HUB_STATIC_TR = [
  "/dunya-kupasi-2026/radar",
  "/dunya-kupasi-2026/listeler",
  "/dunya-kupasi-2026/kadrolar",
  "/transfer/radar",
  "/transfer/listeler",
  "/transfer/gidecek-mi",
];

const HUB_STATIC_EN = [
  "/en/world-cup-2026/radar",
  "/en/world-cup-2026/lists",
  "/en/world-cup-2026/squads",
  "/en/transfers/radar",
  "/en/transfers/lists",
  "/en/transfers/will-they-go",
];

const CAT_TR: Record<string, string> = {
  radar: "radar",
  listeler: "listeler",
  "taktik-lab": "taktik-lab",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const supabase = createClient();

  const [{ data: articles }, { data: arenaGames }] = await Promise.all([
    supabase
      .from("contents")
      .select("slug,category,created_at")
      .eq("status", "yayinda")
      .order("created_at", { ascending: false }),
    supabase
      .from("arena_games")
      .select("slug,created_at")
      .eq("status", "published"),
  ]);

  const staticItems: MetadataRoute.Sitemap = [
    ...staticEntries.map(({ url, priority }) => ({
      url: `${base}${url}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority,
    })),
    ...HUB_STATIC_TR.map((url) => ({
      url: `${base}${url}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.88,
    })),
    ...HUB_STATIC_EN.map((url) => ({
      url: `${base}${url}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.88,
    })),
  ];

  const articleItems: MetadataRoute.Sitemap = (articles ?? []).flatMap((a) => {
    const catPath = CAT_TR[a.category];
    if (!catPath) return [];
    const lastMod = new Date(a.created_at);
    return [
      { url: `${base}/${catPath}/${a.slug}`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.7 },
      { url: `${base}/en/${catPath}/${a.slug}`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.7 },
    ];
  });

  // Arena oyun sayfaları — hem TR hem EN URL'si
  const arenaItems: MetadataRoute.Sitemap = (arenaGames ?? []).flatMap((g) => {
    const lastMod = new Date(g.created_at);
    return [
      {
        url: `${base}/arena/${g.slug}`,
        lastModified: lastMod,
        changeFrequency: "monthly" as const,
        priority: 0.72,
      },
      {
        url: `${base}/arena/${g.slug}?lang=en`,
        lastModified: lastMod,
        changeFrequency: "monthly" as const,
        priority: 0.68,
      },
    ];
  });

  return [...staticItems, ...articleItems, ...arenaItems];
}
