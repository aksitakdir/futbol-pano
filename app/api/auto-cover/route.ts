import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";
import { suggestCoverImage } from "@/lib/cover-image-suggest";

export async function POST(request: Request) {
  // Guarded 2026-09-26. proxy.ts only covers /admin pages, never /api — so this
  // route was callable by anyone, and it either writes with the service-role key
  // or spends on the Anthropic API. See docs/GUVENLIK-RLS-NOTLARI.md: every
  // write goes through isAdminRequest().
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase env vars missing" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let body: { id?: string; bulk?: boolean } = {};
  try {
    body = (await request.json()) as { id?: string; bulk?: boolean };
  } catch { /* empty */ }

  // Single article — suggest cover image without saving
  if (body.id && !body.bulk) {
    const { data: article } = await supabase
      .from("contents")
      .select("id,title,title_en,slug,category")
      .eq("id", body.id)
      .single();

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const title = article.title_en || article.title || "";
    const image = suggestCoverImage(title, article.slug, article.category);
    return NextResponse.json({ image, title, slug: article.slug });
  }

  // Bulk — fill all articles missing cover_image
  const { data: articles, error: fetchErr } = await supabase
    .from("contents")
    .select("id,title,title_en,slug,category,cover_image")
    .eq("status", "published");

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  const missing = (articles ?? []).filter(
    (a) => !a.cover_image?.trim(),
  );

  let updated = 0;
  for (const article of missing) {
    const title = article.title_en || article.title || "";
    const image = suggestCoverImage(title, article.slug, article.category);
    const { error: updateErr } = await supabase
      .from("contents")
      .update({ cover_image: image })
      .eq("id", article.id);

    if (!updateErr) updated++;
  }

  return NextResponse.json({
    total: articles?.length ?? 0,
    missing: missing.length,
    updated,
  });
}
