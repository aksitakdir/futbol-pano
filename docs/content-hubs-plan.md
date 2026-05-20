# Scout Gamer — İçerik Hub Planı (DK 2026 + Transfer)

> **Amaç:** Trafik ve gelir potansiyelini maksimize ederken marka kimliğini (scout × oyun kültürü) korumak ve içeriği yıl boyu sürdürülebilir kılmak.  
> **Tarih:** Mayıs 2026 · **Durum:** Planlama (uygulama öncesi onay)

---

## 1. Stratejik çerçeve

### Ne satıyoruz (kimlik)

| Rakipler verir | Scout Gamer verir |
|----------------|-------------------|
| Ham kadro listesi | Kadro + **scout notu**, kart, rating bar, “neden seçildi?” |
| Transfer haberi | **Uyum analizi**, rol, oyun stili, FC stat bağlamı |
| Genel taktik yazısı | **Turnuva / kulüp bağlamlı** taktik (kadro + sistem) |

**Tek cümle:** *“Kadroyu ve transferi haber değil, scout raporu gibi okutuyoruz.”*

### Ne satmıyoruz

- Dakika dakika haber ajansı (Twitter/X ile yarış)
- Sadece kopyalanmış TM/FIFA listeleri (thin content)
- Yıl/sezon içermeyen ama güncellik vaat eden başlıklar (mevcut `generate-content` kuralıyla uyumlu)

### Gelir mantığı

1. **Trafik hacmi** — DK kadro + transfer aramaları (yüksek sezonluk RPM)
2. **Sayfa derinliği** — hub → kadro → radar → arena (oturum süresi)
3. **Mevcut monetizasyon** — TM/Google scout linkleri; ileride display, sponsorlu “scout pick”, affiliate
4. **Programatik sayfalar** — 48 ülke kadrosu = 48 indekslenebilir URL (editoryal katman şart)

---

## 2. Bilgi mimarisi — sekmeler

Mevcut nav: Ana Sayfa · Listeler · Radar · Taktik Lab · Arena.

**Öneri:** İki **kampanya hub’ı** üst menüye; Taktik Lab footer / hub alt menüsünde (mobilde 6 sekme kalabalık olmasın).

### TR navigasyon (önerilen)

| Sıra | Sekme | URL | Rol |
|------|--------|-----|-----|
| — | Ana Sayfa | `/tr` | Hero + öne çıkanlar |
| 1 | **DK 2026** | `/dunya-kupasi-2026` | Turnuva pillar |
| 2 | **Transfer** | `/transfer` | Yıl boyu transfer pillar |
| 3 | Radar | `/radar` | Oyuncu odaklı editoryal |
| 4 | Listeler | `/listeler` | Sıralama / karşılaştırma |
| 5 | Arena | `/arena` | Etkileşim, paylaşım |

**Taktik Lab:** `/taktik-lab` — DK hub altında “Taktik” filtresi + footer link.

### EN navigasyon

| Sekme | URL |
|--------|-----|
| World Cup 2026 | `/en/world-cup-2026` |
| Transfers | `/en/transfers` |
| Radar / Lists / Arena | mevcut `/en/...` |

### Hub vs kategori kararı

**Önerilen model: “Hub + etiket” (Faz 1–2)**  
Mevcut `contents.category` değerleri kalır: `radar` | `listeler` | `taktik-lab`.

Yeni alan (Supabase):

```sql
-- Öneri: tek migration
ALTER TABLE contents ADD COLUMN IF NOT EXISTS hub_tags text[] DEFAULT '{}';
-- Örnek: '{wc-2026}', '{transfer}', '{wc-2026,transfer}'
CREATE INDEX IF NOT EXISTS idx_contents_hub_tags ON contents USING GIN (hub_tags);
```

**Avantaj:** Admin ve `generate-content` minimum değişir; içerik hem Radar’da hem DK hub’ında listelenir.  
**Faz 3 (opsiyonel):** Programatik kadro sayfaları için `wc_squads` tablosu (aşağıda).

Yeni `category: wc-2026` **şimdilik önerilmez** — ArticleLayout, sitemap, admin, cron döngüsünün tamamını kırar; hub etiketi daha hızlı.

---

## 3. URL ağacı ve SEO niyetleri

### 3.1 Dünya Kupası 2026

```
/dunya-kupasi-2026                          → Pillar (gruplar, takvim, son güncelleme)
/dunya-kupasi-2026/kadrolar                 → Ülke indeksi A–Z
/dunya-kupasi-2026/kadrolar/turkiye         → Programatik + scout katmanı ★
/dunya-kupasi-2026/kadrolar/ingiltere
/dunya-kupasi-2026/radar                    → hub_tags içinde wc-2026 olan radar
/dunya-kupasi-2026/listeler
/dunya-kupasi-2026/taktik
/dunya-kupasi-2026/arena                    → WC temalı oyunlar
```

