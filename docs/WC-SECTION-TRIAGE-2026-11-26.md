# World Cup 2026 bölümü: kapatma listesi (26 Kasım 2026)

**Durum:** salt-okunur analiz. Bu belge dışında hiçbir şey değişmedi: veritabanına yazılmadı, kod değişmedi, deploy yapılmadı.
**Kaynaklar:** Supabase `contents` (142 satırın hepsi, 26 Kasım), beş GSC dönemi (son 3 ay = 16 Ağu–15 Kas; son 28 gün = 19 Eki–15 Kas; ayrıca 22 Haz–19 Tem, 19 Tem–15 Ağu, 15 Ağu–11 Eyl), 26 Kasım'da Googlebot UA ile yapılan canlı tarama (300 URL, yönlendirme izlenmeden), football-data.org'daki WC 2026 maç sonuçları. Ham envanter: `/private/tmp/claude-501/-Users-ozgunozsoy-futbol-pano/d81f0a43-1eb5-4035-aaa3-f7b9a7f47c5d/scratchpad/wc-inventory.json`.
**Kural:** genç yetenek yazısıysa tutulur ya da aynı niyete cevap veren kalıcı sayfaya 301'lenir. Yalnızca turnuvaya bağlı sayfa 410 olur. Hub 301'lenir.

---

## 1) Özet

