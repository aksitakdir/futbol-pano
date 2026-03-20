-- Taktik Lab içeriklerini seed et.
-- Supabase SQL Editor'da çalıştırın.
-- Slug çakışması olursa önce mevcut satırları silin:
--   DELETE FROM contents WHERE category = 'taktik-lab';
-- Eski seed kullandıysanız False 9 slug'ı:
--   UPDATE contents SET slug = 'false-9' WHERE category = 'taktik-lab' AND slug = 'false-9-analiz';

INSERT INTO contents (title, slug, category, content, status) VALUES
(
  'False 9: Düşen Forvet Oyununun Anatomisi',
  'false-9',
  'taktik-lab',
  E'## False 9 Nedir?\n\nFalse 9, klasik merkez forvet pozisyonunda oynayan ancak ceza sahasında beklemek yerine orta sahaya düşerek alan açan ve oyun kuran bir oyuncu tipidir. Bu pozisyonu icat eden değil, ancak en yüksek düzeyde icra eden Lionel Messi, False 9''nin modern futboldaki karşılığını dünyaya gösterdi.\n\n## Neden "False"?\n\nGeleneksel 9 numaraların aksine bu oyuncu, savunma hatlarını kendine çekerek kanat oyuncularına ve box-to-box orta sahaların hücum bölgesine girmesine alan açar. Rakip stoperler ikilemde kalır: takip ederlerse bölge boşalır, takip etmezlerse oyun kurucu serbest kalır.\n\n## 2025-26 Sezonu Örnekleri\n\n- **Lamine Yamal konumlanmaları** — Barcelona''nın pressing çözücüsü olarak hibrit kullanım\n- **Florian Wirtz** — Leverkusen''ın düşen 10-9 profili\n- **Pedri** — Camp Nou''da merkez-ofensif ikilem\n\n## Fiziksel ve Teknik Profil\n\n| Özellik | Beklenti |\n|---|---|\n| Hız | Yüksek (geri dönüş + patlama) |\n| Pas isabeti | %88+ |\n| Dribling | Elite seviye |\n| Hava topu | İkincil |\n\n## Sonuç\n\nFalse 9, rakip defans organizasyonunu bozan ve modern futbolun en karmaşık pozisyon tanımlarından birini temsil eden bir arketiptir.',
  'yayinda'
),
(
  'Box-to-Box Engine: Modern Futbolun Kalp Atışı',
  'box-to-box-engine',
  'taktik-lab',
  E'## Box-to-Box Orta Saha Nedir?\n\nModern futbolda en kritik pozisyonlardan biri olan Box-to-Box orta saha oyuncusu; hem savunma görevlerini yerine getirir hem de hücum katkısıyla fark yaratır. "Box-to-Box" terimi tam anlamıyla iki ceza sahası arasında aralıksız koşup oyunun her fazında aktif olan oyuncuyu tanımlar.\n\n## Temel Görevler\n\n**Savunma fazı:**\n- Ikinci bölge top kazanımı\n- Rakip orta sahaları kapatma\n- Yüksek pressing katkısı\n\n**Hücum fazı:**\n- İkinci dalga koşusu (late run)\n- Uzak mesafe şut tehdidi\n- Kanat kombinasyonlarına katılım\n\n## 2025-26 Sezonunun En İyi Box-to-Box Isimleri\n\n1. **Jude Bellingham** — Real Madrid, 11 gol 7 asist\n2. **Rodri** (sakatlık sonrası dönüş) — Manchester City\n3. **Yusuf Yazıcı** — Süper Lig''de bu formattaki en iyi yerli örnek\n\n## Fiziksel Gereksinimler\n\nYüksek laktat eşiği, maç başına 11-13 km koşu kapasitesi ve güçlü ikili mücadele istatistikleri bu pozisyonun temel ölçütleridir.\n\n## Sonuç\n\nBox-to-Box orta saha, modern takımların "her şeyi yapan" oyuncusudur; ancak bu çok yönlülük yüksek kondisyon ve taktiksel zeka gerektirir.',
  'yayinda'
),
(
  'Inverted Winger: İçe Kesen Kanat Devrimi',
  'inverted-winger',
  'taktik-lab',
  E'## Inverted Winger Anatomisi\n\nGeleneksel kanat oyuncusunun aksine, Inverted Winger baskın ayağının karşı tarafında oynar: sol ayaklı sağ kanatta, sağ ayaklı sol kanatta. Bu konumlanma oyuncuya içe keserek dominant ayağıyla şut ya da pas seçeneği sunar.\n\n## Neden Devrimci?\n\n1. Rakip beki hem derinlikte hem de içeride kapatma ikileminde bırakır\n2. Sol ve sağ kombinasyonlarında asimetrik tehdit yaratır\n3. Uzak köşeden gol tehlikesi doğrudan artırır\n\n## Tarihsel Kırılma Noktası\n\nArjen Robben''ın Bayern München''de sol kanattan sağ ayakla attığı goller bu arketipin ikonlaştığı andır. Günümüzde bu kalıp standart bir tercih haline geldi.\n\n## 2025-26 Sezonu Profilleri\n\n| Oyuncu | Kulüp | Kesen Taraf |\n|---|---|---|\n| Vinicius Jr. | Real Madrid | Sol→İçeri |\n| Saka | Arsenal | Sağ→İçeri |\n| Lookman | Atalanta | Sol→İçeri |\n\n## Scouting Kriterleri\n\n- Dominant ayak isabeti (şut + pas) %72+\n- 1v1 geçme başarısı %45+\n- xG katkısı maç başına 0.25+\n\n## Sonuç\n\nInverted Winger, modern hücum futbolunun en çok kopyalanan ve aynı zamanda en çok yanlış uygulanan arketiplerinden biridir.',
  'yayinda'
),
(
  'Ball-Playing CB: Oyun Kurucu Stoper',
  'ball-playing-cb',
  'taktik-lab',
  E'## Modern Stoper Devrimi\n\nSavunmadan hücuma oyun başlatan Ball-Playing CB (Top Oynayan Stoper), artık sadece topu uzaklaştırmakla yetinmez; pressingi kıran paslarıyla takımının hücum organizasyonunun ilk halkasını oluşturur.\n\n## Geleneksel Stoper vs. Ball-Playing CB\n\n| Özellik | Klasik Stoper | Ball-Playing CB |\n|---|---|---|\n| Temel görev | Top uzaklaştırma | Oyun başlatma |\n| Pas mesafesi | Kısa-güvenli | Uzun diyagonal + ileri pas |\n| Presinge yaklaşım | Bekle | Çık ve kes |\n| Ayak becerisi | İkincil | Temel gereksinim |\n\n## Bu Pozisyonun Yükselişi\n\nPep Guardiola''nın Barcelona''sında Puyol-Pique ikilisinin ardından Virgil van Dijk, Rúben Dias ve günümüzde Castello Lukeba bu pozisyonun modern temsilcileri arasındadır.\n\n## 2025-26 Sezonunda Öne Çıkanlar\n\n- **William Saliba** — Arsenal''ın oyun çıkışının merkezi\n- **Gvardiol** — Manchester City''nin sol ayaklı stoper okuyucusu\n- **Merih Demiral** — Al-Qadsiah''ta liderlik rolü\n\n## Sonuç\n\nBall-Playing CB, modern futbolun en değerli ve en az bulunan pozisyon profillerinden birini temsil etmektedir.',
  'yayinda'
),
(
  'Inverted Full-back: Bek Pozisyonunun Evrimi',
  'inverted-fullback',
  'taktik-lab',
  E'## Gelenekseli Yıkan Bek Tipi\n\nModern futbolda bek pozisyonu köklü bir dönüşüm geçirdi. Inverted Full-back, kanat hattında kalmak yerine içeriye dönerek orta sahada rakam fazlası ve pozisyonel üstünlük sağlar.\n\n## Nasıl Çalışır?\n\nTakım hücumda topla ilerlediğinde geleneksel bek kanat çizgisine çıkarken, Inverted Full-back iç yarım alana çekilerek:\n- 8 numaranın önünde ikinci orta saha oluşturur\n- Kanat oyuncusuna açık tarafta alan açar\n- Dörtlü-ikilik yapıya geçişi kolaylaştırır\n\n## Guardiola Modeli\n\nPep Guardiola bu pozisyonu Manchester City''de Cancelo ve ardından Trent Alexander-Arnold ile zirveleştirdi. Liverpool''da TAA''nın merkeze alınması bu trendin en tartışmalı uygulamasıdır.\n\n## 2025-26 Öne Çıkan İsimler\n\n1. **Trent Alexander-Arnold** — Liverpool/Real Madrid (sezon ortası transfer)\n2. **João Cancelo** — Barcelona kiralığı\n3. **Jeremie Frimpong** — Bayer Leverkusen\n\n## Riskler\n\nBu oyun modelinin en büyük riski, sağ/sol bek pozisyonunun boşalmasıyla oluşan kanat arkası açığıdır. Karşı baskı (gegenpressing) döngüsü zayıflarsa ciddi savunma zaafiyeti ortaya çıkar.\n\n## Sonuç\n\nInverted Full-back, doğru kadro ve oyun modeliyle uygulandığında rakiplerin çözemediği bir alan ve sayı üstünlüğü yaratır.',
  'yayinda'
),
(
  'High Press Striker: Savunmayı Tepeden Yıkan Forvet',
  'high-press-striker',
  'taktik-lab',
  E'## Pressing Forveti Nedir?\n\nYüksek pressing sistemlerinin vazgeçilmez parçası olan High Press Striker, kaleci ve stoperlerden başlayarak rakip yapılanmasını bozan, topu yüksekte kazanmayı hedefleyen bir forvet tipidir.\n\n## Temel İşlev\n\nGol atmak bu oyuncunun ikincil önceliğidir. Asıl görevi:\n1. Kaleci ve stoperler üzerine baskı oluşturmak\n2. Rakibi uzun topta hataya zorlamak\n3. Kazanılan toplarla hızlı kontra-atak başlatmak\n\n## Fiziksel Profil\n\n| Metrik | Beklenen Değer |\n|---|---|\n| Koşu mesafesi | 11+ km/maç |\n| Yüksek yoğunluklu sprint | 25+ sprint/maç |\n| Top kazanımı | 5+ /maç |\n| Hava topu kazanımı | İkincil |\n\n## 2025-26 En İyi Örnekler\n\n- **Roberto Firmino** tipolojisi: Klopp''un Liverpool sisteminin mirasçıları\n- **Erling Haaland** — Pressing + bitiricilik hibridinin modern temsilcisi\n- **Dusan Vlahovic** — Juventus''un pressing motoruna dönüşümü\n\n## Neden Bu Kadar Değerli?\n\nYüksek pressing oynayan takımlar istatistiksel olarak rakip ceza sahasına daha yakın top kazanımı gerçekleştirir. Bu durum doğrudan xG artışına dönüşür.\n\n## Sonuç\n\nHigh Press Striker, modern futbolun en çok kondisyon gerektiren ve en az takdir gören pozisyon arketiplerinden biridir; ancak sisteme katkısı gol istatistiklerinin çok ötesindedir.',
  'yayinda'
);
