#!/usr/bin/env node
/**
 * publish-queue.mjs — the Tuesday and Friday publishing slots.
 *
 * WHY: from 16 Nov 2026 the site publishes in two fixed slots a week, Tuesday and
 * Friday, and a piece is written in the week it goes out (docs/TODO.md). Before
 * that, finished pieces sat in the pending list for weeks — #160 and #161 were
 * written on 30 September and still waiting in mid-November with their figures out
 * of date — and nothing said which piece was meant to go out when. The queue holds
 * the approved piece for each slot, and `publish` is the one way out of it: it
 * refuses anything not queued, not pending, without a cover, or whose figures moved
 * since they were checked (scripts/freshness-check.mjs diff exits 2), and a piece with
 * carded players the check could not cover (exit 3) unless --allow-unchecked says
 * they were verified by hand. Dates are the owner's calendar (Europe/Istanbul).
 *
 *   node scripts/publish-queue.mjs add 172 2026-11-20     # pending articles only
 *   node scripts/publish-queue.mjs list
 *   node scripts/publish-queue.mjs due [--date 2026-11-20]
 *   node scripts/publish-queue.mjs remove 172
 *   node scripts/publish-queue.mjs publish 172 [--now] [--allow-unchecked]   # --now: ahead of its slot
 *
 * The queue is data/publish-queue.json (committed). Exit 1 on an error or a refusal.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.existsSync(path.join(ROOT, ".env.local")) ? fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n") : []) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const QUEUE = path.join(ROOT, "data", "publish-queue.json");
const SLOT_DAYS = [2, 5]; // Tuesday, Friday
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// The service key: pending rows are hidden from the anon key, and an anon update fails silently under RLS.
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, SERVICE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Slot days are the owner's (Türkiye, UTC+3), whatever clock the machine runs on, so a
// run from a UTC box at 22:00 on Monday already sees Tuesday's slot, as he does.
const TZ = "Europe/Istanbul";
const localDate = (d = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const weekday = (date) => new Date(`${date}T12:00:00Z`).getUTCDay();
const validDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s ?? "") && !Number.isNaN(Date.parse(`${s}T12:00:00Z`)) && new Date(`${s}T12:00:00Z`).toISOString().slice(0, 10) === s;
const daysBetween = (a, b) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000);

/** No file is an empty queue; a file that does not parse (a merge conflict) is an error, never an empty queue that the next write would save over it. */
function readQueue() {
  let raw;
  try {
    raw = fs.readFileSync(QUEUE, "utf8");
  } catch (e) {
    if (e.code === "ENOENT") return { items: [] };
    throw e;
  }
  let q;
  try {
    q = JSON.parse(raw);
  } catch (e) {
    throw new Error(`data/publish-queue.json does not parse (${e.message}); fix it by hand, nothing was changed`);
  }
  if (!Array.isArray(q?.items)) throw new Error("data/publish-queue.json has no items list; fix it by hand, nothing was changed");
  return q;
}
function writeQueue(q) {
  q.items.sort((a, b) => a.date.localeCompare(b.date) || a.article_id - b.article_id);
  fs.mkdirSync(path.dirname(QUEUE), { recursive: true });
  fs.writeFileSync(QUEUE, `${JSON.stringify(q, null, 2)}\n`);
}

async function articles(ids) {
  if (!ids.length) return new Map();
  const { data, error } = await supabase.from("contents").select("id,slug,title,status,category,cover_image").in("id", ids);
  if (error) throw new Error(`Supabase: ${error.message}`);
  return new Map((data ?? []).map((r) => [r.id, r]));
}

function baselineNote(id) {
  try {
    const b = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "freshness", `${id}.json`), "utf8"));
    const age = daysBetween(b.date, localDate());
    return `baseline ${b.date}${age > 14 ? " (STALE)" : ""}`;
  } catch {
    return "NO BASELINE";
  }
}

function line(it, row) {
  const state = row ? row.status : "missing from the database";
  const cover = row?.cover_image ? "cover" : "NO COVER";
  return `${DAY[weekday(it.date)]} ${it.date}  #${String(it.article_id).padEnd(4)} ${state.padEnd(9)} ${cover.padEnd(8)} ${baselineNote(it.article_id).padEnd(20)} ${row?.title ?? it.title}`;
}

