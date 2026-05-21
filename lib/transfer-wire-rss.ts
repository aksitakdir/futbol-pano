/** Multi-source transfer rumor RSS — Google News, BBC, Sky */

export type WireSource = "google" | "bbc" | "sky" | "espn" | "other";

export type RawWireItem = {
  title: string;
  link: string;
  source: WireSource;
  sourceLabel: string;
  pubDate: string;
};

const TRANSFER_RE =
  /\b(transfer|signing|signed|deal|loan|move|bid|target|approach|agree|contract|fee|rumou?r)\b/i;

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

export function parseRssItems(xml: string, maxItems: number): Omit<RawWireItem, "source" | "sourceLabel">[] {
  const items: Omit<RawWireItem, "source" | "sourceLabel">[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < maxItems) {
    const block = match[1];
    const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const linkMatch = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    const pubDateMatch = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
    const title = titleMatch ? decodeEntities(stripCdata(titleMatch[1].trim())) : "";
    const link = linkMatch ? linkMatch[1].trim() : "";
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : "";
    if (title && link) items.push({ title, link, pubDate });
  }
  return items;
}

function normalizeTitleKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function detectSource(link: string, label: string): { source: WireSource; sourceLabel: string } {
  const u = link.toLowerCase();
  const l = label.toLowerCase();
  if (u.includes("bbc.co.uk") || l.includes("bbc")) return { source: "bbc", sourceLabel: "BBC Sport" };
  if (u.includes("skysports") || l.includes("sky")) return { source: "sky", sourceLabel: "Sky Sports" };
  if (u.includes("espn") || l.includes("espn")) return { source: "espn", sourceLabel: "ESPN" };
  if (u.includes("google.com") || l.includes("google")) return { source: "google", sourceLabel: "Google News" };
  return { source: "other", sourceLabel: label || "News" };
}

function isTransferHeadline(title: string): boolean {
  return TRANSFER_RE.test(title);
}

async function fetchXml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "ScoutGamer/1.0 (transfer-wire)" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchGoogleNews(): Promise<RawWireItem[]> {
  const queries = ["football transfer rumors", "premier league transfer"];
  const out: RawWireItem[] = [];

  for (const q of queries) {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q + " soccer")}&hl=en&gl=US&ceid=US:en`;
    const xml = await fetchXml(url);
    if (!xml) continue;
    const raw = parseRssItems(xml, 20);
    for (const r of raw) {
      const { source, sourceLabel } = detectSource(r.link, r.title);
      out.push({
        ...r,
        source: source === "other" ? "google" : source,
        sourceLabel: sourceLabel === "News" ? "Google News" : sourceLabel,
      });
    }
  }
  return out;
}

async function fetchBbcFootball(): Promise<RawWireItem[]> {
  const xml = await fetchXml("https://feeds.bbci.co.uk/sport/football/rss.xml");
  if (!xml) return [];
  const raw = parseRssItems(xml, 40);
  return raw
    .filter((r) => isTransferHeadline(r.title))
    .map((r) => ({ ...r, source: "bbc" as const, sourceLabel: "BBC Sport" }));
}

async function fetchSkyTransfers(): Promise<RawWireItem[]> {
  const xml = await fetchXml("https://www.skysports.com/rss/12040");
  if (!xml) return [];
  const raw = parseRssItems(xml, 30);
  return raw.map((r) => ({ ...r, source: "sky" as const, sourceLabel: "Sky Sports" }));
}

export function mergeWireItems(sources: RawWireItem[], limit = 48): RawWireItem[] {
  const seen = new Set<string>();
  const merged: { item: RawWireItem; ts: number }[] = [];

  for (const item of sources) {
    const key = normalizeTitleKey(item.title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const ts = item.pubDate ? new Date(item.pubDate).getTime() : Date.now();
    if (Number.isNaN(ts)) continue;
    const fourteenDays = Date.now() - 14 * 24 * 60 * 60 * 1000;
    if (item.pubDate && ts < fourteenDays) continue;
    merged.push({ item, ts });
  }

  merged.sort((a, b) => b.ts - a.ts);
  return merged.slice(0, limit).map((m) => m.item);
}

export async function fetchAllTransferWireSources(): Promise<RawWireItem[]> {
  const [google, bbc, sky] = await Promise.all([
    fetchGoogleNews(),
    fetchBbcFootball(),
    fetchSkyTransfers(),
  ]);
  return mergeWireItems([...sky, ...bbc, ...google], 48);
}

export function relativeTimeLabel(pubDate: string): string {
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 14) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export function wireItemId(link: string, title: string): string {
  return `${normalizeTitleKey(title)}-${link.slice(-24)}`;
}
