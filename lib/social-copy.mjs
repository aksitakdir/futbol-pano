/**
 * Platform copy — every post the Social Cards panel and `scripts/social-pack.mjs`
 * offer, cut from one article for each platform's job (docs/SOCIAL-STRATEGY.md §5).
 *
 * The rule from lib/social-extract.mjs still holds: facts are lifted verbatim from
 * the article's blocks. What this file adds is scaffolding — the order, the line
 * breaks, a question, the call to action, the link and the hashtags — each one
 * chosen by the strategy rather than by taste:
 *
 *   §4.3  voice: number first, dry, no banned phrases       → BANNED + lint
 *   §5.2  one job per platform                              → `role` on each platform
 *   §9.4  hashtags: subject · community · #ScoutGamer, IG 3–5, X 0–2, edition must match
 *   §10.3 the CTA follows the stage (1 follow · 2 save · 3 read)  → `stage`
 *   §10.4 where the link sits: X in the first reply, Instagram "link in bio" / story sticker
 *   §10.6c UTM: source = platform, medium = social, campaign = pillar, content = slug
 *   §7.4.8 never tag players under eighteen                 → lint names them
 *
 * Platforms outside the current plan (§5.4: Threads, Bluesky, LinkedIn, Facebook)
 * are produced too, marked `inPlan: false`, so the copy is there the day they open.
 */

import { CATEGORY_PATHS, X_LIMIT, sentences, firstSentence, routeSubs, haystackOf } from "./social-extract.mjs";

export const SITE = "https://www.scoutgamer.com";
export const HANDLES = { x: "@scoutgamerx", instagram: "@scoutgamer_fc" };

/** §4.3 rule 3 — the phrases the old posts leaned on. */
export const BANNED = [
  "masterclass",
  "unmatched",
  "the future is here",
  "game-changer",
  "game changer",
  "changing the game",
  "making waves",
  "can't stop talking about",
  "discover",
  "tap the link in bio",
];

export const STAGES = {
  1: "Stage 1 — get found: follow",
  2: "Stage 2 — returning audience: save · share",
  3: "Stage 3 — traffic: read",
};

const PILLAR = {
  lists: "lists",
  radar: "profile",
  "tactics-lab": "tactics",
  transfer: "transfers",
  "wc-2026": "world-cup",
};

const NOUN = {
  lists: "list",
  radar: "report",
  "tactics-lab": "breakdown",
  transfer: "analysis",
  "wc-2026": "piece",
};

// ---- small helpers ------------------------------------------------------

const URL_RE = /https?:\/\/\S+/g;

/** X counts every link as 23 characters (t.co), whatever its length. */
export const xLength = (s) => String(s).replace(URL_RE, "x".repeat(23)).length;

const plainLength = (s) => [...String(s)].length;

export function articleUrl(row) {
  return `${SITE}${CATEGORY_PATHS[row.category] ?? "/radar"}/${row.slug}`;
}

export function utmUrl(row, source) {
  const q = new URLSearchParams({
    utm_source: source,
    utm_medium: "social",
    utm_campaign: PILLAR[row.category] ?? "article",
    utm_content: row.slug,
  });
  return `${articleUrl(row)}?${q}`;
}

const ascii = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[łŁ]/g, "l").replace(/[øØ]/g, "o").replace(/ß/g, "ss");

/** "Ayyoub Bouaddi" → "#AyyoubBouaddi"; "Lucas Martínez Quarta" → "#LucasMartinezQuarta". */
export const nameTag = (name) =>
  "#" +
  ascii(name)
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");

/** Accumulate whole sentences until the room runs out. Never cuts mid-sentence. */
function fitSentences(text, room, measure = plainLength) {
  let out = "";
  for (const s of sentences(text)) {
    const next = out ? `${out} ${s}` : s;
    if (measure(next) > room) break;
    out = next;
  }
  return out;
}

const AGE_WORDS = {
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  "twenty-one": 21, "twenty-two": 22, "twenty-three": 23, "twenty-four": 24, "twenty-five": 25,
};

/** "Toulouse · Eighteen" → 18 (the house deck under a player heading). */
export function ageFromMeta(meta) {
  const m = String(meta ?? "").toLowerCase().match(/(fifteen|sixteen|seventeen|eighteen|nineteen|twenty(?:-(?:one|two|three|four|five))?)/);
  if (m) return AGE_WORDS[m[1]];
  const n = String(meta ?? "").match(/\b(1[5-9]|2[0-5])\b/);
  return n ? Number(n[1]) : null;
}

