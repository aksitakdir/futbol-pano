#!/usr/bin/env node
/**
 * highlightly.mjs — a small, budgeted client for the Highlightly football API.
 *
 * WHY: article verification (minutes, starts, goals, current club) has been
 * done by reading FotMob and news pages one by one. That is slow and it has
 * produced real errors — a 2025 injury story read as 2026, two different
 * players merged under one name. Highlightly returns the same facts as dated,
 * structured data.
 *
 * Rules this client enforces, because the key is on a 100-requests-a-day plan:
 * - LOCAL ONLY. Never imported by the site; visitors never spend the quota and
 *   the key never leaves this machine.
 * - CACHED. Every response is kept in data/highlightly-cache/ (gitignored) for
 *   24 hours; the same lookup twice in a day costs nothing.
 * - CAPPED. A daily counter stops at HIGHLIGHTLY_DAILY_CAP (default 60) and
 *   says so, rather than burning the plan.
 *
 * Key: HIGHLIGHTLY_API_KEY in .env.local (never paste it into chat or a commit).
 *
 *   node scripts/highlightly.mjs player "Pietro Comuzzo"      # search + season stats (2 requests)
 *   node scripts/highlightly.mjs player "Comuzzo" --season 2026
 *   node scripts/highlightly.mjs test                          # 3 players, at most 6 requests
 *   node scripts/highlightly.mjs budget                        # requests used today
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, "data", "highlightly-cache");
const BASE = "https://soccer.highlightly.net";
const TTL_MS = 24 * 60 * 60 * 1000;

for (const line of fs.existsSync(path.join(ROOT, ".env.local"))
  ? fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")
  : []) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const KEY = process.env.HIGHLIGHTLY_API_KEY || "";
const CAP = Number(process.env.HIGHLIGHTLY_DAILY_CAP || 60);

fs.mkdirSync(CACHE, { recursive: true });
const budgetFile = path.join(CACHE, "_budget.json");
const today = new Date().toISOString().slice(0, 10);

function budget() {
  try {
    const b = JSON.parse(fs.readFileSync(budgetFile, "utf8"));
    return b.date === today ? b : { date: today, count: 0 };
  } catch {
    return { date: today, count: 0 };
  }
}

/** GET with cache and the daily cap. Returns parsed JSON. */
export async function hl(pathname, params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
  const url = `${BASE}${pathname}${qs.size ? `?${qs}` : ""}`;
  const file = path.join(CACHE, `${url.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "_").slice(0, 180)}.json`);

  if (fs.existsSync(file) && Date.now() - fs.statSync(file).mtimeMs < TTL_MS) {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  }
  if (!KEY) throw new Error("HIGHLIGHTLY_API_KEY is not set in .env.local");

  const b = budget();
  if (b.count >= CAP) throw new Error(`Daily cap reached (${b.count}/${CAP}). Raise HIGHLIGHTLY_DAILY_CAP or wait until tomorrow.`);

  const res = await fetch(url, { headers: { "x-rapidapi-key": KEY } });
  b.count++;
  fs.writeFileSync(budgetFile, JSON.stringify(b));
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url.replace(KEY, "***")}`);
  const data = await res.json();
  fs.writeFileSync(file, JSON.stringify(data));
  return data;
}

/**
 * Choose the searched player from the results — never by position in the list.
 * Search returns short forms ("G. Mora") next to unrelated players ("Gilberto");
 * taking the first hit picked a Brazilian Gilberto for Gilberto Mora (2026-10-12).
 * Order: exact name/fullName → first initial + surname → unique surname. Anything
 * less certain returns null and the caller lists the candidates instead.
 */
export function pickPlayer(name, list) {
  const norm = (s) => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z .'-]/g, "").trim();
  const q = norm(name);
  const parts = q.split(/\s+/);
  const surname = parts[parts.length - 1];
  const initial = parts[0]?.[0];
  const exact = list.find((p) => norm(p.name) === q || norm(p.fullName) === q);
  if (exact) return exact;
  const initialMatch = list.filter((p) => {
    const n = norm(p.name).split(/\s+/);
    return n[n.length - 1] === surname && n[0]?.[0] === initial;
  });
  if (initialMatch.length === 1) return initialMatch[0];
  // Two "N. Sadiki"s: the one whose full name carries the searched first name
  const byFirst = initialMatch.filter((p) => norm(p.fullName).split(/\s+/).includes(parts[0]));
  if (byFirst.length === 1) return byFirst[0];
  const anyFirst = list.filter((p) => norm(p.name).split(/\s+/).pop() === surname && norm(p.fullName).split(/\s+/).includes(parts[0]));
  if (anyFirst.length === 1) return anyFirst[0];
  const surnameOnly = list.filter((p) => norm(p.name).split(/\s+/).pop() === surname);
  return surnameOnly.length === 1 ? surnameOnly[0] : null;
}

/** Search a player and return their per-competition stats (2 requests, cached). */
export async function playerSeason(name, season) {
  const found = await hl("/players", { name, limit: 5 });
  const list = found?.data ?? [];
  if (!list.length) return { name, matches: [], stats: null };
  const pick = pickPlayer(name, list);
  if (!pick) return { name, matches: list.map((p) => `${p.name} (#${p.id})`), picked: null, perCompetition: [] };
  const stats = await hl(`/players/${pick.id}/statistics`);
  const row = Array.isArray(stats) ? stats[0] : stats;
  const per = (row?.perCompetition ?? []).filter((c) => !season || String(c.season).includes(String(season)));
  return { name, matches: list.map((p) => `${p.name} (#${p.id})`), picked: pick, perCompetition: per };
}

