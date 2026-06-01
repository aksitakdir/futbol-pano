-- ============================================================
-- Arena — new tournaments (seed) + remove the outdated CL 25-26 game
-- Run in the Supabase SQL Editor. Idempotent (safe to re-run).
--
-- English-only: the public arena pages render `title_en || title_tr`, so
-- only the *_en fields are populated. The *_tr columns are NOT NULL with a
-- default of '', so they are simply left at their default.
--
-- participants jsonb: random_16 uses {name, subtitle}.
--
-- NOTE: club/nation labels reflect the 2025-26 season and may shift with
-- transfers. Fix anything off from /admin/arena.
-- ============================================================

-- ── 1) Remove the outdated Champions League 25-26 game ───────
-- (Confirm the slug against your live data first; this is the slug from
--  the original arena seed.)
DELETE FROM arena_games WHERE slug = 'sampiyonlar-ligi';

-- ── 2) New tournaments (English-only) ────────────────────────

INSERT INTO arena_games (
  slug, status, title_en, description_en,
  hero_title_en, hero_teaser_en,
  card_color, game_type, participants
) VALUES

-- A. Best Wonderkids 2026 (random_16)
(
  'best-wonderkids-2026', 'published',
  'Best Wonderkids 2026',
  '16 of the brightest under-21 talents in world football; random matchups every run — you pick the future superstar.',
  'Who Is the Best Wonderkid?',
  '16 young talents, one champion.',
  'amber', 'random_16',
  '[
    {"name": "Lamine Yamal",      "subtitle": "Barcelona"},
    {"name": "Estêvão",           "subtitle": "Chelsea"},
    {"name": "Pau Cubarsí",       "subtitle": "Barcelona"},
    {"name": "Arda Güler",        "subtitle": "Real Madrid"},
    {"name": "Kobbie Mainoo",     "subtitle": "Man United"},
    {"name": "Désiré Doué",       "subtitle": "PSG"},
    {"name": "João Neves",        "subtitle": "PSG"},
    {"name": "Warren Zaïre-Emery","subtitle": "PSG"},
    {"name": "Endrick",           "subtitle": "Real Madrid"},
    {"name": "Kenan Yıldız",      "subtitle": "Juventus"},
    {"name": "Nico Williams",     "subtitle": "Athletic Club"},
    {"name": "Florian Wirtz",     "subtitle": "Liverpool"},
    {"name": "Jamal Musiala",     "subtitle": "Bayern München"},
    {"name": "Rodrygo",           "subtitle": "Real Madrid"},
    {"name": "Savinho",           "subtitle": "Man City"},
    {"name": "Alejandro Garnacho","subtitle": "Chelsea"}
  ]'::jsonb
),

-- B. Greatest Footballer of All Time (random_16)
(
  'greatest-footballer-of-all-time', 'published',
  'Greatest Footballer of All Time',
  '16 legends from Pelé to Messi; random pairings every time — crown the greatest of all time.',
  'The Greatest of All Time?',
  'Legends collide. You decide.',
  'primary', 'random_16',
  '[
    {"name": "Lionel Messi",       "subtitle": "Argentina"},
    {"name": "Cristiano Ronaldo",  "subtitle": "Portugal"},
    {"name": "Pelé",               "subtitle": "Brazil"},
    {"name": "Diego Maradona",     "subtitle": "Argentina"},
    {"name": "Johan Cruyff",       "subtitle": "Netherlands"},
    {"name": "Ronaldo Nazário",    "subtitle": "Brazil"},
    {"name": "Zinédine Zidane",    "subtitle": "France"},
    {"name": "Ronaldinho",         "subtitle": "Brazil"},
    {"name": "Franz Beckenbauer",  "subtitle": "Germany"},
    {"name": "Alfredo Di Stéfano", "subtitle": "Argentina/Spain"},
    {"name": "Michel Platini",     "subtitle": "France"},
    {"name": "Marco van Basten",   "subtitle": "Netherlands"},
    {"name": "George Best",        "subtitle": "Northern Ireland"},
    {"name": "Garrincha",          "subtitle": "Brazil"},
    {"name": "Paolo Maldini",      "subtitle": "Italy"},
    {"name": "Xavi Hernández",     "subtitle": "Spain"}
  ]'::jsonb
),

-- C. World Cup 2026 Favorites (random_16)
(
  'world-cup-2026-favorites', 'published',
  'World Cup 2026 Favorites',
  '16 of the strongest contenders for the 2026 World Cup; random matchups — which nation lifts the trophy?',
  'Who Lifts the Trophy?',
  '16 nations, one champion.',
  'secondary', 'random_16',
  '[
    {"name": "France",        "subtitle": "UEFA"},
    {"name": "Argentina",     "subtitle": "CONMEBOL"},
    {"name": "England",       "subtitle": "UEFA"},
    {"name": "Brazil",        "subtitle": "CONMEBOL"},
    {"name": "Spain",         "subtitle": "UEFA"},
    {"name": "Portugal",      "subtitle": "UEFA"},
    {"name": "Germany",       "subtitle": "UEFA"},
    {"name": "Netherlands",   "subtitle": "UEFA"},
    {"name": "Belgium",       "subtitle": "UEFA"},
    {"name": "Italy",         "subtitle": "UEFA"},
    {"name": "Croatia",       "subtitle": "UEFA"},
    {"name": "Uruguay",       "subtitle": "CONMEBOL"},
    {"name": "Morocco",       "subtitle": "CAF"},
    {"name": "USA",           "subtitle": "CONCACAF"},
    {"name": "Mexico",        "subtitle": "CONCACAF"},
    {"name": "Colombia",      "subtitle": "CONMEBOL"}
  ]'::jsonb
)

ON CONFLICT (slug) DO UPDATE SET
  status         = EXCLUDED.status,
  title_en       = EXCLUDED.title_en,
  description_en = EXCLUDED.description_en,
  hero_title_en  = EXCLUDED.hero_title_en,
  hero_teaser_en = EXCLUDED.hero_teaser_en,
  card_color     = EXCLUDED.card_color,
  game_type      = EXCLUDED.game_type,
  participants   = EXCLUDED.participants;
