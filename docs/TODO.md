# Scout Gamer — To-Do

Son güncelleme: 2026-09-20

Bu liste sohbette yaşıyordu ve her seferinde yeniden kuruluyordu. Artık burada.
Tamamlananı silmeyin — **Biten** bölümüne taşıyın; neyin ne zaman çözüldüğü,
tekrar eden sorunları görmenin tek yolu.

---

## 0. Şu an bekleyen tek el emeği

**Altı yazı `pending`, altısı da kapak görseli bekliyor.**

| # | Başlık | Not |
|---|---|---|
| 153 | England's Best Young Footballers | |
| 154 | Central Midfielders | |
| 155 | Portugal's Best Young Footballers | |
| 156 | Brazil Got 4.4 Years Younger | |
| 157 | Cavan Sullivan | **önce bu yayına girmeli** |
| 158 | Max Dowman | #157'ye link veriyor |

Bunlar yayına girmeden yeni içerik üretmek kuyruğu uzatmaktan başka bir şey yapmaz.

---

## 1. Sosyal medya — dağıtım (YENİ, 2026-09-20 eklendi)

**Teşhis:** trafiğin sosyalden gelmemesi bir içerik sorunu değil, bir dağıtım sorunu.
Sıfır takipçiyle link paylaşmak, her platformda sonucu garanti sıfır olan tek eylem.
Ağustos 2026'da bir strateji yazıldı ve hiç uygulanmadı — eksik olan plan değil, rutin.

**Kural:** sosyal, ilk aşamada bir **trafik** kanalı değil bir **kitle edinme** kanalıdır.
Şimdi GA oturumlarıyla ölçersek, işe yaramadan kapatırız. Son 49 günde olan tam olarak bu.

### Lane A — Reddit / forumlar ⭐ önce bu
Sıfır takipçiyle **ilk hafta** trafik getirebilen tek kanal. Takipçi grafiğine değil ilgi
grafiğine dağıtıyor, üstelik indeksleniyor. IP'miz (`oyunun veritabanı şu konuda yanlış`)
zaten yerli Reddit içeriği. r/soccer, r/FIFA, r/footballmanagergames, r/MLS, ülke subları.
Kapak görseli yok, video yok, montaj yok.
- [ ] Hedef 6 sub seç, her birinin self-promo kuralını oku
- [ ] Haftada 5 yorum: önce değer, link sadece izin veren yerde
- [ ] 3 hafta sonra referrer'ları ölç

### Lane B — Kısa video, 3/hafta
Sıfırdan takipçi büyütmenin tek motoru. Tek video → TikTok + Reels + Shorts. 8-16 sn.
Üç tekrarlanabilir format: **"oyun yanılıyor"** · **"deep cut"** · **"makbuz"**
(şu tarihte şunu söyledik, sonra şu oldu). Makbuz formatı farkımız — kimse
tuttuğu tahminin arkasında durmak istemiyor. Bankadaki makbuzlar: Bouaddi, Robinio Vaz,
Ngumoha.

### Lane C — X, %80 yanıt / %20 paylaşım
Günde 5-10 gerçek oyuncu yorumu, başkalarının thread'lerinin içinde. Link yok, pitch yok.

**Sıralama kuralı: aynı anda tek lane.** Üçünü birden denemek, sıfırın sebebi.

### Benim üstüme düşen
- [x] **Social pack üreteci** — `scripts/social-pack.mjs <slug|id>`. Yayınlanan yazının
      gövdesinden Reddit açısı, X yanıt cümleleri (karakter sayılı), carousel slaytları,
      16 sn video kurgusu ve kart URL'leri çıkarır. Hiçbir cümleyi kendisi yazmaz —
      hepsi `sections_json`'dan birebir alıntı. $0.
- [x] **İçerik taşıyan kart varyantları** — `/api/social-card?variant=stat|contrast|verdict|list`.
      Style A (`variant=cover`) **aynen duruyor**, hiçbiri onu değiştirmiyor.
      Dördü de kapak görseli gerektirmiyor.
