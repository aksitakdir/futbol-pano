/** 2026 Dünya Kupası — 48 finalist (resmi format) */
export type WcConfederation = "UEFA" | "CONMEBOL" | "CONCACAF" | "CAF" | "AFC" | "OFC";

export type WcTeam = {
  slug: string;
  nameTr: string;
  nameEn: string;
  code: string;
  confederation: WcConfederation;
  /** Ana renk (buton vurgusu) */
  primary: string;
  /** İkincil / gradient */
  secondary: string;
  /** fc_players nationality araması */
  nationalityQuery: string;
};

export const WC_2026_TEAM_COUNT = 48;

export const WC_TEAMS: WcTeam[] = [
  // CONCACAF (6)
  { slug: "abd", nameTr: "ABD", nameEn: "USA", code: "USA", confederation: "CONCACAF", primary: "#3C3B6E", secondary: "#BF0A30", nationalityQuery: "United States" },
  { slug: "meksika", nameTr: "Meksika", nameEn: "Mexico", code: "MEX", confederation: "CONCACAF", primary: "#006341", secondary: "#CE1126", nationalityQuery: "Mexico" },
  { slug: "kanada", nameTr: "Kanada", nameEn: "Canada", code: "CAN", confederation: "CONCACAF", primary: "#FF0000", secondary: "#FFFFFF", nationalityQuery: "Canada" },
  { slug: "kosta-rika", nameTr: "Kosta Rika", nameEn: "Costa Rica", code: "CRC", confederation: "CONCACAF", primary: "#002B7F", secondary: "#CE1126", nationalityQuery: "Costa Rica" },
  { slug: "panama", nameTr: "Panama", nameEn: "Panama", code: "PAN", confederation: "CONCACAF", primary: "#DA121A", secondary: "#072357", nationalityQuery: "Panama" },
  { slug: "jamaika", nameTr: "Jamaika", nameEn: "Jamaica", code: "JAM", confederation: "CONCACAF", primary: "#009B3A", secondary: "#FED100", nationalityQuery: "Jamaica" },
  // CONMEBOL (6)
  { slug: "brezilya", nameTr: "Brezilya", nameEn: "Brazil", code: "BRA", confederation: "CONMEBOL", primary: "#FFDF00", secondary: "#009C3B", nationalityQuery: "Brazil" },
  { slug: "arjantin", nameTr: "Arjantin", nameEn: "Argentina", code: "ARG", confederation: "CONMEBOL", primary: "#74ACDF", secondary: "#FFFFFF", nationalityQuery: "Argentina" },
  { slug: "uruguay", nameTr: "Uruguay", nameEn: "Uruguay", code: "URU", confederation: "CONMEBOL", primary: "#0038A8", secondary: "#FFFFFF", nationalityQuery: "Uruguay" },
  { slug: "kolombiya", nameTr: "Kolombiya", nameEn: "Colombia", code: "COL", confederation: "CONMEBOL", primary: "#FCD116", secondary: "#003893", nationalityQuery: "Colombia" },
  { slug: "ekvador", nameTr: "Ekvador", nameEn: "Ecuador", code: "ECU", confederation: "CONMEBOL", primary: "#FFD100", secondary: "#034EA2", nationalityQuery: "Ecuador" },
  { slug: "paraguay", nameTr: "Paraguay", nameEn: "Paraguay", code: "PAR", confederation: "CONMEBOL", primary: "#D52B1E", secondary: "#0038A8", nationalityQuery: "Paraguay" },
  // UEFA (16)
  { slug: "almanya", nameTr: "Almanya", nameEn: "Germany", code: "GER", confederation: "UEFA", primary: "#000000", secondary: "#DD0000", nationalityQuery: "Germany" },
  { slug: "fransa", nameTr: "Fransa", nameEn: "France", code: "FRA", confederation: "UEFA", primary: "#002395", secondary: "#ED2939", nationalityQuery: "France" },
  { slug: "ingiltere", nameTr: "İngiltere", nameEn: "England", code: "ENG", confederation: "UEFA", primary: "#FFFFFF", secondary: "#CE1124", nationalityQuery: "England" },
  { slug: "ispanya", nameTr: "İspanya", nameEn: "Spain", code: "ESP", confederation: "UEFA", primary: "#AA151B", secondary: "#F1BF00", nationalityQuery: "Spain" },
  { slug: "portekiz", nameTr: "Portekiz", nameEn: "Portugal", code: "POR", confederation: "UEFA", primary: "#006600", secondary: "#FF0000", nationalityQuery: "Portugal" },
  { slug: "hollanda", nameTr: "Hollanda", nameEn: "Netherlands", code: "NED", confederation: "UEFA", primary: "#FF6600", secondary: "#21468B", nationalityQuery: "Netherlands" },
  { slug: "belcika", nameTr: "Belçika", nameEn: "Belgium", code: "BEL", confederation: "UEFA", primary: "#EF3340", secondary: "#FAE042", nationalityQuery: "Belgium" },
  { slug: "italya", nameTr: "İtalya", nameEn: "Italy", code: "ITA", confederation: "UEFA", primary: "#009246", secondary: "#CE2B37", nationalityQuery: "Italy" },
  { slug: "hirvatistan", nameTr: "Hırvatistan", nameEn: "Croatia", code: "CRO", confederation: "UEFA", primary: "#FF0000", secondary: "#FFFFFF", nationalityQuery: "Croatia" },
  { slug: "isvicre", nameTr: "İsviçre", nameEn: "Switzerland", code: "SUI", confederation: "UEFA", primary: "#FF0000", secondary: "#FFFFFF", nationalityQuery: "Switzerland" },
  { slug: "avusturya", nameTr: "Avusturya", nameEn: "Austria", code: "AUT", confederation: "UEFA", primary: "#ED2939", secondary: "#FFFFFF", nationalityQuery: "Austria" },
  { slug: "norvec", nameTr: "Norveç", nameEn: "Norway", code: "NOR", confederation: "UEFA", primary: "#BA0C2F", secondary: "#00205B", nationalityQuery: "Norway" },
  { slug: "danimarka", nameTr: "Danimarka", nameEn: "Denmark", code: "DEN", confederation: "UEFA", primary: "#C60C30", secondary: "#FFFFFF", nationalityQuery: "Denmark" },
  { slug: "turkiye", nameTr: "Türkiye", nameEn: "Turkey", code: "TUR", confederation: "UEFA", primary: "#E30A17", secondary: "#FFFFFF", nationalityQuery: "Turkey" },
  { slug: "polonya", nameTr: "Polonya", nameEn: "Poland", code: "POL", confederation: "UEFA", primary: "#DC143C", secondary: "#FFFFFF", nationalityQuery: "Poland" },
  { slug: "ukrayna", nameTr: "Ukrayna", nameEn: "Ukraine", code: "UKR", confederation: "UEFA", primary: "#005BBB", secondary: "#FFD500", nationalityQuery: "Ukraine" },
  // CAF (9)
  { slug: "fas", nameTr: "Fas", nameEn: "Morocco", code: "MAR", confederation: "CAF", primary: "#C1272D", secondary: "#006233", nationalityQuery: "Morocco" },
  { slug: "senegal", nameTr: "Senegal", nameEn: "Senegal", code: "SEN", confederation: "CAF", primary: "#00853F", secondary: "#FDEF42", nationalityQuery: "Senegal" },
  { slug: "misir", nameTr: "Mısır", nameEn: "Egypt", code: "EGY", confederation: "CAF", primary: "#CE1126", secondary: "#000000", nationalityQuery: "Egypt" },
  { slug: "nijerya", nameTr: "Nijerya", nameEn: "Nigeria", code: "NGA", confederation: "CAF", primary: "#008751", secondary: "#FFFFFF", nationalityQuery: "Nigeria" },
  { slug: "cezayir", nameTr: "Cezayir", nameEn: "Algeria", code: "ALG", confederation: "CAF", primary: "#006233", secondary: "#D21034", nationalityQuery: "Algeria" },
  { slug: "tunus", nameTr: "Tunus", nameEn: "Tunisia", code: "TUN", confederation: "CAF", primary: "#E70013", secondary: "#FFFFFF", nationalityQuery: "Tunisia" },
  { slug: "kamerun", nameTr: "Kamerun", nameEn: "Cameroon", code: "CMR", confederation: "CAF", primary: "#007A5E", secondary: "#FCD116", nationalityQuery: "Cameroon" },
  { slug: "gana", nameTr: "Gana", nameEn: "Ghana", code: "GHA", confederation: "CAF", primary: "#EF3340", secondary: "#FCD116", nationalityQuery: "Ghana" },
  { slug: "guney-afrika", nameTr: "G. Afrika", nameEn: "South Africa", code: "RSA", confederation: "CAF", primary: "#007749", secondary: "#FFB81C", nationalityQuery: "South Africa" },
  // AFC (8)
  { slug: "japonya", nameTr: "Japonya", nameEn: "Japan", code: "JPN", confederation: "AFC", primary: "#BC002D", secondary: "#FFFFFF", nationalityQuery: "Japan" },
  { slug: "guney-kore", nameTr: "G. Kore", nameEn: "South Korea", code: "KOR", confederation: "AFC", primary: "#CD2E3A", secondary: "#0047A0", nationalityQuery: "Korea" },
  { slug: "avustralya", nameTr: "Avustralya", nameEn: "Australia", code: "AUS", confederation: "AFC", primary: "#FFCD00", secondary: "#00843D", nationalityQuery: "Australia" },
  { slug: "suudi-arabistan", nameTr: "S. Arabistan", nameEn: "Saudi Arabia", code: "KSA", confederation: "AFC", primary: "#006C35", secondary: "#FFFFFF", nationalityQuery: "Saudi Arabia" },
  { slug: "iran", nameTr: "İran", nameEn: "Iran", code: "IRN", confederation: "AFC", primary: "#239F40", secondary: "#FFFFFF", nationalityQuery: "Iran" },
  { slug: "katar", nameTr: "Katar", nameEn: "Qatar", code: "QAT", confederation: "AFC", primary: "#8D1B3D", secondary: "#FFFFFF", nationalityQuery: "Qatar" },
  { slug: "urdun", nameTr: "Ürdün", nameEn: "Jordan", code: "JOR", confederation: "AFC", primary: "#007A3D", secondary: "#000000", nationalityQuery: "Jordan" },
  { slug: "ozbekistan", nameTr: "Özbekistan", nameEn: "Uzbekistan", code: "UZB", confederation: "AFC", primary: "#1EB7BA", secondary: "#FFFFFF", nationalityQuery: "Uzbekistan" },
  // OFC (1)
  { slug: "yeni-zelanda", nameTr: "Y. Zelanda", nameEn: "New Zealand", code: "NZL", confederation: "OFC", primary: "#000000", secondary: "#FFFFFF", nationalityQuery: "New Zealand" },
  // Play-off / ek slotlar (2) — 48 tamamlanır
  { slug: "irlanda", nameTr: "İrlanda", nameEn: "Ireland", code: "IRL", confederation: "UEFA", primary: "#169B62", secondary: "#FF883E", nationalityQuery: "Ireland" },
  { slug: "cekya", nameTr: "Çekya", nameEn: "Czechia", code: "CZE", confederation: "UEFA", primary: "#11457E", secondary: "#D7141A", nationalityQuery: "Czech Republic" },
];

