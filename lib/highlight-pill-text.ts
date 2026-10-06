/**
 * Pill display text, uppercased in code rather than with CSS.
 *
 * Always en-US. This used to fall back to tr-TR for any token that was not pure
 * ASCII, a leftover from the Turkish-language site — so "Tier:" (the colon made
 * it non-ASCII-word) rendered as "TİER:" with a dotted capital İ on every card
 * that carried a Scout Gamer Read tier (found 2026-10-06). The site is
 * English-only; accented names (Güler, Cubarsí) uppercase correctly in en-US.
 */
export function formatHighlightPillText(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.toLocaleUpperCase("en-US"))
    .join(" ");
}
