-- contents.content_updated_at: the last time a live article's text really changed.
--
-- WHY: from October 2026 live articles were updated in place: figure refreshes,
-- corrections, result updates (#136 rebuilt for FC 27, #177 with 44 edits before
-- publish, #176's intro). Google was told none of it. created_at is the publish
-- moment (contents_publish_date_trigger.sql), and it fed datePublished, the
-- sitemap <lastmod> and the visible date. No modified date existed anywhere.
-- Found 2026-11-24.
--
-- It is NOT stamped by a trigger, on purpose:
--   * every page view UPDATEs the row (increment_view_count);
--   * an admin Save rewrites every column even when nothing changed;
--   * season-snapshot.mjs, migrate-content and backfill-content-en change
--     sections_json/content_en without changing what readers see.
-- A trigger would bump the date for all of these. Google trusts a site's lastmod
-- all or nothing, so a date that moves without a real change costs the real ones.
-- The writers set it explicitly instead: patch-article-text.mjs --significant,
-- scout-publish.mjs --update <id> --significant, and the admin editor's
-- "Significant update" box.
--
-- The site reads it as: dateModified = content_updated_at when it is later than
-- created_at, otherwise created_at (lib/article-dates.ts). A re-publish moves
-- created_at past an old value, so no clearing is needed here.
--
-- Run in the Supabase SQL editor BEFORE deploying the code that reads it. Idempotent.

ALTER TABLE contents ADD COLUMN IF NOT EXISTS content_updated_at timestamptz;

COMMENT ON COLUMN contents.content_updated_at IS
  'Last substantive change to a live article (text readers see). Set explicitly, never by trigger. See supabase/migrations/contents_content_updated_at.sql.';

-- Verify (should return one row, data_type "timestamp with time zone"):
-- SELECT column_name, data_type FROM information_schema.columns
--  WHERE table_name = 'contents' AND column_name = 'content_updated_at';
