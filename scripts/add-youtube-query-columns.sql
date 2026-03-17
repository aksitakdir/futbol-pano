-- Run this in Supabase SQL Editor to add YouTube search query columns to contents table.
ALTER TABLE contents ADD COLUMN IF NOT EXISTS youtube_query_1 text default '';
ALTER TABLE contents ADD COLUMN IF NOT EXISTS youtube_query_2 text default '';

-- Add news search keyword column.
ALTER TABLE contents ADD COLUMN IF NOT EXISTS news_query text default '';
