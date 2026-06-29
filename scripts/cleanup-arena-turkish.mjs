#!/usr/bin/env node
/**
 * Removes the last Turkish remnants from arena_games:
 *  - renames the two Turkish slugs to English
 *  - mirrors the legacy *_tr columns to their English values (site is English-only)
 * Re-runnable. Old slugs are 301'd in next.config.ts.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const SLUG_RENAMES = {
  "gelecek-yildizlar": "future-stars",
  "teknik-direktor": "manager-arena",
};

const { data: games, error } = await sb.from("arena_games").select("*");
if (error) { console.error(error.message); process.exit(1); }

const out = [];
for (const g of games) {
  const patch = {
    // English-only: drop Turkish copy by mirroring the English fields.
    title_tr: g.title_en ?? "",
    description_tr: g.description_en ?? "",
    hero_title_tr: g.hero_title_en ?? "",
    hero_teaser_tr: g.hero_teaser_en ?? "",
  };
  const newSlug = SLUG_RENAMES[g.slug];
  if (newSlug) patch.slug = newSlug;

  const { error: e } = await sb.from("arena_games").update(patch).eq("id", g.id);
  if (e) { console.error("Update failed for", g.slug, ":", e.message); process.exit(1); }
  out.push({ from: g.slug, to: newSlug ?? g.slug, tr_mirrored: true });
}
console.log(JSON.stringify({ ok: true, updated: out }, null, 2));
