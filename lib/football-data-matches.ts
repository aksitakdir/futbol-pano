import { WC_TEAMS } from "@/lib/wc-2026-teams";
import type { LiveScoreMatch } from "@/app/api/wc-live-scores/route";

const WC_TLA = new Set(WC_TEAMS.map((t) => t.code));

type FdTeam = { name?: string; shortName?: string; tla?: string };
type FdMatch = {
  id: number;
  utcDate: string;
  status: string;
  minute?: number | null;
  competition?: { name?: string; type?: string; code?: string };
  homeTeam: FdTeam;
  awayTeam: FdTeam;
  score?: {
    fullTime?: { home?: number | null; away?: number | null };
    halfTime?: { home?: number | null; away?: number | null };
  };
};

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function teamLabel(team: FdTeam): string {
  const tla = team.tla?.toUpperCase();
  const wc = WC_TEAMS.find((t) => t.code === tla);
  if (wc) return wc.nameEn;
  return team.shortName || team.name || tla || "—";
}

function mapStatus(status: string): LiveScoreMatch["status"] {
  if (status === "IN_PLAY" || status === "LIVE") return "live";
  if (status === "PAUSED" || status === "HALF_TIME") return "ht";
  if (status === "FINISHED") return "ft";
  return "ns";
}

function formatScore(m: FdMatch): string {
  const h = m.score?.fullTime?.home;
  const a = m.score?.fullTime?.away;
  if (h == null || a == null) return "—";
  return `${h} — ${a}`;
}

function formatMinute(m: FdMatch): string {
  const st = m.status;
  if (st === "FINISHED") return "FT";
  if (st === "HALF_TIME" || st === "PAUSED") return "HT";
  if (st === "IN_PLAY" && m.minute != null) return `${m.minute}'`;
  if (st === "SCHEDULED" || st === "TIMED") {
    const d = new Date(m.utcDate);
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  }
  return "";
}

function isRelevantMatch(m: FdMatch): boolean {
  const type = m.competition?.type ?? "";
  const code = (m.competition?.code ?? "").toUpperCase();
  const name = (m.competition?.name ?? "").toLowerCase();
  if (type === "INTERNATIONAL" || code === "WC" || code === "FIWC") return true;
  if (name.includes("world cup") || name.includes("friendly") || name.includes("international")) return true;
  const homeTla = m.homeTeam.tla?.toUpperCase() ?? "";
  const awayTla = m.awayTeam.tla?.toUpperCase() ?? "";
  return WC_TLA.has(homeTla) && WC_TLA.has(awayTla);
}

function competitionLabel(m: FdMatch): string {
  return m.competition?.name || "International";
}

export async function fetchFootballDataMatches(apiKey: string): Promise<LiveScoreMatch[]> {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 3);
  const to = new Date(now);
  to.setDate(to.getDate() + 21);

  const url = `https://api.football-data.org/v4/matches?dateFrom=${formatDate(from)}&dateTo=${formatDate(to)}`;
  const res = await fetch(url, {
    headers: { "X-Auth-Token": apiKey },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`football-data.org ${res.status}: ${body.slice(0, 120)}`);
  }

  const data = (await res.json()) as { matches?: FdMatch[] };
  const matches = (data.matches ?? []).filter(isRelevantMatch);

  const priority = (s: string) => {
    if (s === "IN_PLAY" || s === "LIVE") return 0;
    if (s === "HALF_TIME" || s === "PAUSED") return 1;
    if (s === "SCHEDULED" || s === "TIMED") return 2;
    if (s === "FINISHED") return 3;
    return 4;
  };

  matches.sort((a, b) => {
    const pd = priority(a.status) - priority(b.status);
    if (pd !== 0) return pd;
    return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
  });

  return matches.slice(0, 24).map((m) => ({
    id: String(m.id),
    home: teamLabel(m.homeTeam),
    away: teamLabel(m.awayTeam),
    homeCode: m.homeTeam.tla ?? "—",
    awayCode: m.awayTeam.tla ?? "—",
    score: formatScore(m),
    minute: formatMinute(m),
    status: mapStatus(m.status),
    competitionEn: competitionLabel(m),
  }));
}

/** EN locale display names for marquee */
export function localizeMatchesForEn(matches: LiveScoreMatch[]): LiveScoreMatch[] {
  return matches.map((m) => {
    const homeWc = WC_TEAMS.find((t) => t.code === m.homeCode);
    const awayWc = WC_TEAMS.find((t) => t.code === m.awayCode);
    return {
      ...m,
      home: homeWc?.nameEn ?? m.home,
      away: awayWc?.nameEn ?? m.away,
    };
  });
}
