-- ============================================================
-- Arena Games Table Setup + Seed Data
-- Run this in your Supabase SQL editor
-- ============================================================

CREATE TABLE IF NOT EXISTS arena_games (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text        UNIQUE NOT NULL,
  status         text        NOT NULL DEFAULT 'draft',   -- 'published' | 'draft'
  title_tr       text        NOT NULL DEFAULT '',
  title_en       text        NOT NULL DEFAULT '',
  description_tr text        NOT NULL DEFAULT '',
  description_en text        NOT NULL DEFAULT '',
  hero_title_tr  text        NOT NULL DEFAULT '',
  hero_title_en  text        NOT NULL DEFAULT '',
  hero_teaser_tr text        NOT NULL DEFAULT '',
  hero_teaser_en text        NOT NULL DEFAULT '',
  card_color     text        NOT NULL DEFAULT 'primary',  -- 'primary'|'secondary'|'tertiary'|'amber'|'rose'
  participants   jsonb       NOT NULL DEFAULT '[]',
  game_type      text        NOT NULL DEFAULT 'random_16', -- 'random_16' | 'fixed_8'
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE arena_games ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Anyone can read published arena games" ON arena_games;
DROP POLICY IF EXISTS "Authenticated can manage arena games" ON arena_games;

-- Public: read published games
CREATE POLICY "Anyone can read published arena games"
ON arena_games FOR SELECT
USING (status = 'published');

-- Allow anon to also read draft (for admin panel which uses anon key)
-- If you use service role in admin, remove this and restrict to service role only
CREATE POLICY "Anon full access for admin"
ON arena_games FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================
-- SEED DATA — 5 existing arena games
-- ============================================================

INSERT INTO arena_games (slug, status, title_tr, title_en, description_tr, description_en,
  hero_title_tr, hero_title_en, hero_teaser_tr, hero_teaser_en, card_color, game_type, participants)
VALUES

-- 1. Gelecek Yıldızlar (random_16)
(
  'gelecek-yildizlar', 'published',
  'Gelecek Yıldızlar', 'Future Stars',
  '16 genç yetenek; her açılışta rastgele eşleşmeler. Yamal''dan Mainoo''ya sen kimin şampiyon olacağını seç.',
  '16 young talents; random matchups every time. From Yamal to Mainoo — you pick who becomes champion.',
  'Gelecek Yıldızlar Turnuvası', 'Future Stars Tournament',
  '16 isim, tek şampiyon. Sen seç.', '16 names, one champion. You decide.',
  'amber', 'random_16',
  '[
    {"name": "L. Yamal",      "subtitle": "Barcelona"},
    {"name": "Arda Güler",    "subtitle": "Real Madrid"},
    {"name": "P. Foden",      "subtitle": "Man City"},
    {"name": "J. Bellingham", "subtitle": "Real Madrid"},
    {"name": "Pedri",         "subtitle": "Barcelona"},
    {"name": "Gavi",          "subtitle": "Barcelona"},
    {"name": "F. Luis",       "subtitle": "Chelsea"},
    {"name": "K. Mainoo",     "subtitle": "Man United"},
    {"name": "F. Camarda",    "subtitle": "AC Milan"},
    {"name": "M. Guiu",       "subtitle": "Chelsea"},
    {"name": "E. Nwaneri",    "subtitle": "Arsenal"},
    {"name": "Endrick",       "subtitle": "Real Madrid"},
    {"name": "R. Cherki",     "subtitle": "Bayer Leverkusen"},
    {"name": "L. Camara",     "subtitle": "Monaco"},
    {"name": "A. Jallow",     "subtitle": "Benfica"},
    {"name": "Y. Bisseck",    "subtitle": "Inter Milan"}
  ]'::jsonb
),

-- 2. Şampiyonlar Ligi 25-26 (fixed_8)
(
  'sampiyonlar-ligi', 'published',
  'Şampiyonlar Ligi 25-26', 'Champions League 25–26',
  '25-26 sezonu son 16 eşleşmeleriyle sabit bracket — kupayı hangi takıma veriyorsun?',
  'Fixed bracket with the 25–26 season round of 16 — which club lifts the trophy?',
  'Şampiyonlar Ligi 25-26', 'Champions League 25–26',
  'Kupayı kime veriyorsun?', 'Who lifts the trophy?',
  'primary', 'fixed_8',
  '[
    {"name": "Manchester City", "vs": "Real Madrid"},
    {"name": "Arsenal",         "vs": "Barcelona"},
    {"name": "Bayern Münih",    "vs": "PSG"},
    {"name": "Atletico Madrid", "vs": "Inter Milan"},
    {"name": "Liverpool",       "vs": "Juventus"},
    {"name": "Chelsea",         "vs": "Borussia Dortmund"},
    {"name": "Porto",           "vs": "Ajax"},
    {"name": "Benfica",         "vs": "AC Milan"}
  ]'::jsonb
),

