import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseMarkupToBlocks } from "@/lib/parse-blocks";

function buildEnrichSystemPrompt(): string {
  const today = new Date().toISOString().split("T")[0];
  return `You are the Lead Editor of Scout Gamer — a premium English-first football analysis platform known for deep tactical insight, verified statistics, and magazine-quality prose.

Today: ${today}. Season: 2025-26.

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

NEVER invent specific statistics. Use qualitative analysis instead: "His passing range is exceptional" not "His 75.5% long-ball accuracy leads all midfielders."

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

  let body: { id?: string } = {};
  try {
    body = (await request.json()) as { id?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const articleId = body.id;
  if (!articleId) {
    return NextResponse.json({ error: "Article ID is required" }, { status: 400 });
  }

  const { data: article, error: fetchError } = await supabase
    .from("contents")
    .select("id,title,title_en,slug,content,content_en,sections_json,category")
    .eq("id", articleId)
    .single();

  if (fetchError || !article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const existingContent = article.content_en || article.content || "";
  const title = article.title_en || article.title || "";

  if (!existingContent.trim()) {
    return NextResponse.json({ error: "Article has no content to enrich" }, { status: 400 });
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
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: buildEnrichSystemPrompt(),
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    let errDetail = `HTTP ${res.status}`;
    try {
      const errBody = (await res.json()) as { error?: { message?: string } };
      if (errBody.error?.message) errDetail = errBody.error.message;
    } catch { /* ignore */ }
    return NextResponse.json({ error: `Anthropic API error: ${errDetail}` }, { status: 500 });
  }

  const data = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const rawText = (data.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("")
    .trim();

  if (!rawText) {
    return NextResponse.json({ error: "Model produced no text" }, { status: 500 });
  }

  const jsonStr = cleanAndExtractJson(rawText);
  if (!jsonStr) {
    return NextResponse.json({ error: "No valid JSON in response" }, { status: 500 });
  }

  let parsed: { content?: string };
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return NextResponse.json({ error: "Could not parse model JSON" }, { status: 500 });
  }

  let content = typeof parsed.content === "string" ? parsed.content.trim() : "";
  if (!content) {
    return NextResponse.json({ error: "Enriched content is empty" }, { status: 500 });
  }

  content = content.replace(/<cite[^>]*>([\s\S]*?)<\/cite>/gi, "$1");
  content = content.replace(/<cite[^>]*\/>/gi, "");

  const sectionsJson = parseMarkupToBlocks(content);
  const wordCount = content.split(/\s+/).length;

  return NextResponse.json({
    content,
    sectionsJson,
    wordCount,
    title,
  });
}
