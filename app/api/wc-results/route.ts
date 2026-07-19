import { NextResponse } from "next/server";
import { readWcMatchesCache, syncWcMatchesCache } from "@/lib/hub-sync";
import { normalizeTla } from "@/lib/football-data-matches";

export type WcFinishedResult = {
  homeCode: string;
  awayCode: string;
  homeScore: number;
  awayScore: number;
};

const CACHE_TTL_MS = 5 * 60 * 1000;

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
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
