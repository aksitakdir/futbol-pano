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
 *     "status": "pending|published (default pending)",
 *     "confirmed_deal": {                  // optional — files a Confirmed Deals row
 *       "player_name": "...", "from_club": "...", "to_club": "...",
 *       "fee": "£40m | Free | Loan | Undisclosed", "transfer_date": "YYYY-MM-DD",
 *       "is_published": true
 *     }
 *   }
 *
 * A brief may carry an article, a confirmed_deal, or both. A deal-only brief
 * (no markup) just files the Confirmed Deals row.
 *
 * The markup parser below is a faithful mirror of lib/parse-blocks.ts. Keep the
 * two in sync if the block syntax ever changes.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { runPreflight } from "./preflight.mjs";

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

    /**
     * @table: caption            — pipe-separated, first body line is the header row
     * @table:ranked caption      — same, with a coral 01, 02 … down the left
     *
     * Use it when the rows are records rather than sentences: name, club and two
     * ratings read as a spreadsheet when they are written as ten list items, and the
     * eye cannot compare the numbers because they never land in the same place.
     */
    if (/^@table\b/i.test(line)) {
      flushAll();
      const head = afterMarker(line, /^@table(:ranked)?:?/i).trim();
      const ranked = /^@table:ranked/i.test(line);
      const [body, next] = collectBody(i + 1);
      const rows = body
        .map((raw) => raw.replace(/^[-*]\s+/, "").trim())
        .filter((b) => b && !/^\|?\s*[-:| ]+\s*\|?$/.test(b)) // tolerate a markdown separator row
        .map((b) => b.replace(/^\||\|$/g, "").split("|").map((s) => s.trim()));
      if (rows.length >= 2) {
        const columns = rows[0];
        blocks.push({ type: "table", caption: head || undefined, columns, rows: rows.slice(1), ranked });
      }
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
// Mirror of lib/slugify.ts — keep the two in sync (this script runs as a
// standalone Node process and can't import the TS module).
const MAX_SLUG_LENGTH = 80;
function slugify(text, maxLength = MAX_SLUG_LENGTH) {
  const base = text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (base.length <= maxLength) return base;

  const cut = base.slice(0, maxLength);
  const lastDash = cut.lastIndexOf("-");
  const wordSafe = lastDash > 0 ? cut.slice(0, lastDash) : cut;
  return wordSafe.replace(/-+$/g, "");
}

const CATEGORIES = ["radar", "tactics-lab", "lists", "wc-2026", "transfer"];

/** Mirrors lib/category-config.ts — the URL folder each category lives under. */
const CATEGORY_PATHS = {
  radar: "radar",
  lists: "lists",
  "tactics-lab": "tactics-lab",
  "wc-2026": "world-cup-2026",
  transfer: "transfers",
};

/**
 * Article pages are prerendered for a day and Vercel's ISR cache survives deploys, so
 * writing a corrected row to Supabase changes nothing a reader can see until the window
 * elapses. The admin panel revalidates in the same action that saves; this script writes
 * from a terminal and used to skip it entirely — a fix could sit invisible for 24 hours
 * while Google crawled the version it replaced. Never fail a publish over this: the row
 * is already written, and a stale page is a smaller problem than a confusing exit code.
 */
async function revalidate(category, slug) {
  const folder = CATEGORY_PATHS[category];
  const base = (env.SITE_URL || "https://www.scoutgamer.com").replace(/\/$/, "");
  if (!folder || !env.ADMIN_PASSWORD) {
    console.log("  note     Skipped cache revalidation (no ADMIN_PASSWORD in .env.local); the page may serve old HTML for up to a day.");
    return;
  }
  const paths = ["/", `/${folder}`, `/${folder}/${slug}`];
  try {
    const res = await fetch(`${base}/api/revalidate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Basic ${Buffer.from(`scout:${env.ADMIN_PASSWORD}`).toString("base64")}`,
      },
      body: JSON.stringify({ paths }),
    });
    if (res.ok) console.log(`  note     Revalidated ${paths.join(", ")} — the change is live now, not in 24 hours.`);
    else console.log(`  note     Revalidation returned HTTP ${res.status}; the page may serve old HTML for up to a day.`);
  } catch (e) {
    console.log(`  note     Revalidation could not be reached (${e.message}); the page may serve old HTML for up to a day.`);
  }
}
const VALID_ACCENTS = ["emerald", "cyan", "sky", "rose", "amber", "lime"];
const VALID_HERO = ["player-cards", "cover-image", "pitch-diagram", "text-only"];

/**
 * Validate + normalize an optional confirmed-deal object into a
 * hub_completed_transfers row. Returns null if absent; exits on bad input.
 * The site is English-only, so the legacy fee_tr column mirrors fee_en.
 */
