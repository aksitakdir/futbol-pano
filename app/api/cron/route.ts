import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function cleanAndExtractJson(raw: string): string | null {
  let text = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  const start = text.indexOf("{");
  const end   = text.lastIndexOf("}");
  if (start !== -1 && end > start) return text.substring(start, end + 1);
  // Also try array extraction
  const arrStart = text.indexOf("[");
  const arrEnd   = text.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd > arrStart) return text.substring(arrStart, arrEnd + 1);
  return null;
}

const WEB_SEARCH_TOOL = {
  type: "web_search_20250305",
  name: "web_search",
} as const;

type CallClaudeOptions = {
  system: string;
  user: string;
  maxTokens?: number;
  webSearch?: boolean;
};

async function callClaude(apiKey: string, opts: CallClaudeOptions): Promise<string> {
  const maxTokens = opts.maxTokens ?? 600;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  };
  if (opts.webSearch) {
    headers["anthropic-beta"] = "web-search-2025-03-05";
  }

  const body: Record<string, unknown> = {
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  };
  if (opts.webSearch) {
    body.tools = [WEB_SEARCH_TOOL];
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await res.json() as { content?: Array<{ type?: string; text?: string }> };
  return (data.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("")
    .trim();
}

function parseJsonArrayFromResponse(raw: string): unknown[] {
  const text = raw
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/g, "")
    .trim();

  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON array boundaries found in Claude response");
  }

  const slice = text.substring(start, end + 1);
  let parsed: unknown;
  try {
    parsed = JSON.parse(slice);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Claude JSON array parse error: ${msg}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Claude response is not a JSON array");
  }

  return parsed;
}

async function updateFeaturedPlayerPool(
  supabaseUrl: string,
  supabaseKey: string,
  apiKey: string,
): Promise<number> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const userPrompt =
    "Search the web for under-23 players in the 2025-26 season who have not yet fully entered the radar of top European clubs " +
    "but are standing out with their performances. Search across the Turkish Süper Lig, Portugal, Netherlands, Belgium, Scotland, " +
    "Brazil Série A, Argentina Primera, Colombia, Mexico, and Japan leagues. Provide current and accurate information.\n\n" +
    "ALL text must be in English. Write description and why_watch in English. " +
    "position must be one of: Midfielder, Forward, Centre-Back, Left-Back, Right-Back, Winger, Attacking Midfielder.\n\n" +
    "Select EXACTLY 5 DIFFERENT players. Your response must be ONLY a JSON array; no other text, markdown, or code blocks. " +
    "Each element must have these fields: name, club, league, position, age, goals, assists, description, why_watch.\n" +
    "Example element: " +
    '{"name":"...","club":"...","league":"...","position":"...","age":"...","goals":"...","assists":"...","description":"...","why_watch":"..."}';

  const rawText = await callClaude(apiKey, {
    system:
      "You are a football scouting expert. Verify current data via web search. Your response must be only a valid JSON array. " +
      "All text must be in English. position field must use: Midfielder, Forward, Centre-Back, Left-Back, Right-Back, Winger, Attacking Midfielder.",
    user: userPrompt,
    maxTokens: 3200,
    webSearch: true,
  });

  const parsedRaw = parseJsonArrayFromResponse(rawText);

  if (parsedRaw.length !== 5) {
    console.warn(
      `[cron] featured_player_pool: expected 5 players, got ${parsedRaw.length}`,
    );
  }

  const normalized = parsedRaw.map((item, idx) => {
    if (item === null || typeof item !== "object") {
      throw new Error(`featured_player_pool[${idx}] is not a valid object`);
    }
    const o = item as Record<string, unknown>;
    return {
      name: String(o.name ?? ""),
      club: String(o.club ?? ""),
      league: String(o.league ?? ""),
      position: String(o.position ?? ""),
      age: String(o.age ?? ""),
      goals: String(o.goals ?? ""),
      assists: String(o.assists ?? ""),
      description: String(o.description ?? ""),
      why_watch: String(o.why_watch ?? ""),
    };
  });

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      { key: "featured_player_pool", value: JSON.stringify(normalized) },
      { onConflict: "key" },
    );
  if (error) {
    console.error("[cron] featured_player_pool upsert error:", error.message);
  }

  // Backwards compatibility: write the first player to legacy keys
  const first = normalized[0];
  if (first) {
    const entries = [
      { key: "featured_player_name",        value: first.name },
      { key: "featured_player_club",        value: first.club },
      { key: "featured_player_position",    value: first.position },
      { key: "featured_player_age",         value: first.age },
      { key: "featured_player_league",      value: first.league },
      { key: "featured_player_goals",       value: first.goals },
      { key: "featured_player_assists",     value: first.assists },
      { key: "featured_player_description", value: first.description },
      { key: "featured_player_why_watch",   value: first.why_watch },
    ];
    for (const entry of entries) {
      const { error: e2 } = await supabase
        .from("site_settings")
        .upsert({ key: entry.key, value: entry.value }, { onConflict: "key" });
      if (e2) console.error(`[cron] legacy ${entry.key}:`, e2.message);
    }
  }

  console.log("[cron] featured_player_pool updated:", normalized.length, "players");
  return normalized.length;
}