/**
 * A published page is cached for up to a day, so the article, its hub, home and its
 * siblings are refreshed through /api/revalidate (lib/revalidate-content.ts), as
 * scripts/patch-article-text.mjs does. Never fails the publish: the row is already live.
 */
async function revalidate(row) {
  if (!process.env.ADMIN_PASSWORD) {
    console.log("  note     no ADMIN_PASSWORD in .env.local: the hub and home may not list the piece for up to a day");
    return;
  }
  try {
    const res = await fetch("https://www.scoutgamer.com/api/revalidate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Basic ${Buffer.from(`scout:${process.env.ADMIN_PASSWORD}`).toString("base64")}`,
      },
      body: JSON.stringify({ changes: [{ category: row.category, slug: row.slug }] }),
    });
    console.log(res.ok ? "  revalidated the article, its hub, home and its siblings" : `  note     revalidation answered ${res.status}`);
  } catch (err) {
    console.log(`  note     revalidation failed: ${err.message}`);
  }
}

// ---- commands --------------------------------------------------------------------
async function add(id, date) {
  if (!validDate(date)) throw new Error(`date must be YYYY-MM-DD (got "${date ?? ""}")`);
  const row = (await articles([id])).get(id);
  if (!row) throw new Error(`no article #${id}`);
  if (row.status !== "pending") throw new Error(`#${id} is ${row.status}; only pending articles go in the queue`);

  const q = readQueue();
  const today = localDate();
  if (!SLOT_DAYS.includes(weekday(date))) console.log(`  warning  ${date} is a ${DAY[weekday(date)]}; the slots are Tuesday and Friday`);
  if (date < today) console.log(`  warning  ${date} is in the past`);
  const other = q.items.find((it) => it.status === "queued" && it.date === date && it.article_id !== id);
  if (other) console.log(`  warning  the ${date} slot already holds #${other.article_id} ${other.title}`);
  if (!row.cover_image) console.log("  note     no cover yet; publish will refuse until one is set");
  const baseline = baselineNote(id);
  if (baseline === "NO BASELINE") console.log(`  note     no freshness baseline; take one when the figures are verified: node scripts/freshness-check.mjs snapshot ${id}`);

  const existing = q.items.find((it) => it.status === "queued" && it.article_id === id);
  if (existing) {
    console.log(`  moved #${id} from ${existing.date} to ${date}`);
    Object.assign(existing, { date, slug: row.slug, title: row.title });
  } else {
    q.items.push({ article_id: id, slug: row.slug, title: row.title, category: row.category, date, added: today, status: "queued" });
    console.log(`  queued #${id} for ${DAY[weekday(date)]} ${date}: ${row.title}`);
  }
  writeQueue(q);
}

async function list() {
  const q = readQueue();
  const queued = q.items.filter((it) => it.status === "queued");
  const done = q.items.filter((it) => it.status === "done").slice(-5);
  const rows = await articles(queued.map((it) => it.article_id));
  console.log(queued.length ? "\nqueued:" : "\nthe queue is empty");
  for (const it of queued) console.log(`  ${line(it, rows.get(it.article_id))}`);
  if (done.length) {
    console.log("\nlast published from the queue:");
    for (const it of done) console.log(`  ${it.date}  #${String(it.article_id).padEnd(4)} published ${it.published_at?.slice(0, 16).replace("T", " ")} UTC  ${it.title}`);
  }
}

function remove(id) {
  const q = readQueue();
  const i = q.items.findIndex((it) => it.status === "queued" && it.article_id === id);
  if (i < 0) throw new Error(`#${id} is not in the queue`);
  const [it] = q.items.splice(i, 1);
  writeQueue(q);
  console.log(`  removed #${id} (${it.date}) ${it.title}`);
}

