#!/usr/bin/env node
/**
 * freshness-check.mjs — what has changed about an article's players since it was checked.
 *
 * WHY: from 16 Nov 2026 pieces go out in two fixed slots a week, Tuesday and Friday,
 * and are written in the week they publish (docs/TODO.md). Even three days is enough
 * for a figure to go stale: a striker scores on Sunday, a full-back loses his place,
 * a seventeen-year-old turns eighteen. #160 and #161 were finished on 30 September
 * and were still pending in mid-November with every number in them out of date, and
 * the only way to know was a full re-research. This keeps what the figures were when
 * the piece was verified and, before it goes live, prints only what moved, with the
 * sentences that carry the old number, so the re-check takes minutes.
 *
 *   node scripts/freshness-check.mjs snapshot 171                       # players from the article's cards
 *   node scripts/freshness-check.mjs snapshot 171 --brief brief.json    # players from brief.verification
 *   node scripts/freshness-check.mjs snapshot 171 --players "A,B" --ids "A=73593415"
 *   node scripts/freshness-check.mjs diff 171 [--date 2026-11-20] [--fresh]
 *   node scripts/freshness-check.mjs refresh-baseline 171                # after the fixes
 *
 * diff exits 0 when nothing changed, 2 when something did, 3 when nothing changed but
 * some of the article's players are not checked (unresolved, or carded after the
 * baseline was taken), 1 on an error, so scripts/publish-queue.mjs can refuse a piece
 * whose figures moved. --date is the day the piece goes out (birthdays are checked
 * against it); --fresh ignores the cache.
 *
 * A baseline only means something if it was taken while the article's figures were
 * being checked: Highlightly today against a text from last week would call a stale
 * piece clean. So `snapshot --brief` (what scout-publish runs) refuses when the brief's
 * as_of dates are more than a day old, and never replaces a baseline taken on or after
 * them; after re-verifying, `refresh-baseline` is the explicit way to move it.
 *
 * Requests (scripts/highlightly.mjs, cached and capped): a snapshot spends one search
 * per name it has not resolved before (the id is kept in the baseline), one profile
 * call for the birth date and one season-stats call per player; a diff spends one
 * season-stats call per player, plus one profile call per player in a transfer window
 * (Jan–Feb, Jun–Sep) or for a player with no game in 7+ days, to catch a move before
 * he plays for the new club. Answers younger than six hours are taken from the cache.
 * Baselines are small JSON files in data/freshness/ (committed).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { hl, pickPlayer, budgetToday } from "./highlightly.mjs";
import { sectionsToHtml } from "../lib/sections-to-html.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.existsSync(path.join(ROOT, ".env.local")) ? fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n") : []) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const DIR = path.join(ROOT, "data", "freshness");
const STALE_DAYS = 14;
const STATS_MAX_AGE_MS = 6 * 60 * 60 * 1000;
const FIELDS = ["apps", "starts", "minutes", "goals", "assists"];

// Reads only. The service key sees pending rows, which RLS hides from the anon key.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// ---- small helpers ----------------------------------------------------------
const plain = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "");
const norm = (s) => plain(s).toLowerCase().replace(/\s+/g, " ").trim();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// The owner's calendar (Türkiye, UTC+3), whatever clock the machine runs on: a slot
// day, a baseline date and a birthday are his days, the same ones publish-queue uses.
const TZ = "Europe/Istanbul";
const localDate = (d = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const validDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s ?? "") && !Number.isNaN(Date.parse(`${s}T12:00:00Z`)) && new Date(`${s}T12:00:00Z`).toISOString().slice(0, 10) === s;
const daysBetween = (a, b) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000);
/** Months a player can change clubs without having played for the new one yet (European and calendar-year windows). */
const transferWindow = (date) => [1, 2, 6, 7, 8, 9].includes(Number(date.slice(5, 7)));
const sum = (rows, f) => rows.reduce((s, r) => s + (r[f] ?? 0), 0);
const statLine = (r) => `${r.apps} apps · ${r.starts} starts · ${r.minutes} min · ${r.goals}G ${r.assists}A`;

/** The name the text uses: last word, except suffixes ("Vinícius Júnior" is "Vinícius"). */
function surnameOf(name) {
  const parts = String(name).trim().split(/\s+/);
  const last = parts[parts.length - 1];
  return /^(junior|júnior|jr\.?|filho|neto|sobrinho)$/i.test(last) && parts.length > 1 ? parts[parts.length - 2] : last;
}

