-- ============================================================
-- Cleanup (record of what was done) — Turkish-slug radar articles +
-- static_contents feature removal.
--
-- The article rows (ids 8, 23, 36, 7, 34) and all static_contents rows
-- were already deleted via a service-role script on 2026-06-03 (backups
-- saved locally under backups/). Their old URLs are 301-redirected to
-- /radar in next.config.ts, and the admin "Static Content" feature was
-- removed from the code.
--
-- The ONLY step left to run manually in the Supabase SQL editor is dropping
-- the now-empty, unreferenced static_contents table:
-- ============================================================

DROP TABLE IF EXISTS static_contents;
