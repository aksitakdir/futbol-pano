/**
 * The home page's "In Form" player pool — and the check that keeps it honest.
 *
 *   node scripts/form-pool.mjs            # check only (default)
 *   node scripts/form-pool.mjs --write    # check, then write to site_settings
 *
 * WHY THIS FILE EXISTS
 *
 * The pool used to live only as a JSON blob in the site_settings table, with no
 * author, no date and nothing to check it against. By 15 September 2026 six of its
 * twenty players were at a club they had left — Mika Godts had been a PSG player for
 * a month, Johan Manzambi an Aston Villa player since July, Franco Mastantuono was on
 * loan at Fiorentina, Yan Diomande had moved to Real Madrid for EUR 125m, Mateus
 * Fernandes to Tottenham for GBP 85m, and Endrick's Lyon loan had ended in June.
 * Four more never rendered at all, because their names were spelled differently here
 * than in fc_players and the join silently dropped them.
 *
 * THE RULE THIS FILE ENFORCES
 *
 * The game supplies numbers; we supply facts. fc_players is a frozen copy of the
 * game's own database: its club, league and age columns describe the 2025-26 season,
 * so every age in it is a year low and every club at least one transfer window
 * behind. app/page.tsx therefore reads only overall, the six stats and the photo from
 * fc_players. Club, league, position and age come from this file and nowhere else.
 *
 * Each entry carries as_of and a source. --check fails when a name will not join to
 * fc_players (an invisible card), and warns when an entry has gone stale.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAX_AGE_DAYS = 45;

/**
 * Verified by hand on 15 September 2026. `name` must match fc_players exactly —
 * that is what the ratings join on. `position` is the player's current deployment,
 * not the game's label, which drifts badly after a transfer window.
 */
const POOL = [
  { name: "Lamine Yamal",       club: "FC Barcelona",       league: "La Liga",           position: "RW",  age: "19", as_of: "2026-09-15", source: "Barca Blaugranes, 15 Sep 2026 — vice-captain for 2026-27, 50th Barcelona goal on 1 Sep" },
  { name: "Eli Junior Kroupi",  club: "AFC Bournemouth",    league: "Premier League",    position: "ST",  age: "20", as_of: "2026-09-15", source: "Yahoo Sports / bet365, Aug 2026 — stays at Bournemouth; metatarsal surgery, out until late October" },
  { name: "Yan Diomande",       club: "Real Madrid",        league: "La Liga",           position: "LW",  age: "19", as_of: "2026-09-15", source: "Bundesliga.com / Al Jazeera, Jul 2026 — Leipzig to Real Madrid, EUR 125m rising to 140m, No. 25" },
  { name: "Nico Paz",           club: "Como",               league: "Serie A",           position: "CAM", age: "22", as_of: "2026-09-15", source: "Real Madrid official, 29 Jun 2026 — stays at Como for 2026-27, Madrid keep a 2027-28 buy-back; b. 8 Sep 2004" },
  { name: "Said El Mala",       club: "1. FC Köln",         league: "Bundesliga",        position: "LW",  age: "19", as_of: "2026-09-15", source: "Yahoo Sports / kicker, summer 2026 — turned down Dortmund, extended to June 2031, wears No. 10" },
  { name: "Mika Godts",         club: "Paris Saint-Germain", league: "Ligue 1",          position: "LW",  age: "21", as_of: "2026-09-15", source: "psg.fr + english.ajax.nl, Aug 2026 — EUR 55m from Ajax, contract to 2031, No. 22" },
  { name: "Rayan Cherki",       club: "Manchester City",    league: "Premier League",    position: "CAM", age: "23", as_of: "2026-09-15", source: "LiveScore 26/27 stats — two goals, two assists in the opening three matches; b. 17 Aug 2003" },
  { name: "Can Uzun",           club: "Eintracht Frankfurt", league: "Bundesliga",       position: "CAM", age: "20", as_of: "2026-09-15", source: "en.eintracht.de squad page 2026/27 — Frankfurt turned down Fenerbahçe's EUR 37m and kept him" },
  { name: "Luka Vušković",      club: "Hamburger SV",       league: "Bundesliga",        position: "CB",  age: "19", as_of: "2026-09-15", source: "Get German Football News, 2026 — a second Hamburg loan from Tottenham after being named Young Player of the Season" },
  { name: "Arda Güler",         club: "Real Madrid",        league: "La Liga",           position: "CAM", age: "21", as_of: "2026-09-15", source: "Verified 13 Sep 2026 — playing as the No. 10, not on the wing; b. 25 Feb 2005" },
  { name: "Johan Manzambi",     club: "Aston Villa",        league: "Premier League",    position: "CM",  age: "20", as_of: "2026-09-15", source: "Bundesliga.com, Jul 2026 — 'Johan Manzambi joins Aston Villa from Freiburg'; b. 30 Dec 2005" },
  { name: "Victor Froholdt",    club: "FC Porto",           league: "Primeira Liga",     position: "CM",  age: "20", as_of: "2026-09-15", source: "beIN Sports, 1 Aug 2026 — scored the winner in the Portuguese Super Cup; EUR 85m release clause, contract to 2030" },
  { name: "Oskar Pietuszewski", club: "FC Porto",           league: "Primeira Liga",     position: "CF",  age: "18", as_of: "2026-09-15", source: "zerozero.pt 2026/27 + Wikipedia — signed a five-year deal on 27 May 2026; the game still files him at Jagiellonia" },
  { name: "Estêvão",            club: "Chelsea",            league: "Premier League",    position: "RW",  age: "19", as_of: "2026-09-15", source: "Wikipedia / FootballTransfers, Sep 2026 — b. 24 Apr 2007; seven years left, seven minutes of league football so far" },
  { name: "Nico O'Reilly",      club: "Manchester City",    league: "Premier League",    position: "LB",  age: "21", as_of: "2026-09-15", source: "mancity.com / FotMob 26/27 — Maresca uses him at left-back; Premier League Young Player of the Year; b. 21 Mar 2005" },
  { name: "Mateus Fernandes",   club: "Tottenham Hotspur",  league: "Premier League",    position: "CM",  age: "22", as_of: "2026-09-15", source: "whufc.com club statement + Wikipedia — GBP 85m to Tottenham, July 2026; b. 10 Jul 2004" },
  { name: "Franco Mastantuono", club: "Fiorentina",         league: "Serie A",           position: "RW",  age: "19", as_of: "2026-09-15", source: "realmadrid.com official, 5 Aug 2026 — season-long loan, no option to buy; hat-trick v Venezia, 11 Sep 2026" },
  { name: "Milton Delgado",     club: "Boca Juniors",       league: "Liga Profesional",  position: "CDM", age: "20", as_of: "2026-09-15", source: "OneFootball / Sportsboom, 2026 — under contract to December 2029; Boca rejected Trabzonspor's EUR 8m in May" },
  { name: "Endrick",            club: "Real Madrid",        league: "La Liga",           position: "ST",  age: "20", as_of: "2026-09-15", source: "beIN Sports / Goal, summer 2026 — Lyon loan ended 30 Jun 2026, no second loan; b. 21 Jul 2006" },
  { name: "Ibrahim Maza",       club: "Bayer Leverkusen",   league: "Bundesliga",        position: "CAM", age: "20", as_of: "2026-09-15", source: "bayer04.de / FotMob 26/27 — a goal and an assist in the opening two matches; b. 24 Nov 2005" },
];