function ageAt(birth, date) {
  const [by, bm, bd] = birth.split("-").map(Number);
  const [y, m, d] = date.split("-").map(Number);
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}

/** European seasons are "26/27", calendar-year leagues (MLS, Brazil, Japan) "2026". */
function currentSeasons(onDate) {
  const [y, m] = onDate.split("-").map(Number);
  const start = m >= 7 ? y : y - 1;
  const yy = (n) => String(n % 100).padStart(2, "0");
  const out = [`${yy(start)}/${yy(start + 1)}`, String(y)];
  if (m <= 2) out.push(String(y - 1)); // a calendar season that ended in December is still the one a January piece quotes
  return out;
}

const baselinePath = (id) => path.join(DIR, `${id}.json`);
function readBaseline(id) {
  try {
    return JSON.parse(fs.readFileSync(baselinePath(id), "utf8"));
  } catch {
    return null;
  }
}

async function loadArticle(id) {
  const { data, error } = await supabase
    .from("contents")
    .select("id,slug,title,status,category,player_name,players_json,sections_json,content_en")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Supabase: ${error.message}`);
  if (!data) throw new Error(`no article #${id}`);
  return data;
}

/** Carded names; one card line may hold several ("@player: A, B"), as preflight reads it. */
function cardNames(row) {
  return (Array.isArray(row.sections_json) ? row.sections_json : [])
    .filter((b) => b?.type === "player" && b.name)
    .flatMap((b) => String(b.name).split(",").map((n) => n.trim()).filter(Boolean));
}

/** Player names an article carries: cards, the admin's players list, the featured player. */
function playersFromArticle(row) {
  const out = [];
  out.push(...cardNames(row).map((n) => [n, "card"]));
  let pj = row.players_json;
  if (typeof pj === "string") {
    try {
      pj = JSON.parse(pj);
    } catch {
      pj = null;
    }
  }
  for (const p of Array.isArray(pj) ? pj : []) if (p?.name) out.push([p.name, "players_json"]);
  if (row.player_name) out.push([row.player_name, "player_name"]);
  return out;
}

// ---- Highlightly -------------------------------------------------------------
/**
 * pickPlayer's last resort is "the only one with that surname", whatever his first
 * name: with Mats Rots missing from the results it would take his brother Daan (same
 * club, six years older). For a two-word name the pick must agree on the first name:
 * the same initial on the short form ("M. Rots"), or the full name carrying it.
 */
function firstNameAgrees(query, p) {
  const words = (s) => norm(s).replace(/[^\p{L}\p{N} ]/gu, "").split(" ").filter(Boolean);
  const q = words(query);
  if (q.length < 2) return true;
  return words(p.name)[0]?.[0] === q[0][0] || words(p.fullName).includes(q[0]);
}

async function resolve(name, pinned, previous) {
  if (pinned.has(norm(name))) return { id: pinned.get(norm(name)), hl_name: null, how: "--ids" };
  if (previous?.id) return { id: previous.id, hl_name: previous.hl_name, how: "baseline" };
  const list = (await hl("/players", { name, limit: 5 }))?.data ?? [];
  const candidates = list.map((p) => `${p.fullName || p.name} (#${p.id})`);
  const pick = pickPlayer(name, list);
  if (!pick) return { id: null, error: list.length ? "ambiguous" : "not found", candidates };
  if (!firstNameAgrees(name, pick)) return { id: null, error: `surname-only match, first name differs (${pick.fullName || pick.name} #${pick.id})`, candidates };
  return { id: pick.id, hl_name: pick.fullName || pick.name, how: "search" };
}

/** Birth date and the club on the profile. Profile dates are DD/MM/YYYY. */
async function profileOf(id, maxAgeMs) {
  const res = await hl(`/players/${id}`, {}, maxAgeMs === undefined ? {} : { maxAgeMs });
  const row = Array.isArray(res) ? res[0] : res;
  const m = String(row?.profile?.birthDate ?? "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return {
    birth_date: m ? `${m[3]}-${m[2]}-${m[1]}` : null,
    profile_club: row?.profile?.club?.current ?? null,
    hl_name: row?.fullName || row?.name || null,
  };
}

