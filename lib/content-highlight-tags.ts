import { stripHtml } from "@/lib/utils";

/** Card pill length / word-count caps */
const MAX_TAG_CHARS = 30;
const MAX_WORDS = 3;

/** Stopwords — single-word pills that carry no meaning on their own */
const STOP = new Set([
  "the", "and", "for", "with", "from", "this", "that", "have", "has", "was", "were",
  "also", "into", "their", "they", "them", "will", "each", "both", "than", "when",
  "what", "which", "while", "about", "after", "before", "over", "under", "such",
]);

/** Half of a compound name / meaningless alone (e.g. "league" in "Premier League") */
const FRAGMENT_ONLY = new Set([
  "league", "leagues",
  "la", "de", "del", "el",
]);

/** Discourse bridges — meaningless as a pill */
const BAD_PHRASES = new Set([
  "more specifically",
  "specifically",
  "in general",
  "another",
  "in other words",
  "that said",
  "in this context",
  "in this sense",
  "similarly",
  "in addition",
  "in summary",
]);

/** Merge when two halves of a compound show up as separate pills (bold-split fix) */
const COMPOUND_MERGE: { left: string; right: string; merged: string }[] = [
  { left: "champions", right: "league", merged: "Champions League" },
  { left: "premier", right: "league", merged: "Premier League" },
  { left: "europa", right: "league", merged: "Europa League" },
  { left: "nations", right: "league", merged: "Nations League" },
  { left: "la", right: "liga", merged: "La Liga" },
  { left: "serie", right: "a", merged: "Serie A" },
];

