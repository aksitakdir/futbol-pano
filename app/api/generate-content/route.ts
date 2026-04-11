import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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

const CATEGORIES = ["radar", "taktik-lab", "listeler"] as const;
type Category = (typeof CATEGORIES)[number];

const FALLBACK_TOPICS: Record<Category, string[]> = {
  radar: [
    "Avrupa liglerinde öne çıkan genç oyuncular",
    "Güncel transfer söylentileri",
    "Şampiyonlar Ligi'nde dikkat çeken performanslar",
    "Süper Lig'in yükselen yıldızları",
    "Brezilya Série A'nın Avrupa'ya ihraç edeceği genç oyuncular",
    "Arjantin'in keşfedilmemiş yetenekleri",
  ],
  "taktik-lab": [
    "Modern futbolda pozisyon devrimleri",
    "Yüksek pressing sistemlerinin anatomisi",
    "Oyun kurucu stoper tipolojisi",
    "False 9 ve alternatif forvet rolleri",
    "Brezilya futbolunun taktiksel DNA'sı: Jogo Bonito'dan modern pressing'e",
    "Arjantin'in yetiştirdiği Box-to-Box oyuncular",
  ],
  listeler: [
    "En umut verici U21 oyuncuları",
    "Son dönemin en iyi transferleri",
    "En yüksek xG üretimi yapan forvetler",
    "En iyi pressing takımları sıralaması",
    "Latin Amerika'nın en değerli 10 genç oyuncusu",
    "Güney Amerika'dan Avrupa'ya en iyi transferler",
  ],
};

/** Tekil üretim isteğinde mod bağlamı (web araması yok) */
const SINGLE_MODE_HINT: Record<string, string> = {
  trend: "İçerik güncel ve trend odaklı olsun; taraftarın bugün merak ettiği tonda yaz.",
  general: "2025-26 sezon gündemi ve güncel futbol dünyasıyla uyumlu olsun.",
  historical: "Evergreen, futbol tarihi ve kalıcı değer odaklı; zamanla eskimeyen bir metin olsun.",
  chronological:
    "Kronolojik yapı kullan: bölümler oyuncu veya kulübün kariyer/tarih evrelerine göre ilerlesin (zaman çizelgesi hissi).",
};

