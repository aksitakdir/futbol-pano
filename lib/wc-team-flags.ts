/** ISO 3166-1 alpha-2 (flagcdn) — slug → code */
export const WC_TEAM_ISO2: Record<string, string> = {
  usa: "us",
  mexico: "mx",
  canada: "ca",
  panama: "pa",
  haiti: "ht",
  curacao: "cw",
  brazil: "br",
  argentina: "ar",
  uruguay: "uy",
  colombia: "co",
  ecuador: "ec",
  paraguay: "py",
  germany: "de",
  france: "fr",
  england: "gb-eng",
  spain: "es",
  portugal: "pt",
  netherlands: "nl",
  belgium: "be",
  croatia: "hr",
  switzerland: "ch",
  austria: "at",
  norway: "no",
  turkiye: "tr",
  scotland: "gb-sct",
  sweden: "se",
  "bosnia-herzegovina": "ba",
  czechia: "cz",
  morocco: "ma",
  senegal: "sn",
  egypt: "eg",
  algeria: "dz",
  tunisia: "tn",
  ghana: "gh",
  "south-africa": "za",
  "ivory-coast": "ci",
  "dr-congo": "cd",
  "cape-verde": "cv",
  japan: "jp",
  "south-korea": "kr",
  australia: "au",
  "saudi-arabia": "sa",
  iran: "ir",
  qatar: "qa",
  jordan: "jo",
  uzbekistan: "uz",
  iraq: "iq",
  "new-zealand": "nz",
};

/** Flag image URL (flagcdn — high quality PNG) */
export function wcTeamFlagUrl(slug: string, width: 80 | 160 | 320 = 160): string {
  const iso = WC_TEAM_ISO2[slug] ?? "un";
  return `https://flagcdn.com/w${width}/${iso}.png`;
}

export function wcTeamFlagUrl2x(slug: string, width: 80 | 160 = 80): string {
  return wcTeamFlagUrl(slug, width === 80 ? 160 : 320);
}
