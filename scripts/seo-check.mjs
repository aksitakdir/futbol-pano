#!/usr/bin/env node
/**
 * Raw-HTML SEO guard — checks what Googlebot sees on its FIRST pass (no JS).
 *
 * WHY: on 2026-07-22 we found every category page rendered its article list in a
 * client component, so the served HTML contained ZERO article links. Pages were
 * in the sitemap and returned 200, and they looked perfect in a browser — because
 * a browser runs the JavaScript that Googlebot's first pass does not. Six articles
 * sat at 0 impressions for weeks. Browser-based verification cannot catch this
 * class of bug; only reading the raw HTML can.
 *
 * WHY v2 (2026-10-19): v1 counted links anywhere in the HTML, so it passed while
 * every hub's links lived in the footer index and /lists, /radar and /articles had
 * no <main> and no <h1> in production (a client-render bailout). It also matched
 * slugs with a regex that missed /tactics-lab/false-9 and /radar/Kodaisano and
 * counted /world-cup-2026/schedule as an article, and it never looked at / or
 * /articles. v2:
 *   - takes the article set from the sitemap, so "all" means every published piece;
 *   - counts only <a href> in <body>, outside <script>, and splits page BODY from
 *     FOOTER links, so moving links into the footer can no longer pass;
 *   - checks each hub links its section's newest piece (publish → revalidation);
 *   - samples the newest and oldest article of each section;
 *   - checks canonicals, and reports <main>, <h1> and client-render bailouts.
 * ROUTES holds today's floor. Each phase of the server-rendering plan (docs/TODO.md)
 * raises its route's numbers and switches on its `require` flags in the same change.
 *
 * Usage:
 *   node scripts/seo-check.mjs                         # against production
 *   node scripts/seo-check.mjs http://localhost:3001   # against `next start`
 *   node scripts/seo-check.mjs --record                # print current counts, no verdict
 *
 * Run it against production or `next build && next start`, never `next dev`: dev
 * streams Suspense content that production bails out of, so dev looks healthier
 * than what Googlebot gets. Exits non-zero if any check fails.
 */

const args = process.argv.slice(2);
const BASE = (args.find((a) => !a.startsWith("--")) || "https://www.scoutgamer.com").replace(/\/$/, "");
const RECORD = args.includes("--record");
const UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const ORIGINS = ["https://www.scoutgamer.com", "https://scoutgamer.com", BASE];

const SECTIONS = ["lists", "radar", "tactics-lab", "transfers", "world-cup-2026"];
/** Two-segment sitemap paths that are hub pages, not articles. */
const NOT_ARTICLES = new Set(["/world-cup-2026/schedule", "/world-cup-2026/squads"]);
/** A piece published less than this long ago may not be on its hub yet. */
const FRESH_GRACE_MS = 15 * 60_000;

/**
 * The floor for each route, as measured on 2026-10-19 (commit 61b6752).
 *   body  — unique article links in the page body (outside <footer>), at least; "all" as below
 *   total — body + footer, at least; "all" = every sitemap article of `section` ("*": all sections)
 *   require.h1 / require.main — switched on by the phase that server-renders the route
 */
const ROUTES = [
  // Body: the "In focus" spotlights (2-6 links, data-driven). Total: the footer index, 3 × 15.
  { path: "/", body: 1, total: 45, fresh: ["lists", "radar", "tactics-lab"] },
  // P1 (2026-10-19): the section hubs render every piece in the page body.
  { path: "/lists", section: "lists", body: "all", total: "all", require: { h1: true, main: true } },
  { path: "/radar", section: "radar", body: "all", total: "all", require: { h1: true, main: true } },
  { path: "/tactics-lab", section: "tactics-lab", body: "all", total: "all", require: { h1: true, main: true } },
  { path: "/transfers", section: "transfers", body: 0, total: "all" },
  { path: "/world-cup-2026", section: "world-cup-2026", body: 0, total: "all" },
  // Every published piece: the newest as cards, the rest as plain links.
  { path: "/articles", section: "*", body: "all", total: "all", require: { h1: true, main: true }, fresh: SECTIONS },
];
/** Sibling links an article must carry (body + footer today; body once P2 lands). */
const ARTICLE_SIBLINGS = { body: 0, total: 6 };

let failures = 0;
let warnings = 0;
const fail = (m) => { failures++; console.log(`  FAIL  ${m}`); };
const warn = (m) => { warnings++; console.log(`  warn  ${m}`); };
const pass = (m) => console.log(`  ok    ${m}`);

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers: { "User-Agent": UA }, redirect: "manual" });
  return {
    status: res.status,
    html: await res.text(),
    cache: [res.headers.get("x-vercel-cache"), res.headers.get("age") && `age ${res.headers.get("age")}s`].filter(Boolean).join(", "),
  };
}

