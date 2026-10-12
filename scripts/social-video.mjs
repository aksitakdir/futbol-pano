#!/usr/bin/env node
/**
 * social-video.mjs — a ready-to-post folder for one article: the vertical reel
 * (MP4), the Instagram carousel (4:5 PNGs, numbered), the X cards (16:9) and the
 * platform copy, all cut from the article's own blocks.
 *
 *   node scripts/social-video.mjs <id|slug> [--base http://localhost:3000] [--stage 1|2|3]
 *        [--feature "Marco Palestra"] [--reel "headline,stat:0,player:Marco Palestra,verdict"] [--no-carousel]
 *
 * --feature puts that player's card first in the carousel and in the default reel.
 *
 * --set "player:Marco Palestra|real=Chelsea debut on 10 October, 18 minutes" (repeatable)
 *   re-cuts one card's fields for social when something has happened since the
 *   article's date. Date what you change; the article itself is corrected
 *   separately (scripts/patch-article-text.mjs), with the owner's OK.
 * A reel selector can also be "custom:stat|value=18|label=Chelsea minutes|note=…"
 *   for a card the article does not carry.
 *
 * --carousel / --story / --x "sel;sel;…" pick exactly which cards go in each set
 *   (same selectors as --reel). Without them: carousel = headline → players → list,
 *   x = every stat/contrast/verdict/player card, no story set.
 *
 * Output: social-out/<slug>/{reel.mp4, carousel/NN-*.png, x/*.png, copy.md}
 *
 * The cards come from /api/social-card (production by default — the URLs carry
 * all the content, so pending articles render too). The reel is stitched locally
 * by scripts/video/reel.swift with AVFoundation: no ffmpeg, no download, no API
 * cost. It is silent on purpose — add the platform's own licensed audio when
 * posting; music we do not hold rights to never goes into the file.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { extract, buildCards } from "../lib/social-extract.mjs";
import { buildPlatformPack, packToMarkdown } from "../lib/social-copy.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.existsSync(path.join(ROOT, ".env.local")) ? fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n") : []) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const args = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : dflt;
};
const key = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
if (!key) {
  console.error('Usage: node scripts/social-video.mjs <id|slug> [--base URL] [--stage 1|2|3] [--reel "headline,stat:0,player:Name,verdict"]');
  process.exit(1);
}
const BASE = flag("--base", "https://www.scoutgamer.com").replace(/\/$/, "");
const stage = Number(flag("--stage", "1")) || 1;
const carousel = !args.includes("--no-carousel");

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const isId = /^\d+$/.test(key);
const { data: row, error } = await supabase
  .from("contents")
  .select("id,slug,title,category,status,cover_image,player_name,created_at,sections_json")
  .eq(isId ? "id" : "slug", isId ? Number(key) : key)
  .maybeSingle();
if (error || !row) {
  console.error(error?.message ?? `No article "${key}"`);
  process.exit(1);
}

const m = extract(row.sections_json ?? []);
// Every player gets a card here (the panel stops at six); the carousel still caps at Instagram's ten.
const cards = buildCards(row, m, BASE, { maxPlayers: 99, maxStats: 99 });
const outDir = path.join(ROOT, "social-out", row.slug);
fs.mkdirSync(outDir, { recursive: true });

const withFormat = (url, format) => {
  const u = new URL(url);
  u.searchParams.set("format", format);
  return u.toString();
};
const safe = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

async function fetchCard(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} for ${url.slice(0, 120)}…`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return file;
}

// --set overrides, applied to every format of the matching card.
const sets = args
  .map((a, i) => (a === "--set" ? args[i + 1] : null))
  .filter(Boolean)
  .map((s) => {
    const [sel, ...pairs] = s.split("|");
    return { sel: sel.trim(), fields: Object.fromEntries(pairs.map((p) => [p.slice(0, p.indexOf("=")).trim(), p.slice(p.indexOf("=") + 1).trim()])) };
  });

/** Apply --set to a card found any other way (carousel, X set): "player — Name" ↔ "player:Name". */
const withSets = (c) => applySets(c, `${c.variant}:${c.label.split(" — ")[1] ?? ""}`);