function validateDeal(raw) {
  if (!raw || typeof raw !== "object") return null;
  const playerName = (raw.player_name ?? "").trim();
  const fromClub = (raw.from_club ?? "").trim();
  const toClub = (raw.to_club ?? "").trim();
  const fee = (raw.fee ?? raw.fee_en ?? "").trim();
  const date = (raw.transfer_date ?? "").trim();

  const missing = [];
  if (!playerName) missing.push("player_name");
  if (!fromClub) missing.push("from_club");
  if (!toClub) missing.push("to_club");
  if (!date) missing.push("transfer_date");
  if (missing.length) {
    console.error(`confirmed_deal missing required field(s): ${missing.join(", ")}`);
    process.exit(1);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error(`confirmed_deal.transfer_date must be YYYY-MM-DD (got "${date}")`);
    process.exit(1);
  }

  return {
    player_name: playerName,
    from_club: fromClub,
    to_club: toClub,
    fee_en: fee,
    fee_tr: fee, // legacy column kept in sync (English-only site)
    transfer_date: date,
    sort_order: Number.isFinite(raw.sort_order) ? raw.sort_order : 0,
    is_published: raw.is_published === false ? false : true,
    source: "manual", // not "seed" — the public strip filters seed rows out
    updated_at: new Date().toISOString(),
  };
}

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
  const deal = validateDeal(brief.confirmed_deal);
  const hasArticle = Boolean(markup);

  // A brief must produce at least one of: an article, or a confirmed deal.
  if (!hasArticle && !deal) {
    console.error("Brief must include `markup` (an article) and/or `confirmed_deal`.");
    process.exit(1);
  }

  let sectionsJson = [];
  if (hasArticle) {
    if (!title) { console.error("`title` is required for an article"); process.exit(1); }
    if (!CATEGORIES.includes(category)) {
      console.error(`\`category\` must be one of: ${CATEGORIES.join(", ")}`);
      process.exit(1);
    }
    sectionsJson = parseMarkupToBlocks(markup);
    if (sectionsJson.length === 0) {
      console.error("Parsed markup produced 0 blocks — check the markup syntax.");
      process.exit(1);
    }
  }

  // ---- pre-publish gate --------------------------------------------------
  // Factual checks the editor must have done, enforced rather than advised.
  // See scripts/preflight.mjs for why each rule exists. Runs on --dry too, so
  // the gate is visible before anything is written.
  if (hasArticle) {
    const { blockers, warnings, notes } = await runPreflight({
      brief,
      sectionsJson,
      supabase,
    });

    for (const w of warnings) console.error(`  warning  ${w}`);
    for (const n of notes) console.error(`  note     ${n}`);

    if (blockers.length) {
      console.error(`\nPreflight failed — ${blockers.length} blocker(s):\n`);
      for (const b of blockers) console.error(`  BLOCKED  ${b}`);
      console.error(
        "\nThese are not warnings. Fix the article or fill in the brief, then run again.\n",
      );
      process.exit(1);
    }
    console.error("  preflight OK\n");
  }

  // --dry: parse + validate only, never touch the DB
  if (process.argv.includes("--dry")) {
    console.log(JSON.stringify({
      ok: true,
      dryRun: true,
      article: hasArticle ? {
        title, category,
        blocks: sectionsJson.length,
        blockTypes: sectionsJson.map((b) => b.type),
        sections_json: sectionsJson,
      } : null,
      confirmed_deal: deal ?? null,
    }, null, 2));
    return;
  }

  const out = {};

  // ---- confirmed deal (hub_completed_transfers) ----
  if (deal) {
    const { data, error } = await supabase
      .from("hub_completed_transfers")
      .insert(deal)
      .select("id, player_name")
      .single();
    if (error) {
      console.error("Confirmed-deal insert failed:", error.message);
      process.exit(1);
    }
    out.confirmed_deal = {
      id: data.id,
      player: data.player_name,
      published: deal.is_published,
      shows_in: "/transfers (Confirmed Deals strip)",
    };
    if (!hasArticle) {
      console.log(JSON.stringify({ ok: true, ...out }, null, 2));
      return;
    }
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

  // --update <id>: overwrite an existing article instead of inserting a new one
  const updateFlag = process.argv.indexOf("--update");
  const updateId = updateFlag !== -1 ? process.argv[updateFlag + 1] : null;

  if (updateId) {
    /*
     * A brief keeps saying "pending" long after the article it describes went live —
     * the status in the file is where the piece started, not where it is now. Writing
     * it back on an --update would quietly unpublish a page that is indexed, linked
     * from six other articles and sitting in Google's queue, and nothing in the output
     * would say so. Never demote a live article by accident; --unpublish means it.
     */
    const { data: current } = await supabase
      .from("contents")
      .select("status")
      .eq("id", updateId)
      .maybeSingle();

    if (current?.status === "published" && status !== "published") {
      if (process.argv.includes("--unpublish")) {
        console.log("  note     --unpublish given: taking a live article offline.");
      } else {
        row.status = "published";
        console.log('  note     Article is live; keeping it published (the brief still says "pending"). Pass --unpublish to take it down.');
      }
    }

    const { data, error } = await supabase
      .from("contents")
      .update(row)
      .eq("id", updateId)
      .select("id, slug, status")
      .single();
    if (error) {
      console.error("DB update failed:", error.message);
      process.exit(1);
    }
    if (data.status === "published") await revalidate(category, data.slug);

    console.log(JSON.stringify({
      ok: true, updated: true, id: data.id, slug: data.slug,
      category, status: data.status, blocks: sectionsJson.length,
      admin_edit: `/admin/edit/${data.id}`,
      ...out,
    }, null, 2));
    return;
  }

  const { data, error } = await supabase.from("contents").insert(row).select("id, slug").single();

  if (error) {
    console.error("DB insert failed:", error.message);
    process.exit(1);
  }

  if (status === "published") await revalidate(category, data.slug);

  console.log(JSON.stringify({
    ok: true,
    id: data.id,
    slug: data.slug,
    category,
    status,
    blocks: sectionsJson.length,
    admin_edit: `/admin/edit/${data.id}`,
    ...out,
  }, null, 2));
}

main();
