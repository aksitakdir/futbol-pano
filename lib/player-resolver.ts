/**
 * Player Resolver — 3-tier fallback chain for player card data.
 *
 * Tier 1: fc_players (EA FC database — 16K+ players, official ratings)
 * Tier 2: player_cache (Supabase — previously resolved from BSD/API-Football)
 * Tier 3: BSD API (free, 21K+ players, top 8 leagues) → cache result
 * Tier 4: API-Football (free 100/day, all leagues) → cache result
 *
 * Used by HeroPlayerCard and ArticlePlayerEmbed for universal coverage.
 */

import { supabase } from "./supabase";
import type { PlayerCardData } from "@/app/components/player-card";

// ─── Types ───────────────────────────────────────────────────────

type FcPlayerRow = {
  name: string;
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  position?: string;
  club?: string;
  league?: string;
  nationality?: string;
  age?: number;
  photo_url?: string;
};

type CacheRow = FcPlayerRow & {
  source?: string;
  rating?: number;
  xg?: number;
  xa?: number;
  goals?: number;
  assists?: number;
  appearances?: number;
};

// ─── Tier 1: fc_players (EA FC) ──────────────────────────────────

async function searchFcPlayers(name: string): Promise<PlayerCardData | null> {
  // Exact match
  const { data: exact } = await supabase
    .from("fc_players")
    .select("name,overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age,photo_url")
    .ilike("name", name)
    .limit(1)
    .maybeSingle();

  if (exact?.overall) return fcToCard(exact as FcPlayerRow);

  // Fuzzy: first two words
  const two = name.split(" ").slice(0, 2).join(" ");
  if (two.length < 3) return null;

  const { data: fuzzy } = await supabase
    .from("fc_players")
    .select("name,overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age,photo_url")
    .ilike("name", `%${two}%`)
    .order("overall", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fuzzy?.overall) return fcToCard(fuzzy as FcPlayerRow);

  // Fuzzy: last name only (handles "Ayyub Bouaddi" → matches "Ayyoub Bouaddi")
  const parts = name.split(" ");
  if (parts.length >= 2) {
    const lastName = parts[parts.length - 1];
    if (lastName.length >= 4) {
      const { data: lastNameMatch } = await supabase
        .from("fc_players")
        .select("name,overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age,photo_url")
        .ilike("name", `%${lastName}%`)
        .order("overall", { ascending: false })
        .limit(3);
      if (lastNameMatch && lastNameMatch.length > 0) {
        // Pick the one whose name is closest (shares the most characters with the query)
        const best = lastNameMatch.find((r) =>
          (r.name as string).toLowerCase().includes(lastName.toLowerCase()),
        );
        if (best?.overall) return fcToCard(best as FcPlayerRow);
      }
    }
  }

  return null;
}

function fcToCard(row: FcPlayerRow): PlayerCardData {
  return {
    name: row.name,
    club: row.club ?? "",
    league: row.league ?? "",
    position: row.position ?? "",
    age: row.age ?? "",
    overall: row.overall,
    pace: row.pace ?? 0,
    shooting: row.shooting ?? 0,
    passing: row.passing ?? 0,
    dribbling: row.dribbling ?? 0,
    defending: row.defending ?? 0,
    physical: row.physical ?? 0,
    photo_url: row.photo_url,
  };
}

// ─── Tier 2: player_cache ────────────────────────────────────────

async function searchPlayerCache(name: string): Promise<PlayerCardData | null> {
  const { data: exact } = await supabase
    .from("player_cache")
    .select("name,overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age")
    .ilike("name", name)
    .limit(1)
    .maybeSingle();

  if (exact?.overall) return cacheToCard(exact as CacheRow);

  // Fuzzy
  const two = name.split(" ").slice(0, 2).join(" ");
  if (two.length < 3) return null;

  const { data: fuzzy } = await supabase
    .from("player_cache")
    .select("name,overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age")
    .ilike("name", `%${two}%`)
    .order("overall", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fuzzy?.overall) return cacheToCard(fuzzy as CacheRow);

  // Fuzzy: last name only
  const parts = name.split(" ");
  if (parts.length >= 2) {
    const lastName = parts[parts.length - 1];
    if (lastName.length >= 4) {
      const { data: lastNameMatch } = await supabase
        .from("player_cache")
        .select("name,overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age")
        .ilike("name", `%${lastName}%`)
        .order("overall", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lastNameMatch?.overall) return cacheToCard(lastNameMatch as CacheRow);
    }
  }

  return null;
}

function cacheToCard(row: CacheRow): PlayerCardData {
  return {
    name: row.name,
    club: row.club ?? "",
    league: row.league ?? "",
    position: row.position ?? "",
    age: row.age ?? "",
    overall: row.overall,
    pace: row.pace ?? 0,
    shooting: row.shooting ?? 0,
    passing: row.passing ?? 0,
    dribbling: row.dribbling ?? 0,
    defending: row.defending ?? 0,
    physical: row.physical ?? 0,
  };
}

