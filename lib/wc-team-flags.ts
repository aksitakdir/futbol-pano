/** ISO 3166-1 alpha-2 (flagcdn) — slug → kod */
export const WC_TEAM_ISO2: Record<string, string> = {
  abd: "us",
  meksika: "mx",
  kanada: "ca",
  "kosta-rika": "cr",
  panama: "pa",
  jamaika: "jm",
  brezilya: "br",
  arjantin: "ar",
  uruguay: "uy",
  kolombiya: "co",
  ekvador: "ec",
  paraguay: "py",
  almanya: "de",
  fransa: "fr",
  ingiltere: "gb-eng",
  ispanya: "es",
  portekiz: "pt",
  hollanda: "nl",
  belcika: "be",
  italya: "it",
  hirvatistan: "hr",
  isvicre: "ch",
  avusturya: "at",
  norvec: "no",
  danimarka: "dk",
  turkiye: "tr",
  polonya: "pl",
  ukrayna: "ua",
  fas: "ma",
  senegal: "sn",
  misir: "eg",
  nijerya: "ng",
  cezayir: "dz",
  tunus: "tn",
  kamerun: "cm",
  gana: "gh",
  "guney-afrika": "za",
  japonya: "jp",
  "guney-kore": "kr",
  avustralya: "au",
  "suudi-arabistan": "sa",
  iran: "ir",
  katar: "qa",
  urdun: "jo",
  ozbekistan: "uz",
  "yeni-zelanda": "nz",
  irlanda: "ie",
  cekya: "cz",
};

/** Orijinal bayrak görseli (flagcdn — yüksek kalite PNG) */
export function wcTeamFlagUrl(slug: string, width: 80 | 160 | 320 = 160): string {
  const iso = WC_TEAM_ISO2[slug] ?? "un";
  return `https://flagcdn.com/w${width}/${iso}.png`;
}

export function wcTeamFlagUrl2x(slug: string, width: 80 | 160 = 80): string {
  return wcTeamFlagUrl(slug, width === 80 ? 160 : 320);
}