**EN:** `/en/world-cup-2026/...` (aynı yapı)

**Öncelikli anahtar kelimeler (TR)**

| Öncelik | Örnek sorgu | Karşılayan sayfa |
|---------|-------------|------------------|
| P0 | türkiye dünya kupası kadrosu 2026 | `/kadrolar/turkiye` |
| P0 | dünya kupası 2026 kadrolar | `/kadrolar` |
| P1 | dünya kupası 2026 genç oyuncular | Liste hub |
| P1 | dünya kupası sürpriz kadro | Liste / radar |
| P2 | dünya kupası 2026 gruplar | Pillar |
| P2 | [oyuncu] dünya kupası | Radar (player_name) |

**Öncelikli anahtar kelimeler (EN)** — ABD/Meksika/Kanada co-host trafiği

- `usa world cup squad 2026`, `mexico squad 2026`, `world cup 2026 squads`

**Sitemap:** pillar + kadrolar `priority: 0.9`, `changeFrequency: daily` (kadro döneminde).

### 3.2 Transfer merkezi

```
/transfer                                   → Pillar (pencereler, öne çıkanlar)
/transfer/radar                             → hub_tags: transfer
/transfer/listeler                          → “en çok konuşulan 10”, “ücretsizler” vb.
/transfer/[slug]                            → Opsiyonel: rumor özet sayfası (Faz 3)
```

**Anahtar kelimeler**

| Öncelik | TR | EN |
|---------|----|----|
| P0 | [oyuncu] transfer haberleri | [player] transfer news |
| P1 | yaz transferleri 2026 | summer transfers 2026 |
| P1 | transfer dedikoduları | transfer rumors |
| P2 | [kulüp] transfer hedefleri | [club] transfer targets |

Transfer **yıl boyu** sürer; DK hub turnuva sonrası düşerken Transfer pillar sabit kalır → gelir sürekliliği.

---

## 4. İçerik havuzları (şablonlar)

Her havuz: **format** · **kategori** · **hub_tags** · **sıklık** · **hero_variant**

### 4.1 DK 2026 havuzları

| ID | Havuz adı | Format | category | hub_tags | Sıklık | hero |
|----|-----------|--------|----------|----------|--------|------|
| WC-K | **Ülke kadro sayfası** | Programatik + 150–300 kelime scout giriş | — | wc-2026 | Ülke ilanında 1 gün içinde | radar-player-focus bileşenleri |
| WC-R1 | **Kadro radarı** | “X neden kadroda / neden yok” | radar | wc-2026 | 2–3 / hafta (ilan dönemi) | radar-player-focus |
| WC-L1 | **Sürprizler & eleştiri** | Top 8–10 liste | listeler | wc-2026 | Haftada 1 | player-cards |
| WC-L2 | **En genç / en tecrübeli** | Liste | listeler | wc-2026 | 2 haftada 1 | player-cards |
| WC-L3 | **Kadroya göre en iyi 11** | Liste + players_json | listeler | wc-2026 | Ülke başına 1 (büyük 12 ülke) | player-cards |
| WC-T1 | **Turnuva taktik** | “3-4-3 ile mi çıkar?” | taktik-lab | wc-2026 | Haftada 1 | pitch-diagram |
| WC-A1 | **Arena: kim daha iyi?** | İkili oyuncu / ülke | arena_games | wc-2026 | 2 / ay | — |
| WC-A2 | **Tahmin bracket** | Arena turnuva | arena_games | wc-2026 | Turnuva öncesi 1 | — |
| WC-E1 | **Maç sonrası radar** | MOTM, breakout | radar | wc-2026 | Maç günü (turnuva) | stat-focus |

**Kadro sayfası minimum içerik (programatik şablon):**

- Resmi 26’lı liste (isim, pozisyon, kulüp)
- 3 “scout pick” (kart + kısa not)
- “İlk kez”, “sürpriz”, “eksik yıldız” 3 maddelik kutu
- `last_updated` + “Son güncelleme: …” (E-E-A-T)
- Internal link: ilgili radar/liste

**Ülke rollout sırası (trafik önceliği)**

1. Türkiye, ABD, Meksika, Kanada (co-host + TR kitlesi)  
2. Brezilya, Arjantin, Fransa, İngiltere, İspanya, Almanya, Portekiz, Hollanda  
3. Kalan UEFA/CONMEBOL  
4. AFC/CAF/Oceania (SEO uzun kuyruk)

