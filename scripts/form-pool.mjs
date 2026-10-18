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
 * Re-verified on 19 October 2026. Ten entries come from the research behind our own
 * October pieces (wingers, defenders, Turkey, Kopa: verified 17 Oct), ten from fresh
 * checks with an adversarial second pass on every change. What changed: Vušković is a
 * Brighton player (a club-record move from Tottenham in July, not a second Hamburg
 * loan); El Mala and Manzambi are a year older than this file said (the old dates of
 * birth were wrong); Delgado is 21; and Diomande, Endrick, Pietuszewski, Kroupi,
 * Manzambi, Maza and Delgado are listed where they now play, not where they used to.
 *
 * `name` must match fc_players exactly — that is what the ratings join on. `position`
 * is the player's current deployment, not the game's label, which drifts badly after
 * a transfer window.
 */
const POOL = [
  { name: "Lamine Yamal", club: "FC Barcelona", league: "La Liga", position: "RW", age: "19", as_of: "2026-10-17", source: "Scout Gamer wingers + Kopa research: LaLiga.com and FotMob, 17 Oct 2026 — eight league starts from eight, club captain" },
  { name: "Eli Junior Kroupi", club: "AFC Bournemouth", league: "Premier League", position: "CAM", age: "20", as_of: "2026-10-17", source: "Scout Gamer Kopa research: afcb.co.uk 29 Jul 2026; BBC via Yahoo, 6 Oct 2026" },
  { name: "Yan Diomande", club: "Real Madrid", league: "La Liga", position: "RW", age: "19", as_of: "2026-10-17", source: "Scout Gamer wingers research: LaLiga.com, 17 Oct 2026 — first Madrid goal v Villarreal, 10 Oct" },
  { name: "Nico Paz", club: "Como", league: "Serie A", position: "CAM", age: "22", as_of: "2026-10-19", source: "Goal (match report, Fiorentina 1-3 Como), 18 Oct 2026 — started as the No. 10, scored and assisted at Fiorentina; Madrid hold a 2027-28 buy-back" },
  { name: "Saïd El Mala", club: "1. FC Köln", league: "Bundesliga", position: "LW", age: "20", as_of: "2026-10-19", source: "Scout Gamer wingers research: FotMob, 17 Oct 2026; b. 26 Aug 2006 (Wikipedia, fc.de)" },
  { name: "Mika Godts", club: "Paris Saint-Germain", league: "Ligue 1", position: "LW", age: "21", as_of: "2026-10-19", source: "Eurosport France (pre-Strasbourg profile), 17 Oct 2026 — EUR 55m from Ajax; one PSG start so far, at left wing" },
  { name: "Rayan Cherki", club: "Manchester City", league: "Premier League", position: "CAM", age: "23", as_of: "2026-10-19", source: "ESPN match report, Liverpool 0-3 Man City (11 Oct 2026) — the No. 10 in Maresca's 4-2-3-1; scored at Anfield, 11 Oct" },
  { name: "Can Uzun", club: "Eintracht Frankfurt", league: "Bundesliga", position: "CAM", age: "20", as_of: "2026-10-17", source: "Scout Gamer Turkey research: FotMob and Hessenschau, 15-17 Oct 2026" },
  { name: "Luka Vušković", club: "Brighton & Hove Albion", league: "Premier League", position: "CB", age: "19", as_of: "2026-10-17", source: "Scout Gamer defenders research: FotMob, 17 Oct 2026; ESPN, 14 Jul 2026 — club-record GBP 46m from Tottenham" },
  { name: "Arda Güler", club: "Real Madrid", league: "La Liga", position: "CAM", age: "21", as_of: "2026-10-17", source: "Scout Gamer Turkey research: FotMob, 17 Oct 2026 — rotating with Bellingham as the No. 10" },
  { name: "Johan Manzambi", club: "Aston Villa", league: "Premier League", position: "CAM", age: "21", as_of: "2026-10-19", source: "Scout Gamer Kopa research: AP via SuperSport, 17 Jul 2026; b. 14 Oct 2005 (ESPN)" },
  { name: "Victor Froholdt", club: "FC Porto", league: "Primeira Liga", position: "CM", age: "20", as_of: "2026-10-19", source: "A Bola, Betis 3-2 FC Porto post-match (14 Oct 2026) — central midfield beside Varela; back from a September concussion" },
  { name: "Oskar Pietuszewski", club: "FC Porto", league: "Primeira Liga", position: "LW", age: "18", as_of: "2026-10-19", source: "A Bola, 18 Oct 2026 ('FC Porto: duo ganha gas e apresenta a candidatura a Farioli') — a winger on the left of Farioli's front three, not a centre-forward" },
  { name: "Estêvão", club: "Chelsea", league: "Premier League", position: "RW", age: "19", as_of: "2026-10-19", source: "Gazeta Esportiva and Lance!, 17 Oct 2026 (Everton 0-2 Chelsea) — no Premier League starts under Xabi Alonso" },
  { name: "Nico O'Reilly", club: "Manchester City", league: "Premier League", position: "LB", age: "21", as_of: "2026-10-17", source: "Scout Gamer defenders research: FotMob and ESPN, 17 Oct 2026; mancity.com, 11 Oct 2026" },
  { name: "Mateus Fernandes", club: "Tottenham Hotspur", league: "Premier League", position: "CM", age: "22", as_of: "2026-10-19", source: "football.london (Alasdair Gold, syndicated via Yahoo Sports), 16 Oct 2026 — GBP 85m from West Ham, 2 Jul 2026" },
  { name: "Franco Mastantuono", club: "Fiorentina", league: "Serie A", position: "RW", age: "19", as_of: "2026-10-19", source: "Goal.com Italia match report and ratings, Fiorentina 1-3 Como — season loan from Real Madrid; broke a bone in his left hand at Genoa, 10 Oct" },
  { name: "Milton Delgado", club: "Boca Juniors", league: "Liga Profesional", position: "CM", age: "21", as_of: "2026-10-19", source: "Infobae, 13 Oct 2026 (Vasco da Gama XI) and 15-16 Oct 2026 (Talleres XI and 2-1 report) — b. 16 Jun 2005; in central midfield while Paredes is injured" },
  { name: "Endrick", club: "Real Madrid", league: "La Liga", position: "RW", age: "20", as_of: "2026-10-19", source: "EFE via Infobae, 18 Oct 2026 (Real Madrid v Sevilla XI) — Mourinho uses him on the right, with Mbappe through the middle" },
  { name: "Ibrahim Maza", club: "Bayer Leverkusen", league: "Bundesliga", position: "LW", age: "20", as_of: "2026-10-17", source: "Scout Gamer Kopa research: Opta Analyst, 17 Oct 2026" },
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
