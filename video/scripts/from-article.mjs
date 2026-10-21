/**
 * Turn a published article into the data a video template renders.
 *
 *   node scripts/from-article.mjs <id|slug>      # writes data/<slug>.json
 *
 * Every name and number on screen comes from the article's own blocks (its
 * sections_json, as published and verified), read through lib/social-extract.mjs,
 * the same reader the social cards use. Nothing is typed in by hand here, so a
 * video can never say something the article does not. The template only decides
 * order, timing and look.
 *
 * Pilot (2026-10-20): a "ranked rundown" from an article's ranking table (the Kopa
 * Trophy 2026 nominees by EA FC 27 rating), plus its pull quote and its ballot.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { extract } from "../../lib/social-extract.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }),
);

const key = process.argv[2];
if (!key) { console.error("Usage: node scripts/from-article.mjs <id|slug>"); process.exit(1); }

const FOLDER = { lists: "lists", radar: "radar", "tactics-lab": "tactics-lab", transfer: "transfers", "wc-2026": "world-cup-2026" };
const filter = /^\d+$/.test(key) ? `id=eq.${key}` : `slug=eq.${encodeURIComponent(key)}`;
const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/contents?select=id,slug,title,title_en,category,status,sections_json,cover_image&${filter}`, {
  headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` },
});
const [row] = await res.json();
if (!row) { console.error(`No article ${key}`); process.exit(1); }
if (row.status !== "published") console.warn(`warn  #${row.id} is ${row.status}: the video will point at a page readers cannot open yet`);

const m = extract(row.sections_json ?? []);
const title = (row.title_en || row.title).trim();
const [kicker, subtitle] = title.split(/:\s*/, 2);

// ── the ranking: the article's first table with a player column and an EA FC rating ──
const table = m.tables.find((t) => t.columns.some((c) => /player/i.test(c)) && t.columns.some((c) => /\bFC\s*\d{2}\b/i.test(c)));
if (!table) { console.error("No ranking table (Player + FC xx columns) in this article"); process.exit(1); }
const col = (re) => table.columns.findIndex((c) => re.test(c));
const iName = col(/player/i);
const iClub = col(/club/i);
const iRating = col(/\bFC\s*\d{2}\b/i);
const edition = table.columns[iRating].match(/FC\s*(\d{2})/i)[1];
const detailCols = table.columns.map((c, i) => i).filter((i) => ![iName, iClub, iRating].includes(i));

const rated = table.rows
  .map((r) => ({ name: r[iName], club: iClub >= 0 ? r[iClub] : "", rating: Number(r[iRating]), details: detailCols.map((i) => ({ label: table.columns[i], value: r[i] })) }))
  .filter((r) => r.name && Number.isFinite(r.rating));
// Rank by rating, ties sharing a rank ("=5"), then count down from the bottom.
const sorted = [...rated].sort((a, b) => b.rating - a.rating);
const items = sorted.map((r) => {
  const first = sorted.findIndex((x) => x.rating === r.rating) + 1;
  const tied = sorted.filter((x) => x.rating === r.rating).length > 1;
  return { ...r, rank: `${tied ? "=" : ""}${first}` };
}).reverse();

// ── the turn and the verdict ──
const ballot = m.stats
  .filter((s) => /^\d+$/.test(s.value))
  .map((s) => ({ points: Number(s.value), name: s.label, note: s.note }))
  .sort((a, b) => b.points - a.points);
const when = m.faqs.find((f) => /when/i.test(f.q))?.a ?? "";

const data = {
  slug: row.slug,
  url: `scoutgamer.com/${FOLDER[row.category] ?? "lists"}/${row.slug}`,
  cover: row.cover_image || null,
  kicker: kicker.trim(),
  subtitle: (subtitle || "").trim(),
  edition,
  items,
  quote: m.pullquotes[0] ?? null,
  ballot,
  when,
  source: `${title} — scoutgamer.com, figures as stated in the article`,
};

const out = path.join(HERE, "..", "data", `${row.slug}.json`);
fs.writeFileSync(out, JSON.stringify(data, null, 2) + "\n");
console.log(`wrote data/${row.slug}.json — ${items.length} ranked, ${ballot.length} ballot lines, quote: ${data.quote ? "yes" : "no"}`);
