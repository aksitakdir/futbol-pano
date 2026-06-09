/**
 * BSD (Bzzoiro Sports Data) — free football API integration.
 *
 * Provides: player search, profile, career stats, xG/xA, match stats.
 * Coverage: 21K+ players, 8 top leagues, 64K+ matches since 2004.
 * Auth: Token header. No rate limit. Free.
 *
 * Docs: https://sports.bzzoiro.com/docs/
 * API Schema: https://sports.bzzoiro.com/api/schema/
 */

const BSD_BASE = "https://sports.bzzoiro.com/api/v2";

function bsdHeaders(): Record<string, string> {
  const key = process.env.BSD_API_KEY;
  if (!key) throw new Error("BSD_API_KEY not configured");
  return {
    Authorization: `Token ${key}`,
    Accept: "application/json",
  };
}

// ─── Types ───────────────────────────────────────────────────────

export type BsdPlayer = {
  id: number;
  name: string;
  short_name?: string;
  position?: string;           // "G", "D", "M", "F"
  specific_position?: string;  // "GK", "CB", "RW", "ST", etc.
  nationality?: string;
  nationality_code?: string;
  date_of_birth?: string;
  height_cm?: number;
  preferred_foot?: string;
  market_value_eur?: number;
  current_team_id?: number;
  national_team_id?: number;
  rating?: number;             // BSD overall rating
  contract_until?: string;
};

/** Raw shape from BSD /players/{id}/career/ endpoint */
type BsdCareerRawSeason = {
  season_id: number;
  league_id: number;
  team_id: number;
  matches?: number;
  minutes?: number;
  goals?: number;
  assists?: number;
  avg_rating?: number;
};

/** Normalized career season (aligned for deriveRatings) */
export type BsdCareerSeason = {
  seasonId: number;
  leagueId: number;
  teamId: number;
  appearances: number;
  minutes: number;
  goals: number;
  assists: number;
  rating: number | null;
  // Match-level aggregates (filled from /stats/ when available)
  xg?: number;
  xa?: number;
  shots?: number;
  shots_on_target?: number;
  passes?: number;
  pass_accuracy?: number;
  dribbles_attempted?: number;
  dribbles_succeeded?: number;
  duels_total?: number;
  duels_won?: number;
  tackles?: number;
  interceptions?: number;
};

export type BsdPlayerProfile = BsdPlayer & {
  career?: BsdCareerSeason[];
};

// ─── API calls ───────────────────────────────────────────────────

/**
 * Search players by name. Returns up to `limit` matches.
 * Cost: 1 request (no rate limit on BSD).
 */
export async function searchBsdPlayer(
  name: string,
  limit = 5,
): Promise<BsdPlayer[]> {
  const url = `${BSD_BASE}/players/?name=${encodeURIComponent(name)}&limit=${limit}`;
  const res = await fetch(url, { headers: bsdHeaders() });
  if (!res.ok) {
    console.warn(`[bsd] Player search failed: ${res.status}`);
    return [];
  }
  const data = await res.json();
  // v2 returns { count, next, previous, results: [...] }
  return (data.results ?? data) as BsdPlayer[];
}

/**
 * Get full player profile by BSD player ID.
 * Cost: 1 request.
 */
export async function getBsdPlayer(id: number): Promise<BsdPlayer | null> {
  const url = `${BSD_BASE}/players/${id}/`;
  const res = await fetch(url, { headers: bsdHeaders() });
  if (!res.ok) return null;
  return (await res.json()) as BsdPlayer;
}

/**
 * Get player career stats (season-by-season totals).
 * BSD returns: { player_id, seasons: [{ season_id, league_id, team_id, matches, minutes, goals, assists, avg_rating }] }
 * Cost: 1 request.
 */
export async function getBsdCareer(id: number): Promise<BsdCareerSeason[]> {
  const url = `${BSD_BASE}/players/${id}/career/`;
  const res = await fetch(url, { headers: bsdHeaders() });
  if (!res.ok) return [];
  const data = await res.json();
  const rawSeasons: BsdCareerRawSeason[] = data.seasons ?? data.results ?? (Array.isArray(data) ? data : []);
  return rawSeasons.map((s) => ({
    seasonId: s.season_id,
    leagueId: s.league_id,
    teamId: s.team_id,
    appearances: s.matches ?? 0,
    minutes: s.minutes ?? 0,
    goals: s.goals ?? 0,
    assists: s.assists ?? 0,
    rating: s.avg_rating ?? null,
  }));
}

