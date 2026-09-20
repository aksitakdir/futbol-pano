#!/usr/bin/env node
/**
 * Scout Gamer — social pack generator.
 *
 *   node scripts/social-pack.mjs <slug|id> [<slug|id> ...] [--out <file.md>]
 *
 * Why this exists
 * ---------------
 * A social strategy was agreed on 2026-08-01 and nothing was posted for seven
 * weeks. The reason was not the plan and not laziness: it was the blank page.
 * An article goes live, and turning it into a Reddit comment, five X replies and
 * a carousel is a second job that starts from nothing every time — so it gets
 * left for tomorrow, every day.
 *
 * This removes that. It reads the published article and cuts the material the
 * piece already contains into the shapes each platform wants.
 *
 * What it is NOT
 * --------------
 * It does not write. Every fact in the output is lifted verbatim from the
 * article's own blocks — the stat rows, the callouts, the vs comparisons, the
 * closing quote. The only text this script adds is scaffolding (line breaks,
 * a question, a call to read). If a piece has no numbers in it, the pack will
 * be thin and will say so under GAPS, rather than inventing a number to fill
 * the space. That is the same rule the publish gate enforces upstream.
 *
 * The extraction itself lives in lib/social-extract.mjs, shared with the admin
 * panel so the two can never drift.
 *
 * Every draft is a draft. Read it before it leaves the machine.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "fs";
import {
  X_LIMIT,
  CATEGORY_PATHS as PATHS,
  extract,
  sentences,
  buildCards,
  routeSubs,
  haystackOf,
  gapsOf,
} from "../lib/social-extract.mjs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const BASE = "https://www.scoutgamer.com";

const fits = (s) => `${s.length > X_LIMIT ? "OVER" : "ok"} ${String(s.length).padStart(3)}`;

// ---- pack builders ------------------------------------------------------

function buildCardSection(cards) {
  const out = ["## 0. Cards — open, screenshot, post\n"];
  if (cards.length === 0) {
    out.push("_This piece has no stat block, vs block, pull quote or player list to draw._");
    out.push("_Style A (cover card) from the admin panel is the only option here._\n");
    return out.join("\n");
  }
  out.push("None of these needs a cover image. Add `&format=square` or `&format=story` for");
  out.push("Instagram. The cover card in the admin panel is unchanged and still there.\n");
  for (const c of cards) out.push(`- **${c.label}**\n  ${c.url}`);
  out.push("");
  return out.join("\n");
}

function buildReddit(row, url, m, haystack) {
  const out = [];
  const subs = routeSubs(haystack);

  out.push("## 1. Reddit — the lane that can return traffic this week\n");
  out.push("Interest graph, not follower graph, and indexed. Value first; a link only where");
  out.push("the sub's own rules allow one. Read those rules before every first post.\n");
  out.push("**Candidate subs**\n");
  for (const s of subs) out.push(`- \`${s.sub}\`${s.note ? ` — ${s.note}` : ""}`);
  out.push("");

  // The angle: the sharpest thing in the piece is almost always a callout or the closer.
  const angle = m.callouts[0] || m.pullquotes[0] || m.lead;
  out.push("**Title draft** (no clickbait, Reddit punishes it)\n");
  out.push("```");
  out.push(row.title);
  out.push("```\n");

  out.push("**Comment / text-post body** — every line below is quoted from the article\n");
  out.push("```");
  if (angle) out.push(angle);
  if (m.stats.length) {
    out.push("");
    for (const s of m.stats.slice(0, 4)) {
      out.push(`${s.value} — ${s.label}${s.note ? ` (${s.note})` : ""}`);
    }
  }
  const c = m.contrasts[0];
  if (c?.rows.length) {
    out.push("");
    out.push(`${c.left} vs ${c.right}:`);
    for (const [l, r] of c.rows.slice(0, 4)) out.push(`- ${l} / ${r}`);
  }
  if (m.pullquotes[0] && m.pullquotes[0] !== angle) {
    out.push("");
    out.push(m.pullquotes[0]);
  }
  out.push("```\n");
  out.push(`Link, only where permitted: ${url}\n`);
  return out.join("\n");
}

function buildX(row, url, m) {
  const out = [];
  out.push("## 2. X — replies carry, posts do not\n");
  out.push("At zero followers a link post reaches nobody; the reply inside somebody else's");
  out.push("thread is the entire mechanism. Target 5–10 a day. None of the reply lines below");
  out.push("contain a link, by design.\n");

  out.push("**Reply lines** (drop into a relevant thread, unprompted links kill reach)\n");
  const lines = [];
  for (const s of m.stats) {
    const t = `${s.value} — ${s.label}.${s.note ? ` ${s.note}.` : ""}`;
    if (t.length <= X_LIMIT) lines.push(t);
  }
  for (const c of m.contrasts) {
    for (const [l, r] of c.rows.slice(0, 3)) {
      if (!l || !r) continue;
      const t = `${c.left}: ${l}\n${c.right}: ${r}`;
      if (t.length <= X_LIMIT) lines.push(t);
    }
  }
  for (const f of m.faqs) {
    const t = `${f.q} ${f.a}`;
    if (t.length <= X_LIMIT) lines.push(t);
  }
  for (const s of m.sections) {
    if (s.deck && s.deck.length <= X_LIMIT && s.deck.length > 40) lines.push(s.deck);
  }

  const seen = new Set();
  const unique = lines.filter((l) => !seen.has(l) && seen.add(l));
  if (unique.length === 0) {
    out.push("_Nothing short and self-contained in this piece. Write these by hand._\n");
  } else {
    for (const l of unique.slice(0, 10)) {
      out.push("```");
      out.push(l);
      out.push("```");
      out.push(`\`${fits(l)} chars\`\n`);
    }
  }

  out.push("**The 20% — one post with the link**\n");
  const hookSource = m.pullquotes[0] || m.callouts[0] || m.lead;
  const hook = sentences(hookSource)[0] ?? row.title;
  const post = `${hook}\n\n${url}`;
  out.push("```");
  out.push(post);
  out.push("```");
  out.push(`\`${fits(post)} chars\`\n`);
  return out.join("\n");
}

function buildCarousel(row, m) {
  const out = [];
  out.push("## 3. Instagram carousel — no video needed\n");

  const slides = [];
  slides.push({ label: "Cover", text: row.title });
  for (const s of m.stats.slice(0, 3)) {
    slides.push({ label: s.label || "Stat", text: `${s.value}\n${s.label}${s.note ? `\n${s.note}` : ""}` });
  }
  for (const p of m.players.slice(0, 7)) {
    const sec = m.sections.find((x) => x.heading.includes(p) || x.body.includes(p));
    slides.push({ label: p, text: sec?.deck ? `${p}\n${sec.deck}` : p });
  }
  if (m.players.length === 0) {
    for (const s of m.sections.slice(0, 5)) {
      if (s.heading && s.deck) slides.push({ label: s.heading, text: `${s.heading}\n${s.deck}` });
    }
  }
  const closer = m.pullquotes[m.pullquotes.length - 1] || m.callouts[m.callouts.length - 1];
  if (closer) slides.push({ label: "Closer", text: closer });

  if (slides.length < 3) {
    out.push("_Too little structure to slice into slides. This piece is prose-led._\n");
    return out.join("\n");
  }
  slides.forEach((s, i) => {
    out.push(`**Slide ${i + 1} — ${s.label}**\n`);
    out.push("```");
    out.push(s.text);
    out.push("```\n");
  });
  out.push("Card format: keep the existing Social Card Studio layout. The player-card");
  out.push("variant is an addition, never a replacement.\n");
  return out.join("\n");
}

function buildVideo(row, m) {
  const out = [];
  out.push("## 4. Short video — 8–16 seconds, one cut\n");
  out.push("One video, three surfaces: TikTok + Reels + Shorts. The only lane that grows a");
  out.push("follower count from zero.\n");

  // The house formats. Pick the one the material actually supports rather than
  // printing all three and leaving the choice to a tired evening.
  const hasCardGap = /no player card|not in the (game|database)|no card|zero .* players|age floor/i.test(
    [m.lead, ...m.callouts].join(" "),
  );
  const format = hasCardGap ? "the game is wrong" : m.players.length >= 5 ? "deep cut" : "the receipt";
  out.push(`**Format:** ${format}\n`);

  const beats = [];
  const opener = sentences(m.lead)[0];
  if (opener) beats.push(["0–3s", opener]);
  if (m.stats[0]) beats.push(["3–7s", `${m.stats[0].value} — ${m.stats[0].label}`]);
  if (m.stats[1]) beats.push(["7–11s", `${m.stats[1].value} — ${m.stats[1].label}`]);
  const last = m.pullquotes[m.pullquotes.length - 1] || m.callouts[m.callouts.length - 1];
  if (last) beats.push(["11–16s", sentences(last).slice(-1)[0] ?? last]);

  if (beats.length < 2) {
    out.push("_Not enough countable material for a 16-second cut. Skip video for this one._\n");
    return out.join("\n");
  }
  out.push("```");
  for (const [t, line] of beats) out.push(`${t.padEnd(8)} ${line}`);
  out.push("```\n");
  out.push("Open decision from August, still open: silent with text on screen, or voiced?");
  out.push("It decides how dense these cards can be.\n");
  return out.join("\n");
}

// ---- main ---------------------------------------------------------------

async function packFor(supabase, key) {
  const isId = /^\d+$/.test(key);
  const { data: row } = await supabase
    .from("contents")
    .select("id,slug,title,category,status,cover_image,player_name,sections_json")
    .eq(isId ? "id" : "slug", isId ? Number(key) : key)
    .maybeSingle();

  if (!row) return { error: `No article with ${isId ? "id" : "slug"} "${key}".` };

  const path = PATHS[row.category] ?? "/radar";
  const url = `${BASE}${path}/${row.slug}`;
  const m = extract(row.sections_json);
  const haystack = haystackOf(row, m);
  const gaps = gapsOf(row, m);

  const head = [
    `# Social pack — ${row.title}`,
    "",
    `${url}`,
    `${row.category} · id ${row.id} · ${row.status}`,
    "",
    "Everything quoted below is lifted from the article. Nothing here was written by the",
    "generator. Read it before it leaves the machine.",
    "",
    "---",
    "",
  ].join("\n");

  const tail =
    gaps.length > 0
      ? ["---", "", "## GAPS", "", ...gaps.map((g) => `- ${g}`), ""].join("\n")
      : ["---", "", "## GAPS", "", "None. Every lane has material.", ""].join("\n");

  return {
    text: [
      head,
      buildCardSection(buildCards(row, m, BASE)),
      "---\n",
      buildReddit(row, url, m, haystack),
      "---\n",
      buildX(row, url, m),
      "---\n",
      buildCarousel(row, m),
      "---\n",
      buildVideo(row, m),
      tail,
    ].join("\n"),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf("--out");
  const outFile = outIdx >= 0 ? args[outIdx + 1] : null;
  const keys = args.filter(
    (a, i) => !a.startsWith("--") && !(outIdx >= 0 && i === outIdx + 1),
  );

  if (keys.length === 0) {
    console.error("Usage: node scripts/social-pack.mjs <slug|id> [...] [--out file.md]");
    process.exit(1);
  }

  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const parts = [];
  let failed = false;
  for (const key of keys) {
    const res = await packFor(supabase, key);
    if (res.error) {
      console.error(res.error);
      failed = true;
      continue;
    }
    parts.push(res.text);
  }

  const doc = parts.join("\n\n\\pagebreak\n\n");
  if (outFile) {
    writeFileSync(outFile, doc);
    console.log(`Wrote ${outFile} (${parts.length} pack${parts.length === 1 ? "" : "s"}).`);
  } else {
    console.log(doc);
  }
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
