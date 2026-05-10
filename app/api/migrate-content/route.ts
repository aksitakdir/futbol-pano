import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * sections_json format:
 * [
 *   { "type": "intro",     "html": "<p>...</p>" },
 *   { "type": "section",   "heading": "H2 text", "html": "<p>...</p><ul>...</ul>" },
 *   { "type": "pullquote", "text": "Quote text" },
 *   { "type": "callout",   "html": "<p>...</p>" }
 * ]
 */

type Section =
  | { type: "intro"; html: string }
  | { type: "section"; heading: string; html: string }
  | { type: "pullquote"; text: string }
  | { type: "callout"; html: string };

function htmlToSectionsJson(html: string): Section[] {
  // Simple rule-based parser (no Claude needed for initial conversion):
  // Split on <h2> tags
  if (!html?.trim()) return [];

  const sections: Section[] = [];

  // Extract intro (everything before the first <h2>)
  const firstH2 = html.indexOf("<h2");
  if (firstH2 > 0) {
    const introHtml = html.slice(0, firstH2).trim();
    if (introHtml) sections.push({ type: "intro", html: introHtml });
  } else if (firstH2 === -1) {
    // No headings — entire content is intro
    return [{ type: "intro", html: html.trim() }];
  }

  // Split on <h2> boundaries
  const h2Re = /<h2[^>]*>(.*?)<\/h2>/gi;
  const parts: { heading: string; start: number; end: number }[] = [];
  let match: RegExpExecArray | null;
  while ((match = h2Re.exec(html)) !== null) {
    parts.push({
      heading: match[1].replace(/<[^>]+>/g, "").trim(),
      start: match.index + match[0].length,
      end: html.length,
    });
    if (parts.length > 1) parts[parts.length - 2].end = match.index;
  }

  for (const part of parts) {
    const body = html.slice(part.start, part.end).trim();
    if (!body && !part.heading) continue;

    // Detect blockquotes as pull quotes
    const bqMatch = body.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
    if (bqMatch) {
      const bqText = bqMatch[1].replace(/<[^>]+>/g, "").trim();
      const remaining = body.replace(bqMatch[0], "").trim();
      sections.push({ type: "section", heading: part.heading, html: remaining });
      if (bqText) sections.push({ type: "pullquote", text: bqText });
    } else {
      sections.push({ type: "section", heading: part.heading, html: body });
    }
  }

  return sections;
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase config missing" }, { status: 500 });
  }

  let body: { id?: string; batch?: boolean } = {};
  try { body = await request.json(); } catch { /* empty */ }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Single content migration
  if (body.id) {
    const { data, error } = await supabase
      .from("contents")
      .select("id,content,content_en,sections_json")
      .eq("id", body.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    if (data.sections_json) {
      return NextResponse.json({ ok: true, status: "already_migrated", id: body.id });
    }

    const row = data as { id: string; content?: string; content_en?: string; sections_json?: unknown };
    const htmlToConvert = (row.content_en && row.content_en.trim()) ? row.content_en : (row.content ?? "");
    const sections = htmlToSectionsJson(htmlToConvert);

    const { error: updateError } = await supabase
      .from("contents")
      .update({ sections_json: sections })
      .eq("id", body.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, status: "migrated", id: body.id, sections_count: sections.length });
  }

  // Batch migration — migrate all without sections_json
  if (body.batch) {
    const { data: rows, error: fetchError } = await supabase
      .from("contents")
      .select("id,content,content_en,sections_json")
      .is("sections_json", null)
      .limit(50);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const items = (rows ?? []) as { id: string; content?: string; content_en?: string; sections_json?: unknown }[];
    let migrated = 0;
    let failed = 0;

    for (const item of items) {
      const htmlToConvert = (item.content_en && item.content_en.trim()) ? item.content_en : (item.content ?? "");
      const sections = htmlToSectionsJson(htmlToConvert);

      const { error: updateError } = await supabase
        .from("contents")
        .update({ sections_json: sections })
        .eq("id", item.id);

      if (updateError) {
        console.error("[migrate-content] Update failed for", item.id, updateError.message);
        failed++;
      } else {
        migrated++;
      }
    }

    return NextResponse.json({ ok: true, migrated, failed, total: items.length });
  }

  return NextResponse.json({ error: "Provide id or batch:true" }, { status: 400 });
}
