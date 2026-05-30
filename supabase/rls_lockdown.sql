-- ============================================================
-- RLS LOCKDOWN — run this in the Supabase SQL editor.
--
-- Goal: revoke ALL anonymous write access while keeping public reads
-- working. Admin writes already go through the service-role key, which
-- bypasses RLS, so they keep working. Public voting (arena_votes,
-- transfer_ab_votes) is intentionally left untouched.
--
-- Reads stay open (USING true) so the admin panel can still see drafts
-- and the public pages (which filter by published in code) keep working.
-- Tightening reads to published-only is a separate, optional follow-up.
--
-- Idempotent: safe to re-run.
-- ============================================================

-- ---- Tables that currently have RLS DISABLED: enable + public read ----

ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read contents" ON contents;
CREATE POLICY "Public read contents" ON contents FOR SELECT USING (true);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read site_settings" ON site_settings;
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

ALTER TABLE static_contents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read static_contents" ON static_contents;
CREATE POLICY "Public read static_contents" ON static_contents FOR SELECT USING (true);

ALTER TABLE fc_players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read fc_players" ON fc_players;
CREATE POLICY "Public read fc_players" ON fc_players FOR SELECT USING (true);

-- ---- Tables with RLS on but a dangerous "anon can do everything" policy ----
-- Drop the ALL/USING(true) policies; keep (or recreate) a read-only policy.

-- arena_games
DROP POLICY IF EXISTS "Anon full access for admin" ON arena_games;
DROP POLICY IF EXISTS "Anyone can read published arena games" ON arena_games;
DROP POLICY IF EXISTS "Public read arena_games" ON arena_games;
CREATE POLICY "Public read arena_games" ON arena_games FOR SELECT USING (true);

-- hub_completed_transfers
DROP POLICY IF EXISTS "Anon manage completed" ON hub_completed_transfers;
DROP POLICY IF EXISTS "Public read published completed" ON hub_completed_transfers;
DROP POLICY IF EXISTS "Public read hub_completed_transfers" ON hub_completed_transfers;
CREATE POLICY "Public read hub_completed_transfers" ON hub_completed_transfers FOR SELECT USING (true);

-- hub_transfer_scenarios
DROP POLICY IF EXISTS "Anon manage scenarios" ON hub_transfer_scenarios;
DROP POLICY IF EXISTS "Public read published scenarios" ON hub_transfer_scenarios;
DROP POLICY IF EXISTS "Public read hub_transfer_scenarios" ON hub_transfer_scenarios;
CREATE POLICY "Public read hub_transfer_scenarios" ON hub_transfer_scenarios FOR SELECT USING (true);

-- wc_squad_players
DROP POLICY IF EXISTS "Anon manage wc squads" ON wc_squad_players;
DROP POLICY IF EXISTS "Public read wc squads" ON wc_squad_players;
DROP POLICY IF EXISTS "Public read wc_squad_players" ON wc_squad_players;
CREATE POLICY "Public read wc_squad_players" ON wc_squad_players FOR SELECT USING (true);

-- ---- Untouched (already correct) ----
-- arena_votes        : INSERT + SELECT for public  (the interactive vote flow)
-- transfer_ab_votes  : INSERT + SELECT for public  (transfer A/B vote)
-- These keep working: anon can still vote and read leaderboards.