/** "(Figures as of 12 October 2026.)" in the lead — the date every number hangs on. */
export function asOfDate(lead) {
  return String(lead ?? "").match(/as of (\d{1,2} [A-Z][a-z]+ \d{4})/)?.[1] ?? "";
}

/** The searchable half of a title: "The Best Young Defensive Midfielders in World Football". */
export function keywordLine(title) {
  return String(title ?? "").split(/:\s| — | – /)[0].trim();
}

const statLine = (s) => `${s.value} — ${s.label}`;
const statLineFull = (s) => `${statLine(s)}${s.note ? `. ${s.note}` : ""}.`;

/** "Ayyoub Bouaddi — EA FC 27: 80. Real-level: thirty-two Premier League minutes behind £241m of midfield." */
export function readLine(r, { tier = false } = {}) {
  const parts = [`${r.name} — EA FC ${r.edition}: ${r.ovr}.`];
  if (r.real) parts.push(`Real-level: ${r.real}.`);
  if (tier && r.tier) parts.push(`Tier: ${r.tier}.`);
  return parts.join(" ");
}

/** A short form for poll options (25 characters on X): surname when the full name is too long. */
function pollOption(name, max = 25) {
  if (name.length <= max) return name;
  const last = name.split(/\s+/).slice(-1)[0];
  return last.length <= max ? last : last.slice(0, max);
}

const surname = (name) => String(name).split(/\s+/).slice(-1)[0];

/**
 * A vs row as one readable line. Both sides usually share the label
 * ("League starts: 0" | "League starts: 3") → "League starts: Bouaddi 0 · Bernal 3".
 */
export function vsRowLine(vs, [l, r]) {
  const lm = String(l).match(/^([^:]{1,40}):\s*(.+)$/);
  const rm = String(r).match(/^([^:]{1,40}):\s*(.+)$/);
  if (lm && rm && lm[1].trim().toLowerCase() === rm[1].trim().toLowerCase()) {
    return `${lm[1].trim()}: ${surname(vs.left)} ${lm[2].trim()} · ${surname(vs.right)} ${rm[2].trim()}`;
  }
  return `${vs.left}: ${l}\n${vs.right}: ${r}`;
}

function closingLine(m) {
  return m.pullquotes[m.pullquotes.length - 1] || m.callouts[m.callouts.length - 1] || "";
}

// ---- hashtags (§9.4) ----------------------------------------------------

/**
 * Subject (the players the post is about) · community (only when the post shows a
 * rating, and in the same edition) · brand. Chosen per post, never a fixed block.
 */
export function hashtags(ctx, { max, text = "", brand = true, community = true }) {
  const tags = [];
  for (const n of ctx.subjects) if (tags.length < Math.max(0, max - (brand ? 1 : 0) - 1)) tags.push(nameTag(n));
  const ed = String(text).match(/EA FC (\d{2})/)?.[1];
  if (community && ed && tags.length < max - (brand ? 1 : 0)) tags.push(`#FC${ed}`);
  if (community && ctx.gameAngle && ctx.row.category === "lists" && tags.length < max - (brand ? 1 : 0)) tags.push("#Wonderkids");
  if (brand && tags.length < max) tags.push("#ScoutGamer");
  return [...new Set(tags)].slice(0, max);
}

// ---- context ------------------------------------------------------------

function context(row, m, opts) {
  const vs = m.contrasts.find((c) => c.rows.length) ?? null;
  const subjects = vs ? [vs.left, vs.right] : row.player_name ? [row.player_name] : m.reads[0] ? [m.reads[0].name] : m.players.slice(0, 1);
  const shownPlayers = Math.min(m.reads.length, 6); // buildCards makes up to six player cards
  // The number and the card that belong to the post's subject lead; otherwise the first of each.
  const mentions = (s) => subjects.some((n) => `${s.label} ${s.note}`.includes(surname(n)));
  const leadStat = m.stats.find(mentions) ?? m.stats[0] ?? null;
  const leadRead = m.reads.find((r) => subjects.includes(r.name)) ?? m.reads[0] ?? null;
  return {
    row,
    m,
    stage: Number(opts.stage) || 1,
    vs,
    subjects,
    shownPlayers,
    leadStat,
    leadRead,
    noun: NOUN[row.category] ?? "piece",
    asOf: asOfDate(m.lead),
    gameAngle: m.reads.length > 0,
    keyword: keywordLine(row.title),
    closer: closingLine(m),
  };
}

