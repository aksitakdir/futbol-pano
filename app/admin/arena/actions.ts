"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminRequest } from "@/lib/admin-auth";

type ParticipantDraft = { name: string; subtitle?: string; vs?: string };

export type ArenaGamePayload = {
  slug: string;
  status: string;
  title_en: string;
  description_en: string;
  hero_title_en: string;
  hero_teaser_en: string;
  card_color: string;
  game_type: string;
  participants: ParticipantDraft[];
  hub_tags: string[];
  team_slug: string | null;
};

type ActionResult = { ok: boolean; error?: string };

/** Create or update an arena game (admin only). */
export async function saveArenaGame(
  payload: ArenaGamePayload,
  editingId?: string,
): Promise<ActionResult> {
  if (!(await isAdminRequest())) {
    return { ok: false, error: "Unauthorized" };
  }
  const { error } = editingId
    ? await supabaseAdmin.from("arena_games").update(payload).eq("id", editingId)
    : await supabaseAdmin.from("arena_games").insert(payload);
  if (error) return { ok: false, error: error.message };
  // The homepage hero can feature a published game (lib/home-data.ts).
  revalidatePath("/");
  revalidatePath("/arena");
  return { ok: true };
}

/** Delete an arena game (admin only). */
export async function deleteArenaGame(id: string): Promise<ActionResult> {
  if (!(await isAdminRequest())) {
    return { ok: false, error: "Unauthorized" };
  }
  const { error } = await supabaseAdmin.from("arena_games").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/arena");
  return { ok: true };
}
