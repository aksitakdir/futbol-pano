# İçerik stratejisi v2 — çeşitlilik ve farklılaşma (tartışma taslağı, 24 Ekim 2026)

**Neden var:** Sahip 24 Ekim'de dört tespit yaptı:
1. Kapaklar ve seslendirmeler birbirine çok benziyor; hesabın geneline fark yaratacak bir post stratejimiz yok.
2. Veriyi güzel paketliyoruz ama "herkesten farklı söylediğimiz şey" videonun ilk kısmında yok.
3. Kapak, renk, ses ve bağlam her anlamda çeşitlenmeli; yoksa kendini tekrar eden bir seriye dönüşürüz.
4. Kaynak sınırlı olduğu için post'lar metin ağırlıklı kalıyor. Bu X'te bir ölçüde tolere edilir, Instagram'da karşılık bulmaz.

**Nasıl hazırlandı:** dört bağımsız denetim yapıldı: çıktıların tekrar ölçümü, ilk saniyelerde farkımız, araç kapasitesi, platformlar. Bunlardan üç öneri çıktı; öneriler sentezlendi, sentez 43 maddelik bir eleştiriden geçti, sonra Claude düzeltti. Ham çıktılar scratchpad'de. Bu belge **onaylı bir plan değil**, masadaki öneridir. Kararlar §10'da.

**Yerine değil, yanına:** `docs/SOCIAL-STRATEGY.md`'yi (26 Eylül, 12 bölüm) değiştirmez. Özellikle §6 (ayaklar), §8 (görsel kimlik) ve §9 (hashtag) bölümlerine eklenir. Kararlar verilince ilgili bölümlere işlenir.

---

## 1. Teşhis — ne tekrar ediyor

*Kaynak: `video/data/*.json`, `*.vo.json`, `video/out/ready-to-post/`, şablonlar. Sayım 24 Ekim.*

**1.1 Ölçülenler**
- **Biçim:** Ürettiğimiz 4 videonun 4'ü de geri sayım (Kopa adayları, kaleciler, FC 27 sıçramaları, Wonderkids). Yayında olan 2–3 tanesi.
- **Sıralama ve doruk:** 4'ü de oyunun sırasıyla akıyor ve oyunun 1 numarasıyla bitiyor. Kopa ile Wonderkids aynı cümleyle doruğa çıkıyor: *"And the game's number one: Lamine Yamal, ninety."*
- **Kapak:** 4'ü de aynı düzen. Büyük beyaz başlık, üstünde "N NOMINEES/GOALKEEPERS/PLAYERS", arkada Midjourney görseli. Kaleciler ve Wonderkids kapaklarında anonim bir yüz öne çıkıyor.
- **Ses ve müzik:** Üretilen 4 seslendirmenin 4'ü Brian. Kopa kazananı için hazırlanan 2 seslendirme de Brian. Müzik bedi 2 tane, ikisi de aynı "awards countdown" prompt'undan.
- **Kart:** Her sahne aynı: monogram, rank, isim, reyting barı, hüküm. Aynı renk sırası. Ekranda kart metni ve altyazı birlikte akıyor; görsel çoğu sahnede bulanık arka plan.
- **Kapanış:** 6 kapanışın 5'i *"The full read is on scoutgamer.com."*
- **Oyuncular:** Yamal ve Cubarsí iki videoda başrolde. 26 Ekim'de bu ikiliyle üçüncü video gelecek.
- **Ayak dağılımı:** `SOCIAL-STRATEGY.md` §6.3 listelere ~%40 pay vermişti. Videolarda bu oran %100.

**1.2 Kancalar tek kalıp: sayı + "EA FC 27" + yaş**
- Kopa: *"Ten nominees for the Kopa Trophy. Here's how EA FC 27 rates them…"*
- Kaleciler: *"Goalkeepers are supposed to arrive late. Here are the ten best aged twenty-one or under…"*
- Sıçramalar: *"Nine of the biggest EA FC 27 upgrades among players aged twenty-one or under."*
- Wonderkids: *"EA FC 27 rates thirteen players aged twenty-one or under at eighty-one or higher."* İkinci cümle hükmü veriyor (*"six cards hold up. Seven don't."*); sorun girişte ve oyunun sırasıyla biten akışta.

**1.3 Kök neden.** Kurgu oyunun sırasıyla aktığı için her video EA'nın hükmüyle doruğa çıkıyor. Bizim bulgumuz ortada bir yerde kalıyor. Post metinleri bunu zaten doğru yapıyor: Sıçramalar'ın X postu *"28 Premier League minutes"* ile açılıyor. Kurgu ise tersini yapıyor.