function mulberry32(seed: number) {
  let state = seed;
  return function () {
    let t = (state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function cleanSnippet(raw: string): string {
  return stripHtml(raw)
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLabel(t: string): string {
  let s = cleanSnippet(t);
  if (!s) return "";
  s = s.replace(/^[:;.,–—\-]+/u, "").replace(/[:;.,–—\-]+$/u, "").trim();
  if (!s) return "";
  if (s.length > MAX_TAG_CHARS) s = s.slice(0, MAX_TAG_CHARS - 1).trim() + "…";
  return s;
}

function isBadDiscourse(lower: string): boolean {
  return BAD_PHRASES.has(lower);
}

function isLowQualityPhrase(s: string): boolean {
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length > MAX_WORDS) return true;
  if (isBadDiscourse(s.toLowerCase().trim())) return true;
  return false;
}

function mergeCompoundTags(tags: string[]): string[] {
  let pool = [...tags];
  const lowered = () => new Set(pool.map((t) => t.toLowerCase()));

  for (const { left, right, merged } of COMPOUND_MERGE) {
    if (!merged) continue;
    const set = lowered();
    if (!set.has(left) || !set.has(right)) continue;
    pool = pool.filter((t) => {
      const lo = t.toLowerCase();
      return lo !== left && lo !== right;
    });
    pool.push(merged);
  }

  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of pool) {
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
  }
  return out;
}

function isUsableTag(t: string): boolean {
  const s = t.trim();
  /** Keep single-letter league tiers like Serie **A** before they are merged */
  const okShort = s.length === 1 && /^[A-Z]$/i.test(s);
  if ((!okShort && s.length < 2) || s.length > MAX_TAG_CHARS) return false;
  if (/^[\d\s.%\-–—:]+$/.test(s)) return false;
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length > MAX_WORDS) return false;
  const lower = s.toLowerCase();
  if (isBadDiscourse(lower)) return false;
  if (words.length === 1) {
    if (STOP.has(lower)) return false;
    if (FRAGMENT_ONLY.has(lower)) return false;
  }
  if (isLowQualityPhrase(s)) return false;
  return true;
}

function shuffleDeterministic<T>(arr: T[], seedStr: string): T[] {
  const out = [...arr];
  const rnd = mulberry32(hashSeed(seedStr || "sg"));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type ExtractHighlightOptions = {
  /** Max pills to pick (suggested: 3–4) */
  max?: number;
  /** Stable "random" order for the same content */
  seed?: string;
};

/**
 * Collects candidate player/concept phrases from HTML or plain text:
 * - **markdown bold**
 * - <strong>, <b>, <mark>
 * - Short <h2>/<h3> headings
 * - Single-line <li> fragments (first clause / before a comma)
 */
export function extractHighlightTags(raw: string | undefined | null, opts: ExtractHighlightOptions = {}): string[] {
  /** Card cap is separate; a higher max can be passed here for a wider pool */
  const max = Math.min(opts.max ?? 4, 32);
  const seed = opts.seed ?? "";
  const s = raw ?? "";
  if (!s.trim()) return [];

  const candidates: string[] = [];

  for (const m of s.matchAll(new RegExp(`\\*\\*([^*]{2,${MAX_TAG_CHARS}})\\*\\*`, "g"))) {
    const x = normalizeLabel(m[1] ?? "");
    if (x) candidates.push(x);
  }

  for (const m of s.matchAll(/<(?:strong|b|mark)\b[^>]*>([\s\S]*?)<\/(?:strong|b|mark)>/gi)) {
    const x = normalizeLabel(m[1] ?? "");
    if (x) candidates.push(x);
  }

  for (const m of s.matchAll(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/gi)) {
    const x = normalizeLabel(m[1] ?? "");
    if (x && x.length <= MAX_TAG_CHARS + 1) candidates.push(x);
  }

  for (const m of s.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
    let line = normalizeLabel(m[1] ?? "");
    const cut = line.split(/[,:;—\-–]/)[0]?.trim() ?? line;
    line = cut.length >= 2 ? cut : line;
    if (line.length >= 3 && line.length <= MAX_TAG_CHARS + 1) candidates.push(line);
  }

  const merged = mergeCompoundTags(candidates);

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const c of merged) {
    if (!isUsableTag(c)) continue;
    const key = c.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(c);
  }

  const shuffled = shuffleDeterministic(unique, seed + unique.length);
  return shuffled.slice(0, max);
}

function tokensFromTitleHint(title: string, seen: Set<string>, maxAdd: number): string[] {
  const cleaned = cleanSnippet(title);
  /** Split the title on separators — keep compounds like "Champions League" intact */
  const parts = cleaned
    .split(/\s*[·|:–—,/]+\s*/u)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks = parts.length ? parts : [cleaned];

  const rough: string[] = [];
  for (const chunk of chunks) {
    const x =
      chunk.length > MAX_TAG_CHARS ? `${chunk.slice(0, MAX_TAG_CHARS - 1).trim()}…` : chunk;
    if (!isUsableTag(x)) continue;
    const k = x.toLowerCase();
    if (seen.has(k)) continue;
    rough.push(x);
    if (rough.length >= maxAdd) break;
  }

  const merged = mergeCompoundTags(rough);
  const result: string[] = [];
  for (const t of merged) {
    if (!isUsableTag(t)) continue;
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    result.push(t);
    if (result.length >= maxAdd) break;
  }
  return result;
}

export type ArticleHighlightOptions = ExtractHighlightOptions & {
  /** If the body yields too few pills, derive phrases from the title */
  titleHint?: string;
};

/**
 * Card pills: structured highlights + plain-text comma/·/— splits + optional title hint.
 */
export function extractArticleHighlights(raw: string | undefined | null, opts: ArticleHighlightOptions = {}): string[] {
  const max = Math.min(opts.max ?? 4, 4);
  const seed = opts.seed ?? "";

  const structuredRaw = extractHighlightTags(raw, { max: max + 8, seed });
  const structured = mergeCompoundTags(structuredRaw).filter(isUsableTag);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of structured) {
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= max) break;
  }

  const plain = stripHtml(raw ?? "").replace(/\s+/g, " ").trim();
  /** If few structured candidates, fall back to plain-text comma splits */
  if (plain && out.length < max && structuredRaw.length < 2) {
    const chunks = plain.split(/\s*[,;]\s*|\s*·\s+|\s+—\s+|\s+–\s+/);
    const normalized = mergeCompoundTags(chunks.map((c) => normalizeLabel(c)).filter(Boolean));
    const candidates = shuffleDeterministic(
      normalized.filter((c) => isUsableTag(c)),
      seed + "plain",
    );
    for (const c of candidates) {
      if (out.length >= max) break;
      const k = c.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(c);
    }
  }

  if (out.length < max && opts.titleHint?.trim()) {
    out.push(...tokensFromTitleHint(opts.titleHint, seen, max - out.length));
  }

  const mergedFinal = mergeCompoundTags(out).filter(isUsableTag);
  const finalSeen = new Set<string>();
  const finalOut: string[] = [];
  for (const t of mergedFinal) {
    const k = t.toLowerCase();
    if (finalSeen.has(k)) continue;
    finalSeen.add(k);
    finalOut.push(t);
    if (finalOut.length >= max) break;
  }

  return shuffleDeterministic(finalOut, `${seed}-pick`).slice(0, max);
}

/** Card-grid accent cycle — lists, radar, tactics lab, etc. */
export const HIGHLIGHT_CARD_ACCENTS_CYCLE = [
  "var(--accent-2)",
  "var(--sky)",
  "var(--rose)",
  "var(--emerald)",
  "var(--amber)",
  "var(--cyan)",
] as const;

/** @deprecated — use HIGHLIGHT_CARD_ACCENTS_CYCLE */
export const TACTICS_CARD_ACCENTS = HIGHLIGHT_CARD_ACCENTS_CYCLE;
