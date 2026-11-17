import type { SectionBlock } from "./section-blocks";

/**
 * Where an article's in-content promo goes (docs/dictumus/BANNER-SLOTS.md §3.1): before
 * the first heading block (section or header) that
 * - has at least two heading blocks before it (in a list, usually two or three players);
 * - has 25–60% of the article's words before it;
 * - does not follow a pullquote, callout or image;
 * - does not split a group header from the first entry under it;
 * - comes before the FAQ.
 * Articles under 600 words or with fewer than four headings get none.
 *
 * Pure: it reads the blocks and returns an index into them, or null. The content
 * itself is never changed, so section numbers, the table of contents and links stay
 * as they are. Checked on the 12 most-clicked pages, 17 Nov 2026: the centre-backs
 * list gets it before "Dean Huijsen", 28% of the way in.
 */
export const IN_CONTENT_MIN_WORDS = 600;
export const IN_CONTENT_MIN_HEADINGS = 4;
const MIN_HEADINGS_BEFORE = 2;
const MIN_SHARE = 0.25;
const MAX_SHARE = 0.6;

const isHeading = (b: SectionBlock) => b.type === "section" || b.type === "header";

function words(text: string | undefined | null): number {
  if (!text) return 0;
  const plain = text.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").trim();
  return plain ? plain.split(/\s+/).length : 0;
}

/** The words a reader sees in a block. Cards, images, videos and dividers count as none. */
export function blockWords(b: SectionBlock): number {
  switch (b.type) {
    case "intro":
    case "callout":
      return words(b.html);
    case "plain":
    case "pullquote":
      return words(b.text);
    case "header":
      return words(b.heading);
    case "section":
      return words(b.heading) + words(b.html);
    case "list":
      return b.items.reduce((n, it) => n + words(it), 0);
    case "vs":
      return (
        words(b.leftName) + words(b.rightName) +
        [b.left, b.right].reduce((n, side) => n + words(side.title) + side.items.reduce((m, it) => m + words(it), 0), 0)
      );
    case "faq":
      return words(b.heading) + b.items.reduce((n, it) => n + words(it.q) + words(it.a), 0);
    case "stat-highlight":
      return words(b.title) + b.stats.reduce((n, s) => n + words(s.value) + words(s.label) + words(s.note), 0);
    case "table":
      return words(b.caption) + b.columns.reduce((n, c) => n + words(c), 0) +
        b.rows.reduce((n, r) => n + r.reduce((m, c) => m + words(c), 0), 0);
    default:
      return 0;
  }
}

/** The index of the block the promo goes before, or null for no in-content promo. */
export function inContentSlotIndex(sections: SectionBlock[] | null | undefined): number | null {
  if (!sections?.length) return null;
  const counts = sections.map(blockWords);
  const total = counts.reduce((a, b) => a + b, 0);
  const headings = sections.filter(isHeading).length;
  if (total < IN_CONTENT_MIN_WORDS || headings < IN_CONTENT_MIN_HEADINGS) return null;

  const firstFaq = sections.findIndex((b) => b.type === "faq");
  const end = firstFaq === -1 ? sections.length : firstFaq;
  let before = 0;
  let headingsBefore = 0;
  let lastHeading: SectionBlock | null = null;
  for (let i = 0; i < end; i++) {
    const b = sections[i];
    if (isHeading(b) && i > 0) {
      const prev = sections[i - 1];
      const share = before / total;
      const ok =
        headingsBefore >= MIN_HEADINGS_BEFORE &&
        share >= MIN_SHARE &&
        share <= MAX_SHARE &&
        prev.type !== "pullquote" && prev.type !== "callout" && prev.type !== "image" &&
        // A group header's first entry stays with it, even with intro text between them:
        // the promo would go before the header ("The Other Eight" in the Kopa list).
        prev.type !== "header" &&
        !(b.type === "section" && lastHeading?.type === "header" && sections[i + 1]?.type === "player");
      if (ok) return i;
      if (share > MAX_SHARE) return null;
    }
    if (isHeading(b)) { headingsBefore++; lastHeading = b; }
    before += counts[i];
  }
  return null;
}
