/** Multi-source transfer rumor RSS — Google News, BBC, Sky, Guardian */

export type WireSource = "google" | "bbc" | "sky" | "espn" | "guardian" | "other";

export type RawWireItem = {
  title: string;
  link: string;
  source: WireSource;
  sourceLabel: string;
  pubDate: string;
};

const TRANSFER_RE =
  /\b(transfer|signing|signed|deal|loan|move|bid|target|approach|agree|contract|fee|rumou?r|swoop)\b/i;

const FETCH_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (compatible; ScoutGamer/1.0; +https://scoutgamer.com) AppleWebKit/537.36",
  Accept: "application/rss+xml, application/xml, text/xml, application/atom+xml, */*",
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

type ParsedItem = { title: string; link: string; pubDate: string };

/** RSS 2.0 <item> blocks */
function parseRssItems(xml: string, maxItems: number): ParsedItem[] {
  const items: ParsedItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < maxItems) {
    const block = match[1];
    const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    let link =
      block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]?.trim() ??
      block.match(/<guid[^>]*isPermaLink="true"[^>]*>([\s\S]*?)<\/guid>/i)?.[1]?.trim() ??
      "";
    const pubDateMatch = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
    const title = titleMatch ? decodeEntities(stripCdata(titleMatch[1].trim())) : "";
    link = decodeEntities(stripCdata(link));
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : "";
    if (title && link) items.push({ title, link, pubDate });
  }
  return items;
}

/** Atom <entry> blocks (some Google feeds) */
function parseAtomEntries(xml: string, maxItems: number): ParsedItem[] {
  const items: ParsedItem[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
  let match;
  while ((match = entryRegex.exec(xml)) !== null && items.length < maxItems) {
    const block = match[1];
    const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const linkMatch =
      block.match(/<link[^>]+href="([^"]+)"/i) ??
      block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    const dateMatch =
      block.match(/<published[^>]*>([\s\S]*?)<\/published>/i) ??
      block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i);
    const title = titleMatch ? decodeEntities(stripCdata(titleMatch[1].trim())) : "";
    const link = linkMatch ? decodeEntities(linkMatch[1].trim()) : "";
    const pubDate = dateMatch ? dateMatch[1].trim() : "";
    if (title && link) items.push({ title, link, pubDate });
  }
  return items;
}

function parseFeedXml(xml: string, maxItems: number): ParsedItem[] {
  const rss = parseRssItems(xml, maxItems);
  if (rss.length > 0) return rss;
  return parseAtomEntries(xml, maxItems);
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
  if (u.includes("theguardian") || l.includes("guardian")) return { source: "guardian", sourceLabel: "The Guardian" };
  if (u.includes("espn") || l.includes("espn")) return { source: "espn", sourceLabel: "ESPN" };
  if (u.includes("google.com") || l.includes("google")) return { source: "google", sourceLabel: "Google News" };
  return { source: "other", sourceLabel: label || "News" };
}

function isTransferHeadline(title: string): boolean {
  return TRANSFER_RE.test(title);
}

async function fetchXml(url: string, timeoutMs = 12000): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: FETCH_HEADERS,
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.includes("<") || text.length < 200) return null;
    return text;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

function toWireItems(raw: ParsedItem[], source: WireSource, sourceLabel: string): RawWireItem[] {
  return raw.map((r) => ({ ...r, source, sourceLabel }));
}

async function fetchGoogleNews(): Promise<RawWireItem[]> {
  const queries = [
    "football transfer rumors",
    "premier league transfer news",
    "soccer transfer window",
  ];
  const out: RawWireItem[] = [];

  for (const q of queries) {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en&gl=US&ceid=US:en`;
    const xml = await fetchXml(url);
    if (!xml) continue;
    const raw = parseFeedXml(xml, 25);
    for (const r of raw) {
      const { source, sourceLabel } = detectSource(r.link, "");
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
  const raw = parseFeedXml(xml, 50);
  const transfer = raw.filter((r) => isTransferHeadline(r.title));
  return toWireItems(transfer.slice(0, 25), "bbc", "BBC Sport");
}

async function fetchSkyTransfers(): Promise<RawWireItem[]> {
  const urls = [
    "https://www.skysports.com/rss/12040",
    "https://www.skysports.com/rss/0,20514,11661,00.xml",
  ];
  for (const url of urls) {
    const xml = await fetchXml(url);
    if (!xml) continue;
    const raw = parseFeedXml(xml, 30);
    if (raw.length > 0) return toWireItems(raw, "sky", "Sky Sports");
  }
  return [];
}

async function fetchGuardianFootball(): Promise<RawWireItem[]> {
  const xml = await fetchXml("https://www.theguardian.com/football/rss");
  if (!xml) return [];
  const raw = parseFeedXml(xml, 40);
  const transfer = raw.filter((r) => isTransferHeadline(r.title));
  return toWireItems(transfer.slice(0, 20), "guardian", "The Guardian");
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
    const thirtyDays = Date.now() - 30 * 24 * 60 * 60 * 1000;
    if (item.pubDate && ts < thirtyDays) continue;
    merged.push({ item, ts });
  }

  merged.sort((a, b) => b.ts - a.ts);
  return merged.slice(0, limit).map((m) => m.item);
}

export async function fetchAllTransferWireSources(): Promise<RawWireItem[]> {
  const results = await Promise.allSettled([
    fetchSkyTransfers(),
    fetchBbcFootball(),
    fetchGuardianFootball(),
    fetchGoogleNews(),
  ]);

  const all: RawWireItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  return mergeWireItems(all, 48);
}

export function relativeTimeLabel(pubDate: string): string {
  if (!pubDate) return "recent";
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return "recent";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export function wireItemId(link: string, title: string): string {
  return `${normalizeTitleKey(title)}-${link.slice(-24)}`;
}
