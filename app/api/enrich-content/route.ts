import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseMarkupToBlocks } from "@/lib/parse-blocks";

function buildEnrichSystemPrompt(): string {
  const today = new Date().toISOString().split("T")[0];
  return `You are the Lead Editor of Scout Gamer — a premium English-first football analysis platform known for deep tactical insight, verified statistics, and magazine-quality prose.

Today: ${today}. Season: 2025-26. World Cup 2026 group stage ongoing.

## MANDATORY WEB SEARCH VERIFICATION — APPLIES TO ENTIRE ARTICLE

You have web search available. You MUST use it before writing ANY factual claim in ANY part of the article — paragraphs, comparison blocks, stat blocks, callouts, everywhere. No exceptions.

Search and verify:
- Current managers/coaches of any club you mention
- Recent transfers, signings, and squad changes
- Player statistics: goals, assists, appearances, caps — for the CURRENT season (2025-26)
- Any number, stat, or factual claim you are about to write

Your training data is OUTDATED. NEVER rely on memory for ANY fact or stat. Always search first, then write. If web search returns no result for a specific stat, use qualitative description — do NOT fall back to your training data.

## YOUR TASK

You are enriching an existing short article into a comprehensive, 2000+ word deep-dive. Keep the original angle and thesis but dramatically expand with:

- Deeper tactical analysis — formations, pressing triggers, defensive transitions, positional rotations
- Historical context — how this role/tactic evolved, key pioneers, generational shifts
- More player examples with detailed analysis of how they embody the archetype
- Tactical scenarios — specific match situations, movement patterns, decision-making
- Counter-strategies — how opponents try to neutralise this archetype
- Modern evolution — how the role is changing in current football

## WRITING PRINCIPLES

1. **Commentary over catalogue**: For every tactical concept, provide 2-3 sentences of interpretation.
2. **Niche over obvious**: Find angles nobody is talking about.
3. **Show, don't list**: Paint pictures of how tactics manifest on the pitch.
4. **Narrative arc**: Setup, tension, resolution/insight.
5. **Cultural depth**: Reference footballing heritage — Ajax school, Sacchi's revolution, La Masia.
6. **Global perspective**: Don't default to Premier League.
7. **Voice and opinion**: Take positions confidently.
8. **Sensory writing**: Describe how football *feels* — the geometry of a pressing trap, the moment a defender's hips commit.

## STATISTICS RULE

ALL statistics MUST come from web search. NEVER use stats from your training data — they are outdated.
If web search returns no result for a specific stat, use qualitative analysis instead: "His passing range is exceptional" not a made-up number. NEVER invent or recall specific statistics.

## OUTPUT FORMAT — BLOCK MARKUP

Write content using this block markup syntax (NOT HTML, NOT Markdown):

@lead: Opening paragraph — the hook. Vivid, compelling, sets the tone.

# Section Heading (H2)

Regular paragraph text. Use **bold** for emphasis, *italic* for nuance.

## Sub-heading (H3)

@player: Player Name

> A striking pull quote — one memorable sentence.

@callout: A key tactical insight or "did you know."

@section: Section With Built-in Body
The section heading and its body text together.

@divider
@divider: dots
@divider: gradient

- Bullet points for lists

## BLOCK USAGE GUIDE

Every enriched article MUST include:
- @lead: (exactly 1, at the start)
- # headings (4-6 per article for a 2000+ word piece)
- @player: for featured players (at least 3-4)
- > pull quote (exactly 1, placed mid-article)
- @callout: (1-2 for key insights)
- Regular paragraphs between sections
- @divider: for visual breathing room between major sections

## CONTENT REQUIREMENTS

- Target 2000-2500 words of body text
- 4-6 main sections
- English only
- Keep the original title exactly as-is
- Maintain the original thesis and angle — expand, don't redirect

Respond with ONLY this JSON:
{
  "content": "Full enriched article in block markup format"
}`;
}

