import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

type AnthropicMessage = {
  role: "user" | "assistant";
  content: { type: "text"; text: string }[];
};

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

  // Kullanılacak sistem promptu
  const systemPrompt =
    "Sen bir futbol analiz uzmanısın. 2025-26 sezonu hakkında Türkçe, detaylı, markdown formatında içerik üret. Başlık, alt başlıklar, oyuncu listesi ve analizler içersin.";

  const userPrompt = `Konu: "${topic}"
Slug: "${slug ?? "bilinmiyor"}"

Görev:
- 2025-26 sezonuna odaklan.
- İçeriği yalnızca kendi bilgin ve futbol analiz perspektifinle oluştur; ek web araması yapma.
- İçeriği markdown formatında yaz (başlıklar, alt başlıklar, listeler, kalın vurgular).
- Genç oyuncular, öne çıkan performanslar, taktiksel eğilimler ve dikkat çeken verileri işle.
`;

  try {
    const messages: AnthropicMessage[] = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: userPrompt,
          },
        ],
      },
    ];

    let fullText = "";
    let stopReason: string | null = null;
    let safetyCounter = 0;

    // stop_reason "end_turn" olana kadar (veya güvenlik sınırına kadar) döngü
    while (stopReason !== "end_turn" && safetyCounter < 3) {
      safetyCounter += 1;

      const response = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1600,
          system: systemPrompt,
          messages,
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

      stopReason = data?.stop_reason ?? null;

      const chunkText =
        Array.isArray(data?.content) && data.content.length > 0
          ? data.content
              .filter((part: any) => part?.type === "text")
              .map((part: any) => part.text)
              .join("\n\n")
          : "";

      if (chunkText) {
        fullText += (fullText ? "\n\n" : "") + chunkText;
      }

      // Konuşma geçmişine asistan cevabını ekle
      if (Array.isArray(data?.content)) {
        messages.push({
          role: "assistant",
          content: data.content.filter(
            (part: any) => part?.type === "text" && typeof part.text === "string"
          ),
        });
      }

      // Eğer model max_tokens ile durduysa, döngü bir kez daha devam edip
      // kalan içeriği tamamlamaya çalışabilir. safetyCounter bunu sınırlar.
      if (!stopReason) {
        break;
      }
    }

    const markdown = fullText.trim();

    return NextResponse.json(
      {
        topic,
        slug: slug ?? null,
        markdown,
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