const post = (label, text, { limit = 0, measure = "plain", note = "" } = {}) => {
  const count =
    measure === "x" ? xLength(text) : measure === "bluesky" ? plainLength(String(text).replace(URL_RE, "x".repeat(32))) : plainLength(text);
  return { label, text, limit, count, over: limit > 0 && count > limit, note };
};

// ---- X — conversation (§5.2) --------------------------------------------

function buildXPlatform(ctx) {
  const { row, m, vs } = ctx;
  const posts = [];

  // Main post, no link (§10.4). The §4.4 pattern: numbers stacked, then the line that lands.
  const question = vs ? `Who would you sign: ${vs.left} or ${vs.right}?` : "";
  // The closing line lands only whole — a two-part line cut after its first half loses the half
  // that lands. So try the shapes in order and take the first where everything fits uncut.
  const closer = ctx.closer || m.callouts[0] || "";
  let main = "";
  if (m.stats.length >= 2) {
    const shapes = [];
    for (const n of [3, 2]) {
      const head = m.stats.slice(0, n).map((s) => `${statLine(s)}.`).join("\n");
      if (n > m.stats.length) continue;
      shapes.push([head, closer, question], [head, closer], [head, question]);
    }
    main = shapes.map((sh) => sh.filter(Boolean).join("\n\n")).find((t) => xLength(t) <= X_LIMIT) ?? "";
  }
  if (!main) {
    const room = X_LIMIT - (question ? question.length + 2 : 0);
    const hook =
      fitSentences(ctx.closer, room) || fitSentences(m.callouts[0] ?? "", room) || fitSentences(m.lead, room) || firstSentence(row.title);
    main = [hook, question].filter(Boolean).join("\n\n");
  }
  posts.push(post("Main post — no link", main, { limit: X_LIMIT, measure: "x", note: "Pair with the contrast or stat card (16:9). The link goes in your first reply, below." }));

  // Single-number posts (§4.3 rule 6: at most two sentences and one number).
  for (const s of m.stats.slice(0, 4)) {
    const t = statLineFull(s);
    if (xLength(t) <= X_LIMIT) posts.push(post(`Single number — ${s.value}`, t, { limit: X_LIMIT, measure: "x", note: "One number, standalone. Use the matching stat card." }));
  }

  // First reply carries the link.
  const linkLabel = { list: "Full list, with every number", report: "The full report", breakdown: "The full breakdown", analysis: "The full analysis" }[ctx.noun] ?? "The full piece";
  const replyLines = [`${linkLabel}: ${utmUrl(row, "x")}`];
  if (ctx.stage === 1) replyLines.push(`Young players, read against their ratings — follow ${HANDLES.x}.`);
  if (ctx.stage === 2) replyLines.push("Bookmark it for the next transfer argument.");
  posts.push(post("First reply — the link", replyLines.join("\n\n"), { limit: X_LIMIT, measure: "x", note: "Post this as a reply to your own main post, straight away." }));

  // Poll (§6.2 ⑤).
  if (vs) {
    const opts = [pollOption(vs.left), pollOption(vs.right)];
    const pollText = [`Who would you sign?`, vs.rows.slice(0, 3).map((row) => vsRowLine(vs, row)).join("\n")].join("\n\n");
    posts.push(
      post("Poll", `${pollText}\n\nPoll options:\n1. ${opts[0]}\n2. ${opts[1]}`, {
        note: "Paste the text, then add the two options in X's poll field (25 characters each). Run it for 24 hours.",
      }),
    );
  }

  // Thread (§6.2 ③): hook → one player or one number per post → the closing line → link.
  const thread = [];
  const hook = fitSentences(m.lead, X_LIMIT - 8) || firstSentence(row.title);
  const dated = ctx.asOf && !hook.includes(ctx.asOf) ? `${hook} (As of ${ctx.asOf}.)` : hook;
  if (hook) thread.push(xLength(dated) <= X_LIMIT - 8 ? dated : hook);
  if (m.reads.length) {
    for (const r of m.reads.slice(0, 8)) {
      const line = `${r.name}${r.meta ? ` (${r.meta})` : ""}\nEA FC ${r.edition}: ${r.ovr}${r.stats.length ? ` · ${r.stats.join(", ")}` : ""}\n${r.real ? `Real-level: ${r.real}.` : ""}${r.tier ? `\nTier: ${r.tier}.` : ""}`;
      if (xLength(line) <= X_LIMIT - 6) thread.push(line.trim());
    }
  } else {
    for (const s of m.stats.slice(0, 4)) if (xLength(statLineFull(s)) <= X_LIMIT - 6) thread.push(statLineFull(s));
    for (const sec of m.sections.slice(0, 4)) if (sec.deck && sec.deck.length > 40 && xLength(sec.deck) <= X_LIMIT - 6) thread.push(sec.deck);
  }
  const close = fitSentences(ctx.closer, X_LIMIT - 6);
  if (close && !thread.includes(close)) thread.push(close);
  thread.push(`${linkLabel}: ${utmUrl(row, "x")}`);
  if (thread.length >= 4) {
    const n = thread.length;
    const numbered = thread.map((t, i) => `${i + 1}/${n}\n${t}`);
    posts.push(
      post(`Thread — ${n} posts`, numbered.join("\n\n———\n\n"), {
        note: "Split on the ——— lines. Each part is under 280. The link only in the last.",
      }),
    );
    numbered.forEach((t, i) => {
      if (xLength(t) > X_LIMIT) posts.push(post(`Thread part ${i + 1} is too long`, t, { limit: X_LIMIT, measure: "x" }));
    });
  }

  return {
    key: "x",
    name: "X",
    role: "Conversation — replies carry, posts do not",
    inPlan: true,
    card: vs ? { variant: "contrast", format: "x" } : { variant: "stat", format: "x" },
    posts,
    replies: buildReplyBank(ctx),
  };
}

