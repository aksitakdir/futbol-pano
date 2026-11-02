# Scout Gamer — To-Do

Son güncelleme: 2026-10-24

Bu liste sohbette yaşıyordu ve her sorulduğunda yeniden kuruluyordu. İlk repo
sürümünü bir sohbet **özetinden** kurdum ve dört madde ile birçok gerekçe düştü;
bu sürüm 20 Eylül'ün orijinal kapsamlı listesinden yeniden kuruldu. Ders şu:
liste burada yaşar, hafızada değil.

Tamamlananı silmeyin — **Biten** bölümüne taşıyın. Neyin ne zaman çözüldüğü,
tekrar eden sorunları görmenin tek yolu.

---

## 🎯 0. İçerik stratejisi v2 — çeşitlilik ve farklılaşma (2026-10-24, en öncelikli)

Sahibin tespiti (24 Eki): kapaklar ve seslendirmeler birbirine çok benziyor; hesabın geneline
fark yaratacak bir post stratejimiz yok. Veriyi güzel paketliyoruz ama videonun ilk kısmında
"herkesten farklı söylediğimiz şey" yok. Kapak, renk, ses ve bağlam her anlamda çeşitlenmeli.
Kaynak sınırlı olduğu için post'lar metin ağırlıklı kalıyor; X'te bir ölçüde tolere edilir,
Instagram'da karşılık bulmaz.
- [x] Taslak hazır (24 Eki): **`docs/CONTENT-STRATEGY-V2.md`** — teşhis, kanca grameri, 5 seri,
      bağlam takvimi, araçlar, gerçekçi saat (~3,5–4 sa/hafta), 4 haftalık test (26 Eki–22 Kas).
- [x] **Kararlar 1–3 onaylandı (25 Eki):** iddia ilk karede · Kopa gecesi satırları (Yamal'a "Our ballot went to
      Cubarsí." eklendi, iki seslendirme onaylı; kredi yalnız kazananınkine) · Wonderkids v2 olduğu gibi yayında.
- [ ] **Kalan kararlar (§10):** 1 Kas'a kadar 4–6 (Doué hücresi · insansız sosyal görsel ·
      haftalık yük) → 8 Kas'a kadar 7–10 (Your Call açık tema · Midjourney planı · ElevenLabs planı/kredi ·
      AI etiketi).
- [ ] 1. hafta (Claude): Kopa gecesi kiti · Rundown/RundownWide'da iddia ilk karede · ikinci ses dinlemesi
      (`video/out/vo-samples/`, kredisiz). Sonraki işler belgenin §11 tablosunda, sırayla.
- [ ] 23 Kas: test kararı → `docs/SOCIAL-STRATEGY.md` §6/§8/§9'a işle (yerine koyma, ekle).

---

## 🔥 Bu hafta — trafik (2026-10-20)

Trafik son dönemde düşüyor. Olası nedenler (veriyle doğrulanacak): Dünya Kupası talebinin
bitmesi; hub ve ana sayfa linklerinin Google'a görünmemesi (P0–P3 ile 19–20 Eki'de düzeldi,
etkisi 2–4 haftada gelir); ve **7 hazır yazının yayında olmaması.**

**1. Bekleyen 6 yazıyı yayına al** (#166 Rodri Effect yayına girdi) — tek eksik kapak (Midjourney, sahip üretiyor; 1456×816,
`--ar 16:9`). Not: kapak yayının teknik şartı değil, kart varyantları görselsiz çalışıyor.
Yayınlayınca hub, ana sayfa (In Focus, Latest) ve kardeş yazıların "More in" blokları
kendiliğinden yenilenir.

