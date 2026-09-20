/**
 * Social material extraction — the single source for both the admin panel and
 * `scripts/social-pack.mjs`.
 *
 * Written as .mjs rather than .ts on purpose: the publishing scripts are plain
 * Node and cannot import TypeScript, and the repo already carries one hand-kept
 * mirror (scout-publish.mjs against lib/parse-blocks.ts) that has to be updated
 * in two places every time the block syntax moves. One was enough. `allowJs` is
 * on, so the app imports this file directly.
 *
 * Nothing here writes prose. Every string it returns is lifted verbatim from an
 * article's own `sections_json`. A piece with no numbers in it yields a thin
 * result and says so, rather than being topped up with something invented —
 * the same rule `scripts/preflight.mjs` enforces at publish time.
 */

export const X_LIMIT = 280;

export const CATEGORY_PATHS = {
  radar: "/radar",
  lists: "/lists",
  "tactics-lab": "/tactics-lab",
  transfer: "/transfers",
  "wc-2026": "/world-cup-2026",
};

// ---- text helpers -------------------------------------------------------

export const strip = (s) =>
  String(s ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Split on sentence ends, respecting the decimals and initials football prose is full of. */
export function sentences(text) {
  return strip(text)
    .split(/(?<=[.!?])\s+(?=[A-Z“"'])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function firstSentence(text) {
  const t = strip(text);
  const m = t.match(/^.*?[.!?](?=\s+[A-Z“"']|$)/s);
  return (m ? m[0] : t).trim();
}

// ---- extraction ---------------------------------------------------------

/**
 * Pull everything quotable out of sections_json. This is a filing exercise,
 * not a writing one — no string is rephrased on the way through.
 */
export function extract(blocks) {
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
        // House style puts a one-line deck under every heading, so a section's
        // first sentence is usually the sharpest summary in the piece.
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

const qs = (o) =>
  Object.entries(o)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");

/**
 * URLs for the content-carrying card variants in app/api/social-card/route.tsx.
 * Style A (the cover card) is unchanged and produced separately; these carry a
 * number, a contrast, a verdict or a list instead of the headline, and none of
 * them needs a cover image.
 *
 * `base` may be "" for a same-origin path, which is what the admin panel wants.
 */
export function buildCards(row, material, base = "") {
  const path = CATEGORY_PATHS[row.category] ?? "/radar";
  const cta = `THE FULL REPORT → ${path.toUpperCase()}`;
  const common = { format: "x", category: row.category, title: row.title, cta };
  const cards = [];

  for (const s of material.stats.slice(0, 3)) {
    cards.push({
      variant: "stat",
      label: `stat — ${s.value}`,
      url: `${base}/api/social-card?${qs({ ...common, variant: "stat", value: s.value, label: s.label, note: s.note })}`,
    });
  }

  const c = material.contrasts[0];
  if (c?.rows.length) {
    cards.push({
      variant: "contrast",
      label: `contrast — ${c.left} vs ${c.right}`,
      url: `${base}/api/social-card?${qs({
        ...common,
        variant: "contrast",
        leftName: c.left,
        rightName: c.right,
        rows: c.rows.slice(0, 5).map(([l, r]) => `${l}~${r}`).join(";"),
      })}`,
    });
  }

  const verdict = material.pullquotes[material.pullquotes.length - 1];
  if (verdict) {
    cards.push({
      variant: "verdict",
      label: "verdict — the closing line",
      url: `${base}/api/social-card?${qs({ ...common, variant: "verdict", quote: verdict })}`,
    });
  }

  if (material.players.length >= 3) {
    cards.push({
      variant: "list",
      label: `list — ${material.players.length} names`,
      // A list reads better tall; square is the Instagram post size.
      url: `${base}/api/social-card?${qs({ ...common, format: "square", variant: "list", items: material.players.join(";") })}`,
    });
  }

  return cards;
}

// ---- post copy ----------------------------------------------------------

/**
 * Reply lines: short, self-contained, and carrying one fact the thread does not
 * have. Deliberately link-free — at zero followers the reply inside somebody
 * else's thread is the whole mechanism, and a link kills its reach.
 */
export function buildReplyLines(material, limit = 10) {
  const lines = [];

  for (const s of material.stats) {
    lines.push(`${s.value} — ${s.label}.${s.note ? ` ${s.note}.` : ""}`);
  }
  for (const c of material.contrasts) {
    for (const [l, r] of c.rows.slice(0, 3)) {
      if (l && r) lines.push(`${c.left}: ${l}\n${c.right}: ${r}`);
    }
  }
  for (const f of material.faqs) lines.push(`${f.q} ${f.a}`);
  for (const s of material.sections) {
    if (s.deck && s.deck.length > 40) lines.push(s.deck);
  }

  const seen = new Set();
  return lines
    .filter((l) => l.length <= X_LIMIT && !seen.has(l) && seen.add(l))
    .slice(0, limit);
}

/**
 * The 20% — the one post that carries the link.
 *
 * Take as much of the hook as the budget allows rather than always the first
 * sentence: our pull quotes are built as two-part lines, and cutting after the
 * first half reliably throws away the half that lands.
 */
export function buildTweet(row, material, shareUrl) {
  const source = material.pullquotes[0] || material.callouts[0] || material.lead;
  const room = X_LIMIT - shareUrl.length - 2; // the two newlines before the link
  const parts = sentences(source);

  let hook = "";
  for (const s of parts) {
    const next = hook ? `${hook} ${s}` : s;
    if (next.length > room) break;
    hook = next;
  }
  if (!hook) {
    const first = parts[0] ?? strip(row.title);
    hook = first.length <= room ? first : `${first.slice(0, Math.max(0, room - 1)).trimEnd()}…`;
  }
  return `${hook}\n\n${shareUrl}`;
}

/** Instagram caption: opening line, one or two facts, then where to go. */
export function buildInstagram(row, material) {
  const out = [];
  const closer = material.pullquotes[material.pullquotes.length - 1] ?? "";
  // The lead opens and the pull quote closes. Reaching for the quote in both
  // places prints the same sentence twice, which is how it read at first.
  const opener = sentences(material.lead)[0] || sentences(closer)[0];
  if (opener) out.push(opener);

  const facts = material.stats.slice(0, 3).map((s) => `${s.value} — ${s.label}`);
  if (facts.length) out.push("", ...facts);

  if (closer && closer !== opener) out.push("", closer);

  out.push("", `Full piece: scoutgamer.com${CATEGORY_PATHS[row.category] ?? "/radar"}/${row.slug}`);
  return out.join("\n");
}

/**
 * Copy for a page that has no article body — a World Cup hub, a squad page, an
 * arena bracket. There is nothing to extract, so this composes from the title
 * and the link alone and nothing more, which is all the paid model was ever
 * given for these pages either.
 */
export function buildPresetCopy(title, category, shareUrl) {
  const t = strip(title);
  const label =
    { "wc-2026": "World Cup 2026", radar: "Player radar", lists: "Scout list", "tactics-lab": "Tactics lab", transfer: "Transfers", arena: "Arena" }[
      category
    ] ?? "";
  const tweet = `${t}\n\n${shareUrl}`;
  const instagram = [t, "", label ? `${label} · Scout Gamer` : "Scout Gamer", "", shareUrl]
    .filter((l, i, a) => l !== "" || a[i - 1] !== "")
    .join("\n");
  return {
    tweet: tweet.length <= X_LIMIT ? tweet : `${t.slice(0, Math.max(0, X_LIMIT - shareUrl.length - 4)).trimEnd()}…\n\n${shareUrl}`,
    instagram,
  };
}

// ---- subreddit routing --------------------------------------------------

/**
 * Only subs I am reasonably sure exist. The pack tells you to read the rules
 * anyway, because self-promo policy is per-sub and changes.
 */
export const SUB_RULES = [
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

export function routeSubs(haystack) {
  return SUB_RULES.filter((r) => r.always || r.match?.test(haystack));
}

/** Everything in the piece that a sub-matcher should see. */
export function haystackOf(row, material) {
  return [
    row.title,
    material.lead,
    ...material.callouts,
    ...material.sections.map((s) => `${s.heading} ${s.body}`),
    ...material.listItems,
  ].join(" ");
}

/** What the piece cannot supply, named rather than filled in. */
export function gapsOf(row, material) {
  const gaps = [];
  if (row.status && row.status !== "published") {
    gaps.push(`status is "${row.status}" — the link will 404 for anyone who clicks it`);
  }
  if (!row.cover_image) gaps.push("no cover image — Style A is unavailable, but the four variants do not need one");
  if (material.stats.length === 0) gaps.push("no stat block — the reply lines and the video will be thin");
  if (material.contrasts.length === 0) gaps.push("no vs block — no ready-made contrast to post");
  if (material.pullquotes.length === 0) gaps.push("no pull quote — no closing line to end a video on");
  return gaps;
}
