import { NextResponse } from "next/server";

/**
 * Global football trends aggregator for the Content Control Center.
 *
 * Sources (all football-specific):
 *   1. ESPN Soccer RSS
 *   2. BBC Sport Football RSS
 *   3. The Guardian Football RSS
 *   4. Sky Sports Football RSS
 *   5. Google Trends RSS (US, GB) — filtered to football-only
 *
 * Each result is scored by SEO potential, freshness, and deduped.
 * Non-football Google Trends are excluded entirely.
 */

export const revalidate = 1800; // ISR — cache 30 min

export type TrendItem = {
  title: string;
  traffic: string;
  link: string;
  source: string;
  seoScore: number; // 0-100
  ageHours?: number; // hours since published (if available)
};

/* ── Keyword dictionaries ── */

const FOOTBALL_KEYWORDS = [
  // competitions
  "world cup", "champions league", "europa league", "conference league",
  "premier league", "la liga", "serie a", "bundesliga", "ligue 1",
  "eredivisie", "liga portugal", "copa america", "euro 2028",
  "nations league", "club world cup", "community shield", "super cup",
  "carabao cup", "fa cup", "copa del rey", "dfb-pokal",
  // clubs
  "real madrid", "barcelona", "liverpool", "manchester city", "manchester united",
  "chelsea", "arsenal", "tottenham", "newcastle", "aston villa", "west ham",
  "bayern munich", "borussia dortmund", "rb leipzig", "bayer leverkusen",
  "juventus", "inter milan", "ac milan", "napoli", "roma", "atalanta",
  "psg", "paris saint-germain", "atletico madrid", "benfica", "porto",
  "ajax", "sporting cp", "galatasaray", "fenerbahce",
  // players (high search volume)
  "messi", "ronaldo", "mbappé", "mbappe", "haaland", "vinicius", "yamal",
  "bellingham", "salah", "de bruyne", "pedri", "rodri", "musiala",
  "saka", "rice", "palmer", "foden", "kane", "neymar", "endrick",
  "wirtz", "xavi simons", "lamine yamal", "arda guler",
  // tactical / scouting
  "transfer", "signing", "loan", "contract", "release clause",
  "tactics", "formation", "pressing", "scouting", "wonderkid",
  "manager", "coach", "sacked", "appointed", "head coach",
  // generic football
  "football", "soccer", "goal", "assist", "clean sheet", "penalty",
  "red card", "var", "offside", "injury", "squad", "lineup", "roster",
  "derby", "final", "semifinal", "quarter-final", "fixture", "match",
  "national team", "world cup 2026", "fifa",
];

const HIGH_SEO_TOPICS = [
  "world cup 2026", "transfer", "signing", "scouting", "wonderkid",
  "tactics", "formation", "champions league", "premier league",
  "manager sacked", "squad announcement", "injury update",
  "national team", "lineup", "roster",
];

/* ── Helpers ── */

function stripCdata(text: string): string {
  const match = text.trim().match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
  return match ? match[1].trim() : text.trim();
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
}

function isFootballRelated(title: string): boolean {
  const lower = title.toLowerCase();
  return FOOTBALL_KEYWORDS.some((kw) => lower.includes(kw));
}

/** Parse pubDate string to hours since now. Returns null if unparseable. */
function hoursAgo(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return Math.max(0, (Date.now() - d.getTime()) / (1000 * 60 * 60));
}

/** Score 0-100 based on keyword density, SEO topic match, traffic, and freshness. */
function seoScore(title: string, traffic: string, ageHours: number | null): number {
  const lower = title.toLowerCase();
  let score = 0;

  // Base: keyword match count (max 25 pts)
  const matchCount = FOOTBALL_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  score += Math.min(matchCount * 5, 25);

  // High-value topic bonus (max 30 pts)
  const topicHits = HIGH_SEO_TOPICS.filter((t) => lower.includes(t)).length;
  score += Math.min(topicHits * 12, 30);

  // Traffic volume bonus (max 15 pts)
  const trafficNum = parseInt(traffic.replace(/[^0-9]/g, ""), 10) || 0;
  if (trafficNum >= 500000) score += 15;
  else if (trafficNum >= 100000) score += 12;
  else if (trafficNum >= 50000) score += 8;
  else if (trafficNum >= 10000) score += 4;

  // Freshness bonus (max 20 pts) — newer = better
  if (ageHours !== null) {
    if (ageHours <= 4) score += 20;
    else if (ageHours <= 12) score += 15;
    else if (ageHours <= 24) score += 10;
    else if (ageHours <= 48) score += 5;
    // Older than 48h: no bonus (stale)
  } else {
    score += 8; // unknown age — moderate bonus
  }

  // Title length sweet spot (max 10 pts)
  const words = title.split(/\s+/).length;
  if (words >= 4 && words <= 14) score += 10;
  else if (words >= 3) score += 5;

  return Math.min(score, 100);
}

/** Deduplicate by normalized title similarity. */
function dedup(items: TrendItem[]): TrendItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ── Source fetchers ── */

interface RawTrend {
  title: string;
  traffic: string;
  link: string;
  source: string;
  pubDate?: string;
}

type FetchOpts = { cache: "no-store" } | { next: { revalidate: number } };
const DEFAULT_FETCH_OPTS: FetchOpts = { next: { revalidate: 1800 } };

