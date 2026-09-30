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
**67'lik kartı var** (EA resmi sayfa). Hatanın kökü: tabloda Sullivan'ı bulamamak
"oyunda MLS yok"a çevrildi; yayın kapısı kartsız oyuncu iddialarını göremiyor.
*(2026-09-30 düzeltmesi: burada daha önce "setimizde 0 MLS oyuncusu var" yazıyordu —
**yanlıştı.** Tabloda 770 MLS oyuncusu var. Yayındaki hiçbir metne girmedi.)*

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
      oyunun sayısı gibi yazıyor. Tablo FC 26'nın 16.228 oyuncusunu içeriyor; EA'in
      FC 27'de 17.849 erkek oyuncusu var, sayılar birebir oyununki değil. Oyuncu reytingleri doğru; sorun sadece "oyunda
      toplam şu kadar" cümleleri. FC 27 importunda (~6 Ekim) setin kapsamı kontrol edilip bu
      cümleler "in the FC 26 database we use" gibi yeniden yazılmalı.
- [x] `fc_players` notu düzeltildi (hafıza). *(2026-09-30: "0 MLS" bilgisinin kendisi de
      yanlıştı — tabloda 770 MLS oyuncusu var.)*

---

## 🔴 Takvimli

### FC 27 verisi — ✅ IMPORT EDİLDİ (2026-09-30)

Plan ~6 Ekim'di; 30 Eylül'de EA'in kendi reyting sayfasından çekildi (Kaggle'ın 12 Eylül
kopyası lansman öncesiydi ve fotoğrafsızdı). **Tuzak:** EA'in bilinen API'si
(`drop-api.ea.com/rating/ea-sports-fc`) hâlâ FC 26 dönüyor — `scripts/fetch-ea-ratings.mjs`
bu yüzden ratings sayfasının kendisini okur ve sürümü Cavan Sullivan'la doğrular.

`fc_players` artık **17.849 satır, EA FC 27** (erkek). Eskinin %33'ü farklı kulüpteydi;
5.249 reyting yükseldi, 3.326 düştü. 17 yaşında 150 oyuncu (eskiden 52), 806 MLS.
Yedek: `backups/fc_players-2026-09-30.json` (16.228 satır, id'leriyle).

- [x] **Dondurma** — `data/card-snapshots.json`: 90 yayındaki yazının 316 kartı FC 26
      haliyle donduruldu, canlıda doğrulandı (Ngumoha yazısı 68, tablo 75; Centre-Backs
      import öncesiyle birebir). **Her importtan önce:** `node scripts/freeze-cards.mjs
      --dataset <etiket>` → commit → deploy → sonra import.
- [x] Çekme (`fetch-ea-ratings.mjs`) → `--dry` rapor → yedek → import (`import-fc-players.mjs
      --write`: önce ekler, sonra eskiyi siler; site boş tablo görmez)
- [x] Takma kulüp adları import içinde düzeltiliyor (Lombardia FC→Inter, Milano FC→AC Milan,
      Bergamo Calcio→Atalanta). Lazio FC 27'de lisanslı ("SS Lazio").
- [ ] **Senin adımın:** `supabase/migrations/fc_players_dataset_version.sql`'i Supabase SQL
      editöründe çalıştır (`created_at` + `dataset_version`). DDL'i ben çalıştıramıyorum.
      Sonra import script'i satırlara sürümü kendisi yazsın.
- [ ] **Bekleyen üç yazı FC 26 ile yazıldı** — #153 England, #155 Portugal, #158 Dowman.
      Yayından önce metindeki reytingler FC 27'ye güncellenmeli (dondurulmadılar; kartları
      zaten FC 27 gösterecek).
- [ ] Yeni yazılarda Scout Gamer Read satırı artık **EA FC 27** yazar.
- [ ] EA'in ilk canlı reyting güncellemesinde (Ekim–Kasım) yeniden çek: aynı üç komut.

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

**Üç yazı `pending`, üçü de FC 27'ye göre hazır (2026-09-30).** #156 ve #157 yayında.

| # | Başlık | Not |
|---|---|---|
| 153 | England's Best Young Footballers | FC 27'ye güncellendi: 10 Read satırı + FC 27'nin yanlışladığı 3 cümle (Ngumoha "en düşük", George "Chelsea", Moore "Rangers") |
| 155 | Portugal's Best Young Footballers: **Five** of the Seven Have Already Left | **Yeniden yazıldı.** Mora 19 Ağu'da Roma'ya gitmişti; eski tez ("Porto'nun tuttuğu") yanlıştı. Yeni slug (hiç yayınlanmadı, link yok). Simões sakatlığı, M. Fernandes baldır eklendi; Roger F. kaynaksız istatistikler çıkarıldı. **Açık karar:** FC 27'de Gustavo Sá (76, Olympiacos) ve Mateus Mané (74, Wolves) listedeki bazılarından yüksek — kadroya girsinler mi? |
| 158 | Max Dowman | Zaten FC 27'ye göre düzeltilmişti · #157'ye link veriyor |

