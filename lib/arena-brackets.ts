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
    heroTitle: "Gelecek Yıldızlar Turnuvası",
    heroTeaser: "16 isim, tek şampiyon. Sen seç.",
  },
  {
    slug: "sampiyonlar-ligi",
    queryT: "ucl",
    cardTitle: "Şampiyonlar Ligi 2024-25",
    cardDescription:
      "Resmi son 16 kura eşleşmeleriyle sabit bracket — kupayı hangi takıma veriyorsun?",
    heroTitle: "Şampiyonlar Ligi Tahmini",
    heroTeaser: "Kupayı kime veriyorsun?",
  },
  {
    slug: "teknik-direktor",
    queryT: "managers",
    cardTitle: "Teknik Direktör Arenası",
    cardDescription:
      "Guardiola’dan Mourinho’ya 16 teknik direktör; her seferinde rastgele çiftler.",
    heroTitle: "Teknik Direktör Arenası",
    heroTeaser: "Tarihin en iyi teknik direktörü kim?",
  },
  {
    slug: "super-lig-efsaneleri",
    queryT: "legends",
    cardTitle: "Süper Lig Efsaneleri",
    cardDescription:
      "Emre’den Terim’e 16 efsane; her yüklemede yeni eşleşmelerle tek taç.",
    heroTitle: "Süper Lig Efsaneleri",
    heroTeaser: "Efsaneler arasında kim kazanır?",
  },
  {
    slug: "turkiyede-en-iyi-yabancilar",
    queryT: "foreigners",
    cardTitle: "Türkiye'de Oynamış En İyi Yabancılar",
    cardDescription:
      "Drogba’dan Sneijder’a unutulmaz isimler; rastgele bracket ile favorini seç.",
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
