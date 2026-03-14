import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY environment variable is not set" },
      { status: 500 }
    );
  }

  let body: { topic?: string; slug?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz JSON gövdesi gönderildi." },
      { status: 400 }
    );
  }

  const { topic, slug } = body;

  if (!topic || typeof topic !== "string") {
    return NextResponse.json(
      { error: '"topic" alanı zorunludur ve string olmalıdır.' },
      { status: 400 }
    );
  }

  const prompt = `Konu: "${topic}"
Slug: "${slug ?? "bilinmiyor"}"

Görev:
- 2025-26 sezonuna ait en güncel verileri ve haberleri web'den araştır.
- Türkçe, analitik ve akıcı bir futbol içeriği üret.
- İçeriği markdown formatında üret (başlıklar, listeler, kalın vurgular, blok alıntılar vb. serbest).
- Özellikle genç oyuncular, trendler, taktiksel notlar ve dikkat çeken verilerden bahset.
`;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        system:
          "Sen bir futbol analiz uzmanısın. Web'i tarayarak güncel 2025-26 sezonu verilerine göre Türkçe içerik üret.",
        tools: [
          {
            name: "web_search_20250305",
            description:
              "Güncel 2025-26 futbol sezonu verilerini, haberlerini ve istatistiklerini web üzerinden aramak için kullanılır.",
            input_schema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description:
                    "Aranacak futbol konusu veya oyuncu/lig/maç adı.",
                },
                language: {
                  type: "string",
                  enum: ["tr", "en"],
                  description:
                    "Arama sonuçlarının tercih edilen dili. Varsayılan 'tr'.",
                },
              },
              required: ["query"],
            },
          },
        ],
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        {
          error: "Anthropic API isteği başarısız oldu.",
          status: response.status,
          details: text,
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    console.log(
      "[Scout Intelligence] Anthropic raw response:",
      JSON.stringify(data, null, 2)
    );

    const extractText = (node: any): string[] => {
      if (!node) return [];

      if (Array.isArray(node)) {
        return node.flatMap((item) => extractText(item));
      }

      if (typeof node === "object") {
        if (node.type === "text" && typeof node.text === "string") {
          return [node.text];
        }

        // tool_result içerikleri genellikle kendi content alanına sahiptir
        if (node.type === "tool_result" && node.content) {
          return extractText(node.content);
        }

        // Diğer objelerde iç alanları da gez
        const collected: string[] = [];
        for (const value of Object.values(node)) {
          collected.push(...extractText(value));
        }
        return collected;
      }

      return [];
    };

    const allTextParts = extractText(data?.content);
    const content = allTextParts.join("\n\n").trim();

    return NextResponse.json(
      {
        topic,
        slug: slug ?? null,
        markdown: content,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Anthropic content API error:", error);
    return NextResponse.json(
      {
        error: "İçerik üretilirken beklenmeyen bir hata oluştu.",
      },
      { status: 500 }
    );
  }
}

