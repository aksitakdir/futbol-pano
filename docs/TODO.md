# Scout Gamer — To-Do

Son güncelleme: 2026-09-20

Bu liste sohbette yaşıyordu ve her sorulduğunda yeniden kuruluyordu. İlk repo
sürümünü bir sohbet **özetinden** kurdum ve dört madde ile birçok gerekçe düştü;
bu sürüm 20 Eylül'ün orijinal kapsamlı listesinden yeniden kuruldu. Ders şu:
liste burada yaşar, hafızada değil.

Tamamlananı silmeyin — **Biten** bölümüne taşıyın. Neyin ne zaman çözüldüğü,
tekrar eden sorunları görmenin tek yolu.

---

## 🔴 Takvimli

### FC 27 — 25 Eylül, 5 gün kaldı

`fc_players` 16.228 satır, EA FC 26 verisi (Eylül 2025). 0 MLS oyuncusu,
15-16 yaş yok (taban 17, 52 oyuncu), `created_at` yok. Erken erişim 18 Eylül'de
başladı, veri seti çıkmış olabilir.

- [ ] **ÖNCE dondurma. Sıra yanlış olursa 15 yazı kendiyle çelişir.**
      82 yazıda oyuncu kartı var; 15'i **hem** metinde EA FC 26 reytingi anıyor
      **hem** canlı kart render ediyor. Import edildiği an metin 68 derken kart
      74 gösterir.

      | # | yazı | kart | reyting anması |
      |---|---|---|---|
      | 145 | Strikers | 8 | 12 |
      | 146 | Full-Backs | 7 | 12 |
      | 136 | **Centre-Backs** — sitenin en çok tıklanan sayfası (28 günde 356 tık) | 7 | 9 |
      | 152 | Ball-Playing CBs | 6 | 9 |
      | 138 | *"The Midfielders EA FC 26 Still Underrates"* — çelişki **başlıkta** | 6 | 8 |

      Çözüm: yayın anında kart verisini bloğa göm, renderer önce onu kullansın,
      yoksa aramaya düşsün. Tarihli bir scouting yazısının kartı zaten bir
      fotoğraf olmalı. **Ek fayda:** bugün canlı sorgu olan her kart statikleşir.
- [ ] Kaggle CSV indir → yolunu ver → import script'i. `--dry` önce kaç kulübün
      değiştiğini gösterir; o sayı, verinin ne kadar bayatladığının tek cümlelik cevabı.
- [ ] Yedek al
- [ ] `fix_fc_players_club_names.sql` yeniden uygula
- [ ] `created_at` / `dataset_version` kolonları ekle — bu sefer tarih bilinsin

---

## 🟠 Yayın kuyruğu

**Altı yazı `pending`.** Hepsi kapak görseli bekliyor — ama **kapak artık yayına
girmenin şartı değil.** Kart varyantları (stat/contrast/verdict/list) görselsiz
çalışıyor; bir yazı bugün yayına alınıp bugün dağıtılabilir. Kapak yalnızca
Style A kartını açıyor.

| # | Başlık | Not |
|---|---|---|
| 153 | England's Best Young Footballers | |
| 154 | Central Midfielders | |
| 155 | Portugal's Best Young Footballers | |
| 156 | Brazil Got 4.4 Years Younger | |
| 157 | Cavan Sullivan | **önce bu** |
| 158 | Max Dowman | #157'ye link veriyor · rekabet riski flag'li |

Yayın sonrası her biri için:
`node scripts/post-publish.mjs <slug>` · `node scripts/social-pack.mjs <slug>`

### Radar kadansı
Son radar yazısı 26 Ağustos (Nico Paz) idi; #149 Ngumoha 20 Eylül'de yayına
girdi ve **25 günlük sessizliği kırdı.** Ama site hâlâ iki yerde *"a new talent
every week"* diyor ve bu vaat tutulmuyor → aşağıdaki Görev A/B.

---

## 🟡 Onayını bekleyen

- [ ] **`publish_at` + günlük cron** — toplu yaz, haftaya yay. Şema değişikliği.
      Mekanizma frekanstan bağımsız; frekansı sonra ayarlarız.
- [ ] **Görev A / B** — "haftalık radar" vaadi dört yerde geçiyor.
      **B'yi (radar gerçekten haftalık) yaparsak A'ya (metinden kaldırmak) gerek yok.**

---

## 🟢 Planda