/** Google Trends RSS for a given geo. */
async function fetchGoogleTrends(geo: string, opts: FetchOpts = DEFAULT_FETCH_OPTS): Promise<RawTrend[]> {
  try {
    const url = `https://trends.google.com/trending/rss?geo=${geo}`;
    const res = await fetch(url, opts);
    if (!res.ok) return [];
    const xml = await res.text();

    const items: RawTrend[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const trafficMatch = block.match(/<ht:approx_traffic[^>]*>([\s\S]*?)<\/ht:approx_traffic>/i);
      const linkMatch = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
      const dateMatch = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);

      const title = titleMatch ? decodeEntities(stripCdata(titleMatch[1])) : "";
      const traffic = trafficMatch ? stripCdata(trafficMatch[1]) : "";
      const link = linkMatch ? linkMatch[1].trim() : "";
      const pubDate = dateMatch ? stripCdata(dateMatch[1]) : undefined;

      if (title) items.push({ title, traffic, link, source: `google-${geo}`, pubDate });
    }
    return items;
  } catch {
    return [];
  }
}

/** Generic RSS feed parser for football news sources. */
async function fetchRssFeed(
  url: string,
  sourceName: string,
  opts: FetchOpts = DEFAULT_FETCH_OPTS,
  maxItems = 20,
): Promise<RawTrend[]> {
  try {
    const res = await fetch(url, opts);
    if (!res.ok) return [];
    const xml = await res.text();

    const items: RawTrend[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const descMatch = block.match(/<description[^>]*>([\s\S]*?)<\/description>/i);
      const linkMatch = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
      const dateMatch = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);

      let rawTitle = titleMatch ? decodeEntities(stripCdata(titleMatch[1])) : "";
      const link = linkMatch ? stripCdata(linkMatch[1]).trim() : "";
      const pubDate = dateMatch ? stripCdata(dateMatch[1]) : undefined;

      // Strip emoji prefixes some feeds use
      rawTitle = rawTitle.replace(/^[\u{1F4C8}\u{1F525}\u{26BD}\u{1F3C6}\u{1F534}\u{1F535}]\s*/u, "").trim();

      // Recover truncated titles from description
      if (rawTitle.endsWith("...") || rawTitle.endsWith("…") || rawTitle.endsWith("..")) {
        const desc = descMatch ? decodeEntities(stripCdata(descMatch[1])).replace(/<[^>]+>/g, "").trim() : "";
        if (desc.length > 10) {
          const firstSentence = desc.match(/^(.{20,}?)[.!?]/)?.[1];
          if (firstSentence && firstSentence.length <= 120) {
            rawTitle = firstSentence.trim();
          } else if (desc.length <= 140) {
            rawTitle = desc;
          }
        }
      }

      if (rawTitle) items.push({ title: rawTitle, traffic: sourceName.toUpperCase(), link, source: sourceName, pubDate });
    }
    return items.slice(0, maxItems);
  } catch {
    return [];
  }
}

/* ── RSS feed URLs ── */

const RSS_FEEDS = [
  { url: "https://www.espn.com/espn/rss/soccer/news", name: "espn" },
  { url: "https://feeds.bbci.co.uk/sport/football/rss.xml", name: "bbc" },
  { url: "https://www.theguardian.com/football/rss", name: "guardian" },
  { url: "https://www.skysports.com/rss/12040", name: "sky" },
];

/* ── Main handler ── */

export async function GET(req: Request) {
  const fresh = new URL(req.url).searchParams.get("fresh") === "1";
  const opts: FetchOpts = fresh ? { cache: "no-store" } : DEFAULT_FETCH_OPTS;

  try {
    // Fetch all sources in parallel
    const feedPromises = RSS_FEEDS.map((f) => fetchRssFeed(f.url, f.name, opts));
    const trendPromises = [
      fetchGoogleTrends("US", opts),
      fetchGoogleTrends("GB", opts),
    ];

    const results = await Promise.all([...feedPromises, ...trendPromises]);
    const [espn, bbc, guardian, sky, trendsUS, trendsGB] = results;

    // Google Trends: only football-related items
    const footballFromGoogle = [...trendsUS, ...trendsGB].filter((t) => isFootballRelated(t.title));

    // All football sources merged
    const allFootball: RawTrend[] = [...espn, ...bbc, ...guardian, ...sky, ...footballFromGoogle];

    // Score, sort, and deduplicate
    const scored: TrendItem[] = allFootball.map((t) => {
      const age = hoursAgo(t.pubDate);
      return {
        title: t.title,
        traffic: t.traffic,
        link: t.link,
        source: t.source,
        seoScore: seoScore(t.title, t.traffic, age),
        ageHours: age !== null ? Math.round(age) : undefined,
      };
    });
    scored.sort((a, b) => b.seoScore - a.seoScore);

    const unique = dedup(scored);
    const top = unique.slice(0, 20);

    // Source breakdown for admin display
    const sourceCounts: Record<string, number> = {};
    for (const t of unique) {
      sourceCounts[t.source] = (sourceCounts[t.source] ?? 0) + 1;
    }

    const body = {
      total_scanned: allFootball.length,
      football_trends: top.length,
      sources: sourceCounts,
      trends: top,
      ...(fresh ? { refreshed_at: new Date().toISOString() } : {}),
    };

    const headers: HeadersInit = fresh
      ? { "Cache-Control": "no-store, max-age=0" }
      : {};

    return NextResponse.json(body, { headers });
  } catch (err) {
    console.error("Trends fetch error:", err);
    return NextResponse.json(
      { error: "Unexpected error fetching trends" },
      { status: 500 },
    );
  }
}
