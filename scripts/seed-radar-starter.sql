-- Opsiyonel: Eski demo başlıklarını Supabase'de radar + yayında içerik olarak oluşturur.
-- SQL Editor'da bir kez çalıştırın; slug çakışırsa satırları silin veya slug değiştirin.

INSERT INTO contents (title, slug, category, content, status)
VALUES
(
  'Premier Lig''de Gölgede Kalanlar',
  'premier-lig-golgede-kalanlar',
  'radar',
  'Skor tabelasına düzenli yansımayan ancak xG, koşu kalitesi ve baskı altında bitiricilik metrikleriyle scout ekranlarında öne çıkan genç forvetleri bu yazıda inceliyoruz. İçeriği panelden düzenleyerek güncel tutun.',
  'yayinda'
),
(
  'Süper Lig Mart Raporu',
  'super-lig-mart-raporu',
  'radar',
  'Süper Lig''de form grafiğini yukarı çeken genç oyuncular, pozisyon bazlı istatistikler ve dikkat çeken taktik trendler. Metni yönetim panelinden genişletebilirsiniz.',
  'yayinda'
),
(
  'Transferde İzlenecekler',
  'transferde-izlenecekler',
  'radar',
  'Yaz transfer penceresi öncesinde fiyat/performans oranında öne çıkan genç oyuncu profilleri ve potansiyel hedef kulüpler. Güncel haberler ve söylentiler için içeriği düzenleyin.',
  'yayinda'
),
(
  'U21 Avrupa''nın En İyileri',
  'u21-avrupanin-en-iyileri',
  'radar',
  'Avrupa''nın beş büyük liginde 21 yaş altı oyuncuların sezon bazlı performans karşılaştırması, öne çıkan isimler ve gelişim eğrileri. Verileri güncellemek için paneli kullanın.',
  'yayinda'
);

-- Not: slug veya id çakışırsa önce mevcut satırı silin. Tabloda slug UNIQUE değilse tekrar çalıştırmadan önce eski demo satırlarını temizleyin.
