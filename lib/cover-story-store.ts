import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  COVER_STORY_SETTINGS_KEY,
  normalizeCoverStories,
  type CoverStoriesMap,
} from "@/lib/cover-story";

export function createSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function readCoverStoryPins(sb: SupabaseClient): Promise<CoverStoriesMap> {
  const { data, error } = await sb
    .from("site_settings")
    .select("value")
    .eq("key", COVER_STORY_SETTINGS_KEY)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return normalizeCoverStories(data?.value);
}

export async function writeCoverStoryPins(sb: SupabaseClient, pins: CoverStoriesMap): Promise<void> {
  const { error } = await sb.from("site_settings").upsert(
    {
      key: COVER_STORY_SETTINGS_KEY,
      value: pins,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);
}

export const EDITORIAL_ARTICLE_SELECT =
  "id,title,title_en,slug,category,content,content_en,created_at,cover_image";