async function due(date) {
  if (!validDate(date)) throw new Error(`date must be YYYY-MM-DD (got "${date}")`);
  const queued = readQueue().items.filter((it) => it.status === "queued");
  const dueNow = queued.filter((it) => it.date <= date);
  const rows = await articles(dueNow.map((it) => it.article_id));
  if (!dueNow.length) {
    const next = queued.find((it) => it.date > date);
    console.log(`nothing due on ${DAY[weekday(date)]} ${date}${next ? `; next: ${DAY[weekday(next.date)]} ${next.date} #${next.article_id} ${next.title}` : ""}`);
    return;
  }
  for (const it of dueNow) {
    console.log(`${it.date < date ? "OVERDUE" : "due    "} ${line(it, rows.get(it.article_id))}`);
    console.log(`        node scripts/publish-queue.mjs publish ${it.article_id}`);
  }
}

async function publish(id, { now, allowUnchecked }) {
  const q = readQueue();
  const it = q.items.find((x) => x.article_id === id && x.status === "queued");
  if (!it) {
    const done = q.items.find((x) => x.article_id === id && x.status === "done");
    throw new Error(done ? `#${id} was already published from the queue (${done.published_at})` : `#${id} is not in the queue; nothing outside it is published (add it first: publish-queue.mjs add ${id} <date>)`);
  }
  const today = localDate();
  if (it.date > today && !now) throw new Error(`#${id} is booked for ${DAY[weekday(it.date)]} ${it.date}; pass --now to publish it ahead of its slot`);
  if (!SERVICE) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in .env.local (an anon update fails silently under RLS)");

  const row = (await articles([id])).get(id);
  if (!row) throw new Error(`no article #${id}`);
  if (row.status !== "pending") throw new Error(`#${id} is ${row.status}, not pending`);
  if (!row.cover_image) throw new Error(`#${id} has no cover image; add it in /admin/edit/${id} first`);

  console.log(`\nfreshness check for #${id}:`);
  const check = spawnSync(process.execPath, [path.join(ROOT, "scripts", "freshness-check.mjs"), "diff", String(id)], { stdio: "inherit", cwd: ROOT, timeout: 300000 });
  if (check.status === 2) throw new Error(`#${id}: figures changed since the baseline (above). Fix the article, run freshness-check refresh-baseline ${id}, then publish again`);
  // 3: nothing moved for the players it checked, but some carded players were not checked at all.
  if (check.status === 3 && !allowUnchecked) {
    throw new Error(`#${id}: some players are not checked (above). Pin them (--ids) and refresh-baseline, or verify them by hand and pass --allow-unchecked`);
  }
  if (check.status !== 0 && check.status !== 3) throw new Error(`#${id}: the freshness check did not complete (exit ${check.status ?? check.signal}); not publishing`);

  const { data: wrote, error } = await supabase.from("contents").update({ status: "published" }).eq("id", id).eq("status", "pending").select("id");
  if (error) throw new Error(`update failed: ${error.message}`);
  if (!wrote?.length) console.log(`  note     #${id} was no longer pending when written (changed elsewhere meanwhile?); reading it back`);
  const { data: back, error: e2 } = await supabase.from("contents").select("id,slug,status,category").eq("id", id).single();
  if (e2 || back?.status !== "published") throw new Error(`read-back says #${id} is ${back?.status ?? e2?.message}; the write did not land`);
  console.log(`\n  published #${id} ${back.slug} (read back: ${back.status})`);

  Object.assign(it, { status: "done", slug: back.slug, published_at: new Date().toISOString() });
  writeQueue(q);

  await revalidate(back);
  const post = spawnSync(process.execPath, [path.join(ROOT, "scripts", "post-publish.mjs"), back.slug], { stdio: "inherit", cwd: ROOT });
  if (post.status !== 0) console.log("  note     post-publish listed things to fix (above); the article itself is live");
}

// ---- CLI ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const dateFlag = argv.indexOf("--date");
const positional = argv.filter((a, i) => !a.startsWith("--") && !(dateFlag >= 0 && i === dateFlag + 1));
const [cmd, idArg, dateArg] = positional;
const id = Number(idArg);
const needsId = ["add", "remove", "publish"].includes(cmd);

try {
  if (needsId && !(Number.isInteger(id) && id > 0)) throw new Error("an article id is required");
  if (cmd === "add") await add(id, dateArg);
  else if (cmd === "list") await list();
  else if (cmd === "remove") remove(id);
  else if (cmd === "due") await due(dateFlag >= 0 ? argv[dateFlag + 1] : localDate());
  else if (cmd === "publish") await publish(id, { now: argv.includes("--now"), allowUnchecked: argv.includes("--allow-unchecked") });
  else {
    console.log(
      "Usage: node scripts/publish-queue.mjs add <articleId> <YYYY-MM-DD> | list | remove <articleId> | due [--date YYYY-MM-DD] | publish <articleId> [--now] [--allow-unchecked]",
    );
    process.exitCode = 1;
  }
} catch (e) {
  console.error(`error: ${e.message}`);
  process.exitCode = 1;
}