| Sıra | # | Yazı | Neden şimdi |
|---|---|---|---|
| ~~1~~ | ~~164~~ | ~~The Best FC 27 Wonderkids~~ | **yayında (24 Eki)**; video + postlar `video/out/ready-to-post/` |
| ~~2~~ | ~~168~~ | ~~Best Young Wingers~~ | **yayında (29 Eki)**, 31 tazeleme + sahip kararları (El Mala forvet notu, Gomes "Out for Now", Quenda) |
| ~~3~~ | ~~169~~ | ~~Best Young Defenders~~ | **yayında (29 Eki)**, 34 tazeleme canlıda; bölüm "Left Out on 16 October"; Cubarsí Kopa 2. (#173 linki) |
| 4 | 170 | Turkey's Best Young Footballers | "most valuable turkish players" yükselen sorgu → yayınlanınca #39'dan 301 |
| ~~5~~ | ~~166~~ | ~~Rodri Effect~~ | **yayında** |
| 6 | 160 | Number 10s | 30 Eyl verisi — yayından önce dakika/sakatlık kontrolü |
| 7 | 161 | Netherlands | 30 Eyl verisi — yayından önce dakika/sakatlık kontrolü |

Midjourney promptları (kimliği belirsiz figürler — gerçek oyuncu üretmek hukuken riskli). 24 Eki revizyonu:
"football" Midjourney'de Amerikan futbolu çıkarıyor → hep "soccer" + `--no american football, helmet…`.
Kompozisyon: makale banner'ı solu karartıp başlığı oraya yazıyor, masaüstünde üst-alt kırpılıyor, mobilde
yalnızca ortadaki ~%45 (genişliğin %27–72'si) görünüyor → özne ortanın sağında (~%60–65) ve dikeyde ortada.
- **#164:** `glowing holographic soccer trading cards floating in a dark void, an anonymous young soccer player with a soccer ball at his feet emerging from one card, face in shadow, subject placed right of centre and vertically centred, dark empty negative space on the left third, game-culture aesthetic, painterly brush strokes, teal and amber light, editorial illustration --no american football, helmet, shoulder pads, text, letters, numbers, logo, flag --ar 16:9`
- **#168:** `anonymous young soccer winger sprinting down the touchline with a soccer ball at his feet, motion blur, face in shadow, subject placed right of centre and vertically centred, dark empty negative space on the left third, expressive painterly brush strokes, dark background, splashes of crimson and teal, editorial sports illustration, cinematic lighting --no american football, helmet, shoulder pads, text, letters, numbers, logo, flag --ar 16:9`
- **#169:** `anonymous young soccer centre-back making a sliding tackle on a soccer ball, low angle, powerful stance, face in shadow, dark stadium atmosphere, subject placed right of centre and vertically centred, dark empty negative space on the left third, painterly brush texture, deep teal and red accents, editorial sports illustration --no american football, helmet, shoulder pads, text, letters, numbers, logo, flag --ar 16:9`
- **#170:** `silhouette of a young soccer player in a red kit walking out of a tunnel into floodlights with a soccer ball under his arm, crescent-shaped light flare, subject placed right of centre and vertically centred, dark empty negative space on the left third, painterly texture, dark moody palette with red and white accents, editorial illustration --no american football, helmet, shoulder pads, text, letters, numbers, logo, flag --ar 16:9`
- **#166:** `anonymous holding midfielder standing at the centre of the pitch with passing lines radiating around him like a tactics board, dark background, painterly strokes, teal and amber light trails, editorial sports illustration, no text, no logos --ar 16:9`
- **#160:** `anonymous soccer playmaker receiving a soccer ball between the lines, glowing passing lanes opening ahead of him, soccer pitch seen from above, face in shadow, subject placed right of centre and vertically centred, dark empty negative space on the left third, painterly brush texture, gold and teal accents, editorial sports illustration --no american football, helmet, shoulder pads, text, letters, numbers, logo, flag --ar 16:9`
- **#161:** `young soccer player in an orange kit with a soccer ball, silhouetted against a low northern sky, subject placed right of centre and vertically centred, dark empty negative space on the left third, painterly brush texture, orange and deep blue palette, editorial sports illustration --no american football, helmet, shoulder pads, text, letters, numbers, logo, flag --ar 16:9`

**1b. Yeniden doğrulama (24 Eki): 41 olgusal düzeltme bekleyen 6 yazıya uygulandı (yedekli).** Sahibin
futbol kararları — yayından önce:
- **#164 (yayında, 24 Eki):** Doué okuması "generous in September, earned in October" oldu (9 düzeltme canlıda;
  admin kaydı bir kez ezdi, yeniden uygulandı). Açık: tablo hücresi hâlâ "Generous" — "Generous, then earned"
  mı olsun? (Video ekranı tablodan okur.) Tarih tuzakları: Diomande 14 Kas'ta 20, Risser 2 Ara'da 22 olur.
- **#168:** El Mala son iki maçta ikili forvetin solunda → kanat listesinde kes / frame_exception / farkı
  konu yap. William Gomes sakat (Ekim'deki iki CL maçını kaçırdı) ama "Playing Every Week" altında.
- **#169:** "Moved, Benched or Waiting" dağılıyor: Huijsen, Hato, Lewis-Skelly yeniden ilk 11'de. Ganiou dizden
  ameliyat (birkaç hafta). Ramón son 3 lig maçının 2'sinde yedek.
- **#170:** Tek ülke listesi + coğrafi tarafsızlık (#161 Hollanda ile dönüşümlü kabul?). Uzun 11 Kas'ta 21,
  Öztaşdelen 9 Ara'da 22 (çerçeve dışına düşer).
- **#160:** Wanner 27 Eyl'den beri kadroda yok ama listenin başında "Ready Now". Uzun 16 Eki'de yedek.
- **#161:** Tarih çapası 30 Eyl → Eki'ye taşınacak mı (Hato ilk 11'de)? Smit sakat ("Read and Smit may be
  next"?). Steur'ün €24m'si için yayın günü tarihli kaynak gerekli.
- ~~**Araç:** Highlightly anahtarı 401 dönüyor~~ — çözüldü 24 Eki: dictumus ile paylaşılan PRO anahtarı `.env.local`'de, test edildi.

**2. Kopa (#167, yayında)** — videolar ve metinler `video/out/ready-to-post/` (POSTS.md).
- [x] **Sonuç (26 Eki): Yamal kazandı, Cubarsí 2., Zaïre-Emery 3.** Makbuz yazısı **#173 "Kopa Trophy 2026 Ranking:
      What We Said, and What Happened" yayında (27 Eki)**; #167'ye 12 düzeltme + #173 linki canlıda; seo-check temiz.
      Makbuz videosu ("We Said Cubarsí", 37 sn, iki format) ve post'lar `ready-to-post/` — CONTENT-STRATEGY-V2'deki
      "The Receipt" kalıbının ilk örneği. Dikkat: Yamal'ın sözü için "deserved it the most" KULLANILMAZ (İspanyolcasında yok);
      ESPN çevirisi "This prize should have been for him." Eski "Yamal wins" Profile kiti iptal (kredi harcanmadı).
- [ ] **Card vs Pitch #1 (Zabiri) paylaşıldı (30 Eki, X + Instagram).** 6 Kas'ta 7. gün ölçümü: ilk "Card vs Pitch" verisi
      (Charlie sesi + seriye özel bed + yorum çağrısı "What would you rate Zabiri?"); makbuz ve geri sayımlarla kıyaslanacak.
- [ ] **Makbuz videoları paylaşıldı (28 Eki, X + Instagram).** 4 Kas'ta 7. gün ölçümü (CONTENT-STRATEGY-V2 §9):
      IG 3 sn atlama oranı + ortalama izleme, X yanıt/alıntı + profil ziyareti. İlk "Receipt" verisi, geri sayımlarla kıyaslanacak.
- [x] Videolar paylaşılmaya başladı (24 Eki: 2-3'ü X ve Instagram'da yayında).
- [ ] 26 Eki gecesi: kazananı yazıya güncelleme olarak ekle + ikinci video. Kit yalnız iki senaryo
      için hazırlanıyor: Yamal ya da Cubarsí (sahibin kararı, 24 Eki).

- [x] **#169 kontrolü yapıldı (2 Kas, 6 düzeltme canlıda):** Tiago Gabriel 29 Eki Frosinone'da ilk 11 (tablo 7), Arthur Dias 29 Eki
      Grêmio'da 90 dk (tablo 30, Athletico 5.), Kasım milli kadrosu eklendi. Eski not: Tiago Gabriel 29 Eki Frosinone maçında oynadı mı (25 Eki Juventus'ta topallayarak
      çıktı; tablo 6 ilk 11), Arthur Dias 29 Eki gece Grêmio'da oynadı mı (24 Eki sağ uyluk; 29 ilk 11, "fourth in the table").
      Tarih tuzakları: Rico Lewis 21 Kas'ta 22, Tiago Gabriel 26 Ara'da 22, Ramón 6 Oca'da 22.

**2b. Radar: haftada en az bir yazı.** Son Radar 11 Eki (#158); bekleyen yazıların hepsi liste.
Son üç Radar'ın üçü de Premier League (Dowman, Sullivan, Ngumoha) → yeni ikisi başka liglerden.
- [ ] **#171 Zabiri: 29 Eki tazelendi (15 düzeltme, LaLiga resmi gol tablosuyla birebir), yayına hazır — kapak bekliyor** (silüet prompt'ları, öneri A). **#172 Brunner (Monaco) pending:** 13 tazeleme hazır (uygulanmadı); kararlar: men cezası/sevinç nasıl anlatılacak, "Germany's next striker" kapanışı.

**3. Google Search Console** (sahip, birkaç tık)
- [ ] Sitemap'i yeniden gönder.
- [ ] "Dizine eklenmesini iste": `/`, `/lists`, `/radar`, `/articles` (artık linklerini gösteriyorlar).
- [ ] Teşhis için dışa aktar: GSC Performance son 28 gün vs önceki 28 gün (sayfalar + sorgular),
      GA4 aynı dönem (Singapur/Çin bot trafiği hariç).

**4. Sonraki 2 hafta**
- [ ] Trafiğin %97'sini getiren listeleri tazele: Strikers (17 Ağu), Centre-Backs (9 Tem) — güncel sezon verisi.
- [ ] Golden Boy yazısı (Kasım) · "FC 27 one month in".
- [ ] Her yeni listeye bir Remotion videosu — ama `CONTENT-STRATEGY-V2.md` §7: 4 videodan en fazla 1'i geri sayım, o da bizim hükmümüze göre sıralı.
- [ ] Kart kapak görselleri tam boy JPEG yüklüyor (/lists'te ~13 MB) → küçük önizleme boyutları.
- [ ] Güvenlik: bekleyen yazılar herkese açık anahtarla tam metinleriyle okunabiliyor → RLS
      (önizleme için sunucu tarafı istemci gerekiyor; ayrı, dikkatli iş).
- [ ] Senin kararın: Transfers / WC / Arena sayfa başlıklarında "| Scout Gamer | Scout Gamer" tekrarı.

- [ ] **#148 Nico Paz (Radar, 26 Ağu) — doğrula.** Yazı "Madrid geri aldı ve aynı hafta €60m'ye Como'ya geri sattı, yeni geri alım €80m" diyor; 19 Eki oyuncu doğrulaması ise "Como'da kalıyor, Madrid'in 2027-28 için geri alım hakkı var" buldu (#130 de "stays at Como"). Çelişki çözülmeden bu yazıdan video ya da sosyal paylaşım yapılmasın.

**Video altyapısı (2026-10-20/21):** `video/` çalışma alanı (Remotion 4), commit'li. Sıra:
`node scripts/from-article.mjs <id>` (veri, yazıdan) → seslendirme metni `data/<slug>.vo.json` (sahip onaylar)
→ `node scripts/voiceover.mjs <slug> --voice <id>` (ElevenLabs; Brian = `nPczCjzI2devNBz1zQrb`)
→ `node scripts/music.mjs <slug> <saniye>` (ElevenLabs Music, sözsüz) → `node scripts/render.mjs <slug>`.
Sahneler seslendirmeye göre uzar; müzik konuşmada kısılır. macOS 13'te Remotion'un ffmpeg'i çalışmıyor:
kareleri `frames2mp4.swift`, sesi `mixaudio.swift` (AVFoundation) işliyor. Kopa reel'i: 66,9 sn, ~10 dk render.
Anahtar `.env.local`'da (`ELEVENLABS_API_KEY`, kısıtlı yetki: seslendirme + müzik).
`render.mjs` ElevenLabs'ı hiç çağırmaz: görsel değişiklikten sonra yeniden render bedava. X için 16:9:
`node scripts/render.mjs <slug> --format x` → `reel-x.mp4` (aynı seslendirme ve müzik; şimdilik yalnız Rundown).
Kapakta yüz varsa (macOS Vision, `faces.swift`) arka plan o yüzü isimli oyuncunun arkasına düşürmez.
Altyazı varsayılan olarak videoya gömülür (seslendirme metninden, kliplerdeki duraklamalara hizalı) ve
`out/<slug>/captions.srt` olarak da yazılır (X'e yüklemek için); `--no-captions` kapatır. `--theme light`
açık renk versiyon (`reel-light.mp4`). Bit hızı 3,5 Mbps (65 sn ≈ 30 MB; 2,5/4,5/6 ile karşılaştırıldı).
Eski videoları yeniden render etmeden küçültmek: `scripts/shrink.swift`.
Mecra kontrolü (23 Eki): elle paylaşım için dikey → Instagram, 16:9 → X olduğu gibi geçiyor. Yayını ileride
Instagram Graph API ile otomatikleştirirsek iki düzeltme gerekiyor: `moov` atomu başa (mixaudio.swift'te
`shouldOptimizeForNetworkUse = true`) ve edit list olmadan kaydetme. Gömülü altyazılı videoya `.srt` ekleme
(X ve Instagram altyazıyı ikinci kez üstüne basar).

---

## 🚨 Doğru çözüm: linkler sayfa gövdesine, footer standarda (plan 2026-10-19)

Footer'daki dizin bir yamaydı: hub'lar ve ana sayfa yazı listelerini tarayıcıda çekiyor,
Google ilk geçişte gövdede link görmüyor. Plan 5 okuyucu + planlayıcı + eleştirmen ile
çıkarıldı; tam çıktı oturum kaydında. Kural: hiçbir aşama bir sayfanın ham HTML'indeki
link sayısını düşürmez; footer dizini en son, sayfa sayfa, gövde linkleri taşıdığında kalkar.

**Önce — acil (Kopa 22 Ekim'den önce):**
- [x] **MOST READ ölü bağlam gösteriyor.** *(2026-10-19, `61b6752`: son 90 gün + en az 3 yazı; sayaç SQL'i sahibince çalıştırıldı — okunmalar sayılmaya başlayınca blok kendiliğinden döner.)* Her yazının sonunda Mayıs'tan 4 Dünya Kupası
      yazısı (top, İngiltere kadro açıklaması...). Sebep: `increment_view_count` eski Türkçe
      `status = 'yayinda'` filtresiyle sayıyor, sayaç Mayıs'tan beri donuk. Hemen: bloğu gizle
      ya da "Latest"e çevir. Sonra: SQL düzeltmesi (Supabase SQL editor — sen çalıştırırsın).
- [x] **Admin'den yayın hub'ları yenilemiyor.** *(2026-10-19, `61b6752`: `lib/revalidate-content.ts`, tüm admin yazma yolları + Enrich + script'ler; canlıda doğrulandı — bir liste yazısı yenilenince /lists ve kardeş yazılar REVALIDATED.)* Liste sayfasındaki Publish/toplu butonlar
      (`app/admin/articles/actions.ts`) ve `createContent` hiçbir sayfayı revalidate etmiyor;
      /lists, /radar, /tactics-lab tamamen statik → footer dizini bir sonraki deploy'a kadar
      yeni yazıyı içermiyor. Tek yardımcı: `lib/revalidate-content.ts`, tüm yazma yollarına.
      Vercel'de revalidatePath'in gerçekten çalıştığı canlıda test edilecek (sitemap'te çalışmamıştı).
- [x] **Geçici Supabase hatası 24 saatlik 404'e dönüşüyor.** *(2026-10-19, `61b6752`: sayfalar, metadata, footer dizini ve In Focus hata fırlatıyor; build sayfa başına 3 kez yeniden dener.)* Beş `[slug]/page.tsx`
      `if (error || !data) notFound()` — hata atılmalı, 404 sadece satır yoksa.

**Aşamalar (her biri ayrı deploy):**
- [x] **P0 — seo-check v2.** *(2026-10-19: sitemap'ten makale seti, gövde/footer ayrı sayım, hub'ın en yeni yazıyı linklemesi, bölüm başına en yeni/en eski yazı, canonical ve "Not Found" başlık kontrolü; 8 bilinçli bozmanın 8'ini yakaladı. `deploy.sh`: push öncesi `next start` kontrolü, push sonrası Vercel'i bekleyip canlıda kontrol.)* Gövde ve footer linklerini ayrı sayar (bugünkü kontrol footer'ı
      da sayıyor, yanlış geçiyor), makale setini sitemap'ten alır, `/` ve `/articles`'ı da
      kapsar, deploy sonrası canlıya karşı çalışır. `next dev` prod'daki boş sayfayı gizliyor.
- [x] **P1 — Hub'lar sunucuda:** *(2026-10-19: dört sayfa sunucuda; gövde linkleri /lists 32, /radar 16, /tactics-lab 20, /articles 128; "Load more" yok, /articles'ta 24 kart + eski yazılar düz liste. Bu üç hub'ın footer dizini kalktı (P5a) — yazı sayfaları dizini P2'ye kadar taşıyor. Radar kapak sabitlemesi hiç çalışmıyordu (sayı/metin id) — düzeldi. Açık: Transfers, WC ve Arena başlıkları hâlâ "| Scout Gamer | Scout Gamer" — başlıklara dokunulmaması istendi; kart kapakları tam boy JPEG yüklüyor (eskiden de öyle, ~13 MB /lists) — ayrı performans işi.)* /lists, /radar, /tactics-lab, /articles. Prod'da /lists,
      /radar ve /articles'ın ham HTML'inde `<main>` ve `<h1>` bile yok (useSearchParams +
      fallback'siz Suspense → client render). /lists'e konu çipleri satırı (Positions /
      Countries / EA FC) gövdede kalır. Başlık tekrarı düzelir ("| Scout Gamer | Scout Gamer").
- [x] **P2 — Yazı sonuna "More in <bölüm>"** *(2026-10-20, yerelde: `lib/related-articles.ts` — konu, tarih zincirinde komşular, en yeni; kenar çubuğu da aynı veriden. `seo-check --full`: 128 yazının hepsi gövdeden en az bir kardeş linki alıyor (ilk koşu aynı zaman damgalı 3 tactics yazısını yetim buldu, düzeltildi). Build artık `.next/cache/fetch-cache`'i siliyor: önbellekten eski Supabase verisiyle derlemiyor.)* (6 link: ortak oyuncu, önceki/sonraki yazı,
      en yeni; her yazının en az bir kardeş linki garantili). MOST READ'in yerini alır.
- [x] **P3 — Ana sayfa bölümleri sunucuda** *(2026-10-20: hero, carousel, In Focus, haftanın oyuncusu (ISO hafta), On Our Radar (günlük), All Articles (carousel'i tekrarlamıyor) `lib/home-data.ts`'ten; gövdede 20 link, LOADING yok; footer dizini kalktı (sahibin 1. seçeneği). Kapak sabitleme okuyucusu metni çözmüyordu — düzeldi.)* (hero, carousel, All Articles, Featured,
      On Our Radar). "Player of the Week" gerçekten haftalık döner.
- [ ] **P4 — Transfers ve WC hub'ları sunucuda;** boş /transfers/lists ve /transfers/radar
      ziyaretçiye "Add hub_tags in admin" gösteriyor → /transfers'a 301.
- [ ] **P5 — Footer standarda,** sayfa sayfa; tek footer root layout'ta, `<main>` dışında.
- [ ] **P6 — Temizlik:** ölü kod, CLAUDE.md sapmaları (tek cron var, service-role client var),
      `/en/radar` çift yönlendirme, tarih formatlarının saat dilimi hatası, çift Andrey Santos satırı.

**Senin kararın:** yazı sayfalarında footer'daki 32 bölüm linki yerine 6 "More in" linki +
hub linki; hub'larda tüm yazılar mı, "daha fazla" mı; MOST READ gizlensin mi; Player of the
Week haftalık mı; bekleyen yazıların herkese açık API'den listelenebilmesi (RLS) kapatılsın mı;
/articles indekslensin mi.

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

- [ ] **#167 Kopa Trophy 2026 — en geç 22 Eki yayınla** (tören 26 Eki, Londra, 20:00). Pending, kontrolden
      geçti. Hüküm: "Yamal muhtemelen kazanır, Cubarsí hak ediyor" (oy pusulamız 5-3-1: Cubarsí,
      Yamal, Diomande). **26 Eki gecesi:** kazananı ekle → "makbuz" güncellemesi + sosyal paylaşım.
- [ ] **Golden Boy 2026** — kazanan Kasım'da (25 finalist, 5 Eki). Kopa araştırmasının çoğu ortak.

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

## ✅ Yayın tarihi tetikleyicisi — kuruldu ve test edildi (2026-10-06)

Site her yazıyı `created_at` ile tarihliyor ve sıralıyor; toplu yazılıp günler sonra yayınlanan
yazılar eski görünüyordu (#153/#155: "September", ana sayfada eski yazıların altında,
`datePublished` 20 Eylül). #153 ve #155 elle 6 Ekim'e çekildi, canlıda doğrulandı.
- [x] SQL çalıştırıldı. Test: pending satır tarihini korudu → published olunca bugüne atladı →
      yayındaki yazıyı yeniden kaydetmek tarihi değiştirmedi. Test satırı (#162) silindi.

**Tarih notu (2026-10-06):** #158–#161 ve #163'ün girişlerine verinin tarihi eklendi ("Figures as of …"),
"this month / end of September" ifadeleri ay adına çevrildi. Dowman yeniden doğrulandı: hâlâ 9 PL dakikası
(tek maç 19 Eylül) — #158'in başlığı geçerli. Kural scout-editor skill'ine eklendi.

## ✅ Kart etiketleri ve özetleri (2026-10-06)

Admin, blok yazılarda `content_en`'e `<p></p>` yazıyordu → 124 yayındaki yazının 88'inde kartta "FROM CONTENT"
etiketi ve kart özeti yoktu, RSS açıklaması boştu. Admin artık blokların metin kopyasını yazıyor
(`lib/sections-to-html.mjs`); 88 yazı `scripts/backfill-content-en.mjs --write` ile dolduruldu
(yedek: `backups/content_en-before-backfill-2026-10-06.json`). Sayfaların görünen metni değişmedi.
Aynı gün: etiketler "TİER" (Türkçe büyük harf) gösteriyordu → `lib/highlight-pill-text.ts` en-US'e çekildi.
- [ ] Bazı otomatik etiketler zayıf ("$5m", "one sixteen-year-old England") — etiket üreticisinin
      kalitesi ayrı bir iş; istenirse yazı başına elle etiket alanı.

## 🟠 Yayın kuyruğu

**17 Eki durumu:** yayında #153, #155, #158, #159, #163, #165 · pending #160, #161, #164, #166 (Rodri/6'lar), #167 (Kopa),
#168 (Best Young Wingers — GSC: kanat sorgularında sıfır görünürlük), #169 (Best Young Defenders — GSC: ~420 gösterim/28g, sayfa yoktu).
Not: Álex Jiménez (Fiorentina) FA soruşturması süren iddialar nedeniyle listelerden bilinçli olarak çıkarıldı.
#170 (Turkey's Best Young Footballers — açı onaylı: dakika nerede; GSC: "most valuable turkish players" yükselen sorgu).
**#170 yayına girince:** eski #39 `/lists/turkey-most-valuable-players-arda-kenan` (Mart, zayıf) → #170'e 301 yönlendir
(next.config.ts redirects; sorgu sinyalini yeni sayfaya taşır) — onayınla.
Sitemap artık her istekte üretiliyor (`dee43cb`); yeni yayın anında sitemap'e girer.

| # | Başlık | Not |
|---|---|---|
| 153 | England's Best Young Footballers | FC 27'ye güncellendi: 10 Read satırı + FC 27'nin yanlışladığı 3 cümle (Ngumoha "en düşük", George "Chelsea", Moore "Rangers") |
| 155 | Portugal's Best Young Footballers: **Seven of the Nine** Have Already Left | **Yeniden yazıldı; Gustavo Sá + Mateus Mané eklendi.** Mora 19 Ağu'da Roma'ya gitmişti; eski tez ("Porto'nun tuttuğu") yanlıştı. Yeni slug (hiç yayınlanmadı, link yok). Simões sakatlığı, M. Fernandes baldır eklendi; Roger F. kaynaksız istatistikler çıkarıldı. Not: FC 27'de Mathias de Amorim (73, Famalicão — evde) da Simões'ten yüksek; listede değil. |
| 158 | Max Dowman | Zaten FC 27'ye göre düzeltilmişti · #157'ye link veriyor |
| 159 | The Best Young Goalkeepers in World Football Right Now | **Yeni (2026-09-30), toplu oturum #1.** 10 kaleci, FC 27. Kanca: Risser/Beltrán/Motta +10. Derin keşifler: Domchak, Motta. |
| 160 | The Best Young Number 10s in World Football — and Why There Are So Few of Them | **Yeniden kuruldu (2026-09-30).** Tez: 10 numara nadir ve zor tanımlanıyor (Yıldız solda, Güler ancak bu yıl 10). İki bölüm: "Playing the Ten" (Uzun, Maza, Wanner, King, G. Mora, **Batrakov**, Montoro) / "Tens by Card, Not by Job" (Karetsas, Mastantuono) + Páez. Batrakov kartsız ve oyun verisinden hiç söz edilmeden anlatılıyor (kullanıcı kararı: sonradan güncelleme riski). |
| 161 | The Netherlands' Best Young Footballers: Six of the Ten Are Still at Home | **Yeni (2026-09-30), toplu oturum #3.** Düz ülke listesi (bek açısı reddedildi: mevki havuzu geniş). Banzuzi (DR Kongo), Ouaissa (2 Eki'de 22), Addai (sakat) dışarıda; SSS'te Banzuzi açıklaması. |
| 163 | Italy's Best Young Footballers: The Talent Is There. The Minutes Are Not. | **Yeni (2026-10-06), toplu oturum #4.** Tez: on oyuncunun bu sezonki lig dakikası toplamı 1.242 (Palestra ve Leoni 0). Sayılar metinde "as of 6 October 2026" diye tarihli; yayın gecikse de doğru kalır. |
| 164 | The Best FC 27 Wonderkids — and What the Game Gets Wrong About Them | **Yeni (2026-10-06), FC 27 dalgası — öncelikli yayın.** 13 oyuncu ≥81; 6 "adil" (tablo + kutu), 7 uzun bölüm (cömert: Doué, Diomande · yanlış mevki: Yıldız, Zaïre-Emery, Güler · düşük: Froholdt, Mainoo) + Cissè/Palestra. Pending yazılara link verilmedi. |
| 165 | FC 27's Biggest Rating Jumps: The Young Players the Game Upgraded Most | **Yeni (2026-10-12), FC 27 dalgası.** 9 oyuncu (Gozo +16 … Manzambi +13); Diomande/Palestra/Mané diğer yazılarda (Italy/Portugal'a link). Gözlem: 6'sı kulüp değiştirdi, yalnız Salinas 300+ dk. Kim Min Su (+20) isim çakışması → çıkarıldı. |

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

## 🟡 Yedek kaynak kartları oyun reytingi gibi görünüyor (2026-09-30)

Oyunda olmayan bir oyuncu için kart; `fc_players` → `player_cache` → BSD → API-Football
zincirinden gelen bir "OVR" gösteriyor (Batrakov: 68, BSD'den). Kart, EA reytingiyle aynı
görünüyor. "Oyunda yok" diyen bir yazının altında bu bir çelişki; genel olarak da okura
oyun reytingi sanılacak bir sayı veriyor.
- [ ] Karar: yedek kaynaktan gelen kartlar (a) "not in EA FC" etiketiyle ayrı görünsün, ya da
      (b) makale içinde hiç gösterilmesin, "Uncharted / No rating yet" yer tutucusu çıksın.
      Öneri (b) + `@player:` bloğunda isteğe bağlı `uncharted` bayrağı.

## 🟢 Sıradaki yazı adayları (2026-10-06)

- [x] **FC 27'nin en büyük genç reyting sıçramaları** — #165 olarak yazıldı. Veri: Kim Min Su +20 (Girona), Diomande +18,
      Palestra +17, Gozo +16, Matondo/Detourbet/Salinas +15, Karl/Methalie/A. Ibrahimović +14.
- [ ] Best Young Defensive Midfielders (6'lar) — CDM etiketine değil sahadaki role göre seç.
- [ ] Lig listesi: Best Young Players in La Liga (ya da Serie A / Ligue 1); alternatif USA / Morocco.
- [ ] En çok tıklanan sayfaların (Centre-Backs, Strikers, Full-Backs) FC 27 güncellemesi — aynı URL, karar bekliyor.

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
- [x] ~~**Aşama 0 — BEKLEMEDE**~~ FC 27 verisi geldi (6 Eki) → **Aşama 0 başladı, 12 Eki.**
- [ ] **Hafta 1 paylaşım kiti (13–19 Eki)** — [kit](https://claude.ai/artifact/SnbyaWKAE2A6W8hFz5L5tr):
      36 gönderi + 50 yanıt satırı + 3 Reels. 5 yazı (#163, #158, #153, #155, #164) ajanlarla
      tazelendi → yazıldı → çürütmeye çalışılarak doğrulandı; 86 öğe mekanik kontrolden geçti.
      Dosyalar `social-out/<slug>/` (gitignore'da). Paylaşımı **sen** yaparsın (§5.5).
- [ ] **Hafta 2 kiti** — aynı akış; Cuma'ya kadar hafta 1'in sayıları (§2.5) ile.
- [x] **Yayındaki yazılarda bayat/yanlış satırlar (12 Eki taraması)** — #158 Sullivan "16" (28 Eyl'de
      17 oldu), #155 Sá "Şampiyonlar Ligi" (Olympiacos elendi) + Roger Fernandes ön çapraz bağ, #153
      Moore "asist" (kendi kale golü), #163 Palestra kartı "debut bekliyor". İki bağımsız doğrulama →
      **31 düzeltme canlıda (12 Eki, onayınla)** + #164'te 5. Ham HTML'de Googlebot olarak doğrulandı.
      Metinler `data/corrections/`, orijinaller `backups/`. Araç: `scripts/patch-article-text.mjs`.

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
- [x] e. Carousel seti — `node scripts/social-video.mjs <id> [--feature "Ad"]` → `social-out/<slug>/carousel/`
      (başlık → öne çıkan oyuncu → diğerleri → liste, en fazla 10) (12 Eki)
- [ ] f. "Scout Gamer Read" kartı — Style A'nın yanına, yerine değil
- [x] g. Alt text üretimi — panelde ve kopya paketinde, kart sırasıyla (12 Eki)

*Metinler*
- [x] h. Mecra metinleri — `lib/social-copy.mjs` (panel + `social-pack.mjs` ortak): X ana gönderi
      (linksiz) + ilk yanıtta link + tek sayılı gönderiler + anket + thread + yanıt bankası; IG
      carousel / tek görsel / alt text / story; Reels · TikTok · Shorts; Reddit; Threads · Bluesky ·
      LinkedIn · Facebook (plan dışı, hazır). Aşama seçici (§10.3), UTM (§10.6 c), hashtag (§9.4),
      www alan adı (12 Eki)
- [~] i. Sosyal metin kontrolü — panelde "Check before posting": yasak kalıplar, sürüm/hashtag,
      18 yaş altı, yayınlanmamış link, 14 günden eski yazı (§6.6), karakter sınırı. Henüz
      reddetmiyor, uyarıyor; havuz sayısı kontrolü yok.
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

**Video (12 Eki):** `node scripts/social-video.mjs <id> [--reel "headline,stat:0,player:Ad,verdict"]`
→ 9:16 MP4 (H.264, 30 fps, ~6 Mbps), kartlar yavaş zoom + geçişle. Swift/AVFoundation
(`scripts/video/reel.swift`) — ffmpeg yok, indirme yok, API maliyeti yok. **Sessiz** üretilir;
müzik paylaşırken uygulamanın lisanslı kütüphanesinden eklenir (§11.9 #6'ya önerim: sessiz +
ekran metni + uygulama içi ses).

**Beklemede — strateji bitince**
- Oyun kitabındaki FC 27 kampanyası ve araç listesi (UTM, yanıt bankası, player card)

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