/**
 * Where a player actually lined up, from the formation rows Highlightly returns
 * ([[GK], [defence…], [midfield…], …, [attack…]]). The game's position label is
 * the least reliable field we have (the 10s piece, 2026-09-30); this reads it off
 * the team sheet instead. Middle-of-row is direction-independent, so "the middle
 * of a three" and "a double pivot" are safe to name; left/right is not.
 */
export function roleFromLineup(lines, playerId) {
  for (let li = 0; li < lines.length; li++) {
    const row = lines[li];
    const pi = row.findIndex((p) => p.id === playerId);
    if (pi < 0) continue;
    const last = lines.length - 1;
    const size = row.length;
    const middle = size % 2 === 1 ? pi === (size - 1) / 2 : pi === size / 2 - 1 || pi === size / 2;
    const edge = pi === 0 || pi === size - 1;
    if (li === 0) return "goalkeeper";
    if (li === 1) return edge && size >= 4 ? "full-back" : "centre-back";
    if (li === last) return "forward";
    const deepest = li === 2;
    const moreMidLinesAhead = last - li > 1;
    if (deepest) {
      if (size === 1) return "single pivot (6)";
      if (size === 2) return "double pivot (6/8)";
      if (size === 3) return middle ? (moreMidLinesAhead ? "deepest of a three" : "base of a three (6)") : "8 in a three";
      if (size >= 4) return middle ? "central pair" : "wide / wing-back";
    }
    return edge && size >= 3 ? "wide midfield" : "advanced midfield (8/10)";
  }
  return null;
}

/** Find a team by name, trying the forms clubs are written in ("FC Barcelona" → "Barcelona"). */
export async function findTeam(club) {
  const base = String(club).trim();
  const variants = [
    base,
    base.replace(/^(FC|AFC|CF|SC|AC|AS|SS|SSC|RC|RCD|CA|SK|1\.)\s+/i, ""),
    base.replace(/\s+(FC|CF|AFC|SC|SCO|Milan|Enschede|Rotterdam|1912)$/i, ""),
    base.replace(/^(FC|AFC|CF|SC|AC|AS|SS|SSC|RC|RCD|CA|SK|1\.)\s+/i, "").replace(/\s+(FC|CF|AFC|SC|SCO)$/i, ""),
  ].filter((v, i, a) => v && a.indexOf(v) === i);
  for (const v of variants) {
    // Men's first teams only — "Stuttgart" also matches the women's side (Chema, 2026-10-12)
    const teams = ((await hl("/teams", { name: v, limit: 10 }))?.data ?? []).filter(
      (t) => !/\b(women|femen|féminin|ladies|frauen|u\d{2}|ii|b)\b/i.test(t.name),
    );
    const hit = teams.find((t) => t.name.toLowerCase() === base.toLowerCase()) ?? teams.find((t) => t.name.toLowerCase() === v.toLowerCase()) ?? teams[0];
    if (hit) return hit;
  }
  return null;
}

/**
 * The player's roles in his club's last few finished matches (cached; ~5 requests cold).
 * opts.club: find the player on that club's team sheets by name — no search, no
 * ambiguity ("Lucas Silva" has ten namesakes; River Plate has one).
 */
