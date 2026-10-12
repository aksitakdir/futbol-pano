#!/usr/bin/env node
/**
 * patch-article-text.mjs — apply exact text corrections to an article's blocks.
 *
 * WHY: before a piece is re-shared it is re-verified (docs/SOCIAL-STRATEGY.md
 * §6.6), and the re-check finds things: a player who turned seventeen, a club
 * that went out in qualifying, an assist that was an own goal. The fixes are
 * small and exact, so they go in as exact replacements — never a rewrite —
 * with a backup, a dry run first, and the `content_en` text copy regenerated so
 * cards, pills and RSS match the page.
 *
 *   node scripts/patch-article-text.mjs edits.json            # dry run: shows every match
 *   node scripts/patch-article-text.mjs edits.json --write    # pending articles only
 *   node scripts/patch-article-text.mjs edits.json --write --published   # live pieces, owner's OK
 *
 * edits.json: [{ "article_id": 158, "edits": [{ "old": "exact text", "new": "replacement" }] }]
 *
 * `old` is matched inside every string field of every block (headings, body,
 * stats, tables, vs rows, FAQ). Markdown bold in the source is ignored when
 * matching, so a sentence copied from the rendered page still finds its block.
 * An `old` that matches nothing, or more than one place, is reported and skipped.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { sectionsToHtml } from "../lib/sections-to-html.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.existsSync(path.join(ROOT, ".env.local")) ? fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n") : []) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const write = args.includes("--write");
const allowPublished = args.includes("--published");
if (!file) {
  console.error("Usage: node scripts/patch-article-text.mjs edits.json [--write] [--published]");
  process.exit(1);
}
const batches = JSON.parse(fs.readFileSync(file, "utf8"));

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  write ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/** Every string inside a block, with a setter, so a match can be replaced in place. */
function* strings(node, set) {
  if (typeof node === "string") {
    yield { value: node, set };
    return;
  }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) yield* strings(node[i], (v) => (node[i] = v));
    return;
  }
  if (node && typeof node === "object") {
    for (const k of Object.keys(node)) if (k !== "type") yield* strings(node[k], (v) => (node[k] = v));
  }
}

const unbold = (s) => s.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/<\/?strong>/g, "");
let failed = 0;

for (const batch of batches) {
  const { data: row, error } = await supabase.from("contents").select("id,slug,status,sections_json").eq("id", batch.article_id).single();
  if (error || !row) {
    console.log(`#${batch.article_id}: ${error?.message ?? "not found"}`);
    failed++;
    continue;
  }
  console.log(`\n#${row.id} ${row.slug} (${row.status})`);
  const blocks = JSON.parse(JSON.stringify(row.sections_json));
  let applied = 0;

  for (const e of batch.edits) {
    const hits = [];
    for (const b of blocks) for (const s of strings(b, null)) if (s.value.includes(e.old) || unbold(s.value).includes(e.old)) hits.push(s);
    if (hits.length !== 1) {
      console.log(`  ✗ ${hits.length === 0 ? "no match" : `${hits.length} matches`}: “${e.old.slice(0, 90)}”`);
      failed++;
      continue;
    }
    const h = hits[0];
    const next = h.value.includes(e.old) ? h.value.replace(e.old, e.new) : unbold(h.value).replace(e.old, e.new);
    if (!h.value.includes(e.old)) console.log("    (bold formatting in this field was flattened to make the match)");
    h.set(next);
    applied++;
    console.log(`  − ${e.old}\n  + ${e.new}`);
  }

  if (!write || !applied) continue;
  if (row.status === "published" && !allowPublished) {
    console.log(`  skipped writing: #${row.id} is published — pass --published once the owner has agreed`);
    continue;
  }
  fs.mkdirSync(path.join(ROOT, "backups"), { recursive: true });
  // Timestamped, so a second patch on the same day never overwrites the first backup.
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.writeFileSync(path.join(ROOT, "backups", `sections-${row.id}-before-patch-${stamp}.json`), JSON.stringify(row.sections_json));
  const { error: e2 } = await supabase
    .from("contents")
    .update({ sections_json: blocks, content_en: sectionsToHtml(blocks) })
    .eq("id", row.id);
  console.log(e2 ? `  ERROR ${e2.message}` : `  written: ${applied} edit(s); backup in backups/`);
}
if (!write) console.log("\n--dry: nothing written. Pass --write (and --published for live pieces) to apply.");
process.exit(failed ? 2 : 0);
