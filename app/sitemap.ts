import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase";
import { articleDates } from "@/lib/article-dates";

const base = "https://www.scoutgamer.com";

/**
 * Rendered on every request. A sitemap frozen at deploy time keeps a newly
 * published article out of it until the next deploy — that is what happened to
 * the strikers piece.
 *
 * `revalidate = 3600` was the first fix, and the build did mark the route ISR,
 * but on Vercel it never refreshed: on 16 Oct 2026 the live sitemap was 12.4
 * hours old (age 44711, x-vercel-cache HIT), two articles published that evening
 * were missing, and revalidatePath("/sitemap.xml") changed nothing. Googlebot
 * fetches this file a few times a day; two Supabase queries per fetch cost
 * nothing next to a sitemap that silently stops listing new work.
 */
export const dynamic = "force-dynamic";

/**
 * `section` gives a hub its <lastmod>: the go-live date of the newest article it
 * lists, the day the page itself last changed. "*" is the home page. Entries with
 * no section (the frozen World Cup schedule and squads) carry no <lastmod>.
 *
 * Until 24 Nov 2026 every static entry said `now`, so each fetch told Google the
 * whole site had changed that minute. Google trusts a site's lastmod all or
 * nothing; a date that always says "today" spends the trust the real article
 * updates need.
 */
const staticEntries: { url: string; priority: number; section?: string }[] = [
  { url: "",                          priority: 1.0,  section: "*" },
  { url: "/world-cup-2026",           priority: 0.92, section: "wc-2026" },
  { url: "/world-cup-2026/schedule",   priority: 0.90 },
  { url: "/world-cup-2026/squads",    priority: 0.88 },
  // /world-cup-2026/lists was listed here without ever being built — the route
  // folder is empty, so the sitemap sent Googlebot to a 404 of our own making.
  // Put it back only alongside a page.tsx.
  { url: "/transfers",                priority: 0.9,  section: "transfer" },
  { url: "/radar",                    priority: 0.85, section: "radar" },
  { url: "/lists",                     priority: 0.85, section: "lists" },
  { url: "/tactics-lab",              priority: 0.85, section: "tactics-lab" },
  { url: "/arena",                    priority: 0.75, section: "arena" },
];

const CAT_PATHS: Record<string, string> = {
  radar: "radar",
  lists: "lists",
  "tactics-lab": "tactics-lab",
  "wc-2026": "world-cup-2026",
  transfer: "transfers",
};

type ArticleRow = { slug: string; category: string; created_at: string; content_updated_at?: string | null };

/**
 * content_updated_at exists only once its migration has run. Until then the query
 * naming it fails, so ask again without it rather than lose every article.
 */
async function publishedArticles(supabase: ReturnType<typeof createClient>): Promise<ArticleRow[]> {
  const query = (cols: string) =>
    supabase.from("contents").select(cols).eq("status", "published").order("created_at", { ascending: false });
  const first = await query("slug,category,created_at,content_updated_at");
  if (!first.error) return (first.data ?? []) as unknown as ArticleRow[];
  // Only a missing column earns the retry. After the migration, a passing failure
  // retried without the column would serve go-live dates as lastmod for one fetch:
  // dates that jump back and forth are what costs Google's trust in them.
  if (first.error.code !== "42703") throw first.error;
  const retry = await query("slug,category,created_at");
  // Throw rather than serve a sitemap with no articles in it: a failed fetch makes
  // Google keep the last good copy, an empty one tells it the articles are gone.
  if (retry.error) throw retry.error;
  return (retry.data ?? []) as unknown as ArticleRow[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  const [articles, { data: arenaGames, error: arenaError }] = await Promise.all([
    publishedArticles(supabase),
    supabase.from("arena_games").select("slug,created_at").eq("status", "published"),
  ]);
  if (arenaError) throw arenaError;

  const newest = new Map<string, number>();
  const bump = (key: string, iso: string) => newest.set(key, Math.max(newest.get(key) ?? 0, Date.parse(iso)));
  for (const a of articles) { bump(a.category, a.created_at); bump("*", a.created_at); }
  for (const g of arenaGames ?? []) bump("arena", g.created_at);

  const staticItems: MetadataRoute.Sitemap = staticEntries.map(({ url, priority, section }) => {
    const last = section ? newest.get(section) : undefined;
    return {
      url: `${base}${url}`,
      ...(last ? { lastModified: new Date(last) } : {}),
      changeFrequency: "weekly" as const,
      priority,
    };
  });

  // An article's <lastmod> is its last real change (lib/article-dates.ts): the same
  // instant as its dateModified and article:modified_time.
  const articleItems: MetadataRoute.Sitemap = articles.flatMap((a) => {
    const catPath = CAT_PATHS[a.category];
    if (!catPath) return [];
    return [{
      url: `${base}/${catPath}/${a.slug}`,
      lastModified: new Date(articleDates(a).modified),
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
