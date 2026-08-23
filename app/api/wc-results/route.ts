import { NextResponse } from "next/server";
import { readWcMatchesCache, syncWcMatchesCache } from "@/lib/hub-sync";
import { normalizeTla } from "@/lib/football-data-matches";

export type WcFinishedResult = {
  homeCode: string;
  awayCode: string;
  homeScore: number;
  awayScore: number;
};

/**
 * Five minutes was right while matches were being played. The tournament is
 * finished and every score is final, so re-syncing that often meant each visit
 * to the schedule page (bots included) could trigger a fresh sync and Supabase
 * write for data that cannot change. Daily is generous for a completed event.
 *
 * Drop this back to minutes if a live tournament ever needs in-play scores.
 */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  const hasApiKey = !!(process.env.FOOTBALL_DATA_API_KEY || process.env.FOOTBALL_API_KEY);
  let cache = await readWcMatchesCache();
  const stale =
    !cache.updatedAt || Date.now() - new Date(cache.updatedAt).getTime() > CACHE_TTL_MS;

  if (stale && hasApiKey) {
    const sync = await syncWcMatchesCache();
    if (sync.ok) cache = await readWcMatchesCache();
  }

  const finished: WcFinishedResult[] = cache.matches
    .filter((m) => m.status === "ft")
    .map((m) => {
      const [h, a] = m.score.split("—").map((s) => parseInt(s.trim(), 10));
      return {
        // Normalize here too: the Supabase cache can still hold codes written
        // before the alias map existed (e.g. Uruguay as URY), and a stale entry
        // would otherwise serve a fixture that never matches our schedule.
        homeCode: normalizeTla(m.homeCode) ?? m.homeCode,
        awayCode: normalizeTla(m.awayCode) ?? m.awayCode,
        homeScore: isNaN(h) ? 0 : h,
        awayScore: isNaN(a) ? 0 : a,
      };
    });

  return NextResponse.json(
    { results: finished, updatedAt: cache.updatedAt },
    // CDN-cache for an hour rather than five minutes, so the route itself runs
    // far less often — final results do not need per-five-minute freshness.
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
  );
}
