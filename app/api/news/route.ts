import { NextRequest, NextResponse } from "next/server";

export type NewsItem = {
  title: string;
  link: string;
  source: string;
  date: string;
};

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

function parseRssItems(xml: string, maxItems: number): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < maxItems) {
    const block = match[1];
    const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const linkMatch = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    const pubDateMatch = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
    const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);

    const title = titleMatch
      ? decodeEntities(stripCdata(titleMatch[1].trim()))
      : "";
    const link = linkMatch ? linkMatch[1].trim() : "";
    const date = pubDateMatch ? pubDateMatch[1].trim() : "";
    const source = sourceMatch ? decodeEntities(sourceMatch[1].trim()) : "";

    if (title && link) {
      items.push({ title, link, source, date });
    }
  }
  return items;
}

function formatDate(rfc822: string): string {
  try {
    const d = new Date(rfc822);
    if (Number.isNaN(d.getTime())) return rfc822;
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return rfc822;
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  if (!query?.trim()) {
    return NextResponse.json(
      { error: "Missing or empty query parameter" },
      { status: 400 }
    );
  }

  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query.trim())}+footballer&hl=en&gl=US&ceid=US:en`;

  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) {
    return NextResponse.json(
      { error: "News feed request failed", status: res.status },
      { status: res.status }
    );
  }

  const xml = await res.text();
  const raw = parseRssItems(xml, 10);

  // Son 30 gün filtresi
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const filtered = raw.filter((r) => {
    if (!r.date) return false;
    const d = new Date(r.date);
    if (Number.isNaN(d.getTime())) return false;
    return d.getTime() >= thirtyDaysAgo;
  });

  const items: NewsItem[] = filtered.slice(0, 4).map((r) => ({
    ...r,
    date: formatDate(r.date),
  }));

  return NextResponse.json(items);
}