/** Link-free lines for other people's threads (§7.4): one fact they do not have. */
function buildReplyBank(ctx) {
  const { m } = ctx;
  const lines = [];
  for (const r of m.reads) lines.push(readLine(r));
  for (const s of m.stats) lines.push(statLineFull(s));
  for (const c of m.contrasts) for (const row of c.rows.slice(0, 4)) if (row[0] && row[1]) lines.push(vsRowLine(c, row));
  for (const f of m.faqs) lines.push(`${f.q} ${f.a}`);
  for (const s of m.sections) if (s.deck && s.deck.length > 40) lines.push(s.deck);
  const seen = new Set();
  return lines.filter((l) => xLength(l) <= X_LIMIT && !seen.has(l) && seen.add(l)).slice(0, 14);
}

// ---- Instagram — showcase (§5.2) ----------------------------------------

function igCta(ctx) {
  const { m } = ctx;
  const out = [];
  const more = m.players.length - ctx.shownPlayers;
  const link =
    ctx.shownPlayers > 0 && more > 0
      ? `The other ${more} — and the numbers behind every name — are in the full ${ctx.noun}. Link in bio.`
      : `Every number here is dated and sourced in the full ${ctx.noun}. Link in bio.`;
  if (ctx.stage === 1) out.push(`Young players, read against their ratings. Follow ${HANDLES.instagram}.`, link);
  if (ctx.stage === 2) out.push(ctx.gameAngle ? "Save this for your next Career Mode save." : "Save this one.", "Send it to someone who will disagree with it.", link);
  if (ctx.stage === 3) out.push(link);
  return out;
}

