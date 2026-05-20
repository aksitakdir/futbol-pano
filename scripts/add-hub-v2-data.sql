-- Hub V2: transfer senaryoları, gerçekleşen transferler, sayfa metinleri
-- Supabase SQL Editor'da çalıştırın.

CREATE TABLE IF NOT EXISTS hub_transfer_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_rank int NOT NULL DEFAULT 0,
  player_name text NOT NULL,
  from_club text NOT NULL,
  to_club text NOT NULL,
  likelihood int NOT NULL DEFAULT 50 CHECK (likelihood >= 0 AND likelihood <= 100),
  note_tr text DEFAULT '',
  note_en text DEFAULT '',
  is_published boolean NOT NULL DEFAULT true,
  source text NOT NULL DEFAULT 'manual',
  external_id text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hub_transfer_scenarios_rank ON hub_transfer_scenarios (sort_rank DESC, likelihood DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_hub_transfer_scenarios_external ON hub_transfer_scenarios (external_id) WHERE external_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS hub_completed_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  from_club text NOT NULL,
  to_club text NOT NULL,
  fee_tr text DEFAULT '',
  fee_en text DEFAULT '',
  transfer_date text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  source text NOT NULL DEFAULT 'manual',
  external_id text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hub_completed_transfers_order ON hub_completed_transfers (sort_order DESC, transfer_date DESC);
ALTER TABLE hub_completed_transfers DROP CONSTRAINT IF EXISTS hub_completed_transfers_external_id_key;
ALTER TABLE hub_completed_transfers ADD CONSTRAINT hub_completed_transfers_external_id_key UNIQUE (external_id);

ALTER TABLE hub_transfer_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_completed_transfers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published scenarios" ON hub_transfer_scenarios;
CREATE POLICY "Public read published scenarios" ON hub_transfer_scenarios FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public read published completed" ON hub_completed_transfers;
CREATE POLICY "Public read published completed" ON hub_completed_transfers FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Anon manage scenarios" ON hub_transfer_scenarios;
CREATE POLICY "Anon manage scenarios" ON hub_transfer_scenarios FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon manage completed" ON hub_completed_transfers;
CREATE POLICY "Anon manage completed" ON hub_completed_transfers FOR ALL USING (true) WITH CHECK (true);
