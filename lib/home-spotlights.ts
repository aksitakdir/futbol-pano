import { createClient } from "@/lib/supabase";
import { categoryArticlePath } from "@/lib/category-config";

/**
 * The homepage "In focus" block: cards for what is live on the site right now.
 *
 * WHY THIS EXISTS: until 19 October 2026 the block was hard-coded to World Cup
 * 2026 and Transfers. The tournament ended in July, the last transfer analysis
 * was published on 9 July, and for three months the homepage still offered both
 * as the site's headline contexts. A code comment promised to retire the World
 * Cup card "until the leagues start"; nothing made that happen.
 *
 * So a spotlight here can only show while it is alive:
 *   - `windows`: optional date ranges it may run in (transfer windows, award season);
 *   - `freshDays`: its newest matching article must be at most this many days old;
 *   - `minArticles`: it needs this many published articles, so a card appears on
 *     its own once its first piece is published, and never as an empty promise.
 * Live spotlights are ranked by `priority` and the top two are shown. The
 * evergreen one (no window, no freshness rule) keeps the block from ever being
 * empty. Adding next season's context is a new entry here, with an end date.
 */

type Row = {
  id: number;
  title: string;
  title_en: string | null;
  slug: string;
  category: string;
  hub_tags: string[] | null;
  created_at: string;
};

type SpotlightDef = {
  id: string;
  priority: number;
  title: string;
  description: string;
  accent: string;
  /** ISO date ranges, inclusive; omit for always. */
  windows?: [string, string][];
  freshDays?: number;
  minArticles?: number;
  match: (r: Row, title: string) => boolean;
  /** Section hub to send readers to; omit and the card links its newest piece instead. */
  hub?: { href: string; label: string };
  links?: { href: string; label: string }[];
  stats?: (rows: Row[]) => { value: string; label: string }[];
};

export type SpotlightCard = {
  id: string;
  title: string;
  description: string;
  accent: string;
  articles: { title: string; href: string }[];
  links: { href: string; label: string }[];
  stats: { value: string; label: string }[];
  cta: { href: string; label: string };
};

const titleOf = (r: Row) => (r.title_en?.trim() || r.title).trim();
const POSITION_LIST = /^The Best Young .+? in World Football/i;
const COUNTRY_LIST = /^(?:The )?[A-Z][A-Za-zÀ-ÿ .-]{1,24}?(?:['’]s|['’]) Best Young (?:Players|Footballers)\b/;

const SPOTLIGHTS: SpotlightDef[] = [
  {
    id: "awards",
    priority: 100,
    title: "Award Season",
    description:
      "The awards for the best young players in the world. Our read of the nominees, against their EA FC 27 cards and the minutes they are getting this season.",
    accent: "var(--amber)",
    windows: [["2026-10-01", "2026-12-20"]],
    freshDays: 60,
    minArticles: 1,
    match: (_r, t) => /\b(Kopa|Golden Boy|Ballon d['’]Or)\b/i.test(t),
  },
  {
    id: "transfers",
    priority: 90,
    title: "Transfer Window",
    description: "Scout analysis of the moves that matter, alongside the live wire of rumours and confirmed deals.",
    accent: "var(--cyan)",
    // Opens a fortnight before each window and needs a piece from the last month.
    windows: [
      ["2026-12-15", "2027-02-03"],
      ["2027-06-01", "2027-09-02"],
    ],
    freshDays: 30,
    minArticles: 1,
    match: (r) => r.category === "transfer" || (r.hub_tags ?? []).includes("transfer"),
    hub: { href: "/transfers", label: "Transfer Wire" },
  },
  {
    id: "lists",
    priority: 50,
    title: "Scouting Lists",
    description:
      "The best young players in world football, position by position and country by country, checked against the minutes they are getting this season.",
    accent: "var(--accent)",
    match: (r, t) => r.category === "lists" && (POSITION_LIST.test(t) || COUNTRY_LIST.test(t)),
    hub: { href: "/lists", label: "All Lists" },
    stats: (rows) => {
      const lists = rows.filter((r) => r.category === "lists").map(titleOf);
      return [
        { value: String(lists.filter((t) => POSITION_LIST.test(t)).length), label: "Positions" },
        { value: String(lists.filter((t) => COUNTRY_LIST.test(t)).length), label: "Countries" },
      ];
    },
  },
  {
    id: "cards",
    priority: 40,
    title: "Cards vs Reality",
    description:
      "EA FC 27 has rated them; we check the ratings against what the players are doing on the pitch. Who the game upgraded, and who it still underrates.",
    accent: "var(--sky)",
    freshDays: 45,
    minArticles: 2,
    match: (_r, t) => /\b(?:EA )?FC 2\d\b|\bcards?\b/i.test(t),
  },
];

const SHOW = 2;
const PER_CARD = 3;
const DAY = 86_400_000;

function inWindows(def: SpotlightDef, today: string) {
  return !def.windows || def.windows.some(([from, to]) => today >= from && today <= to);
}

/** Server-side: the live spotlights, best first, with their newest articles. */
export async function loadHomeSpotlights(now = new Date()): Promise<SpotlightCard[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("contents")
    .select("id,title,title_en,slug,category,hub_tags,created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(500);
  const rows = (data ?? []) as Row[];
  const today = now.toISOString().slice(0, 10);

  const used = new Set<number>();
  const cards: SpotlightCard[] = [];
  for (const def of [...SPOTLIGHTS].sort((a, b) => b.priority - a.priority)) {
    if (cards.length === SHOW || !inWindows(def, today)) continue;
    const matches = rows.filter((r) => def.match(r, titleOf(r)));
    if (matches.length < (def.minArticles ?? 1)) continue;
    if (def.freshDays && now.getTime() - new Date(matches[0].created_at).getTime() > def.freshDays * DAY) continue;

    // A piece shown on a higher-ranked card is not repeated on this one.
    const picked = matches.filter((r) => !used.has(r.id)).slice(0, PER_CARD);
    if (picked.length === 0) continue;
    picked.forEach((r) => used.add(r.id));

    const articles = picked.map((r) => ({ title: titleOf(r), href: categoryArticlePath(r.category, r.slug) }));
    cards.push({
      id: def.id,
      title: def.title,
      description: def.description,
      accent: def.accent,
      articles,
      links: def.links ?? [],
      stats: def.stats?.(rows) ?? [],
      cta: def.hub ?? { href: articles[0].href, label: "Read the latest" },
    });
  }
  return cards;
}
