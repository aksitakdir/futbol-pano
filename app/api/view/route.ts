import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { slug } = (await request.json()) as { slug?: string };
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Server-only route: prefer service-role so the view counter survives RLS lockdown.
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase config missing" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try using the RPC function first; fallback to direct increment
    const { error: rpcError } = await supabase.rpc("increment_view_count", { content_slug: slug });

    if (rpcError) {
      // Fallback: read current count and increment manually
      const { data: row } = await supabase
        .from("contents")
        .select("view_count")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (row) {
        await supabase
          .from("contents")
          .update({ view_count: (row.view_count ?? 0) + 1 })
          .eq("slug", slug)
          .eq("status", "published");
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