// ─── Tier 3: BSD API → cache ─────────────────────────────────────

async function fetchAndCacheFromBsd(name: string): Promise<PlayerCardData | null> {
  // Dynamic import to avoid loading BSD module when key not set
  if (!process.env.BSD_API_KEY) return null;

  try {
    const { resolveBsdPlayer } = await import("./bsd-stats");
    const result = await resolveBsdPlayer(name);
    if (!result || result.overall < 45) return null;

    // Write to player_cache for future lookups
    await supabase.from("player_cache").upsert(
      {
        name: result.name,
        short_name: result.short_name ?? null,
        position: result.position,
        club: result.club,
        league: result.league,
        nationality: result.nationality,
        age: result.age || null,
        market_value: result.market_value ?? null,
        overall: result.overall,
        pace: result.pace,
        shooting: result.shooting,
        passing: result.passing,
        dribbling: result.dribbling,
        defending: result.defending,
        physical: result.physical,
        source: "bsd",
        source_id: result.source_id,
        goals: result.goals ?? null,
        assists: result.assists ?? null,
        appearances: result.appearances ?? null,
        minutes: result.minutes ?? null,
        rating: result.rating ?? null,
        xg: result.xg ?? null,
        xa: result.xa ?? null,
        season: result.season,
        fetched_at: new Date().toISOString(),
      },
      { onConflict: "name,source" },
    );

    console.log(`[player-resolver] Cached from BSD: ${result.name} (OVR ${result.overall})`);

    return {
      name: result.name,
      club: result.club,
      league: result.league,
      position: result.position,
      age: result.age || "",
      overall: result.overall,
      pace: result.pace,
      shooting: result.shooting,
      passing: result.passing,
      dribbling: result.dribbling,
      defending: result.defending,
      physical: result.physical,
    };
  } catch (err) {
    console.warn("[player-resolver] BSD fetch error:", err);
    return null;
  }
}

// ─── Tier 4: API-Football → cache ────────────────────────────────

