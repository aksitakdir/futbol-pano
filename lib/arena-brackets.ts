/**
 * Arena (Oyna & Paylaş) bracket’ları — URL slug, iframe ?t= parametresi ve hero metinleri.
 */

export type ArenaBracketSlug =
  | "gelecek-yildizlar"
  | "sampiyonlar-ligi"
  | "teknik-direktor"
  | "super-lig-efsaneleri"
  | "turkiyede-en-iyi-yabancilar";

export type ArenaBracketConfig = {
  slug: ArenaBracketSlug;
  /** public/ucl-bracket.html?t= */
  queryT: "stars" | "ucl" | "managers" | "legends" | "foreigners";
  /** Ana arena sayfası kart başlığı */
  cardTitle: string;
  cardDescription: string;
  /** EN arena listing (`/en/arena`) */
  cardTitleEn: string;
  cardDescriptionEn: string;
  /** Ana sayfa hero slider — başlık */
  heroTitle: string;
  /** Ana sayfa hero — kısa teaser (tek slide için) */
  heroTeaser: string;
};

export const ARENA_BRACKETS: ArenaBracketConfig[] = [
  {
    slug: "gelecek-yildizlar",
    queryT: "stars",
    cardTitle: "Gelecek Yıldızlar",
    cardDescription:
      "16 genç yetenek; her açılışta rastgele eşleşmeler. Yamal’dan Mainoo’ya sen kimin şampiyon olacağını seç.",
    cardTitleEn: "Future Stars",
    cardDescriptionEn:
      "16 young talents; random matchups every time. From Yamal to Mainoo — you pick who becomes champion.",
    heroTitle: "Gelecek Yıldızlar Turnuvası",
    heroTeaser: "16 isim, tek şampiyon. Sen seç.",
  },
  {
    slug: "sampiyonlar-ligi",
    queryT: "ucl",
    cardTitle: "Şampiyonlar Ligi 25-26",
    cardDescription:
      "25-26 sezonu son 16 eşleşmeleriyle sabit bracket — kupayı hangi takıma veriyorsun?",
    cardTitleEn: "Champions League 25–26",
    cardDescriptionEn:
      "Fixed bracket with the 25–26 season round of 16 — which club lifts the trophy?",
    heroTitle: "Şampiyonlar Ligi 25-26",
    heroTeaser: "Kupayı kime veriyorsun?",
  },
  {
    slug: "teknik-direktor",
    queryT: "managers",
    cardTitle: "Teknik Direktör Arenası",
    cardDescription:
      "Guardiola’dan Mourinho’ya 16 teknik direktör; her seferinde rastgele çiftler.",
    cardTitleEn: "Manager Arena",
    cardDescriptionEn:
      "16 managers from Guardiola to Mourinho; random pairings every run.",
    heroTitle: "Teknik Direktör Arenası",
    heroTeaser: "Tarihin en iyi teknik direktörü kim?",
  },
  {
    slug: "super-lig-efsaneleri",
    queryT: "legends",
    cardTitle: "Süper Lig Efsaneleri",
    cardDescription:
      "Emre’den Terim’e 16 efsane; her yüklemede yeni eşleşmelerle tek taç.",
    cardTitleEn: "Süper Lig Legends",
    cardDescriptionEn:
      "16 legends from Emre to Terim; fresh matchups each load, one crown.",
    heroTitle: "Süper Lig Efsaneleri",
    heroTeaser: "Efsaneler arasında kim kazanır?",
  },
  {
    slug: "turkiyede-en-iyi-yabancilar",
    queryT: "foreigners",
    cardTitle: "Türkiye'de Oynamış En İyi Yabancılar",
    cardDescription:
      "Drogba’dan Sneijder’a unutulmaz isimler; rastgele bracket ile favorini seç.",
    cardTitleEn: "Best Foreign Players in Turkey",
    cardDescriptionEn:
      "Unforgettable names from Drogba to Sneijder; random bracket, pick your favourite.",
    heroTitle: "Türkiye'nin En İyi Yabancıları",
    heroTeaser: "Türkiye'nin en iyi yabancısı kim?",
  },
];

const SLUG_SET = new Set<string>(ARENA_BRACKETS.map((b) => b.slug));

export function isArenaSlug(s: string): s is ArenaBracketSlug {
  return SLUG_SET.has(s);
}

export function getArenaBracketBySlug(slug: string): ArenaBracketConfig | undefined {
  return ARENA_BRACKETS.find((b) => b.slug === slug);
}

export function arenaPath(slug: ArenaBracketSlug): string {
  return `/arena/${slug}`;
}
