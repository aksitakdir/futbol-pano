"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminRequest } from "@/lib/admin-auth";
import { categoryArticlePath } from "@/lib/category-config";

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
    .update(withHubTags(payload))
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  const slug = typeof payload.slug === "string" ? payload.slug : undefined;
  const category = typeof payload.category === "string" ? payload.category : undefined;
  if (slug && category) {
    const articlePath = categoryArticlePath(category, slug);
    revalidatePath(articlePath);
    revalidatePath("/");
  }

  return { ok: true };
}
