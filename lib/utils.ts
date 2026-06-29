export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/** TipTap / rich-text output (not markdown-based) */
export function contentLooksLikeHtml(content: string): boolean {
  const t = (content ?? "").trim();
  if (!t) return false;
  return /^<[a-z][\s\S]*/i.test(t);
}

/** ~200 words/min reading assumption */
export function estimateReadMinutes(htmlOrText: string): number {
  const text = stripHtml(htmlOrText ?? "").replace(/\s+/g, " ").trim();
  if (!text) return 1;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
