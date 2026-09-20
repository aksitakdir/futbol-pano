#!/usr/bin/env node
/**
 * Scout Gamer — live site health check.
 *
 *   node scripts/health-check.mjs [baseUrl] [--quick] [--json]
 *
 * Why this exists
 * ---------------
 * Articles #146 and #148 served HTTP 404 in production for 18 and 9 days while
 * published, sitemapped and linked. Locally they returned 200; the response
 * carried `x-nextjs-prerender: 1`, a 404 frozen at build time that then survived
 * every later deploy. Nothing told us. Two finished pieces were invisible for
 * three weeks and the only reason we found out was that somebody happened to
 * click one.
 *
 * A note went on the to-do list after that and sat there unstarted for two
 * months. The first time the sweep was run by hand — 2026-09-20 — it found
 * /world-cup-2026/lists in the sitemap with no page.tsx behind it, a 404 we had
 * been feeding Googlebot from our own sitemap since launch.
 *
 * So: fetch as Googlebot, believe the raw HTML, and check the four things that
 * decide whether a published page is actually reachable. Exits non-zero, so it
 * can gate a deploy.
 *
 *   1. every sitemap URL returns 200
 *   2. no article is an orphan (fewer than 2 inbound internal links)
 *   3. every article page serves an og:image
 *   4. nothing published is missing from the sitemap — needs Supabase, optional
 *
 * Checks 1-3 read only the served HTML, so this runs in CI with no credentials
 * whatsoever. Check 4 is the one direction the sitemap cannot see itself, and
 * it switches on when the Supabase env vars are present. A check that needs no
 * setup is a check that actually runs.
 *
 * --quick skips the link graph, which is the slow part.
 */

import { readFileSync } from "fs";

/**
 * Local runs read .env.local; CI has no such file and passes the same names in
 * the environment. Only published rows are read, so the anon key is enough and
 * CI never needs the service-role key.
 */
function loadEnv() {
  try {
    const parsed = Object.fromEntries(
      readFileSync(new URL("../.env.local", import.meta.url), "utf8")
        .split("\n")
        .filter((l) => l.includes("="))
        .map((l) => {
          const i = l.indexOf("=");
          return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
        }),
    );
    return { ...parsed, ...process.env };
  } catch {
    return process.env;
  }
}

const env = loadEnv();

const GOOGLEBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const CONCURRENCY = 6;

const CATEGORY_PATHS = {
  radar: "/radar",
  lists: "/lists",
  "tactics-lab": "/tactics-lab",
  transfer: "/transfers",
  "wc-2026": "/world-cup-2026",
};

const ARTICLE_HREF = /\/(radar|lists|tactics-lab|transfers|world-cup-2026)\/([a-z0-9][a-z0-9-]*)/gi;

const args = process.argv.slice(2);
const QUICK = args.includes("--quick");
const AS_JSON = args.includes("--json");
const BASE = (args.find((a) => !a.startsWith("--")) ?? "https://www.scoutgamer.com").replace(/\/$/, "");

const say = (...a) => {
  if (!AS_JSON) console.log(...a);
};

async function fetchPage(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": GOOGLEBOT }, redirect: "manual" });
    const body = res.status === 200 ? await res.text() : "";
    return {
      url,
      status: res.status,
      // The tell from the outage: a 404 baked into the build rather than decided
      // at request time. It is also set on healthy pages, so it only matters
      // next to a bad status.
      prerendered: res.headers.get("x-nextjs-prerender") === "1",
      cache: res.headers.get("x-vercel-cache") ?? "",
      location: res.headers.get("location") ?? "",
      body,
    };
  } catch (e) {
    return { url, status: 0, prerendered: false, cache: "", location: "", body: "", error: e.message };
  }
}

/** Fetch with a small pool — enough to be quick, not enough to look like an attack. */
async function fetchAll(urls, onEach) {
  const results = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, urls.length) }, async () => {
      while (cursor < urls.length) {
        const i = cursor++;
        const r = await fetchPage(urls[i]);
        results[i] = r;
        onEach?.(r, results.filter(Boolean).length, urls.length);
      }
    }),
  );
  return results;
}

function pathOf(url) {
  try {
    return new URL(url).pathname.replace(/\/$/, "") || "/";
  } catch {
    return url;
  }
}