function cleanAndExtractJson(raw: string): string | null {
  const text = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) return null;

  return text.substring(jsonStart, jsonEnd + 1);
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase env vars missing" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let body: { id?: string; slug?: string; save?: boolean; publish?: boolean; bulk?: boolean } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const autoSave = body.save ?? false;
  const autoPublish = body.publish ?? false;

  // ── Bulk mode: enrich multiple short articles ──
  if (body.bulk) {
    const { data: allArticles } = await supabase
      .from("contents")
      .select("id,title,title_en,slug,content,content_en,sections_json,category,status")
      .eq("category", "tactics-lab")
      .eq("status", "published");

    const short = (allArticles ?? []).filter((a) => {
      const text = a.content_en || a.content || "";
      return text.length > 0 && text.length < 3000;
    });

    const results: Array<{ slug: string; status: string; wordCount?: number; error?: string }> = [];

    for (const art of short) {
      try {
        const enrichRes = await enrichArticle(art, apiKey, supabase, true, true);
        results.push({ slug: art.slug, status: "success", wordCount: enrichRes.wordCount });
      } catch (err) {
        results.push({ slug: art.slug, status: "failed", error: err instanceof Error ? err.message : String(err) });
      }
    }

    return NextResponse.json({ total: short.length, results });
  }

  // ── Single article mode ──
  const articleId = body.id;
  const articleSlug = body.slug;
  if (!articleId && !articleSlug) {
    return NextResponse.json({ error: "Article ID or slug is required" }, { status: 400 });
  }

  // Look up by ID or slug
  const query = supabase
    .from("contents")
    .select("id,title,title_en,slug,content,content_en,sections_json,category");
  if (articleId) query.eq("id", articleId);
  else query.eq("slug", articleSlug!);

  const { data: article, error: fetchError } = await query.single();

  if (fetchError || !article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  try {
    const result = await enrichArticle(article, apiKey, supabase, autoSave, autoPublish);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function enrichArticle(
  article: any,
  apiKey: string,
  supabase: any,
  save: boolean,
  publish: boolean,
): Promise<{ content: string; sectionsJson: unknown[]; wordCount: number; title: string; saved: boolean; published: boolean }> {
  const existingContent = article.content_en || article.content || "";
  const title = article.title_en || article.title || "";

  if (!existingContent.trim()) {
    throw new Error("Article has no content to enrich");
  }

  const userMessage =
    `Enrich the following short article into a comprehensive 2000+ word deep-dive.\n\n` +
    `Title (keep exactly): "${title}"\n` +
    `Category: ${article.category}\n\n` +
    `--- EXISTING CONTENT ---\n${existingContent}\n--- END ---\n\n` +
    `Expand this into a rich, detailed article with 4-6 sections, multiple @player: blocks, ` +
    `tactical depth, historical context, and compelling narrative. Keep the original angle ` +
    `and thesis but dramatically expand the scope and detail. Target 2000-2500 words.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "web-search-2025-03-05",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: buildEnrichSystemPrompt(),
      messages: [{ role: "user", content: userMessage }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });

  if (!res.ok) {
    let errDetail = `HTTP ${res.status}`;
    try {
      const errBody = (await res.json()) as { error?: { message?: string } };
      if (errBody.error?.message) errDetail = errBody.error.message;
    } catch { /* ignore */ }
    throw new Error(`Anthropic API error: ${errDetail}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const rawText = (data.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("")
    .trim();

  if (!rawText) throw new Error("Model produced no text");

  const jsonStr = cleanAndExtractJson(rawText);
  if (!jsonStr) throw new Error("No valid JSON in response");

  let parsed: { content?: string };
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("Could not parse model JSON");
  }

  let content = typeof parsed.content === "string" ? parsed.content.trim() : "";
  if (!content) throw new Error("Enriched content is empty");

  content = content.replace(/<cite[^>]*>([\s\S]*?)<\/cite>/gi, "$1");
  content = content.replace(/<cite[^>]*\/>/gi, "");

  const sectionsJson = parseMarkupToBlocks(content);
  const wordCount = content.split(/\s+/).length;

  let saved = false;
  let published = false;

  if (save) {
    const updateData: Record<string, unknown> = {
      content_en: content,
      sections_json: sectionsJson,
    };
    if (publish) {
      updateData.status = "published";
      published = true;
    }
    const { error: updateErr } = await supabase
      .from("contents")
      .update(updateData)
      .eq("id", article.id);
    if (updateErr) throw new Error(`DB save failed: ${updateErr.message}`);
    saved = true;
    console.log(`[enrich] Saved "${title}" — ${wordCount} words, published: ${published}`);
  }

  return { content, sectionsJson, wordCount, title, saved, published };
}
