import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

/**
 * Generates social share copy (X tweet + Instagram caption) for an article.
 * Admin-only — uses the Anthropic API, so it must not be publicly callable.
 *
 * POST body: { title: string; category?: string; summary?: string; slug?: string }
 * Returns: { tweet: string; instagram: string }
 */

export const runtime = "nodejs";

function buildSystem(): string {
  return [
    "You are a social media editor for ScoutGamer (scoutgamer.com), an English-language",
    "football content site covering World Cup 2026, young-talent scouting, transfers,",
    "tactics, and interactive tournaments.",
    "",
    "Write engaging, accurate social copy in ENGLISH. Never invent facts not present in",
    "the provided title/summary. Avoid clickbait that overpromises. No emojis in the",
    "tweet beyond at most one; the Instagram caption may use a few tasteful emojis.",
    "",
    "Return ONLY valid JSON with this exact shape, no markdown fences:",
    '{ "tweet": "...", "instagram": "..." }',
    "",
    "tweet: max 270 characters INCLUDING hashtags. Hook + 1 line. 2-3 relevant hashtags",
    "  (e.g. #WorldCup2026 #Ghana). Do not include a URL — the link is attached separately.",
    "instagram: 3-6 short lines, a strong opening line, then 1-2 sentences, then a block of",
    "  6-10 hashtags on the last line. Encourage tapping the link in bio.",
  ].join("\n");
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
  }

  let body: { title?: string; category?: string; summary?: string; slug?: string } = {};
  try {
    body = await request.json();
  } catch {
    /* empty */
  }
  const title = (body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const userMessage = [
    `Title: ${title}`,
    body.category ? `Category: ${body.category}` : "",
    body.summary ? `Summary: ${body.summary}` : "",
    "",
    "Write the tweet and Instagram caption.",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: buildSystem(),
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

  const data = (await res.json()) as { content?: Array<{ type?: string; text?: string }> };
  const text = data.content?.map((c) => c.text ?? "").join("").trim() ?? "";

  // Parse the JSON the model returned (tolerate stray fences/prose).
  let parsed: { tweet?: string; instagram?: string } = {};
  try {
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
  } catch {
    return NextResponse.json({ error: "Could not parse AI response", raw: text }, { status: 502 });
  }

  return NextResponse.json({
    tweet: (parsed.tweet ?? "").trim(),
    instagram: (parsed.instagram ?? "").trim(),
  });
}
