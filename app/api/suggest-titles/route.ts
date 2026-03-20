import { NextResponse } from "next/server";

export type SuggestTitleMode = "trend" | "general" | "historical" | "chronological";

const MODE_SYSTEM_ADDITION: Record<SuggestTitleMode, string> = {
  trend:
    "Mod: Güncel & Trend. Web araması yapmadan, genel futbol bilginle güncel gündem ve trendlere uygun, tıklanmaya teşvik eden başlıklar öner.",
  general:
    "Mod: Genel Güncel. 2025-26 sezonu futbol gündeminden, taraftarın merak edeceği güncel konulara odaklan.",
  historical:
    "Mod: Tarihsel. Futbol tarihinden evergreen, yıllar sonra da ilgi görecek, hiç eskimeyen konulu başlıklar öner.",
  chronological:
    "Mod: Kronolojik. Bir oyuncunun veya kulübün kariyer/tarih zaman çizelgesi formatına uygun başlıklar öner (ör. evreler, dönemler, kırılma anları).",
};

const SUGGEST_SYSTEM = `Sen bir Türkçe futbol içerik editörüsün. Kullanıcı bir keyword veya konu verir; sen 8 adet makale başlığı önerirsin.

Kurallar:
- Başlıklar Türkçe, net ve SEO dostu olsun.
- Kategori her biri için tam olarak şunlardan biri: "radar", "taktik-lab", "listeler" (küçük harf, tire ile).
- seo_value: "Yüksek", "Orta" veya "Düşük" (Türkçe, tam bu yazım).
- slug: URL dostu, küçük harf, Türkçe karakter yok, tire ile kelimeler (ör. genc-yetenek-radar-notu).

Yanıtın SADECE geçerli bir JSON dizisi olsun, başka metin veya markdown kod bloğu kullanma:
[{"title":"...","category":"radar","seo_value":"Yüksek","slug":"..."}, ...]

Tam 8 öğe döndür.`;

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

  const userMessage =
    `${MODE_SYSTEM_ADDITION[mode]}\n\n` +
    `Kullanıcı konu / keyword: "${keyword}"\n\n` +
    `Bu konuya uygun tam 8 başlık üret.`;

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
      system: SUGGEST_SYSTEM,
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
