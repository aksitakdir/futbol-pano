"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminRequest } from "@/lib/admin-auth";
import { positionBucket } from "@/lib/position-buckets";
import type { WcSquadDraftRow } from "@/lib/wc-squad-db";

type ActionResult = { ok: boolean; error?: string };

/**
 * Replace a team's World Cup squad (admin only).
 * Deletes existing rows for the team, then inserts the new draft.
 * Skips blank rows and de-dupes by player name to avoid unique-constraint
 * violations (mirrors the previous client-side saveWcSquadTeam logic).
 */
export async function saveWcSquad(
  teamSlug: string,
  rows: WcSquadDraftRow[],
): Promise<ActionResult> {
  if (!(await isAdminRequest())) return { ok: false, error: "Unauthorized" };

  const { error: delErr } = await supabaseAdmin
    .from("wc_squad_players")
    .delete()
    .eq("team_slug", teamSlug);
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

  const { error } = await supabaseAdmin.from("wc_squad_players").insert(payload);
  return error ? { ok: false, error: error.message } : { ok: true };
}
