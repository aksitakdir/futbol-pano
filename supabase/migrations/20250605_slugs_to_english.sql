-- Migrate remaining Turkish slugs to English equivalents
-- Run in Supabase SQL Editor
-- Each UPDATE also keeps the old slug noted in a comment for redirect reference

BEGIN;

-- wc-2026
UPDATE contents SET slug = 'adidas-trionda-tech-analysis-2026-world-cup-ball'
  WHERE slug = 'adidas-trionda-teknik-analiz-2026-dunya-kupasi-topu';

UPDATE contents SET slug = '2026-world-cup-48-team-format-analysis'
  WHERE slug = '2026-dunya-kupasi-48-takim-format-analiz';

-- lists
UPDATE contents SET slug = 'brazil-2026-young-players-world-cup'
  WHERE slug = 'brezilya-2026-genc-oyuncular';

UPDATE contents SET slug = 'argentina-under-20-players-2026-world-cup'
  WHERE slug = 'arjantin-20-yas-alti-oyuncular-2026-liste';

UPDATE contents SET slug = 'premier-league-15-young-talents-to-watch'
  WHERE slug = 'premier-lig-goz-actirtan-15-genc-yetenek';

UPDATE contents SET slug = 'bundesliga-top-10-young-talents'
  WHERE slug = 'bundesliga-en-potansiyelii-10-gen-futbolcu';

UPDATE contents SET slug = 'u20-transfer-moves-top-clubs'
  WHERE slug = 'u20-transfer-hareketi-buyuk-kuluplerle';

UPDATE contents SET slug = 'turkey-most-valuable-players-arda-kenan'
  WHERE slug = 'turkiyenin-en-degerli-oyunculari-arda-kenan-yildiz';

UPDATE contents SET slug = 'u21-rising-stars-fast-tracking-youngsters'
  WHERE slug = 'u21-parlayan-yildizlar-hizli-yukselen-gencler';

-- tactics-lab
UPDATE contents SET slug = 'big-six-defensive-failures-premier-league-tactical'
  WHERE slug = 'big-six-savunma-hatasi-premier-league-taktik';

UPDATE contents SET slug = 'pressing-intensity-modern-football-weapon'
  WHERE slug = 'pressing-baskisi-modern-futbolun-silahi';

UPDATE contents SET slug = 'high-pressing-systems-2025-26'
  WHERE slug = 'yuksek-pressing-sistemleri-2025-26';

UPDATE contents SET slug = 'positional-revolutions-modern-football-2025-26'
  WHERE slug = 'modern-futbolda-pozisyon-devrimleri-2025-26';

UPDATE contents SET slug = 'pivot-role-midfield-new-architecture'
  WHERE slug = 'pivot-pozisyonu-orta-sahinin-yeni-mimari';

-- radar
UPDATE contents SET slug = 'transfer-market-big-moves-this-month'
  WHERE slug = 'transfer-pazarinda-buyuk-oyunlar-bu-ay';

UPDATE contents SET slug = 'roma-bologna-2025-26-key-players'
  WHERE slug = 'roma-bologna-2025-26-sezonunun-anahtar-oyunculari';

UPDATE contents SET slug = 'jair-cunha-defensive-colossus-scouting-report'
  WHERE slug = 'Radardabirdefansoyuncusu';

-- Also fix the oddly-cased/Turkish "inverted-winger-kanat-devrim"
UPDATE contents SET slug = 'inverted-winger-revolution'
  WHERE slug = 'inverted-winger-kanat-devrim';

COMMIT;
