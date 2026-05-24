export type WcMatchStatus = "scheduled" | "live" | "finished";
export type WcRound = "group" | "r32" | "r16" | "qf" | "sf" | "third" | "final";
export type WcGroupId = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

export type WcGroupTeam = { code: string; name: string };

export type WcMatch = {
  id: number;
  date: string;
  round: WcRound;
  group?: WcGroupId;
  home: string;
  away: string;
  homeLabel?: string;
  awayLabel?: string;
  venue: string;
  city: string;
  status: WcMatchStatus;
};

export const WC_GROUPS: Record<WcGroupId, WcGroupTeam[]> = {
  A: [
    { code: "MEX", name: "Mexico" },
    { code: "RSA", name: "South Africa" },
    { code: "KOR", name: "South Korea" },
    { code: "CZE", name: "Czechia" },
  ],
  B: [
    { code: "CAN", name: "Canada" },
    { code: "BIH", name: "Bosnia & Herzegovina" },
    { code: "QAT", name: "Qatar" },
    { code: "SUI", name: "Switzerland" },
  ],
  C: [
    { code: "BRA", name: "Brazil" },
    { code: "MAR", name: "Morocco" },
    { code: "HAI", name: "Haiti" },
    { code: "SCO", name: "Scotland" },
  ],
  D: [
    { code: "USA", name: "USA" },
    { code: "PAR", name: "Paraguay" },
    { code: "AUS", name: "Australia" },
    { code: "TUR", name: "Türkiye" },
  ],
  E: [
    { code: "GER", name: "Germany" },
    { code: "CUW", name: "Curaçao" },
    { code: "CIV", name: "Ivory Coast" },
    { code: "ECU", name: "Ecuador" },
  ],
  F: [
    { code: "NED", name: "Netherlands" },
    { code: "JPN", name: "Japan" },
    { code: "SWE", name: "Sweden" },
    { code: "TUN", name: "Tunisia" },
  ],
  G: [
    { code: "BEL", name: "Belgium" },
    { code: "EGY", name: "Egypt" },
    { code: "IRN", name: "Iran" },
    { code: "NZL", name: "New Zealand" },
  ],
  H: [
    { code: "ESP", name: "Spain" },
    { code: "CPV", name: "Cape Verde" },
    { code: "KSA", name: "Saudi Arabia" },
    { code: "URU", name: "Uruguay" },
  ],
  I: [
    { code: "FRA", name: "France" },
    { code: "SEN", name: "Senegal" },
    { code: "IRQ", name: "Iraq" },
    { code: "NOR", name: "Norway" },
  ],
  J: [
    { code: "ARG", name: "Argentina" },
    { code: "ALG", name: "Algeria" },
    { code: "AUT", name: "Austria" },
    { code: "JOR", name: "Jordan" },
  ],
  K: [
    { code: "POR", name: "Portugal" },
    { code: "COD", name: "DR Congo" },
    { code: "UZB", name: "Uzbekistan" },
    { code: "COL", name: "Colombia" },
  ],
  L: [
    { code: "ENG", name: "England" },
    { code: "CRO", name: "Croatia" },
    { code: "GHA", name: "Ghana" },
    { code: "PAN", name: "Panama" },
  ],
};

export const WC_VENUES: Record<string, { city: string; country: string; capacity: string }> = {
  "Mexico City Stadium":          { city: "Mexico City",     country: "Mexico",  capacity: "87,523" },
  "Estadio Guadalajara":          { city: "Guadalajara",     country: "Mexico",  capacity: "49,850" },
  "Estadio Monterrey":            { city: "Monterrey",       country: "Mexico",  capacity: "53,500" },
  "Toronto Stadium":              { city: "Toronto",         country: "Canada",  capacity: "45,736" },
  "BC Place":                     { city: "Vancouver",       country: "Canada",  capacity: "54,500" },
  "Los Angeles Stadium":          { city: "Los Angeles",     country: "USA",     capacity: "70,240" },
  "MetLife Stadium":              { city: "New York/NJ",     country: "USA",     capacity: "82,500" },
  "Hard Rock Stadium":            { city: "Miami",           country: "USA",     capacity: "64,767" },
  "Mercedes-Benz Stadium":        { city: "Atlanta",         country: "USA",     capacity: "71,000" },
  "NRG Stadium":                  { city: "Houston",         country: "USA",     capacity: "72,220" },
  "AT&T Stadium":                 { city: "Dallas",          country: "USA",     capacity: "80,000" },
  "Levi's Stadium":               { city: "San Francisco",   country: "USA",     capacity: "68,500" },
  "Lumen Field":                  { city: "Seattle",         country: "USA",     capacity: "69,000" },
  "Lincoln Financial Field":      { city: "Philadelphia",    country: "USA",     capacity: "69,176" },
  "Arrowhead Stadium":            { city: "Kansas City",     country: "USA",     capacity: "76,416" },
  "Boston Stadium":               { city: "Boston",          country: "USA",     capacity: "65,878" },
};

