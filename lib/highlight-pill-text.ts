/**
 * Pill display: under lang=tr, CSS uppercase turns English i into a dotted capital.
 * If the word is ASCII+hyphen use en-US uppercase; otherwise locale-aware uppercase.
 */
const ASCII_TOKEN = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;

function uppercaseToken(token: string): string {
  const t = token.trim();
  if (!t) return t;
  if (ASCII_TOKEN.test(t)) return t.toLocaleUpperCase("en-US");
  return t.toLocaleUpperCase("tr-TR");
}

/** Uppercases title / highlight text safely for the mono pill */
export function formatHighlightPillText(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(uppercaseToken)
    .join(" ");
}
