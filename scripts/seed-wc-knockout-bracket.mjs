#!/usr/bin/env node
/**
 * Seeds the "World Cup 2026 — Round of 32" Arena bracket (game_type fixed_32).
 * Participants are listed in real-pairing order so round 1 is the exact R32
 * bracket. Each carries a flag (flagcdn) and a qualifier subtitle. Re-runnable:
 * upserts on slug.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const flag = (iso2) => `https://flagcdn.com/w160/${iso2}.png`;
const T = (name, iso2, subtitle) => ({ name, subtitle, photo_url: flag(iso2) });

// The 16 real Round-of-32 matchups, ordered down the real bracket tree so that
// adjacent winners advance into the exact official R16/QF/SF/Final pairings
// (W74-W77, W73-W75, …). Each row below is one fixture: home then away.
const participants = [
  T("Germany", "de", "1st · Group E"),         T("Paraguay", "py", "3rd · Group D"),     // M74
  T("France", "fr", "1st · Group I"),          T("Sweden", "se", "3rd · Group F"),       // M77
  T("South Africa", "za", "2nd · Group A"),    T("Canada", "ca", "2nd · Group B"),       // M73
  T("Netherlands", "nl", "1st · Group F"),     T("Morocco", "ma", "2nd · Group C"),      // M75
  T("Portugal", "pt", "2nd · Group K"),        T("Croatia", "hr", "2nd · Group L"),      // M83
  T("Spain", "es", "1st · Group H"),           T("Austria", "at", "2nd · Group J"),      // M84
  T("USA", "us", "1st · Group D"),             T("Bosnia & Herzegovina", "ba", "3rd · Group B"), // M81
  T("Belgium", "be", "1st · Group G"),         T("Senegal", "sn", "3rd · Group I"),      // M82
  T("Brazil", "br", "1st · Group C"),          T("Japan", "jp", "2nd · Group F"),        // M76
  T("Ivory Coast", "ci", "2nd · Group E"),     T("Norway", "no", "2nd · Group I"),       // M78
  T("Mexico", "mx", "1st · Group A"),          T("Ecuador", "ec", "3rd · Group E"),      // M79
  T("England", "gb-eng", "1st · Group L"),     T("DR Congo", "cd", "3rd · Group K"),     // M80
  T("Argentina", "ar", "1st · Group J"),       T("Cape Verde", "cv", "2nd · Group H"),   // M86
  T("Australia", "au", "2nd · Group D"),       T("Egypt", "eg", "2nd · Group G"),        // M88
  T("Switzerland", "ch", "1st · Group B"),     T("Algeria", "dz", "3rd · Group J"),      // M85
  T("Colombia", "co", "1st · Group K"),        T("Ghana", "gh", "3rd · Group L"),        // M87
];

const enText = {
  title: "World Cup 2026 — Round of 32",
  description: "Predict the entire World Cup 2026 knockout bracket. Start from the real Round of 32 matchups and pick your winners all the way to the final.",
  heroTitle: "Predict the Knockout Bracket",
  heroTeaser: "32 teams, the real draw — call every upset on the road to the final.",
};

const row = {
  slug: "world-cup-2026-knockout-bracket",
  status: "published",
  title_en: enText.title,
  title_tr: enText.title,
  description_en: enText.description,
  description_tr: enText.description,
  hero_title_en: enText.heroTitle,
  hero_title_tr: enText.heroTitle,
  hero_teaser_en: enText.heroTeaser,
  hero_teaser_tr: enText.heroTeaser,
  card_color: "amber",
  participants,
  game_type: "fixed_32",
  hub_tags: ["wc-2026"],
};

const { data, error } = await sb
  .from("arena_games")
  .upsert(row, { onConflict: "slug" })
  .select("id, slug, game_type")
  .single();

if (error) { console.error("Insert failed:", error.message); process.exit(1); }
console.log(JSON.stringify({ ok: true, id: data.id, slug: data.slug, game_type: data.game_type, teams: participants.length, url: `/arena/${data.slug}` }, null, 2));
