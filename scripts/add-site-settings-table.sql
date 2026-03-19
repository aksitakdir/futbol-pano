-- Run this in Supabase SQL Editor to create the site_settings table.
CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Seed default settings
INSERT INTO site_settings (key, value) VALUES
  ('featured_player', '{"name": "", "club": ""}'::jsonb),
  ('hero_slider', '{"radar": true, "listeler": true, "taktik-lab": true}'::jsonb),
  ('recent_count', '{"count": 6}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Create the static_contents table for archetype/list card management.
CREATE TABLE IF NOT EXISTS static_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  name text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  slug text NOT NULL DEFAULT '',
  position_tag text DEFAULT '',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