function applySets(card, selector) {
  const mine = sets.filter((s) => s.sel.toLowerCase() === selector.toLowerCase());
  if (!mine.length) return card;
  const u = new URL(card.url);
  for (const s of mine) for (const [k, v] of Object.entries(s.fields)) u.searchParams.set(k, v);
  return { ...card, url: u.toString(), label: `${card.label} (re-cut)` };
}

/** "custom:stat|value=18|label=…" → a card built from the article's common params. */
function custom(selector) {
  const [head, ...pairs] = selector.split("|");
  const variant = head.split(":")[1]?.trim();
  const base = cards[0];
  if (!variant || !base) return null;
  const u = new URL(base.url);
  for (const k of [...u.searchParams.keys()]) if (!["format", "category", "title", "cta", "cover"].includes(k)) u.searchParams.delete(k);
  u.searchParams.set("variant", variant);
  for (const p of pairs) u.searchParams.set(p.slice(0, p.indexOf("=")).trim(), p.slice(p.indexOf("=") + 1).trim());
  return { variant, label: `${variant} — ${u.searchParams.get("value") || u.searchParams.get("name") || "custom"}`, url: u.toString() };
}

/** "player:Marco Palestra" → the matching card; "stat:0" → the first stat card. */
function pick(selector) {
  if (selector.startsWith("custom:")) return custom(selector);
  const c = pickRaw(selector);
  if (!c) return null;
  const bySelector = applySets(c, selector);
  return bySelector !== c ? bySelector : withSets(c);
}

const listArg = (name) => {
  const v = flag(name, "");
  if (!v) return null;
  return v.split(v.includes("|") || v.includes(";") ? ";" : ",").map((x) => x.trim()).filter(Boolean);
};

async function exportSet(dirName, selectorsList, format) {
  const dir = path.join(outDir, dirName);
  fs.mkdirSync(dir, { recursive: true });
  let n = 0;
  for (const sel of selectorsList) {
    const c = pick(sel);
    if (!c) {
      console.log(`  ${dirName}  no card for "${sel}"`);
      continue;
    }
    n++;
    await fetchCard(withFormat(c.url, format), path.join(dir, `${String(n).padStart(2, "0")}-${safe(c.label)}.png`));
  }
  console.log(`  ${dirName}  ${n} cards (${format})`);
}

function pickRaw(selector) {
  const [variant, arg] = selector.split(":").map((s) => s?.trim());
  const pool = cards.filter((c) => c.variant === variant);
  if (!pool.length) return null;
  if (arg === undefined || arg === "") return pool[0];
  if (/^\d+$/.test(arg)) return pool[Number(arg)] ?? null;
  return pool.find((c) => c.label.toLowerCase().includes(arg.toLowerCase())) ?? null;
}

// Default reel: hook → the number → the card against the football → the line that lands.
const feature = flag("--feature", "");
const subject = feature || m.contrasts[0]?.left || row.player_name || m.reads[0]?.name || "";
const defaultReel = [
  row.cover_image ? "headline" : "stat:0",
  row.cover_image ? "stat:0" : "stat:1",
  subject ? `player:${subject}` : "player:0",
  "contrast",
  "verdict",
];
// Selectors are separated by ";" when any of them carries "|" fields (custom cards contain commas).
const reelArg = flag("--reel", "") || defaultReel.join(",");
const selectors = reelArg.split(reelArg.includes("|") || reelArg.includes(";") ? ";" : ",").map((s) => s.trim()).filter(Boolean);
const reelCards = [];
for (const sel of selectors) {
  const c = pick(sel);
  if (c && !reelCards.includes(c)) reelCards.push(c);
}
if (reelCards.length < 2) {
  console.error(`Not enough cards for a reel (found ${reelCards.length}). Cards available: ${cards.map((c) => c.label).join(" | ")}`);
  process.exit(1);
}