- [ ] `/api/admin/social-text`'i emekli et — başlıktan yazıyor ve her çağrıda Anthropic
      API'ye para ödüyor. Extractor gövdeyi okuyor ve bedava.
- [ ] Varyantları admin panelindeki Social Card Studio'ya buton olarak bağla
      (şu an sadece pack'in ürettiği URL üzerinden)

**Açık karar:** videolar sessiz mi (ekran yazısı) yoksa seslendirilmiş mi — kart metni
yoğunluğunu bu belirliyor.

---

## 2. FC 27 güncellemesi — 25 Eylül ve sonrası

`fc_players` 16.228 satır, EA FC 26 verisi (Eylül 2025). 0 MLS oyuncusu, 15-16 yaş yok.

- [ ] **ÖNCE dondurma:** 15 yayındaki yazı metninde FC 26 reytingi geçiyor **ve** canlı
      kart render ediyor. Import yapılırsa yazılar kendi kendileriyle çelişir.
      Reytingler yayın anında yazıya gömülmeli — **import'tan önce**.
- [ ] Kaggle CSV indir, `--dry` diff al, yedek al
- [ ] `fix_fc_players_club_names.sql` yeniden uygula
- [ ] `created_at` / `dataset_version` kolonları ekle (bu sefer tarih bilinsin)

---

## 3. İçerik

- [ ] **`/tactics-lab/high-press-striker` yerinde dönüşüm** — sayfa "en iyi pressing
      forvetler" gibi *liste* sorgusuyla yükseliyor (7.4, 8.0), taktik sorgusuyla değil.
      Rol × oyuncu listesi formatına çevrilecek, URL korunacak (`--update 33`).
      **Engel:** oyuncu başına pressing verisi yok — oyunda böyle bir özellik yok, arama
      2026-27 için oyuncu bazlı sayı vermiyor, FBref 403 dönüyor. Çözüm: veri boşluğunu
      yazının omurgası yap (kart yanlış / lig yok / yaş yok üçlüsünün dördüncüsü).
      Kendi başına bir araştırma oturumu gerektiriyor.
- [ ] **`publish_at` + günlük cron** — yayınları pencereye yay, toplu basma (önerildi,
      onay bekliyor)
- [ ] "Haftalık radar" vaadi 4 yerde geçiyor ama tutulmuyor — ya tut ya metinden kaldır

---

## 4. Teknik borç

- [ ] Kullanılmayan legacy `content` kolonunda ~110KB ölü Türkçe, 28 yayındaki satırda.
      Görünmüyor ama `app/{lists,radar,tactics-lab}/[slug]/page.tsx` içindeki `select("*")`
      yüzünden her ziyaretçiye RSC payload'ıyla gidiyor.
- [ ] Kapı (`preflight.mjs`) kartı olmayan oyuncuları göremiyor — kör nokta
- [ ] Periyodik canlı sayfa sağlık kontrolü

---

## Park edilmiş

- Newsletter "The Deep Cut" — kayıt formu **en son** adım
- API-Football tier 4 — hesap askıda, zararsız, 3.3sn gecikme
- WC knockout fikstüründe "2nd Group A" placeholder'ları

---

## Biten

- **2026-09:** Ana sayfa kartları yanlış kulüp gösteriyordu — `fc_players` kimliği eziyordu;
  select'ten club/league/age çıkarıldı, `scripts/form-pool.mjs` havuzu doğruluyor
- **2026-09:** `**bold**` liste bloklarında düz metin olarak render ediliyordu (lansmandan beri)
- **2026-09:** `--update` canlı yazıyı sessizce yayından kaldırıyordu — guard eklendi
- **2026-09:** ISR cache script güncellemelerini 24 saate kadar gizliyordu — `/api/revalidate`
- **2026-09:** Tablo bloğu (`@table:` / `@table:ranked`) eklendi
- **2026-09:** Türkçe denetimi 3 katmanda temiz; iki Türkçe URL **kararla** canlı bırakıldı
- **2026-09:** Vercel kullanımı yarıya indi — ISR yazma −%54, invocation −%55, CPU %70→%42