/** One row per competition in the seasons we track; starts = games minus substitute appearances. */
async function seasonRows(id, seasons, maxAgeMs) {
  const stats = await hl(`/players/${id}/statistics`, {}, { maxAgeMs });
  const row = Array.isArray(stats) ? stats[0] : stats;
  return (row?.perCompetition ?? [])
    .filter((c) => seasons.includes(String(c.season)))
    .map((c) => ({
      season: String(c.season),
      club: c.club ?? "",
      league: c.league ?? "",
      type: c.type ?? "",
      apps: c.gamesPlayed ?? 0,
      starts: (c.gamesPlayed ?? 0) - (c.substitutedIn ?? 0),
      minutes: c.minutesPlayed ?? 0,
      goals: c.goals ?? 0,
      assists: c.assists ?? 0,
    }));
}

const rowKey = (r) => `${r.season}|${norm(r.club)}|${norm(r.league)}`;
const isLeague = (r) => /national league/i.test(r.type);

/** The club he plays league football for; a European-format season wins over a calendar one (same rule as recentRoles). */
function mainClub(rows) {
  const played = rows.filter((r) => r.apps > 0 && isLeague(r));
  const european = played.filter((r) => r.season.includes("/"));
  return [...(european.length ? european : played)].sort((a, b) => b.minutes - a.minutes)[0]?.club ?? "";
}

// ---- snapshot ------------------------------------------------------------------
async function snapshot(id, opts, { refresh = false } = {}) {
  const article = await loadArticle(id);
  const previous = readBaseline(id);
  if (refresh && !previous) throw new Error(`no baseline for #${id} yet: run  node scripts/freshness-check.mjs snapshot ${id}`);
  const today = localDate();
  const seasons = currentSeasons(today);

  let brief = null;
  if (opts.brief) brief = JSON.parse(fs.readFileSync(opts.brief, "utf8"));

  // The baseline must describe the figures the text was written from (see the header).
  const checked = Object.values(brief?.verification ?? {}).map((v) => v?.as_of).filter(validDate).sort()[0] ?? null;
  if (!refresh && checked && daysBetween(checked, today) > 1) {
    throw new Error(
      `the brief's figures were checked on ${checked}; a baseline taken today would hide what moved since. ` +
        `Re-verify and update as_of, then run again (if the article is already current: refresh-baseline ${id}, or snapshot ${id} without --brief)`,
    );
  }
  if (!refresh && checked && previous?.date && previous.date >= checked) {
    throw new Error(`kept the baseline from ${previous.date}: it is not older than the brief's checks (${checked}). After re-verifying the figures: refresh-baseline ${id}`);
  }
  // A move shows on the profile before he plays for the new club; re-read it whenever diff would.
  const profileStale = transferWindow(today) || !previous?.date || daysBetween(previous.date, today) >= 7;
  const named = [];
  const verified = Object.keys(brief?.verification ?? {});
  if (verified.length) named.push(...verified.map((n) => [n, "brief"]));
  else {
    if (brief) console.log("  note     the brief has no verification block; taking the players from the article");
    if (refresh) named.push(...previous.players.map((p) => [p.name, p.from]));
    named.push(...playersFromArticle(article));
  }
  for (const n of opts.players) named.push([n, "--players"]);
  const seen = new Map();
  for (const [n, from] of named) if (!seen.has(norm(n))) seen.set(norm(n), [n, from]);

  console.log(`\n#${article.id} ${article.slug} (${article.status})`);
  if (!seen.size) console.log("  no players found (no cards, players_json or player_name); pass --players to track some");

  const before = budgetToday().count;
  const players = [];
  for (const [name, from] of seen.values()) {
    const prev = previous?.players?.find((p) => norm(p.name) === norm(name));
    const r = await resolve(name, opts.ids, prev);
    if (!r.id) {
      players.push({ name, from, id: null, error: r.error, candidates: r.candidates });
      console.log(`  ${name.padEnd(26)} NOT TRACKED — ${r.error}${r.candidates.length ? `: ${r.candidates.join(", ")}` : ""}`);
      continue;
    }
    const keep = prev?.id === r.id && "birth_date" in prev && !profileStale;
    const prof = keep ? { birth_date: prev.birth_date, profile_club: prev.profile_club, hl_name: prev.hl_name } : await profileOf(r.id, opts.fresh ? 0 : STATS_MAX_AGE_MS);

    // The brief's age is a fact checked by hand; two years out means search found someone else.
    const v = brief?.verification?.[name];
    if (v && prof.birth_date && v.age !== undefined && v.age !== null && String(v.age).trim() !== "" && Number.isFinite(Number(v.age))) {
      const on = validDate(v.as_of) ? v.as_of : today;
      const hlAge = ageAt(prof.birth_date, on);
      const gap = Math.abs(hlAge - Number(v.age));
      if (gap >= 2 && r.how !== "--ids") {
        const error = `suspect: Highlightly #${r.id} ${r.hl_name || prof.hl_name || ""} was born ${prof.birth_date} (${hlAge} on ${on}), the brief says ${v.age}`;
        players.push({ name, from, id: null, error, candidates: [] });
        console.log(`  ${name.padEnd(26)} NOT TRACKED — ${error}; pin the right one with --ids "${name}=<id>"`);
        continue;
      }
      if (gap) console.log(`    note   ${name}: the brief says age ${v.age}; born ${prof.birth_date} makes him ${hlAge} on ${on} — check the age in the article`);
    }

    const rows = await seasonRows(r.id, seasons, opts.fresh ? 0 : STATS_MAX_AGE_MS);
    const club = mainClub(rows) || prof.profile_club || "";
    players.push({
      name,
      from,
      id: r.id,
      hl_name: r.hl_name || prof.hl_name,
      birth_date: prof.birth_date,
      profile_club: prof.profile_club,
      club,
      rows,
    });
    const top = rows.filter((x) => x.apps > 0).sort((a, b) => b.minutes - a.minutes)[0];
    const age = prof.birth_date ? `, ${ageAt(prof.birth_date, today)}` : "";
    console.log(
      `  ${name.padEnd(26)} #${String(r.id).padEnd(9)} ${(club || "?").padEnd(22)} ` +
        (top ? `${top.league} ${top.season}: ${statLine(top)}` : "no appearances this season") +
        `${prof.birth_date ? ` (born ${prof.birth_date}${age})` : ""}${r.how === "search" ? "" : `  [id from ${r.how}]`}`,
    );
    if (v?.club && club && !norm(club).includes(norm(v.club)) && !norm(v.club).includes(norm(club))) {
      console.log(`    note   ${name}: the brief says ${v.club}; Highlightly's league rows say ${club} (a loan, a stale brief, or the wrong player?)`);
    }
  }

  const baseline = {
    article_id: article.id,
    slug: article.slug,
    title: article.title,
    date: today,
    taken_at: new Date().toISOString(),
    verified_as_of: refresh ? today : checked,
    seasons,
    players,
  };
  fs.mkdirSync(DIR, { recursive: true });
  // One line per competition row, so a refreshed baseline reads as a short git diff.
  const json = JSON.stringify(baseline, null, 2).replace(/\{\n\s+("season"[^{}[\]]*?)\n\s+\}/g, (_m, inner) => `{ ${inner.replace(/\n\s+/g, " ")} }`);
  fs.writeFileSync(baselinePath(id), `${json}\n`);
  const missing = players.filter((p) => !p.id);
  const b = budgetToday();
  console.log(
    `\nsaved data/freshness/${id}.json — ${players.length - missing.length} player(s) tracked` +
      `${missing.length ? `, ${missing.length} not tracked (pin with --ids "Name=<id>")` : ""}. ` +
      `budget: ${Math.max(0, b.count - before)} request(s) this run, ${b.count}/${b.cap} today`,
  );
}