**1.4 İyi tekrar, kötü tekrar**
- **Kalacak, çünkü marka:** SG logosu, yazı tipleri, monogram, reyting barı, `FIGURES AS OF` damgası, gömülü altyazı, koyu tema (List'te), uçtaki scoutgamer.com.
- **Değişecek, çünkü yorgunluk:**
  - hep geri sayım;
  - yalnız başlık taşıyan kapak;
  - kanca kalıbı;
  - oyunun 1 numarasıyla biten doruk;
  - tek ses, tek müzik;
  - sabit renk sırası;
  - her postta "not ours";
  - aynı başrolün tekrarı.

---

## 2. Farkımız ve ilk 3 saniye

**2.1 Fark tek cümlede.** Kartı olgu olarak değil, tarihli bir iddia olarak okuyoruz. Oyunun sayısını sahanın belli bir tarihe kadar gösterdiğiyle yan yana koyar, hükmümüzü veririz: adil, geride, cömert, yanlış görev. Kartın henüz görmediği isimleri de söyleriz.

**Test:** EA'nın ratings sayfası bu ilk cümleyi aynen yayınlayabilir mi? Yayınlayabiliyorsa cümle bizim değil.

**2.2 Kanca grameri.** Her kalıbın kendi ilk karesi var; kapaklar böylece kendiliğinden farklılaşır.

| Kalıp | Şablon (İngilizce) | İlk kare |
|---|---|---|
| The Split | "[Card number]. [Pitch number]." | Kart ve saha, arada hüküm damgası |
| The Deep Cut | "[Rated 66]. [What he is doing]. That's how early you are." | Boş ya da düşük kart yuvası |
| The Receipt | "On [date] we said X. [Outcome]." | Tarihli cümlemiz ve sonuç |
| Their Order, Our Order | "The game ranks X first. We rank Y first." | İki sütun, kesişen ok |
| The Scoreboard | "[N] cards. [M] don't hold up." | Damgalı kart ızgarası |
| The Wrong Job | "The card files him as X. His club plays him as Y." | Pozisyon rozeti (RW/CAM) ve sahada nokta |

**The Wrong Job** kalıbı ancak şu koşullarda kullanılır:
- kulübün onu nerede oynattığı en az 3 yakın tarihli doğrulanmış ilk 11'den (Highlightly `recentRoles`) ya da yazıdan gelmeli;
- sahip futbol onayını vermeli.

Bu kalıp hiçbir zaman oyunun pozisyon etiketine dayanmaz (bkz. "The Vanishing No. 10" dersi).

**Kanca kuralları**
- En fazla 13 kelime, ~5 saniye. İlk sayı 2. saniyeden önce gelir.
- "Here's / Here are / EA FC 27 rates…" ile açılmaz.
- Yaş ve tarih seste değil, ekranda.
- Aynı kalıp art arda iki videoda kullanılmaz.

**2.3 İlk kare.** Laptop'tan X'e yüklenen videoda ilk kare kapak olur (094b430).
- **0. kare:** iddiayı tamamlanmış haliyle gösterir. Bugün başlığa yaptığımız gibi, iddia da yerinde durur. Hareket ikincil öğede olur: damga, dakika barı.
- **Kapak PNG'si:** o kareden alınır. Bu, X'te ve Instagram profil ızgarasında kapakların birbirinden ayrışmasını sağlar.
- **Ekrandaki metin:** altyazı hariç en fazla 8 kelime.
- **Yüz:** adı geçen oyuncunun yanında hiçbir yüz olmaz, kapak dahil.

**2.4 Doruk kuralı.** Son vuruş bizim bulgumuzdur. Oyunun 1 numarasıyla ancak hükmümüz sürpriz olduğunda biteriz.

**2.5 Bir örnek: aynı veri, iki kurgu**
- Bugünkü Sıçramalar videosu 9,4 saniyelik bir kancayla açılıyor ve bulguya ~60. saniyede geliyor.
- Split kurgusuyla:
  - **Kanca:** *"Plus sixteen on the card. Twenty-eight league minutes."*
  - **0. kare:** `55 → 71` ile `28 MIN · as of 12 Oct` karşı karşıya.
  - **Gövde:** dakikaya göre dizili dokuz bar. Salinas'ın 634 dakikası tek başına öne çıkar.
  - **Kapanış:** *"Which of the nine plays a thousand first?"*
  - **Süre:** ~25 sn.
- Rakamlar videonun verisinden alınmıştır. Yayınlanmadan önce yeniden çekilir (§6.2).

---

## 3. Seri portföyü

Her serinin kendi işi, rengi, sesi ve kapanışı var. Bütün serilerde ortak olanlar §1.4'teki marka öğeleri ve sağ üstte seri etiketi.

**Ortak hüküm damgası:** `SCOUT GAMER READ · [hüküm] · [tier]`. Tier'lar sitenin sabit setidir: Generational · Elite Now · Elite-in-Waiting · Ready Now · Watchlist · Raw Gem. Aynı imza böylece kapakta, videoda ve yazıda dolaşır.

| Seri | İşi | Biçim ve platform | Sıklık | Renk | Ses | Görsel |
|---|---|---|---|---|---|---|
| **Card vs Pitch** (②) | Farkımızı 10 saniyede gösteren imza | 8–15 sn'lik döngü; 9:16, ortası 4:5'e güvenli; IG + X | Haftada 1 | cyan / amber | **İkinci ses** (§5.1); ses-sessiz testi yapılır; kısa bed + damga efekti | Midjourney yok, grafik |
| **Deep Cut #NN** (③) | Takip sebebi: isim karttan önce gelir; newsletter "The Deep Cut" ile aynı ad | 4:5 carousel, 5–6 slayt (sessiz ya da uygulamadan müzik); X'te thread | Haftada 1 | sky | Yok (carousel) | Seri sref'i (insansız) |
| **The List** (①) | Bilinen talep, yazı trafiği | ≤45 sn reel (IG), 16:9 (X); arada carousel | IG'de iki haftada 1 | emerald | Brian, yeni bed | Bulanık arka plan kalır |
| **Your Call** (⑤) | Yanıt ve paylaşım | Quiz carousel (IG), anket (X) | Haftada 1, List ile dönüşümlü | Açık tema (karar 7) | Yok | Grafik |
| **The Receipt** (④) | Otorite | 10–15 sn | Bir iddia sonuçlandığında | rose | İkinci ses, tek satır | Tarihli damga |

**Seri ayrıntıları:**
- **Your Call ipuçları:**
  - yaş bandı;
  - lig dakikası, "as of" tarihiyle;
  - FC 27 overall;
  - bizim tier'ımız.

  Potansiyel (POT) EA'nın resmi sayfasında olmadığı için ipucu olarak kullanılmaz. Hiçbir ipucu kişisel değildir.
- **Kapanışlar seriye göre değişir:**
  - List: *"Which one did we get wrong?"*
  - Your Call: cevap bir sonraki gün.
  - Card vs Pitch: bir soru ya da sessiz döngü.

  Deep Cut numarası ancak üç bölüm yayınlandıktan sonra başlar; "next week" sözü sürdürülebilir olunca verilir.
- **Dinlendirme:** aynı oyuncu 14 gün içinde iki kez başrol olmaz (Receipt hariç).
- **Lig tarafsızlığı:**
  - art arda iki başrol aynı ligden olmaz;
  - 4 haftada en az 3 konfederasyondan başrol olur;
  - U21 taramasının havuzu lig başına bir üst sınırla kurulur.

  Son üç Radar'ın üçü de Premier League'di; bu kural onu da kapsar.

---

## 4. Bağlam takvimi (26 Ekim – 22 Kasım)

Sahibin dördüncü ekseni bağlamdı. Post'u o haftanın gerçek bir anına bağlamak, formatı değiştirmekten daha çok çeşitlilik yaratır. Aşağıdaki **hiçbir tarih hafızadan yazılmadı**. Her biri takvime girmeden önce doğrulanır.

| An | Hangi seri | Durum |
|---|---|---|
| Kopa Trophy kazananı, 26 Ekim gecesi | Receipt / Their Order, Our Order | Kit hazır (`video/data/kopa-winner/`) |
| Golden Boy 2026 finalistleri ve kazananı | List, Your Call, Receipt | Tarih doğrulanacak; TODO §4'te Golden Boy yazısı var |
| Kasım milli arası: ilk çağrılar | Receipt, Deep Cut | Tarih doğrulanacak |
| FC 27 sezon içi güncellemeleri ve in-form kartlar | Card vs Pitch | EA takvimi doğrulanacak |
| Football Manager'ın yıllık sürümü | Their Order, Our Order (FC vs FM vs biz) | Sürüm tarihi doğrulanacak |
| Pencerede olan gençlik turnuvaları | Deep Cut | Doğrulanacak |
| "FC 27 one month in" (TODO §4) | Card vs Pitch, List | ~28 Ekim |

Football Manager, konumlanmamızın ("EA FC, Football Manager") yarısı. Bu takvimle ilk kez sosyalde yer alır.

---

## 5. Araçların yeni kullanımı

**5.1 ElevenLabs** (planı ve kalan kredi bilinmiyor; karar 9)
- **İkinci ses:** sesin gerçekten duyulduğu bir video serisine gider: Card vs Pitch ve Receipt.
  - Önce `video/out/vo-samples/` içindeki ücretsiz örnekler (Charlie, Daniel) dinlenir.
  - Gerekirse Voice Design denenir.
  - Brian List'te kalır.
- **Teslimat çeşitliliği:** aynı ses de seriye göre farklı okuyabilir: `voice_settings` (stability, style, speed) ve metin ritmi. "İsim, kulüp. Sayı. Olgu." kalıbı bırakılır.
- **Zaman damgaları:** `/with-timestamps` uç noktası karakter düzeyinde zamanlama verir. Altyazılar ve damgalar sesle tam hizalanır.
  - Bu yalnız yeni üretilen seslerde geçerli.
  - Mevcut sesler yeniden üretilmeden kazanılmaz.
- **Müzik ve efekt:**
  - Seri başına bir müzik bedi (Card vs Pitch, List, Receipt) ve küçük bir efekt seti: kart çevirme, damga, geçiş. Bunlar bir kez üretilip tekrar kullanılır.
  - Kodumuz `music_v1` kullanıyor; denetim `music_v2_5` modelini de buldu (doğrulanacak).
  - Efekt fiyatı iki kaynakta farklı. Önce 3 efektle denenir.
  - Prompt'ta sanatçı adı geçmez.
- **Text to Dialogue** ("Gamer vs Scout" gibi iki sesli bir format): Card vs Pitch tutarsa 4. haftadan sonra düşünülür.
- **Eleven v4:** Denetime göre 28 Eylül'de çıktı ve fiyatı aynı. Doğrulanacak; Cubarsí ve Zaïre-Emery telaffuz testini geçmeden kullanılmaz.

**5.2 Highlightly** (PRO, kodda günlük tavan 240; dictumus ile paylaşılan anahtar 24 Ekim'de test edildi, çalışıyor)
- **Bugün bizde olan:**
  - `playerSeason` (lig dakikası, ilk 11, gol, asist);
  - `recentRoles` / `roleFromLineup` (son maçlarda nerede oynadığı).

  Card vs Pitch'in saha tarafı ve Wrong Job'un kanıtı buradan gelir.
- **Eklenecek:** beş maçlık dakika şeridi (`/box-score`, `/lineups`). Rakamlar tarihli bir JSON'a önceden çekilir; Remotion bileşeni yalnız o dosyayı okur. Anahtar hiçbir zaman render'a, tarayıcıya ya da siteye girmez.
- **Kullanmayacaklarımız:**
  - Highlightly'nin maç notu: EA'nın sayısının yanında ikinci bir reyting, "card vs pitch" fikrini bulanıklaştırır. Dakika, ilk 11 ve gol kullanılır.
  - Tam veri tabloları: ToS gereği veri dökümü yasak; tablolar yalnız yazılarımızdan gelir.
  - Odds ve tahmin uç noktaları.
- **U21 keşif taraması:** haftalık, önbellekli, lig başına üst sınırlı bir havuzla; ~60–90 istek/hafta.
- **Resmi highlight linkleri:** yeniden yüklemeden, X yanıtlarında link olarak verilebilir. Hak ve ToS kontrolünden sonra.

**5.3 Midjourney** (sahibin planı bilinmiyor; karar 8)
- **Seri başına bir stil:** her görsel seri için bir sref kodu ya da moodboard (Deep Cut ve List). Ay başında bir oturumda o ayın görselleri üretilir.
- **Kurallar:**
  - Prompt'ta oyuncu adı yok.
  - `--cref`/`--oref`/moodboard'a gerçek oyuncu, forma, arma, sponsor ya da tanınır stadyum girmez. Mimari icat edilmiştir.
  - Gerçek fotoğraf referans verilmez.
- **İnsansız görsel (karar 5):** Sosyal görsellerde insan olmazsa yüz sorunu kökten biter. Bedeli: yazı kapaklarındaki anonim figürlü görseller sosyalde tekrar kullanılamaz. Kaleciler ve Wonderkids kapakları bu yüzden yeniden kullanılmaz.
- **Kısa döngüler:** Video modeli bir görseli 5 saniyelik döngüye çevirebiliyor. Denetime göre maliyeti yaklaşık 8 görsel kadar (doğrulanacak). Basic'te ayda ~10 döngü düşünülebilir.
- **Gizlilik:** Stealth modu olmadan görseller herkese açık.
- **İnsan figürü kuralı (3 Kasım 2026, sahibin kararı; 5. kararı kapatır ve "hiç insan yok" önerisinin yerine geçer):** Futbolcu figürü olmayan bir akış işlevsel değil.
  - **Liste ve genel konu görselleri:** anonim futbolcu figürleri serbest. Arma ve sponsor yok; yüz profilde, gölgede ya da hareket halinde.
  - **Tek oyunculu yazılar (Radar, Card vs Pitch):** yalnızca silüet ya da arkadan görünüm; net yüz yok. Videoda gerekirse `coverBlur` kullanılır.
  - **Her zaman:**
    - prompt'ta oyuncu adı yok;
    - gerçek fotoğraf ya da `--cref`/`--oref` referansı yok;
    - videolarda isimli sahnelerin arkasında yüz tutmayan kadraj (`backdropSpec`).
- **Atmosfer rotasyonu (30 Ekim, sahibin tespiti):** Art arda verilen dört kapak prompt'unun dördünde de gece, yağmur, projektör ve film greni vardı. Her yeni kapak, bir öncekinden farklı bir ışık ve hava seçer:
  1. altın saat ya da gün batımı;
  2. açık kış öğleden sonrası;
  3. sis (yağmursuz);
  4. sert öğle güneşi ya da tepeden çekim;
  5. mavi saat;
  6. tünel ya da iç mekân;
  7. sabah antrenman sahası;
  8. gece projektörü (seyrek).

  "rain" her zaman `--no` listesinde durur, yağmur bilinçli olarak seçilmedikçe. Anonim silüet ve yüzün gölgede kalması değişmez.

**5.4 Remotion**
- **Yeni paketler:** `@remotion/transitions`, `@remotion/paths`, `@remotion/layout-utils`. 4.0.537'ye sabitlenerek kurulur.
- **Bunlarla gelen:**
  - seri başına bir kesme stili;
  - çizilen dakika çizgileri;
  - kutuya oturan büyük hüküm yazısı (*"SEVEN DON'T."*).
- **Render bütçesi:** 90 sn'lik video format başına ~15–25 dk sürüyor. İlk 10 sn'lik döngünün süresi ölçülecek. Ayrı 4:5 render yerine 9:16 çekilip ortası 4:5'e güvenli tutulur.
- **Carousel:** yeni bir kit gerekmez. `scripts/social-video.mjs` 4:5 kart üretiyor, genişletilir.

---

## 6. Üretim sistemi

**6.1 Haftalık takvim (önerilen, 3. haftadan itibaren)**

| | Instagram | X |
|---|---|---|
| Pzt | Card vs Pitch | Card vs Pitch (16:9) |
| Çar | Deep Cut carousel | Deep Cut thread'i |
| Cum | List reel **ya da** Your Call (dönüşümlü) | List thread'i / anket |
| Diğer günler | Yorumlara yanıt (yeni post değil) | Nişte yanıtlar, ölçülü |

Instagram'da haftada 3 feed post. X'te aynı 3 post, yanıtlar ve gerektikçe bir tablo ya da dakika thread'i.

**6.2 Her post için doğrulama**
1. Rakamlar Salı–Perşembe çekilir ve ekranda `as of [tarih]` yazar.
2. Rakam yazıdakinden farklıysa ya yazının tarihli rakamı kullanılır ya da yazıya sahip onayıyla tarihli bir güncelleme girer.
3. Yayından önce bir doğrulayıcı geçişi yapılır (Claude), sahip onaylar. 12 Ekim'den beri çalışan haftalık akış: tazele → yaz → karşıt doğrula.

**6.2b Her video paketinde (2 Kasım 2026, sahibin kararı)**
- Video (dikey ve 16:9), kapakları ve post metinleri (Instagram, X ana post, X'te linkli ilk yanıt) teslim edilir.
- Pakete **3 X yanıt cümlesi** eklenir. Sahip bunları başkalarının paylaşımlarının altına elle atar:
  - **A:** maç raporu ya da haber paylaşımlarının altına;
  - **B:** oyuncunun sezonu ya da kartı hakkındaki paylaşımların altına;
  - **C:** yalnızca biri "gerçekten ne kadar iyi?" diye sorduğunda.
- Kurallar (§7.4):
  - linksiz, etiketsiz, @'siz;
  - her biri tek bir doğrulanmış olgu ekler;
  - oyuncunun kendi hesabının altına yazılmaz;
  - her konuşmaya bir yanıt;
  - 220 karakteri geçmez;
  - rakamlar tarihlidir.
- Video bir maçtan önce paylaşılıyorsa, yanıtlar maçtan sonra yeniden doğrulanır; gerekirse zamanlanmış bir görevle.

**6.2c Etkileşim sprinti (3 – 30 Kasım 2026, sahip onayladı)**

Teşhis: içerik çalışıyor, dağıtım çalışmıyor. X'te 3 takipçi var, yanıt ve yorum neredeyse hiç atılmadı. SOCIAL-STRATEGY §7'deki plan, her gün nereye ne yazılacağını bulma yükü yüzünden uygulanmadı.
- **Sahip, hafta içi her gün ~15 dakika:**
  - listeden 3 konuşmaya hazır yanıt atar;
  - o hesabı takip eder ve post'u beğenir;
  - Instagram'da 2 yoruma yazar.
  - Haftalık hedef: 15 X yanıtı ve 10 Instagram yorumu.
- **Claude, her Pazartesi:** haftalık paketi hazırlar:
  1. konuşma haritası (o haftanın gerçek olayları);
  2. 15-20 yanıt cümlesi (yazılarımızdan, doğrulanmış ve tarihli; link ve etiket yok);
  3. var olduğu ve aktif olduğu doğrulanmış takip listesi (yaklaşık 30 hesap, lig ve ülke dengeli);
  4. ilk hafta bir kez: profil düzeltmeleri (biyografi, sabit post, kapak görseli).
- **İçerik:** sprint boyunca strateji aynen sürer, ama video haftada 1-2 ile sınırlanır; sahibin zamanı etkileşime gider.
- **Ölçüm:** her Cuma attığı yanıt sayısı, X ve Instagram takipçi sayısı, profil ziyaretleri.
- **Karar, 30 Kasım:**
  - takipçi ve profil ziyareti büyüdüyse tempo artar;
  - büyümediyse konuşma türleri değişir.

**6.3 Gerçekçi saat**

| Kalem | Haftada |
|---|---|
| Onaylar ve futbol imzası (her hüküm) | 40 dk |
| Midjourney (aylık oturumun haftalık payı) | 25 dk |
| 3 IG + 3 X post: kapak, ilk yanıt linki, alt metin; carousel müziği telefondan | 60 dk |
| Yanıtlar | 50 dk |
| Render kontrolü | 20 dk |
| Haftalık rapor | 15 dk |
| **Toplam** | **~3,5–4 sa** |

`SOCIAL-STRATEGY.md` §11.7 1,5–2 saat öngörüyordu; o hesap Aşama 2 otomasyonunu varsayıyordu. Paylaşım ve yanıt elle kaldığı için gerçek yük iki katı. Bu, karar 6'dır.

**6.4 Bir kez kurulur**
- `series.ts`: seri başına palet, ses, bed, efekt, görsel klasörü, etiket, kapanış, hashtag.
- 3 bed, küçük bir efekt seti, ikinci ses, 2 sref.

**6.5 Kredi**
- **Tek seferlik:** ~3.000–4.500 kredi (3 bed, efektler, gerekirse ses önizlemesi).
- **Haftalık:** ~600–900 kredi (seslendirmeler, X için kanca varyantları); ayda ~3.500–4.000.
- **Doğrulanacak:** ElevenLabs planı ve kalan kredi (karar 9). 21 Ekim'de "yeni bir şey almadan" denmişti.

---

## 7. Sınırlandıracaklarımız (silmiyoruz)

1. **Geri sayım:** 4 videodan en fazla 1'i. O da bizim hükmümüze göre sıralanır, oyunun sırasına göre değil.
2. **Bulanık arka plan:** yalnız List'te kalır. Diğer serilerde grafik ya da seri görseli.
3. **Seslendirmedeki link cümlesi:** List'te kalır; diğerlerinde uç kartta scoutgamer.com yeterli. Bio linki çalışıyor mu, kontrol edilir.
4. **"Not ours" uyarısı:** video başına bir kez, ekranda. Her post metninde değil.
5. **Hashtag:** §9.4'ün üç katmanının üstüne seri etiketi. Gündem etiketi yalnız konuyla ilgiliyse. 18 yaş altı oyuncu adıyla hashtag yok.
6. **Instagram'da video süresi:** 45 saniyeyi aşmaz. X'te uzun versiyon kalabilir.
7. **Yazılı sayılar:** altyazıda bitti (24 Ekim, `captions.mjs` `written()`).

---

## 8. Kurallar — yeni formatlarla gelen riskler

- **18 yaş altı oyuncular:** Deep Cut ve Your Call 16–17 yaşındakileri merkeze koyar. Bu yüzden:
  - etiket, @mention ve kişisel hesaplara yanıt yok;
  - ipuçları yalnız futbol olgusu;
  - "the card is ahead of the club" denir, hedef asla oyuncunun kendisi olmaz;
  - sahip, 18 yaş altı oyuncuların olduğu postlarda kötü yorumları gizler.
- **Yapay zekâ beyanı:** ElevenLabs gerçekçi yapay ses üretiyor. Seslendirmeli reel'lerde Instagram'ın "AI info" etiketinin kullanılması (karar 10).
- **Kart tasarımı:** FUT kart biçimini kopyalamaz (§6.7).

---

## 9. 4 haftalık test (26 Ekim – 22 Kasım) ve karar kuralı

**Sıralama — gerçekçi**
- **1. hafta:**
  - Kopa gecesi kiti;
  - mevcut Rundown/RundownWide'a "iddia ilk karede" değişikliği (yeni şablon yok);
  - ikinci ses dinlemesi.
- **2. hafta:** Split + damga şablonu; ilk Card vs Pitch; Deep Cut #1 carousel'i (mevcut `social-video.mjs` ile).
- **3–4. hafta:** §6.1 takvimi.

**Taban:** yayındaki geri sayımlar, tek tek adıyla (sahip Insights'tan çeker).

**Ölçütler formata göre ayrı**

| Format | Ne ölçülür |
|---|---|
| Reel | 3 sn atlama oranı, ortalama izleme süresi |
| Carousel | 100 erişim başına gönderim + kaydetme (asgari bir erişimin üstünde) |
| X | Yanıt + alıntı, profil ziyareti |
| Hepsi | Post başına takip, sahibin harcadığı dakika |

Yalnızca sahibin hesaplarında görünen ölçütler kullanılır. X'in tamamlanma oranı Media Studio gerektiriyorsa düşer.

**Karar, 23 Kasım.** 2 ve 4 takipçiyle örneklem çok küçük, kurallar **yön verir, kanıt değildir.** Her seri en az 3 postla değerlendirilir; List 2 postla.
- **Kalır:** reel'de atlama oranı tabandan belirgin düşük, ya da carousel'de gönderim + kaydetme belirgin yüksek.
- **Düşer:** iki ölçüde de tabandan kötü. Yerine §6.7 havuzundan sıradaki gelir.
- **Arada:** 4 post daha; her seferinde tek değişken (kanca ya da ses).
- **Sesli Card vs Pitch, sessizini geçemezse:** ses kalkar.
- **Haftada 45 dakikayı aşan format:** sadeleşir.

---

## 10. Masadaki kararlar — kademeli (haftada en fazla 3)

**25 Ekim'e kadar — üçü de onaylandı (25 Ekim)**
1. ✅ **İddia ilk karede:** 0. kare iddiayı tamamlanmış gösterir, kapak PNG'si de o kareden. *Önerim: evet.*
2. ✅ **Kopa gecesi kiti** (`video/data/kopa-winner/`; seslendirme satırları onay bekliyor).
   - Cubarsí satırı zaten bizim oyumuzla açılıyor: *"Pau Cubarsí has won the Kopa Trophy. Our ballot had him first."*
   - Yamal satırına bizim hükmümüzü eklemeyi öneriyorum: *"Lamine Yamal has won the Kopa Trophy again. Our ballot went to Cubarsí."*

   *Önerim: evet.*
3. ✅ **Wonderkids v2:** olduğu gibi yayınlanır. Aynı veriyi iki hafta içinde Scoreboard olarak yeniden kurgulamak, tam da tespit ettiğin tekrar olur. *Önerim: yayınla; Scoreboard kalıbı bir sonraki listede.*

**1 Kasım'a kadar**

4. **Doué'nin tablo hücresi** (#164): "Generous" mı kalsın, "Generous, then earned" mı olsun? *Önerim: "Generous, then earned"*; okuma satırıyla tutarlı olur.
5. **Sosyal görsellerde hiç insan yok:** *Önerim: evet.* Bedeli: yazı kapakları sosyalde tekrar kullanılmaz.
6. **Haftalık yük ve cadence:** ~3,5–4 saat ile IG'de 3 post mu, yoksa ~2 saat ile IG'de 2 post mu? *Önerim: 4 hafta 3 post, süreyi ölç, 23 Kasım'da karar ver.*

**8 Kasım'a kadar**

7. **Your Call açık temada mı** (koyu tercihine karşı, yalnız bu seride)? *Önerim: evet; ızgarada kontrast yaratır.*
8. **Midjourney planın ne?** Döngüler için Basic yeterli mi? *Önerim: mevcut planla başla.*
9. **ElevenLabs planın ve kalan kredin ne?** Bed ve efekt seti alınsın mı? *Önerim: önce 3 efekt dene, sonra karar ver.*
10. **Seslendirmeli reel'lerde AI etiketi:** *Önerim: evet.*

---

## 11. TODO'ya girecek işler (sırayla)

| # | Kim | İş | Süre |
|---|---|---|---|
| 1 | Sahip | Kararlar 1–3 ve Kopa seslendirme satırlarının onayı (25 Ekim) | 20 dk |
| 2 | Claude | Kopa gecesi: doğru kazananın kiti, seslendirme, render, QA | 2–3 sa |
| 3 | Claude | Rundown/RundownWide: iddia ilk karede, kapak = o kare | ½ gün |
| 4 | Sahip + Claude | İkinci ses: ücretsiz örnekleri dinle, seç | 20 dk |
| 5 | Claude | `voiceover.mjs`: timestamps + seri sesi + `voice_settings` | ½ gün |
| 6 | Claude | `series.ts` + seri etiketi + `SCOUT GAMER READ` damgası | ½ gün |
| 7 | Claude | Split şablonu (9:16, ortası 4:5'e güvenli; 16:9) | 1–1,5 gün |
| 8 | Claude | Highlightly: tarihli JSON + beş maçlık dakika şeridi | 1 gün |
| 9 | Sahip | Midjourney: 2 sref, insansız seri görselleri, birkaç döngü | 90 dk/ay |
| 10 | Claude | `social-video.mjs`'i Deep Cut ve Your Call carousel'leri için genişlet | 1 gün |
| 11 | Claude | Scoreboard ve Their Order, Our Order şablonları | 1–1,5 gün |
| 12 | Claude | `from-article.mjs`: oyuncu başına hüküm alanı (bizim sıramız için) | 2 sa |
| 13 | Claude | Bağlam takvimi: §4'teki tarihleri doğrula | 1 sa |
| 14 | Sahip | Yayındaki postların Insights tabanı | 15 dk |
| 15 | Claude | Haftalık rapor şablonu | 1 sa |
| 16 | Claude | 23 Kasım'dan sonra kararları `SOCIAL-STRATEGY.md` §6/§8/§9'a işle | 1 sa |

Toplam Claude işi ~7–9 gün. Her biri sahibin bir oturumuna ve incelemesine bağlı, bu yüzden takvim haftalara yayılır.

---

**Ek — nasıl karar verildi.** Üç öneri yazıldı:
- **Seri portföyü:** seri kimliği güçlü, kurulum yükü ağır.
- **Önce bizim iddiamız:** fark ve kanca en güçlü; Instagram uyumu zayıf.
- **Kısıtlı kaynakla Instagram'a uygun üretim:** saat ve kredi açısından en hafif.

İskelet üçüncüsünden alındı. Kanca, ilk kare ve doruk kuralları ikincisinden; seri etiketi, kapanışlar ve dinlendirme birincisinden geldi.

**Kaynaklar.** Araç ve platform iddiaları denetim raporlarında URL ve tarihleriyle duruyor (scratchpad, 24 Ekim). Bilgi kesimimden sonraya düşen ve bir kararı etkileyen iddialar metinde "doğrulanacak" diye işaretli: Eleven v4, `music_v2_5`, efekt ve Midjourney video fiyatları.