async function updateFormPlayers(
  supabaseUrl: string,
  supabaseKey: string,
  apiKey: string,
): Promise<number> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const formPlayersUserPrompt =
    "Search the web using current match and stats sources to identify young players whose form is rising in the 2025-26 season. " +
    "Select a diverse set from the Big 5 leagues, Portugal, Netherlands, Brazil, Argentina, Turkey, and other major leagues.\n\n" +
    "For each player, the club and league fields must be the player's CURRENT club and the top-level league that club plays in " +
    "(do not use former/loan clubs). For example, if a player is at Real Madrid, the league should be La Liga.\n\n" +
    "All text fields must be in English. Use English position labels: Forward, Midfielder, Winger, Defender, Goalkeeper, " +
    "Attacking Midfielder, Defensive Midfielder.\n\n" +
    "Return EXACTLY 20 players in the format below. Write nothing else, only the JSON array:\n" +
    "[\n" +
    '  {"name": "Player Name", "club": "Club", "league": "League", "position": "Position", "age": 20, "goals": 5},\n' +
    "  ...\n" +
    "]";

  const rawText = await callClaude(apiKey, {
    system:
      "You are a football analytics expert. Verify current form data via web search. Your response must be only a valid JSON array. " +
      "All text must be in English. Use English position labels: Forward, Midfielder, Winger, Defender, Goalkeeper, Attacking Midfielder, Defensive Midfielder.",
    user: formPlayersUserPrompt,
    maxTokens: 2800,
    webSearch: true,
  });

  const parsedRaw = parseJsonArrayFromResponse(rawText);

  if (parsedRaw.length !== 20) {
    console.warn(
      `[cron] form_players_pool: expected 20 players, got ${parsedRaw.length}`,
    );
  }

  const normalized = parsedRaw.map((item, idx) => {
    if (item === null || typeof item !== "object") {
      throw new Error(`form_players_pool[${idx}] is not a valid object`);
    }
    const o = item as Record<string, unknown>;
    return {
      name: String(o.name ?? ""),
      club: String(o.club ?? ""),
      league: String(o.league ?? ""),
      position: String(o.position ?? ""),
      age: o.age != null ? String(o.age) : "",
      goals: o.goals != null ? String(o.goals) : "",
    };
  });

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      { key: "form_players_pool", value: JSON.stringify(normalized) },
      { onConflict: "key" },
    );
  if (error) {
    console.error("[cron] form_players_pool upsert error:", error.message);
  }

  // Backwards compatibility: write first 10 to legacy key
  const { error: e2 } = await supabase
    .from("site_settings")
    .upsert(
      { key: "form_players", value: JSON.stringify(normalized.slice(0, 10)) },
      { onConflict: "key" },
    );
  if (e2) console.error("[cron] form_players legacy upsert error:", e2.message);

  console.log("[cron] form_players_pool updated:", normalized.length, "players");
  return normalized.length;
}

export async function GET(request: NextRequest) {
  const secret     = request.headers.get("authorization")?.replace("Bearer ", "");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin      = new URL(request.url).origin;
  const apiKey      = process.env.ANTHROPIC_API_KEY ?? "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  // Server-only cron: prefer service-role so writes survive RLS lockdown.
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  const originHub = origin;
  const [contentResult, playerResult, formResult, hubResult] = await Promise.allSettled([
    fetch(`${origin}/api/generate-content`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ count: 3 }),
    }).then((r) => r.json()),
    updateFeaturedPlayerPool(supabaseUrl, supabaseKey, apiKey),
    updateFormPlayers(supabaseUrl, supabaseKey, apiKey),
    fetch(`${originHub}/api/cron/hub-sync`, {
      headers: { Authorization: `Bearer ${cronSecret}` },
    }).then((r) => r.json()),
  ]);

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    content:
      contentResult.status === "fulfilled"
        ? contentResult.value
        : { error: (contentResult.reason as Error)?.message ?? "unknown" },
    featured_player_pool:
      playerResult.status === "fulfilled"
        ? { count: playerResult.value }
        : { error: (playerResult.reason as Error)?.message ?? "unknown" },
    form_players:
      formResult.status === "fulfilled"
        ? { count: formResult.value }
        : { error: (formResult.reason as Error)?.message ?? "unknown" },
    hub:
      hubResult.status === "fulfilled"
        ? hubResult.value
        : { error: (hubResult.reason as Error)?.message ?? "unknown" },
  });
}
