import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createClient();
  const { data } = await supabase
    .from("contents")
    .select("id,title,title_en,slug,category,created_at,view_count")
    .eq("status", "published")
    .gt("view_count", 0)
    .order("view_count", { ascending: false })
    .limit(6);

  return NextResponse.json(
    { articles: data ?? [] },
    { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } },
  );
}
