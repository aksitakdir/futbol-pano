#!/usr/bin/env node
/**
 * freeze-cards.mjs — record what every published article's player cards show
 * today, so a new fc_players dataset cannot rewrite them.
 *
 * RUN THIS BEFORE EVERY fc_players IMPORT. An article's text quotes the ratings
 * of the game it was written against; the cards used to be a live lookup, so
 * the day a new dataset landed the text said 68 and the card said 74.
 *
 * Reads the DB (anon key), writes data/card-snapshots.json. Commit the file:
 * the site reads it at build time (lib/card-snapshot-server.ts). Articles that
 * are already in the file are never touched, so each keeps the version of the
 * game it was frozen against. Pending articles are skipped — they get updated
 * to the new game before they publish.
 *
 * It resolves names with the same tiers the renderers use (exact → first two
 * words → last name) and records the tier, so a renderer that stops earlier
 * can ignore a match it would never have made (see frozenRow in
 * lib/card-snapshot.ts). A name with no match is stored as null: after the
 * import it stays card-less instead of suddenly gaining one.
 *
 *   node scripts/freeze-cards.mjs --dataset fc26-kaggle-2025-09 --dry
 *   node scripts/freeze-cards.mjs --dataset fc26-kaggle-2025-09
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "data", "card-snapshots.json");

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const dataset = args[args.indexOf("--dataset") + 1];
if (!args.includes("--dataset") || !dataset || dataset.startsWith("--")) {
  console.error("Usage: node scripts/freeze-cards.mjs --dataset <label> [--dry]");
  console.error("  <label> names the fc_players data being frozen, e.g. fc26-kaggle-2025-09");
  process.exit(1);
}

for (const line of fs.existsSync(path.join(ROOT, ".env.local"))
  ? fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")
  : []) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}
const supabase = createClient(url, key);

const COLS = "name,overall,pace,shooting,passing,dribbling,defending,physical,position,club,league,age,photo_url";
const EMBED_RE = /<!--\s*scout-player:\s*([\s\S]*?)\s*-->/gi;

const cardKey = (name) => name.replace(/\s+/g, " ").trim().toLowerCase();

/** Every player name an article can render a card for, from every render path. */
function namesIn(row) {
  const names = new Set();
  const add = (n) => {
    if (typeof n === "string" && n.trim()) names.add(n.replace(/\s+/g, " ").trim());
  };
  const scan = (text) => {
    if (typeof text !== "string") return;
    for (const m of text.matchAll(EMBED_RE)) add(m[1]);
  };

  add(row.player_name); // hero card
  if (row.players_json) {
    try {
      const arr = typeof row.players_json === "string" ? JSON.parse(row.players_json) : row.players_json;
      if (Array.isArray(arr)) for (const p of arr) add(typeof p === "string" ? p : p?.name);
    } catch { /* not JSON — nothing renders from it either */ }
  }
  scan(row.content_en);
  scan(row.content);
  for (const b of Array.isArray(row.sections_json) ? row.sections_json : []) {
    if (b?.type === "player") add(b.name);
    for (const v of Object.values(b ?? {})) scan(v);
  }
  return [...names];
}

/** The same tiers as app/components/article-player-embed.tsx and lib/player-resolver.ts. */
async function resolve(name) {
  const { data: exact } = await supabase.from("fc_players").select(COLS).ilike("name", name).limit(1).maybeSingle();
  if (exact?.overall) return { tier: "exact", row: exact };

  const two = name.split(" ").slice(0, 2).join(" ");
  const { data: fuzzy } = await supabase
    .from("fc_players").select(COLS).ilike("name", `%${two}%`)
    .order("overall", { ascending: false }).limit(1).maybeSingle();
  if (fuzzy?.overall) return { tier: "two", row: fuzzy };

  const parts = name.split(" ");
  const last = parts[parts.length - 1];
  if (parts.length >= 2 && last.length >= 4) {
    const { data: byLast } = await supabase
      .from("fc_players").select(COLS).ilike("name", `%${last}%`)
      .order("overall", { ascending: false }).limit(1).maybeSingle();
    if (byLast?.overall) return { tier: "last", row: byLast };
  }
  return null;
}

const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { articles: {} };
existing.articles ??= {};

const { data: rows, error } = await supabase
  .from("contents")
  .select("id,slug,title,status,player_name,players_json,content,content_en,sections_json")
  .eq("status", "published")
  .order("id");
if (error) {
  console.error(error.message);
  process.exit(1);
}

const frozenAt = new Date().toISOString().slice(0, 10);
const cache = new Map();
let added = 0, skipped = 0, noCards = 0, cardCount = 0, nullCount = 0;
const tiers = { exact: 0, two: 0, last: 0 };

for (const row of rows) {
  if (existing.articles[String(row.id)]) { skipped++; continue; }
  const names = namesIn(row);
  if (names.length === 0) { noCards++; continue; }

  const cards = {};
  for (const name of names) {
    const k = cardKey(name);
    if (!cache.has(k)) cache.set(k, await resolve(name));
    const hit = cache.get(k);
    cards[k] = hit;
    if (hit) { cardCount++; tiers[hit.tier]++; } else nullCount++;
  }
  existing.articles[String(row.id)] = { slug: row.slug, frozen_at: frozenAt, dataset, cards };
  added++;
  if (dry) {
    const shown = Object.entries(cards).map(([n, c]) => (c ? `${n} ${c.row.overall}` : `${n} —`)).join(", ");
    console.log(`#${row.id} ${row.slug}\n    ${shown}`);
  }
}

console.log(
  `\n${rows.length} published · ${added} frozen now · ${skipped} already frozen · ${noCards} with no player cards`,
);
console.log(`${cardCount} cards (exact ${tiers.exact}, first-two ${tiers.two}, last-name ${tiers.last}) · ${nullCount} names with no fc_players card`);

if (dry) {
  console.log("\n--dry: nothing written.");
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(existing, null, 1) + "\n");
  console.log(`Wrote ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB). Commit it before importing.`);
}
