/**
 * İçerik gövdesine gömülü EA FC oyuncu kartları için ayırıcı.
 * Editörde kullanım: <!-- scout-player:Oyuncu Tam Adı -->
 */

export type PlayerEmbedSegment =
  | { kind: "html"; html: string }
  | { kind: "player"; name: string };

const EMBED_RE = /<!--\s*scout-player:\s*([\s\S]*?)\s*-->/gi;

export function htmlContainsPlayerEmbed(html: string): boolean {
  EMBED_RE.lastIndex = 0;
  return typeof html === "string" && /scout-player:/i.test(html);
}

export function splitHtmlWithPlayerEmbeds(html: string): PlayerEmbedSegment[] {
  if (!html?.trim()) return [{ kind: "html", html: html ?? "" }];
  const segments: PlayerEmbedSegment[] = [];
  let last = 0;
  EMBED_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = EMBED_RE.exec(html)) !== null) {
    if (m.index > last) segments.push({ kind: "html", html: html.slice(last, m.index) });
    const name = m[1].replace(/\s+/g, " ").trim();
    if (name) segments.push({ kind: "player", name });
    last = m.index + m[0].length;
  }
  if (last < html.length) segments.push({ kind: "html", html: html.slice(last) });
  return segments.length ? segments : [{ kind: "html", html }];
}
