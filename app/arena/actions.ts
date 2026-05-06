"use server";

import { createClient } from "@/lib/supabase";

export type LeaderboardEntry = {
  champion_name: string;
  vote_count: number;
};

/** Oyu kaydet, ardından güncel leaderboard'u döndür */
export async function recordVoteAndGetLeaderboard(
  gameSlug: string,
  championName: string,
  limit = 5,
): Promise<LeaderboardEntry[]> {
  const supabase = createClient();
  await supabase
    .from("arena_votes")
    .insert({ game_slug: gameSlug, champion_name: championName });
  const { data } = await supabase.rpc("get_arena_leaderboard", {
    p_slug: gameSlug,
    p_limit: limit,
  });
  return (data ?? []) as LeaderboardEntry[];
}

/** Sadece leaderboard oku (paylaşım sonuç ekranı için) */
export async function getLeaderboard(
  gameSlug: string,
  limit = 5,
): Promise<LeaderboardEntry[]> {
  const supabase = createClient();
  const { data } = await supabase.rpc("get_arena_leaderboard", {
    p_slug: gameSlug,
    p_limit: limit,
  });
  return (data ?? []) as LeaderboardEntry[];
}
