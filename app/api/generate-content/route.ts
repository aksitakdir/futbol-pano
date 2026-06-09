import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { parseMarkupToBlocks } from "@/lib/parse-blocks";
import { getPlayerContext, getTeamContext, TEAM_IDS, LEAGUE_IDS } from "@/lib/api-football-stats";

type FcPlayerRow = {
  name: string;
  overall: number;
  position: string;
  club: string;
  photo_url?: string | null;
};

async function buildPlayersJson(
  supabaseClient: SupabaseClient,
  playerNames: string[],
): Promise<string | null> {
  if (!playerNames.length) return null;
  const results: Array<{
    name: string;
    overall: number;
    position: string;
    club: string;
    photo_url?: string;
    scout_note: string;
  }> = [];
  for (const name of playerNames) {
    const { data: exactRaw } = await supabaseClient
      .from("fc_players")
      .select("name,overall,position,club,photo_url")
      .ilike("name", name)
      .limit(1)
      .maybeSingle();
    const exact = exactRaw as FcPlayerRow | null;
    if (exact?.overall) {
      results.push({
        name: exact.name,
        overall: exact.overall,
        position: exact.position,
        club: exact.club,
        photo_url: exact.photo_url ?? undefined,
        scout_note: "",
      });
      continue;
    }
    const twoWords = name.split(" ").slice(0, 2).join(" ");
    const { data: twoRaw } = await supabaseClient
      .from("fc_players")
      .select("name,overall,position,club,photo_url")
      .ilike("name", `%${twoWords}%`)
      .order("overall", { ascending: false })
      .limit(1)
      .maybeSingle();
    const two = twoRaw as FcPlayerRow | null;
    if (two?.overall) {
      results.push({
        name: two.name,
        overall: two.overall,
        position: two.position,
        club: two.club,
        photo_url: two.photo_url ?? undefined,
        scout_note: "",
      });
    }
  }
  return results.length > 0 ? JSON.stringify(results) : null;
}

const CATEGORIES = ["radar", "tactics-lab", "lists"] as const;
type Category = (typeof CATEGORIES)[number];

const FALLBACK_TOPICS: Record<Category, string[]> = {
  radar: [
    "Breakout wingers in European football this season",
    "Champions League standout performers",
    "Young midfielders redefining the box-to-box role",
    "Strikers leading the xG charts in top-five leagues",
    "South American talents making their mark in Europe",
    "Underrated full-backs in the Premier League",
  ],
  "tactics-lab": [
    "How modern football is evolving beyond formations",
    "The anatomy of a high press",
    "The ball-playing centre-back and why defences are changing",
    "False nine vs complete forward: the striker debate",
    "Why inverted wingers dominate modern attacking play",
    "How gegenpressing changed the game",
  ],
  lists: [
    "The best U21 players in European football right now",
    "Top transfers of the current season ranked",
    "Forwards with the highest xG per 90 in the top five leagues",
    "The best pressing teams in Europe this season",
    "Most improved players in the Champions League",
    "The next generation: talents to watch in the next 12 months",
  ],
};

/** Content mode hints — shape the editorial direction */
const SINGLE_MODE_HINT: Record<string, string> = {
  trend: "This is a trending topic — write with urgency and timeliness. What are fans debating right now? Take a position backed by data.",
  general: "Aligned with the 2025-26 season landscape. Find the angle that surprises — the stat nobody noticed, the tactical tweak that changed everything.",
  historical: "Evergreen, football-heritage focused. Connect past to present — how does this historical thread still pull on today's game?",
  chronological:
    "Use a chronological arc: trace the evolution through phases or eras. Each phase should reveal something the reader didn't expect.",
};

