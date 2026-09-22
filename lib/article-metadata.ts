import type { Metadata } from "next";
import { createClient } from "./supabase";

import { articlePlainText as plainText, truncateAtWord } from "./article-excerpt";

/**
 * Build a description from the block editor's sections_json.
 *
 * WHY: the legacy `content_en` column is where the meta description used to come
 * from, but articles written as blocks store their text in `sections_json` and the
 * admin editor writes an empty `<p></p>` into `content_en` on save. That left 75 of
 * 110 published articles with NO meta description, so Google invented its own
 * snippet instead of using ours (found 2026-07-29). Prose blocks only — a heading
 * or a player name makes a poor snippet.
 */
function descriptionFromBlocks(blocks: unknown): string {
  if (!Array.isArray(blocks)) return "";
  const parts: string[] = [];

  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    const b = block as { type?: string; html?: string; text?: string };
    let piece = "";

    if (b.type === "intro" || b.type === "section" || b.type === "callout") piece = plainText(b.html ?? "");
    else if (b.type === "plain" || b.type === "pullquote") piece = plainText(b.text ?? "");

    if (piece) parts.push(piece);
    if (parts.join(" ").length >= 160) break;
  }

  return parts.join(" ").trim();
}

const truncate = (text: string, max = 160) => truncateAtWord(text, max);

export async function articleMetadata(
  slug: string,
  urlPath: string,
): Promise<Metadata> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("contents")
      .select("title,title_en,content,content_en,sections_json,cover_image,created_at")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return { title: "Not Found" };

    const title = data.title_en || data.title;
    const raw = data.content_en || data.content || "";
    const fromLegacy = plainText(raw);
    // Block-editor articles keep their prose in sections_json, not content_en.
    const description = truncate(fromLegacy.length >= 60 ? fromLegacy : descriptionFromBlocks(data.sections_json) || fromLegacy);
    const url = `https://www.scoutgamer.com${urlPath}`;
    const ogImage = data.cover_image || "https://www.scoutgamer.com/og-image.png";

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        title: `${title} | Scout Gamer`,
        description,
        url,
        siteName: "Scout Gamer",
        locale: "en_US",
        images: [{ url: ogImage, alt: title }],
        publishedTime: data.created_at,
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Scout Gamer`,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return { title: "Scout Gamer" };
  }
}
