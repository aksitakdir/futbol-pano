-- fc_players: record which game each row came from, and when it was loaded.
-- Until 2026-09-30 the table had neither, so nothing could tell that the FC 26
-- snapshot had gone a season stale. Run in the Supabase SQL editor. Idempotent.

ALTER TABLE fc_players ADD COLUMN IF NOT EXISTS dataset_version text;
ALTER TABLE fc_players ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- The rows loaded on 2026-09-30 by scripts/import-fc-players.mjs
UPDATE fc_players SET dataset_version = 'fc27-ea-2026-09-30' WHERE dataset_version IS NULL;
UPDATE fc_players SET created_at = '2026-09-30T00:00:00Z' WHERE created_at IS NULL;

-- Verify: one row, 17849
-- SELECT dataset_version, count(*) FROM fc_players GROUP BY dataset_version;