// ─── Derived ratings ─────────────────────────────────────────────

/**
 * Convert real-world stats into EA FC-style 0-99 ratings.
 * This is an approximation — not official EA data.
 *
 * Uses the most recent season's totals. Positional weighting
 * adjusts which raw stats matter most for each rating category.
 */
export function deriveRatings(
  player: BsdPlayer,
  season: BsdCareerSeason | null,
): {
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
} {
  if (!season || !season.appearances || season.appearances < 3) {
    // Not enough data — return baseline from rating alone
    const base = season?.rating ? Math.round(season.rating * 10) : 65;
    return { overall: base, pace: base, shooting: base, passing: base, dribbling: base, defending: base, physical: base };
  }

  const apps = season.appearances;
  const mins = season.minutes ?? apps * 70;
  const per90 = mins > 0 ? 90 / (mins / apps) : 1;
  const pos = (player.specific_position ?? player.position ?? "").toUpperCase();

  // ── Shooting (goals, shots accuracy, xG) ──
  const goalsPer90 = (season.goals ?? 0) / apps * per90;
  const shotAcc = (season.shots_on_target && season.shots)
    ? (season.shots_on_target / season.shots) * 100
    : 40;
  const xgBonus = season.xg ? Math.min(((season.goals ?? 0) - season.xg) * 3, 8) : 0; // overperformance
  let shooting = clamp(55 + goalsPer90 * 40 + shotAcc * 0.15 + xgBonus);

  // ── Passing (accuracy, assists, xA, key passes) ──
  const assistsPer90 = (season.assists ?? 0) / apps * per90;
  const passAcc = season.pass_accuracy ?? 70;
  let passing = clamp(50 + passAcc * 0.35 + assistsPer90 * 25);

  // ── Dribbling (success rate) ──
  const dribSuccRate = (season.dribbles_attempted && season.dribbles_attempted > 0)
    ? (season.dribbles_succeeded ?? 0) / season.dribbles_attempted * 100
    : 50;
  const dribVolume = (season.dribbles_attempted ?? 0) / apps * per90;
  let dribbling = clamp(50 + dribSuccRate * 0.25 + dribVolume * 5);

  // ── Defending (tackles, interceptions, duels) ──
  const tacklesPer90 = (season.tackles ?? 0) / apps * per90;
  const intPer90 = (season.interceptions ?? 0) / apps * per90;
  const duelWinRate = (season.duels_total && season.duels_total > 0)
    ? (season.duels_won ?? 0) / season.duels_total * 100
    : 50;
  let defending = clamp(45 + tacklesPer90 * 8 + intPer90 * 6 + duelWinRate * 0.2);

  // ── Physical (duel dominance, minutes endurance) ──
  const minsPerApp = mins / apps;
  const endurance = minsPerApp >= 80 ? 10 : minsPerApp >= 60 ? 5 : 0;
  let physical = clamp(50 + duelWinRate * 0.3 + endurance);

  // ── Pace (estimated — no tracking data, use position + age heuristic) ──
  const age = player.date_of_birth
    ? Math.floor((Date.now() - new Date(player.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000))
    : 27;
  let pace = clamp(72 - Math.max(0, age - 28) * 1.5 + dribVolume * 3);

  // ── Positional weighting ──
  if (pos.includes("GK") || pos === "G") {
    // Goalkeepers — special treatment
    const base = season.rating ? Math.round(season.rating * 10) : 68;
    return { overall: base, pace: clamp(base - 15), shooting: clamp(base - 30), passing: clamp(base - 5), dribbling: clamp(base - 20), defending: clamp(base + 5), physical: clamp(base) };
  }

  if (pos.includes("CB") || pos.includes("DEF") || pos === "D") {
    defending = clamp(defending + 8);
    physical = clamp(physical + 5);
    shooting = clamp(shooting - 8);
    dribbling = clamp(dribbling - 5);
  } else if (pos.includes("LB") || pos.includes("RB") || pos.includes("WB")) {
    pace = clamp(pace + 5);
    defending = clamp(defending + 3);
  } else if (pos.includes("CDM") || pos.includes("DM")) {
    defending = clamp(defending + 5);
    passing = clamp(passing + 3);
    physical = clamp(physical + 3);
  } else if (pos.includes("CM") || pos.includes("AM") || pos.includes("CAM")) {
    passing = clamp(passing + 5);
    dribbling = clamp(dribbling + 3);
  } else if (pos.includes("LW") || pos.includes("RW") || pos.includes("W")) {
    pace = clamp(pace + 6);
    dribbling = clamp(dribbling + 5);
  } else if (pos.includes("ST") || pos.includes("CF") || pos.includes("F")) {
    shooting = clamp(shooting + 6);
    pace = clamp(pace + 3);
  }

  // ── Overall: weighted average by position ──
  let overall: number;
  if (pos.includes("CB") || pos.includes("DEF") || pos === "D") {
    overall = Math.round(defending * 0.30 + physical * 0.20 + passing * 0.15 + pace * 0.15 + shooting * 0.10 + dribbling * 0.10);
  } else if (pos.includes("ST") || pos.includes("CF") || pos.includes("F")) {
    overall = Math.round(shooting * 0.30 + pace * 0.20 + dribbling * 0.20 + passing * 0.15 + physical * 0.10 + defending * 0.05);
  } else {
    // Midfield / wing default
    overall = Math.round(passing * 0.25 + dribbling * 0.20 + shooting * 0.15 + pace * 0.15 + defending * 0.15 + physical * 0.10);
  }

  // Calibrate against match rating if available
  if (season.rating) {
    const ratingBased = Math.round(season.rating * 10);
    overall = Math.round(overall * 0.6 + ratingBased * 0.4); // blend
  }

  return {
    overall: clamp(overall),
    pace: Math.round(pace),
    shooting: Math.round(shooting),
    passing: Math.round(passing),
    dribbling: Math.round(dribbling),
    defending: Math.round(defending),
    physical: Math.round(physical),
  };
}

function clamp(v: number, min = 45, max = 95): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

// ─── High-level: search + enrich ─────────────────────────────────

export type BsdPlayerWithRatings = {
  name: string;
  short_name?: string;
  position: string;
  club: string;
  league: string;
  nationality: string;
  age: number;
  market_value?: string;
  source: "bsd";
  source_id: number;
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  // Raw stats for content enrichment
  goals?: number;
  assists?: number;
  appearances?: number;
  minutes?: number;
  rating?: number;
  xg?: number;
  xa?: number;
  season: string;
};

/**
 * Search + fetch career + derive ratings. Full pipeline.
 * Cost: 2 requests (search + career).
 */
export async function resolveBsdPlayer(
  name: string,
): Promise<BsdPlayerWithRatings | null> {
  try {
    const results = await searchBsdPlayer(name, 5);
    if (results.length === 0) return null;

    // Best match: exact name or highest-rated
    const exact = results.find(
      (p) => p.name.toLowerCase() === name.toLowerCase(),
    );
    const player = exact ?? results[0];

    // Fetch career for latest season stats
    const career = await getBsdCareer(player.id);
    // Most recent season with meaningful appearances
    const latest = career
      .filter((s) => s.appearances >= 3)
      .sort((a, b) => b.seasonId - a.seasonId)[0] ?? null;

    const ratings = deriveRatings(player, latest);

    const age = player.date_of_birth
      ? Math.floor((Date.now() - new Date(player.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000))
      : 0;

    const seasonName = latest ? `season-${latest.seasonId}` : "2024-25";

    return {
      name: player.name,
      short_name: player.short_name,
      position: player.specific_position ?? player.position ?? "",
      club: "",  // BSD returns team ID, not name — enriched after cache
      league: "",
      nationality: player.nationality ?? "",
      age,
      market_value: player.market_value_eur
        ? `€${(player.market_value_eur / 1_000_000).toFixed(0)}M`
        : undefined,
      source: "bsd",
      source_id: player.id,
      overall: ratings.overall,
      pace: ratings.pace,
      shooting: ratings.shooting,
      passing: ratings.passing,
      dribbling: ratings.dribbling,
      defending: ratings.defending,
      physical: ratings.physical,
      goals: latest?.goals ?? undefined,
      assists: latest?.assists ?? undefined,
      appearances: latest?.appearances ?? undefined,
      minutes: latest?.minutes ?? undefined,
      rating: latest?.rating ?? undefined,
      xg: latest?.xg ?? undefined,
      xa: latest?.xa ?? undefined,
      season: seasonName,
    };
  } catch (err) {
    console.warn("[bsd] resolveBsdPlayer error:", err);
    return null;
  }
}
