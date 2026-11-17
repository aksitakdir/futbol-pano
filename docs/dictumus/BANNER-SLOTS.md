# Dictumus bannerları: alanlar, ölçüler ve test planı

17 Kas 2026. Yarın (18 Kas) üreteceğin banner için ölçüleri ve kuralları veriyor. **Banner hareketli** (sahibin isteği,
17 Kas gece): kısa bir animasyon ve onun durağan karesi. Dictumus projesine verilecek tam şartname İngilizce
`BANNER-BRIEF.md`'de; bu belge sitenin tarafı.
- **Ölçüler:** canlı sitede (scoutgamer.com) gerçek tarayıcıda alındı. Hepsi CSS pikseli. "≈" ile işaretli değerler CSS'ten
  hesaplandı, ölçülmedi.
- **Bu belge, bannerlar için `DESIGN-SLOTS.md` §0.1'in ("yazılar görsele gömülmez") yerine geçer.** Banner bir görsel ve
  yazıları görselin içinde. Diğer yerleşimler için §0.1 aynen geçerli.
- **Bannerda DESIGN-SLOTS §0.2'nin üçüncü bilgisi kısalır:** görselde yalnızca `No betting` var; `no money between players`
  alt metinde kalır (§1.5).
- **Rafa kaldırılanlar (git stash):** `/dictumus` sayfası, menüdeki PREDICT, alt bilgi linki ve yazı sonu HTML kartı. Testin
  sonucuna göre sonra açılabilirler.

---

## Durum (18 Kas 2026)

- **Banner geldi** (Dictumus projesi, `tools/social/src/ScoutgamerBanner.tsx`): "Call the scores. / Say "I told you so."" →
  "11 leagues. / Every match." → "Your friends. / Your tournament." → başa dönüş; buton `Start a tournament →`.
  Bu Mac'te çizildi (`video/out/dictumus-banner-src/render.mjs`: Remotion kareleri + AVFoundation), dosyalar
  `public/dictumus/2026-11/`.
