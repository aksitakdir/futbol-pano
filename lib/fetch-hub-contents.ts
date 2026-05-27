import { supabase } from "@/lib/supabase";
import type { EditorialArticle } from "@/lib/editorial-article";

export async function fetchHubContents(
  tag: string,
  options?: { category?: string; limit?: number },
): Promise<EditorialArticle[]> {
  const limit = options?.limit ?? 24;
  let query = supabase
    .from("contents")
    .select("id,title,title_en,slug,category,content,content_en,created_at")
    .eq("status", "published")
    .contains("hub_tags", [tag])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (options?.category) {
    query = query.eq("category", options.category);
  }

  const { data, error } = await query;
  if (error) {
    console.warn("[fetchHubContents]", tag, error.message);
    return [];
  }
  return (data ?? []) as EditorialArticle[];
}