// ---- the article as sentences ------------------------------------------------------
const ABBR = /\b(No|Nos|Mr|Dr|St|vs|v|Jr|Sr|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|approx|c)\.$/i;
function splitSentences(p) {
  const out = [];
  for (const s of p.split(/(?<=[.!?])\s+(?=["“‘(]?[A-Z0-9])/)) {
    if (out.length && ABBR.test(out[out.length - 1])) out[out.length - 1] += ` ${s}`;
    else out.push(s);
  }
  return out;
}

/**
 * Block articles render from sections_json, so that is the text read here, through
 * the same copy the admin writes (lib/sections-to-html.mjs). content_en is only a
 * fallback: it can hold raw markup (a scout-publish row nobody has saved since) or
 * the admin's "<p></p>" placeholder, and reading that found no sentence at all.
 */
function articleParagraphs(row) {
  let src = String(row.content_en ?? "");
  if (Array.isArray(row.sections_json) && row.sections_json.length) src = sectionsToHtml(row.sections_json);
  else if (!/<\/?(p|h[1-6]|li|blockquote)\b/i.test(src) || /^@(lead|section|stat|table|player):/m.test(src)) {
    src = src.replace(/^@[a-z-]+(:[a-z]+)?:?\s*/gim, "").replace(/\*\*?/g, "");
  }
  const text = src
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h[1-6]|li|blockquote|tr|div|figcaption|caption)>/gi, "\n")
    .replace(/<\/t[dh]>/gi, " | ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#0?39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&amp;/g, "&");
  return text
    .split(/\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((p) => ({ text: p, sentences: splitSentences(p), isRow: (p.match(/ · | \| /g) ?? []).length >= 2 }));
}

/**
 * Where a tracked player is named: his full name in any case, or his surname as a
 * proper noun ("Read", "READ"), so "read the game" or "the king of assists" is not
 * Givairo Read or Josh King. Positions index the accent-stripped text.
 */
function person(name) {
  const sur = plain(surnameOf(name));
  const words = [esc(sur), esc(sur.toUpperCase())].filter((v, i, a) => a.indexOf(v) === i).join("|");
  return {
    name,
    fullRe: new RegExp(`(?<![\\p{L}\\p{N}])${esc(plain(name))}(?![\\p{L}\\p{N}])`, "giu"),
    surRe: new RegExp(`(?<![\\p{L}\\p{N}])(?:${words})(?![\\p{L}\\p{N}])`, "gu"),
  };
}
const mentionsAt = (text, pl) => {
  const t = plain(text);
  return [...t.matchAll(pl.fullRe), ...t.matchAll(pl.surRe)].map((m) => m.index);
};
const mentions = (text, pl) => mentionsAt(text, pl).length > 0;

/** Of the tracked players a sentence names, the one named nearest to position `at` (ties keep all). */
function nearestNamed(s, people, at) {
  let best = Infinity;
  let who = [];
  for (const pl of people) {
    for (const i of mentionsAt(s, pl)) {
      const d = Math.abs(i - at);
      if (d < best) [best, who] = [d, [pl.name]];
      else if (d === best && !who.includes(pl.name)) who.push(pl.name);
    }
  }
  return who;
}

/**
 * Who each paragraph is about: the tracked players it names, or — for the "He" and
 * "His" paragraphs that follow — the last ones named up to three paragraphs back.
 */
function paragraphOwners(paras, players) {
  let last = new Set();
  let lastAt = -99;
  return paras.map((p, i) => {
    const here = new Set(players.filter((pl) => mentions(p.text, pl)).map((pl) => pl.name));
    if (here.size) {
      last = here;
      lastAt = i;
      return here;
    }
    return i - lastAt <= 3 ? last : new Set();
  });
}

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
const MONTH = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*";
/** The number as digits, as a word up to twenty, "no" for nought — but not as a date ("10 October", "October 10"). */
function numberRe(n) {
  const forms = [String(n)];
  if (n >= 1000) forms.push(n.toLocaleString("en-US"));
  if (n <= 20) forms.push(WORDS[n]);
  if (n === 0) forms.push("no");
  return new RegExp(`(?<![\\w.,])(?<!${MONTH}\\s)(${forms.map(esc).join("|")})(?![\\w]|[.,]\\d)(?!\\s${MONTH}\\b)`, "gi");
}

const KW = {
  apps: /appearance|\bapps?\b|\bgames?\b|\bmatch(es)?\b|\bouting|\bplayed\b|\bcaps?\b/i,
  starts: /\bstart|\bXI\b|line-?ups?/i,
  minutes: /\bminutes?\b|\bmins?\b/i,
  goals: /\bgoals?\b|\bscor|\bstrikes?\b|\bnetted|hat-?trick|\bbrace|\btally/i,
  assists: /\bassist|\bset up|\bcreated/i,
  mpg: /\bevery\b|per goal/i,
  age: /year-?old|\baged?\b|years old|\bturn(s|ed)?\b|\bteen/i,
};
const ROLE_WORDS = /first[- ]choice|\bregular|ever-?present|\bstarter|\bstarting|nailed|automatic|undisputed|every minute|\bmainstay|\bfixture\b/i;
const STAMP = /\bas of\b[^.]*?(\d{4}|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b)/i;

function excerpt(s, at) {
  if (s.length <= 240) return s;
  const from = Math.max(0, at - 110);
  return `${from ? "…" : ""}${s.slice(from, from + 230).trim()}…`;
}

/**
 * Sentences that carry `find` for this player. A number counts when a word for the
 * stat sits within a few words of it and the sentence is about him: a sentence that
 * names tracked players is about the one named nearest the number; one that names
 * none belongs to its paragraph's player (or the only player tracked). In a table row
 * his name in the row is enough, because the column header carries the meaning.
 */
function sentencesFor(model, player, find) {
  const out = [];
  model.paras.forEach((p, i) => {
    const near = model.single || model.owners[i].has(player.name);
    for (const s of p.sentences) {
      const named = model.people.filter((pl) => mentions(s, pl)).map((pl) => pl.name);
      const isHim = named.includes(player.name);
      const about = (at) => (named.length ? isHim && (named.length === 1 || nearestNamed(s, model.people, at).includes(player.name)) : near);
      if (find.kind === "club" || find.kind === "role") {
        const hit = find.kind === "club" ? norm(s).indexOf(norm(find.value)) : s.search(ROLE_WORDS);
        if (hit >= 0 && about(hit)) out.push(excerpt(s, hit));
        continue;
      }
      const re = numberRe(find.value);
      let m;
      while ((m = re.exec(s))) {
        const win = s.slice(Math.max(0, m.index - 30), m.index + m[0].length + 40);
        if ((KW[find.kind].test(win) || (p.isRow && isHim)) && about(m.index)) {
          out.push(excerpt(s, m.index));
          break;
        }
      }
    }
  });
  return [...new Set(out)];
}

// ---- diff ----------------------------------------------------------------------------
function compare(p, nowRows, baseDate, checkDate) {
  const items = [];
  const baseByKey = new Map(p.rows.map((r) => [rowKey(r), r]));
  const nowKeys = new Set(nowRows.map(rowKey));
  const knownClubs = new Set([p.club, ...p.rows.filter(isLeague).map((r) => r.club)].filter(Boolean).map(norm));

  for (const r of nowRows) {
    const b = baseByKey.get(rowKey(r));
    const where = `${r.league} ${r.season} (${r.club})`;
    if (!b) {
      if (r.apps === 0) continue;
      const moved = isLeague(r) && !knownClubs.has(norm(r.club));
      items.push(
        moved
          ? { label: `CLUB: now playing for ${r.club} — new ${where}: ${statLine(r)}`, finds: p.club ? [{ kind: "club", value: p.club }] : [] }
          : { label: `new competition, ${where}: ${statLine(r)}`, finds: [] },
      );
      continue;
    }
    const moves = FIELDS.filter((f) => r[f] !== b[f]);
    if (!moves.length) continue;
    items.push({ label: `${where}: ${moves.map((f) => `${f} ${b[f]} → ${r[f]}`).join(" · ")}`, finds: moves.map((f) => ({ kind: f, value: b[f] })) });
    if (b.goals > 0 && r.goals > 0 && (moves.includes("minutes") || moves.includes("goals"))) {
      const o = Math.round(b.minutes / b.goals);
      const n = Math.round(r.minutes / r.goals);
      if (o !== n) items.push({ label: `${r.league}: a goal every ${o} → ${n} minutes`, finds: [{ kind: "mpg", value: o }] });
    }
  }
  for (const b of p.rows) {
    if (!nowKeys.has(rowKey(b)) && b.apps > 0) items.push({ label: `no longer listed by Highlightly: ${b.league} ${b.season} (${b.club}) ${statLine(b)}`, finds: [] });
  }

  // Club competitions together: "in all competitions" figures, and a player who lost his place.
  const clubs = new Set([...p.rows, ...nowRows].filter(isLeague).map((r) => norm(r.club)));
  const ofClub = (rows) => rows.filter((r) => clubs.has(norm(r.club)));
  const [b0, n0] = [ofClub(p.rows), ofClub(nowRows)];
  const before = Object.fromEntries(FIELDS.map((f) => [f, sum(b0, f)]));
  const now = Object.fromEntries(FIELDS.map((f) => [f, sum(n0, f)]));
  if (n0.filter((r) => r.apps > 0).length >= 2) {
    const moves = FIELDS.filter((f) => before[f] !== now[f]);
    if (moves.length) items.push({ label: `all club competitions: ${moves.map((f) => `${f} ${before[f]} → ${now[f]}`).join(" · ")}`, finds: moves.map((f) => ({ kind: f, value: before[f] })) });
  }
  if (now.apps > before.apps && now.starts === before.starts) {
    items.push(
      before.starts > 0
        ? { label: `STOPPED STARTING: ${now.apps - before.apps} appearance(s) since ${baseDate}, all from the bench (starts still ${now.starts})`, finds: [{ kind: "role" }] }
        : { label: `BENCH ONLY: ${now.apps - before.apps} appearance(s) since ${baseDate}, still no start this season`, finds: [{ kind: "role" }] },
    );
  } else {
    // Starts in a cup can hide a lost league place from the totals above.
    for (const r of nowRows.filter(isLeague)) {
      const b = baseByKey.get(rowKey(r));
      if (b && b.starts > 0 && r.apps > b.apps && r.starts === b.starts) {
        items.push({ label: `LOST HIS LEAGUE PLACE: ${r.apps - b.apps} ${r.league} appearance(s) since ${baseDate}, all from the bench (starts still ${r.starts})`, finds: [{ kind: "role" }] });
      }
    }
  }

  if (p.birth_date) {
    const a0 = ageAt(p.birth_date, baseDate);
    const a1 = ageAt(p.birth_date, checkDate);
    if (a0 !== a1) items.push({ label: `AGE: ${a0} → ${a1} (born ${p.birth_date}; checked for ${checkDate})`, finds: [{ kind: "age", value: a0 }] });
  }
  return { items, quiet: now.apps === before.apps && before.apps > 0 };
}

async function diff(id, opts) {
  const base = opts.baseline ? JSON.parse(fs.readFileSync(opts.baseline, "utf8")) : readBaseline(id);
  if (!base) throw new Error(`no baseline for #${id}: run  node scripts/freshness-check.mjs snapshot ${id}`);
  if (base.article_id && Number(base.article_id) !== id) throw new Error(`that baseline is for #${base.article_id}, not #${id}`);
  const article = await loadArticle(id);
  const today = localDate();
  const checkDate = opts.date || today;
  const age = daysBetween(base.date, today);

  console.log(`\n#${article.id} ${article.slug} (${article.status}) — baseline ${base.date}, ${age} day(s) old`);
  if (age > STALE_DAYS) {
    console.log(`  WARNING  the baseline is older than ${STALE_DAYS} days. Changes below are measured from ${base.date}; re-verify the piece, then refresh-baseline.`);
  }
  if (base.slug && article.slug !== base.slug) console.log(`  note     slug changed since the baseline: ${base.slug} → ${article.slug}`);
  if (base.verified_as_of && base.verified_as_of < base.date) {
    console.log(`  note     the brief's figures were checked on ${base.verified_as_of}, the baseline is from ${base.date}: anything that moved in between is not shown`);
  }

  const tracked = base.players.filter((p) => p.id);
  const people = tracked.map((p) => person(p.name));
  const paras = articleParagraphs(article);
  const model = { paras, people, owners: paragraphOwners(paras, people), single: tracked.length === 1 };
  const seasons = [...new Set([...(base.seasons ?? []), ...currentSeasons(today)])];
  const maxAgeMs = opts.fresh ? 0 : STATS_MAX_AGE_MS;

  const before = budgetToday().count;
  let changed = 0;
  const unchanged = [];
  const quiet = [];
  for (const p of tracked) {
    const rows = await seasonRows(p.id, seasons, maxAgeMs);
    const { items, quiet: noGames } = compare(p, rows, base.date, checkDate);
    if (noGames && age >= 7) quiet.push(p.name);
    // A move he has not played for yet shows only on the profile (one call; windows and quiet players only).
    if (p.profile_club && (transferWindow(today) || (noGames && age >= 7))) {
      const nowClub = (await profileOf(p.id, maxAgeMs)).profile_club;
      if (nowClub && norm(nowClub) !== norm(p.profile_club)) {
        items.unshift({
          label: `CLUB: his profile now says ${nowClub} (was ${p.profile_club}) — a transfer or loan he has not played for yet?`,
          finds: [...new Set([p.club, p.profile_club].filter(Boolean))].map((value) => ({ kind: "club", value })),
        });
      }
    }
    if (!items.length) {
      unchanged.push(p.name);
      continue;
    }
    changed++;
    const who = people.find((x) => x.name === p.name);
    console.log(`\n${p.name} (Highlightly #${p.id}${p.club ? `, ${p.club}` : ""})`);
    for (const it of items) {
      console.log(`  ${it.label}`);
      for (const f of it.finds) {
        const hits = sentencesFor(model, who, f);
        const what = f.kind === "club" ? `"${f.value}"` : f.kind === "role" ? "role wording" : f.kind === "mpg" ? `every ${f.value}` : `${f.kind} ${f.value}`;
        if (!hits.length) {
          console.log(f.kind === "role" ? "    no starter wording (first choice, regular, …) found near him" : `    ${what}: not found in the text (check tables, cards and captions by eye)`);
          continue;
        }
        console.log(`    ${what} — in the article:`);
        for (const h of hits) console.log(`      “${h}”`);
      }
    }
  }

  const untracked = base.players.filter((x) => !x.id);
  for (const p of untracked) console.log(`\n  not checked: ${p.name} (${p.error ?? "no id"} at snapshot) — pin with --ids "${p.name}=<id>" and refresh-baseline`);
  // A card added after the baseline (a rewrite, an --update that kept the old baseline) is checked by nobody.
  const known = new Set(base.players.map((p) => norm(p.name)));
  const uncarded = [...new Set(cardNames(article))].filter((n) => !known.has(norm(n)));
  for (const n of uncarded) console.log(`\n  not checked: ${n} has a card but is not in the baseline — refresh-baseline ${id} (or snapshot --players "${n}")`);
  if (quiet.length) console.log(`\n  check    no appearance since ${base.date}: ${quiet.join(", ")} (injured, dropped, or an international break?)`);

  if (changed) {
    const stamps = [...new Set(paras.flatMap((p) => p.sentences.filter((s) => STAMP.test(s))))];
    if (stamps.length) {
      console.log("\n  date stamps to move once the figures are fixed:");
      for (const s of stamps) console.log(`      “${excerpt(s, s.search(/\bas of\b/i))}”`);
    }
  }
  const b = budgetToday();
  console.log(
    `\n${changed ? `${changed} of ${tracked.length} player(s) changed since ${base.date}` : `nothing changed since ${base.date}`}` +
      `${changed && unchanged.length ? `; unchanged: ${unchanged.join(", ")}` : ""}. ` +
      `budget: ${Math.max(0, b.count - before)} request(s) this run, ${b.count}/${b.cap} today`,
  );
  if (changed) console.log(`After fixing: node scripts/freshness-check.mjs refresh-baseline ${id}`);
  const unchecked = untracked.length + uncarded.length;
  if (!changed && unchecked) console.log(`${unchecked} player(s) not checked (above): the figures for them are not vouched for.`);
  return changed ? 2 : unchecked ? 3 : 0;
}

// ---- CLI ---------------------------------------------------------------------------------
// Pure helpers are exported for scratch tests; the CLI runs only when this file is run.
export { compare, sentencesFor, paragraphOwners, articleParagraphs, person, firstNameAgrees, cardNames };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const argv = process.argv.slice(2);
  const VALUE_FLAGS = ["--brief", "--players", "--ids", "--date", "--baseline"];
  const flag = (n) => {
    const i = argv.indexOf(n);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const [cmd, idArg] = argv.filter((a, i) => !a.startsWith("--") && !VALUE_FLAGS.includes(argv[i - 1]));
  const id = Number(idArg);
  const pins = (flag("--ids") ?? "")
    .split(",")
    .map((s) => s.split("=").map((x) => x.trim()))
    .filter(([n, v]) => n && /^\d+$/.test(v ?? ""));
  const opts = {
    brief: flag("--brief"),
    baseline: flag("--baseline"),
    date: flag("--date"),
    fresh: argv.includes("--fresh"),
    // a name pinned with --ids is tracked even if nothing else lists it
    players: [...(flag("--players") ?? "").split(",").map((s) => s.trim()).filter(Boolean), ...pins.map(([n]) => n)],
    ids: new Map(pins.map(([n, v]) => [norm(n), Number(v)])),
  };

  if (!["snapshot", "diff", "refresh-baseline"].includes(cmd) || !Number.isInteger(id) || id <= 0 || (opts.date && !validDate(opts.date))) {
    console.error(
      "Usage: node scripts/freshness-check.mjs snapshot <articleId> [--brief brief.json] [--players 'A,B'] [--ids 'A=123']\n" +
        "       node scripts/freshness-check.mjs diff <articleId> [--date YYYY-MM-DD] [--fresh] [--baseline file.json]\n" +
        "       node scripts/freshness-check.mjs refresh-baseline <articleId>",
    );
    process.exit(1);
  }

  try {
    if (cmd === "diff") process.exitCode = await diff(id, opts);
    else await snapshot(id, opts, { refresh: cmd === "refresh-baseline" });
  } catch (e) {
    console.error(`error: ${e.message}`);
    process.exitCode = 1;
  }
}
