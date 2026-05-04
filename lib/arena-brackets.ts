/**
 * Arena (Oyna & Paylaş) — Supabase-backed arena games.
 * Legacy static types kept for backward compat during migration.
 */

// ─── Supabase types ───────────────────────────────────────────────────────────

export type ArenaGameStatus = "published" | "draft";
export type ArenaGameType = "random_16" | "fixed_8";
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

// ─── Path helper ──────────────────────────────────────────────────────────────

export function arenaPath(slug: string): string {
  return `/arena/${slug}`;
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