// The card never renders goals, so carrying a number here would be an unchecked
// claim waiting to be displayed by a future edit. Leave it empty on purpose.
const ENTRIES = POOL.map((p) => ({ ...p, goals: "" }));

function env() {
  const file = path.join(ROOT, ".env.local");
  return Object.fromEntries(
    fs.readFileSync(file, "utf8")
      .split("\n")
      .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
      .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
  );
}

const write = process.argv.includes("--write");
const e = env();
const key = write ? e.SUPABASE_SERVICE_ROLE_KEY : e.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!e.NEXT_PUBLIC_SUPABASE_URL || !key) {
  console.error(`Missing NEXT_PUBLIC_SUPABASE_URL or ${write ? "SUPABASE_SERVICE_ROLE_KEY" : "NEXT_PUBLIC_SUPABASE_ANON_KEY"} in .env.local`);
  process.exit(1);
}
const supabase = createClient(e.NEXT_PUBLIC_SUPABASE_URL, key);

const blockers = [];
const warnings = [];

const seen = new Set();
for (const p of ENTRIES) {
  const k = p.name.toLowerCase();
  if (seen.has(k)) blockers.push(`duplicate entry: ${p.name}`);
  seen.add(k);
  for (const f of ["name", "club", "league", "position", "age", "as_of", "source"]) {
    if (!String(p[f] ?? "").trim()) blockers.push(`${p.name}: missing ${f}`);
  }
  const days = Math.floor((Date.now() - Date.parse(p.as_of)) / 86_400_000);
  if (Number.isNaN(days)) blockers.push(`${p.name}: as_of is not a date (${p.as_of})`);
  else if (days > MAX_AGE_DAYS) warnings.push(`${p.name}: verified ${days} days ago — a transfer window has probably moved since`);
}

// A name that does not match fc_players exactly produces a card with no ratings,
// which app/page.tsx then filters out: the player silently vanishes from the site.
const { data: rows, error } = await supabase.from("fc_players").select("name").in("name", ENTRIES.map((p) => p.name));
if (error) { console.error("fc_players lookup failed:", error.message); process.exit(1); }
const known = new Set((rows ?? []).map((r) => r.name.toLowerCase()));
for (const p of ENTRIES) {
  if (!known.has(p.name.toLowerCase())) blockers.push(`${p.name}: no fc_players row with this exact name — the card would never render`);
}

for (const w of warnings) console.log(`  warn   ${w}`);
for (const b of blockers) console.log(`  BLOCK  ${b}`);

if (blockers.length) {
  console.error(`\nform-pool: ${blockers.length} blocker(s). Nothing written.`);
  process.exit(1);
}
console.log(`\nform-pool OK — ${ENTRIES.length} players, ${warnings.length} warning(s).`);

if (!write) {
  console.log("Run with --write to publish this pool to site_settings.");
  process.exit(0);
}

const value = JSON.stringify(ENTRIES);
for (const k of ["form_players_pool", "form_players"]) {
  const { error: upErr } = await supabase.from("site_settings").upsert({ key: k, value }, { onConflict: "key" });
  if (upErr) { console.error(`write to ${k} failed:`, upErr.message); process.exit(1); }
  console.log(`wrote ${k}`);
}
