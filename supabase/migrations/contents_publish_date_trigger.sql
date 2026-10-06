-- contents: the day an article goes live is its date.
--
-- The site dates and orders every article by created_at (home page, category
-- lists, sitemap lastmod, datePublished in the JSON-LD). Articles are now written
-- in batches and published days later, so a piece written on 20 September and
-- published on 6 October showed as "September", sat below older pieces on the home
-- page and told Google it was two weeks old. Found 2026-10-06 on #153 and #155.
--
-- This trigger moves created_at to the moment the status first becomes
-- 'published', whichever path publishes it (admin panel, scout-publish.mjs, SQL).
-- Saving an already-published article does not touch the date.
-- Run in the Supabase SQL editor. Idempotent.

CREATE OR REPLACE FUNCTION contents_stamp_publish_date()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'published'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'published') THEN
    NEW.created_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS contents_stamp_publish_date ON contents;
CREATE TRIGGER contents_stamp_publish_date
  BEFORE INSERT OR UPDATE OF status ON contents
  FOR EACH ROW
  EXECUTE FUNCTION contents_stamp_publish_date();

-- Verify (should list the trigger):
-- SELECT tgname FROM pg_trigger WHERE tgrelid = 'contents'::regclass AND NOT tgisinternal;
