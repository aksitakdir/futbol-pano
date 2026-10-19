"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminRequest } from "@/lib/admin-auth";
import { revalidateContent, revalidateEverything, type ContentRef } from "@/lib/revalidate-content";

type CreateResult = { ok: boolean; id?: string; error?: string };
type UpdateResult = { ok: boolean; error?: string };

/** Hub categories that must carry a matching hub_tags entry to appear in their hub. */
const HUB_TAG_BY_CATEGORY: Record<string, string> = {
  transfer: "transfer",
  "wc-2026": "wc-2026",
};

/**
 * Derive hub_tags from the article's category so hub-bound content (transfer,
 * wc-2026) always surfaces in its hub. Without this, articles saved via admin
 * lose their tag and silently vanish from the Transfers / World Cup hubs.
 * Only applied when the payload includes a category (full saves from the form).
 */
function withHubTags(payload: Record<string, unknown>): Record<string, unknown> {
  const category = typeof payload.category === "string" ? payload.category : undefined;
  if (!category) return payload;
  const tag = HUB_TAG_BY_CATEGORY[category];
  return { ...payload, hub_tags: tag ? [tag] : [] };
}

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
    .insert(withHubTags(payload))
    .select("id")
    .single();
  if (error || !data?.id) {
    return { ok: false, error: error?.message ?? "No id returned" };
  }
  if (payload.status === "published") revalidateContent([withHubTags(payload) as ContentRef]);
  return { ok: true, id: data.id as string };
}

/** Update an existing article (admin only). */
export async function updateContent(
  id: string,
  payload: Record<string, unknown>,
): Promise<UpdateResult> {
  if (!(await isAdminRequest())) return { ok: false, error: "Unauthorized" };
  // Read the row first: a changed slug or section must also refresh the pages that
  // listed it under the old one.
  const cols = "category,slug,hub_tags,status";
  const { data: before, error: readErr } = await supabaseAdmin.from("contents").select(cols).eq("id", id).maybeSingle();
  const { data: after, error } = await supabaseAdmin
    .from("contents")
    .update(withHubTags(payload))
    .eq("id", id)
    .select(cols)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };

  // A draft that is not and was not live is on no public page. If the row could not
  // be read first, the old slug and section are unknown: refresh everything.
  const rows = [before, after].filter(Boolean) as (ContentRef & { status?: string })[];
  if (readErr) revalidateEverything();
  else if (rows.some((r) => r.status === "published")) revalidateContent(rows);
  return { ok: true };
}
