/**
 * Post-publish check for one article.
 *
 *   node scripts/post-publish.mjs <slug> [baseUrl]
 *
 * A published article is not a distributed article. Three pieces have proved it:
 * the strikers list shipped during a sitemap freeze and drew nothing for a week;
 * France was published in a batch, never submitted to Search Console, and pulled
 * literally zero queries while Japan — a far smaller market — pulled 45; six
 * category pages once had no crawl path at all.
 *
 * So after every publish, check the three things that decide whether the page is
 * reachable, and print the one link that still has to be clicked by hand.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const GOOGLEBOT =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

async function fetchAsGooglebot(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": GOOGLEBOT } });
    return { status: res.status, body: res.ok ? await res.text() : "" };
  } catch (e) {
    return { status: 0, body: "", error: e.message };
  }
}

async function main() {
  const slug = process.argv[2];
  const base = (process.argv[3] ?? "https://www.scoutgamer.com").replace(/\/$/, "");
  if (!slug) {
    console.error("Usage: node scripts/post-publish.mjs <slug> [baseUrl]");
    process.exit(1);
  }

  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const { data: row } = await supabase
    .from("contents")
    .select("id,slug,title,category,status,cover_image")
    .eq("slug", slug)
    .maybeSingle();

  if (!row) {
    console.error(`No article with slug "${slug}".`);
    process.exit(1);
  }

  const path =
    { radar: "/radar", lists: "/lists", "tactics-lab": "/tactics-lab", transfer: "/transfers", "wc-2026": "/world-cup-2026" }[
      row.category
    ] ?? "/radar";
  const url = `${base}${path}/${row.slug}`;

  const problems = [];
  console.log(`\n${row.title}\n${url}\n`);

  // 1. status
  if (row.status !== "published") problems.push(`status is "${row.status}", not published`);
  console.log(`  status        ${row.status === "published" ? "published" : `${row.status}  <-- not live`}`);

  // 2. cover image — drives the OG card in every share
  console.log(`  cover image   ${row.cover_image ? "set" : "MISSING — shares fall back to the generic image"}`);
  if (!row.cover_image) problems.push("no cover image");

  // 3. the page itself, as Googlebot sees it
  const page = await fetchAsGooglebot(url);
  console.log(`  page          HTTP ${page.status || "unreachable"}`);
  if (page.status !== 200) problems.push(`page returns ${page.status || "nothing"}`);

  // 4. sitemap
  const sitemap = await fetchAsGooglebot(`${base}/sitemap.xml`);
  const inSitemap = sitemap.body.includes(`${path}/${row.slug}`);
  console.log(`  sitemap       ${inSitemap ? "listed" : "NOT LISTED (regenerates hourly — recheck later)"}`);
  if (!inSitemap) problems.push("absent from sitemap.xml");

  // 5. inbound internal links, in raw HTML, without JavaScript
  const { data: siblings } = await supabase
    .from("contents")
    .select("slug,category")
    .eq("status", "published")
    .eq("category", row.category)
    .neq("id", row.id)
    .order("created_at", { ascending: false })
    .limit(6);

  const sources = [path, ...(siblings ?? []).map((s) => `${path}/${s.slug}`)];
  let inbound = 0;
  const linking = [];
  for (const src of sources) {
    const res = await fetchAsGooglebot(`${base}${src}`);
    if (res.body.includes(`${path}/${row.slug}`)) {
      inbound += 1;
      linking.push(src);
    }
  }
  console.log(`  inbound links ${inbound} of ${sources.length} checked pages link here`);
  for (const l of linking) console.log(`                  ${l}`);
  if (inbound < 2) problems.push(`only ${inbound} inbound link(s) — needs at least 2`);

  // 6. the one step no API can do for us
  console.log(
    `\n  Request indexing (still manual — Google has no API for articles):\n` +
      `    https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(
        `${base}/`,
      )}&id=${encodeURIComponent(url)}`,
  );

  if (problems.length) {
    console.log(`\n  ${problems.length} thing(s) to fix:`);
    for (const p of problems) console.log(`    - ${p}`);
    process.exit(1);
  }
  console.log("\n  All distribution checks passed.\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
