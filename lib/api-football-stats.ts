/**
 * API-Football (api-sports.io) — player & team statistics fetcher
 *
 * Free plan: 100 requests/day, seasons 2022-2024.
 * Used exclusively for content enrichment (Faz 4) — feeding verified stats
 * into the Lead Editor prompt so generated articles cite real numbers.
 *
 * Key endpoints:
 *   /players?id=X&season=2024     → per-competition stats
 *   /teams/statistics?team=X&season=2024&league=Y → team-level aggregates
 *   /players?search=Name&league=39&season=2024 → player search by name
 */

const API_BASE = "https://v3.football.api-sports.io";

function apiHeaders(): Record<string, string> {
  const key = process.env.FOOTBALL_API_KEY;
  if (!key) throw new Error("FOOTBALL_API_KEY not configured");
  return { "x-apisports-key": key };
}

// ─── Top-league IDs ──────────────────────────────────────────────────
export const LEAGUE_IDS: Record<string, number> = {
  "premier-league": 39,
  "la-liga": 140,
  "bundesliga": 78,
  "serie-a": 135,
  "ligue-1": 61,
  "super-lig": 203,
  "champions-league": 2,
  "europa-league": 3,
  "world-cup": 1,
};

/** Well-known team IDs for quick lookup */
export const TEAM_IDS: Record<string, number> = {
  "manchester-city": 50,
  "arsenal": 42,
  "liverpool": 40,
  "chelsea": 49,
  "manchester-united": 33,
  "tottenham": 47,
  "real-madrid": 541,
  "barcelona": 529,
  "atletico-madrid": 530,
  "bayern-munich": 157,
  "borussia-dortmund": 165,
  "juventus": 496,
  "inter-milan": 505,
  "ac-milan": 489,
  "psg": 85,
  "galatasaray": 645,
  "fenerbahce": 611,
  "besiktas": 616,
};

// ─── Types ───────────────────────────────────────────────────────────

export type PlayerStatSummary = {
  id: number;
  name: string;
  age: number;
  nationality: string;
  height: string;
  photo: string;
  competitions: CompetitionStats[];
};

export type CompetitionStats = {
  team: string;
  league: string;
  season: number;
  appearances: number;
  minutes: number;
  rating: number | null;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  passTotal: number;
  passKey: number;
  passAccuracy: number | null;
  dribblesAttempted: number;
  dribblesSucceeded: number;
  duelsTotal: number;
  duelsWon: number;
  tacklesTotal: number;
  interceptions: number;
  foulsCommitted: number;
  yellowCards: number;
  redCards: number;
};

export type TeamStatSummary = {
  teamId: number;
  teamName: string;
  league: string;
  season: number;
  form: string;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
  penaltiesScored: number;
  penaltiesMissed: number;
  formations: Array<{ formation: string; played: number }>;
};

// ─── Fetch functions ─────────────────────────────────────────────────

/**
 * Search for a player by name in a given league and season.
 * Returns the first matching player's ID, or null if not found.
 * Cost: 1 request.
 */
export async function searchPlayer(
  name: string,
  leagueId?: number,
  season = 2024,
): Promise<{ id: number; name: string } | null> {
  const params = new URLSearchParams({ search: name, season: String(season) });
  if (leagueId) params.set("league", String(leagueId));

  const res = await fetch(`${API_BASE}/players?${params}`, { headers: apiHeaders() });
  if (!res.ok) return null;

  type ApiResponse = {
    response?: Array<{ player: { id: number; name: string } }>;
  };
  const data = (await res.json()) as ApiResponse;
  const first = data.response?.[0];
  return first ? { id: first.player.id, name: first.player.name } : null;
}

/**
 * Fetch detailed stats for a player by API-Football ID.
 * Returns stats across all competitions for the given season.
 * Cost: 1 request.
 */
