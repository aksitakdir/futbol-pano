import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase";
import { getAllTeamSlugs } from "@/lib/wc-2026-schedule";
import { WC_TEAMS } from "@/lib/wc-2026-teams";

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
  { url: "/world-cup-2026/lists",     priority: 0.85 },
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

  const teamScheduleItems: MetadataRoute.Sitemap = getAllTeamSlugs().map((slug) => ({
    url: `${base}/world-cup-2026/schedule/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.82,
  }));

  // 48 per-team squad pages — high-intent search ("<country> world cup squad")
  // during the hype window. Uses WC_TEAMS, the same source the squad routes
  // (getWcTeam) and homepage links resolve against.
  const teamSquadItems: MetadataRoute.Sitemap = WC_TEAMS.map((t) => ({
    url: `${base}/world-cup-2026/squads/${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.84,
  }));

  return [...staticItems, ...teamScheduleItems, ...teamSquadItems, ...articleItems, ...arenaItems];
}
