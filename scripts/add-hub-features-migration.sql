-- Hub Faz 2: arena hub_tags, transfer AB votes
-- Supabase SQL Editor'da çalıştırın.

ALTER TABLE arena_games ADD COLUMN IF NOT EXISTS hub_tags text[] DEFAULT '{}';
ALTER TABLE arena_games ADD COLUMN IF NOT EXISTS team_slug text;

CREATE INDEX IF NOT EXISTS idx_arena_games_hub_tags ON arena_games USING GIN (hub_tags);

CREATE TABLE IF NOT EXISTS transfer_ab_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id text NOT NULL,
  choice text NOT NULL CHECK (choice IN ('a', 'b')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transfer_ab_votes_poll ON transfer_ab_votes (poll_id);

ALTER TABLE transfer_ab_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can vote transfer ab" ON transfer_ab_votes;
CREATE POLICY "Anyone can vote transfer ab" ON transfer_ab_votes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read transfer ab" ON transfer_ab_votes;
CREATE POLICY "Anyone can read transfer ab" ON transfer_ab_votes FOR SELECT USING (true);

-- Örnek WC 2026 arena (bracket — admin'den özelleştirin)
INSERT INTO arena_games (
  slug, status, title_tr, title_en, description_tr, description_en,
  hero_title_tr, hero_title_en, hero_teaser_tr, hero_teaser_en,
  card_color, game_type, hub_tags, participants
) VALUES (
  'dk-2026-sampiyonu',
  'published',
  'DK 2026 Şampiyonu Kim?',
  'Who Wins World Cup 2026?',
  '48 takım arasından kupayı kime veriyorsun? Her turda seç, şampiyonunu ilan et.',
  'Pick the winner from 48 nations. Bracket your way to a champion.',
  'Dünya Kupası 2026 Şampiyonu',
  'World Cup 2026 Champion',
  'Tek kupa, senin bracket''in.',
  'One trophy. Your bracket.',
  'amber',
  'random_16',
  ARRAY['wc-2026'],
  '[
    {"name":"Brezilya","subtitle":"CONMEBOL"},
    {"name":"Arjantin","subtitle":"CONMEBOL"},
    {"name":"Fransa","subtitle":"UEFA"},
    {"name":"İngiltere","subtitle":"UEFA"},
    {"name":"Almanya","subtitle":"UEFA"},
    {"name":"İspanya","subtitle":"UEFA"},
    {"name":"ABD","subtitle":"CONCACAF"},
    {"name":"Meksika","subtitle":"CONCACAF"},
    {"name":"Kanada","subtitle":"CONCACAF"},
    {"name":"Portekiz","subtitle":"UEFA"},
    {"name":"Hollanda","subtitle":"UEFA"},
    {"name":"Belçika","subtitle":"UEFA"},
    {"name":"Türkiye","subtitle":"UEFA"},
    {"name":"Fas","subtitle":"CAF"},
    {"name":"Japonya","subtitle":"AFC"},
    {"name":"Uruguay","subtitle":"CONMEBOL"}
  ]'::jsonb
) ON CONFLICT (slug) DO UPDATE SET hub_tags = EXCLUDED.hub_tags, status = 'published';