async function main() {
  const problems = [];
  const warnings = [];

  // ---- 1. the sitemap, as Googlebot sees it ----------------------------
  const sm = await fetchPage(`${BASE}/sitemap.xml`);
  if (sm.status !== 200) {
    console.error(`sitemap.xml returned ${sm.status || "nothing"} — cannot check anything else.`);
    process.exit(1);
  }
  const urls = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  say(`\n${BASE}\n${urls.length} URLs in sitemap.xml\n`);

  let done = 0;
  const pages = await fetchAll(urls, () => {
    done += 1;
    if (!AS_JSON && done % 25 === 0) process.stdout.write(`  fetched ${done}/${urls.length}\n`);
  });

  const bad = pages.filter((p) => p.status !== 200);
  for (const p of bad) {
    // `x-nextjs-prerender: 1` sits on Next's own not-found page too, so on its
    // own it does not distinguish the outage from a URL that simply has no
    // route. What separates them is whether a published row exists — checked
    // below — so say what to look at rather than naming a cause.
    const hint =
      p.status === 404 && p.prerendered
        ? "  <-- prerendered 404: if a page.tsx exists for it, this is the frozen-build case — redeploy without build cache"
        : "";
    problems.push(
      `${p.status || "unreachable"} ${pathOf(p.url)}${hint}${p.location ? `  -> ${p.location}` : ""}`,
    );
  }
  say(`  status        ${pages.length - bad.length}/${pages.length} return 200`);

  // The article URLs the sitemap itself advertises. Everything except the
  // database cross-check below works from these alone, which is what lets this
  // run in CI with no credentials at all — and a check that needs no setup is
  // a check that actually runs.
  // /world-cup-2026/<slug> is the article route, but schedule and squads are
  // their own folders sitting at the same depth — leaving them in would have
  // them judged as orphaned articles, and leaving the whole section out silently
  // dropped 52 published pieces from the sweep.
  const WC_NON_ARTICLE = new Set(["schedule", "squads", "lists"]);
  const articlePaths = pages.map((p) => pathOf(p.url)).filter((path) => {
    const m = path.match(/^\/(radar|lists|tactics-lab|transfers|world-cup-2026)\/([^/]+)$/);
    if (!m) return false;
    return !(m[1] === "world-cup-2026" && WC_NON_ARTICLE.has(m[2]));
  });

  // ---- 2. inbound internal links ---------------------------------------
  if (!QUICK) {
    // Compare paths case-insensitively on both sides. Some early slugs are not
    // lowercase — #5 is "Kodaisano" — and lowering only the href reported a
    // perfectly well-linked article as an orphan on the first run.
    const inbound = new Map(articlePaths.map((path) => [path.toLowerCase(), new Set()]));
    for (const page of pages) {
      if (page.status !== 200 || !page.body) continue;
      const from = pathOf(page.url).toLowerCase();
      for (const m of page.body.matchAll(ARTICLE_HREF)) {
        const target = `/${m[1]}/${m[2]}`.toLowerCase();
        if (target === from) continue;
        inbound.get(target)?.add(from);
      }
    }
    const orphans = articlePaths
      .map((path) => ({ path, n: inbound.get(path.toLowerCase())?.size ?? 0 }))
      .filter((r) => r.n < 2)
      .sort((a, b) => a.n - b.n);

    for (const r of orphans) {
      problems.push(`only ${r.n} inbound internal link${r.n === 1 ? "" : "s"}: ${r.path}`);
    }
    say(`  inbound links ${articlePaths.length - orphans.length}/${articlePaths.length} have 2 or more`);
  } else {
    say("  inbound links skipped (--quick)");
  }

  // ---- 3. share cards --------------------------------------------------
  // Read from the served HTML rather than the database, because what matters is
  // what a crawler or a chat app actually finds on the page.
  const byPath = new Map(pages.map((p) => [pathOf(p.url), p]));
  let withOg = 0;
  for (const path of articlePaths) {
    const page = byPath.get(path);
    if (!page?.body) continue;
    if (/<meta[^>]+property=["']og:image["']/i.test(page.body)) withOg += 1;
    else warnings.push(`no og:image — shares fall back to the generic card: ${path}`);
  }
  say(`  share cards   ${withOg}/${articlePaths.length} have og:image`);

  // ---- 4. the database, when we have credentials for it -----------------
  // Optional on purpose. It adds the one direction the sitemap cannot see:
  // an article that is published but never made it into the sitemap at all.
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    // Imported here, not at the top, so a credential-free CI run needs no
    // node_modules at all — checkout and node, nothing else.
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: rows, error } = await supabase
      .from("contents")
      .select("id,slug,category,status")
      .eq("status", "published");

    if (error) {
      warnings.push(`could not read contents: ${error.message}`);
    } else {
      const sitemapPaths = new Set(pages.map((p) => pathOf(p.url).toLowerCase()));
      const published = (rows ?? []).map((r) => ({
        ...r,
        path: `${CATEGORY_PATHS[r.category] ?? "/radar"}/${r.slug}`,
      }));
      const missing = published.filter((r) => !sitemapPaths.has(r.path.toLowerCase()));
      for (const r of missing) {
        problems.push(`published but absent from sitemap.xml: ${r.path}  (#${r.id})`);
      }
      say(`  sitemap       ${published.length} published articles, ${missing.length} missing from it`);
    }
  } else {
    say("  sitemap       database check skipped (no Supabase credentials)");
  }

  // ---- report ----------------------------------------------------------
  if (AS_JSON) {
    console.log(JSON.stringify({ base: BASE, checked: pages.length, problems, warnings }, null, 2));
  } else {
    if (warnings.length) {
      console.log(`\n  ${warnings.length} warning(s):`);
      for (const w of warnings) console.log(`    - ${w}`);
    }
    if (problems.length) {
      console.log(`\n  ${problems.length} problem(s):`);
      for (const p of problems) console.log(`    - ${p}`);
      console.log("");
    } else {
      console.log("\n  All health checks passed.\n");
    }
  }

  process.exit(problems.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
