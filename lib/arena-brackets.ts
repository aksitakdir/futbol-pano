/**
 * Arena (Oyna & Paylaş) — Supabase-backed arena games.
 * Legacy static types kept for backward compat during migration.
 */

// ─── Supabase types ───────────────────────────────────────────────────────────

export type ArenaGameStatus = "published" | "draft";
export type ArenaGameType = "random_16" | "random_32" | "random_64" | "fixed_8";
export type ArenaCardColor = "primary" | "secondary" | "tertiary" | "amber" | "rose";

export type ArenaParticipant = {
  name: string;
  subtitle?: string;
  photo_url?: string;
  vs?: string; // fixed_8 only
};

export type ArenaGame = {
  id: string;
  slug: string;
  status: ArenaGameStatus;
  title_tr: string;
  title_en: string;
  description_tr: string;
  description_en: string;
  hero_title_tr: string;
  hero_title_en: string;
  hero_teaser_tr: string;
  hero_teaser_en: string;
  card_color: ArenaCardColor;
  participants: ArenaParticipant[];
  game_type: ArenaGameType;
  hub_tags?: string[];
  team_slug?: string | null;
  created_at: string;
};

// ─── Color map ────────────────────────────────────────────────────────────────

export const CARD_COLOR_MAP: Record<ArenaCardColor, string> = {
  primary:   "var(--sg-primary)",
  secondary: "var(--sg-secondary)",
  tertiary:  "var(--sg-tertiary)",
  amber:     "var(--sg-amber)",
  rose:      "var(--sg-rose, #fb7185)",
};

export const CARD_COLOR_OPTIONS: { value: ArenaCardColor; label: string; css: string }[] = [
  { value: "primary",   label: "Primary (Yeşil)",  css: "var(--sg-primary)" },
  { value: "secondary", label: "Secondary (Mavi)", css: "var(--sg-secondary)" },
  { value: "tertiary",  label: "Tertiary (Mor)",   css: "var(--sg-tertiary)" },
  { value: "amber",     label: "Amber (Sarı)",     css: "var(--sg-amber)" },
  { value: "rose",      label: "Rose (Pembe)",     css: "var(--sg-rose, #fb7185)" },
];

