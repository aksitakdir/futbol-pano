import { NextResponse } from "next/server";

export type TrendItem = {
  title: string;
  traffic: string;
  link: string;
};

const FOOTBALL_KEYWORDS = [
  "futbol", "transfer", "golcü", "defans", "orta saha", "scout",
  "liga", "şampiyonlar", "uefa", "fifa", "süper lig",
  "real madrid", "barcelona", "liverpool", "manchester",
  "galatasaray", "fenerbahçe", "beşiktaş", "trabzonspor",
  "chelsea", "arsenal", "bayern", "juventus", "inter", "milan",
  "psg", "dortmund", "atletico", "tottenham", "napoli", "benfica",
  "porto", "ajax", "sporting", "celtic", "rangers",
  "messi", "ronaldo", "mbappé", "mbappe", "haaland", "vinicius",
  "premier league", "la liga", "serie a", "bundesliga", "ligue 1",
  "champions league", "europa league", "world cup", "euro 2026",
  "gol", "maç", "derbi", "penaltı", "kırmızı kart", "hakem",
  "teknik direktör", "antrenör", "forvet", "kaleci", "stoper",
  "kanat", "bek", "şampiyon", "kupa", "lig", "play-off",
];

function stripCdata(text: string): string {
  const match = text.trim().match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
  return match ? match[1].trim() : text.trim();
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function isFootballRelated(title: string): boolean {
  const lower = title.toLowerCase();
  return FOOTBALL_KEYWORDS.some((kw) => lower.includes(kw));
}

function parseTrendsRss(xml: string): TrendItem[] {
  const items: TrendItem[] = [];
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

    if (title) {
      items.push({ title, traffic, link });
    }
  }
  return items;
}

export async function GET() {
  try {
    const url = "https://trends.google.com/trending/rss?geo=TR";
    const res = await fetch(url, { next: { revalidate: 1800 } });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Google Trends RSS fetch failed", status: res.status },
        { status: 502 }
      );
    }

    const xml = await res.text();
    const allTrends = parseTrendsRss(xml);
    const footballTrends = allTrends.filter((t) => isFootballRelated(t.title));
    const top = footballTrends.slice(0, 5);

    return NextResponse.json({
      total_trends: allTrends.length,
      football_trends: top.length,
      trends: top,
      all_sample: allTrends.slice(0, 10).map((t) => t.title),
    });
  } catch (err) {
    console.error("Trends fetch error:", err);
    return NextResponse.json(
      { error: "Unexpected error fetching trends" },
      { status: 500 }
    );
  }
}
