/**
 * Pill görünümü: lang=tr iken CSS uppercase İngilizce i→İ yapar.
 * Kelime ASCII+tire ise en-US, Türkçe karakter içeriyorsa tr-TR büyük harf.
 */
const ASCII_TOKEN = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;

function uppercaseToken(token: string): string {
  const t = token.trim();
  if (!t) return t;
  if (ASCII_TOKEN.test(t)) return t.toLocaleUpperCase("en-US");
  return t.toLocaleUpperCase("tr-TR");
}

/** Başlık / highlight metnini mono pill için güvenli büyük harfe çevirir */
export function formatHighlightPillText(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(uppercaseToken)
    .join(" ");
}
