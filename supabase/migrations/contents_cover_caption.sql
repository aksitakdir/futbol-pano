-- Cover caption: a short line shown under an article's cover image.
-- Added 2026-11-16 for the AI-image label ("Illustration: AI-generated") that
-- covers showing a real player need (docs/CONTENT-STRATEGY-V2.md §5.3, rule 6).
-- Nullable; empty means no caption. The site and the admin work without it,
-- so this can be run at any time.
alter table public.contents add column if not exists cover_caption text;