const SYSTEM_PROMPT = `Sen bir futbol içerik yazarısın. Kısa, dikkat çekici, SEO odaklı başlıklar kullan. Başlıkta günlük konuşma dilindeki futbol terimlerini ve popüler arama kelimelerini tercih et. Teknik jargonu minimumda tut. Güncel futbol dünyasından yaz. Başlıkta tarih, yıl veya sezon ibaresi kullanma. Örnek başlık formatları: "X Takımın Yeni Yıldızı: Y Kimdir?", "Z Transferi Neden Önemli?", "Sürpriz İsim: W". HTML formatında içerik yaz, markdown kullanma.

Yanıtını SADECE şu JSON formatında ver, başka hiçbir şey yazma:
{
  "title": "kısa ve dikkat çekici başlık (yıl veya sezon bilgisi olmadan)",
  "slug": "url-dostu-slug",
  "category": "radar veya taktik-lab veya listeler",
  "content": "HTML formatında içerik. <h2>, <h3>, <p>, <ul>, <li>, <strong> taglarını kullan. Markdown kullanma. En az 400 kelime yaz."
}

Kategori rehberi:
- radar: güncel oyuncu analizi, transfer söylentisi, haftalık performans değerlendirmesi
- taktik-lab: modern pozisyon arketipleri, taktiksel analiz, oyun modeli incelemesi
- listeler: sıralama ve karşılaştırma listeleri, en iyi/en kötü/en umut verici gibi formatlar

Eğer kategori "listeler" ise, JSON'a ek olarak "players" alanı ekle:
"players": ["Oyuncu Adı 1", "Oyuncu Adı 2", ...] — içerikte geçen oyuncuların tam adlarını liste olarak ver, maksimum 10 oyuncu.`;

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
  players?: string[];
}> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY ortam değişkeni tanımlı değil");

  const exclusionNote = recentTitles.length > 0
    ? `\n\nBu başlıkları veya konuları KULLANMA (son 24 saatte zaten üretildi):\n${recentTitles.map((t) => `- ${t}`).join("\n")}\n`
    : "";

  const userMessage =
    `Konu: ${topic}. Güncel futbol dünyasından ele al. ` +
    (useWebSearch
      ? "Web araması yaparak güncel haber, istatistik ve gelişmeleri doğrula; içeriği buna dayandır. "
      : "") +
    `Eğer spesifik bir kulüp veya oyuncu trendi varsa onu merkeze al. ` +
    `Kategori olarak "${targetCategory}" kullan. ` +
    `Slug URL dostu olsun (Türkçe karakter yok, tire ile ayrılmış). ` +
    `İçeriği SADECE HTML olarak yaz — <h2>, <h3>, <p>, <ul>, <li>, <strong> tagları kullan, kesinlikle markdown işareti kullanma.` +
    exclusionNote;

  console.log(
    `[generate-content] Claude isteği — konu: "${topic}", hedef kategori: ${targetCategory}, webSearch: ${useWebSearch}`,
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
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
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
    console.error("[generate-content] Anthropic API hatası:", errDetail);
    if (res.status === 429) throw new Error(`Hız sınırı (429): ${errDetail}`);
    if (res.status === 401) throw new Error("API anahtarı geçersiz (401)");
    throw new Error(`Anthropic API hatası: ${errDetail}`);
  }

  const data = await res.json() as {
    content?: Array<{ type?: string; text?: string }>;
    stop_reason?: string;
  };

  if (data.stop_reason === "max_tokens") {
    console.warn("[generate-content] stop_reason=max_tokens, yanıt kesilmiş olabilir");
  }

  const rawText = (data.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("")
    .trim();

  if (!rawText) {
    console.error("[generate-content] Yanıtta metin bloğu yok:", JSON.stringify(data).slice(0, 300));
    throw new Error("Model metin üretmedi (boş yanıt)");
  }

  console.log("[generate-content] Ham yanıt (ilk 300 karakter):", rawText.slice(0, 300));

  const jsonStr = cleanAndExtractJson(rawText);
  if (!jsonStr) {
    console.error("[generate-content] JSON nesnesi bulunamadı, ham yanıt:", rawText.slice(0, 800));
    throw new Error("Yanıtta geçerli JSON nesnesi bulunamadı");
  }

  let parsed: { title?: string; slug?: string; category?: string; content?: string; players?: unknown };
  try {
    parsed = JSON.parse(jsonStr);
  } catch (parseErr) {
    console.error("[generate-content] JSON.parse hatası:", parseErr, "— girdi:", jsonStr.slice(0, 400));
    throw new Error("Model çıktısı JSON olarak çözülemedi");
  }

  const content = typeof parsed.content === "string" ? parsed.content.trim() : "";
  if (!content) {
    console.error("[generate-content] content alanı boş, parsed:", JSON.stringify(parsed).slice(0, 400));
    throw new Error('"content" alanı boş');
  }

  const players: string[] = Array.isArray(parsed.players)
    ? (parsed.players as unknown[]).filter((p): p is string => typeof p === "string").slice(0, 10)
    : [];

  const title = typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim() : topic;
  const slug  = typeof parsed.slug  === "string" && parsed.slug.trim()  ? parsed.slug.trim()  : slugify(title);

  // Honour the model's choice only if it's valid, else fall back to targetCategory
  const category = (["radar", "taktik-lab", "listeler"] as string[]).includes(String(parsed.category ?? ""))
    ? (parsed.category as string)
    : targetCategory;

  console.log(`[generate-content] Başarıyla üretildi — başlık: "${title}", kategori: ${category}`);
  return { title, slug, category, content, players };
}

