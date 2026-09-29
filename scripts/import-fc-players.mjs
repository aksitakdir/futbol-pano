#!/usr/bin/env node
/**
 * import-fc-players.mjs — map an EA ratings download (scripts/fetch-ea-ratings.mjs)
 * onto fc_players and report what would change.
 *
 * DRY ONLY for now: it reads the DB (anon key) and writes nothing. The write
 * step (backup → replace → club-name fixes → dataset_version) is added once the
 * dry report has been reviewed. Before any write: node scripts/freeze-cards.mjs.
 *
 * Mapping decisions, so they are not rediscovered:
 * - Men's football only. The site's cards are men's; EA's women's players share
 *   surnames with men's players and would hijack the renderers' fuzzy matches.
 * - name = EA common name when it has one ("Alisson", "Vini Jr."), else first + last.
 * - age = full years at the fetch date (the table has no birthdate column).
 * - Goalkeepers keep the table's convention: the six outfield facets are 0.
 * - photo_url = EA's portrait (the current sofifa URLs are partly wrong: three
 *   different "Alisson" rows share one photo).
 *
 *   node scripts/import-fc-players.mjs --from <download.json> --dry
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const from = args.includes("--from") ? args[args.indexOf("--from") + 1] : null;
if (!from || !args.includes("--dry")) {
  console.error("Usage: node scripts/import-fc-players.mjs --from <download.json> --dry");
  console.error("(write mode is not implemented yet — review the dry report first)");
  process.exit(1);
}

for (const line of fs.existsSync(path.join(ROOT, ".env.local"))
  ? fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")
  : []) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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
    club: it.team?.label ?? null,
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
const rows = men.map(toRow);

// current table, paged (PostgREST caps a select at 1000 rows)
const old = [];
for (let off = 0; ; off += 1000) {
  const { data, error } = await supabase.from("fc_players").select("name,overall,club,league,age,position").range(off, off + 999);
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
const PLACEHOLDERS = ["Lombardia FC", "Latium", "Milano FC", "Bergamo Calcio"];

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
console.log("\n--dry: nothing written.");
