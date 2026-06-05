import { NextResponse } from "next/server";

/**
 * Global football trends aggregator for the Content Control Center.
 *
 * Sources:
 *   1. Google Trends RSS — US, UK, global (English football searches)
 *   2. Reddit r/soccer hot posts (no API key needed)
 *   3. Football-Data.org headlines (if API key available)
 *
 * Each result is scored by SEO potential and deduped before returning.
 */

export const revalidate = 1800; // ISR — cache 30 min

export type TrendItem = {
  title: string;
  traffic: string;
  link: string;
  source: string;
  seoScore: number; // 0-100
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

/** High-value SEO topics that boost a trend's score. */
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

/** Score 0-100 based on keyword density, SEO topic match, and traffic volume. */
function seoScore(title: string, traffic: string): number {
  const lower = title.toLowerCase();
  let score = 0;

  // Base: keyword match count (max 30 pts)
  const matchCount = FOOTBALL_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  score += Math.min(matchCount * 6, 30);

  // High-value topic bonus (max 40 pts)
  const topicHits = HIGH_SEO_TOPICS.filter((t) => lower.includes(t)).length;
  score += Math.min(topicHits * 15, 40);

  // Traffic volume bonus (max 20 pts)
  const trafficNum = parseInt(traffic.replace(/[^0-9]/g, ""), 10) || 0;
  if (trafficNum >= 500000) score += 20;
  else if (trafficNum >= 100000) score += 15;
  else if (trafficNum >= 50000) score += 10;
  else if (trafficNum >= 10000) score += 5;

  // Title length sweet spot — 6-12 words is best for articles (max 10 pts)
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
}

/** Google Trends RSS for a given geo. */
async function fetchGoogleTrends(geo: string): Promise<RawTrend[]> {
  try {
    const url = `https://trends.google.com/trending/rss?geo=${geo}`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
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

      const title = titleMatch ? decodeEntities(stripCdata(titleMatch[1])) : "";
      const traffic = trafficMatch ? stripCdata(trafficMatch[1]) : "";
      const link = linkMatch ? linkMatch[1].trim() : "";

      if (title) items.push({ title, traffic, link, source: `google-${geo}` });
    }
    return items;
  } catch {
    return [];
  }
}

/** ESPN Soccer RSS — always returns football content. */
async function fetchEspnSoccer(): Promise<RawTrend[]> {
  try {
    const res = await fetch("https://www.espn.com/espn/rss/soccer/news", {
      next: { revalidate: 1800 },
    });
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

      let rawTitle = titleMatch ? decodeEntities(stripCdata(titleMatch[1])) : "";
      // ESPN truncates titles with "..." — use description as context
      const desc = descMatch ? decodeEntities(stripCdata(descMatch[1])).replace(/<[^>]+>/g, "").trim() : "";
      // Strip emoji prefixes ESPN sometimes uses
      rawTitle = rawTitle.replace(/^[\u{1F4C8}\u{1F525}\u{26BD}\u{1F3C6}]\s*/u, "").trim();
      // ESPN truncates titles — recover from description
      if (rawTitle.endsWith("...") || rawTitle.endsWith("…") || rawTitle.endsWith("..")) {
        if (desc && desc.length > 10) {
          // Use first sentence of description as a fuller headline
          const firstSentence = desc.match(/^(.{20,}?)[.!?]/)?.[1];
          if (firstSentence && firstSentence.length <= 120) {
            rawTitle = firstSentence.trim();
          } else if (desc.length <= 140) {
            rawTitle = desc;
          }
        }
      }
      const link = linkMatch ? stripCdata(linkMatch[1]).trim() : "";
      const title = rawTitle;

      if (title) items.push({ title, traffic: "ESPN", link, source: "espn" });
    }
    return items.slice(0, 20);
  } catch {
    return [];
  }
}

/* ── Main handler ── */

export async function GET() {
  try {
    // Fetch all sources in parallel
    const [trendsUS, trendsGB, trendsGlobal, espn] = await Promise.all([
      fetchGoogleTrends("US"),
      fetchGoogleTrends("GB"),
      fetchGoogleTrends(""),     // global
      fetchEspnSoccer(),
    ]);

    // Merge all raw trends
    const allRaw: RawTrend[] = [...trendsUS, ...trendsGB, ...trendsGlobal];

    // ESPN is already football — combine with filtered Google Trends
    const footballFromGoogle = allRaw.filter((t) => isFootballRelated(t.title));
    const footballRaw = [...espn, ...footballFromGoogle];

    // Score and sort
    const scored: TrendItem[] = footballRaw.map((t) => ({
      ...t,
      seoScore: seoScore(t.title, t.traffic),
    }));
    scored.sort((a, b) => b.seoScore - a.seoScore);

    // Deduplicate
    const unique = dedup(scored);
    const top = unique.slice(0, 12);

    // Also return a few non-football trending topics as inspiration
    const nonFootball = allRaw
      .filter((t) => !isFootballRelated(t.title))
      .slice(0, 8)
      .map((t) => t.title);

    return NextResponse.json({
      total_scanned: allRaw.length,
      football_trends: top.length,
      trends: top,
      all_sample: nonFootball,
    });
  } catch (err) {
    console.error("Trends fetch error:", err);
    return NextResponse.json(
      { error: "Unexpected error fetching trends" },
      { status: 500 },
    );
  }
}
