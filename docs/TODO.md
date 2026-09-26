# Scout Gamer — To-Do

Son güncelleme: 2026-09-26

Bu liste sohbette yaşıyordu ve her sorulduğunda yeniden kuruluyordu. İlk repo
sürümünü bir sohbet **özetinden** kurdum ve dört madde ile birçok gerekçe düştü;
bu sürüm 20 Eylül'ün orijinal kapsamlı listesinden yeniden kuruldu. Ders şu:
liste burada yaşar, hafızada değil.

Tamamlananı silmeyin — **Biten** bölümüne taşıyın. Neyin ne zaman çözüldüğü,
tekrar eden sorunları görmenin tek yolu.

---

## 🚨 Canlıda yanlış bir iddia — #157 Sullivan (2026-09-26 bulundu)

Yazının tezi: *"EA FC 26 MLS'i taşımıyor, lig lisanssız; Sullivan'ın kartı yok."*
**Yanlış.** MLS EA FC'de lisanslı — Quinn Sullivan'ın (Philadelphia Union) resmi
FC 26 reyting sayfası var. Cavan'ın FC 26'da olmamasının sebebi büyük ihtimalle
**yaş kuralı** (EA 17 yaş altını almıyor — Dowman'la aynı). Ve FC 27'de artık
**67'lik kartı var** (EA resmi sayfa). Hata, Kaggle setimizdeki 0 MLS oyuncusunun
oyunun kendisi sanılmasından çıktı; yayın kapısı kartsız oyuncu iddialarını göremiyor.

- [x] **#157 yerinde düzeltildi (2026-09-26).** Dört blok değişti (giriş, MLS callout'u,
      SSS, kapanış), stat bloğuna FC 27 kartı (67) eklendi, sona tarihli bir düzeltme notu
      kondu. URL, kapak ve diğer 16 blok dokunulmadı. Yedek: `sections_json` önceki hali.
      Eski sosyal paket kullanılmaz; `social-pack.mjs` canlı veriden yenisini üretir.
      Not: *"70 bekliyordu"* iddiası doğrulanamadı, hiçbir yere girmedi.
- [x] **#158 düzeltildi (2026-09-26), hâlâ `pending`.** Dowman'ın FC 27'de olmadığı ve
      bu sezon 9 lig dakikası oynadığı yeniden doğrulandı — başlık ve tez sağlam. Değişen:
      callout, karşılaştırma tablosunun iki "kart" satırı, SSS. Sullivan artık "67, ilk kartı".
      Veri setimizin "52" sayısı çıkarıldı. İki kolon (`sections_json` + `content_en`)
      birlikte güncellendi. Düzeltme notu yok — hiç yayına girmedi.
- [ ] **Sakin, acil değil — havuz sayıları.** #152 (*"424 centre-backs aged 21 or under in
      EA FC 26"*) ve #154 (*"593 central midfielders… in EA FC 26"*) veri setimizin sayısını
      oyunun sayısı gibi yazıyor. Set MLS'i içermiyor, başka ligleri de eksik olabilir —
      gerçek sayı büyük ihtimalle daha yüksek. Oyuncu reytingleri doğru; sorun sadece "oyunda
      toplam şu kadar" cümleleri. FC 27 importunda (~6 Ekim) setin kapsamı kontrol edilip bu
      cümleler "in the FC 26 database we use" gibi yeniden yazılmalı.
- [x] `fc_players` notu düzeltildi (hafıza): "0 MLS" veri setinin özelliği, oyunun değil.

---

## 🔴 Takvimli

### FC 27 verisi — hedef ~6 Ekim (karar: 2026-09-26)

Oyun 25 Eylül'de çıktı ama lansman ile verinin oturması arasında zaman geçiyor
(ilk günlerde reyting düzeltmeleri, eksik oyuncular, veri setlerinin güncellenmesi).
**~10 gün beklenip 6 Ekim civarı çekilecek.** Acele yok.

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

## 🔐 Güvenlik — açık kalanlar (2026-09-26 incelemesi)

