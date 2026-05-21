-- Remove demo seed rows from Confirmed Deals (optional, run once in Supabase SQL Editor)
UPDATE hub_completed_transfers
SET is_published = false
WHERE source = 'seed';