function buildInstagramPlatform(ctx) {
  const { row, m, vs } = ctx;
  const posts = [];

  // First line is all the feed shows (~125 characters): it has to carry the number or the keyword.
  const leadFirst = sentences(m.lead)[0] ?? "";
  const openerStat = !(leadFirst && plainLength(leadFirst) <= 125) && ctx.leadStat ? ctx.leadStat : null;
  const opener = openerStat ? `${statLine(openerStat)}.` : leadFirst && plainLength(leadFirst) <= 125 ? leadFirst : ctx.keyword;

  const facts = m.stats.filter((s) => s !== openerStat).slice(0, 3).map(statLine);
  const readFacts = m.reads.slice(0, 3).map((r) => readLine(r));
  const body = [opener];
  if (leadFirst && opener !== leadFirst) body.push("", leadFirst);
  if (facts.length) body.push("", ...facts);
  else if (readFacts.length) body.push("", ...readFacts);
  if (facts.length && ctx.leadRead) body.push("", readLine(ctx.leadRead));
  if (ctx.closer && ctx.closer !== opener) body.push("", ctx.closer);
  if (ctx.asOf) body.push("", `Figures as of ${ctx.asOf}.`);
  const capText = body.join("\n");
  const tags = hashtags(ctx, { max: 5, text: capText });
  const caption = [capText, "", ...igCta(ctx), "", tags.join(" ")].join("\n");
  posts.push(post("Carousel caption", caption, { limit: 2200, note: "Cards: headline → player cards → list (4:5). First line is what the feed shows." }));

  // Alt text per slide — Instagram lets you set it per image (Advanced settings → Accessibility).
  const slides = [];
  if (row.cover_image) slides.push(`Slide 1 — headline: ${row.title}.`);
  for (const r of m.reads.slice(0, 6)) {
    slides.push(
      `Slide ${slides.length + 1} — ${r.name}${r.meta ? `, ${r.meta.replace(/ · /g, ", ")}` : ""}. EA FC ${r.edition} rating ${r.ovr}${r.stats.length ? ` (${r.stats.join(", ")})` : ""}.${r.real ? ` Real-level: ${r.real}.` : ""}${r.tier ? ` Tier: ${r.tier}.` : ""}`,
    );
  }
  for (const s of m.stats.slice(0, 3)) slides.push(`Slide ${slides.length + 1} — ${statLineFull(s)}`);
  if (vs) slides.push(`Slide ${slides.length + 1} — ${vs.left} against ${vs.right}. ${vs.rows.map((row) => vsRowLine(vs, row).replace(/\n/g, "; ")).join(". ")}.`);
  if (ctx.closer) slides.push(`Slide ${slides.length + 1} — the verdict: ${ctx.closer}`);
  if (m.players.length >= 3) slides.push(`Slide ${slides.length + 1} — the full list: ${m.players.join(", ")}.`);
  if (slides.length >= 2) posts.push(post("Alt text, slide by slide", slides.join("\n"), { note: "Same order as the cards above. Instagram: Advanced settings → Accessibility; it also reads it to understand the post (§9.2)." }));

  // Single image — the verdict or contrast card on its own.
  if (ctx.closer) {
    const single = [ctx.closer, "", ...igCta(ctx), "", hashtags(ctx, { max: 4, text: ctx.closer, community: false }).join(" ")].join("\n");
    posts.push(post("Single image caption — verdict card", single, { limit: 2200 }));
  }

  // Story: number → poll → link sticker (§10.4: the story is where the link is clickable).
  const frames = [];
  if (ctx.leadStat) frames.push(`Frame 1 — stat card (9:16): ${statLine(ctx.leadStat)}.`);
  else if (m.reads[0]) frames.push(`Frame 1 — player card (9:16): ${readLine(m.reads[0])}`);
  if (vs) frames.push(`Frame 2 — poll sticker: "Who would you sign?" · ${pollOption(vs.left)} / ${pollOption(vs.right)}`);
  else if (m.reads[0]) frames.push(`Frame 2 — poll sticker on ${m.reads[0].name}'s card: "EA FC ${m.reads[0].edition} rates him ${m.reads[0].ovr}." · Too high / Fair / Too low`);
  frames.push(`Frame ${frames.length + 1} — link sticker "Read the full ${ctx.noun}": ${utmUrl(row, "instagram")}`);
  posts.push(post("Story — frame by frame", frames.join("\n"), { note: "Post on publish day. The link sticker is the only clickable link on Instagram besides the bio." }));

  return {
    key: "instagram",
    name: "Instagram",
    role: "Showcase — saves and shares",
    inPlan: true,
    card: { variant: row.cover_image ? "headline" : m.reads.length ? "player" : "stat", format: "square" },
    posts,
  };
}

// ---- Short video — discovery (§5.2) -------------------------------------