- [ ] **`/tactics-lab/high-press-striker` yerinde dönüşüm** — sayfa "en iyi
      pressing forvetler" gibi *oyuncu listesi* sorgusuyla yükseliyor (7.4, 8.0),
      taktik sorgusuyla değil. Rol × oyuncu listesi formatına çevrilecek, URL
      korunacak (`--update 33`). Artık tablo bloğu da var.
      **Engel:** oyuncu başına pressing verisi yok — oyunda böyle bir özellik yok,
      arama 2026-27 için oyuncu bazlı sayı vermiyor, FBref 403 dönüyor.
      **Çözüm:** veri boşluğunu yazının omurgası yap — kart yanlış (Ngumoha) /
      lig yok (Sullivan) / yaş yok (Dowman) üçlüsünün dördüncüsü.
      Kendi başına bir araştırma oturumu gerektiriyor.

---

## 📣 Sosyal medya — dağıtım (2026-09-20 eklendi)

**Teşhis:** trafiğin sosyalden gelmemesi bir içerik sorunu değil, bir dağıtım
sorunu. Sıfır takipçiyle link paylaşmak, her platformda sonucu garanti sıfır olan
tek eylem.

1 Ağustos 2026'da bir strateji yazıldı; memory'de karar *"kullanıcı düşünüyor"*
diye kaldı ve sonraki hiçbir oturumda verilmedi. **Paylaşım durmadı** — plandaki
üç lane (Reddit, kısa video, yanıt öncelikli X) hiç başlamadı.

*Kanıtın kaynağı:* hesaplara erişimimiz yok, post geçmişi ve analytics elimizde
yok. Dayandığımız şey kullanıcının iki tarihteki kendi beyanı — 1 Ağustos
("sadece post yapıyorum ama istikrarsız, hiçbir yorum yapmışlığım yok") ve
17 Ağustos ("sosyal medyadan bir kişilik bile trafik almadık"). Ölçüm değil,
beyan. Lane A'nın üçüncü maddesi (referrer ölçümü) bunu ilk kez ölçüye çevirecek.

**Kural:** sosyal, ilk aşamada bir **trafik** kanalı değil bir **kitle edinme**
kanalıdır. Şimdi GA oturumlarıyla ölçersek, işe yaramadan kapatırız.
İlk 6 hafta ölçüt: tıklama değil, **profil ziyareti.**

### Lane A — Reddit / forumlar ⭐ önce bu
Sıfır takipçiyle **ilk hafta** trafik getirebilen tek kanal: ilgi grafiğine
dağıtıyor, üstelik indeksleniyor. IP'miz (*"oyunun veritabanı şu konuda yanlış"*)
zaten yerli Reddit içeriği. Kapak yok, video yok, montaj yok.
- [ ] Hedef 6 sub seç, her birinin self-promo kuralını oku
- [ ] Haftada 5 yorum: önce değer, link sadece izin veren yerde
- [ ] 3 hafta sonra referrer'ları ölç

### Lane B — Kısa video, 3/hafta
Sıfırdan takipçi büyütmenin tek motoru. Tek video → TikTok + Reels + Shorts, 8-16 sn.
Üç format: **"oyun yanılıyor"** · **"deep cut"** · **"makbuz"** (şu tarihte şunu
söyledik, sonra şu oldu). Makbuz farkımız. Bankadakiler: Bouaddi, Robinio Vaz, Ngumoha.

### Lane C — X, %80 yanıt / %20 paylaşım
Günde 5-10 gerçek oyuncu yorumu, başkalarının thread'lerinin içinde. Link yok.
**Nereye yanıt verileceği** uygunluk sırasına göre: reyting şikayeti thread'leri →
"bu çocuk kim" thread'leri (ilk 30 dk) → wonderkid/FM → transfer söylentileri →
ve thread değil, yanıtları okunan ~20 hesaplık sabit liste.

**Sıralama kuralı: aynı anda tek lane.** Üçünü birden denemek, sıfırın sebebi.