async function fetchAndCacheFromApiFootball(name: string): Promise<PlayerCardData | null> {
  if (!process.env.FOOTBALL_API_KEY) return null;

  try {
    const { getPlayerContext, searchPlayer, fetchPlayerStats } = await import("./api-football-stats");

    // Search player (1 request)
    const searchResults = await searchPlayer(name);
    if (!searchResults) return null;

    const playerId = (searchResults as { id: number }).id;
    const playerData = searchResults as {
      id: number;
      name: string;
      age?: number;
      nationality?: string;
    };

    // Fetch stats (1 request)
    const stats = await fetchPlayerStats(playerId);
    if (!stats) return null;

    // Derive ratings from API-Football data
    const totalApps = stats.competitions.reduce((s, c) => s + c.appearances, 0);
    const totalGoals = stats.competitions.reduce((s, c) => s + c.goals, 0);
    const totalAssists = stats.competitions.reduce((s, c) => s + c.assists, 0);
    const totalMins = stats.competitions.reduce((s, c) => s + c.minutes, 0);
    const avgRating = stats.competitions
      .filter((c) => c.rating)
      .reduce((s, c, _, a) => s + (c.rating ?? 0) / a.length, 0);
    const totalShots = stats.competitions.reduce((s, c) => s + c.shots, 0);
    const totalShotsOT = stats.competitions.reduce((s, c) => s + c.shotsOnTarget, 0);
    const totalPasses = stats.competitions.reduce((s, c) => s + c.passTotal, 0);
    const avgPassAcc = stats.competitions
      .filter((c) => c.passAccuracy)
      .reduce((s, c, _, a) => s + (c.passAccuracy ?? 0) / a.length, 0);
    const totalDribAtt = stats.competitions.reduce((s, c) => s + c.dribblesAttempted, 0);
    const totalDribSucc = stats.competitions.reduce((s, c) => s + c.dribblesSucceeded, 0);
    const totalDuels = stats.competitions.reduce((s, c) => s + c.duelsTotal, 0);
    const totalDuelsWon = stats.competitions.reduce((s, c) => s + c.duelsWon, 0);
    const totalTackles = stats.competitions.reduce((s, c) => s + c.tacklesTotal, 0);
    const totalInts = stats.competitions.reduce((s, c) => s + c.interceptions, 0);

    const cl = (v: number, min = 45, max = 95) => Math.max(min, Math.min(max, Math.round(v)));

    const per90 = totalMins > 0 ? 90 / (totalMins / Math.max(totalApps, 1)) : 1;
    const goalsPer90 = totalApps > 0 ? (totalGoals / totalApps) * per90 : 0;
    const assistsPer90 = totalApps > 0 ? (totalAssists / totalApps) * per90 : 0;
    const shotAcc = totalShots > 0 ? (totalShotsOT / totalShots) * 100 : 40;
    const dribRate = totalDribAtt > 0 ? (totalDribSucc / totalDribAtt) * 100 : 50;
    const duelRate = totalDuels > 0 ? (totalDuelsWon / totalDuels) * 100 : 50;
    const tackPer90 = totalApps > 0 ? (totalTackles / totalApps) * per90 : 0;
    const intPer90 = totalApps > 0 ? (totalInts / totalApps) * per90 : 0;

    const shooting = cl(55 + goalsPer90 * 40 + shotAcc * 0.15);
    const passing = cl(50 + avgPassAcc * 0.35 + assistsPer90 * 25);
    const dribbling = cl(50 + dribRate * 0.25 + (totalDribAtt / Math.max(totalApps, 1)) * per90 * 5);
    const defending = cl(45 + tackPer90 * 8 + intPer90 * 6 + duelRate * 0.2);
    const physical = cl(50 + duelRate * 0.3 + (totalMins / Math.max(totalApps, 1) >= 80 ? 10 : 5));
    const pace = cl(72 - Math.max(0, (stats.age ?? 27) - 28) * 1.5);

    let overall = Math.round(passing * 0.2 + shooting * 0.2 + dribbling * 0.15 + pace * 0.15 + defending * 0.15 + physical * 0.15);
    if (avgRating > 0) {
      overall = Math.round(overall * 0.6 + avgRating * 10 * 0.4);
    }
    overall = cl(overall);

    const mainComp = stats.competitions[0];

    // Cache it
    await supabase.from("player_cache").upsert(
      {
        name: stats.name,
        position: "",
        club: mainComp?.team ?? "",
        league: mainComp?.league ?? "",
        nationality: stats.nationality ?? "",
        age: stats.age ?? null,
        overall,
        pace,
        shooting,
        passing,
        dribbling,
        defending,
        physical,
        source: "api-football",
        source_id: stats.id,
        goals: totalGoals,
        assists: totalAssists,
        appearances: totalApps,
        minutes: totalMins,
        rating: avgRating > 0 ? Math.round(avgRating * 10) / 10 : null,
        season: "2024-25",
        fetched_at: new Date().toISOString(),
      },
      { onConflict: "name,source" },
    );

    console.log(`[player-resolver] Cached from API-Football: ${stats.name} (OVR ${overall})`);

    return {
      name: stats.name,
      club: mainComp?.team ?? "",
      league: mainComp?.league ?? "",
      position: "",
      age: stats.age ?? "",
      overall,
      pace,
      shooting,
      passing,
      dribbling,
      defending,
      physical,
    };
  } catch (err) {
    console.warn("[player-resolver] API-Football fetch error:", err);
    return null;
  }
}

// ─── Main resolver ───────────────────────────────────────────────

/**
 * Resolve a player name to card data using the 4-tier fallback chain.
 * Returns null only if all tiers fail.
 *
 * Client-safe: tiers 1-2 use Supabase anon client (no server env needed).
 * Tiers 3-4 require server-side API keys — they run in API routes / SSR only.
 */
export async function resolvePlayer(
  name: string,
  /** Set false to skip API calls (client-side usage) */
  allowApiFetch = true,
): Promise<PlayerCardData | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  // Tier 1: EA FC database
  const fc = await searchFcPlayers(trimmed);
  if (fc) return fc;

  // Tier 2: Previously cached
  try {
    const cached = await searchPlayerCache(trimmed);
    if (cached) return cached;
  } catch {
    // player_cache table might not exist yet — skip
  }

  if (!allowApiFetch) return null;

  // Tier 3: BSD (free, no rate limit)
  const bsd = await fetchAndCacheFromBsd(trimmed);
  if (bsd) return bsd;

  // Tier 3b: BSD with reversed name order (handles East Asian name formats:
  // "Lee Jae-sung" → "Jae-sung Lee", "Son Heung-min" → "Heung-min Son")
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    const reversed = [...parts.slice(1), parts[0]].join(" ");
    if (reversed.toLowerCase() !== trimmed.toLowerCase()) {
      const bsdReversed = await fetchAndCacheFromBsd(reversed);
      if (bsdReversed) return bsdReversed;
    }
  }

  // Tier 4: API-Football (100/day free, 7500/day Pro)
  const apif = await fetchAndCacheFromApiFootball(trimmed);
  if (apif) return apif;

  console.log(`[player-resolver] All tiers failed for: ${trimmed}`);
  return null;
}

/**
 * Client-side resolver: only checks Supabase (tiers 1-2).
 * No API keys needed. Use in client components.
 */
export async function resolvePlayerClient(name: string): Promise<PlayerCardData | null> {
  return resolvePlayer(name, false);
}
