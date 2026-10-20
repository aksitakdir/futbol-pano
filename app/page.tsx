import HomeClient from "./home-client";
import { loadHomeSpotlights } from "@/lib/home-spotlights";
import { getHomeData } from "@/lib/home-data";

/**
 * The homepage: a server component that fetches every section and hands the data
 * to the interactive client layer.
 *
 * WHY: the homepage used to be a single "use client" file whose sections all
 * fetched in useEffects, so Googlebot's first pass got "LOADING..." placeholders
 * and no article link in the body (measured 2026-09-22). A footer index of 45
 * links was the stopgap (2026-10-19). Since P3 (2026-10-20) the hero, the
 * carousel, the article grid, the In Focus cards and both player sections are
 * rendered from server data (lib/home-data.ts, lib/home-spotlights.ts), and the
 * footer is the standard one: every piece is one click away on its section hub.
 */

// Hourly, and on every publish (lib/revalidate-content.ts refreshes "/").
export const revalidate = 3600;

export default async function HomePage() {
  const [spotlights, home] = await Promise.all([loadHomeSpotlights(), getHomeData()]);
  return <HomeClient spotlights={spotlights} home={home} />;
}
