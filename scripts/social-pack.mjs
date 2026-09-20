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
 * Every draft is a draft. Read it before it leaves the machine.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "fs";

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
const X_LIMIT = 280;

const PATHS = {
  radar: "/radar",
  lists: "/lists",
  "tactics-lab": "/tactics-lab",
  transfer: "/transfers",
  "wc-2026": "/world-cup-2026",
};

// ---- text helpers -------------------------------------------------------

const strip = (s) =>
  String(s ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

/** First sentence, respecting the decimals and initials that football prose is full of. */
function firstSentence(text) {
  const t = strip(text);
  const m = t.match(/^.*?[.!?](?=\s+[A-Z“"']|$)/s);
  return (m ? m[0] : t).trim();
}

function sentences(text) {
  return strip(text)
    .split(/(?<=[.!?])\s+(?=[A-Z“"'])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const fits = (s) => `${s.length > X_LIMIT ? "OVER" : "ok"} ${String(s.length).padStart(3)}`;

// ---- material extraction ------------------------------------------------

/**
 * Pull everything quotable out of sections_json. Nothing is rephrased here;
 * this is a filing exercise, not a writing one.
 */
function extract(blocks) {
  const m = {
    lead: "",
    stats: [],      // { value, label, note }
    callouts: [],
    pullquotes: [],
    contrasts: [],  // { left, right, rows: [[l, r]] }
    tables: [],
    faqs: [],
    sections: [],   // { heading, deck, body }
    players: [],
    listItems: [],
  };

  for (const b of blocks ?? []) {
    switch (b?.type) {
      case "intro":
        if (!m.lead) m.lead = strip(b.html);
        break;
      case "plain":
        if (!m.lead) m.lead = strip(b.text);
        break;
      case "callout":
        m.callouts.push(strip(b.html));
        break;
      case "pullquote":
        m.pullquotes.push(strip(b.text));
        break;
      case "stat-highlight":
        for (const s of b.stats ?? []) {
          if (strip(s.value)) {
            m.stats.push({ value: strip(s.value), label: strip(s.label), note: strip(s.note) });
          }
        }
        break;
      case "vs": {
        const rows = [];
        const n = Math.max(b.left?.items?.length ?? 0, b.right?.items?.length ?? 0);
        for (let i = 0; i < n; i++) {
          const l = strip(b.left?.items?.[i]);
          const r = strip(b.right?.items?.[i]);
          if (l || r) rows.push([l, r]);
        }
        m.contrasts.push({ left: strip(b.leftName), right: strip(b.rightName), rows });
        break;
      }
      case "table":
        m.tables.push({
          caption: strip(b.caption),
          columns: (b.columns ?? []).map(strip),
          rows: (b.rows ?? []).map((r) => r.map(strip)),
        });
        break;
      case "faq":
        for (const it of b.items ?? []) {
          if (strip(it.q)) m.faqs.push({ q: strip(it.q), a: strip(it.a) });
        }
        break;
      case "section": {
        const body = strip(b.html);
        const heading = strip(b.heading);
        // The skill's house style puts a one-line deck under every heading, so the
        // first sentence of a section is usually the sharpest summary in the piece.
        if (heading || body) m.sections.push({ heading, deck: firstSentence(body), body });
        break;
      }
      case "player":
        if (strip(b.name)) m.players.push(strip(b.name));
        break;
      case "list":
        for (const it of b.items ?? []) if (strip(it)) m.listItems.push(strip(it));
        break;
      default:
        break;
    }
  }
  return m;
}

// ---- card URLs ----------------------------------------------------------

/**
 * Ready-to-open URLs for the content-carrying card variants in
 * app/api/social-card/route.tsx. Style A (the cover card) is unchanged and is
 * still produced from the admin panel; these are the additions that carry a
 * number, a contrast, a verdict or a list instead of the headline — and none of
 * them needs a cover image.
 */
function buildCards(row, path, m, base) {
  const cards = [];
  const q = (o) =>
    Object.entries(o)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");

  const cta = `THE FULL REPORT → ${path.toUpperCase()}`;
  const common = { format: "x", category: row.category, title: row.title, cta };

  for (const s of m.stats.slice(0, 3)) {
    cards.push({
      label: `stat — ${s.value}`,
      url: `${base}/api/social-card?${q({ ...common, variant: "stat", value: s.value, label: s.label, note: s.note })}`,
    });
  }
  const c = m.contrasts[0];
  if (c?.rows.length) {
    cards.push({
      label: `contrast — ${c.left} vs ${c.right}`,
      url: `${base}/api/social-card?${q({
        ...common,
        variant: "contrast",
        leftName: c.left,
        rightName: c.right,
        rows: c.rows.slice(0, 5).map(([l, r]) => `${l}~${r}`).join(";"),
      })}`,
    });
  }
  const verdict = m.pullquotes[m.pullquotes.length - 1];
  if (verdict) {
    cards.push({
      label: "verdict — the closing line",
      url: `${base}/api/social-card?${q({ ...common, variant: "verdict", quote: verdict })}`,
    });
  }
  if (m.players.length >= 3) {
    cards.push({
      label: `list — ${m.players.length} names`,
      // A list reads better tall; square is the Instagram post size.
      url: `${base}/api/social-card?${q({ ...common, format: "square", variant: "list", items: m.players.join(";") })}`,
    });
  }
  return cards;
}

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

// ---- subreddit routing --------------------------------------------------

/**
 * Only subs I am reasonably sure exist. The pack tells you to check the rules
 * anyway, because self-promo policy is per-sub and changes.
 */
const SUB_RULES = [
  { sub: "r/soccer", always: true, note: "huge reach, strictest self-promo rules — comment, do not link" },
  { sub: "r/football", always: true, note: "smaller, more tolerant of analysis posts" },
  { sub: "r/EASportsFC", match: /\bEA FC|FC 2[567]|player card|rating|ratings database\b/i, note: "our ratings-vs-reality angle is native here" },
  { sub: "r/FIFA", match: /\bEA FC|FIFA \d|player card|rating\b/i, note: "same angle, older and larger audience" },
  { sub: "r/footballmanagergames", match: /\bFootball Manager|FM2[567]|wonderkid|regen\b/i, note: "wonderkid lists do well; link policy is relaxed" },
  { sub: "r/MLS", match: /\bMLS|Major League Soccer|Philadelphia Union|Inter Miami\b/i },
  { sub: "r/PremierLeague", match: /\bPremier League|Arsenal|Liverpool|Chelsea|Manchester (City|United)|Tottenham\b/i },
  { sub: "r/Bundesliga", match: /\bBundesliga|Bayern|Dortmund|Leverkusen|Leipzig\b/i },
  { sub: "r/seriea", match: /\bSerie A|Juventus|Milan|Inter Milan|Napoli|Roma\b/i },
  { sub: "r/LaLiga", match: /\bLa Liga|Real Madrid|Barcelona|Atlético|Sevilla|Girona\b/i },
  { sub: "r/Ligue1", match: /\bLigue 1|PSG|Paris Saint-Germain|Marseille|Lyon|Monaco|Strasbourg\b/i },
  { sub: "r/Eredivisie", match: /\bEredivisie|Ajax|PSV|Feyenoord|AZ Alkmaar\b/i },
  { sub: "r/PrimeiraLiga", match: /\bPrimeira Liga|Liga Portugal|Benfica|Sporting|FC Porto\b/i },
];

function routeSubs(haystack) {
  return SUB_RULES.filter((r) => r.always || r.match?.test(haystack));
}

// ---- pack builders ------------------------------------------------------

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
  const haystack = [
    row.title,
    m.lead,
    ...m.callouts,
    ...m.sections.map((s) => `${s.heading} ${s.body}`),
    ...m.listItems,
  ].join(" ");

  const gaps = [];
  if (row.status !== "published") gaps.push(`status is "${row.status}" — the link will 404 for anyone who clicks it`);
  if (!row.cover_image) gaps.push("no cover image — every share falls back to the generic OG image");
  if (m.stats.length === 0) gaps.push("no stat block — the X reply lines and the video will be thin");
  if (m.contrasts.length === 0) gaps.push("no vs block — no ready-made contrast to post");
  if (m.pullquotes.length === 0) gaps.push("no pull quote — no closing line to end a video on");

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
      buildCardSection(buildCards(row, path, m, BASE)),
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
    env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
