/** 2026 World Cup — 48 qualified nations (official draw) */
export type WcConfederation = "UEFA" | "CONMEBOL" | "CONCACAF" | "CAF" | "AFC" | "OFC";

export type WcTeam = {
  slug: string;
  nameTr: string;
  nameEn: string;
  code: string;
  confederation: WcConfederation;
  /** Primary brand colour */
  primary: string;
  /** Secondary / gradient */
  secondary: string;
  /** fc_players nationality search key */
  nationalityQuery: string;
};

export const WC_2026_TEAM_COUNT = 48;

export const WC_TEAMS: WcTeam[] = [
  // CONCACAF (5)
  { slug: "usa", nameTr: "ABD", nameEn: "USA", code: "USA", confederation: "CONCACAF", primary: "#3C3B6E", secondary: "#BF0A30", nationalityQuery: "United States" },
  { slug: "mexico", nameTr: "Meksika", nameEn: "Mexico", code: "MEX", confederation: "CONCACAF", primary: "#006341", secondary: "#CE1126", nationalityQuery: "Mexico" },
  { slug: "canada", nameTr: "Kanada", nameEn: "Canada", code: "CAN", confederation: "CONCACAF", primary: "#FF0000", secondary: "#FFFFFF", nationalityQuery: "Canada" },
  { slug: "panama", nameTr: "Panama", nameEn: "Panama", code: "PAN", confederation: "CONCACAF", primary: "#DA121A", secondary: "#072357", nationalityQuery: "Panama" },
  { slug: "haiti", nameTr: "Haiti", nameEn: "Haiti", code: "HAI", confederation: "CONCACAF", primary: "#00209F", secondary: "#D21034", nationalityQuery: "Haiti" },
  // CONMEBOL (6)
  { slug: "brazil", nameTr: "Brezilya", nameEn: "Brazil", code: "BRA", confederation: "CONMEBOL", primary: "#FFDF00", secondary: "#009C3B", nationalityQuery: "Brazil" },
  { slug: "argentina", nameTr: "Arjantin", nameEn: "Argentina", code: "ARG", confederation: "CONMEBOL", primary: "#74ACDF", secondary: "#FFFFFF", nationalityQuery: "Argentina" },
  { slug: "uruguay", nameTr: "Uruguay", nameEn: "Uruguay", code: "URU", confederation: "CONMEBOL", primary: "#0038A8", secondary: "#FFFFFF", nationalityQuery: "Uruguay" },
  { slug: "colombia", nameTr: "Kolombiya", nameEn: "Colombia", code: "COL", confederation: "CONMEBOL", primary: "#FCD116", secondary: "#003893", nationalityQuery: "Colombia" },
  { slug: "ecuador", nameTr: "Ekvador", nameEn: "Ecuador", code: "ECU", confederation: "CONMEBOL", primary: "#FFD100", secondary: "#034EA2", nationalityQuery: "Ecuador" },
  { slug: "paraguay", nameTr: "Paraguay", nameEn: "Paraguay", code: "PAR", confederation: "CONMEBOL", primary: "#D52B1E", secondary: "#0038A8", nationalityQuery: "Paraguay" },
  // UEFA (16)
  { slug: "germany", nameTr: "Almanya", nameEn: "Germany", code: "GER", confederation: "UEFA", primary: "#000000", secondary: "#DD0000", nationalityQuery: "Germany" },
  { slug: "france", nameTr: "Fransa", nameEn: "France", code: "FRA", confederation: "UEFA", primary: "#002395", secondary: "#ED2939", nationalityQuery: "France" },
  { slug: "england", nameTr: "İngiltere", nameEn: "England", code: "ENG", confederation: "UEFA", primary: "#FFFFFF", secondary: "#CE1124", nationalityQuery: "England" },
  { slug: "spain", nameTr: "İspanya", nameEn: "Spain", code: "ESP", confederation: "UEFA", primary: "#AA151B", secondary: "#F1BF00", nationalityQuery: "Spain" },
  { slug: "portugal", nameTr: "Portekiz", nameEn: "Portugal", code: "POR", confederation: "UEFA", primary: "#006600", secondary: "#FF0000", nationalityQuery: "Portugal" },
  { slug: "netherlands", nameTr: "Hollanda", nameEn: "Netherlands", code: "NED", confederation: "UEFA", primary: "#FF6600", secondary: "#21468B", nationalityQuery: "Netherlands" },
  { slug: "belgium", nameTr: "Belçika", nameEn: "Belgium", code: "BEL", confederation: "UEFA", primary: "#EF3340", secondary: "#FAE042", nationalityQuery: "Belgium" },
  { slug: "croatia", nameTr: "Hırvatistan", nameEn: "Croatia", code: "CRO", confederation: "UEFA", primary: "#FF0000", secondary: "#FFFFFF", nationalityQuery: "Croatia" },
  { slug: "switzerland", nameTr: "İsviçre", nameEn: "Switzerland", code: "SUI", confederation: "UEFA", primary: "#FF0000", secondary: "#FFFFFF", nationalityQuery: "Switzerland" },
  { slug: "austria", nameTr: "Avusturya", nameEn: "Austria", code: "AUT", confederation: "UEFA", primary: "#ED2939", secondary: "#FFFFFF", nationalityQuery: "Austria" },
  { slug: "norway", nameTr: "Norveç", nameEn: "Norway", code: "NOR", confederation: "UEFA", primary: "#BA0C2F", secondary: "#00205B", nationalityQuery: "Norway" },
  { slug: "turkiye", nameTr: "Türkiye", nameEn: "Türkiye", code: "TUR", confederation: "UEFA", primary: "#E30A17", secondary: "#FFFFFF", nationalityQuery: "Turkey" },
  { slug: "scotland", nameTr: "İskoçya", nameEn: "Scotland", code: "SCO", confederation: "UEFA", primary: "#003399", secondary: "#FFFFFF", nationalityQuery: "Scotland" },
  { slug: "sweden", nameTr: "İsveç", nameEn: "Sweden", code: "SWE", confederation: "UEFA", primary: "#006AA7", secondary: "#FECC02", nationalityQuery: "Sweden" },
  { slug: "bosnia-herzegovina", nameTr: "Bosna Hersek", nameEn: "Bosnia & Herzegovina", code: "BIH", confederation: "UEFA", primary: "#002395", secondary: "#FFD700", nationalityQuery: "Bosnia" },
  { slug: "czechia", nameTr: "Çekya", nameEn: "Czechia", code: "CZE", confederation: "UEFA", primary: "#11457E", secondary: "#D7141A", nationalityQuery: "Czech Republic" },
  // CAF (9)
  { slug: "morocco", nameTr: "Fas", nameEn: "Morocco", code: "MAR", confederation: "CAF", primary: "#C1272D", secondary: "#006233", nationalityQuery: "Morocco" },
  { slug: "senegal", nameTr: "Senegal", nameEn: "Senegal", code: "SEN", confederation: "CAF", primary: "#00853F", secondary: "#FDEF42", nationalityQuery: "Senegal" },
  { slug: "egypt", nameTr: "Mısır", nameEn: "Egypt", code: "EGY", confederation: "CAF", primary: "#CE1126", secondary: "#000000", nationalityQuery: "Egypt" },
  { slug: "algeria", nameTr: "Cezayir", nameEn: "Algeria", code: "ALG", confederation: "CAF", primary: "#006233", secondary: "#D21034", nationalityQuery: "Algeria" },
  { slug: "tunisia", nameTr: "Tunus", nameEn: "Tunisia", code: "TUN", confederation: "CAF", primary: "#E70013", secondary: "#FFFFFF", nationalityQuery: "Tunisia" },
  { slug: "ghana", nameTr: "Gana", nameEn: "Ghana", code: "GHA", confederation: "CAF", primary: "#EF3340", secondary: "#FCD116", nationalityQuery: "Ghana" },
  { slug: "south-africa", nameTr: "G. Afrika", nameEn: "South Africa", code: "RSA", confederation: "CAF", primary: "#007749", secondary: "#FFB81C", nationalityQuery: "South Africa" },
  { slug: "ivory-coast", nameTr: "Fildişi Sahili", nameEn: "Ivory Coast", code: "CIV", confederation: "CAF", primary: "#F77F00", secondary: "#009E60", nationalityQuery: "Ivory Coast" },
  { slug: "dr-congo", nameTr: "DR Kongo", nameEn: "DR Congo", code: "COD", confederation: "CAF", primary: "#007FFF", secondary: "#CE1021", nationalityQuery: "Congo" },
  { slug: "cape-verde", nameTr: "Yeşil Burun", nameEn: "Cape Verde", code: "CPV", confederation: "CAF", primary: "#003893", secondary: "#CF2027", nationalityQuery: "Cape Verde" },
  // AFC (8)
  { slug: "japan", nameTr: "Japonya", nameEn: "Japan", code: "JPN", confederation: "AFC", primary: "#BC002D", secondary: "#FFFFFF", nationalityQuery: "Japan" },
  { slug: "south-korea", nameTr: "G. Kore", nameEn: "South Korea", code: "KOR", confederation: "AFC", primary: "#CD2E3A", secondary: "#0047A0", nationalityQuery: "Korea" },
  { slug: "australia", nameTr: "Avustralya", nameEn: "Australia", code: "AUS", confederation: "AFC", primary: "#FFCD00", secondary: "#00843D", nationalityQuery: "Australia" },
  { slug: "saudi-arabia", nameTr: "S. Arabistan", nameEn: "Saudi Arabia", code: "KSA", confederation: "AFC", primary: "#006C35", secondary: "#FFFFFF", nationalityQuery: "Saudi Arabia" },
  { slug: "iran", nameTr: "İran", nameEn: "Iran", code: "IRN", confederation: "AFC", primary: "#239F40", secondary: "#FFFFFF", nationalityQuery: "Iran" },
  { slug: "qatar", nameTr: "Katar", nameEn: "Qatar", code: "QAT", confederation: "AFC", primary: "#8D1B3D", secondary: "#FFFFFF", nationalityQuery: "Qatar" },
  { slug: "jordan", nameTr: "Ürdün", nameEn: "Jordan", code: "JOR", confederation: "AFC", primary: "#007A3D", secondary: "#000000", nationalityQuery: "Jordan" },
  { slug: "uzbekistan", nameTr: "Özbekistan", nameEn: "Uzbekistan", code: "UZB", confederation: "AFC", primary: "#1EB7BA", secondary: "#FFFFFF", nationalityQuery: "Uzbekistan" },
  { slug: "iraq", nameTr: "Irak", nameEn: "Iraq", code: "IRQ", confederation: "AFC", primary: "#007A3D", secondary: "#CE1126", nationalityQuery: "Iraq" },
  // OFC (1)
  { slug: "new-zealand", nameTr: "Y. Zelanda", nameEn: "New Zealand", code: "NZL", confederation: "OFC", primary: "#000000", secondary: "#FFFFFF", nationalityQuery: "New Zealand" },
  // CONCACAF Caribbean (1)
  { slug: "curacao", nameTr: "Curaçao", nameEn: "Curaçao", code: "CUW", confederation: "CONCACAF", primary: "#002B7F", secondary: "#FFD100", nationalityQuery: "Curacao" },
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

/** Alphabetical sort (TR/EN locale rules) */
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

/** A–Z letter groups */
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
