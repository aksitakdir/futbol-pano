/**
 * Turn a published article into the data a video template renders.
 *
 *   node scripts/from-article.mjs <id|slug> [--template Rundown|Profile]   # writes data/<slug>.json
 *
 * Every name and number on screen comes from the article's own blocks (its
 * sections_json, as published and verified), read through lib/social-extract.mjs,
 * the same reader the social cards use. Nothing is typed in by hand here, so a
 * video can never say something the article does not. The template only decides
 * order, timing and look.
 *
 * Templates: "Rundown" counts an article's ranking table down to No. 1 (by EA FC
 * rating, or by the jump between two editions), then its pull quote and its ballot;
 * "Profile" walks through an article's stat boxes, its comparison and its pull quote.
 * The template is picked from the article's blocks unless --template says otherwise.
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

const NAME_COL = /^(player|keeper|goalkeeper)$/i;
/** EA FC rating columns: "FC 27", or "OVR" when the caption names the edition. */
const isRatingCol = (c, caption) => /\bFC\s*\d{2}\b/i.test(c) || (/^OVR$/i.test(c) && /\bFC\s*\d{2}\b/i.test(caption));
/** A table with a player column and at least one EA FC rating column. */
function isRanking(tb) {
  return tb.columns.some((c) => NAME_COL.test(c)) && tb.columns.some((c) => isRatingCol(c, tb.caption));
}
/** Goalkeeping facets in EA FC, by column code. */
const FACETS = { DIV: "Diving", HAN: "Handling", KIC: "Kicking", REF: "Reflexes", POS: "Positioning", SPD: "Speed" };
const title = (row.title_en || row.title).trim();
// "Kicker: subtitle" or "Kicker — and subtitle"; the second half starts with a capital either way.
const [kicker, rest] = title.split(/:\s*|\s+—\s+/, 2);
const subtitle = rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : rest;

// "(Figures as of 12 October 2026.)" or "(Club details as of …)" at the end of the lead.
const asOf = (m.lead.match(/\((?:[A-Z][a-z]+ )*(?:figures|details) as of ([^)]+?)\.?\)/i) ?? [])[1] ?? null;
const t = process.argv.indexOf("--template");
const template = t !== -1 ? process.argv[t + 1] : m.tables.some(isRanking) ? "Rundown" : "Profile";
const common = {
  template,
  slug: row.slug,
  url: `scoutgamer.com/${FOLDER[row.category] ?? "lists"}/${row.slug}`,
  cover: row.cover_image || null,
  kicker: kicker.trim(),
  subtitle: (subtitle || "").trim(),
  asOf,
  quote: m.pullquotes[0] ?? null,
  // The eyebrow over the pull quote: an award is judged on a season, anything else has a catch.
  turn: /\b(Kopa|Golden Boy|Ballon d)/i.test(title) ? "BUT THE JURY JUDGES THE SEASON" : "THE READ",
  source: `${title} — scoutgamer.com, figures as stated in the article`,
};



