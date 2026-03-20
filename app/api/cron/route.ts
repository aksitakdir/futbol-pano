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
  /** Anthropic web search (beta) — güncel kaynaklar */
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
    model: "claude-haiku-4-5-20251001",
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

/** İlk '[' ile son ']' arasını alır, JSON.parse eder; sonuç array değilse hata fırlatır. */
function parseJsonArrayFromResponse(raw: string): unknown[] {
  const text = raw
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/g, "")
    .trim();

  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Claude yanıtında JSON array sınırları bulunamadı");
  }

  const slice = text.substring(start, end + 1);
  let parsed: unknown;
  try {
    parsed = JSON.parse(slice);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Claude JSON array parse hatası: ${msg}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Claude yanıtı JSON array değil");
  }

  return parsed;
}

// Sorgu 1 — 5 farklı scout radar oyuncusu (havuz)
async function updateFeaturedPlayerPool(
  supabaseUrl: string,
  supabaseKey: string,
  apiKey: string,
): Promise<number> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const userPrompt =
    "Web'i tarayarak 2025-26 sezonunda 23 yaş altı, henüz büyük Avrupa kulüplerinin radarına tam olarak girmemiş, " +
    "performansıyla dikkat çeken oyuncuları bul. Süper Lig, Portekiz, Hollanda, Belçika, İskoçya, Brezilya Série A, " +
    "Arjantin Primera, Kolombiya, Meksika, Japonya liglerinde ara. Güncel ve doğru bilgi ver.\n\n" +
    "TÜM metinler Türkçe olsun. description ve why_watch kesinlikle Türkçe yaz. " +
    "Tüm açıklayıcı metinler Türkçe olsun: description ve why_watch tamamen Türkçe. " +
    "position yalnızca şu Türkçe etiketlerden biri olsun: Orta Saha, Forvet, Stoper, Sol Bek, Sağ Bek, Kanat, Ofansif Orta Saha.\n\n" +
    "TAM OLARAK 5 birbirinden FARKLI oyuncu seç. Yanıtın SADECE JSON array olmalı; başka metin, markdown veya kod bloğu yok. " +
    "Her eleman şu alanlara sahip olsun: name, club, league, position, age, goals, assists, description, why_watch.\n" +
    "Oyuncu adı ve kulüp/lig adları resmi yazımla kalabilir; description, why_watch ve position kesinlikle Türkçe.\n" +
    "Örnek tek eleman: " +
    '{"name":"...","club":"...","league":"...","position":"...","age":"...","goals":"...","assists":"...","description":"...","why_watch":"..."}';

  const rawText = await callClaude(apiKey, {
    system:
      "Sen bir futbol scout uzmanısın. Web aramasıyla güncel verileri doğrula. Yanıtın yalnızca geçerli bir JSON dizisi (array) olmalı. " +
      "Tüm yanıtları Türkçe ver. TÜM metinler Türkçe olsun; description ve why_watch kesinlikle Türkçe yaz. " +
      "position alanı Türkçe olsun: Orta Saha, Forvet, Stoper, Sol Bek, Sağ Bek, Kanat, Ofansif Orta Saha.",
    user: userPrompt,
    maxTokens: 3200,
    webSearch: true,
  });

  const parsedRaw = parseJsonArrayFromResponse(rawText);

  if (parsedRaw.length !== 5) {
    console.warn(
      `[cron] featured_player_pool: beklenen 5 oyuncu, gelen ${parsedRaw.length}`,
    );
  }

  const normalized = parsedRaw.map((item, idx) => {
    if (item === null || typeof item !== "object") {
      throw new Error(`featured_player_pool[${idx}] geçerli bir nesne değil`);
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

  // Geriye dönük uyumluluk: ilk oyuncuyu eski key'lere de yaz
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

// Sorgu 2 — 20 oyunculu form havuzu (sayfa her yüklemede 10'u random)
async function updateFormPlayers(
  supabaseUrl: string,
  supabaseKey: string,
  apiKey: string,
): Promise<number> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const formPlayersUserPrompt =
    "Web'i tarayarak güncel maç ve istatistik kaynaklarına dayanarak 2025-26 sezonunda form grafiği yükselen genç oyuncuları belirle. " +
    "Büyük 5 lig, Portekiz, Hollanda, Brezilya, Arjantin, Türkiye ve diğer önemli liglerden çeşitli seçim yap.\n\n" +
    "Tüm metin alanları Türkçe olsun. position alanları Türkçe olsun: Forward→Forvet, Midfielder→Orta Saha, Winger→Kanat, Defender→Defans, Goalkeeper→Kaleci, Attacking Midfielder→Ofansif Orta Saha, Defensive Midfielder→Defansif Orta Saha.\n\n" +
    "Aşağıdaki formatta TAM OLARAK 20 oyuncu listesi döndür. Başka hiçbir şey yazma, sadece JSON array:\n" +
    "[\n" +
    '  {"name": "Oyuncu Adı", "club": "Kulüp", "league": "Lig", "position": "Pozisyon", "age": 20, "goals": 5},\n' +
    "  ...\n" +
    "]";

  const rawText = await callClaude(apiKey, {
    system:
      "Sen bir futbol analiz uzmanısın. Web aramasıyla güncel form verilerini doğrula. Yanıtın yalnızca geçerli bir JSON dizisi (array) olmalı. " +
      "Tüm yanıtları Türkçe ver. position alanları Türkçe olsun: Forward→Forvet, Midfielder→Orta Saha, Winger→Kanat, Defender→Defans, Goalkeeper→Kaleci, Attacking Midfielder→Ofansif Orta Saha, Defensive Midfielder→Defansif Orta Saha.",
    user: formPlayersUserPrompt,
    maxTokens: 2800,
    webSearch: true,
  });

  const parsedRaw = parseJsonArrayFromResponse(rawText);

  if (parsedRaw.length !== 20) {
    console.warn(
      `[cron] form_players_pool: beklenen 20 oyuncu, gelen ${parsedRaw.length}`,
    );
  }

  const normalized = parsedRaw.map((item, idx) => {
    if (item === null || typeof item !== "object") {
      throw new Error(`form_players_pool[${idx}] geçerli bir nesne değil`);
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

  // Geriye dönük: ilk 10'u form_players'a da yaz
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
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  const [contentResult, playerResult, formResult] = await Promise.allSettled([
    fetch(`${origin}/api/generate-content`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ count: 2 }),
    }).then((r) => r.json()),
    updateFeaturedPlayerPool(supabaseUrl, supabaseKey, apiKey),
    updateFormPlayers(supabaseUrl, supabaseKey, apiKey),
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
  });
}
