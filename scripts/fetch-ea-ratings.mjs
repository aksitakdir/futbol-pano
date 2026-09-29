#!/usr/bin/env node
/**
 * fetch-ea-ratings.mjs — download the current EA SPORTS FC ratings from
 * ea.com/games/ea-sports-fc/ratings into a local JSON file. Touches no database.
 *
 * WHY THIS SOURCE: EA's documented feed, drop-api.ea.com/rating/ea-sports-fc,
 * kept serving the PREVIOUS game after FC 27 launched (checked 2026-09-30: 58 of
 * 60 top players identical to our FC 26 table). The ratings page itself serves
 * the current game: page 1 is embedded in its __NEXT_DATA__, later pages come
 * from the Next.js data route for the same build. If EA changes the page this
 * breaks loudly (no __NEXT_DATA__ / no ratingDetails) instead of quietly
 * returning the wrong game — check `edition_check` in the output either way.
 *
 * Kaggle's FC 27 set (mikedpad/ea-sports-fc27-player-ratings) reads the same
 * feed but is a 12 Sep 2026 pre-launch snapshot without portraits.
 *
 *   node scripts/fetch-ea-ratings.mjs --out <file.json> [--delay 700]
 */
import fs from "node:fs";

const args = process.argv.slice(2);
const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const out = arg("--out");
const delay = Number(arg("--delay", "700"));
if (!out) {
  console.error("Usage: node scripts/fetch-ea-ratings.mjs --out <file.json> [--delay ms]");
  process.exit(1);
}

const BASE = "https://www.ea.com";
const PAGE = `${BASE}/games/ea-sports-fc/ratings`;
const UA = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, as = "text", tries = 4) {
  for (let i = 1; ; i++) {
    const res = await fetch(url, { headers: UA });
    if (res.ok) return as === "json" ? res.json() : res.text();
    if (i >= tries) throw new Error(`${res.status} ${url}`);
    await sleep(delay * 4 * i);
  }
}

const html = await get(PAGE);
const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
if (!m) throw new Error("No __NEXT_DATA__ on the ratings page — EA changed the page; do not trust any fallback.");
const next = JSON.parse(m[1]);
const first = next?.props?.pageProps?.ratingDetails;
if (!first?.items) throw new Error("No ratingDetails in __NEXT_DATA__ — EA changed the page.");

const total = first.totalItems;
const perPage = first.items.length;
const pages = Math.ceil(total / perPage);
console.log(`build ${next.buildId} · ${total} players · ${pages} pages of ${perPage}`);

const items = [...first.items];
for (let p = 2; p <= pages; p++) {
  await sleep(delay);
  const url = `${BASE}/_next/data/${next.buildId}/en/games/ea-sports-fc/ratings.json?franchiseSlug=ea-sports-fc&page=${p}`;
  const data = await get(url, "json");
  const got = data?.pageProps?.ratingDetails?.items ?? [];
  items.push(...got);
  if (p % 20 === 0 || p === pages) console.log(`  page ${p}/${pages} · ${items.length}`);
}

const ids = new Set(items.map((i) => i.id));
// FC 26 → FC 27 sanity marker: a player EA only rates from FC 27 onwards.
const editionCheck = items.find((i) => `${i.firstName} ${i.lastName}` === "Cavan Sullivan");

const result = {
  source: PAGE,
  fetched_at: new Date().toISOString(),
  build_id: next.buildId,
  total_items: total,
  unique_ids: ids.size,
  edition_check: editionCheck
    ? `Cavan Sullivan present (${editionCheck.overallRating}) — current game`
    : "Cavan Sullivan MISSING — this may be the previous game",
  items,
};
fs.writeFileSync(out, JSON.stringify(result));
console.log(`${items.length} rows, ${ids.size} unique · ${result.edition_check}`);
console.log(`wrote ${out} (${(fs.statSync(out).size / 1e6).toFixed(1)} MB)`);
