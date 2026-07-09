/**
 * Canonical URL-slug generator for article content (`contents.slug`).
 *
 * SEO / web-standard rules this enforces:
 *  - lowercase, ASCII, hyphen-separated words;
 *  - accented Latin names fold to their base letter (Estêvão → estevao,
 *    Cubarsí → cubarsi, Jérémy → jeremy) instead of being mangled into hyphens;
 *  - no leading/trailing hyphens, no doubled hyphens;
 *  - length is capped, but ONLY at a word boundary — a long title is never cut
 *    mid-word and never left with a dangling trailing hyphen.
 *
 * NOTE: `scripts/scout-publish.mjs` keeps a byte-for-byte mirror of this
 * function (it runs as a standalone Node script and can't import this module).
 * If you change the logic here, update that mirror too.
 */
export const MAX_SLUG_LENGTH = 80;

export function slugify(text: string, maxLength: number = MAX_SLUG_LENGTH): string {
  const base = text
    .toLowerCase()
    // Turkish letters NFD won't cleanly base-map (dotless ı, ğ, ş)
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    // Fold remaining accented Latin (é, ê, ã, ñ, í, ó, á, …) to base letters
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (base.length <= maxLength) return base;

  // Cut to the limit, then back to the last full word, then drop any trailing hyphen.
  const cut = base.slice(0, maxLength);
  const lastDash = cut.lastIndexOf("-");
  const wordSafe = lastDash > 0 ? cut.slice(0, lastDash) : cut;
  return wordSafe.replace(/-+$/g, "");
}
