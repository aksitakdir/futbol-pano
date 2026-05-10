-- V2 Migration: Add hero_variant, accent, sections_json, view_count columns
-- Run this in Supabase SQL Editor

ALTER TABLE contents ADD COLUMN IF NOT EXISTS hero_variant TEXT DEFAULT 'text-only';
ALTER TABLE contents ADD COLUMN IF NOT EXISTS accent TEXT DEFAULT 'emerald';
ALTER TABLE contents ADD COLUMN IF NOT EXISTS sections_json JSONB;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_contents_view_count ON contents(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_contents_category_status ON contents(category, status);

-- Update existing radar articles to player-cards hero_variant if they have a player_name
UPDATE contents SET hero_variant = 'player-cards' WHERE category = 'radar' AND player_name IS NOT NULL AND hero_variant = 'text-only';

-- Update taktik-lab articles to pitch-diagram hero_variant
UPDATE contents SET hero_variant = 'pitch-diagram' WHERE category = 'taktik-lab' AND hero_variant = 'text-only';

-- Update listeler articles with player lists to player-cards
UPDATE contents SET hero_variant = 'player-cards' WHERE category = 'listeler' AND players_json IS NOT NULL AND hero_variant = 'text-only';

-- Function to increment view_count safely
CREATE OR REPLACE FUNCTION increment_view_count(content_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE contents SET view_count = COALESCE(view_count, 0) + 1
  WHERE slug = content_slug AND status = 'yayinda';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
