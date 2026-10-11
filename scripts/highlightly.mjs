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
import { fileURLToPath } from "node:url";

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

/** Search a player and return their per-competition stats (2 requests, cached). */
export async function playerSeason(name, season) {
  const found = await hl("/players", { name, limit: 5 });
  const list = found?.data ?? [];
  if (!list.length) return { name, matches: [], stats: null };
  const exact = list.find((p) => p.name?.toLowerCase() === name.toLowerCase() || p.fullName?.toLowerCase() === name.toLowerCase());
  const pick = exact ?? list[0];
  const stats = await hl(`/players/${pick.id}/statistics`);
  const row = Array.isArray(stats) ? stats[0] : stats;
  const per = (row?.perCompetition ?? []).filter((c) => !season || String(c.season).includes(String(season)));
  return { name, matches: list.map((p) => `${p.name} (#${p.id})`), picked: pick, perCompetition: per };
}

function printSeason(r) {
  console.log(`\n${r.name}`);
  if (!r.picked) {
    console.log("  — no player found");
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
