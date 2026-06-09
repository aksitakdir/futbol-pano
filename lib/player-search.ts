/**
 * Unified player search — queries both fc_players AND player_cache,
 * merges/deduplicates results, and returns a combined list.
 *
 * Used by admin panel components (Player Card block, Player List, etc.)
 * so that BSD/API-Football cached players are discoverable alongside
 * the original EA FC database.
 */
import { supabase } from "@/lib/supabase";

export type PlayerSearchResult = {
  name: string;
  overall: number | null;
  position: string | null;
  club: string | null;
  league?: string | null;
  nationality?: string | null;
  age?: number | null;
  pace?: number | null;
  shooting?: number | null;
  passing?: number | null;
  dribbling?: number | null;
  defending?: number | null;
  physical?: number | null;
  photo_url?: string | null;
  source?: "fc" | "cache";
};

/**
 * Search both fc_players and player_cache, merge results.
 * fc_players results take priority when names overlap.
 */
export async function searchPlayers(
  query: string,
  opts?: {
    /** Columns to select (default: full set for admin) */
    select?: string;
    limit?: number;
  },
): Promise<PlayerSearchResult[]> {
  const q = query.trim();
  if (!q || q.length < 2) return [];

  const limit = opts?.limit ?? 8;
  const fcSelect =
    opts?.select ??
    "name,overall,position,club,league,nationality,age,pace,shooting,passing,dribbling,defending,physical,photo_url";
  const cacheSelect =
    "name,overall,position,club,league,nationality,age,pace,shooting,passing,dribbling,defending,physical";

  // Query both tables in parallel
  const [fcRes, cacheRes] = await Promise.all([
    supabase
      .from("fc_players")
      .select(fcSelect)
      .ilike("name", `%${q}%`)
      .order("overall", { ascending: false })
      .limit(limit),
    supabase
      .from("player_cache")
      .select(cacheSelect)
      .ilike("name", `%${q}%`)
      .order("overall", { ascending: false })
      .limit(limit),
  ]);

  const fcPlayers: PlayerSearchResult[] = (fcRes.data ?? []).map((p) => {
    const row = p as unknown as Record<string, unknown>;
    return {
      name: row.name as string,
      overall: (row.overall as number) ?? null,
      position: (row.position as string) ?? null,
      club: (row.club as string) ?? null,
      league: (row.league as string) ?? null,
      nationality: (row.nationality as string) ?? null,
      age: (row.age as number) ?? null,
      pace: (row.pace as number) ?? null,
      shooting: (row.shooting as number) ?? null,
      passing: (row.passing as number) ?? null,
      dribbling: (row.dribbling as number) ?? null,
      defending: (row.defending as number) ?? null,
      physical: (row.physical as number) ?? null,
      photo_url: (row.photo_url as string) ?? null,
      source: "fc" as const,
    };
  });
  const cachePlayers: PlayerSearchResult[] = (cacheRes.data ?? []).map((p) => {
    const row = p as unknown as Record<string, unknown>;
    return {
      name: row.name as string,
      overall: (row.overall as number) ?? null,
      position: (row.position as string) ?? null,
      club: (row.club as string) ?? null,
      league: (row.league as string) ?? null,
      nationality: (row.nationality as string) ?? null,
      age: (row.age as number) ?? null,
      pace: (row.pace as number) ?? null,
      shooting: (row.shooting as number) ?? null,
      passing: (row.passing as number) ?? null,
      dribbling: (row.dribbling as number) ?? null,
      defending: (row.defending as number) ?? null,
      physical: (row.physical as number) ?? null,
      photo_url: null,
      source: "cache" as const,
    };
  });

  // Merge: fc_players take priority, deduplicate by lowercase name
  const seen = new Set<string>();
  const merged: PlayerSearchResult[] = [];

  for (const p of fcPlayers) {
    const key = p.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(p);
    }
  }
  for (const p of cachePlayers) {
    const key = p.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(p);
    }
  }

  // Sort by overall descending, take limit
  merged.sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0));
  return merged.slice(0, limit);
}

/**
 * Fallback: call the server-side resolve endpoint to fetch + cache a player
 * from BSD/API-Football when they're not in either local table.
 * Returns the resolved player or null.
 *
 * Call this from admin UI when searchPlayers returns empty — it triggers
 * the 4-tier resolver server-side and caches the result for future searches.
 */
export async function resolveAndSearch(
  name: string,
): Promise<PlayerSearchResult | null> {
  try {
    const res = await fetch(
      `/api/players/resolve?name=${encodeURIComponent(name)}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      name: data.name,
      overall: data.overall ?? null,
      position: data.position ?? null,
      club: data.club ?? null,
      league: data.league ?? null,
      nationality: data.nationality ?? null,
      age: data.age ?? null,
      pace: data.pace ?? null,
      shooting: data.shooting ?? null,
      passing: data.passing ?? null,
      dribbling: data.dribbling ?? null,
      defending: data.defending ?? null,
      physical: data.physical ?? null,
      photo_url: null,
      source: "cache",
    };
  } catch {
    return null;
  }
}