export async function fetchPlayerStats(
  playerId: number,
  season = 2024,
): Promise<PlayerStatSummary | null> {
  const res = await fetch(
    `${API_BASE}/players?id=${playerId}&season=${season}`,
    { headers: apiHeaders() },
  );
  if (!res.ok) return null;

  type ApiPlayer = {
    player: {
      id: number;
      name: string;
      age: number;
      nationality: string;
      height: string;
      photo: string;
    };
    statistics: Array<{
      team: { name: string };
      league: { name: string; season: number };
      games: {
        appearences: number;
        minutes: number;
        rating: string | null;
      };
      goals: { total: number | null; assists: number | null };
      shots: { total: number | null; on: number | null };
      passes: { total: number | null; key: number | null; accuracy: number | null };
      dribbles: { attempts: number | null; success: number | null };
      duels: { total: number | null; won: number | null };
      tackles: { total: number | null; interceptions: number | null };
      fouls: { committed: number | null };
      cards: { yellow: number | null; red: number | null };
    }>;
  };

  type ApiResponse = { response?: ApiPlayer[] };
  const data = (await res.json()) as ApiResponse;
  const entry = data.response?.[0];
  if (!entry) return null;

  const { player } = entry;
  const competitions: CompetitionStats[] = entry.statistics
    .filter((s) => (s.games.appearences ?? 0) > 0)
    .map((s) => ({
      team: s.team.name,
      league: s.league.name,
      season: s.league.season,
      appearances: s.games.appearences ?? 0,
      minutes: s.games.minutes ?? 0,
      rating: s.games.rating ? parseFloat(s.games.rating) : null,
      goals: s.goals.total ?? 0,
      assists: s.goals.assists ?? 0,
      shots: s.shots.total ?? 0,
      shotsOnTarget: s.shots.on ?? 0,
      passTotal: s.passes.total ?? 0,
      passKey: s.passes.key ?? 0,
      passAccuracy: s.passes.accuracy ?? null,
      dribblesAttempted: s.dribbles.attempts ?? 0,
      dribblesSucceeded: s.dribbles.success ?? 0,
      duelsTotal: s.duels.total ?? 0,
      duelsWon: s.duels.won ?? 0,
      tacklesTotal: s.tackles.total ?? 0,
      interceptions: s.tackles.interceptions ?? 0,
      foulsCommitted: s.fouls.committed ?? 0,
      yellowCards: s.cards.yellow ?? 0,
      redCards: s.cards.red ?? 0,
    }));

  return {
    id: player.id,
    name: player.name,
    age: player.age,
    nationality: player.nationality,
    height: player.height,
    photo: player.photo,
    competitions,
  };
}

/**
 * Fetch team-level aggregate stats for a season in a specific league.
 * Cost: 1 request.
 */
export async function fetchTeamStats(
  teamId: number,
  leagueId: number,
  season = 2024,
): Promise<TeamStatSummary | null> {
  const res = await fetch(
    `${API_BASE}/teams/statistics?team=${teamId}&season=${season}&league=${leagueId}`,
    { headers: apiHeaders() },
  );
  if (!res.ok) return null;

  type ApiTeamStats = {
    response: {
      team: { id: number; name: string };
      league: { name: string; season: number };
      form: string;
      fixtures: {
        wins: { total: number };
        draws: { total: number };
        loses: { total: number };
      };
      goals: {
        for: { total: { total: number } };
        against: { total: { total: number } };
      };
      clean_sheet: { total: number };
      penalty: {
        scored: { total: number };
        missed: { total: number };
      };
      lineups: Array<{ formation: string; played: number }>;
    };
  };

  const data = (await res.json()) as ApiTeamStats;
  const r = data.response;
  if (!r?.team) return null;

  return {
    teamId: r.team.id,
    teamName: r.team.name,
    league: r.league.name,
    season: r.league.season,
    form: r.form ?? "",
    wins: r.fixtures.wins.total,
    draws: r.fixtures.draws.total,
    losses: r.fixtures.loses.total,
    goalsFor: r.goals.for.total.total,
    goalsAgainst: r.goals.against.total.total,
    cleanSheets: r.clean_sheet.total,
    penaltiesScored: r.penalty.scored.total,
    penaltiesMissed: r.penalty.missed.total,
    formations: (r.lineups ?? [])
      .sort((a, b) => b.played - a.played)
      .slice(0, 4),
  };
}

// ─── Formatting for LLM context ─────────────────────────────────────

/**
 * Format a player's stats into a concise text block suitable for
 * injecting into the content generation prompt.
 */
