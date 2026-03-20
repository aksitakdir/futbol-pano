-- İçerik detayında başlık altında TM/Google arama linkleri için opsiyonel odak oyuncu adı
ALTER TABLE contents ADD COLUMN IF NOT EXISTS player_name text;

COMMENT ON COLUMN contents.player_name IS 'Makale odak oyuncusu; ArticleLayout başlık altında arama linkleri için.';