- [ ] `CLAUDE.md` "iki cron" diyor, `vercel.json`'da tek cron var (`/api/cron` artık
      zamanlanmıyor). Doküman düzeltmesi.

## 🟠 Performans — 2026-09-26 incelemesinden

- [ ] **Ana sayfa arşivine "en çok okunan" bloğu.** "Son 15" kuralı yüzünden
      **Argentina (tık sıralamasında 3., 112 tık) ana sayfadan hiç linklenmiyor.**
      Her yeni yayın bir kanıtlanmış sayfayı daha dışarı itecek.
- [ ] **GSC ingest script'i + sabit skor tablosu.** Downloads'ta 41 export var,
      hepsi farklı pencerelerde; karşılaştırılabilir tek bir seri yok.
- [ ] **Argentina başlığı** — poz 6,7, TO %2,08. Strikers'ın %4,1'ine çıksa +110 tık.
- [ ] Core Web Vitals ölçülmüyor — Speed Insights kurulu değil.

---

## 🟠 Yayın kuyruğu

**Beş yazı `pending`.** Hepsi kapak görseli bekliyor — ama **kapak artık yayına
girmenin şartı değil.** Kart varyantları (stat/contrast/verdict/list) görselsiz
çalışıyor; bir yazı bugün yayına alınıp bugün dağıtılabilir. Kapak yalnızca
Style A kartını açıyor.

| # | Başlık | Not |
|---|---|---|
| 153 | England's Best Young Footballers | |
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

## 📣 Sosyal medya — strateji çalışması (kapsam onaylandı 2026-09-26)

Önce strateji, sonra uygulama. Strateji: [`docs/SOCIAL-STRATEGY.md`](SOCIAL-STRATEGY.md).
Mevcut [`docs/SOCIAL-PLAYBOOK.md`](SOCIAL-PLAYBOOK.md) bir
işletim kılavuzu taslağı — strateji tamamlanınca ona göre yeniden yazılacak.

**Strateji kapsamı — sırayla**
- [x] 1. **Mevcut durum teşhisi** — [SOCIAL-STRATEGY.md §1](SOCIAL-STRATEGY.md) (2026-09-26)
- [x] 2. **Amaç ve ölçü** — [SOCIAL-STRATEGY.md §2](SOCIAL-STRATEGY.md) (2026-09-26)
- [x] 3. **Hedef kitle** — [SOCIAL-STRATEGY.md §3](SOCIAL-STRATEGY.md) (2026-09-26)
- [x] 4. **Konumlanma ve ses** — [SOCIAL-STRATEGY.md §4](SOCIAL-STRATEGY.md) (2026-09-26)
- [x] 5. **Platform rolleri** — [SOCIAL-STRATEGY.md §5](SOCIAL-STRATEGY.md) (2026-09-26)
- [x] 6. **İçerik ayakları ve formatlar** — [SOCIAL-STRATEGY.md §6](SOCIAL-STRATEGY.md) (2026-09-26)
- [x] 7. **Etkileşim stratejisi** — [SOCIAL-STRATEGY.md §7](SOCIAL-STRATEGY.md) (2026-09-26)
- [x] 8. **Görsel kimlik sistemi** — [SOCIAL-STRATEGY.md §8](SOCIAL-STRATEGY.md) (2026-09-26)
- [x] 9. **Hashtag ve anahtar kelime stratejisi** — [SOCIAL-STRATEGY.md §9](SOCIAL-STRATEGY.md) (2026-09-26)
- [x] 10. **CTA ve dönüşüm** — [SOCIAL-STRATEGY.md §10](SOCIAL-STRATEGY.md) (2026-09-26)
- [x] 11. **İşletim modeli** — [SOCIAL-STRATEGY.md §11](SOCIAL-STRATEGY.md) (2026-09-26) — açık kararlar §11.9'da
- [ ] 12. **Kampanya çerçevesi** — güncel olaylar (transfer penceresi, oyun çıkışı, milli maçlar) stratejiye nasıl bağlanır