function buildVideoPlatform(ctx) {
  const { row, m } = ctx;
  const posts = [];

  // Three seconds of text has to be short: the searchable title, then one number, then the
  // card against the football, then the line that lands.
  const beats = [];
  beats.push(["0–3s", ctx.keyword || firstSentence(m.lead)]);
  if (ctx.leadStat) beats.push(["3–7s", statLine(ctx.leadStat)]);
  if (ctx.leadRead) beats.push(["7–11s", `${ctx.leadRead.name} — EA FC ${ctx.leadRead.edition}: ${ctx.leadRead.ovr}${ctx.leadRead.real ? `\n        Real-level: ${ctx.leadRead.real}` : ""}`]);
  else if (m.stats[1] && m.stats[1] !== ctx.leadStat) beats.push(["7–11s", statLine(m.stats[1])]);
  const last = ctx.closer ? sentences(ctx.closer).slice(-1)[0] : "";
  if (last) beats.push(["11–16s", last]);
  if (beats.length >= 2) {
    posts.push(post("On-screen text — 8 to 16 seconds", beats.map(([t, l]) => `${t.padEnd(7)} ${l}`).join("\n"), { note: "One video, three surfaces. Silent with text on screen works without a voice-over decision." }));
  }

  const fact = [ctx.leadStat ? `${statLine(ctx.leadStat)}.` : "", ctx.leadRead ? readLine(ctx.leadRead) : ""].filter(Boolean).join("\n") || firstSentence(m.lead);
  const followLine = ctx.stage === 1 ? "Follow for young players, read against their ratings." : ctx.stage === 2 ? "Save it for your next Career Mode save." : "";
  const capCore = [ctx.keyword, fact].filter(Boolean).join("\n\n");
  const tags = hashtags(ctx, { max: 5, text: capCore });

  posts.push(post("Reels caption", [capCore, followLine, `Full ${ctx.noun}: link in bio.`, tags.join(" ")].filter(Boolean).join("\n\n"), { limit: 2200 }));
  posts.push(
    post("TikTok caption", [capCore, followLine, `Full ${ctx.noun} on scoutgamer.com — link in bio.`, tags.join(" ")].filter(Boolean).join("\n\n"), {
      limit: 4000,
      note: "TikTok search reads the caption: the keyword line goes first. No TikTok account yet (§5.6).",
    }),
  );
  const shortsTitle = ctx.keyword.length <= 100 ? ctx.keyword : ctx.keyword.slice(0, 99) + "…";
  posts.push(post("YouTube Shorts title", shortsTitle, { limit: 100, note: "No YouTube account yet (§5.6)." }));
  posts.push(post("YouTube Shorts description", [fact, ctx.closer, `The full ${ctx.noun}: ${utmUrl(row, "youtube")}`, tags.join(" ")].filter(Boolean).join("\n\n"), { limit: 5000, note: "Shorts descriptions do not make links clickable; the text still tells people where to go." }));

  return {
    key: "video",
    name: "Reels · TikTok · Shorts",
    role: "Discovery — reach people who do not follow us",
    inPlan: true,
    card: { variant: m.reads.length ? "player" : "stat", format: "story" },
    posts,
  };
}

// ---- Reddit — community and traffic (§5.2) ------------------------------

function mdTable(columns, rows) {
  const esc = (s) => String(s).replace(/\|/g, "/");
  return [`| ${columns.map(esc).join(" | ")} |`, `| ${columns.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.map(esc).join(" | ")} |`)].join("\n");
}

function buildRedditPlatform(ctx) {
  const { row, m, vs } = ctx;
  const posts = [];

  posts.push(post("Title — straight", row.title, { limit: 300, note: "Reddit punishes clickbait. The article title is already plain." }));
  const angle = m.callouts[0] || ctx.closer || m.lead;
  const factTitle = fitSentences(angle.replace(/^The verdict\.\s*/i, ""), 180) || fitSentences(angle.replace(/^The verdict\.\s*/i, ""), 300);
  if (factTitle && factTitle !== row.title) posts.push(post("Title — discussion", factTitle, { limit: 300 }));

  const body = [];
  body.push(fitSentences(m.lead, 1200) || m.lead);
  if (m.stats.length) body.push(m.stats.slice(0, 4).map((s) => `- **${s.value}** — ${s.label}${s.note ? ` (${s.note})` : ""}`).join("\n"));
  const t = m.tables[0];
  if (t?.rows.length) body.push(`${t.caption ? `*${t.caption}*\n\n` : ""}${mdTable(t.columns, t.rows)}`);
  else if (vs) body.push(mdTable(["", vs.left, vs.right], vs.rows.map(([l, r]) => [l.split(":")[0], l.split(":").slice(1).join(":").trim() || l, r.split(":").slice(1).join(":").trim() || r])));
  if (ctx.closer) body.push(ctx.closer);
  if (m.faqs[0]) body.push(`**${m.faqs[0].q}** ${m.faqs[0].a}`);
  posts.push(post("Comment / text post — no link", body.join("\n\n"), { limit: 10000, note: "Value first. Every line is from the article. Works as a top-level comment in an existing thread." }));
  posts.push(post("Link line — only where the sub allows it", `Full write-up, with sources: ${utmUrl(row, "reddit")}`, { note: "Read the sub's self-promotion rule first. Never on a new, history-less account (§5.4)." }));

  const subs = routeSubs(haystackOf(row, m));
  posts.push(post("Where", subs.map((s) => `${s.sub}${s.note ? ` — ${s.note}` : ""}`).join("\n"), { note: "Candidate subs, matched from the piece. Manual only (§5.5)." }));

  return { key: "reddit", name: "Reddit", role: "Community and traffic — value first, link only where allowed", inPlan: true, card: null, posts };
}

