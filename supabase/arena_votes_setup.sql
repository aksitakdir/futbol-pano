-- ────────────────────────────────────────────────────────────────────────────
-- arena_votes: şampiyon oylarını tutar
-- Her oyun tamamlanınca kullanıcının seçtiği şampiyon kaydedilir.
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS arena_votes (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  game_slug     text        NOT NULL,
  champion_name text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Fast GROUP BY queries
CREATE INDEX IF NOT EXISTS arena_votes_slug_idx ON arena_votes (game_slug);
CREATE INDEX IF NOT EXISTS arena_votes_slug_name_idx ON arena_votes (game_slug, champion_name);

-- Row Level Security
ALTER TABLE arena_votes ENABLE ROW LEVEL SECURITY;

-- Herkes oy verebilir
CREATE POLICY "Anyone can vote"
  ON arena_votes FOR INSERT
  WITH CHECK (true);

-- Herkes leaderboard için okuyabilir
CREATE POLICY "Anyone can read votes"
  ON arena_votes FOR SELECT
  USING (true);

-- ────────────────────────────────────────────────────────────────────────────
-- Leaderboard RPC: verilen slug için en çok seçilen şampiyonları döner
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_arena_leaderboard(p_slug text, p_limit int DEFAULT 5)
RETURNS TABLE(champion_name text, vote_count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT champion_name, COUNT(*) AS vote_count
  FROM arena_votes
  WHERE game_slug = p_slug
  GROUP BY champion_name
  ORDER BY vote_count DESC
  LIMIT p_limit;
$$;