**Ölçülmüş sıfır noktası (26 Eyl):** X 54 gönderi / 2 takipçi · IG 51 gönderi / 4 takipçi

**Konuşuldu, kararlar açık (2026-09-26) — orkestra modeli (§11'e girecek)**
Ajanlar (şef + içerik / keşif / yanıt / doğrulama / rapor) taslak üretir → `/admin/social`
onay kuyruğu → **kendi gönderilerimiz** onayla otomatik yayınlanır (Vercel cron + X/IG API);
**başkalarına yanıt/yorum** ajan hazırlar, sen tek dokunuşla gönderirsin — X kuralları
anahtar kelimeye dayalı otomatik yanıtı yasaklıyor, IG API başkasının gönderisine yorumu
desteklemiyor. Tahmini katılım: kurulum ~2–3 saat, sonra haftada ~1,5–2 saat.
Açık kararlar: (1) bu çizgi, (2) X API aylık tavanı, (3) IG profesyonel hesap + FB sayfası,
(4) sıralama — önerim §3–7 önce.

**Hesaplar (senin cevabın, 26 Eyl):** TikTok, YouTube, Reddit hesabı yok.
- [ ] **Reddit hesabı — erken aç** (sen). Hafta 3'te katılım başlayacaksa şimdiden yaşlanmalı.
- [ ] TikTok + YouTube hesapları — hafta 3'e kadar (sen). Hesap adı kararıyla birlikte (§4.5).

**Beklemede — strateji bitince**
- Oyun kitabındaki FC 27 kampanyası ve araç listesi (UTM, yanıt bankası, player card)
- Video kararı: sessiz + ekran metni mi, seslendirme mi

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

**2026-09-26 — güvenlik turu, ikinci yarı.** Güvenlik başlıkları canlıda
(`X-Frame-Options`, CSP `frame-ancestors`, `X-Content-Type-Options`,
`Referrer-Policy` — `/admin` dahil). Bilinçli olarak tam CSP değil.
`npm audit`: **0 açık** — dördü kırılmadan güncellendi, beşincisi hiç kullanılmayan
Anthropic SDK'daydı; SDK ve tek kullanıcısı olan eski Türkçe çeviri script'i silindi.
`social-card` ve kalan dört rota Edge'den Node'a taşındı — build uyarısı 2 → 0, üç OG
görseli dinamikten statiğe geçti (canlıda `x-vercel-cache: PRERENDER`).

**2026-09-26 — iki güvenlik düzeltmesi.**
Yedi API rotası kimlik doğrulamasızdı (`proxy.ts` sadece `/admin` sayfalarını
kapsıyor, `/api`'yi değil): `migrate-content` ve `auto-cover` tek istekle tüm
yazılara yazabiliyordu, dördü Anthropic API'ye para harcatıyordu. Hepsine
`isAdminRequest()` eklendi; cron `ADMIN_PASSWORD` ile Basic auth yapıyor
(açığa çıkmış `CRON_SECRET`'ın yetkisini genişletmemek için). Ve Next.js
16.1.6 → **16.3.6**: 29 advisory, proxy bypass'lar dahil — `/admin`'in tek
koruması proxy olduğu için doğrudan ilgili. Audit 9 → 5, kritik 1 → 0.
Production'da doğrulandı: 7 rota + `/admin` 401, health-check 135/135.

**2026-09-22 — ana sayfanın tarama yolu.** `app/page.tsx` `"use client"` ile
başlıyordu; ham HTML 36 KB ve içinde tek bir yazı linki yoktu, iki yerde
`LOADING...` vardı. Artık sunucu bileşeni: interaktif ana sayfayı içine alıyor,
altına kategori sayfalarındaki `ArticleIndexLinks` geliyor. Googlebot olarak
ölçüldü: **0 → 41 yazı linki.** Hero ve karusel hâlâ client-render — bu düzeltme
onların yanına gerçek bir tarama yolu ekliyor, onları dönüştürmüyor.

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