export async function recentRoles(name, max = 3, opts = {}) {
  let picked = null;
  let club = opts.club ?? "";
  if (!club) {
    const r = await playerSeason(name, "");
    if (!r.picked) return { name, error: r.matches?.length ? "ambiguous — pass --club" : "not found", matches: r.matches };
    picked = r.picked;
    const cur = (r.perCompetition ?? []).filter((c) => /^(26\/27|2026)$/.test(String(c.season)) && (c.gamesPlayed ?? 0) > 0);
    const european = cur.filter((c) => String(c.season) === "26/27");
    club = (european.length ? european : cur).sort((a, b) => (b.minutesPlayed ?? 0) - (a.minutesPlayed ?? 0))[0]?.club ?? "";
    if (!club) return { name, picked, error: "no appearances this season (injured or not registered?)" };
  }
  const team = await findTeam(club);
  if (!team) return { name, club, error: "team not found" };
  const games = (await hl("/last-five-games", { teamId: team.id })) ?? [];
  const out = [];
  for (const g of games.filter((x) => /finished/i.test(x.state?.description ?? "")).slice(0, max)) {
    const lu = await hl(`/lineups/${g.id}`);
    const side = lu?.homeTeam?.id === team.id ? lu.homeTeam : lu?.awayTeam;
    if (!side) continue;
    if (!picked) {
      const everyone = [...(side.initialLineup ?? []).flat(), ...(side.substitutes ?? [])];
      picked = pickPlayer(name, everyone) ?? null;
    }
    const role = picked ? roleFromLineup(side.initialLineup ?? [], picked.id) : null;
    const benched = picked ? (side.substitutes ?? []).some((p) => p.id === picked.id) : false;
    out.push({
      date: g.date?.slice(0, 10),
      match: `${g.homeTeam?.name} v ${g.awayTeam?.name}`,
      competition: g.league?.name,
      formation: side.formation,
      role: role ?? (benched ? "bench" : "not in squad"),
    });
  }
  return { name, picked, club, team: team.name, games: out };
}

function printSeason(r) {
  console.log(`\n${r.name}`);
  if (!r.picked) {
    console.log(r.matches.length ? `  — not sure which one; candidates: ${r.matches.join(", ")}` : "  — no player found");
    return;
  }
  if (r.matches.length > 1) console.log(`  search matches: ${r.matches.join(", ")}`);
  console.log(`  picked: ${r.picked.fullName || r.picked.name} (#${r.picked.id})`);
  const rows = [...(r.perCompetition ?? [])].sort((a, b) => String(b.season).localeCompare(String(a.season))).slice(0, 6);
  for (const c of rows) {
    const starts = (c.gamesPlayed ?? 0) - (c.substitutedIn ?? 0);
    console.log(
      `  ${String(c.season).padEnd(9)} ${String(c.club).padEnd(22)} ${String(c.league).padEnd(24)} ` +
        `${c.gamesPlayed ?? 0} apps · ${starts} starts · ${c.minutesPlayed ?? 0} min · ${c.goals ?? 0}G ${c.assists ?? 0}A`,
    );
  }
}

// CLI only when run directly — other scripts import hl() / playerSeason() without side effects.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [cmd, ...rest] = process.argv.slice(2);
  const seasonFlag = rest.indexOf("--season");
  const season = seasonFlag >= 0 ? rest[seasonFlag + 1] : "";
  const args = seasonFlag >= 0 ? rest.filter((_, i) => i !== seasonFlag && i !== seasonFlag + 1) : rest;

  try {
    if (cmd === "budget") {
      const b = budget();
      console.log(`${b.count}/${CAP} requests used on ${b.date}`);
    } else if (cmd === "player" && args[0]) {
      printSeason(await playerSeason(args.join(" "), season));
      console.log(`\nbudget: ${budget().count}/${CAP} today`);
    } else if (cmd === "roles" && args[0]) {
      const ci = args.indexOf("--club");
      const clubHint = ci >= 0 ? args[ci + 1] : "";
      const nm = (ci >= 0 ? args.slice(0, ci) : args).join(" ");
      const r = await recentRoles(nm, 3, { club: clubHint });
      console.log(`\n${r.name}${r.club ? ` — ${r.team ?? r.club}` : ""}${r.error ? `: ${r.error}` : ""}`);
      for (const g of r.games ?? []) console.log(`  ${g.date} ${g.competition.padEnd(22)} ${g.formation.padEnd(8)} ${g.role.padEnd(22)} ${g.match}`);
      console.log(`\nbudget: ${budget().count}/${CAP} today`);
    } else if (cmd === "test") {
      for (const n of ["Pietro Comuzzo", "Zavier Gozo", "Gilberto Mora"]) printSeason(await playerSeason(n, season));
      console.log(`\nbudget: ${budget().count}/${CAP} today`);
    } else {
      console.log('Usage: node scripts/highlightly.mjs (player "Name" [--season 2026] | test | budget)');
    }
  } catch (e) {
    console.error(`error: ${e.message}`);
    process.exitCode = 1;
  }
}
