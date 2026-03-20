export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/** ~200 kelime/dk okuma varsayımı */
export function estimateReadMinutes(htmlOrText: string): number {
  const text = stripHtml(htmlOrText ?? "").replace(/\s+/g, " ").trim();
  if (!text) return 1;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