// ---- Outside the current plan (§5.4) ------------------------------------

function buildThreadsPlatform(ctx) {
  const { row, m, vs } = ctx;
  const hook = sentences(m.lead)[0] ?? row.title;
  const facts = [ctx.leadStat, ...m.stats.filter((s) => s !== ctx.leadStat)].filter(Boolean).slice(0, 3).map((s) => `${statLine(s)}.`);
  const q = vs ? `Who would you sign: ${vs.left} or ${vs.right}?` : "";
  const tag = ctx.gameAngle ? "#Wonderkids" : nameTag(ctx.subjects[0] ?? "Scout Gamer");
  const build = (fs) => [hook, fs.join("\n"), q, utmUrl(row, "threads"), tag].filter(Boolean).join("\n\n");
  let n = facts.length;
  while (n > 0 && plainLength(build(facts.slice(0, n))) > 500) n--;
  const text = build(facts.slice(0, n));
  return {
    key: "threads",
    name: "Threads",
    role: "Not in the plan yet (§5.4) — conversation, like X",
    inPlan: false,
    card: vs ? { variant: "contrast", format: "square" } : { variant: "stat", format: "square" },
    posts: [post("Post", text, { limit: 500, note: "One topic tag per post on Threads." })],
  };
}

function buildBlueskyPlatform(ctx) {
  const { row, m } = ctx;
  const url = utmUrl(row, "bluesky");
  const room = 300 - 32 - 2; // the Bluesky app shortens a pasted link in the text to about 30 characters
  const hook = fitSentences(ctx.closer, room) || fitSentences(m.lead, room) || keywordLine(row.title);
  return {
    key: "bluesky",
    name: "Bluesky",
    role: "Not in the plan yet (§5.4) — links are welcome here",
    inPlan: false,
    card: { variant: "stat", format: "x" },
    posts: [post("Post", `${hook}\n\n${url}`, { limit: 300, measure: "bluesky", note: "Paste the link last: the app shortens it in the text and builds a link card." })],
  };
}

function buildLinkedInPlatform(ctx) {
  const { row, m } = ctx;
  const parts = [ctx.keyword + "."];
  parts.push(fitSentences(m.lead, 700) || m.lead);
  if (m.stats.length) parts.push(m.stats.slice(0, 4).map((s) => `→ ${statLineFull(s)}`).join("\n"));
  if (ctx.closer) parts.push(ctx.closer);
  parts.push("Where do you think the market has this wrong?");
  const tags = hashtags(ctx, { max: 3, text: "", community: false });
  return {
    key: "linkedin",
    name: "LinkedIn",
    role: "Not in the plan yet (§5.4) — the recruitment and market angle",
    inPlan: false,
    card: { variant: "stat", format: "square" },
    posts: [
      post("Post", [...parts, tags.join(" ")].join("\n\n"), { limit: 3000, note: "The first ~210 characters show before “see more”." }),
      post("First comment — the link", `The full ${ctx.noun}, with sources: ${utmUrl(row, "linkedin")}`, { note: "Commonly reported: a link in the post itself cuts reach. Unconfirmed by LinkedIn; costs nothing to follow." }),
    ],
  };
}

function buildFacebookPlatform(ctx) {
  const { row, m } = ctx;
  const facts = m.stats.slice(0, 3).map((s) => `${statLine(s)}.`);
  const text = [sentences(m.lead)[0] ?? row.title, facts.join("\n"), ctx.closer, utmUrl(row, "facebook")].filter(Boolean).join("\n\n");
  return {
    key: "facebook",
    name: "Facebook",
    role: "Not in the plan yet (§5.4) — page post with link preview",
    inPlan: false,
    card: { variant: "headline", format: "x" },
    posts: [post("Page post", text, { limit: 63206, note: "The first ~125 characters show before “See more”." })],
  };
}

