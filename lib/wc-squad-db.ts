import { supabase } from "@/lib/supabase";
import { positionBucket, type PositionBucket } from "@/lib/position-buckets";

export type WcSquadDbRow = {
  id: string;
  team_slug: string;
  position_bucket: PositionBucket;
  position: string;
  player_name: string;
  club: string | null;
  sort_order: number;
  overall_override: number | null;
};

export type WcSquadDraftRow = {
  id?: string;
  player_name: string;
  position: string;
  position_bucket: PositionBucket;
  club: string;
  sort_order: number;
  overall_override: number | null;
};

export async function fetchWcSquadFromDb(teamSlug: string): Promise<WcSquadDbRow[]> {
  const { data, error } = await supabase
    .from("wc_squad_players")
    .select("*")
    .eq("team_slug", teamSlug)
    .order("position_bucket")
    .order("sort_order");

  if (error) {
    console.warn("[fetchWcSquadFromDb]", teamSlug, error.message);
    return [];
  }
  return (data ?? []) as WcSquadDbRow[];
}

export async function saveWcSquadTeam(teamSlug: string, rows: WcSquadDraftRow[]): Promise<{ ok: boolean; error?: string }> {
  const { error: delErr } = await supabase.from("wc_squad_players").delete().eq("team_slug", teamSlug);
  if (delErr) return { ok: false, error: delErr.message };

  const seen = new Set<string>();
  const payload = rows
    .filter((r) => r.player_name.trim())
    .map((r, i) => ({
      team_slug: teamSlug,
      position_bucket: r.position_bucket || positionBucket(r.position),
      position: r.position.trim(),
      player_name: r.player_name.trim(),
      club: r.club.trim() || "",
      sort_order: r.sort_order ?? i,
      overall_override: r.overall_override,
    }))
    .filter((r) => {
      const key = r.player_name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  if (payload.length === 0) return { ok: true };

  const { error } = await supabase.from("wc_squad_players").insert(payload);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
