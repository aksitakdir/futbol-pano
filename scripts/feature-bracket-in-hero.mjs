#!/usr/bin/env node
/**
 * Adds (or refreshes) a custom hero slide that features the World Cup 2026
 * knockout bracket on the homepage hero. Idempotent: replaces any prior slide
 * with the same href. Preserves existing custom slides.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const KEY = "hero_custom_slides";
const HREF = "/arena/world-cup-2026-knockout-bracket";

const slide = {
  id: "wc-knockout-bracket",
  eyebrow: "ARENA · WORLD CUP 2026",
  title: "Predict the Knockout Bracket",
  teaser: "32 teams, the real Round of 32 draw — call every winner on the road to the final.",
  href: HREF,
  accentColor: "#fbbf24",
  enabled: true,
};

const { data } = await sb.from("site_settings").select("value").eq("key", KEY).maybeSingle();
let existing = data?.value ?? [];
if (typeof existing === "string") { try { existing = JSON.parse(existing); } catch { existing = []; } }
if (!Array.isArray(existing)) existing = [];

// Drop any prior version of this slide, then prepend the fresh one.
const others = existing.filter((s) => s && s.href !== HREF && s.id !== slide.id);
const next = [slide, ...others];

const { error } = await sb.from("site_settings").upsert(
  { key: KEY, value: next, updated_at: new Date().toISOString() },
  { onConflict: "key" },
);
if (error) { console.error("Failed:", error.message); process.exit(1); }
console.log(JSON.stringify({ ok: true, key: KEY, totalCustomSlides: next.length, featured: slide.title, href: HREF }, null, 2));