**Açık karar (Ağustos'tan beri):** videolar sessiz mi (ekran yazısı) yoksa
seslendirilmiş mi — kart metni yoğunluğunu bu belirliyor.

---

## ⚪ Park halinde

- **Newsletter "The Deep Cut"** — kayıt formu **en son** adım
- **Kapının boşluğu** — kartı olmayan oyuncular hakkındaki düz metin iddiaları
  denetimsiz (**Chilwell vakası**). `preflight.mjs` yalnızca kartlı oyuncuyu görüyor.
- **#5 `Kodaisano` slug'ı** — büyük harfli, tireli değil, `lib/slugify.ts`
  konvansiyonuna aykırı (Mart 2026'dan). Sayfa 200 dönüyor ve linkleri var,
  yani acil değil; düzeltilirse 308 yönlendirme gerekir.
- **Oyun verisi gösteren üç yüzey** — liste kartları öncelikli, çünkü **tıkların
  %96.8'i orada.** FC 27 çekimi bunu toptan düzeltecek.
- **API-Football 4. kademe** — hesap askıda, zarar yok ama eşleşmeyen isimde
  3.3 sn gecikme. **Çıkarılabilir.**

---

## ✅ Biten

**2026-09-20 — canlı sayfa sağlık kontrolü** (18 günlük 404 kesintisinden beri
park halindeydi). `node scripts/health-check.mjs` — sitemap'teki her URL'yi
Googlebot olarak çeker, dört şeyi kontrol eder: her URL 200 mü · yayındaki
yazılarla sitemap iki yönde uyuşuyor mu · orphan var mı (2'den az iç link) ·
kapak görseli eksik mi. Sıfır olmayan kod döner, deploy'u kesebilir.
İlk çalıştırmada **sitemap'te sayfası olmayan bir 404 buldu**
(`/world-cup-2026/lists`) — çıkarıldı. Şu an 132/132 temiz.
Her production deploy'undan sonra ve her gün 07:00 UTC'de GitHub Actions ile
otomatik çalışıyor (`.github/workflows/health-check.yml`). **Secret gerektirmiyor.**

**İsteğe bağlı, 2 dakikalık kurulum:** GitHub → Settings → Secrets and variables
→ Actions → *Variables* sekmesine `NEXT_PUBLIC_SUPABASE_URL` ve
`NEXT_PUBLIC_SUPABASE_ANON_KEY` eklenirse bir kontrol daha açılır: yayında olup
sitemap'e hiç girmemiş yazı var mı. İkisi de zaten tarayıcıya giden public
değerler. **Servis anahtarı asla gerekmiyor.**

**2026-09-20 — sosyal altyapı**
- `scripts/social-pack.mjs` — yayınlanan yazının gövdesinden Reddit açısı, X yanıt
  cümleleri (karakter sayılı), carousel slaytları, 16 sn video kurgusu, kart URL'leri.
  Hiçbir cümleyi kendisi yazmaz; hepsi `sections_json`'dan birebir alıntı. $0.
- İçerik taşıyan **dört kart varyantı** — `/api/social-card?variant=stat|contrast|verdict|list`.
  Style A (`variant=cover`) aynen duruyor. Dördü de kapak görseli gerektirmiyor.
- `/api/admin/social-text` **silindi** — başlıktan yazıyordu ve her çağrıda Anthropic
  API'ye para ödüyordu. Yerine `lib/social-extract.mjs`, script ve panel ortak.
  Panel bloklarını editörün state'inden okuyor: ağ çağrısı yok, kaydedilmemiş
  taslakta da çalışıyor. Hub/preset sayfalarına `buildPresetCopy`.

**2026-09 — içerik & altyapı**
- #149 Ngumoha, #151, #152 yayında ve indekste
- Ana sayfa kartları yanlış kulüp gösteriyordu — `fc_players` curated kimliği
  eziyordu; select'ten club/league/age çıkarıldı, `scripts/form-pool.mjs` havuzu doğruluyor
- `**bold**` liste bloklarında düz metin render ediliyordu (lansmandan beri, #102 dahil)
- `--update` canlı yazıyı sessizce yayından kaldırıyordu — guard eklendi
- ISR cache script güncellemelerini 24 saate kadar gizliyordu — `/api/revalidate`
- Tablo bloğu (`@table:` / `@table:ranked`)
- Navigasyon sıralaması — kazanılana göre, geçen yazın hikâyesine göre değil
- Türkçe denetimi üç katmanda temiz. **İki Türkçe URL senin kararınla Türkçe kaldı**,
  gözden kaçma değil — hafızaya "sorulmadan tekrar düzeltilmesin" diye yazıldı.

**2026-09-20 — +7 gün Vercel kontrolü kapandı**

| ölçüt | 13 Eylül | 20 Eylül | değişim | limitin % |
|---|---|---|---|---|
| ISR Writes | 112K | 51K | −54% | 25% (önce %56) |
| Function Invocations | 137K | 61K | −55% | 6% (önce %14) |
| Fluid Active CPU | 2sa 47dk | 1sa 41dk | −40% | **42%** (önce %70) |

Tek sıkışık kalem CPU'ydu, sınıra çarpma riski fiilen kalktı. Pencere hâlâ
düzeltme öncesi günleri içeriyor, yani gerçek güncel hız bunun altında.
*Not: tahminim %20-25'ti, %42 çıktı — yön doğru, büyüklük değil.*
