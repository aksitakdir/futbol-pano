#!/usr/bin/env node
/**
 * Scout Gamer — social pack generator.
 *
 *   node scripts/social-pack.mjs <slug|id> [<slug|id> ...] [--stage 1|2|3] [--out <file.md>]
 *
 * Why this exists
 * ---------------
 * A social strategy was agreed on 2026-08-01 and nothing was posted for seven
 * weeks. The reason was not the plan and not laziness: it was the blank page.
 * An article goes live, and turning it into a Reddit comment, five X replies and
 * a carousel is a second job that starts from nothing every time — so it gets
 * left for tomorrow, every day.
 *
 * This removes that. It reads the published article and cuts the material the
 * piece already contains into the shapes each platform wants.
 *
 * What it is NOT
 * --------------
 * It does not write. Every fact in the output is lifted verbatim from the
 * article's own blocks — the stat rows, the callouts, the vs comparisons, the
 * closing quote. The only text this script adds is scaffolding (line breaks,
 * a question, a call to read). If a piece has no numbers in it, the pack will
 * be thin and will say so under GAPS, rather than inventing a number to fill
 * the space. That is the same rule the publish gate enforces upstream.
 *
 * The extraction itself lives in lib/social-extract.mjs, shared with the admin
 * panel so the two can never drift.
 *
 * Every draft is a draft. Read it before it leaves the machine.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "fs";
import { extract, buildCards, gapsOf } from "../lib/social-extract.mjs";
import { buildPlatformPack, packToMarkdown, articleUrl } from "../lib/social-copy.mjs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const BASE = "https://www.scoutgamer.com";

// ---- pack builders ------------------------------------------------------

function buildCardSection(cards) {
  const out = ["## 0. Cards — open, screenshot, post\n"];
  if (cards.length === 0) {
    out.push("_This piece has no stat block, vs block, pull quote or player list to draw._");
    out.push("_Style A (cover card) from the admin panel is the only option here._\n");
    return out.join("\n");
  }
  out.push("None of these needs a cover image. Add `&format=square` or `&format=story` for");
  out.push("Instagram. The cover card in the admin panel is unchanged and still there.\n");
  for (const c of cards) out.push(`- **${c.label}**\n  ${c.url}`);
  out.push("");
  return out.join("\n");
}

// ---- main ---------------------------------------------------------------

async function packFor(supabase, key, stage) {
  const isId = /^\d+$/.test(key);
  const { data: row } = await supabase
    .from("contents")
    .select("id,slug,title,category,status,cover_image,player_name,created_at,sections_json")
    .eq(isId ? "id" : "slug", isId ? Number(key) : key)
    .maybeSingle();

  if (!row) return { error: `No article with ${isId ? "id" : "slug"} "${key}".` };

  const url = articleUrl(row);
  const m = extract(row.sections_json);
  const gaps = gapsOf({ ...row, status: "" }, m); // the pack's own checks cover the status
  const pack = buildPlatformPack(row, m, {
    stage,
    publishedAt: row.status === "published" ? row.created_at : undefined,
    today: new Date().toISOString(),
  });

  const head = [
    `# Social pack — ${row.title}`,
    "",
    `${url}`,
    `${row.category} · id ${row.id} · ${row.status}`,
    "",
    "Everything quoted below is lifted from the article. Nothing here was written by the",
    "generator. Read it before it leaves the machine.",
    "",
    "---",
    "",
  ].join("\n");

  const tail =
    gaps.length > 0
      ? ["---", "", "## GAPS", "", ...gaps.map((g) => `- ${g}`), ""].join("\n")
      : ["---", "", "## GAPS", "", "None. Every lane has material.", ""].join("\n");

  return {
    text: [
      head,
      buildCardSection(buildCards(row, m, BASE)),
      "---\n",
      // The same copy the admin panel shows — one builder, lib/social-copy.mjs.
      packToMarkdown(row, pack).replace(/^# .*\n/, ""),
      tail,
    ].join("\n"),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf("--out");
  const outFile = outIdx >= 0 ? args[outIdx + 1] : null;
  const stageIdx = args.indexOf("--stage");
  const stage = stageIdx >= 0 ? Number(args[stageIdx + 1]) || 1 : 1;
  const keys = args.filter(
    (a, i) => !a.startsWith("--") && !(outIdx >= 0 && i === outIdx + 1) && !(stageIdx >= 0 && i === stageIdx + 1),
  );

  if (keys.length === 0) {
    console.error("Usage: node scripts/social-pack.mjs <slug|id> [...] [--out file.md]");
    process.exit(1);
  }

  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const parts = [];
  let failed = false;
  for (const key of keys) {
    const res = await packFor(supabase, key, stage);
    if (res.error) {
      console.error(res.error);
      failed = true;
      continue;
    }
    parts.push(res.text);
  }

  const doc = parts.join("\n\n\\pagebreak\n\n");
  if (outFile) {
    writeFileSync(outFile, doc);
    console.log(`Wrote ${outFile} (${parts.length} pack${parts.length === 1 ? "" : "s"}).`);
  } else {
    console.log(doc);
  }
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