/** Tek bir arena oyununun detay URL'i (`?lang=en` ile İngilizce istemci metni). */
export function arenaPath(slug: string): string {
  const s = String(slug ?? "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  return `/arena/${s}`;
}

// ─── Path helper ──────────────────────────────────────────────────────────────

export function bracketParticipantCount(gameType: ArenaGameType): number {
  switch (gameType) {
    case "fixed_8":
      return 8;
    case "random_64":
      return 64;
    case "random_32":
      return 32;
    default:
      return 16;
  }
}

/**
 * UI tur isimleri için bracket boyutu (fixed_8 → 16 oyunculu turnuva ile aynı tur yapısı).
 */
export function bracketLabelSize(gameType: ArenaGameType, normalizedRandomCount: number): number {
  if (gameType === "fixed_8") return 16;
  return normalizedRandomCount;
}

/** Son X / Quarter… tur etiketleri */
export function arenaRoundNames(bracketSize: 16 | 32 | 64, lang: "tr" | "en"): string[] {
  const TR: Record<16 | 32 | 64, string[]> = {
    64: ["Son 64", "Son 32", "Son 16", "Çeyrek Final", "Yarı Final", "Final"],
    32: ["Son 32", "Son 16", "Çeyrek Final", "Yarı Final", "Final"],
    16: ["Son 16", "Çeyrek Final", "Yarı Final", "Final"],
  };
  const EN: Record<16 | 32 | 64, string[]> = {
    64: ["Round of 64", "Round of 32", "Round of 16", "Quarter-Final", "Semi-Final", "Final"],
    32: ["Round of 32", "Round of 16", "Quarter-Final", "Semi-Final", "Final"],
    16: ["Round of 16", "Quarter-Final", "Semi-Final", "Final"],
  };
  return lang === "en" ? EN[bracketSize] : TR[bracketSize];
}

export function arenaNextRoundHeading(roundNames: string[], roundIndex: number, lang: "tr" | "en"): string {
  const next = roundNames[roundIndex + 1];
  if (!next) return "";
  return lang === "en" ? `${next} begins!` : `${next} başlıyor!`;
}

/** Oyuncu sayısına göre tur başlıkları (2’nin kuvveti; 8–64). */
export function arenaRoundNamesForCount(n: number, lang: "tr" | "en"): string[] {
  if (n >= 64) return arenaRoundNames(64, lang);
  if (n >= 32) return arenaRoundNames(32, lang);
  if (n >= 16) return arenaRoundNames(16, lang);
  if (n >= 8) {
    return lang === "en"
      ? ["Quarter-Final", "Semi-Final", "Final"]
      : ["Çeyrek Final", "Yarı Final", "Final"];
  }
  if (n >= 4) {
    return lang === "en" ? ["Semi-Final", "Final"] : ["Yarı Final", "Final"];
  }
  return lang === "en" ? ["Final"] : ["Final"];
}

export type ArenaParticipantInput = {
  name?: string;
  subtitle?: string;
  photo_url?: string;
  vs?: string;
};

/** Tekilleştirilmiş bracket listesi (fixed_8: en fazla 8 satır; random*: 2’nin kuvvetine kırpılır). */
export function normalizeArenaParticipants(participants: ArenaParticipantInput[], gameType: ArenaGameType): ArenaParticipantInput[] {
  const cap = bracketParticipantCount(gameType);
  const filtered = participants.filter((p) => String(p.name ?? "").trim());
  if (gameType === "fixed_8") return filtered.slice(0, 8);
  const raw = filtered.slice(0, cap);
  if (raw.length < 2) return raw;
  let pow2 = 1;
  while (pow2 * 2 <= raw.length) pow2 *= 2;
  return raw.slice(0, pow2);
}

// ─── Legacy backward-compat types ────────────────────────────────────────────
// Kept so old imports don't break while we migrate

export type ArenaBracketSlug =
  | "gelecek-yildizlar"
  | "sampiyonlar-ligi"
  | "teknik-direktor"
  | "super-lig-efsaneleri"
  | "turkiyede-en-iyi-yabancilar";

export type ArenaBracketConfig = {
  slug: ArenaBracketSlug;
  queryT: "stars" | "ucl" | "managers" | "legends" | "foreigners";
  cardTitle: string;
  cardDescription: string;
  cardTitleEn: string;
  cardDescriptionEn: string;
  heroTitle: string;
  heroTeaser: string;
  heroTitleEn: string;
  heroTeaserEn: string;
};

export const ARENA_BRACKETS: ArenaBracketConfig[] = [
  {
    slug: "gelecek-yildizlar",
    queryT: "stars",
    cardTitle: "Gelecek Yıldızlar",
    cardDescription: "16 genç yetenek; her açılışta rastgele eşleşmeler. Yamal'dan Mainoo'ya sen kimin şampiyon olacağını seç.",
    cardTitleEn: "Future Stars",
    cardDescriptionEn: "16 young talents; random matchups every time. From Yamal to Mainoo — you pick who becomes champion.",
    heroTitle: "Gelecek Yıldızlar Turnuvası",
    heroTeaser: "16 isim, tek şampiyon. Sen seç.",
    heroTitleEn: "Future Stars Tournament",
    heroTeaserEn: "16 names, one champion. You decide.",
  },
  {
    slug: "sampiyonlar-ligi",
    queryT: "ucl",
    cardTitle: "Şampiyonlar Ligi 25-26",
    cardDescription: "25-26 sezonu son 16 eşleşmeleriyle sabit bracket — kupayı hangi takıma veriyorsun?",
    cardTitleEn: "Champions League 25–26",
    cardDescriptionEn: "Fixed bracket with the 25–26 season round of 16 — which club lifts the trophy?",
    heroTitle: "Şampiyonlar Ligi 25-26",
    heroTeaser: "Kupayı kime veriyorsun?",
    heroTitleEn: "Champions League 25–26",
    heroTeaserEn: "Who lifts the trophy?",
  },
  {
    slug: "teknik-direktor",
    queryT: "managers",
    cardTitle: "Teknik Direktör Arenası",
    cardDescription: "Guardiola'dan Mourinho'ya 16 teknik direktör; her seferinde rastgele çiftler.",
    cardTitleEn: "Manager Arena",
    cardDescriptionEn: "16 managers from Guardiola to Mourinho; random pairings every run.",
    heroTitle: "Teknik Direktör Arenası",
    heroTeaser: "Tarihin en iyi teknik direktörü kim?",
    heroTitleEn: "Manager Arena",
    heroTeaserEn: "Who is the greatest manager of all time?",
  },
  {
    slug: "super-lig-efsaneleri",
    queryT: "legends",
    cardTitle: "Süper Lig Efsaneleri",
    cardDescription: "Emre'den Terim'e 16 efsane; her yüklemede yeni eşleşmelerle tek taç.",
    cardTitleEn: "Süper Lig Legends",
    cardDescriptionEn: "16 legends from Emre to Terim; fresh matchups each load, one crown.",
    heroTitle: "Süper Lig Efsaneleri",
    heroTeaser: "Efsaneler arasında kim kazanır?",
    heroTitleEn: "Süper Lig Legends",
    heroTeaserEn: "Who reigns among the legends?",
  },
  {
    slug: "turkiyede-en-iyi-yabancilar",
    queryT: "foreigners",
    cardTitle: "Türkiye'de Oynamış En İyi Yabancılar",
    cardDescription: "Drogba'dan Sneijder'a unutulmaz isimler; rastgele bracket ile favorini seç.",
    cardTitleEn: "Best Foreign Players in Turkey",
    cardDescriptionEn: "Unforgettable names from Drogba to Sneijder; random bracket, pick your favourite.",
    heroTitle: "Türkiye'nin En İyi Yabancıları",
    heroTeaser: "Türkiye'nin en iyi yabancısı kim?",
    heroTitleEn: "Best Foreign Players in Turkey",
    heroTeaserEn: "Who is the greatest foreign player to grace Turkish football?",
  },
];

const SLUG_SET = new Set<string>(ARENA_BRACKETS.map((b) => b.slug));

export function isArenaSlug(s: string): s is ArenaBracketSlug {
  return SLUG_SET.has(s);
}

export function getArenaBracketBySlug(slug: string): ArenaBracketConfig | undefined {
  return ARENA_BRACKETS.find((b) => b.slug === slug);
}