export function formatPlayerContext(p: PlayerStatSummary): string {
  const lines: string[] = [];
  lines.push(`## ${p.name} (${p.nationality}, age ${p.age}, ${p.height})`);

  for (const c of p.competitions) {
    if (c.appearances < 2) continue; // skip trivial entries
    const per90 = c.minutes > 0 ? (m: number) => ((m / c.minutes) * 90).toFixed(2) : () => "0";
    lines.push(`  ${c.league} (${c.team}, ${c.season}-${c.season + 1}):`);
    lines.push(`    Apps: ${c.appearances} | Minutes: ${c.minutes} | Rating: ${c.rating?.toFixed(2) ?? "N/A"}`);
    lines.push(`    Goals: ${c.goals} (${per90(c.goals)}/90) | Assists: ${c.assists} (${per90(c.assists)}/90)`);
    lines.push(`    Shots: ${c.shots} (on target: ${c.shotsOnTarget}) | Shot accuracy: ${c.shots > 0 ? ((c.shotsOnTarget / c.shots) * 100).toFixed(0) : 0}%`);
    lines.push(`    Passes: ${c.passTotal} (key: ${c.passKey}${c.passAccuracy ? `, accuracy: ${c.passAccuracy}%` : ""})`);
    lines.push(`    Dribbles: ${c.dribblesSucceeded}/${c.dribblesAttempted} successful | Duels won: ${c.duelsWon}/${c.duelsTotal}`);
    if (c.tacklesTotal > 0 || c.interceptions > 0) {
      lines.push(`    Tackles: ${c.tacklesTotal} | Interceptions: ${c.interceptions}`);
    }
    lines.push(`    Cards: ${c.yellowCards}Y ${c.redCards}R`);
  }

  return lines.join("\n");
}

/**
 * Format team stats into a concise text block for prompt context.
 */
export function formatTeamContext(t: TeamStatSummary): string {
  const lines: string[] = [];
  const totalGames = t.wins + t.draws + t.losses;
  const ppg = totalGames > 0 ? ((t.wins * 3 + t.draws) / totalGames).toFixed(2) : "0";

  lines.push(`## ${t.teamName} — ${t.league} ${t.season}-${t.season + 1}`);
  lines.push(`  Record: ${t.wins}W ${t.draws}D ${t.losses}L (${totalGames} games, ${ppg} pts/game)`);
  lines.push(`  Goals: ${t.goalsFor} scored, ${t.goalsAgainst} conceded (GD: ${t.goalsFor - t.goalsAgainst > 0 ? "+" : ""}${t.goalsFor - t.goalsAgainst})`);
  lines.push(`  Goals/game: ${totalGames > 0 ? (t.goalsFor / totalGames).toFixed(2) : 0} scored, ${totalGames > 0 ? (t.goalsAgainst / totalGames).toFixed(2) : 0} conceded`);
  lines.push(`  Clean sheets: ${t.cleanSheets} (${totalGames > 0 ? ((t.cleanSheets / totalGames) * 100).toFixed(0) : 0}%)`);
  lines.push(`  Penalties: ${t.penaltiesScored} scored, ${t.penaltiesMissed} missed`);
  if (t.formations.length > 0) {
    lines.push(`  Formations: ${t.formations.map((f) => `${f.formation} (${f.played}x)`).join(", ")}`);
  }
  if (t.form) {
    const recent = t.form.slice(-10);
    lines.push(`  Recent form (last 10): ${recent.split("").join("-")}`);
  }

  return lines.join("\n");
}

/**
 * Search for a player by name, fetch their stats, and return formatted context.
 * Cost: 1-2 requests (search + fetch).
 * Returns null if player not found.
 */
export async function getPlayerContext(
  name: string,
  leagueId?: number,
  season = 2024,
): Promise<string | null> {
  const found = await searchPlayer(name, leagueId, season);
  if (!found) return null;

  const stats = await fetchPlayerStats(found.id, season);
  if (!stats) return null;

  return formatPlayerContext(stats);
}

/**
 * Get team context by known team slug and league.
 * Cost: 1 request.
 */
export async function getTeamContext(
  teamSlug: string,
  leagueSlug: string,
  season = 2024,
): Promise<string | null> {
  const teamId = TEAM_IDS[teamSlug];
  const leagueId = LEAGUE_IDS[leagueSlug];
  if (!teamId || !leagueId) return null;

  const stats = await fetchTeamStats(teamId, leagueId, season);
  if (!stats) return null;

  return formatTeamContext(stats);
}