function isValidSlug(s: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.trim());
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY tanımlı değil" }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase ortam değişkenleri eksik" }, { status: 500 });
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

  // ——— 1) title varsa: bu başlıkla içerik (trend kullanılmaz) ———
  const bodyTitle = typeof parsedBody.title === "string" ? parsedBody.title.trim() : "";
  if (bodyTitle) {
    const recentTitles = await loadRecentTitles();
    const targetCategory: Category = isValidCategory(parsedBody.category) ? parsedBody.category : nextCategory();
    const kw = typeof parsedBody.keyword === "string" ? parsedBody.keyword.trim() : "";
    const modeHint = SINGLE_MODE_HINT[modeRaw] ?? "";

    let topic =
      `Makale başlığı TAM olarak şu olmalı (JSON "title" alanında aynen bu metin): "${bodyTitle}". `;
    if (kw) topic += `Ek anahtar kelime / bağlam: ${kw}. `;
    if (modeHint) topic += `${modeHint} `;
    topic += `Kategori "${targetCategory}" olmalı. İçerik bu başlığa ve kategoriye sadık kalsın.`;

    try {
      let generated = await generateWithClaude(topic, targetCategory, recentTitles, useWebSearchForMode);

      const finalTitle = bodyTitle;
      const finalCategory = targetCategory;
      let finalSlug =
        typeof parsedBody.slug === "string" && isValidSlug(parsedBody.slug) ? parsedBody.slug.trim() : "";
      if (!finalSlug) finalSlug = generated.slug && isValidSlug(generated.slug) ? generated.slug : slugify(finalTitle);
      if (!finalSlug) finalSlug = slugify(finalTitle);

      const row = {
        title: finalTitle,
        slug: finalSlug,
        category: finalCategory,
        content: generated.content,
        status: "bekliyor" as const,
        players_json:
          generated.category === "listeler" && generated.players?.length
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

  // ——— 2) keyword varsa: konu = keyword, trend yok; category parametresi ———
  const bodyKeyword = typeof parsedBody.keyword === "string" ? parsedBody.keyword.trim() : "";
  if (bodyKeyword) {
    const recentTitles = await loadRecentTitles();
    const targetCategory: Category = isValidCategory(parsedBody.category) ? parsedBody.category : nextCategory();
    const modeHint = SINGLE_MODE_HINT[modeRaw] ?? "";

    let topic = `Ana konu / keyword: "${bodyKeyword}". Bu konuyu merkeze alarak tam bir makale yaz. `;
    if (modeHint) topic += `${modeHint} `;
    topic += `Kategori "${targetCategory}" olmalı.`;

    try {
      const generated = await generateWithClaude(topic, targetCategory, recentTitles, useWebSearchForMode);

      const finalCategory = targetCategory;
      const finalTitle =
        typeof generated.title === "string" && generated.title.trim() ? generated.title.trim() : bodyKeyword;
      let finalSlug =
        typeof generated.slug === "string" && isValidSlug(generated.slug) ? generated.slug.trim() : slugify(finalTitle);

      const row = {
        title: finalTitle,
        slug: finalSlug,
        category: finalCategory,
        content: generated.content,
        status: "bekliyor" as const,
        players_json:
          generated.category === "listeler" && generated.players?.length
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
    "[generate-content] Trendler — toplam:",
    trendTopics.length,
    "kullanılabilir:",
    availableTrends.length,
  );

  // Build (topic, targetCategory) pairs — each slot gets the next round-robin category
  const pairs: { topic: string; category: Category }[] = [];
  for (let i = 0; i < count; i++) {
    const cat = nextCategory();
    const trend = availableTrends[i];
    const topic = trend ?? FALLBACK_TOPICS[cat][i % FALLBACK_TOPICS[cat].length];
    if (!trend && trendTopics.length > 0) {
      console.log(`[generate-content] Slot ${i}: trendler dolu/atlandı, fallback kullanılıyor: "${topic}"`);
    }
    pairs.push({ topic, category: cat });
  }

  console.log("[generate-content] İşlenecek çiftler:", pairs.map((p) => `${p.category}::${p.topic}`));

  const results: {
    topic: string;
    category: string;
    status: string;
    title?: string;
    slug?: string;
    error?: string;
  }[] = [];

  for (const { topic, category } of pairs) {
    let generated: { title: string; slug: string; category: string; content: string; players?: string[] };

    try {
      const batchWebSearch = category === "radar";
      generated = await generateWithClaude(topic, category, recentTitles, batchWebSearch);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[generate-content] Üretim hatası:", msg);
      results.push({ topic, category, status: "failed", error: msg });
      continue;
    }

    const { error: dbError } = await supabase.from("contents").insert({
      title: generated.title,
      slug: generated.slug,
      category: generated.category,
      content: generated.content,
      status: "bekliyor",
      players_json:
        generated.category === "listeler" && generated.players?.length
          ? await buildPlayersJson(supabase, generated.players)
          : null,
    });

    if (dbError) {
      console.error("[generate-content] Supabase insert hatası:", dbError.message, "— başlık:", generated.title);
      results.push({
        topic,
        category: generated.category,
        status: "db_error",
        error: dbError.message,
        title: generated.title,
        slug: generated.slug,
      });
    } else {
      console.log("[generate-content] Supabase'e kaydedildi:", generated.title, "→", generated.category);
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
