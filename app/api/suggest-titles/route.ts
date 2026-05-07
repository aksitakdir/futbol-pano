import { NextResponse } from "next/server";

export type SuggestTitleMode = "trend" | "general" | "historical" | "chronological";

function buildSuggestSystem(): string {
  const today = new Date().toISOString().split("T")[0];
  return `You are a football content editor for Scout Gamer, a global football analysis platform.
Today's date: ${today}. Current football season: 2025-26.

The user provides a keyword or topic; you suggest 8 article titles.

Rules:
- Titles must be in ENGLISH. Scout Gamer is an English-first global platform.
- Titles must be decisive statements or strong claims — never vague or generic.
- Do NOT include specific years or seasons in the title (e.g. avoid "2024", "2025-26").
- Do NOT force Turkey, Süper Lig, or Turkish club references unless the keyword explicitly requires it.
- Focus on global football: La Liga, Premier League, Bundesliga, Serie A, Champions League, etc.
- Category must be exactly one of: "radar", "taktik-lab", "listeler" (lowercase, hyphenated).
- seo_value: "Yüksek", "Orta", or "Düşük" (assess based on search intent and topic popularity).
- slug: URL-friendly, lowercase, no special characters, hyphen-separated (e.g. lamine-yamal-radar).

Respond with ONLY a valid JSON array, no other text or markdown:
[{"title":"...","category":"radar","seo_value":"Yüksek","slug":"..."}, ...]

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
    return NextResponse.json({ error: "ANTHROPIC_API_KEY tanımlı değil" }, { status: 500 });
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
    return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
  }

  if (!keyword) {
    return NextResponse.json({ error: "keyword gerekli" }, { status: 400 });
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
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: buildSuggestSystem(),
      messages: [{ role: "user", content: userMessage }],
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
  const rawText = (data.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("")
    .trim();

  const arrStr = extractJsonArray(rawText);
  if (!arrStr) {
    return NextResponse.json(
      { error: "Model yanıtında JSON dizi bulunamadı", raw: rawText.slice(0, 500) },
      { status: 502 },
    );
  }

  type Item = { title?: string; category?: string; seo_value?: string; slug?: string };
  let items: Item[];
  try {
    items = JSON.parse(arrStr) as Item[];
  } catch {
    return NextResponse.json({ error: "JSON çözülemedi" }, { status: 502 });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Geçersiz dizi" }, { status: 502 });
  }

  const validCats = new Set(["radar", "taktik-lab", "listeler"]);
  const validSeo = new Set(["Yüksek", "Orta", "Düşük"]);

  const normalized = items
    .slice(0, 8)
    .map((it) => {
      const title = typeof it.title === "string" ? it.title.trim() : "";
      let category = typeof it.category === "string" ? it.category.trim().toLowerCase() : "listeler";
      if (!validCats.has(category)) category = "listeler";
      let seo = typeof it.seo_value === "string" ? it.seo_value.trim() : "Orta";
      if (!validSeo.has(seo)) seo = "Orta";
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
    return NextResponse.json({ error: "Geçerli başlık üretilemedi" }, { status: 502 });
  }

  return NextResponse.json({ suggestions: normalized });
}