function buildSystemPrompt(): string {
  const today = new Date().toISOString().split("T")[0];
  return `You are the Lead Editor of Scout Gamer — a premium English-first football analysis platform known for deep tactical insight, verified statistics, and magazine-quality prose.

Today: ${today}. Season: 2025-26. World Cup 2026 in USA/Canada/Mexico starts June 11, 2026.

## YOUR EDITORIAL IDENTITY

You are a football connoisseur. You understand:
- Tactical systems deeply: pressing triggers, defensive transitions, positional rotations
- Player archetypes: the Regista, the Mezzala, the inverted full-back, the false 9
- Historical context: how the modern game evolved, parallels between eras
- The romance of football: the culture, the rivalries, the moments that define careers
- Data literacy: xG, progressive carries, PPDA, defensive actions in final third

You write with authority but never arrogance. You surprise the reader with insights they hadn't considered. You connect dots between past and present. You let verified numbers tell stories.

## WRITING PRINCIPLES

1. **Commentary over catalogue**: You are an analyst, not a stats bot. For every stat you cite, there MUST be 2-3 sentences of interpretation — what it means, why it matters, what the reader should take away. Never list stats without context.
2. **Niche over obvious**: Don't write what everyone already knows. Find the angle nobody is talking about. The insight is more valuable than the number.
3. **Show, don't list**: Instead of listing 5 qualities, paint a picture of how they manifest on the pitch. Describe the moment, the movement, the decision.
4. **Narrative arc**: Every article should take the reader on a journey — setup, tension, resolution/insight. Think like a storyteller, not a reporter.
5. **Cultural depth**: Reference footballing heritage when relevant — the Ajax school, Sacchi's revolution, La Masia's philosophy. Connect today's football to its roots.
6. **Reader hook**: Every section must pull the reader into the next. End sections with a question, a contradiction, or a pivot that creates curiosity.
7. **Global perspective**: Write about world football. Don't default to Premier League. Don't force Turkish football unless the topic demands it.
8. **Stats serve stories**: Use 3-5 key statistics per article, not 15. Each stat should be a revelation, not decoration. Wrap stats in narrative: "That 94.2% pass completion rate doesn't just lead Europe — it redefines what we expect from a defensive midfielder in transition."
9. **Voice and opinion**: Take positions. "This is the most underrated signing of the window" is more engaging than "This could be considered an important signing." Be confident in your analysis.
10. **Sensory writing**: Describe how football *feels* — the weight of a cross, the geometry of a pressing trap, the moment a defender's hips commit. The reader should visualize the pitch.

## VERIFIED STATISTICS

When verified player/team statistics are provided at the end of the user message (marked as "VERIFIED STATISTICS from api-football.com"), use these numbers with confidence — they are real, current-season data. Calculate per-90 metrics, shot accuracy percentages, and goal contributions from the raw data. Prefer these verified stats over web search results when available.

If verified stats are provided for a player, use @stat: blocks with a title to showcase 2-4 key numbers prominently:
@stat: Scoring Profile
- 22 | Goals | Premier League 2024-25
- 0.72 | Goals per 90 | Elite conversion rate

## IMPORTANT FORMATTING RULES

- Do NOT include citation tags, source references, or any markup like <cite>, [citation], or similar. Write clean prose.
- When web search provides data, absorb and rephrase it naturally — never copy-paste with attribution markup.
- Stats should be woven into sentences, not displayed as raw data dumps.

## OUTPUT FORMAT — BLOCK MARKUP

Write content using this block markup syntax (NOT HTML, NOT Markdown):

@lead: Opening paragraph — the hook. Vivid, compelling, sets the tone. This renders as a prominent lead paragraph on the site.

# Section Heading (H2 — renders in table of contents)

Regular paragraph text. Use **bold** for emphasis, *italic* for nuance. Use [link text](url) for references.

## Sub-heading (H3)

@player: Player Name

> A striking pull quote — one memorable sentence that captures the essence of the article. Place after 2nd or 3rd section. One per article.

@callout: A key tactical insight, a verified statistic, or a "did you know" that stops the reader. One per article.

@section: Section With Built-in Body
The section heading and its body text are together. Good for structured analysis segments.

@vs: Left Title | Right Title
- Stat or point A | Comparison stat A
- Stat or point B | Comparison stat B

@faq: Key Numbers / Quick Reference
What is X's xG per 90? 0.82 — third highest in the league
How many progressive carries? 4.7 per 90, up from 3.1 last season

@stat: Card Group Title (optional, no pipe — becomes the header)
- 94.2% | Pass Completion | Highest in Europe's top five leagues
- 0.82 | xG per 90 | Up 34% from last season
- 4.7 | Progressive Carries | Redefining the midfield role

@divider
@divider: dots
@divider: gradient

- Bullet point for lists (renders with accent-colored dots)
- Another bullet point

1. Numbered list item
2. Another numbered item

@video: youtube-url-or-id

![Alt text](image-url)

## BLOCK USAGE GUIDE

Every article MUST include:
- @lead: (exactly 1, at the start)
- # headings (2-4 per article, these appear in the table of contents)
- @player: for featured players (at least 1)
- > pull quote (exactly 1, placed mid-article)
- @callout: (exactly 1, for a key insight or stat)
- Regular paragraphs between sections — ALWAYS follow a stat or data point with interpretive commentary

Use when relevant:
- @stat: for 2-4 key numbers displayed as prominent visual cards (great for player profiles and comparisons)
- @divider: or @divider: dots / gradient — for visual breathing room between sections
- @vs: for player/team/era comparisons with data
- @faq: for quick reference stats or key questions answered
- @section: for structured analysis segments
- Lists (- or 1.) for rankings or key points

## CONTENT REQUIREMENTS

- Target 400-500 words of body text. Be concise and impactful — every sentence must earn its place. Cut filler, redundancy, and throat-clearing. A tight 450-word piece with sharp insight beats a bloated 800-word one.
- 2-3 main sections maximum (not 5-6). Each section should make ONE clear point.
- English only
- No year/season in the title
- SEO-friendly title (under 65 chars, uses common search terms)
- Slug: URL-friendly, lowercase, hyphens, no special characters

## JSON RESPONSE FORMAT

Respond with ONLY this JSON, nothing else:
{
  "title": "compelling title (no year, under 65 chars)",
  "slug": "url-friendly-slug",
  "category": "radar | tactics-lab | lists",
  "content": "Full article in block markup format as described above",
  "players": ["Player Name 1", "Player Name 2"],
  "featured_player": "Main Player Name (the single most important player in the article — used for hero card)",
  "hero_variant": "player-cards | cover-image | pitch-diagram | text-only",
  "accent": "emerald | cyan | sky | rose | amber | lime",
  "youtube_query_1": "best search query to find a relevant highlight/analysis video on YouTube (e.g. 'Haaland goals 2025 highlights')",
  "youtube_query_2": "optional second YouTube search query — different angle (e.g. 'Manchester City tactical analysis')",
  "news_query": "Google News search keyword for related articles (e.g. 'Erling Haaland')"
}

Category rules:
- **radar**: Player deep-dives, form analysis, transfer context. "players": the 1-2 featured players. "featured_player": the main subject. hero_variant: "player-cards".
- **tactics-lab**: System breakdowns, tactical evolution, positional analysis. "players": example players (max 3). "featured_player": the best example player. hero_variant: "pitch-diagram". When verified formation data is provided (e.g. "4-2-3-1 (18x)"), reference those EXACT formations — do NOT invent formation usage stats.
- **lists**: Curated rankings with analysis per entry. "players": ALL ranked players (max 10). "featured_player": the #1 ranked player. hero_variant: "player-cards".

Accent mood: emerald=evergreen, cyan=tactical/analytical, sky=player spotlight, rose=debate/controversy, amber=heritage/history, lime=breakout/underdog.

youtube_query rules:
- youtube_query_1: The most relevant video search — player highlights, match analysis, or tactical breakdown
- youtube_query_2: A complementary angle — different player, team context, or pundit analysis. Can be empty string if not needed.
- news_query: The main person or topic name for Google News sidebar`;
}

