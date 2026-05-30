-- ============================================================
-- RLS AUDIT — run this in the Supabase SQL editor and share the output.
-- Read-only: it changes nothing. It reports which tables have RLS
-- enabled and lists every policy, so we can write a precise lockdown
-- (revoke anon writes, keep anon reads) without breaking the live site.
-- ============================================================

-- 1) Is RLS enabled on each admin-managed table?
SELECT
  c.relname              AS table_name,
  c.relrowsecurity       AS rls_enabled,
  c.relforcerowsecurity  AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
    'arena_games',
    'arena_votes',
    'contents',
    'site_settings',
    'static_contents',
    'hub_completed_transfers',
    'hub_transfer_scenarios',
    'wc_squad_players',
    'transfer_ab_votes',
    'fc_players'
  )
ORDER BY c.relname;

-- 2) Every policy on those tables: command, roles, USING / WITH CHECK.
SELECT
  tablename,
  policyname,
  cmd            AS command,      -- SELECT / INSERT / UPDATE / DELETE / ALL
  roles,                          -- which DB roles it applies to
  qual           AS using_expr,   -- USING (...)
  with_check     AS check_expr    -- WITH CHECK (...)
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'arena_games',
    'arena_votes',
    'contents',
    'site_settings',
    'static_contents',
    'hub_completed_transfers',
    'hub_transfer_scenarios',
    'wc_squad_players',
    'transfer_ab_votes',
    'fc_players'
  )
ORDER BY tablename, cmd, policyname;