export const WC_ROUND_LABELS: Record<WcRound, string> = {
  group: "Group Stage",
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarterfinals",
  sf: "Semifinals",
  third: "Third Place",
  final: "Final",
};

const S: WcMatchStatus = "scheduled";

export const WC_SCHEDULE: WcMatch[] = [
  // ── Matchday 1 (Jun 11–17) ──
  { id: 1,  date: "2026-06-11", round: "group", group: "A", home: "MEX", away: "RSA", venue: "Mexico City Stadium", city: "Mexico City", status: S },
  { id: 2,  date: "2026-06-11", round: "group", group: "A", home: "KOR", away: "CZE", venue: "Estadio Guadalajara", city: "Guadalajara", status: S },
  { id: 3,  date: "2026-06-12", round: "group", group: "B", home: "CAN", away: "BIH", venue: "Toronto Stadium", city: "Toronto", status: S },
  { id: 4,  date: "2026-06-12", round: "group", group: "D", home: "USA", away: "PAR", venue: "Los Angeles Stadium", city: "Los Angeles", status: S },
  { id: 5,  date: "2026-06-13", round: "group", group: "C", home: "HAI", away: "SCO", venue: "Boston Stadium", city: "Boston", status: S },
  { id: 6,  date: "2026-06-13", round: "group", group: "D", home: "AUS", away: "TUR", venue: "BC Place", city: "Vancouver", status: S },
  { id: 7,  date: "2026-06-13", round: "group", group: "C", home: "BRA", away: "MAR", venue: "MetLife Stadium", city: "New York/NJ", status: S },
  { id: 8,  date: "2026-06-13", round: "group", group: "B", home: "QAT", away: "SUI", venue: "Levi's Stadium", city: "San Francisco", status: S },
  { id: 9,  date: "2026-06-14", round: "group", group: "E", home: "CIV", away: "ECU", venue: "Lincoln Financial Field", city: "Philadelphia", status: S },
  { id: 10, date: "2026-06-14", round: "group", group: "E", home: "GER", away: "CUW", venue: "NRG Stadium", city: "Houston", status: S },
  { id: 11, date: "2026-06-14", round: "group", group: "F", home: "NED", away: "JPN", venue: "AT&T Stadium", city: "Dallas", status: S },
  { id: 12, date: "2026-06-14", round: "group", group: "F", home: "SWE", away: "TUN", venue: "Estadio Monterrey", city: "Monterrey", status: S },
  { id: 13, date: "2026-06-15", round: "group", group: "H", home: "KSA", away: "URU", venue: "Hard Rock Stadium", city: "Miami", status: S },
  { id: 14, date: "2026-06-15", round: "group", group: "H", home: "ESP", away: "CPV", venue: "Mercedes-Benz Stadium", city: "Atlanta", status: S },
  { id: 15, date: "2026-06-15", round: "group", group: "G", home: "IRN", away: "NZL", venue: "Los Angeles Stadium", city: "Los Angeles", status: S },
  { id: 16, date: "2026-06-15", round: "group", group: "G", home: "BEL", away: "EGY", venue: "Lumen Field", city: "Seattle", status: S },
  { id: 17, date: "2026-06-16", round: "group", group: "I", home: "FRA", away: "SEN", venue: "MetLife Stadium", city: "New York/NJ", status: S },
  { id: 18, date: "2026-06-16", round: "group", group: "I", home: "IRQ", away: "NOR", venue: "Boston Stadium", city: "Boston", status: S },
  { id: 19, date: "2026-06-16", round: "group", group: "J", home: "ARG", away: "ALG", venue: "Arrowhead Stadium", city: "Kansas City", status: S },
  { id: 20, date: "2026-06-16", round: "group", group: "J", home: "AUT", away: "JOR", venue: "Levi's Stadium", city: "San Francisco", status: S },
  { id: 21, date: "2026-06-17", round: "group", group: "L", home: "GHA", away: "PAN", venue: "Toronto Stadium", city: "Toronto", status: S },
  { id: 22, date: "2026-06-17", round: "group", group: "L", home: "ENG", away: "CRO", venue: "AT&T Stadium", city: "Dallas", status: S },
  { id: 23, date: "2026-06-17", round: "group", group: "K", home: "POR", away: "COD", venue: "NRG Stadium", city: "Houston", status: S },
  { id: 24, date: "2026-06-17", round: "group", group: "K", home: "UZB", away: "COL", venue: "Mexico City Stadium", city: "Mexico City", status: S },
  // ── Matchday 2 (Jun 18–23) ──
  { id: 25, date: "2026-06-18", round: "group", group: "A", home: "CZE", away: "RSA", venue: "Mercedes-Benz Stadium", city: "Atlanta", status: S },
  { id: 26, date: "2026-06-18", round: "group", group: "B", home: "SUI", away: "BIH", venue: "Los Angeles Stadium", city: "Los Angeles", status: S },
  { id: 27, date: "2026-06-18", round: "group", group: "B", home: "CAN", away: "QAT", venue: "BC Place", city: "Vancouver", status: S },
  { id: 28, date: "2026-06-18", round: "group", group: "A", home: "MEX", away: "KOR", venue: "Estadio Guadalajara", city: "Guadalajara", status: S },
  { id: 29, date: "2026-06-19", round: "group", group: "C", home: "BRA", away: "HAI", venue: "Lincoln Financial Field", city: "Philadelphia", status: S },
  { id: 30, date: "2026-06-19", round: "group", group: "C", home: "SCO", away: "MAR", venue: "Boston Stadium", city: "Boston", status: S },
  { id: 31, date: "2026-06-19", round: "group", group: "D", home: "TUR", away: "PAR", venue: "Levi's Stadium", city: "San Francisco", status: S },
  { id: 32, date: "2026-06-19", round: "group", group: "D", home: "USA", away: "AUS", venue: "Lumen Field", city: "Seattle", status: S },
  { id: 33, date: "2026-06-20", round: "group", group: "E", home: "GER", away: "CIV", venue: "Toronto Stadium", city: "Toronto", status: S },
  { id: 34, date: "2026-06-20", round: "group", group: "E", home: "ECU", away: "CUW", venue: "Arrowhead Stadium", city: "Kansas City", status: S },
  { id: 35, date: "2026-06-20", round: "group", group: "F", home: "NED", away: "SWE", venue: "NRG Stadium", city: "Houston", status: S },
  { id: 36, date: "2026-06-20", round: "group", group: "F", home: "TUN", away: "JPN", venue: "Estadio Monterrey", city: "Monterrey", status: S },
  { id: 37, date: "2026-06-21", round: "group", group: "H", home: "URU", away: "CPV", venue: "Hard Rock Stadium", city: "Miami", status: S },
  { id: 38, date: "2026-06-21", round: "group", group: "H", home: "ESP", away: "KSA", venue: "Mercedes-Benz Stadium", city: "Atlanta", status: S },
  { id: 39, date: "2026-06-21", round: "group", group: "G", home: "BEL", away: "IRN", venue: "Los Angeles Stadium", city: "Los Angeles", status: S },
  { id: 40, date: "2026-06-21", round: "group", group: "G", home: "NZL", away: "EGY", venue: "BC Place", city: "Vancouver", status: S },
  { id: 41, date: "2026-06-22", round: "group", group: "I", home: "NOR", away: "SEN", venue: "MetLife Stadium", city: "New York/NJ", status: S },
  { id: 42, date: "2026-06-22", round: "group", group: "I", home: "FRA", away: "IRQ", venue: "Lincoln Financial Field", city: "Philadelphia", status: S },
  { id: 43, date: "2026-06-22", round: "group", group: "J", home: "ARG", away: "AUT", venue: "AT&T Stadium", city: "Dallas", status: S },
  { id: 44, date: "2026-06-22", round: "group", group: "J", home: "JOR", away: "ALG", venue: "Levi's Stadium", city: "San Francisco", status: S },
  { id: 45, date: "2026-06-23", round: "group", group: "L", home: "ENG", away: "GHA", venue: "Boston Stadium", city: "Boston", status: S },
  { id: 46, date: "2026-06-23", round: "group", group: "L", home: "PAN", away: "CRO", venue: "Toronto Stadium", city: "Toronto", status: S },
  { id: 47, date: "2026-06-23", round: "group", group: "K", home: "POR", away: "UZB", venue: "NRG Stadium", city: "Houston", status: S },
  { id: 48, date: "2026-06-23", round: "group", group: "K", home: "COL", away: "COD", venue: "Estadio Guadalajara", city: "Guadalajara", status: S },
  // ── Matchday 3 (Jun 24–27) ──
  { id: 49, date: "2026-06-24", round: "group", group: "C", home: "SCO", away: "BRA", venue: "Hard Rock Stadium", city: "Miami", status: S },
  { id: 50, date: "2026-06-24", round: "group", group: "C", home: "MAR", away: "HAI", venue: "Mercedes-Benz Stadium", city: "Atlanta", status: S },
  { id: 51, date: "2026-06-24", round: "group", group: "B", home: "SUI", away: "CAN", venue: "BC Place", city: "Vancouver", status: S },
  { id: 52, date: "2026-06-24", round: "group", group: "B", home: "BIH", away: "QAT", venue: "Lumen Field", city: "Seattle", status: S },
  { id: 53, date: "2026-06-24", round: "group", group: "A", home: "CZE", away: "MEX", venue: "Mexico City Stadium", city: "Mexico City", status: S },
  { id: 54, date: "2026-06-24", round: "group", group: "A", home: "RSA", away: "KOR", venue: "Estadio Monterrey", city: "Monterrey", status: S },
  { id: 55, date: "2026-06-25", round: "group", group: "E", home: "CUW", away: "CIV", venue: "Lincoln Financial Field", city: "Philadelphia", status: S },
  { id: 56, date: "2026-06-25", round: "group", group: "E", home: "ECU", away: "GER", venue: "MetLife Stadium", city: "New York/NJ", status: S },
  { id: 57, date: "2026-06-25", round: "group", group: "F", home: "JPN", away: "SWE", venue: "AT&T Stadium", city: "Dallas", status: S },
  { id: 58, date: "2026-06-25", round: "group", group: "F", home: "TUN", away: "NED", venue: "Arrowhead Stadium", city: "Kansas City", status: S },
  { id: 59, date: "2026-06-25", round: "group", group: "D", home: "TUR", away: "USA", venue: "Los Angeles Stadium", city: "Los Angeles", status: S },
  { id: 60, date: "2026-06-25", round: "group", group: "D", home: "PAR", away: "AUS", venue: "Levi's Stadium", city: "San Francisco", status: S },
  { id: 61, date: "2026-06-26", round: "group", group: "I", home: "NOR", away: "FRA", venue: "Boston Stadium", city: "Boston", status: S },
  { id: 62, date: "2026-06-26", round: "group", group: "I", home: "SEN", away: "IRQ", venue: "Toronto Stadium", city: "Toronto", status: S },
  { id: 63, date: "2026-06-26", round: "group", group: "G", home: "EGY", away: "IRN", venue: "Lumen Field", city: "Seattle", status: S },
  { id: 64, date: "2026-06-26", round: "group", group: "G", home: "NZL", away: "BEL", venue: "BC Place", city: "Vancouver", status: S },
  { id: 65, date: "2026-06-26", round: "group", group: "H", home: "CPV", away: "KSA", venue: "NRG Stadium", city: "Houston", status: S },
  { id: 66, date: "2026-06-26", round: "group", group: "H", home: "URU", away: "ESP", venue: "Estadio Guadalajara", city: "Guadalajara", status: S },
  { id: 67, date: "2026-06-27", round: "group", group: "L", home: "PAN", away: "ENG", venue: "MetLife Stadium", city: "New York/NJ", status: S },
  { id: 68, date: "2026-06-27", round: "group", group: "L", home: "CRO", away: "GHA", venue: "Lincoln Financial Field", city: "Philadelphia", status: S },
  { id: 69, date: "2026-06-27", round: "group", group: "J", home: "ALG", away: "AUT", venue: "Arrowhead Stadium", city: "Kansas City", status: S },
  { id: 70, date: "2026-06-27", round: "group", group: "J", home: "JOR", away: "ARG", venue: "AT&T Stadium", city: "Dallas", status: S },
  { id: 71, date: "2026-06-27", round: "group", group: "K", home: "COL", away: "POR", venue: "Hard Rock Stadium", city: "Miami", status: S },
  { id: 72, date: "2026-06-27", round: "group", group: "K", home: "COD", away: "UZB", venue: "Mercedes-Benz Stadium", city: "Atlanta", status: S },
  // ── Round of 32 (Jun 28 – Jul 3) ──
  { id: 73, date: "2026-06-28", round: "r32", home: "", away: "", homeLabel: "2nd Group A", awayLabel: "2nd Group B", venue: "Los Angeles Stadium", city: "Los Angeles", status: S },
  { id: 74, date: "2026-06-29", round: "r32", home: "", away: "", homeLabel: "1st Group E", awayLabel: "3rd Place", venue: "Boston Stadium", city: "Boston", status: S },
  { id: 75, date: "2026-06-29", round: "r32", home: "", away: "", homeLabel: "1st Group F", awayLabel: "2nd Group C", venue: "Estadio Monterrey", city: "Monterrey", status: S },
  { id: 76, date: "2026-06-29", round: "r32", home: "", away: "", homeLabel: "1st Group C", awayLabel: "2nd Group F", venue: "NRG Stadium", city: "Houston", status: S },
  { id: 77, date: "2026-06-30", round: "r32", home: "", away: "", homeLabel: "1st Group I", awayLabel: "3rd Place", venue: "MetLife Stadium", city: "New York/NJ", status: S },
  { id: 78, date: "2026-06-30", round: "r32", home: "", away: "", homeLabel: "2nd Group E", awayLabel: "2nd Group I", venue: "AT&T Stadium", city: "Dallas", status: S },
  { id: 79, date: "2026-06-30", round: "r32", home: "", away: "", homeLabel: "1st Group A", awayLabel: "3rd Place", venue: "Mexico City Stadium", city: "Mexico City", status: S },
  { id: 80, date: "2026-07-01", round: "r32", home: "", away: "", homeLabel: "1st Group L", awayLabel: "3rd Place", venue: "Mercedes-Benz Stadium", city: "Atlanta", status: S },
  { id: 81, date: "2026-07-01", round: "r32", home: "", away: "", homeLabel: "1st Group D", awayLabel: "3rd Place", venue: "Levi's Stadium", city: "San Francisco", status: S },
  { id: 82, date: "2026-07-01", round: "r32", home: "", away: "", homeLabel: "1st Group G", awayLabel: "3rd Place", venue: "Lumen Field", city: "Seattle", status: S },
  { id: 83, date: "2026-07-02", round: "r32", home: "", away: "", homeLabel: "2nd Group K", awayLabel: "2nd Group L", venue: "Toronto Stadium", city: "Toronto", status: S },
  { id: 84, date: "2026-07-02", round: "r32", home: "", away: "", homeLabel: "1st Group H", awayLabel: "2nd Group J", venue: "Los Angeles Stadium", city: "Los Angeles", status: S },
  { id: 85, date: "2026-07-02", round: "r32", home: "", away: "", homeLabel: "1st Group B", awayLabel: "3rd Place", venue: "BC Place", city: "Vancouver", status: S },
  { id: 86, date: "2026-07-03", round: "r32", home: "", away: "", homeLabel: "1st Group J", awayLabel: "2nd Group H", venue: "Hard Rock Stadium", city: "Miami", status: S },
  { id: 87, date: "2026-07-03", round: "r32", home: "", away: "", homeLabel: "1st Group K", awayLabel: "3rd Place", venue: "Arrowhead Stadium", city: "Kansas City", status: S },
  { id: 88, date: "2026-07-03", round: "r32", home: "", away: "", homeLabel: "2nd Group D", awayLabel: "2nd Group G", venue: "AT&T Stadium", city: "Dallas", status: S },
  // ── Round of 16 (Jul 4–7) ──
  { id: 89,  date: "2026-07-04", round: "r16", home: "", away: "", homeLabel: "W74", awayLabel: "W77", venue: "Lincoln Financial Field", city: "Philadelphia", status: S },
  { id: 90,  date: "2026-07-04", round: "r16", home: "", away: "", homeLabel: "W73", awayLabel: "W75", venue: "NRG Stadium", city: "Houston", status: S },
  { id: 91,  date: "2026-07-05", round: "r16", home: "", away: "", homeLabel: "W76", awayLabel: "W78", venue: "MetLife Stadium", city: "New York/NJ", status: S },
  { id: 92,  date: "2026-07-05", round: "r16", home: "", away: "", homeLabel: "W79", awayLabel: "W80", venue: "Mexico City Stadium", city: "Mexico City", status: S },
  { id: 93,  date: "2026-07-06", round: "r16", home: "", away: "", homeLabel: "W83", awayLabel: "W84", venue: "AT&T Stadium", city: "Dallas", status: S },
  { id: 94,  date: "2026-07-06", round: "r16", home: "", away: "", homeLabel: "W81", awayLabel: "W82", venue: "Lumen Field", city: "Seattle", status: S },
  { id: 95,  date: "2026-07-07", round: "r16", home: "", away: "", homeLabel: "W86", awayLabel: "W88", venue: "Mercedes-Benz Stadium", city: "Atlanta", status: S },
  { id: 96,  date: "2026-07-07", round: "r16", home: "", away: "", homeLabel: "W85", awayLabel: "W87", venue: "BC Place", city: "Vancouver", status: S },
  // ── Quarterfinals (Jul 9–11) ──
  { id: 97,  date: "2026-07-09", round: "qf", home: "", away: "", homeLabel: "W89", awayLabel: "W90", venue: "Boston Stadium", city: "Boston", status: S },
  { id: 98,  date: "2026-07-10", round: "qf", home: "", away: "", homeLabel: "W93", awayLabel: "W94", venue: "Los Angeles Stadium", city: "Los Angeles", status: S },
  { id: 99,  date: "2026-07-11", round: "qf", home: "", away: "", homeLabel: "W91", awayLabel: "W92", venue: "Hard Rock Stadium", city: "Miami", status: S },
  { id: 100, date: "2026-07-11", round: "qf", home: "", away: "", homeLabel: "W95", awayLabel: "W96", venue: "Arrowhead Stadium", city: "Kansas City", status: S },
  // ── Semifinals (Jul 14–15) ──
  { id: 101, date: "2026-07-14", round: "sf", home: "", away: "", homeLabel: "W97", awayLabel: "W98", venue: "AT&T Stadium", city: "Dallas", status: S },
  { id: 102, date: "2026-07-15", round: "sf", home: "", away: "", homeLabel: "W99", awayLabel: "W100", venue: "Mercedes-Benz Stadium", city: "Atlanta", status: S },
  // ── Third Place (Jul 18) ──
  { id: 103, date: "2026-07-18", round: "third", home: "", away: "", homeLabel: "L101", awayLabel: "L102", venue: "Hard Rock Stadium", city: "Miami", status: S },
  // ── Final (Jul 19) ──
  { id: 104, date: "2026-07-19", round: "final", home: "", away: "", homeLabel: "W101", awayLabel: "W102", venue: "MetLife Stadium", city: "New York/NJ", status: S },
];

