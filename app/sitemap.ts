import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase";

const base = "https://scoutgamer.com";

const staticEntries = [
  { url: "",           priority: 1.0 },
  { url: "/tr",        priority: 0.9 },
  { url: "/en",        priority: 1.0 },
  { url: "/radar",     priority: 0.85 },
  { url: "/listeler",  priority: 0.85 },
  { url: "/taktik-lab",priority: 0.85 },
  { url: "/arena",     priority: 0.75 },
  { url: "/oyuncular", priority: 0.65 },
  { url: "/turnuva",   priority: 0.65 },
  { url: "/en/radar",  priority: 0.85 },
  { url: "/en/listeler", priority: 0.85 },
  { url: "/en/taktik-lab", priority: 0.85 },
  { url: "/en/arena",  priority: 0.75 },
];

const CAT_TR: Record<string, string> = {
  radar: "radar",
  listeler: "listeler",
  "taktik-lab": "taktik-lab",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const supabase = createClient();

  const { data: articles } = await supabase
    .from("contents")
    .select("slug,category,created_at")
    .eq("status", "yayinda")
    .order("created_at", { ascending: false });

  const staticItems: MetadataRoute.Sitemap = staticEntries.map(({ url, priority }) => ({
    url: `${base}${url}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority,
  }));

  const articleItems: MetadataRoute.Sitemap = (articles ?? []).flatMap((a) => {
    const catPath = CAT_TR[a.category];
    if (!catPath) return [];
    const lastMod = new Date(a.created_at);
    return [
      { url: `${base}/${catPath}/${a.slug}`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.7 },
      { url: `${base}/en/${catPath}/${a.slug}`, lastModified: lastMod, changeFrequency: "monthly" as const, priority: 0.7 },
    ];
  });

  return [...staticItems, ...articleItems];
}