function normalize(href) {
  let p = href.replace(/&amp;/g, "&");
  for (const o of ORIGINS) if (p.startsWith(o)) p = p.slice(o.length);
  if (!p.startsWith("/") || p.startsWith("//")) return null;
  p = p.split(/[?#]/)[0];
  if (p.length > 1) p = p.replace(/\/$/, "");
  try { return decodeURI(p); } catch { return p; }
}

/** What Googlebot's first pass can follow: <a href> in <body>, outside scripts, split at <footer>. */
function parse(html) {
  const bodyStart = html.search(/<body[\s>]/i);
  let body = bodyStart === -1 ? html : html.slice(bodyStart);
  body = body.replace(/<script[\s\S]*?<\/script>/gi, "");
  const footers = body.match(/<footer[\s>][\s\S]*?<\/footer>/gi) ?? [];
  const page = body.replace(/<footer[\s>][\s\S]*?<\/footer>/gi, "");
  const hrefs = (s) => [...s.matchAll(/<a\s[^>]*?href="([^"]*)"/gi)].map((m) => normalize(m[1])).filter(Boolean);
  return {
    pageHrefs: hrefs(page),
    footerHrefs: hrefs(footers.join("\n")),
    main: (page.match(/<main[\s>]/gi) ?? []).length,
    h1: (page.match(/<h1[\s>]/gi) ?? []).length,
    bailouts: (page.match(/BAILOUT_TO_CLIENT_SIDE_RENDERING/g) ?? []).length,
    loading: /LOADING\.\.\./.test(page.replace(/<[^>]+>/g, " ")),
    dev: html.includes("next-devtools"),
    canonical: html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i)?.[1] ?? html.match(/<link[^>]*href="([^"]*)"[^>]*rel="canonical"/i)?.[1] ?? null,
    title: html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "",
  };
}

const articleLinks = (hrefs, articles, self) => new Set(hrefs.filter((h) => articles.has(h) && h !== self));

// ── Sitemap: the published article set ───────────────────────────────────────
console.log(`\nRaw-HTML SEO check against ${BASE}${RECORD ? " (record mode)" : ""}\n`);
console.log("Crawl basics:");
const articles = new Map(); // path → { section, lastmod }
try {
  const { status, html } = await get("/robots.txt");
  status === 200 ? pass("/robots.txt reachable") : fail(`/robots.txt returned HTTP ${status}`);
} catch (e) { fail(`/robots.txt — ${e.message}`); }
try {
  const { status, html } = await get("/sitemap.xml");
  if (status !== 200) fail(`/sitemap.xml returned HTTP ${status}`);
  for (const u of html.match(/<url>[\s\S]*?<\/url>/g) ?? []) {
    const path = normalize(u.match(/<loc>([^<]*)<\/loc>/)?.[1] ?? "");
    const [, section, slug, extra] = (path ?? "").split("/");
    if (!path || extra !== undefined || !slug || !SECTIONS.includes(section) || NOT_ARTICLES.has(path)) continue;
    articles.set(path, { section, lastmod: Date.parse(u.match(/<lastmod>([^<]*)<\/lastmod>/)?.[1] ?? "") || 0 });
  }
  const total = (html.match(/<loc>/g) ?? []).length;
  total < 20 ? fail(`sitemap has only ${total} URLs`) : pass(`sitemap — ${total} URLs, ${articles.size} articles`);
} catch (e) { fail(`/sitemap.xml — ${e.message}`); }

if (articles.size === 0) {
  console.log("\nNo articles in the sitemap — nothing else can be checked.\n");
  process.exit(1);
}
const articleSet = new Set(articles.keys());
const bySection = (s) => [...articles].filter(([, a]) => s === "*" || a.section === s).sort((a, b) => b[1].lastmod - a[1].lastmod);
const newest = (s) => bySection(s).find(([, a]) => Date.now() - a.lastmod > FRESH_GRACE_MS)?.[0];

