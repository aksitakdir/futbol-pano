import { NextResponse } from "next/server";
import { localizeMatchesForEn } from "@/lib/football-data-matches";
import { readWcMatchesCache, syncWcMatchesCache } from "@/lib/hub-sync";

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

const FALLBACK_MATCHES: LiveScoreMatch[] = [
  {
    id: "fb-1",
    home: "Mexico",
    away: "USA",
    homeCode: "MEX",
    awayCode: "USA",
    score: "1 — 1",
    minute: "67'",
    status: "live",
    competitionEn: "Friendly",
  },
  {
    id: "fb-2",
    home: "Brazil",
    away: "Argentina",
    homeCode: "BRA",
    awayCode: "ARG",
    score: "2 — 0",
    minute: "HT",
    status: "ht",
    competitionEn: "Friendly",
  },
];

/**
 * Tuned for a tournament in progress, where a two-minute-old score is already
 * stale. The World Cup is over, so this ticker now re-syncs finished results —
 * the same waste as /api/wc-results, only more aggressive.
 *
 * Restore the short interval when there is live football to follow again.
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

  let matches = cache.matches;
  let source = cache.source;

  if (matches.length === 0) {
    matches = FALLBACK_MATCHES;
    source = "fallback";
  }

  matches = localizeMatchesForEn(matches);

  return NextResponse.json(
    { matches, source, updatedAt: cache.updatedAt },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
  );
}
