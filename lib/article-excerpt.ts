/**
 * Turning an article body into a snippet — the one definition.
 *
 * WHY THIS EXISTS: nine separate places built their own excerpt out of the
 * legacy `content` / `content_en` column, each stripping HTML and markdown, and
 * none of them stripping the block-markup markers the publishing script writes.
 * `lib/article-metadata.ts` had the one line that did — so meta descriptions
 * were clean while the homepage hero, the recent carousel, the category pages,
 * the RSS feed and the JSON-LD all published snippets beginning:
 *
 *     @lead: Every club in Europe says it wants a centre-back who can play.
 *
 * Found on 2026-09-22 in the homepage hero, then confirmed live in the feed and
 * in the structured data Google reads for rich results.
 *
 * Nine copies of nearly-the-same regex chain is how one of them ends up a line
 * short. There is one copy now.
 */

/** Strip HTML, block-markup markers and markdown punctuation down to prose. */
export function articlePlainText(raw: string | null | undefined): string {
  return (raw ?? "")
    .replace(/<[^>]+>/g, " ")
    // `@lead:`, `@section:`, `@callout:` … at the start of any line. Anchored
    // per-line on purpose: an email address or a handle mid-sentence is prose.
    .replace(/^@\w+:\s*/gm, "")
    .replace(/[#*_\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Cut at a word boundary so a snippet never ends mid-word. */
export function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.4 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:—-]+$/, "") + "…";
}

/**
 * A snippet from an article body: whole sentences where they fit, otherwise a
 * clean cut. `title` removes a leading repeat of the headline, which some older
 * articles carry as their first line.
 */
export function articleExcerpt(
  raw: string | null | undefined,
  { max = 160, title }: { max?: number; title?: string } = {},
): string {
  let text = articlePlainText(raw);

  if (title) {
    const t = title.replace(/\s+/g, " ").trim();
    if (t && text.toLowerCase().startsWith(t.toLowerCase())) {
      text = text.slice(t.length).trim();
    }
  }

  const firstSentence = text.match(/^[^.!?]{20,}[.!?]/)?.[0];
  return truncateAtWord((firstSentence ?? text).trim(), max);
}
