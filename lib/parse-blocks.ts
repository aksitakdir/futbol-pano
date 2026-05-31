/**
 * Markdown-ish markup → block editor blocks.
 *
 * Lets an editor paste a single marked-up text and turn it into section
 * blocks instead of adding each block by hand. Pure & synchronous: player
 * lines are returned as names only; the caller resolves them against the
 * fc_players DB (semi-automatic), so this stays easy to test.
 *
 * Syntax (blank line separates blocks):
 *   # Heading            -> heading   (also ##, ###)
 *   plain text           -> paragraph (consecutive lines = one paragraph)
 *   > Quote              -> quote
 *   ![alt](url)          -> image
 *   @video: search words -> video (YouTube search query)
 *   @video: <id or url>  -> video (direct YouTube id)
 *   @player: Name, Name2 -> player card(s)
 */

export type ParsedBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "image"; url: string; alt: string }
  | { type: "video"; query: string; youtubeId: string }
  | { type: "player"; names: string[] };

const IMAGE_RE = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/;
const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;

/** Pull a YouTube id out of common URL shapes, else return null. */
function extractYoutubeId(value: string): string | null {
  if (YT_ID_RE.test(value)) return value;
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = value.match(re);
    if (m) return m[1];
  }
  return null;
}

function parseVideo(value: string): ParsedBlock {
  const v = value.trim();
  // A bare id or any recognizable YouTube URL -> direct id; otherwise search.
  if (!v.includes(" ")) {
    const id = extractYoutubeId(v);
    if (id) return { type: "video", query: "", youtubeId: id };
  }
  return { type: "video", query: v, youtubeId: "" };
}

/** Strip a leading directive marker like "# ", "> ", "@video:" from a line. */
function afterMarker(line: string, marker: RegExp): string {
  return line.replace(marker, "").trim();
}

export function parseMarkupToBlocks(input: string): ParsedBlock[] {
  const lines = (input ?? "").replace(/\r\n?/g, "\n").split("\n");
  const blocks: ParsedBlock[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length > 0) {
      const text = para.join(" ").replace(/\s+/g, " ").trim();
      if (text) blocks.push({ type: "paragraph", text });
      para = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (line === "") {
      flushPara();
      continue;
    }

    // Heading: #, ##, ###
    if (/^#{1,6}\s+/.test(line)) {
      flushPara();
      blocks.push({ type: "heading", text: afterMarker(line, /^#{1,6}\s+/) });
      continue;
    }

    // Quote
    if (/^>\s+/.test(line)) {
      flushPara();
      blocks.push({ type: "quote", text: afterMarker(line, /^>\s+/) });
      continue;
    }

    // Image ![alt](url)
    const img = line.match(IMAGE_RE);
    if (img) {
      flushPara();
      blocks.push({ type: "image", alt: img[1].trim(), url: img[2].trim() });
      continue;
    }

    // Video @video: ...
    if (/^@video:/i.test(line)) {
      flushPara();
      blocks.push(parseVideo(afterMarker(line, /^@video:/i)));
      continue;
    }

    // Player @player: Name1, Name2
    if (/^@player:/i.test(line)) {
      flushPara();
      const names = afterMarker(line, /^@player:/i)
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean);
      if (names.length > 0) blocks.push({ type: "player", names });
      continue;
    }

    // Plain text -> accumulate into a paragraph
    para.push(line);
  }

  flushPara();
  return blocks;
}