Kapak görseli yayının şartı değil; kart varyantları görselsiz çalışıyor.

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
- [x] 12. **Kampanya çerçevesi** — [SOCIAL-STRATEGY.md §12](SOCIAL-STRATEGY.md) (2026-09-26)

**Strateji tamamlandı (12/12, 2026-09-26). Sıradaki:**
- [ ] §11.9'daki açık kararlar (sen)
- [ ] **Aşama 0 — BEKLEMEDE (karar: 2026-09-27).** Paylaşım, FC 27 verisi çekilip
      değerlendirilene kadar (~6 Ekim) başlamaz. O zamana kadar: görsel ve metin çalışması ↓

**Görsel ve metin çalışması — FC 27 verisine kadar**

*Özel görsel — önce bu (§8.7, 2026-09-27)*
- [ ] **Hero düzeni** — senin görselin kırpılmadan: X'te tam + sayı, Instagram'da bant + sayı,
      9:16'da bant. Carousel'in 1. slaytı. (Bugün 4:5'te yüz yarıdan kesiliyor, 9:16'da kadraj dışı.)
      **DENEMEDE (2026-09-27)** — `exp/hero-card` dalında, `variant=hero`. Main'e birleştirilmedi,
      push edilmedi, canlıda yok. İki kapakla (#157, #150) üç formatta render edildi; ikinci
      turda metin ortalandı, hikâyedeki üst geçiş kaldırıldı. Karar (2026-09-27): kullanıcının
      görselleri **kırpılmaz, olduğu gibi** yerleşir (krem kenarlık dahil). PNG'ler ~1,4 MB — bilgi.
- [ ] **Odak noktası** — admin'de kapak yüklemenin yanında sol / orta / sağ (isteğe bağlı)
- [ ] **Sosyal kuyrukta görsel durumu** — hazır / eksik (Aşama 1 kuyruğuyla birlikte)

*Havuz şablonları (§6.7) — öncelik sırasıyla*
- [ ] Karşılaştırma — iki oyuncu
- [ ] İpucu kartı (Oyuncuyu tahmin et)
- [ ] Anket kartı
- [ ] Carousel kapanış / CTA slaytları
- [ ] İlk 11 dizilişi · zaman çizelgesi · dörtlü sayı tablosu · tek sayfa liste · tarihli makbuz
- [ ] Scout Gamer Read kartı — FC 27 verisiyle doldurulur (~6 Ekim)

*Görseller (§8.6)*
- [ ] a. contrast ve list kartlarını 4:5'te büyüt
- [ ] b. Kartta oyun sürümü damgası (*EA FC 26* / *EA FC 27*)
- [ ] c. Etiket ayağı söylesin (*THE LIST · CARD VS REALITY · THE RECEIPT · ONE TO WATCH*) — §8.5
- [ ] d. Makbuz kartında tarih
- [ ] e. Carousel seti — kapak + oyuncu başına slayt + kapanış
- [ ] f. "Scout Gamer Read" kartı — Style A'nın yanına, yerine değil
- [ ] g. Alt text üretimi

*Metinler*
- [ ] h. `social-pack.mjs` → stratejiye göre metin: ilk satırda anahtar kelime (§9.3), ses
      kuralları (§4.3), hashtag seti (§9.4), CTA dili (§10.5), UTM (§10.6 c)
- [ ] i. Sosyal metin kapısı — yasak kalıplar (§4.3), havuz sayısı (§6.6), sürüm/hashtag
      uyuşmazlığı (§9.4), reşit olmayan oyuncu etiketi (§7.4) — `preflight.mjs` gibi reddeder
- [ ] j. Yanıt bankası üreteci — §7.5'teki dört tür
- [ ] k. Bio metinleri — §4.5 (hesap adı kararıyla birlikte)
- [ ] l. `SOCIAL-PLAYBOOK.md`'yi stratejiye göre Aşama 0 kılavuzu olarak yeniden yaz

*FC 27 verisi gelince:* kart vs gerçek görselleri FC 27 reytingleriyle doldurulur; FC 26'lık
her görsel sürüm damgasıyla işaretli kalır.
- [ ] `SOCIAL-PLAYBOOK.md`'yi stratejiye göre yeniden yaz — Aşama 0'ın işletim kılavuzu
- [ ] Aşama 1 kurulumu — §11.8 sırasıyla

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
