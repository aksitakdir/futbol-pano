-- WC 2026 kadroları — admin panelden mevkiye göre yönetim
-- Supabase SQL Editor'da çalıştırın.

CREATE TABLE IF NOT EXISTS wc_squad_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_slug text NOT NULL,
  position_bucket text NOT NULL CHECK (position_bucket IN ('GK', 'DEF', 'MID', 'FWD')),
  position text NOT NULL DEFAULT '',
  player_name text NOT NULL,
  club text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  overall_override smallint CHECK (overall_override IS NULL OR (overall_override >= 1 AND overall_override <= 99)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_slug, player_name)
);

CREATE INDEX IF NOT EXISTS idx_wc_squad_team ON wc_squad_players (team_slug, position_bucket, sort_order);

ALTER TABLE wc_squad_players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read wc squads" ON wc_squad_players;
CREATE POLICY "Public read wc squads" ON wc_squad_players FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anon manage wc squads" ON wc_squad_players;
CREATE POLICY "Anon manage wc squads" ON wc_squad_players FOR ALL USING (true) WITH CHECK (true);
