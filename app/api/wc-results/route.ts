import { NextResponse } from "next/server";
import { readWcMatchesCache } from "@/lib/hub-sync";
import { normalizeTla } from "@/lib/football-data-matches";

export type WcFinishedResult = {
  homeCode: string;
  awayCode: string;
  homeScore: number;
  awayScore: number;
};

export async function GET() {
  // Read-only. The tournament is finished, so there is no refresh path left —
  // this serves the stored final results and nothing else.
  const cache = await readWcMatchesCache();

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
