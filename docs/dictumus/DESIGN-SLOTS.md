# Dictumus yerleşimleri: tasarım alanları, referans içerik ve ölçüler

> **17 Kas akşamı:** sahip önce banner denemek istedi; güncel plan `BANNER-SLOTS.md` (site tarafı) ve `BANNER-BRIEF.md`
> (Dictumus projesine verilecek İngilizce brief). Bu belgedeki kart, sayfa, menü ve alt bilgi rafta bekliyor.

17 Kas 2026. Kod hazır ama **stokta**: sahip, yerleşimleri Dictumus kurumsal kimliğine özel tasarımlarla devreye almak
istedi. Sahip bu belgedeki alanlar için çıktıları verir; ben onları koda yerleştiririm. Ardından build, seo-check ve
sahibin onayıyla deploy gelir.

- **Kodun yeri:** `git stash list` → "dictumus-placements, parked 17 Nov 2026".
  Yedeği `docs/dictumus/dictumus-placements.patch` (8 dosya; `git apply` ile temiz uygulanıyor, 17 Kas'ta kontrol edildi).
- **Referans ekran görüntüleri:** `docs/dictumus/ref/article-card-1024px.jpg` ve `docs/dictumus/ref/dictumus-page-mobile-375px.jpg`.
  ⚠ İkisi de küçültülmüş ve stoktaki koddan **eski**. Fark:
  - Kartın alt satırında başa `AGES 16+ ·` eklendi.
  - Sayfanın giriş metni "We built it, and we play it." yerine "We built it." ile bitiyor.
  - Tipografi okumak için değil, yerleşimi görmek için kullan.
- **Ölçüler:** yerel production build'de (`next build && next start -p 3001`) tarayıcıdan gerçek piksel olarak alındı. Bazı
  aralıklar CSS'ten hesaplandı; bunlar "≈" ile işaretli. Hepsi CSS pikseli; görselleri **2 katı** çözünürlükte teslim et.

---

## 0. Tasarımı bağlayan kurallar

1. **Yazılar görselin içine gömülmez** (paylaşım görseli hariç, bkz. §3; bannerlar için istisna: `BANNER-SLOTS.md`).
   - Başlık, metin ve butonlar sayfada HTML olarak kalır. Ekran genişliğine göre kırılırlar; ekran okuyucu ve Google onları okur.
   - Senden gelecek görseller: logo, ikon, telefon mockup'ı veya illüstrasyon, paylaşım görseli.
   - Buton ve kartın rengi, köşesi ve çizgisi kodla verilir; renk değerleri yeterli.
2. **Oyuna link veren yerleşimlerde** (yazı sonu kartı, `/dictumus` sayfası, paylaşım görseli) üç bilgi kalır.
   Menü ve alt bilgi linki bundan muaf, çünkü önce kendi sayfamıza gidiyorlar. Üç bilgi:
   - **Sahiplik:** "From the makers of Scout Gamer" ya da aynı anlamda bir ifade.
   - **Ages 16+:** dictumus.com/terms "You must be 16 or over" diyor; okurlarımız ise genç.
   - **No betting · no money between players:** tek başına "free" ya da "no money" yazılmaz, çünkü ana sayfadaki fiyat
     bölümünde ikinci yarı paketleri var.
3. ✅ **Kapandı (17 Kas gece, sahip):** liglerin sezonu ilk yarı ücretsiz, ikinci yarı ücretli; aşağıdaki iki metin bu
   sıralamayla tutarlı. "Free" yalnızca süresiyle yazılır (`Free until mid-season`). Koşulların "free today" cümlesi
   ikinci yarı başladığı gün güncellenmeli. Eski not: dictumus.com/terms (sürüm 30 Eki 2026) "Dictumus is free today:
   there are no purchases, charges or subscriptions" diyor. Ana sayfanın fiyat bölümü ise ikinci yarı paketlerini
   satıyor (€3.99'dan başlayarak). Yerleşimler canlıya çıkmadan önce koşullar mı fiyat bölümü mü güncellenecek, karar
   ver. Bizim metnimiz şu an fiyat bölümüne göre yazıldı.
4. **Lig ve kulüp logosu, arma yok.** Bu hem site kuralı hem marka hakkı meselesi. Lig adları metin olarak yazılır.
5. **App Store rozeti ve linki** Apple onaylayana kadar yok; sadece "App Store coming soon" yazısı kalır.
6. **Site koyu zeminli; açık tema yok.** Dictumus görselleri koyu zeminde iyi durmalı.

   | Rol | Değer (oklch'ten çevrildi, yaklaşık) |
   |---|---|
   | Sayfa zemini | `#04080b` |
   | Kart zemini | `#0f171d` |
   | Koyu yüzey | `#0c1318` |
   | Çizgi | `#182127`, %50 opak |
   | Ana / ikincil / soluk yazı | `#eaeff3` / `#d2d8dd` / `#7c8891` |
   | Bölüm vurgu renkleri | Radar ve Lists emerald `#1bd79e` · Tactics Lab sky `#55c4fe` · Transfers cyan `#34dde5` |
   | Dictumus'un kendi sitesinde en çok kullanılan renk | `#43f5a0`. Emerald'a çok yakın, bilinçli seç (§2) |

7. ⚠ **Font: önce senin kararın gerek.**
   - Site Space Grotesk (başlık), Inter Tight (metin) ve IBM Plex Mono (etiket) için tasarlanmış. Ancak 8 May 2026'daki
     v2 tasarım sisteminden beri bir CSS hatası yüzünden **bu fontlar hiç uygulanmıyor**. Site, canlıda da, sistem
     fontuyla görünüyor: Mac'te SF Pro, Windows'ta Segoe UI. 17 Kas'ta canlıda doğrulandı.
   - Bu belgedeki bütün ölçüler sistem fontuyla alındı.
   - Fontları düzeltirsek sitenin her sayfasının görünümü değişir ve ölçüler biraz kayar. Örneğin mono butonlar daralır:
     ana buton 247 → ≈237 px.
   - Tasarıma başlamadan önce hangi fontla devam edeceğimizi belirle.

---

## 1. Marka paketi (bir kez, her yerleşimde kullanılır)

| Dosya (öneri ad) | Format | Nerede, hangi boyutta |
|---|---|---|
| `dictumus-logo-horizontal.svg` | SVG, koyu zemine uygun, yazılar outline | Kartta eyebrow'un üstünde 20–24 px yükseklik · sayfa başında 28 px |
| `dictumus-icon-mono.svg` | SVG, 24×24 viewBox, tek renk (`currentColor`) | Menüde 14 px; alt bilgide 12–14 px. Rengini site verir |
| `dictumus-wordmark-mono.svg` | SVG, tek renk (`currentColor`), yazılar outline | İsteğe bağlı: alt bilgide ikon yerine, 12–14 px |
| `dictumus-app-icon.png` | 512×512 PNG | Sayfada mağaza butonlarının yanında 64 px. İstemezsen bu dosyayı çıkarırız |
| Renkler | HEX | Ana renk, ana renk üstündeki yazı rengi, hover rengi, odak halkası rengi, varsa ikinci renk ve marka zemini |
| Font | Adı ve lisansı | Öneri: sitede ek font **yüklemeyelim**. Her yazıya 30–60 KB ekler; marka fontu logoda ve görsellerde kalsın |

---

## 2. Yazı sonu kartı (en çok görülen alan)

**Nerede:** yayındaki yaklaşık 86 yazıda görünür. Yazı başına tek kart; WC 2026 arşivinde yok.
- Radar, Tactics Lab, Transfers (18 + 20 + 8 yazı): etiket ve paylaşım satırının hemen üstünde.
- Lists (40 yazı): ana kolonun en sonunda, oyuncu listesi ve videolardan sonra.

**Kart genişliği** (yükseklik içeriğe göre değişir):

| Ekran genişliği | Kart | Yükseklik (şimdiki içerikle) | Not |
|---|---|---|---|
| 375 (telefon) | **334** | 480 (Golden Boy metniyle 504) | ölçüldü; telefonlarda kart ≈ ekran − 41 |
| 768 | **684** | 279 | ölçüldü; kenar çubuğu yazının altında |
| 768–960 | ≈684 → **≈853** (en geniş hal) | ≈279 | tek kolon, ekranla büyür |
| 961 | **≈527** (en dar masaüstü) | ≈320+ | kenar çubuğu yana geçer, kart daralır |
| 1000 / 1024 | 560 / 580 | ≈319 / 304 | ölçüldü (genişlikler) |
| ≈1150 ve üstü | **672** (sabit) | 279 | 1440 ve 1920'de ölçüldü |

**İç yapı (yukarıdan aşağı):**
- İç boşluk 28 px (üst ve yanlar), alt 24 px. Köşe 6 px. Solda 3 px vurgu çizgisi, diğer kenarlarda 1 px çizgi.
- **Metin alanı = kart − 60 px** (672 px kartta 612 px). Metin paragrafı ayrıca en fazla 620 px.
- **Logo:** kendi satırında, eyebrow'un **üstünde**, her genişlikte. 20–24 px yükseklik, en fazla 140 px genişlik.
  Eyebrow kalır, çünkü sahiplik bilgisini taşıyor.
- **Eyebrow:** 10 px mono, büyük harf: `FROM THE MAKERS OF SCOUT GAMER`.
- **Başlık:** 22 px, kalın. Geniş kartta 1 satır, telefonda 2 satır. **Sınır: 45 karakter.**
- **Metin:** 15 px, satır yüksekliği 1.6. Geniş kartta 3 satır, telefonda 6 satır. **Sınır: 240 karakter.**
- **Buton satırı** (butonlar 37 px yüksek; dar kartta alt alta iner):
  - ana buton `PLAY DICTUMUS IN YOUR BROWSER` (247 px), web app'e gider;
  - ikinci buton `GET IT ON GOOGLE PLAY` (179 px);
  - metin linki `HOW IT WORKS →`, /dictumus'a gider.
- **Alt satır** (10 px mono): `AGES 16+ · NO BETTING · NO MONEY BETWEEN PLAYERS · FREE UNTIL MID-SEASON`.
  672 px kartta 1 satır; 560 px ve altında 2, telefonda 3 satır.

**Renk: bugün karttaki vurgu yazının bölüm rengini izliyor.**
- Çizgi, eyebrow ve ana buton Radar'da emerald, Tactics Lab'de sky, Transfers'ta cyan oluyor. Lists'te yazının kendi
  vurgusu, varsayılanı emerald.
- Seçenek (a), öneri bu: kart zemini sitede kalır (`#0f171d`); çizgi, eyebrow ve ana buton her yazıda **sabit Dictumus
  rengi** olur. Dictumus'un yeşili (`#43f5a0`) emerald'ın yanında "neredeyse aynı yeşil" gibi durabilir; farklı bir marka
  rengi mi kullanılsın, bilinçli karar ver.
- Seçenek (b): kartın tamamı Dictumus marka zemininde.

**Görsel alanı önerisi:**
- **Telefonda (kart 640 px'ten dar): görsel yok**, sadece logo. Kart zaten 480 px uzunluğunda; yazının sonu ağırlaşmasın.
- **Kart ≥640 px olduğunda** (≈768–960 px ekran ve ≈1150 px ve üstü): sağda dikey görsel, **200 × 250 px**.
  - Metinle arasında 24 px boşluk; görsel üste hizalı, boyutu sabit.
  - Metin alanı ≈390–570 px'e iner; başlık 2 satıra çıkabilir, butonlar alt alta dizilir.
  - Teslim: **400 × 500 px**, WebP veya şeffaf PNG. İçerik: telefon mockup'ında "everyone's picks are open" ekranı ya da
    marka illüstrasyonu.
- **Google Play:** metin butonu yerine Google'ın resmî "Get it on Google Play" rozeti kullanılabilir. Rozet Google'ın rozet
  sayfasından alınır, değiştirilmez; 40 px yükseklikte (≈135 px genişlik) gösteririm.

**Kartın şimdiki metinleri** (değiştirmek istersen yeni metni ver):

| Sürüm | Başlık (42 karakter) | Metin |
|---|---|---|
| Genel (tüm yazılar) | You read the players. Now call the scores. | Dictumus is a score-prediction game for you and your friends. Call every match, the picks open together before kick-off, and the table settles who reads football best. Eleven competitions, eight languages. (205 karakter) |
| Tahmin yazıları (Golden Boy oy pusulası ve makbuzu) | We put our picks on record. Now put yours. | Dictumus is a score-prediction game built on the same idea as this piece: make the call before it happens and keep the proof. Your group calls every match, the picks open together before kick-off, and the table shows who read it best. (234 karakter) |

---

## 3. `/dictumus` sayfası

**İçerik genişliği:** masaüstünde **722 px** (sayfa kabı 880 px), telefonda **334 px**. Sayfa dar ve tek kolon.

| Bölüm | Masaüstü (1440) | Telefon (375) | İçerik |
|---|---|---|---|
| Hero | Başlık 722 × 118 (56 px, 2 satır); giriş metni 640 × 86; butonlar 193 × 39 ve 192 × 39 | Başlık 36 px, 3 satır; giriş metni 173 px yüksek | Eyebrow `FROM THE MAKERS OF SCOUT GAMER` · H1 `Dictumus: call the scores, keep the proof` · giriş paragrafı · `PLAY IN YOUR BROWSER` · `GET IT ON GOOGLE PLAY` · `FOR AGES 16 AND OVER · THE BROWSER VERSION WORKS ON ANY PHONE OR COMPUTER, IPHONE INCLUDED · APP STORE COMING SOON` |
| How it works | **2 + 1 düzen:** iki kart yan yana, üçüncüsü alt satırda tek; her biri 353 × 173–196 | Alt alta, 334 × 173–196 | 01 Call every score · 02 The picks open together · 03 The table settles it |
| Puanlar | 3 hap: 147, 221, 143 × 56 | Aynı, sarar | +5 Exact score · +2 Right result and margin · +1 Right result |
| Ligler ve diller | 722 × 196 (iki kolon) | 334 × 398 | 11 lig adı ve 8 dil, metin çipleri (logo yok) |
| "No betting" kutusu | 722 × 227 | 334 × 433 | `No betting. No money between players.` ve ücret modeli. Fiyatlar dictumus.com'da kalır |
| Why it lives here | 722 × 110 | 334 × 189 | Golden Boy oy pusulası ve makbuzuna iç linkler |

**İstenecek görseller:**
- **Logo:** sayfa başında eyebrow'un üstünde, 28 px yükseklik. **Uygulama ikonu:** mağaza butonlarının yanında 64 px (isteğe bağlı).
- **Hero görseli** (öneri): telefon mockup'ı.
  - Masaüstünde hero'yu 1200 px kaba açıp iki kolon yaparım: metin 520 px, boşluk 40 px, görsel **480 × 560 px**.
    Teslim: **960 × 1120**.
  - Telefonda aynı görsel butonların altına iner, 334 px genişlikte.
- **"How it works" için 3 gerçek uygulama ekranı** (isteğe bağlı):
  - Ekranlar: (1) haftanın tahminlerini girme, (2) tahminlerin açıldığı an, (3) puan tablosu veya ödüller.
  - Gelirse ızgarayı **3 kolona** çeviririm (masaüstünde her kart ≈230 px). Ekran, metnin üstünde 160 px genişlikte ve
    ortalı durur; kart ≈350 px uzar. Telefonda kartlar yine alt alta.
  - Telefonun kendi çözünürlüğünde, kırpmadan teslim et. **Ekranlarda gerçek kullanıcı adı olmasın**; dictumus.com'daki
    gibi demo isimler kullan (Maya, Priya, Leo…).
- **Paylaşım görseli (OG): 1200 × 630.** Bu belgedeki yerleşimlerde görselin içine yazı girebilen tek yer burası (bannerlar hariç, bkz. `BANNER-SLOTS.md`).
  - Başlık olabilir; `16+ · No betting` satırı **bulunmalı**. Yazı en az 28 px.
  - Lig ve kulüp işareti yok.
  - Önemli her şey ortadaki **1000 × 500** alanda dursun (X ve WhatsApp kenarları kırpabiliyor). Logo ayrıca ortadaki
    **600 × 600** kareye de sığsın, çünkü WhatsApp'ın küçük önizlemesi kare kırpıyor.
  - Bugün sayfa paylaşılınca Scout Gamer'ın genel görseli çıkıyor.

---

## 4. Menü: "PREDICT"

- **Masaüstü** (1024 px ve üstü; daha dar ekranda sığmadığı için gizli):
  - menü çubuğu 68 px yüksek, öğe **89 × 35 px**;
  - 11 px mono, büyük harf, harf aralığı 0.16 em, iç boşluk 8 × 14 px, hap şeklinde;
  - pasifken soluk yazı (`#7c8891`), sayfa açıkken vurgu rengi ve ince çerçeve.
- **Mobil menü** (768 px altı): tam genişlikte hap, ≈343 × 46 px. Pasifken ikincil yazı rengi (`#d2d8dd`); aktifken
  vurgu rengi ve sağda 6 px nokta.
- **İsteğe bağlı ikon:** etiketin soluna **14 × 14 px** tek renk ikon (`dictumus-icon-mono.svg`). Rengini site verir,
  böylece aktif ve pasif hali kendiliğinden doğru olur.
- **Etiket seçeneği:** `PREDICT` (şimdiki), `DICTUMUS` veya `PLAY`. "Play", Arena da bir oyun olduğu için karışabilir.

---

## 5. Alt bilgi satırı

- Metin: `ALSO FROM US: DICTUMUS, PREDICT THE SCORES WITH YOUR FRIENDS →` (10 px mono, büyük harf).
- Yeri: 640 px ve üstünde telif satırının sağında; daha dar ekranda altında.
- Ölçüler:
  - masaüstünde **445 × 15** (tek satır);
  - 768 px'te **395 × 30** (iki satır);
  - telefonda **334 × 30**.
- **İsteğe bağlı:** metnin önüne 12–14 px yükseklikte tek renk ikon ya da wordmark (`dictumus-wordmark-mono.svg`).

---

## 6. Durumlar (hover, odak, basılı)

Şu anki kodda butonlar fareyle üstüne gelince Scout Gamer stiline dönüyor; bu, marka rengini bozar. Bu yerleşimler
için kendi durumlarını kodlayacağım. Senden istenen:

| Öğe | Normal | Hover | Klavye odağı | Basılı |
|---|---|---|---|---|
| Ana buton (web app) | ana renk zemin + yazı rengi | hover rengi | odak halkası (2 px) | biraz koyu |
| İkinci buton / Google Play | çerçeveli | çerçeve ana renge döner | odak halkası | — |
| Metin linkleri (HOW IT WORKS, alt bilgi) | soluk yazı | altı çizili, açık yazı | odak halkası | — |
| Menü öğesi | yukarıdaki gibi | açık yazı | odak halkası | — |

Odak halkası ve hover rengi hem `#0f171d` hem `#04080b` zemininde okunur kontrastta olmalı.

---

## 7. Teslim listesi

- [ ] **Font kararı** (§0.7): düzeltilsin mi, sistem fontuyla mı devam?
- [ ] **Dictumus koşullar–fiyat çelişkisi** (§0.3) çözüldü mü?
- [ ] Logo yatay SVG · tek renk ikon SVG · (isteğe bağlı) tek renk wordmark SVG · (isteğe bağlı) uygulama ikonu 512 PNG
- [ ] Renkler (HEX): ana, ana üstü yazı, hover, odak halkası; varsa ikinci renk ve marka zemini
- [ ] Kart rengi: (a) site zemini + sabit Dictumus rengi, ya da (b) marka zemini
- [ ] Kart görseli 400 × 500 (yalnızca kart ≥640 px iken görünür)
- [ ] Hero görseli 960 × 1120; sayfa iki kolona açılsın mı (evet/hayır)
- [ ] 3 uygulama ekranı, demo isimlerle (isteğe bağlı; gelirse ızgara 3 kolon olur)
- [ ] Paylaşım görseli 1200 × 630, içinde `16+ · No betting`
- [ ] Menü etiketi: PREDICT / DICTUMUS / PLAY; ikon olsun mu
- [ ] Metin değişiklikleri (varsa): kart başlığı en fazla 45, kart metni en fazla 240 karakter
- [ ] Google Play: resmî rozet mi, metin butonu mu

## 8. Devreye alma (benim adımlarım)

1. Kodu geri getir: `git stash pop` ya da `git apply docs/dictumus/dictumus-placements.patch`.
2. Görselleri `public/dictumus/` altına koy, sıkıştır, bileşenlere bağla; durumları (§6) ve renkleri kodla.
3. Font kararı "düzelt" ise önce o (ayrı commit); sonra kart ve sayfa ölçülerini yeniden kontrol et.
4. `next build && next start -p 3001` → ham HTML kontrolü + `node scripts/seo-check.mjs http://localhost:3001`.
5. Sahip yerelde bakar, onaylar → deploy → canlıda `/dictumus` ve bir yazının sonu kontrol edilir.
