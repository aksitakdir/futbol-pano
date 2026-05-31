import type { SectionBlock } from "@/lib/section-blocks";

/**
 * Markdown-ish markup → block-editor blocks (SectionBlock[]).
 *
 * Lets an editor paste one marked-up text and turn it into section blocks
 * instead of adding each block by hand. Pure & synchronous. Player blocks
 * carry only a name; the editor's existing player search resolves them
 * (semi-automatic), so no DB lookup happens here.
 *
 * Syntax (a blank line separates blocks):
 *   # Heading            -> header (H2, shows in TOC)
 *   ## Heading           -> header (H3)
 *   plain text           -> plain  (consecutive lines = one paragraph)
 *   > Quote              -> pullquote
 *   - item / * item      -> list (ul; consecutive items grouped)
 *   1. item              -> list (ol; consecutive items grouped)
 *   ![alt](url)          -> image
 *   @video: <url or id>  -> youtube
 *   @player: Name, Name2 -> one player block per name
 *   @lead: text          -> intro (lead paragraph)
 *   @callout: text       -> callout (info box)
 */

const IMAGE_RE = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/;
const UL_RE = /^[-*]\s+(.+)$/;
const OL_RE = /^\d+[.)]\s+(.+)$/;

function afterMarker(line: string, marker: RegExp): string {
  return line.replace(marker, "").trim();
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function parseMarkupToBlocks(input: string): SectionBlock[] {
  const lines = (input ?? "").replace(/\r\n?/g, "\n").split("\n");
  const blocks: SectionBlock[] = [];

  let para: string[] = [];
  let listItems: string[] = [];
  let listStyle: "ul" | "ol" | null = null;

  const flushPara = () => {
    if (para.length > 0) {
      const text = para.join("\n").trim();
      if (text) blocks.push({ type: "plain", text });
      para = [];
    }
  };
  const flushList = () => {
    if (listItems.length > 0 && listStyle) {
      blocks.push({ type: "list", style: listStyle, items: listItems });
    }
    listItems = [];
    listStyle = null;
  };
  const flushAll = () => {
    flushPara();
    flushList();
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (line === "") {
      flushAll();
      continue;
    }

    // List items (group consecutive lines of the same style)
    const ul = line.match(UL_RE);
    const ol = line.match(OL_RE);
    if (ul || ol) {
      const style: "ul" | "ol" = ul ? "ul" : "ol";
      const item = (ul ? ul[1] : ol![1]).trim();
      flushPara();
      if (listStyle && listStyle !== style) flushList();
      listStyle = style;
      listItems.push(item);
      continue;
    }
    if (listItems.length > 0) flushList();

    // Headings: # -> H2, ## or more -> H3
    if (/^#\s+/.test(line)) {
      flushAll();
      blocks.push({ type: "header", heading: afterMarker(line, /^#\s+/), level: 2 });
      continue;
    }
    if (/^#{2,6}\s+/.test(line)) {
      flushAll();
      blocks.push({ type: "header", heading: afterMarker(line, /^#{2,6}\s+/), level: 3 });
      continue;
    }

    // Quote
    if (/^>\s+/.test(line)) {
      flushAll();
      blocks.push({ type: "pullquote", text: afterMarker(line, /^>\s+/) });
      continue;
    }

    // Image
    const img = line.match(IMAGE_RE);
    if (img) {
      flushAll();
      blocks.push({ type: "image", src: img[2].trim(), alt: img[1].trim() });
      continue;
    }

    // Video -> youtube (url or id, stored as-is)
    if (/^@video:/i.test(line)) {
      flushAll();
      blocks.push({ type: "youtube", url: afterMarker(line, /^@video:/i) });
      continue;
    }

    // Player(s) — one block per comma-separated name
    if (/^@player:/i.test(line)) {
      flushAll();
      const names = afterMarker(line, /^@player:/i)
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean);
      for (const name of names) blocks.push({ type: "player", name });
      continue;
    }

    // Lead paragraph
    if (/^@lead:/i.test(line)) {
      flushAll();
      blocks.push({ type: "intro", html: `<p>${escapeHtml(afterMarker(line, /^@lead:/i))}</p>` });
      continue;
    }

    // Callout
    if (/^@callout:/i.test(line)) {
      flushAll();
      blocks.push({ type: "callout", html: `<p>${escapeHtml(afterMarker(line, /^@callout:/i))}</p>` });
      continue;
    }

    // Plain text
    para.push(line);
  }

  flushAll();
  return blocks;
}
