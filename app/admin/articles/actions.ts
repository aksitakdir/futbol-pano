"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminRequest } from "@/lib/admin-auth";
import { revalidateContent, revalidateEverything, type ContentRef } from "@/lib/revalidate-content";

type ActionResult = { ok: boolean; error?: string };

/** Section, slug and tags of the rows about to change; null if they could not be read. */
async function refsFor(ids: string[]): Promise<ContentRef[] | null> {
  const { data, error } = await supabaseAdmin.from("contents").select("category,slug,hub_tags").in("id", ids);
  return error ? null : ((data ?? []) as ContentRef[]);
}

function refresh(refs: ContentRef[] | null) {
  if (refs) revalidateContent(refs);
  else revalidateEverything();
}

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
  if (error) return { ok: false, error: error.message };
  // Publish, Unpublish, Reject and the bulk buttons all land here.
  refresh(await refsFor(ids));
  return { ok: true };
}

/** Delete one or more articles (admin only). */
export async function deleteContents(ids: string[]): Promise<ActionResult> {
  if (!(await isAdminRequest())) return { ok: false, error: "Unauthorized" };
  if (ids.length === 0) return { ok: true };
  const refs = await refsFor(ids); // read before the rows are gone
  const { error } = await supabaseAdmin.from("contents").delete().in("id", ids);
  if (error) return { ok: false, error: error.message };
  refresh(refs);
  return { ok: true };
}
