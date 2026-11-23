import type { Metadata } from "next";
import { createClient } from "./supabase";

import { articlePlainText as plainText, truncateAtWord } from "./article-excerpt";
import { articleDates } from "./article-dates";

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
  // Queried outside the try: a database error must fail the render (so it is not
  // cached as a page titled "Not Found" with no canonical), and only a missing row,
  // or a duplicate slug (PGRST116), gets the Not Found title.
  const supabase = createClient();
  // "*" rather than a column list: content_updated_at only exists once its migration
  // has run (supabase/migrations/contents_content_updated_at.sql). Naming it here
  // would fail every article's metadata, and with it the build, if the code got
  // there first. The row already carries sections_json, the bulk of it.
  const { data, error } = await supabase
    .from("contents")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throw error;
  if (!data) return { title: "Not Found" };

  try {

    const title = data.title_en || data.title;
    const raw = data.content_en || data.content || "";
    const fromLegacy = plainText(raw);
    // Block-editor articles keep their prose in sections_json, not content_en.
    const description = truncate(fromLegacy.length >= 60 ? fromLegacy : descriptionFromBlocks(data.sections_json) || fromLegacy);
    const url = `https://www.scoutgamer.com${urlPath}`;
    const ogImage = data.cover_image || "https://www.scoutgamer.com/og-image.png";
    const dates = articleDates(data);

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
        publishedTime: dates.published,
        modifiedTime: dates.modified,
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
