#!/usr/bin/env node
/**
 * season-snapshot.mjs — store each carded player's current-season numbers on the
 * article's player blocks, for the social player card.
 *
 * WHY: the player card says what the game thinks (EA FC rating). The point of the
 * site is the gap between that and the football, so the card should carry the
 * football too: league, starts, minutes, goals, assists. The site must never call
 * the Highlightly API (quota, key), so the numbers are fetched here, locally, and
 * written onto the block as `season` — the admin panel and social-pack read it
 * from there. The article page does not render the field.
 *
 * HIGHLIGHTLY LAGS by a match or two after a matchday (Manzambi showed 99 minutes on
 * Monday 12 Oct when he had played 185). Take snapshots midweek (Tue–Thu), check the
 * dry run, and use --override for any player whose last match is missing.
 *
 *   node scripts/season-snapshot.mjs 165 164          # dry run
 *   node scripts/season-snapshot.mjs 165 164 --write  # pending articles only
 *   node scripts/season-snapshot.mjs 153 --write --published   # needs the owner's OK
 *   node scripts/season-snapshot.mjs 165 --write --override "Johan Manzambi=3,2,185,1,2"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { playerSeason } from "./highlightly.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.existsSync(path.join(ROOT, ".env.local"))
  ? fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")
  : []) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const args = process.argv.slice(2);
const write = args.includes("--write");
const allowPublished = args.includes("--published");
const ids = args.filter((a, i) => /^\d+$/.test(a) && args[i - 1] !== "--override").map(Number);
if (!ids.length) {
  console.error("Usage: node scripts/season-snapshot.mjs <id...> [--write] [--published]");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  write ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const CURRENT = /^(26\/27|2026)$/;
const YOUTH = /U\d{2}|Primavera|Premier League 2|Youth|Junioren|Reserve|\bB\b|Jong /i;

/**
 * The senior league the player is in now. A European 26/27 entry beats a 2026
 * calendar-year one: Gozo has 1,418 MLS minutes from before his move and 28 at
 * Palace, and the card is about Palace.
 */
export function primaryLeague(perCompetition) {
  const leagues = (perCompetition ?? []).filter(
    (c) => CURRENT.test(String(c.season)) && c.type === "national league" && !YOUTH.test(`${c.league} ${c.club}`),
  );
  const european = leagues.filter((c) => String(c.season) === "26/27");
  const pool = european.length ? european : leagues;
  return pool.sort((a, b) => (b.minutesPlayed ?? 0) - (a.minutesPlayed ?? 0))[0] ?? null;
}

/**
 * --override "Johan Manzambi=3,2,185,1,2" (apps,starts,minutes,goals,assists) — for a
 * player whose latest match Highlightly has not processed yet, using numbers checked
 * by hand the same day.
 */
const overrides = new Map(
  args
    .map((a, i) => (a === "--override" ? args[i + 1] : null))
    .filter(Boolean)
    .map((o) => {
      const [name, nums] = o.split("=");
      const [apps, starts, minutes, goals, assists] = nums.split(",").map(Number);
      return [name.trim().toLowerCase(), { apps, starts, minutes, goals, assists }];
    }),
);

const asOf = new Date().toISOString().slice(0, 10);
const { data: rows, error } = await supabase.from("contents").select("id,slug,status,sections_json").in("id", ids);
if (error) throw new Error(error.message);

for (const row of rows) {
  if (row.status === "published" && write && !allowPublished) {
    console.log(`\n#${row.id} is published — skipped (pass --published once the owner has agreed)`);
    continue;
  }
  console.log(`\n#${row.id} ${row.slug}`);
  const blocks = row.sections_json.map((b) => ({ ...b }));
  let changed = 0;
  for (const b of blocks) {
    if (b.type !== "player" || !b.name) continue;
    let r;
    try {
      r = await playerSeason(b.name, "");
    } catch (e) {
      console.log(`  ${b.name}: error ${e.message}`);
      continue;
    }
    const lg = r.picked ? primaryLeague(r.perCompetition) : null;
    if (!lg) {
      console.log(`  ${b.name}: ${r.picked ? "no senior league minutes this season" : "not found / ambiguous"} — left as is`);
      continue;
    }
    const season = {
      competition: lg.league,
      season: String(lg.season),
      apps: lg.gamesPlayed ?? 0,
      starts: (lg.gamesPlayed ?? 0) - (lg.substitutedIn ?? 0),
      minutes: lg.minutesPlayed ?? 0,
      goals: lg.goals ?? 0,
      assists: lg.assists ?? 0,
      asOf,
      source: "Highlightly",
    };
    const fix = overrides.get(b.name.toLowerCase());
    if (fix) Object.assign(season, fix, { source: "Highlightly + hand check" });
    console.log(
      `  ${b.name.padEnd(24)} ${season.competition} ${season.season}: ${season.apps} apps · ${season.starts} starts · ` +
        `${season.minutes} min · ${season.goals}G ${season.assists}A`,
    );
    b.season = season;
    changed++;
  }
  if (write && changed) {
    fs.mkdirSync(path.join(ROOT, "backups"), { recursive: true });
    fs.writeFileSync(path.join(ROOT, "backups", `sections-${row.id}-before-season-${asOf}.json`), JSON.stringify(row.sections_json));
    const { error: e } = await supabase.from("contents").update({ sections_json: blocks }).eq("id", row.id);
    console.log(e ? `  ERROR ${e.message}` : `  written: ${changed} player blocks`);
  }
}
if (!write) console.log("\n--dry: nothing written. Check the numbers (Highlightly can lag a match), then pass --write.");
