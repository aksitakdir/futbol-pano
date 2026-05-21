/** Multi-source transfer rumor RSS — Google News, BBC, Sky, Guardian */

export type WireSource = "google" | "bbc" | "sky" | "espn" | "guardian" | "other";

/** Max headlines stored in cache (free RSS — no API cost) */
export const TRANSFER_WIRE_MAX_ITEMS = 80;

export const WIRE_SOURCE_LABELS: Record<WireSource, string> = {
  google: "Google News",
  bbc: "BBC Sport",
  sky: "Sky Sports",
  espn: "ESPN",
  guardian: "The Guardian",
  other: "News",
};

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

type ParsedItem = { title: string; link: string; pubDate: string; publisher?: string };

/** Min headlines kept per brand when merging (rest filled by date) */
const MIN_PER_BRAND = 8;

const GOOGLE_SITE_SOURCES: { site: string; source: WireSource; sourceLabel: string; query: string }[] = [
  { site: "bbc.co.uk", source: "bbc", sourceLabel: "BBC Sport", query: "site:bbc.co.uk football transfer" },
  { site: "skysports.com", source: "sky", sourceLabel: "Sky Sports", query: "site:skysports.com transfer" },
  { site: "theguardian.com", source: "guardian", sourceLabel: "The Guardian", query: "site:theguardian.com football transfer" },
  { site: "espn.com", source: "espn", sourceLabel: "ESPN", query: "site:espn.com soccer transfer" },
];

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
    const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
    const title = titleMatch ? decodeEntities(stripCdata(titleMatch[1].trim())) : "";
    link = decodeEntities(stripCdata(link));
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : "";
    const publisher = sourceMatch ? decodeEntities(stripCdata(sourceMatch[1].trim())) : undefined;
    if (title && link) items.push({ title, link, pubDate, publisher });
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

const PUBLISHER_HINTS: { re: RegExp; source: WireSource; sourceLabel: string }[] = [
  { re: /\bbbc\b/i, source: "bbc", sourceLabel: "BBC Sport" },
  { re: /sky\s*sports?/i, source: "sky", sourceLabel: "Sky Sports" },
  { re: /guardian/i, source: "guardian", sourceLabel: "The Guardian" },
  { re: /\bespn\b/i, source: "espn", sourceLabel: "ESPN" },
  { re: /goal\.com/i, source: "other", sourceLabel: "Goal" },
  { re: /fabrizio|romano/i, source: "other", sourceLabel: "Fabrizio Romano" },
];

function matchPublisherHint(text: string): { source: WireSource; sourceLabel: string } | null {
  for (const h of PUBLISHER_HINTS) {
    if (h.re.test(text)) return { source: h.source, sourceLabel: h.sourceLabel };
  }
  return null;
}

/** Google titles often end with " - BBC Sport" or " | Sky Sports" */
function detectSourceFromTitle(title: string): { source: WireSource; sourceLabel: string } | null {
  const tail = title.match(/\s[-–—|]\s*([^|–—-]+)$/);
  if (!tail) return null;
  return matchPublisherHint(tail[1]);
}

export function resolveWireSource(
  title: string,
  link: string,
  publisher = "",
): { source: WireSource; sourceLabel: string } {
  const fromTitle = detectSourceFromTitle(title);
  if (fromTitle) return fromTitle;

  const blob = `${publisher} ${title} ${link}`.toLowerCase();
  const fromHint = matchPublisherHint(blob);
  if (fromHint) return fromHint;

  const u = link.toLowerCase();
  const l = publisher.toLowerCase();
  if (u.includes("bbc.co.uk") || l.includes("bbc")) return { source: "bbc", sourceLabel: "BBC Sport" };
  if (u.includes("skysports") || l.includes("sky")) return { source: "sky", sourceLabel: "Sky Sports" };
  if (u.includes("theguardian") || l.includes("guardian")) return { source: "guardian", sourceLabel: "The Guardian" };
  if (u.includes("espn") || l.includes("espn")) return { source: "espn", sourceLabel: "ESPN" };
  if (u.includes("google.com")) return { source: "google", sourceLabel: "Google News" };
  return { source: "google", sourceLabel: publisher || "Google News" };
}

function isTransferHeadline(title: string): boolean {
  return TRANSFER_RE.test(title);
}