| Karar | URL | Son 3 ay tık / gösterim | Son 28 gün tık / gösterim |
|---|---:|---:|---:|
| **Tut** (3 yazı; biri /lists'e taşınıyor) | 3 | 0 / 58 | 0 / 20 |
| **301** (hub + 11 yazı; biri 25 Kasım'da zaten yapıldı) | 12 | 1 / 174 | 0 / 80 |
| **410** (48 yazı + 2 indeks + 96 takım sayfası + 2 arena oyunu + 2 OG görsel rotası) | 150 | 7 / 4,023 | 1 / 1,662 |
| **Toplam** | **165** | **8 / 4,255** | **1 / 1,762** |

- Referans olarak listede duran bir sayfa daha var: Argentina's Best Young Players: The Wonderkids Carrying the Next Generation (44). Dokunulmuyor, yalnızca içindeki 3 link değişiyor. Envanterin tamamı böylece 166 URL.
- **Ortadaki trafik:** son 3 ayda tüm WC sayfaları sitenin 2,609 tıkının 8'ini (%0.3) ve 148,692 gösteriminin 4,255'ini (%2.9) aldı. Yalnızca `/world-cup-2026/*` altı 8 / 4,095.
- **410'a giden gösterimin %94'ü (3,795) 48 takım kadro sayfasından geliyor.** Bu sayfalar bölümde gösterimi hâlâ artan tek küme (aşağıda ve 7. bölümde).
- 410'a giden 48 yazının toplamı son 3 ayda 3 tık / 131 gösterim, son 28 günde 0 / 3.
- Ayrıca 46 eski takma ad yönlendirmesi var (38 Türkçe kadro slug'ı, `/kadrolar/*`, `/dunya-kupasi-2026/*`, `/en/world-cup-2026/*` ve diğerleri). Bunlar ayrı URL olarak sayılmadı; hepsi tek adımda 410'a ya da hub'ın hedefine gidiyor.

### Eleştiri turunda değişenler

1. **Hub'ın hedefi değişti:** `/lists` yerine Proof, Not Projection'ın yeni adresi. `/lists` dizininde World Cup içeriği yok, bu yüzden niyet örtüşmüyor. Proof ise bölümden kalan tek WC başlıklı sayfa. `/dunya-kupasi-2026` ve `/en/world-cup-2026` de aynı hedefe gidiyor. Son karar sizde (7. bölüm, 4. madde).
2. **Argentina's Rising Stars: Why Nico Paz and Thiago Almada… (116):** hedef Nico Paz profili (148) değil, Argentina's Next Messi (131). İki oyuncuyu da ve "Arjantin'in Messi sonrası yaratıcıları" çerçevesini kapsayan tek sayfa 131. 148'de Almada geçmiyor.
3. **Brazil's Attack is Unstoppable: Endrick… (81):** hedef Brezilya pillar'ı (135) değil, The Best Young Strikers in World Football Right Now (145). 145'teki Endrick bölümü aynı hikâyeyi anlatıyor: Lyon kiralığı ve elit forvet olup olmadığı sorusu. Google bu bölümü Endrick aramalarıyla zaten eşleştiriyor; yalnızca o fragment son 3 ayda 1,654 gösterim aldı.
4. **Hidden Gems Set to Shine at Tournament World Cup 2026 (94):** 410 değil, Proof'a 301. Tutarlılık için: turnuva öncesi yazılan "Dünya Kupası'nda izlenecek gençler" yazılarının hepsi turnuva sonrası hükme, yani Proof'a toplanıyor. Haziran'da bu yazı için bir sosyal medya kartı da yapılmış.
5. **Bölüm dışındaki 7 WC yazısı kapsama alındı.** Uygulama planı bunları "ayrı karar" diye dışarıda bırakmıştı. Bunlar /lists ve /radar altında: 5'i Proof'a 301, 2'si 410. 410'lar proxy'ye tam yol olarak ekleniyor. Bunlara 54 numaralı yazının eski takma adı `/lists/world-cup-2026-scouting-4-debutants-analysis` da dahil.
6. **Proof, Not Projection'da iki olgu hatası bulundu.** Bu sayfa 10'dan fazla yönlendirmenin hedefi olacağı için önemli:
   - Metin ve bilgi kutusu, Yamal için "Uruguay'a karşı bir eleme maçında belirleyici" diyor. Oysa Uruguay 0-1 İspanya 27 Haziran'da oynanan üçüncü grup maçıydı. İspanya'nın eleme turu rakipleri Avusturya, Portekiz, Belçika, Fransa ve Arjantin'di.
   - Metin, O'Reilly için "İngiltere'nin altı grup ve eleme maçının beşinde ilk 11'de, tüm eleme maçları dahil" diyor. İngiltere 8 maç oynadı (3 grup + 5 eleme), yani cümle kendi içinde tutarsız.
   - İkisi de A adımında `--minor` ile düzeltilecek. Önce `scripts/highlightly.mjs` ile doğrulanmalı.
7. **Düzeltildi:** Messi yazısı ile Proof arasında "çelişki" yok. Üçüncülük maçı Fransa 4-6 İngiltere bitti, Mbappé'nin iki golü bu skorla uyumlu.
8. **Kadro sayfalarının kararı 410 olarak kaldı ama artık onayınıza bağlı.** 28 günlük gösterimleri sırasıyla 46 → 699 → 1,143 → 1,639 diye artıyor. Sorgular tam olarak sayfanın niyeti ("argentina world cup squad" gibi). Ancak ortalama sıra 30–50 ve 3 ayda yalnızca 4 tık var.

---

## 2) Tutulanlar

| Başlık | URL (bugün → sonra) | Neden | Yeniden kategorileme |
|---|---|---|---|
| Proof, Not Projection: The Young Players Who Delivered at the 2026 World Cup (140) | `/world-cup-2026/proof-not-projection-2026-world-cup-breakout-young-players` → `/lists/proof-not-projection-2026-world-cup-breakout-young-players` (slug aynı) | Turnuva sonrası yazılmış bir genç yetenek hükmü: Gilberto Mora, Lamine Yamal, Pau Cubarsí, Ayyoub Bouaddi, Désiré Doué, Nico O'Reilly, Ibrahim Mbaye. Çekirdek Arjantin listesinden link alan tek WC yazısı. Kalıcı iki listeye link veriyor. Son 3 ayda 42 gösterim aldı. Bu turda 10 yazının ve hub'ın toplandığı hedef. | Kategori `wc-2026` → `lists`, accent emerald. `news_query`, `youtube_query_1` ve `youtube_query_2` temizlenecek, yoksa lists şablonu "VIDEO · LAMINE YAMAL 2026 WORLD CUP SPAIN" şeridini açar. `hub_tags` boşalır. Messi yazısına giden link düz metne çevrilir. 1. bölümdeki iki olgu düzeltilir. "Significant update" işaretlenmez. |
| Brazil Got 4.4 Years Younger: Inside the First Squads After the World Cup (156) | `/tactics-lab/brazil-got-4-4-years-younger-inside-the-first-squads-after-the-world-cup` (değişmiyor) | Turnuva sonrası genç kadro verisi: Brezilya kadrosu 4.4 yaş gençleşti, Cavan Sullivan 16 yaşında, Rio Ngumoha. Dünya Kupası yalnızca çıkış noktası. Brezilya pillar'ı (135) bu yazıya link veriyor. Gösterimi artıyor: son 28 günde 14, toplam 16 (yazı 20 Eylül'de yayına girdi). | Yok |
| Barcelona's Egyptian Gamble: Why This World Cup Striker Could Reshape Their Attack (97) | `/transfers/barcelona-egypt-striker-world-cup-prospect` (değişmiyor) | Hamza Abdelkarim'in (18, Al Ahly → Barcelona) genç yetenek transfer yazısı. Oyuncu football-data'ya göre Mısır'ın WC kadrosunda. Dünya Kupası yalnızca çerçeve, URL zaten /transfers altında. | Yok. İleride başlıktan "World Cup" kaldırılabilir, slug aynı kalır. Bu canlı yazı düzenlemesi olduğu için onayınız gerekir. Bu tur kapsamında değil. |
| *(Referans)* Argentina's Best Young Players: The Wonderkids Carrying the Next Generation (44) | `/lists/argentina-s-best-young-players-the-wonderkids-carrying-the-next-generation` (değişmiyor) | Turnuva sırasında gerçek "WC" trafiğini çeken tek sayfa. Son 3 ayda 333 tık / 18,339 gösterim. | Yok. Yalnızca 3 link değişiyor (5. bölüm, A adımı). Eski adreslerinin yönlendirmeleri korunuyor: `/lists/argentina-under-20-players-2026-world-cup` ve `/lists/arjantin-20-yas-alti-oyuncular-2026-liste`. |

---

## 3) Yönlendirilenler (301)

Next'te `permanent: true` 308 döner. Google 308'i 301 gibi kalıcı sayar ve buradaki mevcut kuralların hepsi 308. Her yönlendirme tek adım; zincir yok.

| Kaynak | → Hedef | Niyet neden örtüşüyor | Son 3 ay (t / g) |
|---|---|---|---:|
| WC 2026 hub'ı `/world-cup-2026`, ayrıca `/dunya-kupasi-2026` ve `/en/world-cup-2026` | Proof, Not Projection (140), `/lists/proof-…` | "World Cup 2026" arayan kişiye bölümden kalan tek WC başlıklı sayfayı gösteriyor ve bu sayfa sitenin genç yetenek odağıyla uyumlu. `/lists` dizininde WC içeriği yok; o hedef soft-404 riski taşır. | 1 / 30 |
| Proof'un eski adresi `/world-cup-2026/proof-…` | Proof'un yeni adresi `/lists/proof-…` | Aynı sayfa, yalnızca kategorisi değişiyor. | 0 / 42 |
| Beyond Endrick and Yamal: The Underrated Teenagers Changing the World Cup Narrative in Real Time (129) | Proof (140) | Aynı niyet: 2026 Dünya Kupası'nda öne çıkan gençler. Turnuva ortasında yazıldığı için ara rapor niteliğinde; Proof turnuva sonunda Mora ve Bouaddi hakkında son hükmü veriyor. Arjantin listesindeki link de doğrudan Proof'a çevriliyor. | 0 / 0 |
| Six Young Talents Who Already Stole the Show in World Cup Round 1 (121) | Proof (140) | İlk tur anlık görüntüsü. Bouaddi ve Mbaye hakkındaki son hüküm Proof'ta. | 0 / 0 |
| Hidden Gems Set to Shine at Tournament World Cup 2026 (94) | Proof (140) | Turnuva öncesi "izlenecek gençler" listesi (Ibrahim Maza, Yan Diomande, Hamza Abdelkarim, Luka Vušković, Kendry Páez, Mora, Bouaddi). Proof aynı konunun turnuva sonrası hükmü. Haziran'dan kalan bir sosyal kartı var. | 0 / 0 |
| World Cup Dreams: The 10 Most Promising Stars Set for Their Global Debut (48) | Proof (140) | Turnuvadaki gençlerin ilk Dünya Kupası listesi. Proof, Yamal ve Cubarsí hakkındaki hükmü veriyor. Bu sayfa bölümde gösterimi artan tek yazı: 28 günlük gösterimi 35'ten 62'ye çıktı, hiç tıklanmadı, ortalama sıra yaklaşık 18. Yedek hedef: The Next Generation: 15 U-21 Prospects Set to Dominate Europe's Top Leagues (124); 10 oyuncunun 6'sı orada da var. | 0 / 118 |
| The 2026 Scouting Report: 10 High-Ceiling Prospects Set to Define the World Cup (53) | Proof (140) | Proof'la beş oyuncu ortak: Yamal, Cubarsí, Mbaye, Mora, Doué. Niyet aynı, Proof turnuva sonrası hali. | 0 / 16 |
| The Generational Shift: Top 10 Wonderkids to Watch at the 2026 World Cup (64) | Proof (140) | "Dünya Kupası'nda izlenecek wonderkid'ler" listesi; ince bir içerik. Niyet Proof ile aynı. | 0 / 0 |
| Rising Stars Every Scout Should Monitor at the World Cup (82), /radar | Proof (140) | Turnuva öncesi radar yazısı. Proof, Yamal, Mora ve Mbaye hakkındaki hükmü veriyor. Haziran'dan kalan bir sosyal kartı var. | 0 / 0 |
| Young Talents to Watch for 2026 World Cup (106) | Proof (140) | Aynı "2026'da izlenecek gençler" niyeti. Oyuncu örtüşmesi zayıf (yalnızca Cubarsí) ama arama niyeti aynı. Hiç sinyali olmadığından en kötü durumda 410 ile aynı sonucu verir. | 0 / 0 |
| Argentina's Rising Stars: Why Nico Paz and Thiago Almada Could Define the World Cup Campaign (116) | Argentina's Next Messi: The Real Contenders to Inherit the No. 10 (131), /radar | 131 iki oyuncuyu da ve Arjantin çerçevesini kapsıyor: Nico Paz'ı "the purest No. 10" diye anıyor, hükümde Almada'yı da sayıyor. Canlıda 200. | 0 / 0 |
| Brazil's Attack is Unstoppable: Endrick Proves He Belongs Among the Elite (81) | The Best Young Strikers in World Football Right Now (145) | 145'in Endrick bölümü ("Proved It on Loan, Came Back to Fight for Scraps") aynı hikâyeyi anlatıyor: Lyon kiralığı ve elit forvet tartışması. Canlıda 200. İkinci seçenek Brezilya pillar'ı (135). | 0 / 0 |
| Is Brazil's Future Secure? 2026 World Cup (46) | Brazil's Best Young Players: The Wonderkids and the Deep Cuts to Watch (135) | **25 Kasım'da yapıldı** (commit a7e170d, satır reddedildi). Yapılacak bir şey yok. | 0 / 10 |

---

## 4) Kapatılanlar (410)

Toplam **150 URL**. Son 3 ayda **7 tık / 4,023 gösterim**, son 28 günde 1 / 1,662.

### 4a) Maç önizlemeleri ve tur değerlendirmeleri: 14 yazı, son 3 ay 0 / 0

Hepsi oynanmış maçlara ait. Haziran–Temmuz'da yalnızca Argentina vs Austria 53 gösterim aldı, sonra sıfıra düştü. Bölüm dışından link alan yok.

- Argentina vs Austria: Tactical Breakdown and Squad Analysis for World Cup 2026 (125)
- Australia vs Turkey World Cup Showdown: Tactical Breakdown and Squad Preview (105)
- Brazil vs Morocco World Cup 2026: Tactical Battle Between Seleção's Flair and African Defensive Resilience (103)
- Group F Battleground: Sweden vs Tunisia Determines Fate Against Netherlands and Japan (109)
- Haiti's David vs Goliath Moment: Can the Underdogs Shock Scotland in World Cup Must-Win? (104)
- Mbappé, Dembélé and Olise vs Senegal's Defensive Line: World Cup Attacking Showdown (114)
- Mexico vs South Africa: The complete group stage battle preview and predicted lineups (89). Mora yalnızca geçerken anılıyor; onu Proof kapsıyor.
- Qatar vs Switzerland: Group Stage Decider Analysis and Tactical Breakdown (101)
- South Korea vs Czechia: Which Players Can Secure Their Next Big Transfer (91)
- Euro Champions Spain Face Cape Verde's Historic World Cup Debut in Atlanta Showdown (110)
- Türkiye's Midfield Dominance vs Paraguay's Counter-Attack Threat: Who Controls Possession? (123)
- USA vs Australia World Cup 2026: Tactical Breakdown & Key Battles (122)
- USA vs Paraguay: Head-to-Head Stats, Form, and Why This Match Defines Group Destiny (100)
- Star Players Who Shined in Round One – Breakout Performances That Define the Tournament (120). Başlıkta "breakout" geçiyor ama konu yerleşik yıldızlar (Messi, Mbappé, Haaland); genç yetenek yazısı değil.

### 4b) Kadrolar: 68 URL, son 3 ay 4 tık / 3,850 gösterim (son 28 gün 1 / 1,656)

- **48 takım kadro sayfası** (`/world-cup-2026/squads/<takım>`): 4 / 3,795. 28 günlük gösterim 46 → 699 → 1,143 → 1,639 diye artıyor. En çok gösterim alanlar: Argentina 783 (ort. sıra 39.5), Uzbekistan 360 (sıra 11.7, bölümdeki 4 tıktan 1'i), Germany 313 (sıra 51.5), France 308, New Zealand 288. Sorgular sayfanın niyetiyle aynı ("argentina world cup squad", "uzbekistan national football team players 2026") ama tıklama oranı yaklaşık %0.1. Sayfaların içeriği turnuvada donmuş kadrolar; Kasım'daki milli takım kadrolarını göstermiyor. Bu yüzden 410. Onay için 7. bölüm.
- **Kadro indeksi** `/world-cup-2026/squads`: 0 / 33.
- **19 kadro ve takım önizlemesi yazısı** (toplam 0 / 22):
  - Scaloni's Solution to Argentina's Left-Flank Isolation and Rest-Defense Geometry (66)
  - Popovic's High-Intensity Gamble: The Physical Matrix Driving the New Socceroos Era (73)
  - Austria's World Cup 2026 Squad Will Surprise Everyone — Here's Why (87). Carney Chukwuemeka ve Paul Wanner'ın milli takım değişikliği yazının kancası, ama bir kadro önizlemesi; scouting profili değil.
  - Ancelotti's Samba Matrix: Decoding Neymar's Functional Role in Brazil's 2026 World Cup Roster (59)
  - Lorenzo's Tactical Continuity: Analyzing Colombia's Official 2026 World Cup Roster (61)
  - The Art of the Reveal: England's 2026 World Cup Squad Announcement (56)
  - Tuchel's Pragmatic Revolution: Deconstructing England's Shock 2026 World Cup Squad (57)
  - Official Ghana 2026 World Cup Roster: Black Stars Prioritize Explosive Transition Volume (76)
  - Ghana's World Cup Squad 2026: Can Iñaki Williams' Switch Transform Their Tournament? (118)
  - Lozano's Generational Cleansing: The Strategic Shift Behind Mexico's New Identity (71)
  - The Frimpong Omission: Decoding Ronald Koeman's Rigid Defensive Blueprint for the Netherlands (65)
  - Panama's 2026 World Cup Squad: Young Talents Ready to Challenge the Elite (117). Başlıkta "young talents" geçiyor ama 21 yaş altı tek oyuncu profillenmiyor.
  - Alfaro's Pragmatic Low-Block: The Tactical Choreography Behind La Albirroja's Resurgence (72)
  - The Real Madrid Exclusion: Tactical Deconstruction of Spain's Official 2026 World Cup Roster (62). Cubarsí'yi genç stoper listeleri zaten kapsıyor.
  - Official Turkey 2026 World Cup Roster: Montella Opts for Extreme Flank Dynamism (75). Turkey's Best Young Footballers (170) farklı bir niyete cevap veriyor; 301 gevşek kalır.
  - Bielsa's Vertical Chaos: Decoding Uruguay's High-Intensity 2026 World Cup Pressing Blueprint (70)
  - Pochettino's Host Matrix: Deconstructing the USMNT Official 2026 World Cup Roster (63)
  - All 48 World Cup Squads Ranked: Which Teams Have the Strongest Starting XI (78)
  - DR Congo's World Cup Group: Can They Qualify From Hell's Bracket? (119)

### 4c) Fikstür: 50 URL, son 3 ay 0 / 64

- **Fikstür indeksi** `/world-cup-2026/schedule`: 0 / 64. Temmuz'da 111 gösterim aldı, sonra düştü; ortalama sıra 51.
- **48 takım fikstür sayfası** (`/world-cup-2026/schedule/<takım>`): son 3 ayda 0 / 0.
- **1 yazı:** When Does the World Cup 2026 Kick Off? Opening Match & Ceremony Schedule Revealed (98).

### 4d) Diğer: 18 URL, son 3 ay 3 tık / 109 gösterim

Bölüm içindeki 12 yazı:
- 2026 World Cup: 48-Team Format Explained (47)
- Adidas Trionda Tech Analysis: 2026 World Cup Ball (50): 0 / 4
- The World Cup's 4 New Actors: A Scouting Report (54): 0 / 2. Konusu oyuncular değil, ilk kez katılan ülkeler.
- The Panini Index: Analyzing the Data and Economy of World Cup 2026 Collectibles (60): 2 / 47 ve düşüşte. Panini niyetine cevap veren sayfa yok; 301 soft-404 olur.
- The Underdog Block-Traps: How Gritty Low-Blocks are Calibrated to Stifle Tournament Heavyweights (74)
- Three Tactical Trends Will Dominate World Cup Play (77)
- FIFA's Ticket Resale Problem Is Pricing Ordinary Fans Out of the World's Biggest Tournament (79): 1 / 8. Bilet konusu sitenin çekirdeği dışında.
- Omar Artan and Iran's World Cup nightmare: How visa chaos threatens tournament integrity (90)
- FIFA's New World Cup Rules Will Change How Matches Are Won and Lost (92)
- World Cup 2026 in USA: How Political Tensions Could Overshadow Football's Biggest Stage (96)
- Dominating While Walking: A Tribute to Messi at His Sixth World Cup (139): 0 / 4. Arjantin listesinden (44) ve Proof'tan (140) link alıyor; ikisi de A adımında kaldırılacak. Argentina's Next Messi (131) farklı bir niyete cevap veriyor (Messi'nin halefleri), o yüzden 301 değil 410.
- Argentina's Fluid Front Three Proves Possession Football Still Wins Tournaments (85): 0 / 44, son 28 günde 0. Haziran'dan bir sosyal kartı var.

Bölüm dışındaki 2 yazı (proxy'ye tam yol olarak ekleniyor):
- Five Players Who Will Force Elite Clubs to Break the Bank After World Cup Performances (83). Yaz transfer tahminleriydi; pencere kapandı.
- Top 20 All-Time World Cup Goal Scorers: Ranking Football's Deadliest Tournament Predators (102). Sayılar eskimiş: Messi 13, Mbappé 12 yazıyor, sitenin kendi Messi yazısında 21 ve 22. Sıralama da hatalı.

Diğer 4 URL:
- 2 arşivlenmiş arena oyunu: `/arena/world-cup-2026-knockout-bracket` ve `/arena/world-cup-2026-favorites`. Bugün 200 dönüyorlar çünkü `fetchGame` durum filtresi uygulamıyor. Gösterimleri 0, sitede hiçbir yerden link almıyorlar.
- 2 OG görsel rotası: `/world-cup-2026/opengraph-image` ve `/world-cup-2026/schedule/opengraph-image`.

### 4e) Eski takma adlar (URL olarak sayılmadı; hepsi doğrudan 410)

- 38 Türkçe kadro slug'ı (`TR_SQUAD_SLUGS`). GSC'de hâlâ görünenler: `jamaika` (15 gösterim), `kosta-rika`, `nijerya`. Bunlardan 6'sı bugün zaten 404.
- `/kadrolar` ve `/kadrolar/*`, `/dunya-kupasi-2026/*`, `/en/world-cup-2026/*`.
- 2 Türkçe yazı slug'ı: `adidas-trionda-teknik-analiz-…` ve `2026-dunya-kupasi-48-takim-format-analiz`.
- `/lists/world-cup-2026-scouting-4-debutants-analysis`, yani 54 numaralı yazının eski /lists adresi. Bugün 307 ile WC adresine gidiyor.

---

## 5) Uygulama planı

**Sıra kritik:** önce veritabanı (yalnızca Proof), sonra kod, sonra deploy ve doğrulama, en son kalan satırların reddi.

| Adım | Ne | Dosyalar / veri | Süre |
|---|---|---|---|
| **0. Hazırlık** (canlı değişiklik yok) | Kirli çalışma ağacını commit'leyin ya da stash'leyin, çünkü `scripts/deploy.sh` `git add .` çalıştırıyor. Bugün kirli olanlar: `data/freshness`, `data/publish-queue.json`, `docs/TODO.md`, `docs/dictumus/BANNER-SLOTS.md`, `scripts/highlightly.mjs`, `video/src/*`, izlenmeyen `docs/*`, `data/talent-vs-trust/`, `scripts/talent-vs-trust.mjs`, `video/data/*`. Proof'taki iki olguyu `scripts/highlightly.mjs` ile doğrulayın (Yamal'ın Uruguay maçındaki rolü, O'Reilly'nin ilk 11 sayısı). 44 ve 140'ın `sections_json` ve `content_en` alanlarını scratch'e yedekleyin. Patch dosyasını dry-run ile çalıştırın. | `edits.json` (scratch) | 25 dk |
| **A. Veritabanı, deploy'dan ÖNCE** | Proof'u (140) `/admin/edit/140`'ta `lists` kategorisine taşıyın: accent emerald, news ve YouTube sorguları temiz, "Significant update" işaretlenmeden. Satırı anon anahtarla geri okuyun: `category=lists`, `hub_tags=[]`. Bu bir kapı: geçmeden B'ye geçilmez. Sonra `node scripts/patch-article-text.mjs edits.json`: önce dry-run, ardından `--write --published --minor`. **140:** Messi linki düz metin olur; Uruguay ve O'Reilly cümleleri düzeltilir. **44:** "wonderkids who lit up the 2026 World Cup" linki (129) ve "Messi's sixth and final campaign" linki (139) kaldırılır, "proving itself on the biggest stage" linki `/lists/proof-…`'e çevrilir. Script `content_en`'i yeniden üretir; 6 link geçişinin hepsi kapsanır. Googlebot ile curl: 44'te `/world-cup-2026` linki 0 olmalı, yeni `/lists/proof-…` linki 1. | `contents` 140, 44 | 40 dk |
| **B. Kod commit 1: kapatma** | **`proxy.ts`:** admin bloğundan önce `isGone()` → 410 + `GONE_HTML` (İngilizce kısa sayfa, `/` ve `/lists` linkleri, `x-robots-tag: noindex`). Matcher'daki her değer sabit olmalı: mevcut `'/admin'`, `'/admin/:path*'` korunur; eklenecekler `'/world-cup-2026/:path+'`, `'/dunya-kupasi-2026/:path+'`, `'/en/world-cup-2026/:path+'`, `'/kadrolar'`, `'/kadrolar/:path*'`, iki arena yolu ve **yeni** üç tam yol: `/lists/world-cup-breakout-stars-elite-transfer-targets`, `/lists/top-20-all-time-world-cup-goal-scorers-ranking`, `/lists/world-cup-2026-scouting-4-debutants-analysis`. Dosyanın başındaki yorum güncellenir. **`next.config.ts`:** 3. bölümdeki tablonun tamamı tam kaynaklı kurallar olarak eklenir: hub, `/dunya-kupasi-2026` ve `/en/world-cup-2026` → `/lists/proof-…`; 140 → `/lists/proof-…`; 129, 121 ve 94 → `/lists/proof-…`; 48, 53, 64, 82 ve 106'nın adresleri → `/lists/proof-…`; 116 → 131'in adresi; 81 → 145'in adresi. **Silinecekler:** `/dunya-kupasi-2026/:path*`, `/en/world-cup-2026/:path*`, `/kadrolar/:path*`, iki Türkçe yazı slug'ı kuralı, `TR_SQUAD_SLUGS` ve onu yayan satır. **Dokunulmayacaklar:** satır 104 ve 110 (Arjantin listesinin eski adresleri), satır 122 (Brezilya), `/tr/:path*`. **Silinecek klasör:** `app/world-cup-2026/` altındaki ağacın tamamı (9 dosya ve boş `lists/` klasörü). **Diğer dosyalar:** `app/sitemap.ts` (3 statik giriş ve `CAT_PATHS`'teki `wc-2026`), `app/components/site-footer.tsx` ("WC 2026 ARCHIVE" linki), `app/layout.tsx`, `app/opengraph-image.tsx`, `app/articles/page.tsx`, `app/feed/route.ts`, `lib/category-config.ts` (yalnızca `CONTENT_CATEGORIES`; etiket ve tip kalır), `scripts/scout-publish.mjs`, `.claude/skills/scout-editor/SKILL.md`, `scripts/health-check.mjs`, `app/admin/squads/page.tsx` (önizleme satırı), `docs/TODO.md` (kapatmayı kaydet; P4 maddesinden WC çıkar), `CLAUDE.md` (onayınızla). **`scripts/seo-check.mjs`:** `world-cup-2026` `SECTIONS`, `NOT_ARTICLES` ve `ROUTES`'tan çıkar; bu taban bilerek kaldırılıyor ve commit mesajında yazacak. `get()` `location` başlığını da döndürür. Yeni bir `RETIRED` bloğu şunları kontrol eder: hub, 140, 81, 116 ve `/radar/rising-stars-scouts-world-cup` için 308 ve doğru hedef; hedefin 200 dönmesi (tek adım); şu örnekler için 410: bir WC yazısı, `/world-cup-2026/schedule`, `/world-cup-2026/squads/brazil`, `/world-cup-2026/squads/almanya`, `/kadrolar/almanya`, `/arena/world-cup-2026-favorites`, `/lists/top-20-all-time-world-cup-goal-scorers-ranking`; sitemap'te sıfır `/world-cup-2026` URL'si. **Yerelde:** `npm run build && npx next start -p 3001` (asla `next dev` değil), ardından `node scripts/seo-check.mjs http://localhost:3001` ve Googlebot UA ile, yönlendirme izlemeden, HEAD ve GET curl matrisi. Matriste `/admin` kimlik bilgisi olmadan 401 dönmeli. | yukarıdakiler | 2.5 sa |
| **C. Deploy ve canlı doğrulama** | `bash scripts/deploy.sh "…"`, ardından aynı curl matrisi canlıda. | | 45 dk |
| **D. Veritabanı, canlı doğrulamadan SONRA** | `/admin/articles`'ta toplu Reject: kalan **51** `wc-2026` satırı ve bölüm dışındaki **7** satır (48, 53, 64, 82, 106, 83, 102), toplam 58. Anon anahtarla geri okuyun: yayında `wc-2026` satırı 0 olmalı (bugün 52); bu 7 id'nin hiçbiri yayında olmamalı. Sonra `POST /api/revalidate` şu yollarla: `/`, `/articles`, `/feed`, `/lists`, `/radar`, `/tactics-lab`, `/transfers`. Ardından canlıda `node scripts/seo-check.mjs --full`. İsteğe bağlı: `/world-cup-2026/schedule` ve bracket oyununa giden iki kapalı hero slaytını silin. | `contents` (58 satır), `site_settings` | 25 dk |
| **E. Commit 2: ölü kod temizliği** (ayrı deploy, beklemesi sorun değil) | Silinecekler: `wc-schedule-page`, `hub-squad-page`, `home-wc-*`, `wc/*` bileşenleri, `lib/wc-2026-brand.ts`, `lib/wc-squad-loader.ts`, `lib/wc-team-flags.ts`, `lib/hub-config.ts`, `app/admin/hub-wc`. Ortak bileşenlerdeki WC dalları kaldırılır (`hub-pillar-page`, `hub-feed-page`, `hub-article-detail-client`; Transfers bunları kullanmaya devam ediyor). Ayrıca `wcPromo` ve `wc` slaytı, admin preset'leri, `HUB_BY_TAG` ve `HUB_TAG_BY_CATEGORY`'deki `wc-2026`, AI prompt kategori listeleri. En son `.theme-wc-2026` CSS'i (~130 satır), grep ile başka yerde kullanılmadığı doğrulandıktan sonra. **Veriye dokunulmaz:** `wc_squad_players`, `lib/wc-2026-teams.ts` (`talent-vs-trust.mjs` okuyor), `lib/wc-2026-results.ts`, `lib/wc-2026-schedule.ts` (Tactics Lab formasyon kartı), `lib/wc-squad-db.ts`, `lib/wc-squad-seeds.ts`, `app/admin/squads`, `scripts/fetch-wc-squads.mjs`, arena satırları. `vercel.json`'daki tek cron (transfer-wire) WC'ye bağlı değil, kalıyor. | ~35 dosya | 1–1.5 sa |
| **F. GSC** | `sitemap.xml`'i yeniden gönderin ve Page indexing raporunu izleyin. 410 dönen URL'ler "Not found (404)" altında görünecek; bu beklenen bir şey. | | 10 dk |

**Zorunlu kısım (0–D) yaklaşık 4.5 saat. Temizlikle (E) birlikte yaklaşık 5.5–6 saat.**

---

## 6) Riskler ve geri dönüş

| Risk | Önlem |
|---|---|
| 140'ın 308 kuralı, satır `lists`'e taşınmadan canlıya çıkarsa redirect döngüsü oluşur: lists rotası WC adresine 307 verir, WC adresi /lists'e 308 verir. | A adımındaki geri okuma B'nin ön koşulu. `RETIRED` kontrolü hedefin 200 döndüğünü test ettiği için döngü deploy'u durdurur. |
| `deploy.sh` `git add .` çalıştırıyor; ilgisiz kirli dosyalar kapatma commit'ine girer. | 0. adım: önce commit ya da stash. |
| Satırlar deploy'dan önce reddedilirse 404 penceresi açılır. `notFound()` bir gün önbellekte kalabiliyor; daha önce 18 gün donmuş bir 404 yaşandı. | Önce deploy (C), sonra ret (D). Proxy ve next.config önbellekten önce çalıştığı için deploy sonrası eski önbellek de cevap veremez. |
| Matcher düzenlenirken `/admin` girdileri düşerse admin korumasız kalır. | Curl matrisinde `/admin` → 401 zorunlu. |
| 48 kadro sayfasının 3,795 gösterimi kaybolur ve trend yükseliyor. | Bu bilinçli bir takas (7. bölüm, 1. madde). Gösterimlerin karşılığı 3 ayda 4 tık. |
| Hub'dan yazıya yönlendirme Google'da soft-404 sayılabilir. | Hub'ın değeri zaten çok düşük (30 gösterim, 1 tık). Proof yine de en yakın niyet; `/lists` daha uzak. |
| Proof 10'dan fazla yönlendirmenin hedefi oluyor; içindeki iki olgu hatası artık daha çok okunacak. | A adımında, Highlightly doğrulamasından sonra `--minor` ile düzeltilir. |
| World Cup Dreams (48) "fifa world cup 2026 debutants" gibi ülke niyetli sorgular alıyor olabilir. Google 301'i uyumsuz bulursa sayfayı düşürür. | Bu sayfa hiç tıklanmadı; en kötü durumda sonuç 410 ile aynı olur. Yedek hedef: 124. |
| C ile D arasında `/articles`, feed ve bölüm dışı yazıların sitemap girdileri 308 ya da 410 dönen adreslere işaret eder. | Zararsız. D'yi C'nin hemen ardından yapın; `seo-check --full`'ü D'den sonra çalıştırın. |
| Haziran'daki sosyal paylaşımlardan gelen okurlar 410 sayfasına düşer (linkler nofollow, sıralamaya etkisi yok). | `GONE_HTML` gövdesinde `/` ve `/lists` linkleri var. |
| Proxy matcher'ı fonksiyon çağrılarını azaltmak için daraltılmıştı (~139k/ay). | Eklenen yollar az trafikli; maliyeti önemsiz. |
| `permanent: true` 301 değil 308 döner. | Google ikisini aynı sayar. Literal 301 istenirse yeni kurallarda `statusCode: 301` kullanılır. |
| seo-check'teki `/world-cup-2026` tabanı kaldırılıyor. | Yerini `RETIRED` bloğu alıyor; CLAUDE.md'nin taban kuralına uygun olarak commit mesajında belirtilecek. |

**Geri dönüş:**
- **Kod:** commit 1'i `git revert` edip deploy etmek proxy'yi, kuralları ve rota ağacını eski haline getirir. 410 kalıcı değildir; sayfa yeniden 200 dönerse Google tekrar tarar.
- **Veritabanı:** Reject geri alınabilir (`status` → `published`). 140'ı `wc-2026`'ya döndürmeden önce next.config'deki 140 kuralı kaldırılmalı, yoksa döngü oluşur. 44 ve 140'ın metinleri 0. adımdaki yedekten geri yazılır.
- **Kısmi geri dönüş, örneğin yalnızca kadro sayfaları:** proxy'de `/world-cup-2026/squads` ön eki muaf tutulur, `app/world-cup-2026/squads/*` ve `hub-squad-page` git'ten geri alınır, sitemap'e geri eklenir. Veri (`wc_squad_players`) zaten silinmiyor.

---

## 7) Sahibin onayı gereken noktalar

1. **48 kadro sayfası ve kadro indeksi 410 olsun mu?** Önerim evet. 3 ayda 3,795 gösterim ve 4 tık; 28 günlük gösterim artıyor (son dönem 1,639). Sorgular "argentina world cup squad" türünden, ortalama sıra 30–50. Sayfalar turnuvada donmuş kadroları gösteriyor.
2. **Bölüm dışındaki 7 WC yazısı aynı turda kapansın mı?** Önerim evet: World Cup Dreams (48), The 2026 Scouting Report (53), The Generational Shift (64), Rising Stars Every Scout Should Monitor (82) ve Young Talents to Watch (106) Proof'a 301; Five Players Who Will Force Elite Clubs… (83) ve Top 20 All-Time World Cup Goal Scorers (102) 410. Tutulan Brazil Got 4.4 Years Younger (156) ve Barcelona's Egyptian Gamble (97) bu değişiklikten etkilenmiyor.
3. **Canlı yazı ve proje dosyası düzenlemeleri.** Argentina's Best Young Players (44) içinde 3 link değişiyor. Proof, Not Projection (140) içinde 1 link kaldırılıyor ve 2 olgu düzeltiliyor. Hepsi `--minor`, tarih değişmiyor. Ayrıca CLAUDE.md'de üç eski bilgi düzeltilecek: proxy satırı, var olmayan API rotaları, "two crons".
4. **Hub hedefi:** Proof, Not Projection mı (önerim), `/lists` dizini mi? `/dunya-kupasi-2026` ve `/en/world-cup-2026` de seçilen hedefe gidecek.