### 4.2 Transfer havuzları

| ID | Havuz adı | Format | category | hub_tags | Sıklık | hero |
|----|-----------|--------|----------|----------|--------|------|
| TR-R1 | **Transfer radarı** | Oyuncu + kulüp uyumu | radar | transfer | 2–4 / hafta (pencere) | radar-player-focus |
| TR-R2 | **“Gider mi?”** | Kısa analiz (600–900 kelime) | radar | transfer | Dedikodu yoğun günlerde | player-cards |
| TR-L1 | **Haftanın 10 dedikodusu** | Liste | listeler | transfer | Haftalık (Cuma) | player-cards |
| TR-L2 | **En mantıklı 5 hamle** | Liste (scout gerekçeli) | listeler | transfer | 2 haftada 1 | player-cards |
| TR-L3 | **Bonservissiz / kontratı bitenler** | Liste | listeler | transfer | Ayda 1 | player-cards |
| TR-T1 | **Taktik uyum** | “X takımda hangi rol?” | taktik-lab | transfer | Ayda 2 | pitch-diagram |
| TR-A1 | **Arena: X mi Y mi?** | Kulüp için kim | arena_games | transfer | Ayda 2 | — |

**Transfer penceresi takvimi (içerik yoğunluğu)**

| Dönem | Yoğunluk | Odak |
|-------|----------|------|
| Haz–Ağu 2026 | 🔴 Yüksek | WC sonrası + yaz penceresi |
| Eyl 2026 | 🟠 Orta | Son hamleler |
| Eki 2026 – Oca 2027 | 🟢 Düşük-Orta | “Gelecek yaz” spekülasyonu, sözleşme uzatmaları |
| Şub–Haz 2027 | 🔴 Yüksek | Kış + yaz |

DK bittikten sonra editoryal ağırlık **Transfer + Radar genç yetenek**e kayar — site boş kalmaz.

---

## 5. Yıllık içerik takvimi (süreklilik)

```
2026 Q2 (şimdi)     Kadro ilanları → WC-K + WC-R1/L1 yoğun
2026 Q2–Q3          Turnuva → WC-E1, WC-A2, günlük hafif radar
2026 Q3 (Ağu+)      WC sonrası transfer patlaması → TR-* yoğun
2026 Q4 – 2027 Q1   Transfer merkezi ana motor; DK arşiv “2026’da ne oldu”
2027 Q2             Kulüp Dünya Kupası / 2026 retro listeler (evergreen)
```

**Kural:** Her hub sayfasında “Son güncelleme” ve en az 1 içerik < 14 gün (pencere döneminde < 7 gün).

---

## 6. Üretim iş akışı (operasyon)

### Admin / CMS

1. Yeni içerik → mevcut kategori + **hub_tags** çoklu seçim (`wc-2026`, `transfer`).
2. DK kadro → ayrı admin ekranı veya CSV import → `wc_squads` (Faz 2).
3. `generate-content` cron: `hub_tags` ve konu listeleri genişletilir (aşağıda prompt ekleri).

### Otomasyon sınırları

| Otomatik | İnsan / editör şart |
|----------|---------------------|
| Kadro isim listesi (kaynak: resmi FA / güvenilir aggregator) | Scout pick 3, sürpriz/eksik kutusu |
| FC stats çekme (`fc_players`) | Başlık, ton, tartışma |
| Çeviri EN (`title_en`, `content_en`) | TR öncelikli kadro sayfaları |
| Trend konu önerisi (`/api/trends`) | Yayın onayı |

### Haftalık minimum (sürdürülebilir ekip: 1–2 kişi)

| Dönem | Radar | Liste | Kadro | Arena |
|-------|-------|-------|-------|-------|
| Kadro ilanı | 2 | 1 | +1 ülke/gün (batch) | 0–1 |
| Turnuva | 3–5/hafta | 1 | güncelleme | 1 |
| Transfer penceresi | 3 | 1 | — | 1 |
| Sakin dönem | 1 | 0–1 | — | 0–1 |

---

## 7. Teknik uygulama fazları

Mevcut kod tabanına uyumlu sıra:

### Faz 1 — Hub sayfaları (1–2 hafta) ✅ (May 2026)

- [x] `hub_tags` kolonu + admin checkbox (`scripts/add-hub-tags-column.sql` — Supabase’de çalıştırın)
- [x] `/dunya-kupasi-2026`, `/transfer` pillar (TR + EN)
- [x] Alt liste sayfaları: radar + listeler (`hub_tags` filtresi)
- [x] Kadro indeksi + ülke placeholder sayfaları (Faz 2’de veri)
- [x] Nav + sitemap + dil geçişi (`lib/locale-path.ts`)
- [x] Ana sayfa: `HomeHubPromo` modülü

