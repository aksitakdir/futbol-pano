import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase";

const base = "https://www.scoutgamer.com";

/**
 * Regenerate hourly. Without this the sitemap is built once at deploy time and
 * then frozen, so an article published from the admin panel stays out of it until
 * the next deploy — which is exactly what happened to the strikers piece: live and
 * returning 200, but absent from the sitemap while an article published before the
 * last build sat in it. Articles are published far more often than we deploy.
 */
export const revalidate = 3600;

const staticEntries = [
  { url: "",                          priority: 1.0 },
  { url: "/world-cup-2026",           priority: 0.92 },
  { url: "/world-cup-2026/schedule",   priority: 0.90 },
  { url: "/world-cup-2026/squads",    priority: 0.88 },
  // /world-cup-2026/lists was listed here without ever being built — the route
  // folder is empty, so the sitemap sent Googlebot to a 404 of our own making.
  // Put it back only alongside a page.tsx.
  { url: "/transfers",                priority: 0.9 },
  { url: "/radar",                    priority: 0.85 },
  { url: "/lists",                     priority: 0.85 },
  { url: "/tactics-lab",              priority: 0.85 },
  { url: "/arena",                    priority: 0.75 },
];

const CAT_PATHS: Record<string, string> = {
  radar: "radar",
  lists: "lists",
  "tactics-lab": "tactics-lab",
  "wc-2026": "world-cup-2026",
  transfer: "transfers",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const supabase = createClient();

  const [{ data: articles }, { data: arenaGames }] = await Promise.all([
    supabase.from("contents").select("slug,category,created_at").eq("status", "published").order("created_at", { ascending: false }),
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

  // The 48 per-team schedule pages and 48 per-team squad pages are deliberately
  // NOT listed. They were here for the hype window, when "<country> world cup
  // squad" was high-intent search. The tournament ended on 19 July 2026 and the
  // 28 days to 13 September measured the result: 33 World Cup pages drew 1,257
  // impressions and 6 clicks between them, the squad pages sitting at positions
  // 21 to 52, and not one of the 48 team schedule pages registered at all.
  //
  // They were also 96 of the sitemap's 224 URLs — 69% of what we were asking
  // Google to prioritise, for a finished event, while the scouting lists that
  // earn 96.8% of the site's clicks were a minority of it.
  //
  // The pages themselves still exist, still render, and stay reachable through
  // /world-cup-2026. Removing them from the sitemap withdraws a crawl-priority
  // request; it does not deindex anything.
  return [...staticItems, ...articleItems, ...arenaItems];
}
