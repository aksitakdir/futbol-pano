-- player_cache: Auto-populated from BSD / API-Football when fc_players misses.
-- Derived ratings approximate EA FC style from real match stats.

CREATE TABLE IF NOT EXISTS player_cache (
  id            serial PRIMARY KEY,
  name          text NOT NULL,
  short_name    text,                     -- "E. Haaland" style
  position      text DEFAULT '',          -- GK, CB, LB, RB, CDM, CM, CAM, LW, RW, ST …
  club          text DEFAULT '',
  league        text DEFAULT '',
  nationality   text DEFAULT '',
  age           smallint,
  market_value  text,                     -- "€180M" style string
  -- Derived ratings (0-99, EA FC style — calculated from real stats)
  overall       smallint NOT NULL DEFAULT 0,
  pace          smallint NOT NULL DEFAULT 0,
  shooting      smallint NOT NULL DEFAULT 0,
  passing       smallint NOT NULL DEFAULT 0,
  dribbling     smallint NOT NULL DEFAULT 0,
  defending     smallint NOT NULL DEFAULT 0,
  physical      smallint NOT NULL DEFAULT 0,
  -- Source metadata
  source        text NOT NULL DEFAULT 'bsd',   -- 'bsd' | 'api-football'
  source_id     integer,                        -- player ID in source API
  -- Real stats (raw, for content enrichment)
  goals         smallint,
  assists       smallint,
  appearances   smallint,
  minutes       integer,
  rating        numeric(3,1),                   -- avg match rating (e.g. 7.2)
  xg            numeric(5,2),                   -- expected goals
  xa            numeric(5,2),                   -- expected assists
  -- Timestamps
  fetched_at    timestamptz NOT NULL DEFAULT now(),
  season        text DEFAULT '2024-25',
  UNIQUE (name, source)
);

CREATE INDEX IF NOT EXISTS idx_player_cache_name ON player_cache USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_player_cache_lookup ON player_cache (lower(name));

ALTER TABLE player_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read player_cache" ON player_cache;
CREATE POLICY "Public read player_cache" ON player_cache FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anon write player_cache" ON player_cache;
CREATE POLICY "Anon write player_cache" ON player_cache FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE player_cache IS 'Auto-populated player card data from BSD/API-Football. Fallback when fc_players (EA FC) has no match.';
