-- Hub kampanyaları: DK 2026, Transfer (Faz 1)
-- Supabase SQL Editor'da çalıştırın.

ALTER TABLE contents ADD COLUMN IF NOT EXISTS hub_tags text[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_contents_hub_tags ON contents USING GIN (hub_tags);

COMMENT ON COLUMN contents.hub_tags IS 'Kampanya hub etiketleri: wc-2026, transfer';
