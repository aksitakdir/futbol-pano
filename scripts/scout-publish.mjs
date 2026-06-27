#!/usr/bin/env node
/**
 * Scout Gamer — local content publisher.
 *
 * Reads an article brief JSON (written by the Scout Gamer Editor skill), parses
 * the block markup into sections_json, and inserts a row into `contents` using
 * the Supabase service-role key. No Anthropic API call happens here — the
 * content is authored by Claude Code (web search + editorial voice) and passed
 * in as `markup`, so this path costs $0 in API spend.
 *
 * Usage:
 *   node scripts/scout-publish.mjs <input.json>
 *
 * Input JSON shape:
 *   {
 *     "title": "string (required)",
 *     "category": "radar|tactics-lab|lists|wc-2026|transfer (required)",
 *     "markup": "block-markup string (required)",
 *     "slug": "optional — derived from title if omitted",
 *     "accent": "emerald|cyan|sky|rose|amber|lime (default emerald)",
 *     "hero_variant": "player-cards|cover-image|pitch-diagram|text-only",
 *     "player_name": "optional featured player",
 *     "youtube_query_1": "optional",
 *     "youtube_query_2": "optional",
 *     "news_query": "optional",
 *     "status": "pending|published (default pending)"
 *   }
 *
 * The markup parser below is a faithful mirror of lib/parse-blocks.ts. Keep the
 * two in sync if the block syntax ever changes.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// ---- env ----------------------------------------------------------------
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ---- markup parser (mirror of lib/parse-blocks.ts) ----------------------
const IMAGE_RE = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/;
const UL_RE = /^[-*]\s+(.+)$/;
const OL_RE = /^\d+[.)]\s+(.+)$/;

const afterMarker = (line, marker) => line.replace(marker, "").trim();
const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function inlineToHtml(text) {
  let s = escapeHtml(text);
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, label, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`,
  );
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return s;
}

function bodyToHtml(lines) {
  const text = lines.join(" ").replace(/\s+/g, " ").trim();
  return text ? `<p>${inlineToHtml(text)}</p>` : "";
}

function parseMarkupToBlocks(input) {
  const lines = (input ?? "").replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let para = [];
  let listItems = [];
  let listStyle = null;

  const flushPara = () => {
    if (para.length > 0) {
      const text = para.join(" ").replace(/\s+/g, " ").trim();
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
  const flushAll = () => { flushPara(); flushList(); };

  function collectBody(startIndex) {
    const body = [];
    let j = startIndex;
    while (j < lines.length && lines[j].trim() !== "") { body.push(lines[j].trim()); j++; }
    return [body, j];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") { flushAll(); continue; }

    const ul = line.match(UL_RE);
    const ol = line.match(OL_RE);
    if (ul || ol) {
      const style = ul ? "ul" : "ol";
      const item = (ul ? ul[1] : ol[1]).trim();
      flushPara();
      if (listStyle && listStyle !== style) flushList();
      listStyle = style;
      listItems.push(item);
      continue;
    }
    if (listItems.length > 0) flushList();

    if (/^@section:/i.test(line)) {
      flushAll();
      const heading = afterMarker(line, /^@section:/i);
      const [body, next] = collectBody(i + 1);
      blocks.push({ type: "section", heading, html: bodyToHtml(body) });
      i = next - 1; continue;
    }

    if (/^@vs:/i.test(line)) {
      flushAll();
      const rawHeader = afterMarker(line, /^@vs:/i);
      const splitHeader = (s) => (s.includes("|") ? s.split("|") : s.split(/\s+vs\.?\s+/i));
      const names = splitHeader(rawHeader);
      const leftName = (names[0] ?? "").trim();
      const rightName = (names[1] ?? "").trim();
      const left = { title: "", items: [] };
      const right = { title: "", items: [] };
      const [body, next] = collectBody(i + 1);
      for (let bi = 0; bi < body.length; bi++) {
        const raw = body[bi];
        const isBullet = /^[-*]\s+/.test(raw);
        const b = raw.replace(/^[-*]\s+/, "");
        const pipeIdx = b.indexOf("|");
        if (bi === 0 && !isBullet && pipeIdx !== -1) {
          left.title = b.slice(0, pipeIdx).trim();
          right.title = b.slice(pipeIdx + 1).trim();
          continue;
        }
        if (pipeIdx === -1) {
          if (b.trim()) { left.items.push(b.trim()); right.items.push(b.trim()); }
          continue;
        }
        const l = b.slice(0, pipeIdx).trim();
        const r = b.slice(pipeIdx + 1).trim();
        if (l) left.items.push(l);
        if (r) right.items.push(r);
      }
      if (left.items.length === 0) left.items.push("");
      if (right.items.length === 0) right.items.push("");
      blocks.push({ type: "vs", leftName, rightName, left, right });
      i = next - 1; continue;
    }

    if (/^@faq:/i.test(line)) {
      flushAll();
      const heading = afterMarker(line, /^@faq:/i);
      const [body, next] = collectBody(i + 1);
      const items = [];
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
      i = next - 1; continue;
    }

    if (/^@lead:/i.test(line)) {
      flushAll();
      const first = afterMarker(line, /^@lead:/i);
      const [rest, next] = collectBody(i + 1);
      blocks.push({ type: "intro", html: bodyToHtml([first, ...rest]) });
      i = next - 1; continue;
    }

    if (/^@callout:/i.test(line)) {
      flushAll();
      const first = afterMarker(line, /^@callout:/i);
      const [rest, next] = collectBody(i + 1);
      blocks.push({ type: "callout", html: bodyToHtml([first, ...rest]) });
      i = next - 1; continue;
    }

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

    if (/^>\s+/.test(line)) {
      flushAll();
      blocks.push({ type: "pullquote", text: afterMarker(line, /^>\s+/) });
      continue;
    }

    const img = line.match(IMAGE_RE);
    if (img) {
      flushAll();
      blocks.push({ type: "image", src: img[2].trim(), alt: img[1].trim() });
      continue;
    }

    if (/^@video:/i.test(line)) {
      flushAll();
      blocks.push({ type: "youtube", url: afterMarker(line, /^@video:/i) });
      continue;
    }

    if (/^@stat:/i.test(line)) {
      flushAll();
      const stats = [];
      let title;
      const firstText = afterMarker(line, /^@stat:/i);
      if (firstText.includes("|")) {
        const parts = firstText.split("|").map((s) => s.trim());
        if (parts[0]) stats.push({ value: parts[0], label: parts[1] ?? "", note: parts[2] || undefined });
      } else if (firstText.trim()) {
        title = firstText.trim();
      }
      const [body, next] = collectBody(i + 1);
      for (const raw of body) {
        const b = raw.replace(/^[-*]\s+/, "").trim();
        const parts = b.split("|").map((s) => s.trim());
        if (parts[0]) stats.push({ value: parts[0], label: parts[1] ?? "", note: parts[2] || undefined });
      }
      if (stats.length > 0) blocks.push({ type: "stat-highlight", title, stats });
      i = next - 1; continue;
    }

    if (/^@divider/i.test(line)) {
      flushAll();
      const stylePart = afterMarker(line, /^@divider:?/i).toLowerCase().trim();
      const style = ["dots", "gradient"].includes(stylePart) ? stylePart : "default";
      blocks.push({ type: "divider", style });
      continue;
    }

    if (/^@player:/i.test(line)) {
      flushAll();
      const names = afterMarker(line, /^@player:/i).split(",").map((n) => n.trim()).filter(Boolean);
      for (const name of names) blocks.push({ type: "player", name });
      continue;
    }

    para.push(line);
  }

  flushAll();
  return blocks;
}

// ---- helpers ------------------------------------------------------------
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const CATEGORIES = ["radar", "tactics-lab", "lists", "wc-2026", "transfer"];
const VALID_ACCENTS = ["emerald", "cyan", "sky", "rose", "amber", "lime"];
const VALID_HERO = ["player-cards", "cover-image", "pitch-diagram", "text-only"];

// ---- main ---------------------------------------------------------------
async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: node scripts/scout-publish.mjs <input.json>");
    process.exit(1);
  }

  let brief;
  try {
    brief = JSON.parse(readFileSync(inputPath, "utf8"));
  } catch (e) {
    console.error("Could not read/parse input JSON:", e.message);
    process.exit(1);
  }

  const title = (brief.title ?? "").trim();
  const category = (brief.category ?? "").trim();
  const markup = (brief.markup ?? "").trim();

  if (!title) { console.error("`title` is required"); process.exit(1); }
  if (!CATEGORIES.includes(category)) {
    console.error(`\`category\` must be one of: ${CATEGORIES.join(", ")}`);
    process.exit(1);
  }
  if (!markup) { console.error("`markup` is required"); process.exit(1); }

  const sectionsJson = parseMarkupToBlocks(markup);
  if (sectionsJson.length === 0) {
    console.error("Parsed markup produced 0 blocks — check the markup syntax.");
    process.exit(1);
  }

  // --dry: parse + validate only, never touch the DB
  if (process.argv.includes("--dry")) {
    console.log(JSON.stringify({
      ok: true,
      dryRun: true,
      title,
      category,
      blocks: sectionsJson.length,
      blockTypes: sectionsJson.map((b) => b.type),
      sections_json: sectionsJson,
    }, null, 2));
    return;
  }

  const slug = (brief.slug && brief.slug.trim()) ? brief.slug.trim() : slugify(title);
  const accent = VALID_ACCENTS.includes(brief.accent) ? brief.accent : "emerald";
  const hero_variant = VALID_HERO.includes(brief.hero_variant)
    ? brief.hero_variant
    : (category === "tactics-lab" ? "pitch-diagram" : "player-cards");
  const status = brief.status === "published" ? "published" : "pending";

  const hub_tags =
    category === "transfer" ? ["transfer"] :
    category === "wc-2026" ? ["wc-2026"] : [];

  const row = {
    title,
    title_en: title,
    slug,
    category,
    content: "",
    content_en: markup,
    sections_json: sectionsJson,
    status,
    hero_variant,
    accent,
    player_name: brief.player_name?.trim() || null,
    youtube_query_1: brief.youtube_query_1?.trim() || null,
    youtube_query_2: brief.youtube_query_2?.trim() || null,
    news_query: brief.news_query?.trim() || title,
    hub_tags,
  };

  const { data, error } = await supabase.from("contents").insert(row).select("id, slug").single();

  if (error) {
    console.error("DB insert failed:", error.message);
    process.exit(1);
  }

  console.log(JSON.stringify({
    ok: true,
    id: data.id,
    slug: data.slug,
    category,
    status,
    blocks: sectionsJson.length,
    admin_edit: `/admin/edit/${data.id}`,
  }, null, 2));
}

main();
