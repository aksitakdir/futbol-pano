"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminRequest } from "@/lib/admin-auth";

type CreateResult = { ok: boolean; id?: string; error?: string };
type UpdateResult = { ok: boolean; error?: string };

/**
 * Create a new article (admin only). Payload columns are validated by the
 * DB schema; callers are trusted admin pages. Returns the new row id.
 */
export async function createContent(
  payload: Record<string, unknown>,
): Promise<CreateResult> {
  if (!(await isAdminRequest())) return { ok: false, error: "Unauthorized" };
  const { data, error } = await supabaseAdmin
    .from("contents")
    .insert(payload)
    .select("id")
    .single();
  if (error || !data?.id) {
    return { ok: false, error: error?.message ?? "No id returned" };
  }
  return { ok: true, id: data.id as string };
}

/** Update an existing article (admin only). */
export async function updateContent(
  id: string,
  payload: Record<string, unknown>,
): Promise<UpdateResult> {
  if (!(await isAdminRequest())) return { ok: false, error: "Unauthorized" };
  const { error } = await supabaseAdmin
    .from("contents")
    .update(payload)
    .eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
