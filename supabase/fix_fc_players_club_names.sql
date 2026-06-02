-- ============================================================
-- Fix EA FC unlicensed club names in fc_players
-- Run in the Supabase SQL editor. Idempotent (safe to re-run).
--
-- EA Sports FC uses placeholder names for a few Serie A clubs whose
-- licenses belong to Konami/others. The imported player dataset carried
-- those placeholders into fc_players, so player cards showed e.g.
-- "Lombardia FC" instead of "Inter". This renames them to the real clubs.
--
-- Only the `club` text is touched. Player count per alias (from the audit)
-- matches a typical squad size, confirming these are the real mappings.
-- ============================================================

UPDATE fc_players SET club = 'Inter'     WHERE club = 'Lombardia FC';     -- 25 players
UPDATE fc_players SET club = 'Lazio'     WHERE club = 'Latium';           -- 27 players
UPDATE fc_players SET club = 'AC Milan'  WHERE club = 'Milano FC';        -- 23 players
UPDATE fc_players SET club = 'Atalanta'  WHERE club = 'Bergamo Calcio';   -- 25 players

-- Verify: should return zero rows after running.
-- SELECT club, count(*) FROM fc_players
-- WHERE club IN ('Lombardia FC','Latium','Milano FC','Bergamo Calcio')
-- GROUP BY club;
