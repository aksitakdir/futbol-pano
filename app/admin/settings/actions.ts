"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminRequest } from "@/lib/admin-auth";

type ActionResult = { ok: boolean; error?: string };

type SettingsPayload = {
  featured_player: unknown;
  hero_slider: unknown;
  recent_count: number;
  hero_custom_slides: unknown;
};

/** Save the four homepage settings rows (admin only). */
export async function saveSiteSettings(payload: SettingsPayload): Promise<ActionResult> {
  if (!(await isAdminRequest())) {
    return { ok: false, error: "Unauthorized" };
  }
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from("site_settings").upsert([
    { key: "featured_player", value: payload.featured_player, updated_at: now },
    { key: "hero_slider", value: payload.hero_slider, updated_at: now },
    { key: "recent_count", value: { count: payload.recent_count }, updated_at: now },
    { key: "hero_custom_slides", value: payload.hero_custom_slides, updated_at: now },
  ]);
  return error ? { ok: false, error: error.message } : { ok: true };
}
