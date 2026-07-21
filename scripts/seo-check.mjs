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
 * Usage:
 *   node scripts/seo-check.mjs                     # against production
 *   node scripts/seo-check.mjs http://localhost:3000
 *
 * Exits non-zero if any check fails, so it can gate a deploy.
 */

const BASE = (process.argv[2] || "https://www.scoutgamer.com").replace(/\/$/, "");

/** Each category page must expose article links in server-rendered HTML. */
const CATEGORY_PAGES = [
  { path: "/radar", linkPrefix: "/radar/", min: 5 },
  { path: "/lists", linkPrefix: "/lists/", min: 5 },
  { path: "/tactics-lab", linkPrefix: "/tactics-lab/", min: 5 },
  { path: "/transfers", linkPrefix: "/transfers/", min: 3 },
  { path: "/world-cup-2026", linkPrefix: "/world-cup-2026/", min: 5 },
];

async function getHtml(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
  });
  return { status: res.status, html: await res.text() };
}

function countLinks(html, prefix) {
  const re = new RegExp(`href="${prefix}[a-z0-9-]{8,}"`, "g");
  return new Set(html.match(re) ?? []).size;
}

let failures = 0;
const fail = (m) => { failures++; console.log(`  FAIL  ${m}`); };
const pass = (m) => console.log(`  ok    ${m}`);

console.log(`\nRaw-HTML SEO check against ${BASE}\n`);

console.log("Category pages expose article links without JavaScript:");
for (const { path, linkPrefix, min } of CATEGORY_PAGES) {
  try {
    const { status, html } = await getHtml(`${BASE}${path}`);
    if (status !== 200) { fail(`${path} returned HTTP ${status}`); continue; }
    const n = countLinks(html, linkPrefix);
    if (n < min) fail(`${path} has only ${n} article links in raw HTML (expected >= ${min}) — client-only list?`);
    else pass(`${path} — ${n} article links`);
  } catch (e) {
    fail(`${path} — request failed: ${e.message}`);
  }
}

console.log("\nCrawl basics:");
for (const p of ["/robots.txt", "/sitemap.xml"]) {
  try {
    const { status, html } = await getHtml(`${BASE}${p}`);
    if (status !== 200) fail(`${p} returned HTTP ${status}`);
    else if (p === "/sitemap.xml") {
      const n = (html.match(/<loc>/g) ?? []).length;
      n < 20 ? fail(`sitemap has only ${n} URLs`) : pass(`sitemap — ${n} URLs`);
    } else pass(`${p} reachable`);
  } catch (e) {
    fail(`${p} — ${e.message}`);
  }
}

console.log(
  failures === 0
    ? "\nAll raw-HTML checks passed.\n"
    : `\n${failures} check(s) FAILED — Googlebot's first pass is missing content.\n`,
);
process.exit(failures === 0 ? 0 : 1);
