import { NextResponse } from "next/server";
import { fetchFootballDataMatches, localizeMatchesForEn } from "@/lib/football-data-matches";
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
  competitionTr: string;
  competitionEn: string;
};

const FALLBACK_MATCHES: LiveScoreMatch[] = [
  {
    id: "fb-1",
    home: "Meksika",
    away: "ABD",
    homeCode: "MEX",
    awayCode: "USA",
    score: "1 — 1",
    minute: "67'",
    status: "live",
    competitionTr: "Hazırlık Maçı",
    competitionEn: "Friendly",
  },
  {
    id: "fb-2",
    home: "Brezilya",
    away: "Arjantin",
    homeCode: "BRA",
    awayCode: "ARG",
    score: "2 — 0",
    minute: "HT",
    status: "ht",
    competitionTr: "Hazırlık Maçı",
    competitionEn: "Friendly",
  },
];

const CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get("locale") === "en" ? "en" : "tr";
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  let cache = await readWcMatchesCache();
  const stale =
    !cache.updatedAt || Date.now() - new Date(cache.updatedAt).getTime() > CACHE_TTL_MS;

  if (stale && apiKey) {
    const sync = await syncWcMatchesCache();
    if (sync.ok) cache = await readWcMatchesCache();
  }

  let matches = cache.matches;
  let source = cache.source;

  if (matches.length === 0 && apiKey) {
    try {
      matches = await fetchFootballDataMatches(apiKey);
      source = "football-data.org";
    } catch {
      matches = FALLBACK_MATCHES;
      source = "fallback";
    }
  } else if (matches.length === 0) {
    matches = FALLBACK_MATCHES;
    source = "fallback";
  }

  if (locale === "en") {
    matches = localizeMatchesForEn(matches);
  }

  return NextResponse.json(
    { matches, source, updatedAt: cache.updatedAt },
    { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } },
  );
}