const bySlug = new Map(WC_TEAMS.map((t) => [t.slug, t]));

export function getWcTeam(slug: string): WcTeam | undefined {
  return bySlug.get(slug);
}

export function wcTeamsForLocale(locale: "tr" | "en"): { slug: string; name: string; team: WcTeam }[] {
  return WC_TEAMS.map((team) => ({
    slug: team.slug,
    name: locale === "tr" ? team.nameTr : team.nameEn,
    team,
  }));
}

export type WcTeamListItem = {
  slug: string;
  name: string;
  code: string;
  conf: WcConfederation;
  primary: string;
  secondary: string;
};

/** Alfabetik sıra (TR/EN locale kuralları) */
export function wcTeamsSorted(
  locale: "tr" | "en",
  filter?: WcConfederation | "ALL",
): WcTeamListItem[] {
  const loc = locale === "tr" ? "tr" : "en";
  let list = WC_TEAMS.map((t) => ({
    slug: t.slug,
    name: locale === "tr" ? t.nameTr : t.nameEn,
    code: t.code,
    conf: t.confederation,
    primary: t.primary,
    secondary: t.secondary,
  }));
  if (filter && filter !== "ALL") {
    list = list.filter((t) => t.conf === filter);
  }
  return list.sort((a, b) => a.name.localeCompare(b.name, loc, { sensitivity: "base" }));
}

