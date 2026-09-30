#!/usr/bin/env node
/**
 * import-fc-players.mjs — map an EA ratings download (scripts/fetch-ea-ratings.mjs)
 * onto fc_players and report what would change.
 *
 * --dry reads the DB (anon key) and writes nothing.
 * --write (service-role key) does, in this order:
 *   1. backs the whole table up to backups/fc_players-<date>.json
 *   2. INSERTS the new rows alongside the old ones
 *   3. deletes the old rows (id <= the highest id before the insert)
 * Insert-then-delete means the live site never sees an empty table; for a
 * few seconds a name can match both versions.
 * BEFORE --write: run scripts/freeze-cards.mjs AND deploy it, or the live
 * articles' cards change under their text.
 *
 * Mapping decisions, so they are not rediscovered:
 * - Men's football only. The site's cards are men's; EA's women's players share
 *   surnames with men's players and would hijack the renderers' fuzzy matches.
 * - name = EA common name when it has one ("Alisson", "Vini Jr."), else first + last.
 * - age = full years at the fetch date (the table has no birthdate column).
 * - Goalkeepers keep the table's convention: the six outfield facets are 0.
 * - photo_url = EA's portrait (the current sofifa URLs are partly wrong: three
 *   different "Alisson" rows share one photo).
 * - EA's placeholder names for unlicensed Serie A clubs are mapped to the real
 *   clubs here (formerly supabase/fix_fc_players_club_names.sql, run by hand).
 *
 *   node scripts/import-fc-players.mjs --from <download.json> --dry
 *   node scripts/import-fc-players.mjs --from <download.json> --write
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const from = args.includes("--from") ? args[args.indexOf("--from") + 1] : null;
const write = args.includes("--write");
if (!from || args.includes("--dry") === write) {
  console.error("Usage: node scripts/import-fc-players.mjs --from <download.json> (--dry | --write)");
  process.exit(1);
}

for (const line of fs.existsSync(path.join(ROOT, ".env.local"))
  ? fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")
  : []) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  write ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
if (write && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("--write needs SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

// EA placeholder → real club (unlicensed Serie A clubs). Lazio is licensed from FC 27.
const CLUB_FIX = { "Lombardia FC": "Inter", "Milano FC": "AC Milan", "Bergamo Calcio": "Atalanta", "Latium": "Lazio" };

const download = JSON.parse(fs.readFileSync(from, "utf8"));
const asOf = new Date(download.fetched_at);

function ageAt(birthdate) {
  // EA format: "12/20/1998 0:00" (M/D/YYYY)
  const [mdy] = String(birthdate ?? "").split(" ");
  const [mo, d, y] = mdy.split("/").map(Number);
  if (!y) return null;
  let age = asOf.getUTCFullYear() - y;
  if (asOf.getUTCMonth() + 1 < mo || (asOf.getUTCMonth() + 1 === mo && asOf.getUTCDate() < d)) age--;
  return age;
}

const v = (it, k) => it.stats?.[k]?.value ?? 0;
function toRow(it) {
  const gk = it.position?.shortLabel === "GK";
  return {
    name: (it.commonName || `${it.firstName ?? ""} ${it.lastName ?? ""}`).replace(/\s+/g, " ").trim(),
    overall: it.overallRating,
    position: it.position?.shortLabel ?? null,
    club: CLUB_FIX[it.team?.label] ?? it.team?.label ?? null,
    league: it.leagueName ?? null,
    nationality: it.nationality?.label ?? null,
    age: ageAt(it.birthdate),
    pace: gk ? 0 : v(it, "pac"),
    shooting: gk ? 0 : v(it, "sho"),
    passing: gk ? 0 : v(it, "pas"),
    dribbling: gk ? 0 : v(it, "dri"),
    defending: gk ? 0 : v(it, "def"),
    physical: gk ? 0 : v(it, "phy"),
    photo_url: it.avatarUrl ?? null,
  };
}

const men = download.items.filter((i) => i.gender?.label === "Men's Football");
const rows = men.map(toRow).filter((r) => r.name && r.overall > 0);

// current table, paged (PostgREST caps a select at 1000 rows)
const old = [];
for (let off = 0; ; off += 1000) {
  const { data, error } = await supabase
    .from("fc_players").select(write ? "*" : "id,name,overall,club,league,age,position")
    .order("id").range(off, off + 999);
  if (error) throw new Error(error.message);
  old.push(...data);
  if (data.length < 1000) break;
}

const count = (arr, f) => arr.reduce((m, r) => ((m[f(r)] = (m[f(r)] ?? 0) + 1), m), {});
const key = (n) => n.toLowerCase();
const byOld = new Map();
for (const r of old) (byOld.get(key(r.name)) ?? byOld.set(key(r.name), []).get(key(r.name))).push(r);
const byNew = new Map();
for (const r of rows) (byNew.get(key(r.name)) ?? byNew.set(key(r.name), []).get(key(r.name))).push(r);

// compare only unambiguous names (one row each side)
let same = 0, clubMoved = 0, ratingUp = 0, ratingDown = 0, ratingSame = 0;
const moves = [];
for (const [k, [n, ...restN]] of byNew) {
  const o = byOld.get(k);
  if (restN.length || !o || o.length !== 1) continue;
  same++;
  const [p] = o;
  if (p.club !== n.club) { clubMoved++; if (moves.length < 12 && n.overall >= 80) moves.push(`${n.name}: ${p.club} → ${n.club}`); }
  if (n.overall > p.overall) ratingUp++; else if (n.overall < p.overall) ratingDown++; else ratingSame++;
}
const onlyNew = [...byNew.keys()].filter((k) => !byOld.has(k)).length;
const onlyOld = [...byOld.keys()].filter((k) => !byNew.has(k)).length;

const oldLeagues = new Set(old.map((r) => r.league));
const newLeagues = count(rows, (r) => r.league);
const PLACEHOLDERS = Object.keys(CLUB_FIX);

console.log(`\nDOWNLOAD  ${download.fetched_at} · ${download.edition_check}`);
console.log(`          ${download.items.length} rows → ${rows.length} men's (${rows.filter((r) => r.position === "GK").length} GK)`);
console.log(`TABLE NOW ${old.length} rows\n`);

console.log(`NAMES     ${same} unambiguous names in both · ${onlyNew} only in FC 27 · ${onlyOld} only in the old table`);
console.log(`CLUB      ${clubMoved} of ${same} (${((clubMoved / same) * 100).toFixed(0)}%) at a different club`);
for (const m of moves) console.log(`            ${m}`);
console.log(`RATING    up ${ratingUp} · down ${ratingDown} · same ${ratingSame}`);

const ages = count(rows, (r) => r.age);
console.log(`\nAGE       youngest ${Math.min(...rows.map((r) => r.age ?? 99))} · under-18: ${rows.filter((r) => r.age < 18).length} (old table: ${old.filter((r) => r.age < 18).length}) · 16: ${ages[16] ?? 0} · 17: ${ages[17] ?? 0}`);
console.log(`MLS       ${newLeagues["MLS"] ?? 0} (old table: ${old.filter((r) => r.league === "MLS").length})`);

console.log(`\nLEAGUES   ${Object.keys(newLeagues).length} (old table: ${oldLeagues.size})`);
const renamed = Object.keys(newLeagues).filter((l) => !oldLeagues.has(l));
const gone = [...oldLeagues].filter((l) => !(l in newLeagues));
console.log(`          new labels: ${renamed.join(" · ") || "none"}`);
console.log(`          labels no longer present: ${gone.join(" · ") || "none"}`);
console.log(`PLACEHOLDER CLUBS  ${PLACEHOLDERS.map((c) => `${c}: ${rows.filter((r) => r.club === c).length}`).join(" · ")}`);

const dupes = [...byNew.values()].filter((a) => a.length > 1);
console.log(`\nDUPLICATE NAMES  ${dupes.length} names on 2+ rows (renderers pick the highest overall)`);

const probe = ["Cavan Sullivan", "Max Dowman", "Rio Ngumoha", "Lamine Yamal", "Estêvão", "Kees Smit", "Pau Cubarsí", "Franco Mastantuono"];
console.log(`\nPROBES`);
for (const n of probe) {
  const hit = byNew.get(key(n));
  console.log(`  ${n.padEnd(20)} ${hit ? hit.map((r) => `${r.overall} ${r.position} ${r.club} (${r.age})`).join(" | ") : "— not in FC 27"}`);
}
if (!write) {
  console.log("\n--dry: nothing written.");
  process.exit(0);
}

// ── write ────────────────────────────────────────────────────────────
const stamp = new Date().toISOString().slice(0, 10);
const backupDir = path.join(ROOT, "backups");
fs.mkdirSync(backupDir, { recursive: true });
const backupFile = path.join(backupDir, `fc_players-${stamp}.json`);
fs.writeFileSync(backupFile, JSON.stringify(old));
const backedUp = JSON.parse(fs.readFileSync(backupFile, "utf8")).length;
if (backedUp !== old.length) throw new Error(`backup has ${backedUp} rows, table has ${old.length} — stopping`);
console.log(`\nBACKUP    ${path.relative(ROOT, backupFile)} · ${backedUp} rows`);

const oldMaxId = Math.max(...old.map((r) => r.id));
let inserted = 0;
for (let i = 0; i < rows.length; i += 500) {
  const chunk = rows.slice(i, i + 500);
  const { error: e } = await supabase.from("fc_players").insert(chunk);
  if (e) {
    console.error(`INSERT failed at row ${i}: ${e.message}`);
    console.error(`Old rows untouched. ${inserted} new rows were added (id > ${oldMaxId}); remove them with:`);
    console.error(`  DELETE FROM fc_players WHERE id > ${oldMaxId};`);
    process.exit(1);
  }
  inserted += chunk.length;
}
console.log(`INSERT    ${inserted} new rows (id > ${oldMaxId})`);

const { count: newCount } = await supabase.from("fc_players").select("*", { count: "exact", head: true }).gt("id", oldMaxId);
if (newCount !== rows.length) {
  console.error(`Expected ${rows.length} new rows, found ${newCount}. Old rows NOT deleted — check before continuing.`);
  process.exit(1);
}

const { error: delErr } = await supabase.from("fc_players").delete().lte("id", oldMaxId);
if (delErr) {
  console.error(`DELETE failed: ${delErr.message}. Table holds old + new; delete id <= ${oldMaxId} by hand.`);
  process.exit(1);
}
const { count: finalCount } = await supabase.from("fc_players").select("*", { count: "exact", head: true });
console.log(`DELETE    old rows (id <= ${oldMaxId}) · table now ${finalCount} rows`);
console.log(`\nRestore if needed: the backup file holds every old row with its id.`);
