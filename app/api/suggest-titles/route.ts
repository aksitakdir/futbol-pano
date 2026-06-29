import { NextResponse } from "next/server";

export const maxDuration = 60;

export type SuggestTitleMode = "trend" | "general" | "historical" | "chronological";

function buildSuggestSystem(): string {
  const today = new Date().toISOString().split("T")[0];

  // World Cup 2026 awareness: June 11 – July 19, 2026
  const now = new Date();
  const wcStart = new Date("2026-06-11");
  const wcEnd = new Date("2026-07-19");
  const isWcPeriod = now >= new Date("2026-05-01") && now <= new Date("2026-08-01");
  const wcPhase = now < wcStart
    ? "The FIFA World Cup 2026 (USA/Mexico/Canada) kicks off on June 11, 2026 — just days away!"
    : now <= wcEnd
      ? "The FIFA World Cup 2026 is CURRENTLY UNDERWAY. Prioritize WC content heavily."
      : "The FIFA World Cup 2026 just concluded. Post-tournament analysis is still highly relevant.";

  return `You are a football content editor for Scout Gamer, a global football analysis platform.
Today's date: ${today}. Current football season: 2025-26.
${isWcPeriod ? `\n⚽ ${wcPhase}\n` : ""}
The user provides a keyword or topic; you suggest 8 article titles.

CATEGORIES — use ALL of them strategically. Each title MUST have one:
- "wc-2026" — World Cup 2026 content: group previews, match analysis, squad breakdowns, star players, tactical previews, tournament narratives. ${isWcPeriod ? "HIGH PRIORITY right now." : ""}
- "transfer" — Transfer market: rumours, done deals, market analysis, club strategies, contract situations, free agents.
- "radar" — Player spotlights: scouting reports, breakout stars, statistical deep-dives, career analysis, comparison pieces.
- "tactics-lab" — Tactical analysis: formations, pressing systems, positional play, set pieces, coaching philosophies.
- "lists" — Ranked lists, top-N compilations, best XI selections, award predictions, stat-based rankings.

IMPORTANT distribution guidance:
${isWcPeriod ? "- During World Cup period: at least 3-4 titles should be wc-2026. Mix in other categories for variety." : "- During transfer window: prioritize transfer category. During regular season: balance across all categories."}
- Match the keyword intent to the most natural category. If the keyword mentions a specific match, team in World Cup context → wc-2026. Transfer rumours → transfer. A single player → radar. Formation/tactics → tactics-lab. Rankings → lists.

## KEYWORD RELEVANCE

ALL 8 titles MUST be directly and specifically about the user's keyword/topic. Do NOT drift to unrelated subjects, even if they are currently trending. Every title must clearly connect to the keyword provided.
Use web search to verify current facts: who manages which club right now, recent results, current squad status. NEVER use outdated information — if a manager was sacked or a player transferred, reflect the CURRENT reality.

Rules:
- Titles must be in ENGLISH. Scout Gamer is an English-first global platform.
- Titles must be decisive statements or strong claims — never vague or generic.
- Do NOT include specific years or seasons in the title (e.g. avoid "2024", "2025-26").
- Do NOT force Turkey, Süper Lig, or Turkish club references unless the keyword explicitly requires it.
- Focus on global football: La Liga, Premier League, Bundesliga, Serie A, Champions League, World Cup, etc.
- seo_value: "High", "Medium", or "Low" (assess based on search volume, topic popularity, timeliness).
- slug: URL-friendly, lowercase, no special characters, hyphen-separated (e.g. lamine-yamal-radar).

Respond with ONLY a valid JSON array, no other text or markdown:
[{"title":"...","category":"wc-2026","seo_value":"High","slug":"..."}, ...]

Return exactly 8 items.`;
}

const MODE_SYSTEM_ADDITION: Record<SuggestTitleMode, string> = {
  trend:
    "Mode: Trending & Current. Use the trending topics provided (if any) to suggest timely, click-worthy titles based on what is happening in football right now.",
  general:
    "Mode: General Current. Focus on the 2025-26 season football agenda — topics fans are curious about today.",
  historical:
    "Mode: Historical. Suggest evergreen topics from football history that will never go stale.",
  chronological:
    "Mode: Chronological. Suggest titles suited to a career or club timeline format (phases, eras, turning points).",
};

