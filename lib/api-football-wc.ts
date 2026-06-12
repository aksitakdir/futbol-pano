/**
 * Fetch WC 2026 fixtures from api-football.com (api-sports.io).
 * Uses FOOTBALL_API_KEY (the same key used for player stats).
 * League ID 1 = FIFA World Cup, season 2026.
 */

import { WC_TEAMS } from "@/lib/wc-2026-teams";
import type { LiveScoreMatch } from "@/app/api/wc-live-scores/route";

const API_BASE = "https://v3.football.api-sports.io";
const WC_LEAGUE_ID = 1;
const WC_SEASON = 2026;

const WC_TLA = new Map(WC_TEAMS.map((t) => [t.nameEn.toLowerCase(), t.code]));

const NAME_ALIASES: Record<string, string> = {
  "cote d'ivoire": "CIV",
  "cote divoire": "CIV",
  "ivory coast": "CIV",
  "south korea": "KOR",
  "korea republic": "KOR",
  "korea": "KOR",
  "czech republic": "CZE",
  "czechia": "CZE",
  "bosnia and herzegovina": "BIH",
  "bosnia": "BIH",
  "turkey": "TUR",
  "türkiye": "TUR",
  "turkiye": "TUR",
  "united states": "USA",
  "usa": "USA",
  "curacao": "CUW",
  "curaçao": "CUW",
  "cape verde": "CPV",
  "cabo verde": "CPV",
  "cape verde islands": "CPV",
  "congo dr": "COD",
  "dr congo": "COD",
  "congo": "COD",
  "new zealand": "NZL",
  "saudi arabia": "KSA",
};

type ApiTeam = { id: number; name: string; logo?: string };
type ApiGoals = { home: number | null; away: number | null };
type ApiFixtureStatus = { long: string; short: string; elapsed: number | null };
type ApiFixture = {
  fixture: { id: number; date: string; status: ApiFixtureStatus };
  teams: { home: ApiTeam; away: ApiTeam };
  goals: ApiGoals;
  score: { fulltime: ApiGoals; halftime: ApiGoals };
};

function resolveCode(name: string): string {
  const lower = name.toLowerCase().trim();
  const alias = NAME_ALIASES[lower];
  if (alias) return alias;
  const direct = WC_TLA.get(lower);
  if (direct) return direct;
  for (const [key, code] of WC_TLA) {
    if (lower.includes(key) || key.includes(lower)) return code;
  }
  return name.slice(0, 3).toUpperCase();
}

function teamLabel(name: string): string {
  const code = resolveCode(name);
  const wc = WC_TEAMS.find((t) => t.code === code);
  return wc?.nameEn ?? name;
}

function mapStatus(short: string): LiveScoreMatch["status"] {
  if (short === "1H" || short === "2H" || short === "ET" || short === "LIVE") return "live";
  if (short === "HT") return "ht";
  if (short === "FT" || short === "AET" || short === "PEN") return "ft";
  return "ns";
}

function formatScore(goals: ApiGoals): string {
  if (goals.home == null || goals.away == null) return "—";
  return `${goals.home} — ${goals.away}`;
}

function formatMinute(status: ApiFixtureStatus): string {
  if (status.short === "FT" || status.short === "AET" || status.short === "PEN") return "FT";
  if (status.short === "HT") return "HT";
  if (status.elapsed != null) return `${status.elapsed}'`;
  if (status.short === "NS" || status.short === "TBD") {
    return "";
  }
  return "";
}

export async function fetchApiFootballWcMatches(apiKey: string): Promise<LiveScoreMatch[]> {
  const url = `${API_BASE}/fixtures?league=${WC_LEAGUE_ID}&season=${WC_SEASON}`;
  const res = await fetch(url, {
    headers: { "x-apisports-key": apiKey },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`api-football ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  const fixtures: ApiFixture[] = json.response ?? [];

  return fixtures.map((f) => ({
    id: String(f.fixture.id),
    home: teamLabel(f.teams.home.name),
    away: teamLabel(f.teams.away.name),
    homeCode: resolveCode(f.teams.home.name),
    awayCode: resolveCode(f.teams.away.name),
    score: formatScore(f.goals),
    minute: formatMinute(f.fixture.status),
    status: mapStatus(f.fixture.status.short),
    competitionEn: "FIFA World Cup 2026",
  }));
}