// ─── API-Football stat enrichment ────────────────────────────────────

/**
 * Extract likely player and team names from the topic text.
 * Uses simple heuristics — capitalised multi-word sequences and known teams.
 */
function extractEntities(topic: string): { players: string[]; teams: string[] } {
  // Known teams — match by display name or slug
  const knownTeamNames: Record<string, string> = {};
  for (const slug of Object.keys(TEAM_IDS)) {
    const display = slug.replace(/-/g, " ");
    knownTeamNames[display] = slug;
  }

  const topicLower = topic.toLowerCase();
  const teams: string[] = [];
  for (const [display, slug] of Object.entries(knownTeamNames)) {
    if (topicLower.includes(display)) teams.push(slug);
  }

  // Player names — look for Capitalised multi-word phrases (2-3 words)
  // that aren't common English words. Simple heuristic.
  const skipWords = new Set([
    "the", "how", "why", "what", "who", "when", "top", "best", "most",
    "new", "next", "premier", "league", "champions", "world", "cup",
    "football", "soccer", "player", "team", "season", "match", "game",
    "transfer", "signing", "tactical", "analysis", "breakout", "rising",
    "star", "young", "generation", "modern", "defensive", "attacking",
    "midfield", "forward", "striker", "winger", "goalkeeper", "defender",
    "tactics", "pressing", "build", "counter", "false", "inverted",
    "club", "europe", "european", "england", "spain", "germany", "italy",
    "france", "turkey", "brazil", "argentina", "portugal", "netherlands",
  ]);

  const players: string[] = [];
  // Match "Firstname Lastname" patterns (supports de/da/van/von particles)
  const namePattern = /(?:^|[\s,;:(])([A-Z][a-z]+\s+(?:(?:de|da|van|von|el|al|di|dos|del)\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g;
  let match;
  while ((match = namePattern.exec(topic)) !== null) {
    const candidate = match[1].trim();
    const words = candidate.toLowerCase().split(/\s+/);
    // Skip if first or all words are common English/football terms
    if (skipWords.has(words[0])) continue;
    if (words.every((w) => skipWords.has(w))) continue;
    // Skip known team names
    if (teams.some((t) => candidate.toLowerCase().includes(t.replace(/-/g, " ")))) continue;
    // Skip league names
    const candidateLower = candidate.toLowerCase();
    if (candidateLower.includes("premier league") || candidateLower.includes("champions league") ||
        candidateLower.includes("europa league") || candidateLower.includes("world cup")) continue;
    players.push(candidate);
  }

  return { players: [...new Set(players)].slice(0, 3), teams: [...new Set(teams)].slice(0, 2) };
}

/**
 * Build a verified stats context block by fetching data from api-football.
 * Budget-aware: caps at maxRequests to stay within daily quota.
 * Returns a formatted text block or empty string.
 */
async function buildStatsContext(
  topic: string,
  maxRequests = 6,
  category?: string,
): Promise<string> {
  if (!process.env.FOOTBALL_API_KEY) {
    console.log("[stats-context] FOOTBALL_API_KEY not set, skipping enrichment");
    return "";
  }

  const { players, teams } = extractEntities(topic);
  console.log(`[stats-context] Extracted entities — players: [${players.join(", ")}], teams: [${teams.join(", ")}]`);

  // For tactics-lab: if no teams found but topic mentions formations/tactics,
  // try to infer teams from context or fetch a default set of formation data
  if (category === "tactics-lab" && teams.length === 0) {
    // Look for league-specific terms to infer a top team for formation data
    const topicLower = topic.toLowerCase();
    const tacticsTeamHints: [string[], string][] = [
      [["premier league", "english football", "epl"], "manchester-city"],
      [["la liga", "spanish football", "tiki-taka"], "barcelona"],
      [["bundesliga", "german football"], "bayern-munich"],
      [["serie a", "italian football", "calcio"], "inter-milan"],
      [["ligue 1", "french football"], "psg"],
      [["pressing", "gegenpressing", "klopp"], "liverpool"],
      [["possession", "pep", "guardiola"], "manchester-city"],
      [["counter-attack", "counter attack", "transition"], "real-madrid"],
    ];
    for (const [keywords, teamSlug] of tacticsTeamHints) {
      if (keywords.some((k) => topicLower.includes(k))) {
        teams.push(teamSlug);
        console.log(`[stats-context] Tactics-lab: inferred team ${teamSlug} from topic keywords`);
        break;
      }
    }
  }

  if (players.length === 0 && teams.length === 0) {
    console.log("[stats-context] No entities found in topic, skipping");
    return "";
  }

  const sections: string[] = [];
  let requestsUsed = 0;

  // Fetch player stats (2 requests each: search + fetch)
  for (const name of players) {
    if (requestsUsed + 2 > maxRequests) break;
    try {
      console.log(`[stats-context] Fetching stats for player: ${name}`);
      const ctx = await getPlayerContext(name);
      requestsUsed += 2;
      if (ctx) {
        sections.push(ctx);
        console.log(`[stats-context] Got stats for ${name}`);
      } else {
        console.log(`[stats-context] No data found for ${name}`);
      }
    } catch (err) {
      console.warn(`[stats-context] Error fetching ${name}:`, err);
      requestsUsed += 1; // count partial
    }
  }

  // Fetch team stats (1 request each)
  // Try to find the right league for each team
  const teamLeagueMap: Record<string, string> = {
    "manchester-city": "premier-league", "arsenal": "premier-league",
    "liverpool": "premier-league", "chelsea": "premier-league",
    "manchester-united": "premier-league", "tottenham": "premier-league",
    "real-madrid": "la-liga", "barcelona": "la-liga", "atletico-madrid": "la-liga",
    "bayern-munich": "bundesliga", "borussia-dortmund": "bundesliga",
    "juventus": "serie-a", "inter-milan": "serie-a", "ac-milan": "serie-a",
    "psg": "ligue-1",
    "galatasaray": "super-lig", "fenerbahce": "super-lig", "besiktas": "super-lig",
  };

  for (const teamSlug of teams) {
    if (requestsUsed + 1 > maxRequests) break;
    const leagueSlug = teamLeagueMap[teamSlug];
    if (!leagueSlug) continue;
    try {
      console.log(`[stats-context] Fetching stats for team: ${teamSlug}`);
      const ctx = await getTeamContext(teamSlug, leagueSlug);
      requestsUsed += 1;
      if (ctx) {
        sections.push(ctx);
        console.log(`[stats-context] Got stats for ${teamSlug}`);
      }
    } catch (err) {
      console.warn(`[stats-context] Error fetching team ${teamSlug}:`, err);
    }
  }

  if (sections.length === 0) return "";

  console.log(`[stats-context] Built context with ${sections.length} section(s), used ${requestsUsed} API requests`);

  return [
    "\n\n---",
    "## VERIFIED STATISTICS (from api-football.com, 2024-25 season)",
    "Use these verified numbers in your article. Cite them confidently — they are real.",
    "Calculate per-90 metrics, percentages, and comparisons from this raw data.",
    "Do NOT invent stats that aren't in this data. If a stat you want isn't here, use web search or omit it.",
    "",
    ...sections,
    "---",
  ].join("\n");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Round-robin category selection based on request index */
let categoryIndex = 0;
function nextCategory(): Category {
  const cat = CATEGORIES[categoryIndex % CATEGORIES.length];
  categoryIndex++;
  return cat;
}

async function fetchTrends(baseUrl: string): Promise<string[]> {
  try {
    const res = await fetch(`${baseUrl}/api/trends`, { cache: "no-store" });
    if (!res.ok) {
      console.log("[generate-content] Trends fetch failed:", res.status);
      return [];
    }
    const data = await res.json();
    const trends: { title: string }[] = data.trends ?? [];
    console.log("[generate-content] Fetched trends:", trends.map((t) => t.title));
    return trends.map((t) => t.title);
  } catch (err) {
    console.error("[generate-content] fetchTrends error:", err);
    return [];
  }
}

function cleanAndExtractJson(raw: string): string | null {
  let text = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  const jsonStart = text.indexOf("{");
  const jsonEnd   = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) return null;

  return text.substring(jsonStart, jsonEnd + 1);
}

function isValidCategory(c: string | undefined): c is Category {
  return typeof c === "string" && (CATEGORIES as readonly string[]).includes(c);
}

async function generateWithClaude(
  topic: string,
  targetCategory: Category,
  recentTitles: string[],
  useWebSearch: boolean,
): Promise<{
  title: string;
  slug: string;
  category: string;
  content: string;
  sectionsJson: import("@/lib/section-blocks").SectionBlock[];
  players?: string[];
  featured_player?: string;
  hero_variant?: string;
  accent?: string;
  youtube_query_1?: string;
  youtube_query_2?: string;
  news_query?: string;
}> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const exclusionNote = recentTitles.length > 0
    ? `\n\nDo NOT use these titles or closely related topics (already generated in the last 24 hours):\n${recentTitles.map((t) => `- ${t}`).join("\n")}\n`
    : "";

  // Faz 4: Fetch verified stats from api-football to enrich content
  const statsContext = await buildStatsContext(topic, 6, targetCategory);

  const userMessage =
    `Topic: ${topic}. ` +
    (useWebSearch
      ? "Use web search to verify current stats, recent results, and breaking developments. Ground your analysis in verified data. "
      : "") +
    `If there is a specific player or club trend, centre the article around it. ` +
    `Category: "${targetCategory}". ` +
    `Write the content using block markup format as described in your instructions. ` +
    `Include @player: blocks for featured players, a > pull quote, and an @callout: with a verified insight. ` +
    `Use @vs: blocks for comparisons when relevant. Use @faq: for quick reference stats.` +
    exclusionNote +
    statsContext;

  console.log(
    `[generate-content] Sonnet request — topic: "${topic}", category: ${targetCategory}, webSearch: ${useWebSearch}, statsContext: ${statsContext ? `${statsContext.length} chars` : "none"}`,
  );

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  };
  if (useWebSearch) {
    headers["anthropic-beta"] = "web-search-2025-03-05";
  }

  const body: Record<string, unknown> = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: userMessage }],
  };
  if (useWebSearch) {
    body.tools = [{ type: "web_search_20250305", name: "web_search" }];
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let errDetail = `HTTP ${res.status}`;
    try {
      const body = await res.json() as { error?: { type?: string; message?: string } };
      errDetail = body.error?.message
        ? `${body.error.type ?? res.status}: ${body.error.message}`
        : errDetail;
    } catch { /* ignore */ }
    console.error("[generate-content] Anthropic API error:", errDetail);
    if (res.status === 429) throw new Error(`Rate limited (429): ${errDetail}`);
    if (res.status === 401) throw new Error("Invalid API key (401)");
    throw new Error(`Anthropic API error: ${errDetail}`);
  }

  const data = await res.json() as {
    content?: Array<{ type?: string; text?: string }>;
    stop_reason?: string;
  };

  if (data.stop_reason === "max_tokens") {
    console.warn("[generate-content] stop_reason=max_tokens, response may be truncated");
  }

  const rawText = (data.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("")
    .trim();

  if (!rawText) {
    console.error("[generate-content] No text block in response:", JSON.stringify(data).slice(0, 300));
    throw new Error("Model produced no text (empty response)");
  }

  console.log("[generate-content] Raw response (first 300 chars):", rawText.slice(0, 300));

  const jsonStr = cleanAndExtractJson(rawText);
  if (!jsonStr) {
    console.error("[generate-content] No JSON object found, raw response:", rawText.slice(0, 800));
    throw new Error("No valid JSON object found in response");
  }

  let parsed: { title?: string; slug?: string; category?: string; content?: string; players?: unknown; featured_player?: string; hero_variant?: string; accent?: string; youtube_query_1?: string; youtube_query_2?: string; news_query?: string };
  try {
    parsed = JSON.parse(jsonStr);
  } catch (parseErr) {
    console.error("[generate-content] JSON.parse error:", parseErr, "— girdi:", jsonStr.slice(0, 400));
    throw new Error("Model output could not be parsed as JSON");
  }

  let content = typeof parsed.content === "string" ? parsed.content.trim() : "";
  if (!content) {
    console.error("[generate-content] content field empty, parsed:", JSON.stringify(parsed).slice(0, 400));
    throw new Error('"content" field is empty');
  }

  // Strip web-search citation artifacts: <cite index="...">text</cite> → text
  content = content.replace(/<cite[^>]*>([\s\S]*?)<\/cite>/gi, "$1");
  // Also strip orphaned <cite .../> self-closing tags
  content = content.replace(/<cite[^>]*\/>/gi, "");

  const players: string[] = Array.isArray(parsed.players)
    ? (parsed.players as unknown[]).filter((p): p is string => typeof p === "string").slice(0, 10)
    : [];

  const title = typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim() : topic;
  const slug  = typeof parsed.slug  === "string" && parsed.slug.trim()  ? parsed.slug.trim()  : slugify(title);

  // Honour the model's choice only if it's valid, else fall back to targetCategory
  const category = (["radar", "tactics-lab", "lists"] as string[]).includes(String(parsed.category ?? ""))
    ? (parsed.category as string)
    : targetCategory;

  const validHeroVariants = ["player-cards", "cover-image", "pitch-diagram", "text-only"];
  let hero_variant = validHeroVariants.includes(parsed.hero_variant ?? "")
    ? parsed.hero_variant
    : (targetCategory === "tactics-lab" ? "pitch-diagram" : "player-cards");
  // Merge deprecated stat-focus → player-cards
  if (hero_variant === "stat-focus") hero_variant = "player-cards";

  const validAccents = ["emerald", "cyan", "sky", "rose", "amber", "lime"];
  const accent = validAccents.includes(parsed.accent ?? "") ? parsed.accent : "emerald";

  // Extract new auto-fill fields
  const featured_player = typeof parsed.featured_player === "string" && parsed.featured_player.trim()
    ? parsed.featured_player.trim()
    : (players[0] ?? undefined);
  const youtube_query_1 = typeof parsed.youtube_query_1 === "string" ? parsed.youtube_query_1.trim() : "";
  const youtube_query_2 = typeof parsed.youtube_query_2 === "string" ? parsed.youtube_query_2.trim() : "";
  const news_query = typeof parsed.news_query === "string" ? parsed.news_query.trim()
    : (featured_player ?? title);

  // Parse block markup → SectionBlock[] for sections_json
  const sectionsJson = parseMarkupToBlocks(content);

  console.log(`[generate-content] Generated — title: "${title}", category: ${category}, hero: ${hero_variant}, blocks: ${sectionsJson.length}, player: ${featured_player ?? "none"}`);
  return { title, slug, category, content, sectionsJson, players, featured_player, hero_variant, accent, youtube_query_1, youtube_query_2, news_query };
}

