"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminRequest } from "@/lib/admin-auth";

type ActionResult = { ok: boolean; error?: string };

/** Update the status of one or more articles (admin only). */
export async function updateContentStatus(
  ids: string[],
  status: string,
): Promise<ActionResult> {
  if (!(await isAdminRequest())) return { ok: false, error: "Unauthorized" };
  if (ids.length === 0) return { ok: true };
  const { error } = await supabaseAdmin
    .from("contents")
    .update({ status })
    .in("id", ids);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Delete one or more articles (admin only). */
export async function deleteContents(ids: string[]): Promise<ActionResult> {
  if (!(await isAdminRequest())) return { ok: false, error: "Unauthorized" };
  if (ids.length === 0) return { ok: true };
  const { error } = await supabaseAdmin.from("contents").delete().in("id", ids);
  return error ? { ok: false, error: error.message } : { ok: true };
}
