import { stripHtml } from "@/lib/utils";

/** Kart pill uzunluk / kelime üst sınırları */
const MAX_TAG_CHARS = 30;
const MAX_WORDS = 3;

/** Liste / makale gövdelerinden kart pill’leri için kısa etiketler çıkarır */
const STOP = new Set([
  "the", "and", "for", "with", "from", "this", "that", "have", "has", "was", "were",
  "bir", "bu", "şu", "ve", "ile", "için", "olan", "üzerinde", "gibi", "çok", "daha",
  "also", "into", "their", "they", "them", "will", "each", "both", "than", "when",
  "olarak", "yani", "özellikle", "spesifik", "genel",
]);

/** Tek başına anlamsız / bileşik ismin yarısı olarak sık görülen parçalar */
const FRAGMENT_ONLY = new Set([
  "ligi", "lig", "ligde", "ligden", "ligine", "ligini", "liginde", "liginden",
  "ligler", "liglerde", "liglerden",
  "league", "leagues",
  "la", "de", "del",
]);

/** Anlatım köprüsü — pill olarak anlamsız */
const BAD_PHRASES = new Set([
  "daha spesifik olarak",
  "spesifik olarak",
  "genel olarak",
  "bir diğer",
  "bir başka",
  "daha doğrusu",
  "bu bağlamda",
  "bu anlamda",
  "aynı şekilde",
  "bunun yanında",
  "özetle",
]);

/** İyelik + tek sıfat/renk kalıntısı (örn. topun kırmızı) */
const TR_POSS_END = /(ın|in|un|ün|nın|nin|nun|nün)$/iu;
const FRAGILE_TAIL_WORD = new Set([
  "kırmızı", "beyaz", "siyah", "mavi", "yeşil", "turuncu", "mor", "pembe", "gri",
  "kahverengi", "sarı", "lacivert",
  "büyük", "küçük", "uzun", "kısa", "yeni", "eski", "iyi", "kötü", "hızlı", "yavaş",
  "yüksek", "düşük", "ön", "arka",
]);

/** İki ayrı pill olarak göründüğünde birleştir (kalın metin vb. bölünmüş düzeltmesi) */
const COMPOUND_MERGE: { left: string; right: string; merged: string }[] = [
  { left: "şampiyonlar", right: "ligi", merged: "Şampiyonlar Ligi" },
  { left: "premier", right: "league", merged: "Premier League" },
  { left: "europa", right: "league", merged: "Europa League" },
  { left: "la", right: "liga", merged: "La Liga" },
  { left: "serie", right: "a", merged: "Serie A" },
];

const TR_FRAGMENT_TAIL =
  /(ların|lerin|ları|leri|nın|nin|nun|nün|ın|in|un|ün)$/iu;
/** Fiilimsi / göreli cümlecik kalıntıları — uzun tanımlayıcı öbekleri ele */
const TR_VERBISH =
  /\b(okuyan|eden|olan|yapan|geçen|bilen|meyen|meli|malı|mış|miş|muş|müş|almak|vermek)\b/iu;

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
  if (BAD_PHRASES.has(lower)) return true;
  if (/^daha\s+\S+\s+olarak$/u.test(lower)) return true;
  return false;
}

function isGenitiveFragment(words: string[]): boolean {
  if (words.length !== 2) return false;
  const [a, b] = words;
  const aTrim = a.trim();
  const blo = b.toLowerCase();
  if (!TR_POSS_END.test(aTrim)) return false;
  if (!/[ğüşıöçİı]/iu.test(aTrim) && !/[ğüşıöçİı]/iu.test(b)) return false;
  return FRAGILE_TAIL_WORD.has(blo);
}

function isLowQualityPhrase(s: string): boolean {
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length > MAX_WORDS) return true;
  const lower = s.toLowerCase().trim();
  if (isBadDiscourse(lower)) return true;
  if (isGenitiveFragment(words)) return true;
  const last = words[words.length - 1] ?? "";
  if (words.length >= 3 && TR_FRAGMENT_TAIL.test(last)) return true;
  if (words.length >= 3 && TR_VERBISH.test(s)) return true;
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
  /** Serie **A** gibi tek harf lig katları birleştirmeden önce havuzda kalabilsin */
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
  /** Seçilecek maksimum pill sayısı (öneri: 3–4) */
  max?: number;
  /** Aynı içerik için kararlı “rastgele” sıra */
  seed?: string;
};

/**
 * HTML veya düz metinden oyuncu/kavram adayı öbekleri toplar:
 * - **markdown kalın**
 * - &lt;strong&gt;, &lt;b&gt;, &lt;mark&gt;
 * - Kısa &lt;h2&gt;/&lt;h3&gt; başlıkları
 * - Tek satırlık &lt;li&gt; parçaları (ilk cümle / virgül öncesi)
 */
export function extractHighlightTags(raw: string | undefined | null, opts: ExtractHighlightOptions = {}): string[] {
  /** Kartta gösterilen üst sınır ayrı; burada daha geniş havuz için yüksek max geçilebilir */
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
  /** Başlığı kelime kelime bölme — "Şampiyonlar Ligi" gibi bileşikleri koru */
  const parts = cleaned
    .split(/\s*[·|:\u2013\u2014,/]+\s*/u)
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
  /** İçerikten yeterli pill çıkmazsa başlıktan kelime öbekleri dener */
  titleHint?: string;
};

/**
 * Kart pill’leri: yapılandırılmış vurgular + düz metinde virgül/·/— bölmeleri + isteğe bağlı başlık ipucu.
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
  /** Yapılandırılmış aday azsa düz metin virgül bölmelerini kullan */
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

/** Kart grid accent döngüsü — listeler, radar, taktik lab, vb. */
export const HIGHLIGHT_CARD_ACCENTS_CYCLE = [
  "var(--accent-2)",
  "var(--sky)",
  "var(--rose)",
  "var(--emerald)",
  "var(--amber)",
  "var(--cyan)",
] as const;

/** @deprecated — HIGHLIGHT_CARD_ACCENTS_CYCLE kullanın */
export const TACTICS_CARD_ACCENTS = HIGHLIGHT_CARD_ACCENTS_CYCLE;