// Seconds on screen, by how much there is to read.
const HOLD = { headline: 2.8, stat: 3.0, player: 4.2, contrast: 4.5, verdict: 4.0, list: 4.0 };

const reelDir = path.join(outDir, "reel");
fs.mkdirSync(reelDir, { recursive: true });
const clips = [];
for (const [i, c] of reelCards.entries()) {
  const file = path.join(reelDir, `${String(i + 1).padStart(2, "0")}-${safe(c.label)}.png`);
  await fetchCard(withFormat(c.url, "story"), file);
  clips.push({ image: file, duration: HOLD[c.variant] ?? 3.2, zoomFrom: 1.0, zoomTo: 1.045 });
  console.log(`  reel  ${path.basename(file)}`);
}
const spec = { width: 1080, height: 1920, fps: 30, crossfade: 0.45, out: path.join(outDir, "reel.mp4"), clips };
const specFile = path.join(reelDir, "spec.json");
fs.writeFileSync(specFile, JSON.stringify(spec, null, 2));

const bin = path.join(ROOT, "node_modules", ".cache", "scout-reel");
const src = path.join(ROOT, "scripts", "video", "reel.swift");
if (!fs.existsSync(bin) || fs.statSync(bin).mtimeMs < fs.statSync(src).mtimeMs) {
  console.log("  compiling scripts/video/reel.swift (first run takes about a minute)…");
  fs.mkdirSync(path.dirname(bin), { recursive: true });
  execFileSync("swiftc", ["-O", src, "-o", bin], { stdio: "inherit" });
}
console.log("  " + execFileSync(bin, [specFile]).toString().trim());

if (listArg("--carousel")) await exportSet("carousel", listArg("--carousel").slice(0, 10), "square");
if (listArg("--story")) await exportSet("story", listArg("--story"), "story");
if (listArg("--x")) await exportSet("x", listArg("--x"), "x");

if (carousel && !listArg("--carousel")) {
  // Instagram carousel (§6.4), ten slides at most: headline → the featured player → the other
  // players in article order → the full list last, so every name is in the post.
  const players = cards.filter((c) => c.variant === "player");
  const featured = players.filter((c) => subject && c.label.toLowerCase().includes(subject.toLowerCase()));
  const head = cards.filter((c) => c.variant === "headline");
  const list = cards.filter((c) => c.variant === "list");
  const room = 10 - head.length - list.length;
  const order = [...head, ...[...featured, ...players.filter((c) => !featured.includes(c))].slice(0, room), ...list].map(withSets);
  const cDir = path.join(outDir, "carousel");
  fs.mkdirSync(cDir, { recursive: true });
  for (const [i, c] of order.slice(0, 10).entries()) {
    const file = path.join(cDir, `${String(i + 1).padStart(2, "0")}-${safe(c.label)}.png`);
    await fetchCard(withFormat(c.url, "square"), file);
  }
  console.log(`  carousel  ${Math.min(order.length, 10)} slides (Instagram allows 10)`);

if (!listArg("--x")) {
  const xDir = path.join(outDir, "x");
  fs.mkdirSync(xDir, { recursive: true });
  for (const c of cards.filter((c) => ["stat", "contrast", "verdict", "player"].includes(c.variant)).map(withSets)) {
    await fetchCard(withFormat(c.url, "x"), path.join(xDir, `${safe(c.label)}.png`));
  }
  console.log(`  x  ${cards.filter((c) => ["stat", "contrast", "verdict", "player"].includes(c.variant)).length} cards (16:9)`);
  }
}

const pack = buildPlatformPack(row, m, { stage, publishedAt: row.status === "published" ? row.created_at : undefined, today: new Date().toISOString() });
fs.writeFileSync(path.join(outDir, "copy.md"), packToMarkdown(row, pack));
console.log(`\n${path.relative(ROOT, outDir)}/ — reel.mp4, carousel/, x/, copy.md`);
if (row.status !== "published") console.log(`Note: #${row.id} is ${row.status}; the links in copy.md 404 until it is published.`);
