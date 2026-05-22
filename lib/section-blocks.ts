/** Structured article blocks stored in contents.sections_json */

export type SectionBlock =
  | { type: "intro"; html: string }
  | { type: "plain"; text: string }
  | { type: "header"; heading: string; level?: 2 | 3 }
  | { type: "section"; heading: string; html: string }
  | { type: "pullquote"; text: string }
  | { type: "callout"; html: string };

export type TocItem = { text: string; id: string };

export function headingToId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

export function plainTextToHtml(text: string): string {
  return text
    .split(/\n\n+/)
    .filter(Boolean)
    .map((p) => `<p>${p.trim().replace(/\n/g, " ")}</p>`)
    .join("\n");
}

export function stripHtmlText(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

export function hasBlockContent(blocks: SectionBlock[]): boolean {
  return blocks.some((b) => {
    if (b.type === "intro" || b.type === "callout") {
      return stripHtmlText(b.html).length > 0;
    }
    if (b.type === "plain") return b.text.trim().length > 0;
    if (b.type === "header") return b.heading.trim().length > 0;
    if (b.type === "section") {
      return b.heading.trim().length > 0 || stripHtmlText(b.html).length > 0;
    }
    if (b.type === "pullquote") return b.text.trim().length > 0;
    return false;
  });
}

export function tocFromSections(blocks: SectionBlock[]): TocItem[] {
  const items: TocItem[] = [];
  for (const sec of blocks) {
    if (sec.type === "section" && sec.heading.trim()) {
      items.push({ text: sec.heading.trim(), id: headingToId(sec.heading) });
    } else if (sec.type === "header" && sec.heading.trim()) {
      items.push({ text: sec.heading.trim(), id: headingToId(sec.heading) });
    }
  }
  return items;
}

/** Categories whose public pages render sections_json */
export const STRUCTURED_ARTICLE_CATEGORIES = ["radar", "taktik-lab", "listeler"] as const;

export function supportsStructuredSections(category: string): boolean {
  return (STRUCTURED_ARTICLE_CATEGORIES as readonly string[]).includes(category);
}
