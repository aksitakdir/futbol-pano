/**
 * Final results of the 2026 World Cup — all 104 matches.
 *
 * FROZEN ON PURPOSE. The tournament ended on 19 July 2026 and these scores can
 * never change, so they are data in the repository rather than something fetched
 * at runtime.
 *
 * Two things this fixes. The schedule pages used to load scores in a useEffect
 * from /api/wc-results, which meant the HTML Googlebot receives contained no
 * scores at all — 49 pages presenting themselves as World Cup results and
 * ranking for none of it. And every view of those pages hit an API route backed
 * by a Supabase read. Importing the results makes them part of the server-
 * rendered output and costs nothing.
 *
 * Generated once from the stored football-data.org cache
 * (site_settings.hub_wc_matches_cache, captured 2026-09-01). Codes are FIFA
 * three-letter codes as they appear in lib/wc-2026-schedule.ts.
 */
export type WcFinalResult = {
  homeCode: string;
  awayCode: string;
  homeScore: number;
  awayScore: number;
};

export const WC_2026_RESULTS: WcFinalResult[] = [
  { homeCode: "ALG", awayCode: "AUT", homeScore: 3, awayScore: 3 },
  { homeCode: "ARG", awayCode: "ALG", homeScore: 3, awayScore: 0 },
  { homeCode: "ARG", awayCode: "AUT", homeScore: 2, awayScore: 0 },
  { homeCode: "ARG", awayCode: "CPV", homeScore: 3, awayScore: 2 },
  { homeCode: "ARG", awayCode: "EGY", homeScore: 3, awayScore: 2 },
  { homeCode: "ARG", awayCode: "SUI", homeScore: 3, awayScore: 1 },
  { homeCode: "AUS", awayCode: "EGY", homeScore: 3, awayScore: 5 },
  { homeCode: "AUS", awayCode: "TUR", homeScore: 2, awayScore: 0 },
  { homeCode: "AUT", awayCode: "JOR", homeScore: 3, awayScore: 1 },
  { homeCode: "BEL", awayCode: "EGY", homeScore: 1, awayScore: 1 },
  { homeCode: "BEL", awayCode: "IRN", homeScore: 0, awayScore: 0 },
  { homeCode: "BEL", awayCode: "SEN", homeScore: 3, awayScore: 2 },
  { homeCode: "BIH", awayCode: "QAT", homeScore: 3, awayScore: 1 },
  { homeCode: "BRA", awayCode: "HAI", homeScore: 3, awayScore: 0 },
  { homeCode: "BRA", awayCode: "JPN", homeScore: 2, awayScore: 1 },
  { homeCode: "BRA", awayCode: "MAR", homeScore: 1, awayScore: 1 },
  { homeCode: "BRA", awayCode: "NOR", homeScore: 1, awayScore: 2 },
  { homeCode: "CAN", awayCode: "BIH", homeScore: 1, awayScore: 1 },
  { homeCode: "CAN", awayCode: "MAR", homeScore: 0, awayScore: 3 },
  { homeCode: "CAN", awayCode: "QAT", homeScore: 6, awayScore: 0 },
  { homeCode: "CIV", awayCode: "ECU", homeScore: 1, awayScore: 0 },
  { homeCode: "CIV", awayCode: "NOR", homeScore: 1, awayScore: 2 },
  { homeCode: "COD", awayCode: "UZB", homeScore: 3, awayScore: 1 },
  { homeCode: "COL", awayCode: "COD", homeScore: 1, awayScore: 0 },
  { homeCode: "COL", awayCode: "GHA", homeScore: 1, awayScore: 0 },
  { homeCode: "COL", awayCode: "POR", homeScore: 0, awayScore: 0 },
  { homeCode: "CPV", awayCode: "KSA", homeScore: 0, awayScore: 0 },
  { homeCode: "CRO", awayCode: "GHA", homeScore: 2, awayScore: 1 },
  { homeCode: "CUW", awayCode: "CIV", homeScore: 0, awayScore: 2 },
  { homeCode: "CZE", awayCode: "MEX", homeScore: 0, awayScore: 3 },
  { homeCode: "CZE", awayCode: "RSA", homeScore: 1, awayScore: 1 },
  { homeCode: "ECU", awayCode: "CUW", homeScore: 0, awayScore: 0 },
  { homeCode: "ECU", awayCode: "GER", homeScore: 2, awayScore: 1 },
  { homeCode: "EGY", awayCode: "IRN", homeScore: 1, awayScore: 1 },
  { homeCode: "ENG", awayCode: "ARG", homeScore: 1, awayScore: 2 },
  { homeCode: "ENG", awayCode: "COD", homeScore: 2, awayScore: 1 },
  { homeCode: "ENG", awayCode: "CRO", homeScore: 4, awayScore: 2 },
  { homeCode: "ENG", awayCode: "GHA", homeScore: 0, awayScore: 0 },
  { homeCode: "ESP", awayCode: "ARG", homeScore: 1, awayScore: 0 },
  { homeCode: "ESP", awayCode: "AUT", homeScore: 3, awayScore: 0 },
  { homeCode: "ESP", awayCode: "BEL", homeScore: 2, awayScore: 1 },
  { homeCode: "ESP", awayCode: "CPV", homeScore: 0, awayScore: 0 },
  { homeCode: "ESP", awayCode: "KSA", homeScore: 4, awayScore: 0 },
  { homeCode: "FRA", awayCode: "ENG", homeScore: 4, awayScore: 6 },
  { homeCode: "FRA", awayCode: "ESP", homeScore: 0, awayScore: 2 },
  { homeCode: "FRA", awayCode: "IRQ", homeScore: 3, awayScore: 0 },
  { homeCode: "FRA", awayCode: "MAR", homeScore: 2, awayScore: 0 },
  { homeCode: "FRA", awayCode: "SEN", homeScore: 3, awayScore: 1 },
  { homeCode: "FRA", awayCode: "SWE", homeScore: 3, awayScore: 0 },
  { homeCode: "GER", awayCode: "CIV", homeScore: 2, awayScore: 1 },
  { homeCode: "GER", awayCode: "CUW", homeScore: 7, awayScore: 1 },
  { homeCode: "GER", awayCode: "PAR", homeScore: 4, awayScore: 5 },
  { homeCode: "GHA", awayCode: "PAN", homeScore: 1, awayScore: 0 },
  { homeCode: "HAI", awayCode: "SCO", homeScore: 0, awayScore: 1 },
  { homeCode: "IRN", awayCode: "NZL", homeScore: 2, awayScore: 2 },
  { homeCode: "IRQ", awayCode: "NOR", homeScore: 1, awayScore: 4 },
  { homeCode: "JOR", awayCode: "ALG", homeScore: 1, awayScore: 2 },
  { homeCode: "JOR", awayCode: "ARG", homeScore: 1, awayScore: 3 },
  { homeCode: "JPN", awayCode: "SWE", homeScore: 1, awayScore: 1 },
  { homeCode: "KOR", awayCode: "CZE", homeScore: 2, awayScore: 1 },
  { homeCode: "KSA", awayCode: "URY", homeScore: 1, awayScore: 1 },
  { homeCode: "MAR", awayCode: "HAI", homeScore: 4, awayScore: 2 },
  { homeCode: "MEX", awayCode: "ECU", homeScore: 2, awayScore: 0 },
  { homeCode: "MEX", awayCode: "ENG", homeScore: 2, awayScore: 3 },
  { homeCode: "MEX", awayCode: "KOR", homeScore: 1, awayScore: 0 },
  { homeCode: "MEX", awayCode: "RSA", homeScore: 2, awayScore: 0 },
  { homeCode: "NED", awayCode: "JPN", homeScore: 2, awayScore: 2 },
  { homeCode: "NED", awayCode: "MAR", homeScore: 3, awayScore: 4 },
  { homeCode: "NED", awayCode: "SWE", homeScore: 5, awayScore: 1 },
  { homeCode: "NOR", awayCode: "ENG", homeScore: 1, awayScore: 2 },
  { homeCode: "NOR", awayCode: "FRA", homeScore: 1, awayScore: 4 },
  { homeCode: "NOR", awayCode: "SEN", homeScore: 3, awayScore: 2 },
  { homeCode: "NZL", awayCode: "BEL", homeScore: 1, awayScore: 5 },
  { homeCode: "NZL", awayCode: "EGY", homeScore: 1, awayScore: 3 },
  { homeCode: "PAN", awayCode: "CRO", homeScore: 0, awayScore: 1 },
  { homeCode: "PAN", awayCode: "ENG", homeScore: 0, awayScore: 2 },
  { homeCode: "PAR", awayCode: "AUS", homeScore: 0, awayScore: 0 },
  { homeCode: "PAR", awayCode: "FRA", homeScore: 0, awayScore: 1 },
  { homeCode: "POR", awayCode: "COD", homeScore: 1, awayScore: 1 },
  { homeCode: "POR", awayCode: "CRO", homeScore: 2, awayScore: 1 },
  { homeCode: "POR", awayCode: "ESP", homeScore: 0, awayScore: 1 },
  { homeCode: "POR", awayCode: "UZB", homeScore: 5, awayScore: 0 },
  { homeCode: "QAT", awayCode: "SUI", homeScore: 1, awayScore: 1 },
  { homeCode: "RSA", awayCode: "CAN", homeScore: 0, awayScore: 1 },
  { homeCode: "RSA", awayCode: "KOR", homeScore: 1, awayScore: 0 },
  { homeCode: "SCO", awayCode: "BRA", homeScore: 0, awayScore: 3 },
  { homeCode: "SCO", awayCode: "MAR", homeScore: 0, awayScore: 1 },
  { homeCode: "SEN", awayCode: "IRQ", homeScore: 5, awayScore: 0 },
  { homeCode: "SUI", awayCode: "ALG", homeScore: 2, awayScore: 0 },
  { homeCode: "SUI", awayCode: "BIH", homeScore: 4, awayScore: 1 },
  { homeCode: "SUI", awayCode: "CAN", homeScore: 2, awayScore: 1 },
  { homeCode: "SUI", awayCode: "COL", homeScore: 4, awayScore: 3 },
  { homeCode: "SWE", awayCode: "TUN", homeScore: 5, awayScore: 1 },
  { homeCode: "TUN", awayCode: "JPN", homeScore: 0, awayScore: 4 },
  { homeCode: "TUN", awayCode: "NED", homeScore: 1, awayScore: 3 },
  { homeCode: "TUR", awayCode: "PAR", homeScore: 0, awayScore: 1 },
  { homeCode: "TUR", awayCode: "USA", homeScore: 3, awayScore: 2 },
  { homeCode: "URU", awayCode: "ESP", homeScore: 0, awayScore: 1 },
  { homeCode: "URY", awayCode: "CPV", homeScore: 2, awayScore: 2 },
  { homeCode: "USA", awayCode: "AUS", homeScore: 2, awayScore: 0 },
  { homeCode: "USA", awayCode: "BEL", homeScore: 1, awayScore: 4 },
  { homeCode: "USA", awayCode: "BIH", homeScore: 2, awayScore: 0 },
  { homeCode: "USA", awayCode: "PAR", homeScore: 4, awayScore: 1 },
  { homeCode: "UZB", awayCode: "COL", homeScore: 1, awayScore: 3 },
];