async function fetchTrendTitles(baseUrl: string): Promise<string[]> {
  try {
    const res = await fetch(`${baseUrl}/api/trends`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json() as { trends?: Array<{ title: string }> };
    return (data.trends ?? []).map((t) => t.title).slice(0, 5);
  } catch {
    return [];
  }
}

function extractJsonArray(raw: string): string | null {
  let text = raw
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/g, "")
    .trim();
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured" }, { status: 500 });
  }

  let keyword = "";
  let mode: SuggestTitleMode = "general";
  try {
    const body = (await request.json()) as { keyword?: string; mode?: string };
    keyword = typeof body.keyword === "string" ? body.keyword.trim() : "";
    const m = body.mode as SuggestTitleMode;
    if (m === "trend" || m === "general" || m === "historical" || m === "chronological") {
      mode = m;
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!keyword) {
    return NextResponse.json({ error: "keyword is required" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const trendTitles = mode === "trend" ? await fetchTrendTitles(origin) : [];
  const trendContext = trendTitles.length > 0
    ? `\n\nCurrently trending football topics (use these as angle inspiration):\n${trendTitles.map((t) => `- ${t}`).join("\n")}\n`
    : "";

  const userMessage =
    `${MODE_SYSTEM_ADDITION[mode]}${trendContext}\n\n` +
    `User keyword / topic: "${keyword}"\n\n` +
    `Suggest exactly 8 titles on this topic.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "web-search-2025-03-05",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: buildSuggestSystem(),
      messages: [{ role: "user", content: userMessage }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = (await res.json()) as { error?: { message?: string } };
      if (err.error?.message) detail = err.error.message;
    } catch {
      /* ignore */
    }
    return NextResponse.json({ error: detail }, { status: 502 });
  }

  const data = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  let rawText = (data.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("")
    .trim();
  rawText = rawText.replace(/<cite[^>]*>([\s\S]*?)<\/cite>/gi, "$1")
    .replace(/<cite[^>]*\/>/gi, "");

  const arrStr = extractJsonArray(rawText);
  if (!arrStr) {
    return NextResponse.json(
      { error: "No JSON array found in model response", raw: rawText.slice(0, 500) },
      { status: 502 },
    );
  }

  type Item = { title?: string; category?: string; seo_value?: string; slug?: string };
  let items: Item[];
  try {
    items = JSON.parse(arrStr) as Item[];
  } catch {
    return NextResponse.json({ error: "Could not parse JSON" }, { status: 502 });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Invalid array" }, { status: 502 });
  }

  const validCats = new Set(["radar", "tactics-lab", "lists", "wc-2026", "transfer"]);
  const validSeo = new Set(["High", "Medium", "Low"]);

  const normalized = items
    .slice(0, 8)
    .map((it) => {
      const title = typeof it.title === "string" ? it.title.trim() : "";
      let category = typeof it.category === "string" ? it.category.trim().toLowerCase() : "lists";
      if (!validCats.has(category)) category = "lists";
      let seo = typeof it.seo_value === "string" ? it.seo_value.trim() : "Medium";
      if (!validSeo.has(seo)) seo = "Medium";
      let slug = typeof it.slug === "string" ? it.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") : "";
      if (!slug && title) {
        slug = title
          .toLowerCase()
          .replace(/ğ/g, "g")
          .replace(/ü/g, "u")
          .replace(/ş/g, "s")
          .replace(/ı/g, "i")
          .replace(/ö/g, "o")
          .replace(/ç/g, "c")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 80);
      }
      return { title, category, seo_value: seo, slug: slug || "icerik" };
    })
    .filter((it) => it.title.length > 0);

  if (normalized.length === 0) {
    return NextResponse.json({ error: "Could not generate a valid title" }, { status: 502 });
  }

  return NextResponse.json({ suggestions: normalized });
}