-- 3. Teknik Direktör Arenası (random_16)
(
  'teknik-direktor', 'published',
  'Teknik Direktör Arenası', 'Manager Arena',
  'Guardiola''dan Mourinho''ya 16 teknik direktör; her seferinde rastgele çiftler.',
  '16 managers from Guardiola to Mourinho; random pairings every run.',
  'Teknik Direktör Arenası', 'Manager Arena',
  'Tarihin en iyi teknik direktörü kim?', 'Who is the greatest manager of all time?',
  'secondary', 'random_16',
  '[
    {"name": "P. Guardiola",  "subtitle": "Man City"},
    {"name": "J. Mourinho",   "subtitle": "Fenerbahçe"},
    {"name": "C. Ancelotti",  "subtitle": "Real Madrid"},
    {"name": "J. Klopp",      "subtitle": "Dortmund"},
    {"name": "Z. Zidane",     "subtitle": "Real Madrid"},
    {"name": "A. Ferguson",   "subtitle": "Man United"},
    {"name": "A. Wenger",     "subtitle": "Arsenal"},
    {"name": "D. Capello",    "subtitle": "Roma"},
    {"name": "M. Bielsa",     "subtitle": "Leeds"},
    {"name": "T. Tuchel",     "subtitle": "Bayern"},
    {"name": "M. Pochettino", "subtitle": "Tottenham"},
    {"name": "D. Simeone",    "subtitle": "Atletico"},
    {"name": "J. Nagelsmann", "subtitle": "Bayern"},
    {"name": "M. Arteta",     "subtitle": "Arsenal"},
    {"name": "E. ten Hag",    "subtitle": "Man United"},
    {"name": "F. Mourinho",   "subtitle": "Roma"}
  ]'::jsonb
),

-- 4. Süper Lig Efsaneleri (random_16)
(
  'super-lig-efsaneleri', 'published',
  'Süper Lig Efsaneleri', 'Süper Lig Legends',
  'Emre''den Terim''e 16 efsane; her yüklemede yeni eşleşmelerle tek taç.',
  '16 legends from Emre to Terim; fresh matchups each load, one crown.',
  'Süper Lig Efsaneleri', 'Süper Lig Legends',
  'Efsaneler arasında kim kazanır?', 'Who reigns among the legends?',
  'tertiary', 'random_16',
  '[
    {"name": "Emre Belözoğlu",  "subtitle": "Fenerbahçe"},
    {"name": "Hakan Şükür",     "subtitle": "Galatasaray"},
    {"name": "Rüştü Reçber",    "subtitle": "Fenerbahçe"},
    {"name": "Nihat Kahveci",   "subtitle": "Fenerbahçe"},
    {"name": "Tuncay Şanlı",    "subtitle": "Trabzonspor"},
    {"name": "Uğur Boral",      "subtitle": "Fenerbahçe"},
    {"name": "Hasan Şaş",       "subtitle": "Trabzonspor"},
    {"name": "Necati Ateş",     "subtitle": "Galatasaray"},
    {"name": "Ahmet Ercan",     "subtitle": "Trabzonspor"},
    {"name": "Hami Mandıralı",  "subtitle": "Trabzonspor"},
    {"name": "Bülent Korkmaz",  "subtitle": "Galatasaray"},
    {"name": "Arif Erdem",      "subtitle": "Galatasaray"},
    {"name": "Fatih Terim",     "subtitle": "Galatasaray"},
    {"name": "Metin Oktay",     "subtitle": "Galatasaray"},
    {"name": "Can Bartu",       "subtitle": "Fenerbahçe"},
    {"name": "Lefter Küçükandonyadis", "subtitle": "Fenerbahçe"}
  ]'::jsonb
),

-- 5. Türkiye'de En İyi Yabancılar (random_16)
(
  'turkiyede-en-iyi-yabancilar', 'published',
  'Türkiye''de Oynamış En İyi Yabancılar', 'Best Foreign Players in Turkey',
  'Drogba''dan Sneijder''a unutulmaz isimler; rastgele bracket ile favorini seç.',
  'Unforgettable names from Drogba to Sneijder; random bracket, pick your favourite.',
  'Türkiye''nin En İyi Yabancıları', 'Best Foreign Players in Turkey',
  'Türkiye''nin en iyi yabancısı kim?', 'Who is the greatest foreign player to grace Turkish football?',
  'rose', 'random_16',
  '[
    {"name": "D. Drogba",      "subtitle": "Galatasaray"},
    {"name": "W. Sneijder",    "subtitle": "Galatasaray"},
    {"name": "Quaresma",       "subtitle": "Beşiktaş"},
    {"name": "N. Anelka",      "subtitle": "Fenerbahçe"},
    {"name": "R. Babel",       "subtitle": "Beşiktaş"},
    {"name": "L. Podolski",    "subtitle": "Galatasaray"},
    {"name": "A. Ivanovic",    "subtitle": "Beşiktaş"},
    {"name": "S. Muntari",     "subtitle": "Fenerbahçe"},
    {"name": "H. Kewell",      "subtitle": "Galatasaray"},
    {"name": "T. Aurelio",     "subtitle": "Fenerbahçe"},
    {"name": "Alex de Souza",  "subtitle": "Fenerbahçe"},
    {"name": "P. Bosvelt",     "subtitle": "Galatasaray"},
    {"name": "A. Shevchenko",  "subtitle": "Dynamo Kiev"},
    {"name": "Jardel",         "subtitle": "Galatasaray"},
    {"name": "Nonda",          "subtitle": "Trabzonspor"},
    {"name": "Pancu",          "subtitle": "Beşiktaş"}
  ]'::jsonb
)

ON CONFLICT (slug) DO UPDATE SET
  status         = EXCLUDED.status,
  title_tr       = EXCLUDED.title_tr,
  title_en       = EXCLUDED.title_en,
  description_tr = EXCLUDED.description_tr,
  description_en = EXCLUDED.description_en,
  hero_title_tr  = EXCLUDED.hero_title_tr,
  hero_title_en  = EXCLUDED.hero_title_en,
  hero_teaser_tr = EXCLUDED.hero_teaser_tr,
  hero_teaser_en = EXCLUDED.hero_teaser_en,
  card_color     = EXCLUDED.card_color,
  game_type      = EXCLUDED.game_type,
  participants   = EXCLUDED.participants;
