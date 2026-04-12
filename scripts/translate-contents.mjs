import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

// .env.local'dan oku
import { readFileSync } from "fs";
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter(l => l.trim() && !l.startsWith("#"))
    .map(l => l.split("=").map((p, i) => i === 0 ? p.trim() : l.slice(l.indexOf("=") + 1).trim()))
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

async function translateContent(turkishTitle, turkishContent) {
  const message = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `You are a professional football/soccer content translator. Translate the following Turkish football scouting article to English.

Rules:
- Maintain the same tone, style and structure
- Keep player names, club names and proper nouns as-is
- Keep tactical terms accurate (gegenpressing, false 9, etc.)
- Return ONLY a JSON object with exactly two fields: "title_en" and "content_en"
- content_en should preserve any HTML tags from the original
- Do not add any explanation or preamble

Turkish title: ${turkishTitle}

Turkish content:
${turkishContent}

Return only valid JSON like: {"title_en": "...", "content_en": "..."}`
      }
    ]
  });

  const text = message.content[0].text.trim();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

async function main() {
  console.log("📡 Supabase'den içerikler çekiliyor...");

  // Sadece title_en veya content_en boş olanları çek
  const { data: contents, error } = await supabase
    .from("contents")
    .select("id, title, content, title_en, content_en, slug, category")
    .eq("status", "yayinda")
    .or("title_en.is.null,content_en.is.null");

  if (error) { console.error("Supabase hatası:", error); process.exit(1); }
  if (!contents?.length) { console.log("✅ Çevrilecek içerik yok."); return; }

  console.log(`📝 ${contents.length} içerik çevrilecek.\n`);

  let success = 0, failed = 0;

  for (const item of contents) {
    console.log(`🔄 [${item.category}] ${item.title.slice(0, 60)}...`);
    try {
      const { title_en, content_en } = await translateContent(item.title, item.content);

      const { error: updateError } = await supabase
        .from("contents")
        .update({ title_en, content_en })
        .eq("id", item.id);

      if (updateError) throw updateError;

      console.log(`   ✅ "${title_en.slice(0, 60)}..."`);
      success++;

      // Rate limit için 1 saniye bekle
      await new Promise(r => setTimeout(r, 1000));

    } catch (err) {
      console.error(`   ❌ Hata:`, err.message ?? err);
      failed++;
    }
  }

  console.log(`\n🏁 Tamamlandı: ${success} başarılı, ${failed} başarısız.`);
}

main();