let data;
if (template === "Rundown") {
  // ── a ranking: by EA FC rating, or by the jump between two editions when the table has one ──
  const table = m.tables.find(isRanking);
  if (!table) { console.error("No ranking table (Player + FC xx columns) in this article"); process.exit(1); }
  const col = (re) => table.columns.findIndex((c) => re.test(c));
  const iName = col(NAME_COL);
  const iClub = col(/club/i);
  const fcCols = table.columns.map((c, i) => [c, i]).filter(([c]) => isRatingCol(c, table.caption));
  const iJump = col(/^jump$/i);
  const jumpMode = iJump >= 0 && fcCols.length >= 2;
  const [fromCol, toCol] = jumpMode ? [fcCols[0], fcCols[fcCols.length - 1]] : [null, fcCols[0]];
  const edition = (toCol[0].match(/FC\s*(\d{2})/i) ?? table.caption.match(/FC\s*(\d{2})/i))[1];
  const used = [iName, iClub, toCol[1], fromCol?.[1], iJump].filter((i) => i !== undefined && i >= 0);
  const detailCols = table.columns.map((c, i) => i).filter((i) => !used.includes(i));
  const facetCols = detailCols.filter((i) => FACETS[table.columns[i].toUpperCase()]);
  // A bare "Minutes" column means league minutes this season, as the caption says.
  const label = (c) => (/^minutes$/i.test(c) && /league minutes/i.test(table.caption) ? "League minutes this season" : c);

  const rated = table.rows.map((r) => ({
    name: r[iName],
    club: iClub >= 0 ? r[iClub] : "",
    rating: Number(r[toCol[1]]),
    ...(jumpMode ? { from: Number(r[fromCol[1]]), jump: Number(String(r[iJump]).replace("+", "")) } : {}),
    // Goalkeeper facets: the two strongest, on one line. Anything else: one row per column.
    details: facetCols.length
      ? [{ label: "Best facets", value: [...facetCols].sort((a, b) => Number(r[b]) - Number(r[a])).slice(0, 2).map((i) => `${FACETS[table.columns[i].toUpperCase()]} ${r[i]}`).join(" · ") }]
      : detailCols.map((i) => ({ label: label(table.columns[i]), value: r[i] })),
  })).filter((r) => r.name && Number.isFinite(r.rating));
  // Rank (ties share a rank, "=5"), then count down from the bottom.
  const score = (r) => (jumpMode ? r.jump : r.rating);
  const sorted = [...rated].sort((a, b) => score(b) - score(a));
  const items = sorted.map((r) => {
    const first = sorted.findIndex((x) => score(x) === score(r)) + 1;
    const tied = sorted.filter((x) => score(x) === score(r)).length > 1;
    return { ...r, rank: `${tied ? "=" : ""}${first}` };
  }).reverse();
  // Our own ballot is a 5-3-1 vote (award pieces). Other stat boxes ("413 keepers") are not.
  const points = m.stats.filter((x) => /^\d+$/.test(x.value)).map((x) => Number(x.value)).sort((a, b) => b - a);
  const ballot = points.join(",") === "5,3,1"
    ? m.stats.map((x) => ({ points: Number(x.value), name: x.label, note: x.note })).sort((a, b) => b.points - a.points)
    : [];
  data = {
    ...common,
    edition,
    mode: jumpMode ? "jump" : "rating",
    fromEdition: jumpMode ? fromCol[0].match(/FC\s*(\d{2})/i)[1] : null,
    countLabel: /nominee/i.test(title) ? "NOMINEES" : /goalkeeper|keeper/i.test(title) ? "GOALKEEPERS" : "PLAYERS",
    items,
    ballot,
    when: m.faqs.find((f) => /when/i.test(f.q))?.a ?? "",
  };
} else {
  // ── a profile: the article's stat boxes, its comparison, its pull quote ──
  if (!m.stats.length) { console.error("No stat-highlight block for a Profile video"); process.exit(1); }
  // --drop-stat "<label>" leaves a stat box out of the video (an editorial call, logged
  // in the data file): e.g. one about an under-18 player, or one whose date has passed.
  const drop = process.argv.flatMap((a, i) => (a === "--drop-stat" ? [process.argv[i + 1].toLowerCase()] : []));
  const stats = m.stats.filter((x) => !drop.includes(x.label.toLowerCase()));
  data = { ...common, stats, dropped: m.stats.filter((x) => !stats.includes(x)), contrast: m.contrasts[0] ?? null };
}

const out = path.join(HERE, "..", "data", `${row.slug}.json`);
// Fields set by hand survive a rebuild: faces Vision misses on the cover or on its variations.
if (fs.existsSync(out)) {
  const before = JSON.parse(fs.readFileSync(out, "utf8"));
  for (const k of ["coverFaces", "backdropFaces"]) if (before[k]) data[k] = before[k];
}
fs.writeFileSync(out, JSON.stringify(data, null, 2) + "\n");
console.log(`wrote data/${row.slug}.json — ${template}${data.items ? `, ${data.items.length} ranked (${data.mode})` : `, ${data.stats.length} stats`}, quote: ${data.quote ? "yes" : "no"}, as of: ${data.asOf ?? "—"}`);