/** A–Z (veya locale harfleri) grupları */
export function wcTeamsByLetter(
  locale: "tr" | "en",
  filter?: WcConfederation | "ALL",
): { letter: string; teams: WcTeamListItem[] }[] {
  const sorted = wcTeamsSorted(locale, filter);
  const loc = locale === "tr" ? "tr-TR" : "en-US";
  const groups = new Map<string, WcTeamListItem[]>();

  for (const team of sorted) {
    const first = team.name.trim()[0];
    const letter = first
      ? first.toLocaleUpperCase(loc)
      : "#";
    const bucket = groups.get(letter) ?? [];
    bucket.push(team);
    groups.set(letter, bucket);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, loc, { sensitivity: "base" }))
    .map(([letter, teams]) => ({ letter, teams }));
}

export function wcConfederationLabel(conf: WcConfederation, locale: "tr" | "en"): string {
  const map: Record<WcConfederation, { tr: string; en: string }> = {
    UEFA: { tr: "UEFA", en: "UEFA" },
    CONMEBOL: { tr: "CONMEBOL", en: "CONMEBOL" },
    CONCACAF: { tr: "CONCACAF", en: "CONCACAF" },
    CAF: { tr: "CAF", en: "CAF" },
    AFC: { tr: "AFC", en: "AFC" },
    OFC: { tr: "OFC", en: "OFC" },
  };
  return map[conf][locale];
}
