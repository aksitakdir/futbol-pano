/**
 * Shape of a World Cup fixture as the site stores and renders it.
 *
 * This type used to live in `app/api/wc-live-scores/route.ts`, which was deleted
 * when the tournament ended — three libraries were importing a type out of a
 * route handler, so removing the route would have broken the schedule pages that
 * still display the final results.
 */
export type LiveScoreMatch = {
  id: string;
  home: string;
  away: string;
  homeCode: string;
  awayCode: string;
  score: string;
  minute: string;
  status: "live" | "ht" | "ft" | "ns";
  competitionEn: string;
};