/* ── Helper utilities ── */

export function getMatchesForTeam(teamCode: string): WcMatch[] {
  const code = teamCode.toUpperCase();
  return WC_SCHEDULE.filter(
    (m) => m.home === code || m.away === code,
  );
}

export function getMatchesByDate(date: string): WcMatch[] {
  return WC_SCHEDULE.filter((m) => m.date === date);
}

export function getMatchesByGroup(group: WcGroupId): WcMatch[] {
  return WC_SCHEDULE.filter((m) => m.group === group);
}

export function getMatchesByRound(round: WcRound): WcMatch[] {
  return WC_SCHEDULE.filter((m) => m.round === round);
}

export function getGroupForTeam(teamCode: string): WcGroupId | undefined {
  const code = teamCode.toUpperCase();
  for (const [gid, teams] of Object.entries(WC_GROUPS)) {
    if (teams.some((t) => t.code === code)) return gid as WcGroupId;
  }
  return undefined;
}

const _allTeams = new Map<string, string>();
for (const teams of Object.values(WC_GROUPS)) {
  for (const t of teams) _allTeams.set(t.code, t.name);
}
export function getTeamName(code: string): string {
  return _allTeams.get(code.toUpperCase()) ?? code;
}

export function getAllDates(): string[] {
  const set = new Set(WC_SCHEDULE.map((m) => m.date));
  return [...set].sort();
}