// ── Hubs and the homepage ─────────────────────────────────────────────────────
const record = [];
console.log("\nHubs: article links in the page body and in the footer (Googlebot, no JS):");
let devWarned = false;
for (const r of ROUTES) {
  try {
    const { status, html, cache } = await get(r.path);
    if (status !== 200) { fail(`${r.path} returned HTTP ${status}`); continue; }
    const p = parse(html);
    if (p.dev && !devWarned) {
      devWarned = true;
      warn("this is a `next dev` server: it streams content production bails out of. Use production or `next start`.");
    }
    const body = articleLinks(p.pageHrefs, articleSet, r.path);
    const all = new Set([...body, ...articleLinks(p.footerHrefs, articleSet, r.path)]);
    const want = r.total === "all" ? bySection(r.section).length : r.total;
    const wantBody = r.body === "all" ? bySection(r.section).length : r.body;
    const facts = `body ${body.size}, footer+body ${all.size}, main ${p.main}, h1 ${p.h1}${p.bailouts ? `, ${p.bailouts} client bailout(s)` : ""}${cache ? ` [${cache}]` : ""}`;
    record.push({ path: r.path, body: body.size, total: all.size, main: p.main, h1: p.h1, bailouts: p.bailouts });
    if (RECORD) { console.log(`  ·     ${r.path} — ${facts}`); continue; }

    const problems = [];
    if (body.size < wantBody) {
      const missing = r.body === "all" ? bySection(r.section).map(([path]) => path).filter((path) => !body.has(path)) : [];
      problems.push(`body has ${body.size} article links, floor is ${r.body === "all" ? `all ${wantBody}` : wantBody}${missing.length ? ` — missing ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? ` +${missing.length - 3}` : ""}` : ""}`);
    }
    if (all.size < want) {
      const missing = r.total === "all" ? bySection(r.section).map(([path]) => path).filter((path) => !all.has(path)) : [];
      problems.push(`${all.size} article links in all, expected ${r.total === "all" ? `all ${want}` : `>= ${want}`}${missing.length ? ` — missing ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? ` +${missing.length - 3}` : ""}` : ""}`);
    }
    if (r.require?.main && p.main < 1) problems.push("no <main> in the raw HTML");
    if (r.require?.h1 && p.h1 !== 1) problems.push(`${p.h1} <h1> in the raw HTML, expected exactly 1`);
    // The hub (or home) must already link the newest piece: proof that publishing refreshed it.
    for (const s of r.fresh ?? (r.section ? [r.section] : [])) {
      const n = newest(s);
      if (n && !all.has(n)) problems.push(`does not link the newest ${s} piece ${n} — stale after a publish?`);
    }
    if (problems.length) fail(`${r.path} — ${problems.join("; ")}  (${facts})`);
    else pass(`${r.path} — ${facts}`);
    if (!r.require?.h1 && p.h1 === 0) console.log(`        note: no <h1> in the raw HTML (client-rendered page)`);
    if (p.loading) console.log(`        note: "LOADING..." placeholder in the raw HTML`);
  } catch (e) { fail(`${r.path} — request failed: ${e.message}`); }
}

// ── Articles: newest and oldest of each section ───────────────────────────────
console.log("\nArticles (newest and oldest per section): sibling links, title, canonical:");
for (const s of SECTIONS) {
  const list = bySection(s);
  const samples = [...new Set([list[0]?.[0], list[list.length - 1]?.[0]].filter(Boolean))];
  for (const path of samples) {
    try {
      const { status, html, cache } = await get(path);
      if (status !== 200) { fail(`${path} returned HTTP ${status}`); continue; }
      const p = parse(html);
      const siblings = new Set([...articleLinks(p.pageHrefs, articleSet, path), ...articleLinks(p.footerHrefs, articleSet, path)].filter((h) => articles.get(h)?.section === s));
      const bodySiblings = [...articleLinks(p.pageHrefs, articleSet, path)].filter((h) => articles.get(h)?.section === s).length;
      const wantSiblings = Math.min(ARTICLE_SIBLINGS.total, list.length - 1);
      const facts = `${siblings.size} sibling links (${bodySiblings} in body), h1 ${p.h1}${cache ? ` [${cache}]` : ""}`;
      if (RECORD) { console.log(`  ·     ${path} — ${facts}`); continue; }
      const problems = [];
      if (siblings.size < wantSiblings) problems.push(`${siblings.size} links to other ${s} pieces, expected >= ${wantSiblings}`);
      if (bodySiblings < ARTICLE_SIBLINGS.body) problems.push(`${bodySiblings} sibling links in the body, floor is ${ARTICLE_SIBLINGS.body}`);
      const canonical = p.canonical && normalize(p.canonical);
      if (!p.canonical) problems.push("no canonical");
      else if (canonical !== path) problems.push(`canonical points at ${p.canonical}`);
      if (/^\s*Not Found\b/i.test(p.title)) problems.push(`title is "${p.title}"`);
      problems.length ? fail(`${path} — ${problems.join("; ")}  (${facts})`) : pass(`${path} — ${facts}`);
    } catch (e) { fail(`${path} — request failed: ${e.message}`); }
  }
}

if (RECORD) {
  console.log("\nRecorded. Raise a route's floor in ROUTES when a phase moves its links into the body.\n");
  process.exit(0);
}
console.log(
  failures === 0
    ? `\nAll raw-HTML checks passed${warnings ? ` (${warnings} warning${warnings > 1 ? "s" : ""})` : ""}.\n`
    : `\n${failures} check(s) FAILED — Googlebot's first pass is missing content.\n`,
);
process.exit(failures === 0 ? 0 : 1);
