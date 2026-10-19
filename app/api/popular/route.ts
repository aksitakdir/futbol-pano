import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

/**
 * "Most read" only ranks pieces from the last 90 days.
 *
 * WHY: increment_view_count filtered on the old Turkish status ('yayinda'), so the
 * counter froze in May 2026 and the block at the end of every article spent the
 * autumn recommending May's World Cup pieces (the tournament ball, a squad
 * announcement). Old totals can never be outranked by new pieces, even with the
 * counter fixed, so a window is the rule either way. Until the counter counts
 * again, recent pieces have no views and the list comes back short; the article
 * layout hides the block below three items.
 */
const WINDOW_DAYS = 90;

export async function GET() {
  const supabase = createClient();
  const since = new Date(Date.now() - WINDOW_DAYS * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from("contents")
    .select("id,title,title_en,slug,category,created_at,view_count")
    .eq("status", "published")
    .gte("created_at", since)
    .gt("view_count", 0)
    .order("view_count", { ascending: false })
    .limit(6);
  if (error) {
    // Never let the CDN keep an empty list for half an hour because of one blip.
    return NextResponse.json({ articles: [] }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json(
    { articles: data ?? [] },
    { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } },
  );
}
