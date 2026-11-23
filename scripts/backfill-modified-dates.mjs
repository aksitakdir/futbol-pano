#!/usr/bin/env node
/**
 * backfill-modified-dates.mjs — one-off: give the live articles that were really
 * updated after going live their content_updated_at (the page's dateModified,
 * sitemap <lastmod> and visible "Updated" date).
 *
 * WHY: the column was added on 24 Nov 2026 (supabase/migrations/
 * contents_content_updated_at.sql). Before that the site sent Google no modified
 * date at all, so months of real updates (figure refreshes, corrections, result
 * updates) were invisible. This writes the last substantive post-publish change of
 * each, from the evidence below, and nothing else.
 *
 * What counts: new figures, a corrected fact, a result, a rewritten section.
 * Left out on purpose: edits before go-live (#177's refreshes, #168, #170), link-only
 * sentences (#171, #172, #135, #44's Nico Paz link), a lead sentence for the snippet
 * (#141, #144, #145), launch-day polish within hours of go-live (#158, #164, #169's
 * 29 Oct refresh), structure-only conversions (#152's table), cover and caption swaps.
 *
 * Times are when the write happened, from the backup file names under backups/ and
 * commit times; both use the Mac's clock, about two minutes behind the database. Only
 * the day is shown on the page (UTC).
 *
 *   node scripts/backfill-modified-dates.mjs           # dry run
 *   node scripts/backfill-modified-dates.mjs --write   # owner's OK first
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.existsSync(path.join(ROOT, ".env.local")) ? fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n") : []) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const UPDATES = [
  { id: 176, at: "2026-11-23T17:20:25Z", what: "intro: scoring-chart sentence dated, Malen's four at Parma", evidence: "backups/sections-176-before-patch-2026-11-23T17-20-25-697Z.json" },
  { id: 136, at: "2026-11-15T22:48:32Z", what: "full FC 27 rebuild (scout-publish --update)", evidence: "backups/sections-136-before-patch-2026-11-15T21-00-07-459Z.json vs live; data/freshness" },
  { id: 169, at: "2026-11-15T22:50:42Z", what: "two factual corrections (Jacquet's move and injury, Yoro)", evidence: "backups/sections-169-before-patch-2026-11-15T22-50-42-852Z.json" },
  { id: 163, at: "2026-11-15T22:48:40Z", what: "Leoni paragraph: return pushed to the November break", evidence: "backups/sections-163-before-patch-2026-11-15T22-48-40-126Z.json" },
  { id: 174, at: "2026-11-15T20:41:54Z", what: "Golden Boy result update after the 9 Nov announcement", evidence: "backups/sections-174-before-patch-2026-11-15T20-{00,02,41}*.json" },
  { id: 167, at: "2026-10-27T20:34:44Z", what: "Kopa Trophy result update, predictions to past tense", evidence: "backups/sections-167-before-patch-2026-10-27T20-34-44-177Z.json" },
  { id: 148, at: "2026-10-24T18:25:40Z", what: "transfer mechanics rewritten (buy-back, Como's payment)", evidence: "backups/sections-148-before-patch-2026-10-24T18-{15-33,25-40}*.json" },
  { id: 159, at: "2026-10-24T15:29:52Z", what: "age criterion corrected, Beltrán's heading", evidence: "backups/sections-159-before-patch-2026-10-24T15-29-52-704Z.json" },
  { id: 153, at: "2026-10-12T00:20:32Z", what: "10 verified corrections", evidence: "backups/sections-153-before-patch-2026-10-12.json; data/corrections/2026-10-12-published.json" },
  { id: 155, at: "2026-10-12T00:20:32Z", what: "7 verified corrections", evidence: "backups/sections-155-before-patch-2026-10-12.json; data/corrections/2026-10-12-published.json" },
  { id: 157, at: "2026-09-26T01:14:01Z", what: "corrected in place: the false 'EA FC does not carry MLS' claim", evidence: "commit ed525c3" },
  ...[28, 29, 30, 31, 32, 33].map((id) => ({ id, at: "2026-06-14T04:12:40Z", what: "tactics-lab archetype expanded to 2000+ words", evidence: "commit 559c181" })),
];

const write = process.argv.includes("--write");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (write && !key) {
  console.error("--write needs SUPABASE_SERVICE_ROLE_KEY in .env.local (anon writes fail silently under RLS).");
  process.exit(1);
}
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const { data: rows, error } = await supabase.from("contents").select("*").in("id", UPDATES.map((u) => u.id));
if (error) throw error;
if (rows.length && !("content_updated_at" in rows[0])) {
  console.error("contents.content_updated_at does not exist yet: run supabase/migrations/contents_content_updated_at.sql first.");
  process.exit(1);
}

/** Pages are cached up to a day: refresh the written articles and the pages that list them. */
async function revalidate(changes) {
  if (!changes.length) return;
  // A write without a refresh leaves the dynamic sitemap's lastmod disagreeing with the
  // cached page's modified date for up to a day: count it as a failure, not a note.
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`  FAIL  no ADMIN_PASSWORD in .env.local: revalidate these by hand: ${changes.map((c) => c.slug).join(", ")}`);
    problems++;
    return;
  }
  const res = await fetch("https://www.scoutgamer.com/api/revalidate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Basic ${Buffer.from(`scout:${process.env.ADMIN_PASSWORD}`).toString("base64")}`,
    },
    body: JSON.stringify({ changes }),
  }).catch((err) => ({ ok: false, status: err.message }));
  if (res.ok) console.log(`  revalidated ${changes.length} article(s) and their hubs`);
  else {
    console.log(`  FAIL  revalidation answered ${res.status}: retry for ${changes.map((c) => c.slug).join(", ")}`);
    problems++;
  }
}

let problems = 0;
const written = [];
for (const u of UPDATES) {
  const row = rows.find((r) => Number(r.id) === u.id);
  const label = `#${u.id} ${row?.slug ?? "?"}`;
  if (!row) { console.log(`  MISSING ${label}`); problems++; continue; }
  if (row.status !== "published") { console.log(`  skip    ${label}: status ${row.status}`); continue; }
  if (Date.parse(u.at) <= Date.parse(row.created_at)) { console.log(`  skip    ${label}: ${u.at} is not after go-live ${row.created_at}`); problems++; continue; }
  if (row.content_updated_at && Date.parse(row.content_updated_at) >= Date.parse(u.at)) {
    console.log(`  keep    ${label}: already ${row.content_updated_at}`);
    continue;
  }
  console.log(`  ${write ? "write" : "would "} ${label}: published ${row.created_at.slice(0, 10)} → updated ${u.at.slice(0, 10)} (${u.what})`);
  if (!write) continue;
  const { data: back, error: e } = await supabase.from("contents").update({ content_updated_at: u.at }).eq("id", u.id).select("content_updated_at").single();
  if (e || !back || Date.parse(back.content_updated_at) !== Date.parse(u.at)) { console.log(`    ERROR ${e?.message ?? "read-back mismatch"}`); problems++; }
  else written.push({ category: row.category, slug: row.slug });
}
if (write) await revalidate(written);

if (!write) console.log("\n--dry: nothing written. Pass --write once the owner has agreed; then revalidate the pages.");
process.exit(problems ? 2 : 0);