### Faz 2 — Programatik kadro (2–3 hafta)

- [ ] Tablo `wc_squads(country_slug, country_name_tr, country_name_en, players_json, scout_summary, updated_at, status)`
- [ ] `/dunya-kupasi-2026/kadrolar/[country]` — `RadarPlayerFocusPanel` ile 1 featured + grid
- [ ] İlk 12 ülke verisi; kalanı şablon “Yakında” + e-posta/geri bildirim yok, sadece indeks

### Faz 3 — Üretim & gelir (paralel)

- [ ] `generate-content`: `hub_tags`, WC/transfer topic listeleri
- [ ] `trends` API: `world cup 2026 squad`, `transfer rumor` ağırlığı
- [ ] Sponsorlu alan: kadro sayfası scout pick altı (placeholder)
- [ ] Analytics: hub bazlı `view_count` rollup

### Bilinçli ertelenenler

- Canlı skor / maç merkezi (ajans işi, yüksek bakım)
- Tam otomatik kadro scraper (hukuk + kırılganlık); başta yarı manuel

---

## 8. `generate-content` konu havuzu ekleri

**WC-2026 (`hub_tags: ['wc-2026']`)**

- Breakout player from [Country] World Cup squad  
- Why [Player] made [Country]’s 26-man roster  
- World Cup 2026 tactical preview: how [Country] will line up  
- Biggest surprises in [Country]’s World Cup squad  
- Players snubbed from [Country]’s World Cup squad  

**Transfer (`hub_tags: ['transfer']`)**

- Would [Player] fit at [Club]? Scout analysis  
- Top 10 transfer rumors this week ranked  
- Best value signings this summer  
- Free agents who could move for free  
- How [Player]’s role would change after transfer  

Cron dağılım önerisi: %40 transfer (yıl boyu), %35 wc-2026 (Haziran’a kadar), %25 genel radar/liste/taktik.

---

## 9. KPI ve başarı metrikleri

| Metrik | 90 gün hedef (örnek) |
|--------|----------------------|
| Kadro sayfası indekslenen URL | ≥ 24 ülke |
| Organik oturum (hub toplamı) | Baseline + %80 |
| Sayfa/oturum (hub girişli) | ≥ 2.2 |
| Radar `player_name` + TM tıklama | Artış (scout intent) |
| Arena tamamlama | WC bracket ≥ 500 oyun |

**Kalite kontrol:** Kadro sayfası bounce <%65, ortalama süre > 1:30 (scout katmanı varsa).

---

## 10. Riskler ve önlemler

| Risk | Önlem |
|------|--------|
| Thin kadro sayfaları | Minimum 3 scout pick + editoryal kutu; kopya liste tek başına yayınlanmaz |
| Kadro sonrası trafik çöküşü | Transfer hub’a yönlendirme; DK arşiv listeleri |
| Nav kalabalığı | Taktik Lab hub altında; mobilde DK + Transfer öne |
| EN/TR içerik dengesizliği | Kadro: TR önce; büyük ülkelerde EN aynı gün |
| Yanlış kadro verisi | `updated_at` + kaynak notu; admin tek tık güncelleme |

---

## 11. Karar özeti (onay için)

1. **İki üst sekme:** DK 2026 + Transfer (TR/EN pillar URL’leri).  
2. **İçerik modeli:** Mevcut 3 kategori + `hub_tags[]` (yeni kategori yok, Faz 1).  
3. **Trafik motoru:** Programatik kadro sayfaları (Faz 2) + editoryal radar/liste.  
4. **Süreklilik:** Transfer yıl boyu ana kanal; DK kampanya 6–8 ay, sonra arşiv.  
5. **Kimlik:** Her sayfada scout katmanı (kart, not, liste gerekçesi) zorunlu.

---

## Ek: Mevcut kodla eşleme

| Var olan | Hub planında kullanım |
|----------|------------------------|
| `contents` + `category` | radar / listeler / taktik-lab |
| `player_name`, `stat_*`, `hero_variant` | WC-R, kadro featured |
| `RadarPlayerFocusPanel` | Kadro pillar + WC radar detay |
| `players_json` | WC-L3 en iyi 11 |
| `arena_games` | WC-A*, TR-A1 |
| `fc_players` | Kadro kart statları |
| `generate-content` cron | Havuz konuları + hub_tags |
| `sitemap.ts` | Yeni hub + kadro URL’leri |

---

*Sonraki adım: Faz 1 için issue listesi veya Agent modunda `hub_tags` migration + pillar sayfa iskeleti.*
