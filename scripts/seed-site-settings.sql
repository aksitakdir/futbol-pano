-- featured_player_* ve form_players key'lerini site_settings tablosuna ekle.
-- Supabase SQL Editor'da çalıştırın.
-- ON CONFLICT DO NOTHING: mevcut değerlerin üzerine yazmaz.

INSERT INTO site_settings (key, value) VALUES
  ('featured_player_name',        ''),
  ('featured_player_club',        ''),
  ('featured_player_position',    ''),
  ('featured_player_age',         ''),
  ('featured_player_league',      ''),
  ('featured_player_goals',       ''),
  ('featured_player_assists',     ''),
  ('featured_player_description', ''),
  ('featured_player_why_watch',   ''),
  ('form_players',                '[]'),
  ('featured_player_pool',        '[]'),
  ('form_players_pool',           '[]')
ON CONFLICT (key) DO NOTHING;
