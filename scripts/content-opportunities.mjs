#!/usr/bin/env node
/**
 * Content opportunity scanner — where is there enough talent to write about?
 *
 * WHY: we were picking list topics by intuition (and got it wrong: Japan was chosen
 * for "low competition", which usually just means low demand AND thin supply). The
 * fc_players table already answers the supply half of that question exactly, across
 * every axis we could write on — nationality x position x league x age band. This
 * scans all of it and reports the intersections that can actually carry a 6-8 player
 * list, plus the ones so thin that the scarcity itself is the story.
 *
 * Supply only. Pair the shortlist with a demand check (GSC / search intent) before
 * committing — and always verify individual players on the web, since these ratings
 * are one game's view of CURRENT ability, not truth.
 *
 * Usage:
 *   node scripts/content-opportunities.mjs                 # U21, default report
 *   node scripts/content-opportunities.mjs --age 23        # U23 cohort
 *   node scripts/content-opportunities.mjs --min 6         # min notable players
 *   node scripts/content-opportunities.mjs --axis league   # nationality|league|club|position|all
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, ".env.local"), "utf8")
    .split("\n").filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const MAX_AGE = Number(arg("age", 21));
const MIN_NOTABLE = Number(arg("min", 6));   // our editorial floor: a list needs 6-8 real names
const AXIS = arg("axis", "all");
const TOP_N = Number(arg("top", 20));

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function loadPlayers() {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from("fc_players").select("*").range(from, from + 999);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < 1000) break;
  }
  return rows;
}

const percentile = (values, p) => {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((s.length - 1) * p))];
};

/** Group rows by a key (or a composite key), dropping empties. */
function groupBy(rows, keyFn) {
  const map = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    if (!k || k.includes("undefined") || k.includes("null")) continue;
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(r);
  }
  return map;
}

function report(title, map, bar, { min = MIN_NOTABLE, top = TOP_N } = {}) {
  const rows = [];
  for (const [key, players] of map) {
    const notable = players.filter((p) => p.overall >= bar);
    if (notable.length < min) continue;
    notable.sort((a, b) => b.overall - a.overall);
    rows.push({
      key,
      notable: notable.length,
      depth: players.length,
      best: notable[0],
      names: notable.slice(0, 3).map((p) => `${p.name} ${p.overall}`).join(", "),
    });
  }
  rows.sort((a, b) => b.notable - a.notable || b.best.overall - a.best.overall);

  console.log(`\n${"=".repeat(78)}\n${title}   (notable = OVR >= ${bar}, min ${min})\n${"=".repeat(78)}`);
  if (!rows.length) { console.log("  — no intersection clears the bar"); return rows; }
  console.log("  NOTABLE  POOL  TOPIC".padEnd(46) + "TOP NAMES");
  for (const r of rows.slice(0, top)) {
    console.log(
      `  ${String(r.notable).padStart(7)}  ${String(r.depth).padStart(4)}  ${r.key.slice(0, 34).padEnd(36)}${r.names.slice(0, 60)}`,
    );
  }
  if (rows.length > top) console.log(`  … +${rows.length - top} more`);
  return rows;
}

const players = await loadPlayers();
const cohort = players.filter((p) => p.age && p.age <= MAX_AGE && p.overall);

const overalls = cohort.map((p) => p.overall);
// "Notable" = top quartile of the cohort. Young players carry low CURRENT ratings, so an
// absolute bar (70+) would wrongly empty most intersections — this scales with the cohort.
const BAR = Math.max(percentile(overalls, 0.75), 65);

console.log(`\nPlayers: ${players.length}  |  U${MAX_AGE} cohort: ${cohort.length}`);
console.log(`Cohort overall — median ${percentile(overalls, 0.5)}, p75 ${percentile(overalls, 0.75)}, p90 ${percentile(overalls, 0.9)}`);
console.log(`Notable bar set at OVR >= ${BAR}`);

const want = (a) => AXIS === "all" || AXIS === a;

if (want("nationality")) report("BY COUNTRY", groupBy(cohort, (p) => p.nationality), BAR);
if (want("league")) report("BY LEAGUE", groupBy(cohort, (p) => p.league), BAR);
if (want("club")) report("BY CLUB (academy / selling-club angle)", groupBy(cohort, (p) => p.club), BAR, { min: 3 });
if (want("position")) report("BY POSITION", groupBy(cohort, (p) => p.position), BAR);

if (want("nationality") || want("all")) {
  report("COUNTRY x POSITION  (the 480-piece grid — only the viable cells)",
    groupBy(cohort, (p) => `${p.nationality} · ${p.position}`), BAR, { min: Math.max(4, MIN_NOTABLE - 2), top: 25 });
}
if (want("league") || want("all")) {
  report("LEAGUE x POSITION", groupBy(cohort, (p) => `${p.league} · ${p.position}`), BAR, { min: Math.max(4, MIN_NOTABLE - 2), top: 15 });
}

/* ── Scarcity: where the thinness IS the story ───────────────────────────── */
if (AXIS === "all") {
  console.log(`\n${"=".repeat(78)}\nSCARCITY — rare profiles (few enough that the shortage is the headline)\n${"=".repeat(78)}`);
  const profiles = [
    ["Ball-playing centre-backs", (p) => p.position === "CB" && p.passing >= percentile(cohort.filter((x) => x.position === "CB").map((x) => x.passing), 0.97)],
    ["Genuine pace (top 1%)", (p) => p.pace >= percentile(cohort.map((x) => x.pace), 0.99)],
    ["Complete central midfielders", (p) => p.position === "CM" && p.passing >= 68 && p.defending >= 65 && p.physical >= 70],
    ["Creative tens", (p) => p.position === "CAM" && p.dribbling >= 80],
    ["Modern full-backs (pace + passing)", (p) => ["RB", "LB"].includes(p.position) && p.pace >= 82 && p.passing >= 65],
    ["Complete strikers (pace + physical)", (p) => p.position === "ST" && p.pace >= 82 && p.physical >= 72],
  ];
  for (const [label, fn] of profiles) {
    const found = cohort.filter(fn).sort((a, b) => b.overall - a.overall);
    console.log(`\n  ${found.length} in the world  —  ${label}`);
    found.slice(0, 8).forEach((p) =>
      console.log(`     OVR ${String(p.overall).padStart(2)}  ${p.name} (${p.age})  ${p.club} · ${p.nationality}`));
  }
}

console.log("\nSupply only — pair with a demand check before writing.\n");
