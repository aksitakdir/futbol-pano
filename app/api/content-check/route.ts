import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

/**
 * POST /api/content-check
 *
 * Validates a content brief against available data:
 * - Resolves mentioned players (fc_players + player_cache + BSD)
 * - Fetches API-Football stats for found players
 * - Returns a data availability summary for editorial confirmation
 *
 * Input: { brief, category?, players?: string[] }
 * Output: { players: [...], stats_available, suggested_title, suggested_category }
 */
export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase env vars missing" }, { status: 500 });
  }

  let body: { brief?: string; category?: string; players?: string[] } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const brief = typeof body.brief === "string" ? body.brief.trim() : "";
  if (!brief) {
    return NextResponse.json({ error: "brief is required" }, { status: 400 });
  }

  const category = body.category || "";
  const explicitPlayers = Array.isArray(body.players)
    ? body.players.filter((p) => typeof p === "string" && p.trim()).map((p) => p.trim())
    : [];

  // Step 1: Use AI to extract entities + suggest title/category from brief
  const analysisPrompt = `You are a football content analyst. Given this editorial brief, extract key information.

Brief: "${brief}"
${category ? `Suggested category: ${category}` : ""}
${explicitPlayers.length > 0 ? `Explicit players: ${explicitPlayers.join(", ")}` : ""}

Extract and respond with ONLY valid JSON:
{
  "players": ["Player Name 1", "Player Name 2"],
  "teams": ["Team 1", "Team 2"],
  "suggested_title": "A compelling article title based on this brief (English, under 65 chars, no year)",
  "suggested_category": "radar | tactics-lab | lists | wc-2026 | transfer",
  "key_angles": ["angle 1", "angle 2"],
  "seo_terms": ["search term 1", "search term 2"]
}

Rules:
- Extract ALL player names mentioned or implied in the brief
- Include explicit players provided
- suggested_category: pick the BEST fit. wc-2026 for World Cup topics, transfer for market topics, radar for player spotlights, tactics-lab for tactical analysis, lists for rankings.
- key_angles: 2-3 specific editorial angles this brief could explore
- seo_terms: 2-3 search terms a football fan would Google for this topic`;

  const analysisRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: analysisPrompt }],
    }),
  });

  if (!analysisRes.ok) {
    return NextResponse.json({ error: "AI analysis failed" }, { status: 502 });
  }

  const analysisData = (await analysisRes.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const rawText = (analysisData.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("")
    .trim();

  let analysis: {
    players?: string[];
    teams?: string[];
    suggested_title?: string;
    suggested_category?: string;
    key_angles?: string[];
    seo_terms?: string[];
  } = {};

  try {
    const jsonStart = rawText.indexOf("{");
    const jsonEnd = rawText.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      analysis = JSON.parse(rawText.substring(jsonStart, jsonEnd + 1));
    }
  } catch {
    /* ignore parse errors */
  }

  // Merge explicit players with extracted
  const allPlayerNames = [
    ...new Set([
      ...explicitPlayers,
      ...(analysis.players ?? []),
    ]),
  ];

  // Step 2: Resolve each player through our multi-tier system
  const origin = new URL(request.url).origin;
  const playerResults: Array<{
    name: string;
    found: boolean;
    source?: string;
    overall?: number;
    position?: string;
    club?: string;
    age?: number;
    stats?: Record<string, unknown>;
  }> = [];

  await Promise.all(
    allPlayerNames.slice(0, 6).map(async (name) => {
      try {
        const res = await fetch(
          `${origin}/api/players/resolve?name=${encodeURIComponent(name)}`,
        );
        if (res.ok) {
          const data = await res.json();
          playerResults.push({
            name: data.name ?? name,
            found: true,
            overall: data.overall,
            position: data.position,
            club: data.club,
            age: data.age,
          });
        } else {
          playerResults.push({ name, found: false });
        }
      } catch {
        playerResults.push({ name, found: false });
      }
    }),
  );

  // Sort: found first, then by name
  playerResults.sort((a, b) => (a.found === b.found ? 0 : a.found ? -1 : 1));

  // Step 3: Check API-Football stats availability for found players
  const supabase = createClient(supabaseUrl, supabaseKey);
  let statsAvailable = false;
  const foundPlayers = playerResults.filter((p) => p.found);

  if (foundPlayers.length > 0) {
    const { data: statsRows } = await supabase
      .from("player_cache")
      .select("name,goals,assists,appearances,rating,xg,xa")
      .in(
        "name",
        foundPlayers.map((p) => p.name),
      )
      .not("goals", "is", null)
      .limit(3);
    if (statsRows && statsRows.length > 0) {
      statsAvailable = true;
      for (const row of statsRows) {
        const match = playerResults.find(
          (p) => p.name.toLowerCase() === (row.name as string).toLowerCase(),
        );
        if (match) {
          match.stats = {
            goals: row.goals,
            assists: row.assists,
            appearances: row.appearances,
            rating: row.rating,
            xg: row.xg,
            xa: row.xa,
          };
        }
      }
    }
  }

  const validCats = ["radar", "tactics-lab", "lists", "wc-2026", "transfer"];
  const suggestedCategory = validCats.includes(analysis.suggested_category ?? "")
    ? analysis.suggested_category
    : category || "radar";

  return NextResponse.json({
    brief,
    players: playerResults,
    players_found: foundPlayers.length,
    players_missing: playerResults.length - foundPlayers.length,
    stats_available: statsAvailable,
    suggested_title: analysis.suggested_title ?? "",
    suggested_category: suggestedCategory,
    key_angles: analysis.key_angles ?? [],
    seo_terms: analysis.seo_terms ?? [],
    teams: analysis.teams ?? [],
  });
}
