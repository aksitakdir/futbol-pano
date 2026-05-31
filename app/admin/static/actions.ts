"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminRequest } from "@/lib/admin-auth";

type ActionResult = { ok: boolean; error?: string };

type StaticPayload = {
  type: string;
  name: string;
  description: string;
  slug: string;
  position_tag: string;
  sort_order: number;
};

/** Bulk-insert seed static pages (admin only). */
export async function seedStaticContents(
  rows: StaticPayload[],
): Promise<ActionResult> {
  if (!(await isAdminRequest())) return { ok: false, error: "Unauthorized" };
  const { error } = await supabaseAdmin.from("static_contents").insert(rows);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Create or update a static page (admin only). */
export async function saveStaticContent(
  payload: StaticPayload,
  id?: string,
): Promise<ActionResult> {
  if (!(await isAdminRequest())) return { ok: false, error: "Unauthorized" };
  const { error } = id
    ? await supabaseAdmin.from("static_contents").update(payload).eq("id", id)
    : await supabaseAdmin.from("static_contents").insert(payload);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Delete a static page (admin only). */
export async function deleteStaticContent(id: string): Promise<ActionResult> {
  if (!(await isAdminRequest())) return { ok: false, error: "Unauthorized" };
  const { error } = await supabaseAdmin.from("static_contents").delete().eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