// ---- lint ----------------------------------------------------------------

export function lintPack(platforms, ctx, opts = {}) {
  const issues = [];
  const { m, row } = ctx;
  for (const p of platforms) {
    for (const ps of p.posts) {
      if (ps.over) issues.push(`${p.name} · ${ps.label}: ${ps.count} characters, the limit is ${ps.limit}.`);
      const low = ps.text.toLowerCase();
      for (const b of BANNED) if (low.includes(b)) issues.push(`${p.name} · ${ps.label}: contains “${b}” — banned in §4.3.`);
      const shown = ps.text.match(/EA FC (\d{2})/g) ?? [];
      const tagged = ps.text.match(/#FC(\d{2})\b/g) ?? [];
      for (const t of tagged) if (!shown.some((s) => s.endsWith(t.slice(3)))) issues.push(`${p.name} · ${ps.label}: ${t} without that edition's rating in the post (§9.4).`);
    }
  }
  const minors = m.reads.filter((r) => (ageFromMeta(r.meta) ?? 99) < 18).map((r) => r.name);
  if (minors.length) issues.push(`Under eighteen in this piece: ${minors.join(", ")}. Talk about them, never tag or reply to their accounts (§7.4.8).`);
  if (row.status && row.status !== "published") issues.push(`Status is “${row.status}” — every link here 404s until the article is published.`);
  if (opts.publishedAt && opts.today) {
    const days = Math.floor((new Date(opts.today) - new Date(opts.publishedAt)) / 86400000);
    if (days > 14) issues.push(`Published ${days} days ago. Re-check clubs, ages and numbers before posting again (§6.6) — FAQ answers age fastest.`);
  }
  return issues;
}

// ---- the pack -------------------------------------------------------------

/**
 * Every platform's copy for one article.
 *   row: { title, category, slug, cover_image, status, player_name }
 *   material: extract(sections_json)
 *   opts: { stage: 1|2|3, publishedAt?: ISO string, today?: ISO string }
 */
export function buildPlatformPack(row, material, opts = {}) {
  const ctx = context(row, material, opts);
  const platforms = [
    buildXPlatform(ctx),
    buildInstagramPlatform(ctx),
    buildVideoPlatform(ctx),
    buildRedditPlatform(ctx),
    buildThreadsPlatform(ctx),
    buildBlueskyPlatform(ctx),
    buildLinkedInPlatform(ctx),
    buildFacebookPlatform(ctx),
  ];
  return { stage: ctx.stage, url: articleUrl(row), platforms, lint: lintPack(platforms, ctx, opts) };
}

/** One platform's posts as a single paste-able block. */
export function platformToText(p) {
  const out = [];
  for (const ps of p.posts) out.push(`— ${ps.label} —`, ps.text, "");
  if (p.replies?.length) out.push("— Reply lines, no links —", ...p.replies.map((r) => `${r}\n`));
  return out.join("\n").trim();
}

/** The whole pack as Markdown — the admin download and `scripts/social-pack.mjs` print the same thing. */
export function packToMarkdown(row, pack) {
  const out = [`# Social copy — ${row.title}`, "", pack.url, "", `${STAGES[pack.stage]}`, ""];
  if (pack.lint.length) out.push("## Check before posting", "", ...pack.lint.map((l) => `- ${l}`), "");
  for (const p of pack.platforms) {
    out.push(`## ${p.name}${p.inPlan ? "" : " (not in the plan yet)"}`, "", `*${p.role}*${p.card ? ` · card: ${p.card.variant}, ${p.card.format}` : ""}`, "");
    for (const ps of p.posts) {
      out.push(`**${ps.label}**${ps.limit ? ` — ${ps.count}/${ps.limit}${ps.over ? " OVER" : ""}` : ""}`, "", "```", ps.text, "```");
      if (ps.note) out.push(`_${ps.note}_`);
      out.push("");
    }
    if (p.replies?.length) {
      out.push("**Reply lines — no links, for other people's threads**", "");
      for (const r of p.replies) out.push("```", r, "```");
      out.push("");
    }
  }
  return out.join("\n");
}