async function fetchXml(url: string, timeoutMs = 12000, simple = false): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(
      url,
      simple
        ? { next: { revalidate: 0 } }
        : { headers: FETCH_HEADERS, cache: "no-store", signal: controller.signal },
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.includes("<")) return null;
    if (!simple && text.length < 120) return null;
    return text;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

function toWireItems(raw: ParsedItem[], source: WireSource, sourceLabel: string): RawWireItem[] {
  return raw.map((r) => ({ ...r, source, sourceLabel }));
}

/** Google News — same fetch style as /api/news (works on Vercel) */
async function fetchGoogleNews(): Promise<RawWireItem[]> {
  const queries = [
    "football transfer rumors",
    "premier league transfer news",
    "soccer transfer window",
    "transfer gossip",
  ];
  const out: RawWireItem[] = [];

  for (const q of queries) {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(`${q} soccer`)}&hl=en&gl=US&ceid=US:en`;
    const xml = await fetchXml(url, 10000, true);
    if (!xml) continue;
    const raw = parseFeedXml(xml, 25);
    for (const r of raw) {
      const { source, sourceLabel } = resolveWireSource(r.title, r.link, r.publisher ?? "");
      out.push({ ...r, source, sourceLabel });
    }
  }
  return out;
}

/** Brand headlines via Google site: search (works on Vercel when direct RSS is blocked) */
async function fetchGoogleSiteNews(): Promise<RawWireItem[]> {
  const out: RawWireItem[] = [];
  for (const { source, sourceLabel, query } of GOOGLE_SITE_SOURCES) {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en&gl=US&ceid=US:en`;
    const xml = await fetchXml(url, 10000, true);
    if (!xml) continue;
    const raw = parseFeedXml(xml, 20);
    for (const r of raw) {
      const resolved = resolveWireSource(r.title, r.link, r.publisher ?? sourceLabel);
      out.push({
        ...r,
        source: resolved.source === "google" ? source : resolved.source,
        sourceLabel: resolved.source === "google" ? sourceLabel : resolved.sourceLabel,
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
  return toWireItems(transfer.slice(0, 35), "bbc", "BBC Sport");
}

async function fetchEspnSoccer(): Promise<RawWireItem[]> {
  const urls = [
    "https://www.espn.com/espn/rss/soccer/news",
    "https://www.espn.com/espn/rss/news",
  ];
  for (const url of urls) {
    const xml = await fetchXml(url);
    if (!xml) continue;
    const raw = parseFeedXml(xml, 40);
    const transfer = raw.filter((r) => isTransferHeadline(r.title));
    if (transfer.length > 0) return toWireItems(transfer.slice(0, 30), "espn", "ESPN");
  }
  return [];
}

async function fetchSkyTransfers(): Promise<RawWireItem[]> {
  const urls = [
    "https://www.skysports.com/rss/12040",
    "https://www.skysports.com/rss/0,20514,11661,00.xml",
  ];
  for (const url of urls) {
    const xml = await fetchXml(url);
    if (!xml) continue;
    const raw = parseFeedXml(xml, 45);
    if (raw.length > 0) return toWireItems(raw, "sky", "Sky Sports");
  }
  return [];
}

async function fetchGuardianFootball(): Promise<RawWireItem[]> {
  const xml = await fetchXml("https://www.theguardian.com/football/rss");
  if (!xml) return [];
  const raw = parseFeedXml(xml, 40);
  const transfer = raw.filter((r) => isTransferHeadline(r.title));
  return toWireItems(transfer.slice(0, 30), "guardian", "The Guardian");
}

function dedupeWirePool(sources: RawWireItem[]): { item: RawWireItem; ts: number }[] {
  const seen = new Set<string>();
  const merged: { item: RawWireItem; ts: number }[] = [];

  for (const item of sources) {
    const key = normalizeTitleKey(item.title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    let ts = item.pubDate ? new Date(item.pubDate).getTime() : Date.now();
    if (Number.isNaN(ts)) ts = Date.now();
    const thirtyDays = Date.now() - 30 * 24 * 60 * 60 * 1000;
    if (item.pubDate && !Number.isNaN(new Date(item.pubDate).getTime()) && ts < thirtyDays) continue;
    merged.push({ item, ts });
  }

  merged.sort((a, b) => b.ts - a.ts);
  return merged;
}

/** Keep a fair share per BBC/Sky/Guardian/ESPN so the feed does not look Google-only */
export function mergeWireItems(sources: RawWireItem[], limit = TRANSFER_WIRE_MAX_ITEMS): RawWireItem[] {
  const pool = dedupeWirePool(sources);
  const brands: WireSource[] = ["bbc", "sky", "guardian", "espn"];
  const picked: RawWireItem[] = [];
  const pickedKeys = new Set<string>();

  const take = (list: typeof pool, max: number) => {
    let n = 0;
    for (const row of list) {
      if (n >= max) break;
      const key = normalizeTitleKey(row.item.title);
      if (pickedKeys.has(key)) continue;
      pickedKeys.add(key);
      picked.push(row.item);
      n++;
    }
  };

  for (const brand of brands) {
    take(
      pool.filter((r) => r.item.source === brand),
      MIN_PER_BRAND,
    );
  }

  for (const row of pool) {
    if (picked.length >= limit) break;
    const key = normalizeTitleKey(row.item.title);
    if (pickedKeys.has(key)) continue;
    pickedKeys.add(key);
    picked.push(row.item);
  }

  return picked.slice(0, limit);
}

/** Extra Google queries when primary sources return few items (still free) */
export async function fetchGoogleNewsFallback(limit = 30): Promise<RawWireItem[]> {
  const queries = ["football transfer", "transfer gossip soccer"];
  const out: RawWireItem[] = [];
  for (const q of queries) {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(`${q} soccer`)}&hl=en&gl=US&ceid=US:en`;
    const xml = await fetchXml(url, 10000, true);
    if (!xml) continue;
    const raw = parseFeedXml(xml, 40);
    for (const r of raw) {
      const { source, sourceLabel } = resolveWireSource(r.title, r.link, r.publisher ?? "");
      out.push({ ...r, source, sourceLabel });
    }
  }
  return mergeWireItems(out, limit);
}

export async function fetchAllTransferWireSources(): Promise<RawWireItem[]> {
  const [google, siteBranded, sky, bbc, guardian, espn] = await Promise.all([
    fetchGoogleNews(),
    fetchGoogleSiteNews(),
    fetchSkyTransfers(),
    fetchBbcFootball(),
    fetchGuardianFootball(),
    fetchEspnSoccer(),
  ]);

  const all: RawWireItem[] = [...google, ...siteBranded, ...sky, ...bbc, ...guardian, ...espn];
  let merged = mergeWireItems(all, TRANSFER_WIRE_MAX_ITEMS);

  if (merged.length < 20) {
    const extra = await fetchGoogleNewsFallback(40);
    merged = mergeWireItems([...merged, ...extra], TRANSFER_WIRE_MAX_ITEMS);
  }
  return merged;
}

/** Avoid RangeError when RSS pubDate is malformed (was breaking production sync) */
export function safePublishedIso(pubDate: string): string {
  if (!pubDate?.trim()) return "";
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return d.toISOString();
  } catch {
    return "";
  }
}

export type WireTimeBucket = "newest" | "recent" | "earlier";

export const WIRE_TIME_BUCKET_LABELS: Record<WireTimeBucket, string> = {
  newest: "Newest",
  recent: "Recent",
  earlier: "Earlier",
};

export function wireTimeBucket(publishedAt: string): WireTimeBucket {
  if (!publishedAt) return "recent";
  const d = new Date(publishedAt);
  if (Number.isNaN(d.getTime())) return "recent";

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);
  const startWeek = new Date(startToday);
  startWeek.setDate(startWeek.getDate() - 7);

  // Today + prior calendar day → one fresh block (no "Yesterday" label)
  if (d >= startYesterday) return "newest";
  if (d >= startWeek) return "recent";
  return "earlier";
}

export function groupHeadlinesByTime<T extends { publishedAt: string }>(
  items: T[],
): { bucket: WireTimeBucket; label: string; items: T[] }[] {
  const order: WireTimeBucket[] = ["newest", "recent", "earlier"];
  const map = new Map<WireTimeBucket, T[]>();
  for (const item of items) {
    const b = wireTimeBucket(item.publishedAt);
    const list = map.get(b) ?? [];
    list.push(item);
    map.set(b, list);
  }
  return order
    .filter((b) => (map.get(b)?.length ?? 0) > 0)
    .map((b) => ({ bucket: b, label: WIRE_TIME_BUCKET_LABELS[b], items: map.get(b)! }));
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