- **Sahibin kararı:** bannerda ve sayfada yaş/bahis satırı yok ("uygulamada betting yok, bunu söylemek önceliğimiz
  değil"; yaş kayıtta soruluyor). Bu belgedeki "Ages 16+ · No betting" kuralları bu yüzden uygulanmadı; alt metin de
  yalnızca bannerın yazılarını taşır. Sahiplik etiketi (`FROM THE MAKERS OF SCOUT GAMER`) duruyor.
- **Masaüstü:** sağ sütun, SHARE'ın üstü (sahip). **Vercel:** test Hobby'de başlar; ücretli paketler açılmadan Pro.
- Aşağıdaki tasarım kartı ve kurallar teslimden önceki şartnamedir; kayıt için duruyor.

## Yarın için tasarım kartı

- **Dosyalar:** üç alanın hepsi aynı dosyaları kullanır.
  - `dictumus-banner.png`: **960 × 480**, durağan tam banner (sRGB, şeffaflık yok). Animasyonun 1. karesinden alınır.
  - `dictumus-banner.mp4`: aynı ölçüde, sabit 30 fps, **en fazla 5 sn (150 kare)**, H.264, ses izi yok, tek sefer oynar.
    **İlk ve son karesi PNG'nin tasarımı**; hareket arada olur.
  - `dictumus-banner-copy.txt`: görünen bütün yazılar (alt metin için).
  - Düzenlenebilir kaynak dosya da gelsin; mesaj değişirse bannerı yeniden üretmek için.
- **Hareket kuralları:** döngü yok; yanıp sönme hiç yok (WCAG'in kesin sınırı: herhangi bir saniyede 3); logo ve
  `Ages 16+ · No betting` her karede kıpırdamadan ve tam görünür; ortada beliren yazı tam görünür halde en az 1,5 sn durur.
  Ayrıntı ve nedenleri BANNER-BRIEF §2–3.
- **Güvenli alan:** her kenardan 40 px (iç alan 880 × 400). Her şey bunun içinde durur.
- **Köşe ve çerçeve:** kod her durumda 10 px köşe ve 1 px `#182127` %50 çizgi (sitenin `--sg-border`'ı) ekler. Görseli
  çerçevesiz ve kare köşeli teslim et.
- **Ekranda** 280–480 CSS px genişlikte görünür. En küçüğü sağ sütun: 280 × 140.
- **En küçük ölçüler** (960 px tuvalde; yazılarda font boyutu, büyük harf yüksekliği değil):
  - yazı **48 px** (280 px'te 14 CSS px),
  - başlık **68 px**,
  - logo **64 px** yükseklik.
  - Yazı ağırlığı en az Medium/500; Light ve Thin yok. Her yazının zeminle kontrastı en az 4,5:1 (logo muaf).
- **Görselde olacaklar:**
  - Dictumus logosu.
  - Başlık: İngilizce, en fazla 42 karakter, en fazla 2 satır (öneriler §1.1).
  - `Ages 16+ · No betting`. **Bu metin birebir:** aynı büyük-küçük harf ve orta nokta (·).
  - Buton yazısı: en fazla 12 karakter (boşluk ve ok dahil), örn. `Play now →`; alt satır 880 px'e sığmalı. Gerçek bir buton
    değil; görselin tamamı tıklanıyor.
- **Yerleşim:** üstte logo. Altında 2 satır başlık. En altta tek satır: solda `Ages 16+ · No betting`, sağda buton (aralarında
  en az 40 px).
  - Dikey bütçe: logo 64 + boşluk 24 + başlık 156 + boşluk 24 + buton 96 = 364 ≤ 400.
  - `Play in your browser →` bu satıra sığmaz: 48 px'te yaş satırıyla birlikte, buton boşluğu olmadan ≈900–1.000 px; iç alan 880. Bu ifade alt
    metinde ve HTML'de kalır.
- **Olmayacaklar** (nedenleri §1.2):
  - fiyat mesajı ("free" dahil; nedeni §1.2); tek başına "no money" ya da "no real money";
  - bahis çağrıştıran her şey: bet, odds, stake, "win £", jeton, fiş, nakit görseli;
  - Google Play ve App Store rozeti;
  - lig ya da kulüp logosu, arma, tanınır forma; gerçek kulüp adı (örnek skorlarda da); gerçek oyuncu fotoğrafı ya da yapay
    zekâyla üretilmiş oyuncu yüzü;
  - çocuksu ya da çizgi film üslubu;
  - yanıp sönme, döngü, ses.
- **Zemin ve doku:** Dictumus'un logosu, yazı tipi ve koyu marka zemini; açık zemin yok. Düz renkler kullan; fotoğraf,
  gren/doku ve geniş gradyan yok (960 px'lik WebP ≈50 KB, web videosu ≈300 KB kalmalı, §2).
- **Teslim:** dosyaları `docs/dictumus/banners/` klasörüne koy ya da sohbete ekle.

---

## 0. Önerim

- **Telefon (≤599 px ekran, tıkların ≈%76'sı):** her yazıda en fazla 2 banner. Biri yazının içinde, en az 2 bölümden sonra;
  diğeri yazının sonunda. **Ana alan, liste sayfalarında telefondaki yazı içi banner.** Google tıklarının %97'si listelere,
  %76'sı telefona geliyor.
- **Tablet ve yatay telefon (600–960 px, ≈%2):** sadece yazı sonu bannerı (§4).
- **Masaüstü (≥961 px, ≈%22):** sağ sütunun en üstünde 1 banner. Okuma boyunca sabit kalıyor (yapışkan). Diğer masaüstü
  seçenekleri §6'da.
- **Sahiplik bilgisi görselin dışında,** üstteki küçük HTML etikette: `FROM THE MAKERS OF SCOUT GAMER`.
- **Her bannerda tek link var:** Dictumus web app'i (app.dictumus.com). Her alanın kendi UTM etiketi olur.
- **Test 8 hafta sürer.** Trafik az (Google'dan günde ≈25 ziyaret), bu yüzden test ancak "işe yarıyor mu" sorusunu cevaplar
  (§5).

---

## 1. Kurallar

### 1.1 Başlık

**Başlık önerileri (İngilizce):**
- `You read the players. Now call the scores.` (42 karakter; rafa kaldırılan kartın başlığı, liste okuruna uyuyor)
- `Call the scores. Keep the proof.` (32)
- `Predict the matches with your friends.` (38)

"From the makers of Scout Gamer" görselde zorunlu değil; HTML etikette zaten var (§1.4). Görselde tekrarlamak serbest.

### 1.2 Yasakların nedenleri

- **Fiyat mesajı yok:** sahip netleştirdi (17 Kas gece): her ligin sezonu ilk yarı ücretsiz, ikinci yarı ücretli;
  dictumus.com da bunu söylüyor. DESIGN-SLOTS §0.3'teki "çelişki" böylece kapandı. Ama `Free until mid-season` test
  sırasında yanlış olur: Avrupa ligleri ≈ocak başında ikinci yarıya geçiyor, test ise
  ≈ocak ortasına kadar sürüyor; Brasileirão'da zaten ikinci yarıdayız. Bu yüzden önerim bannerda fiyat mesajı olmaması;
  böylece banner test boyunca değişmeden doğru kalır. Ücretsizlik bilgisi Dictumus'un kendi sayfasında okura zaten
  söyleniyor. "No money" ve "no real money" tek başına yazılmaz. Koşulların "free today" cümlesi ilk ligin ikinci yarısı
  başladığı gün güncellenmeli (Dictumus tarafı).
- **Mağaza rozetleri:** banner web app'e gidiyor; Google'ın rozet kuralı ise rozetin Play'e gitmesini istiyor.
- **Logolar ve kişiler:** lig ve kulüp logosu site kuralı ve marka hakkı meselesi (DESIGN-SLOTS §0.4).
- **Çocuksu üslup:** okurlarımız genç. İngiltere'nin reklam kurulu ASA, bu tarz çizimi ve futbol yıldızlarını 18 yaş altına
  "güçlü hitap" açısından yüksek risk sayıyor. Kural kumar için yazılmış ama ASA ilkelerini başka reklamlara da
  uygulayabiliyor.

### 1.3 Neden 48 px

- Sağ sütunda dosyanın her pikseli 280/960 ≈ 0,29 CSS px. 48 px'lik yazı 280'de 14 CSS px, 390'lık telefonda ≈17 px;
  68 px'lik başlık ≈20 / ≈25 px; 64 px'lik logo 280'de ≈19 px eder.
- **Neden 14 px alt sınır:** Lighthouse'un eski okunurluk kontrolü 12 px'in altındaki yazıyı uyarıyordu; 14 buna pay
  bırakıyor. WCAG'in kendine ait bir alt sınırı yok.

### 1.4 HTML etiketi (görselin üstünde)

- **Metin:** `FROM THE MAKERS OF SCOUT GAMER`. Sitedeki mono etiket stiliyle yazılır: 11 px, büyük harf.
  - Rengi `#7c8891`. Zemine karşı kontrastı ≈5,5:1.
  - Satır yüksekliği 14 px olarak sabitlenir (sitedeki etiket stili 16,5 px veriyor). Görselle arasında 8 px boşluk var;
    etiket toplam 22 px.
- **Neden bu metin:** İngiltere'nin reklam kuralı (CAP 2.1, kendi sitemizdeki tanıtımları da kapsıyor) tanıtımın "açıkça
  tanınır" olmasını istiyor. Etiket kimin neyi tanıttığını açıkça söylüyor. Ücretli reklam olmadığı için "Advertisement"
  yazmıyoruz. Rafa kaldırılan kart ve DESIGN-SLOTS de aynı metni kullanıyor.
- **Neden etiketin sonuna `AGES 16+ · NO BETTING` eklemedim:** etiket uzayınca 280 ve 320 px'te iki satıra iniyor. Bu bilgi
  görselde ve alt metinde zaten var. Görseldeki satır 14 px kuralını tutmazsa etikete eklerim.
- **Yazı tipi:** site fontunu kullanan tek parça bu etiket. Sitedeki font hatası (DESIGN-SLOTS §0.7) bu yüzden bannerı
  bekletmiyor.

### 1.5 Alt metin (biz yazarız, İngilizce)

Alt metin görseldeki mesajı, §0.2'nin görselde kısalan bilgisini ve linkin nereye gittiğini taşır. Sahiplik etikette ve
kapsayıcının adında var, burada tekrarlanmaz. Son halini görsel gelince yazarım. Örnek:

> `Dictumus: You read the players. Now call the scores. Ages 16+, no betting, no money between players. Play in your browser (opens in a new tab).`

### 1.6 Link

- **Hedef: web app.** Adresi `https://app.dictumus.com/` ve UTM etiketleri ekleniyor (§5). Rafa kaldırılan koddaki
  `lib/dictumus.ts` yardımcıları kullanılır.
  - **Neden web app:** iPhone, Android ve bilgisayarda kurulum gerekmeden açılıyor. App Store henüz yok; Play Store yalnızca
    Android kullanıcısına yarıyor.
- **Bağlantı özellikleri:**
  - `target="_blank"`: okurun geldiği yazı açık kalır. Sitedeki YouTube ve haber linkleri de böyle açılıyor.
  - `rel="sponsored noopener"`: ücretli değil, ama her yazıda tekrarlanan bir tanıtım linki. Google bu tür linklerin
    `sponsored` (ya da `nofollow`) ile işaretlenmesini kabul ediyor ve sıralama değeri aktarmıyoruz. `noreferrer` yok,
    böylece Dictumus ziyaretin scoutgamer.com'dan geldiğini görür.

### 1.7 Renkler (site koyu, açık tema yok)

| Rol | Değer |
|---|---|
| Sayfa zemini (bannerın durduğu yer) | `#04080b` |
| Sitedeki kart zemini / çizgi | `#0f171d` / `#182127` %50 |
| Lists vurgu rengi (trafiğin %97'si) | emerald `#1bd79e` |
| Dictumus'un en çok kullandığı renk | `#43f5a0`. Emerald'a çok yakın |

- **Dictumus'un kendi marka zeminini kullan.** Banner sitenin kartlarına benzemesin; okur onun ayrı bir ürün olduğunu
  anlamalı.

---

## 2. Görsel ekranda

- **Genişlik:** sağ sütunda 280 × 140. Telefonda ekranın ≈%89'u: 360'ta 320 × 160, 390'da ≈347 × 174, 430'da ≈383 × 192.
  540 px ve üstünde 480 × 240'ta durur, yazı kolonunda ortalı. Üstüne 22 px etiket eklenir.
- **Neden 480'de sınırlı:** tablette yazı kolonu 684–854 px. Görsel o genişliğe yayılırsa 427 px'e kadar uzar ve bulanıklaşır.
- **Dosya formatı:** PNG'yi ben WebP'ye çeviririm ve 480, 720 ve 960 px genişlikte kopyalarını üretirim.
  - 3 kat yoğunluklu bir telefon (390 px ≈ 1.040 cihaz pikseli) 960'lık dosyayı indirir. Hedefimiz durağan görsel için
    ≈50 KB; bu ancak düz renkli bir tasarımla tutar.
  - Videoyu ben web için H.264 MP4'e çeviririm. Bu Mac'te (macOS 13) Remotion'ın ffmpeg'i çalışmıyor ve sistemde ffmpeg
    yok; bu yüzden AVFoundation ile küçük bir Swift aracı kullanırım (`video/scripts/frames2mp4.swift` gibi), ortalama
    ≈450 kbit/s. Hedef ≈300 KB. H.264 MP4 bütün güncel tarayıcılarda oynuyor; WebM yok.
- **Neden 40 px güvenli alan:** köşe yuvarlaması 280 px'te dosyanın ≈34 px'ini kesiyor.

---

## 3. Alanlar

### 3.1 Yazı içi banner (öncelik 1)

- **Ne zaman:** ≤599 px ekranda (telefon). Daha geniş ekranda CSS ile gizlenir (§4).
- **Nerede:** yazının gövdesinde, bir bölüm başlığının hemen önünde.
  - Üstünde, önceki oyuncunun "Scout Gamer Read" satırı ya da bölümün son paragrafı durur.
  - Altında, sonraki oyuncunun başlığı (`03 …`) gelir.
  - Banner hiçbir zaman bir oyuncunun başlığı ile kartı arasına girmez.
- **Boyutlar:** §2'de. Üstte ve altta 40 px boşluk bırakılır.
- **Yerleştirme kuralı:** banner, aşağıdaki şartların hepsini sağlayan **ilk** başlık bloğunun (section ya da header) önüne
  girer.
  - Önünde en az 2 başlık bloğu var. Listelerde bu bazen 1 oyuncu demek: ball-playing CBs'te banner Huijsen'den sonra,
    Cubarsí'nin önünde (%29), çünkü ilk başlık bloğu "What 'Ball-Playing' Means".
  - Yazının kelimelerinin %25–60'ı bannerdan önce kalıyor.
  - Hemen önündeki blok alıntı (pullquote), kutu (callout) ya da görsel değil.
  - Bir grup başlığını ilk oyuncusundan ayırmıyor. Örneğin İtalya listesindeki "Waiting" başlığı. Gerekirse banner grup
    başlığının önüne geçer.
  - Banner "Quick Reference" (SSS) bölümünden önce kalıyor.
- **Yazı içi banner olmayan durumlar:** yazı 600 kelimeden kısa, 4'ten az başlığı var, kural yer bulamıyor ya da gövde HTML
  veya Markdown. Bu yazılarda sadece yazı sonu bannerı çıkar.
- **Veritabanına dokunulmaz.** Banner sayfa oluşturulurken eklenir; içeriğe yazılmaz. Bölüm numaraları, "In this piece"
  listesi ve bağlantılar değişmez.
- **Kapsam** (blok gövdeli yayındaki yazılar, 17 Kas akşamı): Lists 34/38, Tactics Lab 13/19, Radar 8/19, Transfers 1/8.
  En çok tıklanan 12 sayfanın 12'sinde de uygun yer bulunuyor.

**En çok tıklanan sayfalarda nereye düşüyor** (390 px telefonda):

| Sayfa (3 aylık tık) | Banner nereye giriyor | Önündeki kelime oranı | Kaçıncı ekran |
|---|---|---|---|
| Centre-backs (766) | `03 Dean Huijsen` başlığının önüne (Di Lollo'nun Read satırından sonra) | %28 | 7,6 / ≈26 (yazının sonu; sayfanın tamamı ≈31 ekran) |
| Strikers (465) | `03 Endrick` başlığının önüne | %31 | 6,4 |
| Argentina (326) | `04 Alejo Sarco` başlığının önüne | %51 | 7,2 |
| Germany (138) | `04 Pavlovic` başlığının önüne | %54 | 6,3 |
| Spain (116) | `03 Fer López` başlığının önüne | %37 | 6,0 |
| High-press striker (29, Tactics Lab) | `Athletic Revolution` başlığının önüne | %34 | 10,0 |

- **Neden 2 bölümden sonra:** okur Google'dan bir yazıya gelip çıkıyor. Bu kural, okurun yazıya ısındığı en erken yeri
  seçiyor.
- **Ne kadar okunuyor:** Slate/Chartbeat (2013) verisinde sayfada kalan okurların çoğu yazının ≈%50'sine (Slate) ya da
  ≈%60'ına (diğer siteler) iniyor; ama hemen çıkan ≈%38 bu hesaba dahil değil. Bütün ziyaretçiler için ortanca daha düşük.
  Ekran sayısı ile kelime oranı birbirine çok yakın, çünkü her oyuncu kartı telefonda aynı yükseklikte (695 px).

### 3.2 Yazı sonu bannerı (öncelik 2)

- **Ne zaman:** ≤960 px ekranda (telefon ve tablet). Masaüstünde gizlenir (§4; masaüstü seçenekleri §6).
- **Nerede:** gövdenin son bloğundan hemen sonra.
  - Üstünde, çoğu listede "The verdict" kutusu durur. Bazı listelerde kapanış alıntısı ya da paragrafı.
  - Altında, sonradan yüklenen YouTube videoları gelir. Makalelerde ayrıca LATEST NEWS ve etiket satırı.
  - Eski tip oyuncu listesi olan 5 yazıda (4 liste ve Tactics Lab'deki la-masia yazısının FEATURED PLAYERS bloğu) banner o
    listeden sonra durur.
- **Boyutlar:** yazı içi bannerla aynı. Altta 40 px boşluk.
  - Üstte boşluk: listelerde 0 (gövdenin altında zaten 56 px var). Makale düzeninde (Radar, Tactics Lab, Transfers)
    gövdenin alt boşluğu yok, bu yüzden bannerın üstüne 56 px boşluk konur.
- **Kapsam:** uygun her yazıda var; HTML ve Markdown gövdeli yazılar dahil. Golden Boy oy pusulası ve makbuzu (iki liste
  yazısı) da aynı bannerı kullanır; ayrı tasarım gerekmez.
- **Kimi yakalıyor:** sona kadar okuyan azınlığı. Ama bunlar en ilgili okurlar.
- **Örnek konumlar:** 390 px'te centre-backs sayfası 26.132 px uzunluğunda; banner ≈21.824 px'te. Radar'daki Varela
  yazısında ≈7.561 px'te.

### 3.3 Sağ sütun bannerı (masaüstü)

- **Ne zaman:** sadece ≥961 px ekranda. Daha dar ekranda sağ sütun yazının altına iniyor, orada gizlenir.
- **Nerede:** sağ sütunun ilk öğesi olarak, SHARE kutusunun üstünde. Altında SHARE ile arasında 32 px boşluk var.
  SHARE'ın yerine koymak da bir seçenek (§6).
- **Boyut:** 280 × 140, üstünde 22 px etiket. Boşlukla birlikte blok 194 px.
- **Yapışkan davranış:** sütun zaten yapışkan; banner onunla birlikte sabit kalır.
  - Listelerde ekranın üstünden 88 px, makalelerde 100 px aşağıda durur. Sitenin üst menüsü 69 px.
  - Sayfa ilk açıldığında sütunun üstü 651–795 px'te. 1366 × 768 ve daha küçük ekranlarda bu, ekranın altı ya da kıyısı.
    1440 × 900'de banner ilk ekranda kısmen, 1920 × 1080'de tamamen görünür. Yazı bitene kadar ekranda kalır.
- **Bedeli:** banner sütundaki diğer kutuları aşağı itiyor. Laptop ekranında bir kısmı görünmez oluyor (okurken, ekranın
  altında kesilen px):

  | Ekran | Listeler bugün | Listeler bannerla | Makaleler bugün | Makaleler bannerla |
  |---|---|---|---|---|
  | 1024 × 768 | 84 boş | ≈110 kesik | 166 kesik | ≈360 kesik |
  | 1280 × 720 | 36 boş | ≈158 kesik | 214 kesik | ≈408 kesik |
  | 1366 × 768 | 84 boş | ≈110 kesik | 166 kesik | ≈360 kesik |
  | 1440 × 900 | 216 boş | ≈22 boş | 34 kesik | ≈228 kesik |
  | 1920 × 1080 | 396 boş | ≈202 boş | 146 boş | ≈48 kesik |

- **Ne görünmez oluyor:**
  - Listelerde, 768 px yüksekliğinde ≈110 px kesilir: "← ALL LISTS" linkinin tamamı (boşluğuyla ≈63) ve MORE LISTS
    kutusunun son ≈47 px'i (4. listenin tarih satırı ve kutunun alt boşluğu; başlığı görünür kalıyor).
  - Makalelerde: RELATED kutusunun sonu ve bölüm tanıtım kutusu. Tanıtım kutusu bugün de büyük ölçüde kesik.
  - Linkler HTML'de durduğu için Google'ın tarama yolu değişmez.

### 3.4 Banner olmayan yerler

- **World Cup 2026 arşivi** (`wc-2026`): Dictumus milli takımları kapsamıyor.
- **Yazı olmayan sayfalar:** ana sayfa, bölüm ana sayfaları (`/lists`, `/radar`, `/tactics-lab`, `/transfers`,
  `/articles`), Arena, `/oyuncular`, `/turnuva`, WC kadro ve fikstür sayfaları.
- **İngilizcesi hazır olmayan (bekleyen) yazılar.**

---

## 4. Sıklık ve yapışkanlık

| Ekran | Yazı içi | Yazı sonu | Sağ sütun | Sayfa başına |
|---|---|---|---|---|
| ≤599 (telefon) | ✓ (kural yer bulursa) | ✓ | gizli | en fazla 2 |
| 600–960 (tablet, yatay telefon) | gizli | ✓ | gizli | 1 |
| ≥961 (masaüstü) | gizli | gizli | ✓, yapışkan | 1 |

- **Aynı ekranda iki banner yok:**
  - Telefonda yazı içi bannerdan sonra kelimelerin en az %40'ı geliyor. En kısa uygun yazıda (600 kelime) bu ≈240 kelime,
    yani ≈1,5 telefon ekranı. En çok tıklanan sayfalarda iki banner arası en az ≈4,4 ekran (Germany).
  - Tablette kolon geniş ve ekran uzun; 240 kelime bir ekrandan kısa kalır ve iki banner birlikte görünebilir. Bu yüzden
    600–960 px'te sadece yazı sonu bannerı var.
  - Masaüstünde yapışkan sağ sütun bannerı okuma boyunca ekranda. Yazıya bir banner daha konsaydı ikisi bir an aynı ekranda
    olurdu.
- **Yoğunluk:** Better Ads standardı telefonda reklam yüksekliğinin içeriğin %30'unu geçmesini yasaklıyor. Bizde iki banner,
  centre-backs sayfasının içerik yüksekliğinin ≈%2,4'ü. Google'ın Ad Experience raporu kendi ürünümüzün bannerını genelde reklam saymıyor.
  Yine de AdSense ileride bütün ekranı birlikte değerlendireceği için reklam gibi davranıyoruz.
- **Yapışkanlık:**
  - **Telefonda yok.** Alta yapışan, ekranı kaplayan, açılır pencere olan hiçbir şey yok.
  - **Masaüstünde sadece sağ sütun.** 280 × 162 px (etiket dahil), 1024 × 768 ekranın ≈%6'sı. Better Ads'in "büyük yapışkan
    reklam" eşiği %30.
- **Sayfa kayması (CLS) yok:**
  - Bannerların yeri ilk HTML'de ayrılır: görselin genişliği ve yüksekliği ile 2:1 oranı baştan bellidir.
  - Görseller `loading="lazy"` ile yüklenir. Telefonda hiçbiri ilk ekranda değil. 900 px ve daha yüksek masaüstü
    ekranlarda sağ sütun bannerı ilk ekranda olabilir; lazy orada küçük bir gecikme demek, yeri ayrıldığı için kayma olmaz.
    Sağ sütun görselini yine de lazy bırakıyorum: lazy olmayan görsel, gizli olsa bile telefona indirilir.
  - Gizli bannerın telefona indirilmediğini §7'de kontrol ederim.
- **Hareket nasıl çalışır:**
  - Ham HTML'de her zaman durağan görsel var. Google, JavaScript'siz okur ve sayfanın ilk yüklenişi bu görseli görür.
  - Banner ekrana ≈1 ekran kala video indirilir; yarısı ekrana girince bir kez oynar ve durağan kareyle biter. Video, durağan
    görselin üstünde aynı ölçüde durur, bu yüzden kayma olmaz.
  - Cihazında "hareketi azalt" açık olan okur sadece durağan görseli görür; video hiç inmez. Veri tasarrufu yalnızca Chrome,
    Edge ve Samsung Internet'te okunabiliyor (`navigator.connection.saveData`); iPhone'un Düşük Veri Modu sayfaya
    görünmüyor, orada video iner.
  - iPhone Düşük Güç Modu'nda tarayıcı oynatmayı reddedebilir; o zaman durağan görsel kalır.
  - Better Ads telefonda yalnızca yanıp sönen animasyonu yasaklıyor; sakin hareket serbest. 5 sn'yi geçmediği ve bir kez
    oynadığı için durdurma düğmesi gerekmiyor (WCAG 2.2.2; ekrana kaydırınca başlaması da "kendiliğinden başlama" sayılıyor).

---

## 5. Test ve ölçüm

**UTM etiketleri** (`utm_source`, `utm_medium`, `utm_campaign` rafa kaldırılan `lib/dictumus.ts`'ten; `utm_content` değerleri
ve `utm_term` yeni, §7 adım 1'de eklenir): `utm_source=scoutgamer`, `utm_medium=referral`,
`utm_campaign=scoutgamer_promo`, `utm_content=in-content` | `article-end` | `sidebar`, `utm_term=<yazının slug'ı>` (hangi
yazının işe yaradığını görmek için). Örnek:
`https://app.dictumus.com/?utm_source=scoutgamer&utm_medium=referral&utm_campaign=scoutgamer_promo&utm_content=in-content&utm_term=the-best-young-centre-backs-in-world-football-right-now`

**Ne ile ölçüyoruz:**

| Kaynak | Ne verir | Kod gerekir mi | Not |
|---|---|---|---|
| Dictumus'un kendi analitiği (UTM) | Alan ve yazı bazında ziyaret ve kayıt | hayır | **Ana kaynak** |
| GA4 "Outbound clicks" | Banner tıkları; alan, `link_url`'deki `utm_content` ile ayrılır | hayır | GA4 → Admin → Data streams → Enhanced measurement → Outbound clicks açık mı, kontrol et (varsayılan açık) |
| GA4 sayfa görüntüleme | Bannerlı sayfaların görüntülenmesi: oranın paydası | hayır | Bannerın görülüp görülmediği ölçülmüyor; görünme olayı yok |

Vercel Analytics'in özel olayları Hobby planda yok; ilk testte kullanmıyoruz.

**Süre:** canlıya çıktıktan sonra **8 hafta** (≈ocak ortası). 4. haftada ara kontrol yaparım: tıklar geliyor mu, UTM'ler
doğru mu? Test boyunca görsel ve konumlar değişmez, başka yeni tanıtım eklenmez.

**Sınırlar:**
- **Trafik:** Google'dan günde ≈25 ziyaret geliyor (3 ayda 2.293 tık). Bunun ≈19'u telefon, ≈5,5'i masaüstü. 8 haftada bu
  ≈1.400 ziyaret eder. Gerçek sayıyı GA4'teki görüntülemelerle güncellerim.
- **Örnek hesap (varsayım, kaynak yok):** tıklama oranı %0,5 olursa 8 haftada toplam ≈7 tık gelir; alan başına 2–3.
- **Bu yüzden karar alan bazında değil, toplam üzerinden verilir.** Alan bazındaki sayılar (1.000 görüntülemede tık ve
  kayıt) sadece bilgi içindir.

**Sonuç → karar** (8. hafta: toplam tık ve `utm_source=scoutgamer` ile gelen Dictumus kayıtları):

| 8. haftada | Karar |
|---|---|
| ≥1 kayıt ya da ≥10 tık | Bannerlar kalır ve genişletilir |
| 0 kayıt, 5–9 tık | Test 12 haftaya uzar |
| 0 kayıt, <5 tık | Durur. Ayrı sayfa ve menü de büyük ihtimalle işlemez. Golden Boy gibi tahmin yazılarında yazının içinde anmayı deneriz |

- Eşikler benim; bir kaynağa dayanmıyor.
- Tık gelir ama kayıt gelmezse, rafa kaldırılan `/dictumus` sayfasını bannerın hedefi yapmak bir seçenek.

---

## 6. Senden beklenen kararlar

- [ ] **Banner**: durağan PNG + en fazla 5 sn'lik MP4 + yazı listesi + kaynak dosya (tasarım kartı; tam şartname
  BANNER-BRIEF.md).
- [ ] (isteğe bağlı) **Başlık ve buton yazısı:** seçmezsen tasarımcı BANNER-BRIEF'teki önerilerden birini kullanır.
- [x] **Masaüstü: (a) sağ sütun, SHARE'ın üstünde** (sahip, 17 Kas gece). Sorduğun yer sağ sütun. Masaüstü 8 haftada ≈300 ziyaret, yani ≈1–2 tık; bu alan testte az şey söyler.
  - (a) sağ sütun, SHARE'ın üstünde (önerim; maliyeti §3.3),
  - (b) sağ sütun, SHARE'ın yerine: net ≈+60 px, 1366 × 768 listelerde kesik kalmaz. Bugünkü Copy Link kutusu kalkar; sadece
    seçenek olarak sunuyorum,
  - (c) sadece yazı sonu: sütun değişmez.
  - Masaüstünde yazı sonu ya da yazı içi seçersen aynı görsel 480 × 240 olarak ortalı gösterilir; ek tasarım gerekmez.
- [ ] **Fiyat mesajı:** bannerda olmasın (önerim, §1.2). İstersen eklenir, ama ilk ligin ikinci yarısı başladığı gün (Avrupa
  ligleri ≈ocak başı) bannerı değiştirmemiz gerekir; o yüzden kaynak dosya lazım.
- [ ] **Hedef:** web app (önerim). Alternatifi dictumus.com tanıtım sitesi.
- [ ] (isteğe bağlı) `utm_medium=referral` yerine `banner`. Seçersen Dictumus analitiğinde bannerlar ayrı kanal olarak
  görünür.
- [ ] **Vercel planı: Hobby** (sahip, 17 Kas gece). Vercel'in koşulları: "You shall only use the Services under a Hobby plan
  for your personal or non-commercial use." Paket satan bir uygulamanın tanıtımı büyük ihtimalle ticari sayılır; risk,
  sitenin (SEO varlığının) kısıtlanması. Önerim: bannerlar canlıya çıkmadan Pro'ya geçmek (kişi başı ≈20 $/ay; özel
  olaylarla tık ölçümü de açılır; AdSense planı için de gerekli).
  - **Önerim (17 Kas gece, sahibin sorusu üzerine; onay bekliyor):** Dictumus ocak–şubata kadar ücret almıyor; test
    Hobby'de başlayabilir. Ücretli paketler açılmadan (ya da AdSense'ten önce) Pro'ya geçilir.
- [ ] GA4'te Outbound clicks açık mı?
- [ ] **Test süresi:** 8 hafta uygun mu?

---

## 7. Uygulama ve test (ek, görseller gelince)

1. **Rafa kaldırılan koddan (git stash) sadece `lib/dictumus.ts`'i geri al:**
   `git show 'stash@{0}^3:lib/dictumus.ts' > lib/dictumus.ts`.
   - `git stash pop` ya da patch kullanılmaz; ikisi de menü, alt bilgi, sayfa ve sitemap'i geri getirir.
   - Stash yerinde kalır.
   - Bu dosyaya üç banner alanını eklerim ve bannerın çıkmayacağı bölüm/yazı listelerinin (`NO_CARD_CATEGORIES`,
     `NO_CARD_SLUGS`) adını değiştiririm.
2. **`lib/in-content-slot.ts`:** §3.1'deki yerleştirme kuralı. Saf bir fonksiyon; içeriğe dokunmaz.
3. **`app/components/dictumus-slot.tsx`:** sunucu bileşeni (`"use client"` yok); durağan görsel, etiket ve link ham HTML'de.
   - Dosya, bileşen ve sınıf adlarında (`dx-slot`) ad, banner, promo, sponsor geçmez; reklam engelleyici listeleri bu
     adları hedefliyor.
   - Kapsayıcı `<aside aria-label="Promotion: Dictumus, from the makers of Scout Gamer">`.
   - Etiket bir `<span>` ya da `<div>` olur ve `data-nosnippet` taşır (Google bu özelliği yalnızca span, div ve section'da
     dikkate alıyor). Satır yüksekliği 14 px.
   - Görselin genişliği, yüksekliği ve 2:1 oranı baştan bellidir. Görsel `lazy` yüklenir. En fazla 480 px genişlikte durur.
   - Görsel ve video aynı kutuda: kapsayıcı `position: relative; aspect-ratio: 2 / 1; border-radius: 10px; overflow: hidden;
     isolation: isolate`; video `position: absolute; inset: 0; width: 100%; height: 100%; border-radius: inherit`. Video
     yer kaplamaz (kayma yok) ve Safari'de köşeden taşmaz.
   - Hareket için küçük bir istemci bileşeni (`dictumus-motion.tsx`). Durağan `<img>`'i o çizmez; tarayıcı tercihlerini
     yalnızca `useEffect` içinde okur.
     - Sunucu HTML'inde `<video>` `src`'siz gelir; `autoplay`, `loop`, `controls`, `poster` yok.
     - Banner ekrana ≈1 ekran kala (IntersectionObserver, `rootMargin: "100% 0px"`) `src` verilir, `preload="auto"` yapılır,
       `load()` çağrılır. Yarısı görününce (`threshold: 0.5`) bir kez `play()`.
     - `prefers-reduced-motion: reduce` eşleşirse ya da `navigator.connection?.saveData === true` ise hiçbir şey yapmaz
       (src hiç verilmez).
     - `muted`'a JSX'te güvenilmez (facebook/react#10389): `play()`'den önce ref ile `video.muted = true;
       video.defaultMuted = true;`. JSX'te `playsInline`.
     - Video `playing` olayına kadar `opacity: 0` kalır, `ended`'da gizlenir. `play()` reddedilirse (iOS Düşük Güç Modu) ya
       da oynatma yarıda kalırsa (banner %50'nin altına iner, `pause`/`stalled`) video gizlenir, durağan görsel kalır ve
       tekrar denenmez.
     - Video `aria-hidden="true"`, `tabIndex={-1}` ve `pointer-events: none` taşır; tık linke gider, alt metni görsel taşır.
   - `.article-v2 a` ve `.article-v2 img` stilleri bannerı etkiler; bunları ezerim.
4. **Bileşeni yerleştir:**
   - Gövdeyi çizen `SectionsJsonBody`'ye yazı içi alanı eklerim.
   - `ListLayout` ve `ArticleLayoutEn` içine üç alanı koyarım.
   - Ekran genişliğine göre gizleme (§4) CSS ile yapılır: yazı içi ≤599, yazı sonu ≤960, sağ sütun ≥961. WC 2026 ve bekleyen
     yazılar dışarıda kalır.
5. **Görselleri hazırla:** `scripts/dictumus-banners.mjs` (sharp) 480, 720 ve 960 genişlikte WebP'leri ve bir JPG yedeği
   üretir. Video bir Swift aracıyla (AVFoundation) H.264 MP4'e çevrilir (≈450 kbit/s, BT.709 etiketli). İlk ve son kare
   AVFoundation ile çıkarılıp sharp ile PNG'ye toleransla karşılaştırılır: her kanalda ortalama fark ≤2 (8 bit), düz
   zeminde ≤1. Dosyalar `public/dictumus/2026-11/` altına `dictumus-960.webp`, `dictumus-960.mp4` gibi adlarla gider.
6. **Kontrol:**
   - `next build && next start -p 3001` ile yerel production sunucusu açarım. `next dev` ile kontrol etmem.
   - Googlebot gibi `curl` ile sayfayı çekerim. Üç `data-slot` HTML'de olmalı. Centre-backs'te yazı içi banner
     `03 Dean Huijsen`'in önünde olmalı.
   - `node scripts/seo-check.mjs http://localhost:3001` çalıştırırım. Sayılar değişmemeli; Dictumus linkleri sayılmıyor.
   - Tarayıcıda 360, 390, 768, 1024, 1366 ve 1440 px'te bakarım:
     - sayfa kayması yok;
     - 280 ve 320 px'te yazılar ≥14 px, videonun ortasındaki karelerde de;
     - her genişlikte sadece izin verilen bannerlar görünüyor;
     - 390 px'te Network sekmesinde sağ sütun görseli ve gizli alanların videoları indirilmiyor;
     - uBlock Origin açıkken alanlar görünüyor;
     - video ekrana yaklaşmadan inmiyor, yarısı görününce bir kez oynuyor ve durağan kareyle bitiyor;
     - "hareketi azalt" açıkken sadece durağan görsel var;
     - Chrome ve Safari'de video başlarken ve biterken zeminde ton sıçraması yok;
     - iPhone'da Düşük Güç Modu açıkken oynatma düğmesi çıkmıyor, durağan görsel kalıyor;
     - oynarken banner ekrandan çıkarılınca durağan görsele dönüyor.
7. **Canlıya alma:** önce sen yerelde bakıp onaylarsın. Onaydan sonra `bash scripts/deploy.sh` ile deploy, ardından canlı
   kontrol. Testin 0. günü not edilir. Onayın olmadan commit, push ya da deploy yapılmaz.

---

## Ek: Neden böyle

- **Neden tek tasarım:** ilk taslakta üç tasarım vardı: telefon yatay, geniş yatay ve sağ sütun dikey.
  - **Dikey sağ sütun bannerı:** sütunun altına konursa laptopta hiç görünmüyor. Üstüne konursa MORE LISTS kutusunu ekran
    dışına itiyor. 1366 × 768'de 280 × 350 bannerla kutunun sadece ≈142 px'i görünüyor (başlığı ve ≈1 liste), 280 × 280
    ile ≈212 px'i. 2:1 (280 × 140) bannerla kutunun son ≈47 px'i ve altındaki ALL LISTS linki kesiliyor.
  - **Geniş tasarım:** masaüstünde yazı içi ya da yazı sonu seçilirse aynı 2:1 görsel 480 × 240 ortalı kullanılır; ikinci
    dosyaya gerek yok.
  - **Neden 2:1:** zorunlu üç bilgi 280 px'te 14 px'lik yazıyla, tasarım kartındaki yerleşimle bu oranda sığıyor.
- **Neden kelime oranına dayalı kural:** daha basit bir kural, "blokların %35'inden sonraki ilk başlık", en çok tıklanan 12
  sayfanın beşinde bannerı bir alıntı ya da kutunun hemen arkasına koyuyor: centre-backs, Argentina, Germany, France ve
  ball-playing CBs. Bu beş sayfa top 12 tıklarının ≈%64'ü. İtalya'da ise bannerı "Waiting" grup başlığı ile ilk oyuncusu
  arasına koyuyor. §3.1'deki kural 12 sayfanın 12'sinde temiz bir yer buluyor.
- **Neden masaüstünde sağ sütun ile yazı sonu birlikte değil:** okur yazı sonuna geldiğinde sağ sütun hâlâ yapışkan ve
  ekranda. Bu, iki bannerın aynı ekranda görünmesi demek.
