import type { SectionBlock } from "@/lib/section-blocks";

/**
 * Markdown-ish markup → block-editor blocks (SectionBlock[]).
 *
 * Lets an editor paste one marked-up text and turn it into section blocks
 * instead of adding each block by hand. Pure & synchronous. Player blocks
 * carry only a name; the editor's existing player search resolves them
 * (semi-automatic), so no DB lookup happens here.
 *
 * Block syntax (a blank line separates blocks):
 *   # Heading              -> header (H2, shows in TOC)
 *   ## Heading             -> header (H3)
 *   plain text             -> plain  (consecutive lines = one paragraph)
 *   > Quote                -> pullquote
 *   - item / * item        -> list (ul; consecutive items grouped)
 *   1. item                -> list (ol; consecutive items grouped)
 *   ![alt](url)            -> image
 *   @video: <url or id>    -> youtube
 *   @player: Name, Name2   -> one player block per name
 *   @lead: text…           -> intro   (lead paragraph; multi-line until blank)
 *   @callout: text…        -> callout (info box; multi-line until blank)
 *   @section: Heading      -> section (heading + body; body = lines until blank)
 *     body line…
 *   @vs: Left | Right      -> versus (two columns); body lines "L | R" = points
 *     point A | point B
 *   @faq: Optional heading -> FAQ; body lines "Q? answer" or "Q | A"
 *     Question? Answer text
 *
 * Inline formatting (only in HTML-rendered blocks — plain / intro / callout /
 * section body; not in headings, quotes, or list items):
 *   **bold**   *italic*   [text](url)
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

/** Convert **bold**, *italic*, [text](url) to HTML (escaping the rest). */
export function inlineToHtml(text: string): string {
  let s = escapeHtml(text);
  // links first, so * inside URLs isn't treated as emphasis
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, label, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`,
  );
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return s;
}

/** Join collected body lines into one inline-formatted <p> (empty -> ""). */
function bodyToHtml(lines: string[]): string {
  const text = lines.join(" ").replace(/\s+/g, " ").trim();
  return text ? `<p>${inlineToHtml(text)}</p>` : "";
}

export function parseMarkupToBlocks(input: string): SectionBlock[] {
  const lines = (input ?? "").replace(/\r\n?/g, "\n").split("\n");
  const blocks: SectionBlock[] = [];

  let para: string[] = [];
  let listItems: string[] = [];
  let listStyle: "ul" | "ol" | null = null;

  const flushPara = () => {
    if (para.length > 0) {
      const text = para.join(" ").replace(/\s+/g, " ").trim();
      // plain renders through plainTextToHtml, which passes HTML through, so
      // inline markup becomes real tags.
      if (text) blocks.push({ type: "plain", text: inlineToHtml(text) });
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

  /** Collect following non-blank lines (advancing i). Returns [lines, newIndex]. */
  function collectBody(startIndex: number): [string[], number] {
    const body: string[] = [];
    let j = startIndex;
    while (j < lines.length && lines[j].trim() !== "") {
      body.push(lines[j].trim());
      j++;
    }
    return [body, j];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

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

    // Section: heading line + following body lines until a blank line
    if (/^@section:/i.test(line)) {
      flushAll();
      const heading = afterMarker(line, /^@section:/i);
      const [body, next] = collectBody(i + 1);
      blocks.push({ type: "section", heading, html: bodyToHtml(body) });
      i = next - 1;
      continue;
    }

    // Versus: @vs: Left Title | Right Title, then body lines.
    // Body lines "L | R" become paired bullet points (either side may be empty).
    if (/^@vs:/i.test(line)) {
      flushAll();
      const titles = afterMarker(line, /^@vs:/i).split("|");
      const left = { title: (titles[0] ?? "").trim(), items: [] as string[] };
      const right = { title: (titles[1] ?? "").trim(), items: [] as string[] };
      const [body, next] = collectBody(i + 1);
      for (const raw of body) {
        const b = raw.replace(/^[-*]\s+/, "");
        const [l, r] = b.split("|");
        if ((l ?? "").trim()) left.items.push(l.trim());
        if ((r ?? "").trim()) right.items.push(r.trim());
      }
      if (left.items.length === 0) left.items.push("");
      if (right.items.length === 0) right.items.push("");
      blocks.push({ type: "vs", left, right });
      i = next - 1;
      continue;
    }

    // FAQ: @faq: optional heading, then body lines.
    // Each body line "Q? answer" (split on first "?") or "Q | A" is one item.
    if (/^@faq:/i.test(line)) {
      flushAll();
      const heading = afterMarker(line, /^@faq:/i);
      const [body, next] = collectBody(i + 1);
      const items: { q: string; a: string }[] = [];
      for (const raw of body) {
        const b = raw.replace(/^[-*]\s+/, "").trim();
        if (!b) continue;
        if (b.includes("|")) {
          const [q, ...a] = b.split("|");
          items.push({ q: q.trim(), a: a.join("|").trim() });
        } else if (b.includes("?")) {
          const idx = b.indexOf("?");
          items.push({ q: b.slice(0, idx + 1).trim(), a: b.slice(idx + 1).trim() });
        } else {
          items.push({ q: b, a: "" });
        }
      }
      if (items.length > 0) blocks.push({ type: "faq", heading: heading || undefined, items });
      i = next - 1;
      continue;
    }

    // Lead paragraph: first-line content + following lines until blank
    if (/^@lead:/i.test(line)) {
      flushAll();
      const first = afterMarker(line, /^@lead:/i);
      const [rest, next] = collectBody(i + 1);
      blocks.push({ type: "intro", html: bodyToHtml([first, ...rest]) });
      i = next - 1;
      continue;
    }

    // Callout: first-line content + following lines until blank
    if (/^@callout:/i.test(line)) {
      flushAll();
      const first = afterMarker(line, /^@callout:/i);
      const [rest, next] = collectBody(i + 1);
      blocks.push({ type: "callout", html: bodyToHtml([first, ...rest]) });
      i = next - 1;
      continue;
    }

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

    // Quote (plain text — rendered as React text, no inline HTML)
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

    // Stat highlight: @stat: Title (optional, no pipe) then lines of value | label | note
    if (/^@stat:/i.test(line)) {
      flushAll();
      const stats: { value: string; label: string; note?: string }[] = [];
      let title: string | undefined;
      // First line — if it contains "|" it's a stat, otherwise it's the title
      const firstText = afterMarker(line, /^@stat:/i);
      if (firstText.includes("|")) {
        const parts = firstText.split("|").map((s) => s.trim());
        if (parts[0]) stats.push({ value: parts[0], label: parts[1] ?? "", note: parts[2] || undefined });
      } else if (firstText.trim()) {
        title = firstText.trim();
      }
      // Collect following stat lines (- prefixed or plain "value | label" lines)
      const [body, next] = collectBody(i + 1);
      for (const raw of body) {
        const b = raw.replace(/^[-*]\s+/, "").trim();
        const parts = b.split("|").map((s) => s.trim());
        if (parts[0]) stats.push({ value: parts[0], label: parts[1] ?? "", note: parts[2] || undefined });
      }
      if (stats.length > 0) blocks.push({ type: "stat-highlight", title, stats });
      i = next - 1;
      continue;
    }

    // Divider: @divider or @divider: style
    if (/^@divider/i.test(line)) {
      flushAll();
      const stylePart = afterMarker(line, /^@divider:?/i).toLowerCase().trim();
      const style = (["dots", "gradient"].includes(stylePart) ? stylePart : "default") as "default" | "dots" | "gradient";
      blocks.push({ type: "divider", style });
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

    // Plain text
    para.push(line);
  }

  flushAll();
  return blocks;
}
