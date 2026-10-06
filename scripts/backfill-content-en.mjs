#!/usr/bin/env node
/**
 * backfill-content-en.mjs — give block articles a text copy in content_en.
 *
 * The admin editor used to save `<p></p>` into content_en for block articles,
 * and every card snippet, card pill ("FROM CONTENT") and the RSS feed read that
 * column — so 88 of 124 published articles had none (found 2026-10-06). The
 * editor now writes the copy on save (lib/sections-to-html.mjs); this fills in
 * the rows saved before that.
 *
 * Only touches rows whose content_en has no usable text AND that have
 * sections_json. The page itself renders from sections_json, so what readers see
 * on the article does not change.
 *
 *   node scripts/backfill-content-en.mjs            # dry run: counts + samples
 *   node scripts/backfill-content-en.mjs --write    # backup, then write
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { sectionsToHtml } from "../lib/sections-to-html.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const write = process.argv.includes("--write");

for (const line of fs.existsSync(path.join(ROOT, ".env.local"))
  ? fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")
  : []) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const key = write ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key);

const usable = (s) => (s ?? "").replace(/<[^>]+>/g, "").trim().length >= 20;

const { data: rows, error } = await supabase
  .from("contents")
  .select("id,slug,status,category,content_en,sections_json")
  .order("id");
if (error) throw new Error(error.message);

const todo = rows
  .filter((r) => !usable(r.content_en) && Array.isArray(r.sections_json) && r.sections_json.length)
  .map((r) => ({ ...r, html: sectionsToHtml(r.sections_json) }))
  .filter((r) => usable(r.html));

const byStatus = todo.reduce((m, r) => ((m[r.status] = (m[r.status] ?? 0) + 1), m), {});
console.log(`${rows.length} articles · ${todo.length} need a content_en copy`, byStatus);
for (const r of todo.slice(-3)) {
  console.log(`\n#${r.id} ${r.slug} — ${r.html.length} chars\n  ${r.html.slice(0, 220).replace(/\n/g, " ")}…`);
}

if (!write) {
  console.log("\n--dry: nothing written. Pass --write to back up and fill.");
  process.exit(0);
}

const stamp = new Date().toISOString().slice(0, 10);
const backup = path.join(ROOT, "backups", `content_en-before-backfill-${stamp}.json`);
fs.mkdirSync(path.dirname(backup), { recursive: true });
fs.writeFileSync(backup, JSON.stringify(todo.map(({ id, content_en }) => ({ id, content_en }))));
console.log(`\nbackup ${path.relative(ROOT, backup)} (${todo.length} rows)`);

let ok = 0;
for (const r of todo) {
  // Re-check the column is still empty at write time; never overwrite real text.
  const { data, error: e } = await supabase
    .from("contents")
    .update({ content_en: r.html })
    .eq("id", r.id)
    .in("content_en", [r.content_en ?? "", "<p></p>"])
    .select("id");
  if (e) console.log(`#${r.id} ERROR ${e.message}`);
  else if (data.length) ok++;
  else console.log(`#${r.id} skipped — content_en changed since the read`);
}
console.log(`written ${ok}/${todo.length}`);