function isValidSlug(s: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.trim());
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Server-only route: prefer service-role so writes survive RLS lockdown.
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase env vars missing" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  type PostBody = {
    count?: number;
    title?: string;
    category?: string;
    slug?: string;
    keyword?: string;
    mode?: string;
  };

  let parsedBody: PostBody = {};
  try {
    parsedBody = (await request.json()) as PostBody;
  } catch {
    /* empty */
  }

  const modeRaw = typeof parsedBody.mode === "string" ? parsedBody.mode.trim().toLowerCase() : "";
  const useWebSearchForMode = modeRaw === "trend";

  async function loadRecentTitles(): Promise<string[]> {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentRows } = await supabase
      .from("contents")
      .select("title")
      .gte("created_at", since24h);
    return (recentRows ?? []).map((r) => r.title as string).filter(Boolean);
  }

  // ——— 1) Explicit title → generate content for this exact title ———
  const bodyTitle = typeof parsedBody.title === "string" ? parsedBody.title.trim() : "";
  if (bodyTitle) {
    const recentTitles = await loadRecentTitles();
    const targetCategory: Category = isValidCategory(parsedBody.category) ? parsedBody.category : nextCategory();
    const kw = typeof parsedBody.keyword === "string" ? parsedBody.keyword.trim() : "";
    const modeHint = SINGLE_MODE_HINT[modeRaw] ?? "";

    let topic =
      `The article title MUST be exactly this (in the JSON "title" field): "${bodyTitle}". `;
    if (kw) topic += `Additional keyword / context: ${kw}. `;
    if (modeHint) topic += `${modeHint} `;
    topic += `Category must be "${targetCategory}". Stay faithful to this title and category.`;

    try {
      const generated = await generateWithClaude(topic, targetCategory, recentTitles, useWebSearchForMode);

      const finalTitle = bodyTitle;
      const finalCategory = targetCategory;
      let finalSlug =
        typeof parsedBody.slug === "string" && isValidSlug(parsedBody.slug) ? parsedBody.slug.trim() : "";
      if (!finalSlug) finalSlug = generated.slug && isValidSlug(generated.slug) ? generated.slug : slugify(finalTitle);
      if (!finalSlug) finalSlug = slugify(finalTitle);

      const row = {
        title: finalTitle,
        title_en: finalTitle,
        slug: finalSlug,
        category: finalCategory,
        content: "",
        content_en: generated.content,
        sections_json: generated.sectionsJson,
        status: "pending" as const,
        hero_variant: generated.hero_variant ?? "text-only",
        accent: generated.accent ?? "emerald",
        player_name: generated.featured_player ?? null,
        youtube_query_1: generated.youtube_query_1 || null,
        youtube_query_2: generated.youtube_query_2 || null,
        news_query: generated.news_query || null,
        players_json:
          generated.category === "lists" && generated.players?.length
            ? await buildPlayersJson(supabase, generated.players)
            : null,
      };

      const { error: dbError } = await supabase.from("contents").insert(row);

      if (dbError) {
        return NextResponse.json(
          {
            generated: 0,
            total: 1,
            results: [
              {
                topic: bodyTitle,
                category: finalCategory,
                status: "db_error",
                error: dbError.message,
                title: finalTitle,
                slug: finalSlug,
              },
            ],
          },
          { status: 500 },
        );
      }

      // Pre-resolve featured player so HeroPlayerCard has instant data.
      // Fire-and-forget — don't block the response.
      if (generated.featured_player) {
        import("@/lib/player-resolver").then(({ resolvePlayer }) => {
          resolvePlayer(generated.featured_player!, true).catch(() => {});
        }).catch(() => {});
      }

      return NextResponse.json({
        generated: 1,
        total: 1,
        results: [
          {
            topic: bodyTitle,
            category: finalCategory,
            status: "success",
            title: finalTitle,
            slug: finalSlug,
          },
        ],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        {
          generated: 0,
          total: 1,
          results: [
            {
              topic: bodyTitle,
              category: targetCategory,
              status: "failed",
              error: msg,
              title: bodyTitle,
              slug: slugify(bodyTitle),
            },
          ],
        },
        { status: 500 },
      );
    }
  }

  // ——— 2) Keyword → generate article centred on this topic ———
  const bodyKeyword = typeof parsedBody.keyword === "string" ? parsedBody.keyword.trim() : "";
  if (bodyKeyword) {
    const recentTitles = await loadRecentTitles();
    const targetCategory: Category = isValidCategory(parsedBody.category) ? parsedBody.category : nextCategory();
    const modeHint = SINGLE_MODE_HINT[modeRaw] ?? "";

    let topic = `Core topic / keyword: "${bodyKeyword}". Write a full article centred on this topic. `;
    if (modeHint) topic += `${modeHint} `;
    topic += `Category must be "${targetCategory}".`;

    try {
      const generated = await generateWithClaude(topic, targetCategory, recentTitles, useWebSearchForMode);

      const finalCategory = targetCategory;
      const finalTitle =
        typeof generated.title === "string" && generated.title.trim() ? generated.title.trim() : bodyKeyword;
      const finalSlug =
        typeof generated.slug === "string" && isValidSlug(generated.slug) ? generated.slug.trim() : slugify(finalTitle);

      const row = {
        title: finalTitle,
        title_en: finalTitle,
        slug: finalSlug,
        category: finalCategory,
        content: "",
        content_en: generated.content,
        sections_json: generated.sectionsJson,
        status: "pending" as const,
        hero_variant: generated.hero_variant ?? "text-only",
        accent: generated.accent ?? "emerald",
        player_name: generated.featured_player ?? null,
        youtube_query_1: generated.youtube_query_1 || null,
        youtube_query_2: generated.youtube_query_2 || null,
        news_query: generated.news_query || null,
        players_json:
          generated.category === "lists" && generated.players?.length
            ? await buildPlayersJson(supabase, generated.players)
            : null,
      };

      const { error: dbError } = await supabase.from("contents").insert(row);

      if (dbError) {
        return NextResponse.json(
          {
            generated: 0,
            total: 1,
            results: [
              {
                topic: bodyKeyword,
                category: finalCategory,
                status: "db_error",
                error: dbError.message,
                title: finalTitle,
                slug: finalSlug,
              },
            ],
          },
          { status: 500 },
        );
      }

      return NextResponse.json({
        generated: 1,
        total: 1,
        results: [
          {
            topic: bodyKeyword,
            category: finalCategory,
            status: "success",
            title: finalTitle,
            slug: finalSlug,
          },
        ],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        {
          generated: 0,
          total: 1,
          results: [
            {
              topic: bodyKeyword,
              category: targetCategory,
              status: "failed",
              error: msg,
              title: bodyKeyword,
              slug: slugify(bodyKeyword),
            },
          ],
        },
        { status: 500 },
      );
    }
  }

  const count = Math.min(Math.max(parsedBody.count ?? 1, 1), 5);

  const origin = new URL(request.url).origin;
  const trendTopics = await fetchTrends(origin);

  // Fetch recent titles (last 24h) to avoid duplicates and for frequency check
  const recentTitles = await loadRecentTitles();

  // For each trend topic, count how many recent items already cover it
  function trendUsageCount(trend: string): number {
    const lower = trend.toLowerCase();
    return recentTitles.filter((t) => t.toLowerCase().includes(lower.split(" ")[0])).length;
  }

  // Filter out over-used trend topics (3+ times today)
  const availableTrends = trendTopics.filter((t) => trendUsageCount(t) < 3);
  console.log(
    "[generate-content] Trends — total:",
    trendTopics.length,
    "available:",
    availableTrends.length,
  );

  // Build (topic, targetCategory) pairs — each slot gets the next round-robin category
  const pairs: { topic: string; category: Category }[] = [];
  for (let i = 0; i < count; i++) {
    const cat = nextCategory();
    const trend = availableTrends[i];
    const topic = trend ?? FALLBACK_TOPICS[cat][i % FALLBACK_TOPICS[cat].length];
    if (!trend && trendTopics.length > 0) {
      console.log(`[generate-content] Slot ${i}: trends exhausted, using fallback: "${topic}"`);
    }
    pairs.push({ topic, category: cat });
  }

  console.log("[generate-content] Processing pairs:", pairs.map((p) => `${p.category}::${p.topic}`));

  const results: {
    topic: string;
    category: string;
    status: string;
    title?: string;
    slug?: string;
    error?: string;
  }[] = [];

  for (const { topic, category } of pairs) {
    let generated: Awaited<ReturnType<typeof generateWithClaude>>;

    try {
      const batchWebSearch = category === "radar";
      generated = await generateWithClaude(topic, category, recentTitles, batchWebSearch);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[generate-content] Generation error:", msg);
      results.push({ topic, category, status: "failed", error: msg });
      continue;
    }

    const { error: dbError } = await supabase.from("contents").insert({
      title: generated.title,
      title_en: generated.title,
      slug: generated.slug,
      category: generated.category,
      content: "",
      content_en: generated.content,
      sections_json: generated.sectionsJson,
      status: "pending",
      hero_variant: generated.hero_variant ?? "text-only",
      accent: generated.accent ?? "emerald",
      player_name: generated.featured_player ?? null,
      youtube_query_1: generated.youtube_query_1 || null,
      youtube_query_2: generated.youtube_query_2 || null,
      news_query: generated.news_query || null,
      players_json:
        generated.category === "lists" && generated.players?.length
          ? await buildPlayersJson(supabase, generated.players)
          : null,
    });

    if (dbError) {
      console.error("[generate-content] Supabase insert error:", dbError.message, "— title:", generated.title);
      results.push({
        topic,
        category: generated.category,
        status: "db_error",
        error: dbError.message,
        title: generated.title,
        slug: generated.slug,
      });
    } else {
      console.log("[generate-content] Saved to Supabase:", generated.title, "→", generated.category);
      results.push({
        topic,
        category: generated.category,
        status: "success",
        title: generated.title,
        slug: generated.slug,
      });
    }
  }

  const successCount = results.filter((r) => r.status === "success").length;
  return NextResponse.json({ generated: successCount, total: count, results });
}
