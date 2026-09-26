# Scout Gamer — Sosyal Medya Stratejisi

Kapsam 2026-09-26'da onaylandı: 12 bölüm, sırayla. Bu belge bölüm bölüm yazılıyor.
Her bölüm ölçülmüş veriye dayanır; ölçülemeyen şey ölçülemedi diye yazılır.

`docs/SOCIAL-PLAYBOOK.md` bir işletim kılavuzu taslağı; strateji tamamlanınca bu belgeye
göre yeniden yazılacak.

---

## 1. Mevcut durum teşhisi

*Veri toplama: 2026-09-26, hesapların herkese açık sayfalarından, giriş yapılmadan.*

### 1.1 Sayılar

| Hesap | Gönderi | Takipçi | Takip | Açılış |
|---|---|---|---|---|
| X `@scoutgamerx` | 54 | **2** | 68 | Haziran 2026 |
| Instagram `@scoutgamer_fc` | 51 | **4** | 106 | — |

**105 gönderi, 6 takipçi.** Emek var, karşılığı yok.

### 1.2 İncelenen örnek

Instagram'ın giriş yapmadan gösterdiği son **12 gönderi** (21 Haziran – 15 Eylül) tam
metinleriyle okundu. X'ten yalnızca son gönderi (15 Eylül) görülebildi.

| Tarih | Konu | Hashtag | Etkileşim |
|---|---|---|---|
| 15 Eyl | Ball-playing centre-backs listesi | 0 | 0 beğeni, 0 yorum |
| 13 Eyl | Genç kanat transferleri | 7 (`#WorldCup2026` dahil) | 0 / 0 |
| 1 Ağu | Fransa'nın genç oyuncuları | 6 (`#WorldCup2026` dahil) | 0 / 0 |
| 24 Tem | Dünya Kupası'nda öne çıkan gençler | 5 | 0 / 0 |
| 24 Tem | Japonya'nın genç oyuncuları | 5 | 0 / 0 |
| 28 Haz | WC Son 32 bracket oyunu | 6 | görünmüyor |
| 27 Haz | Nico Paz geri alım maddesi | 6 | görünmüyor |
| 27 Haz | Endrick ve Yamal dışındaki gençler | 6 | görünmüyor |
| 25 Haz | Onana'nın geleceği | 6 | görünmüyor |
| 25 Haz | Hincapié — Arsenal | 6 | görünmüyor |
| 21 Haz | Arjantin – Avusturya taktik analizi | 8 | görünmüyor |
| 21 Haz | 15 U-21 aday | 6 | görünmüyor |

X, 15 Eylül: *"The market has spoken. These young wingers just commanded serious transfer
fees—but are they on your radar? Swipe through to see who's worth the hype. #WorldCup2026
#Transfers #TalentScout"* + link.

### 1.3 Bulgular

**A. Metin: gerçek taşımıyor — ve taşıyamazdı.**
12 açıklamanın hiçbirinde tek bir sayı yok. Çoğunda tek bir oyuncu adı yok: centre-back,
kanat, Fransa ve Japonya listeleri — dördü de oyuncu listesi — hiçbir oyuncuyu adıyla
anmıyor. Hepsi aynı kalıpta: kanca cümlesi → bir iki genel cümle → *"Tap the link in bio"*
→ hashtag bloğu.

Sebebi büyük ihtimalle yapısal. Admin panelindeki "Generate post text (AI)" butonu
(Haziran–Eylül arası aktifti, 20 Eylül'de kaldırıldı) modele yalnızca yazının **başlığını,
kategorisini ve slug'ını** gönderiyordu, gövdesini değil. Ve talimat şuydu:
*"Never invent facts not present in the provided title."* Modele gerçek verilmemiş,
gerçek üretmesi de yasaklanmış — genel bir metin yazmaktan başka seçeneği yoktu. Talimatın
Instagram kalıbı (*"strong opening line, 1–2 sentences, 6–10 hashtags, encourage tapping
the link in bio"*) 12 açıklamayla birebir örtüşüyor.
*Bu gönderilerin o butonla yazıldığını ölçmedim; kalıp eşleşmesinden çıkarıyorum —
doğrulayabilecek olan sensin.*

Sonuç: sitenin **en güçlü varlığı** — doğrulanmış sayılar ve isimler — sosyal medyaya hiç
ulaşmamış. Aynı yazılar Google'da 3–7. sıradan %9–11 tıklanma oranıyla çalışıyor; sosyalde
yazıların sadece başlığı dolaşıyor.

**B. Görsel: başlığı ikinci kez söylüyor.**
Görünen gönderilerin görseli başlık kartı (Style A: kapak görseli + başlık). Başlık zaten
açıklamada ve link önizlemesinde var. Görsel yeni bir bilgi vermiyor; kaydırmayı durdurmak
için bir sebep sunmuyor.

**C. Hashtag: ya çok geniş ya da yanlış.**
`#Football`, `#Scouting`, `#YoungTalent` gibi dev etiketler sıfır takipçili bir hesabın
gönderisini saniyeler içinde gömer. `#WorldCup2026` turnuva bittikten sonra bir transfer
listesinde ve Fransa listesinde kullanılmış — silinen rotanın talimatındaki örnek hashtag
tam olarak buydu: *"(e.g. #WorldCup2026 #Ghana)"*.

**D. Ritim: patlamalar ve uzun sessizlikler.**
Aynı gün ikişer gönderi (21, 25, 27 Haziran; 24 Temmuz), sonra **26 gün** (28 Haz → 24 Tem)
ve **43 gün** (1 Ağu → 13 Eyl) sessizlik. Algoritmalar tutarlılığı ödüllendirir; bu ritim
hesabı her seferinde sıfırdan başlatıyor.

**E. Odak: dağınık.**
Onana'nın kiralık durumu, 23 yaşındaki Hincapié'nin transferi, bir maç önizlemesi — sitenin
çekirdeği olan genç yetenek × oyun kültürü değil. Ve sitenin tek gerçek farkı — **oyunun
reytingi ile sahadaki gerçeğin karşılaştırması** — 12 gönderinin hiçbirinde yok.

**F. Dağıtım modeli: paylaş ve bırak.**
Hesaplar 106 ve 68 hesabı takip ediyor; ama başkalarının konuşmalarına katılındığına dair
görünür bir iz yok (X'in yanıtlar sekmesi giriş istediği için doğrulayamadım). Sıfır
takipçili bir hesap için tek etkileşim kanalı başkalarının gönderilerinin altı; o kanal
kullanılmamış görünüyor.

**G. Sonuç.**
Etkileşimi görünen son 6 Instagram gönderisinin 6'sı da **0 beğeni, 0 yorum.**

### 1.4 Sorun olmayan şeyler

- **Emek.** 105 gönderi, üç ay. Paylaşım yapıldı.
- **İçerik.** Sitenin yazıları çalışıyor — GSC bunu gösteriyor. Sorun yazılarda değil,
  yazıların sosyal medyaya nasıl taşındığında.

### 1.5 Göremediğim şeyler

- X gönderilerinin gösterim ve etkileşim sayıları (giriş gerekiyor).
- X yanıtlar sekmesi.
- Instagram'ın 21 Haziran öncesi 39 gönderisi ve erişim verileri.

Daha kesin bir tablo için isteğe bağlı iki export: **X Analytics → Content → Export** ve
**Instagram Insights**. Teşhisin yönünü değiştireceklerini sanmıyorum, ama "görüldü de mi
beğenilmedi, yoksa hiç mi görülmedi" sorusunu cevaplarlar — ve 2. bölümde (amaç ve ölçü)
işimize yarar.

### 1.6 Tek cümlelik teşhis

> Scout Gamer sosyal medyada çok paylaştı ama **hiçbir şey söylemedi**: her gönderi
> yazının başlığını tekrarladı, sitenin gerçek değeri olan isimler, sayılar ve
> "oyun vs gerçek" karşılaştırması hiç taşınmadı; paylaşımlar dev ya da yanlış etiketlerle,
> düzensiz aralıklarla, başka hiçbir konuşmaya katılmadan yapıldı.

---

## 2. Amaç ve ölçü

### 2.1 Hedefi belirleyen gerçekler

*Kontrol: 2026-09-26.*

- **Site bugün para kazanmıyor.** Kodda ve canlı sayfada reklam, affiliate, ödeme ya da
  bülten kaydı yok. Trafik bugün doğrudan gelir değil — sosyal medyayı "ne kadar para
  getirdi" ile ölçmenin bir karşılığı yok.
- **Sitenin büyüme motoru arama.** Son 28 günde 910 tık; %79'u üç sayfadan. Arama
  yabancıları **bir kez** getiriyor: "best young centre-backs" arayan okur, okuyup gidiyor.
- **Sitenin geri çağırma mekanizması yok.** Bülten yok, takipçi kitlesi yok (6). Bir
  okuru ikinci kez getirecek hiçbir kanal yok.
- **Sosyal sıfırdan başlıyor.** 105 gönderi, 6 takipçi (bkz. §1).

### 2.2 Sosyal medya ne işe yarayacak — öncelik sırasıyla

**1. Geri gelen bir kitle kurmak.** Aramanın yapamadığı tek iş bu. Arama okuru bir kez
getirir; takipçi geri gelir. Scout Gamer'ın bugün bu işi yapan hiçbir kanalı yok.

**2. Otorite: "genç oyuncuları reytinge karşı okuyan hesap" olarak tanınmak.** Anılmak,
alıntılanmak, linklenmek. Aramaya etkisi **dolaylı**: sosyal sinyaller doğrudan bir
sıralama faktörü değil, ama anılmalar, linkler ve marka aramaları öyle.

**3. Hızlı geri bildirim.** Hangi açının ilgi gördüğünü aynı gün öğrenmek. Arama bunu
haftalar sonra söylüyor; sosyal, bir sonraki yazının konusunu seçmeye yardım eder.

**4. Trafik — en son ve en geç.** 6 takipçiyle sosyalden gelen trafik, içerik ne kadar iyi
olursa olsun sıfıra yakın olur. Kitle olmadan trafik beklemek, kanalı işe yaramadan
kapatmanın en hızlı yolu. Trafik, 1 ve 2 çalıştıktan sonra gelen sonuçtur.

### 2.3 Aşamalar — hedef, kitlenin büyüklüğüyle değişir

| Aşama | Asıl soru | Asıl metrikler |
|---|---|---|
| **1 — Keşfedilmek** (şimdi) | Doğru insanlar bizi görüyor ve takip ediyor mu? | Takipçi artışı · gönderi başına gösterim · yanıtlarımızın aldığı etkileşim · profil ziyareti |
| **2 — Geri gelen kitle** | Takip edenler etkileşiyor mu, geri geliyor mu? | Etkileşim oranı · kaydetme / paylaşma · link tıklaması |
| **3 — Trafik ve sahiplenilmiş kanal** | Kitle siteye ve bültene akıyor mu? | GA'da sosyal oturumlar · bülten kaydı |

Aşama geçişi tarihle değil **kanıtla** olur: bir aşamanın ana metriği art arda 4 hafta
büyüdüğünde bir sonrakine geçilir. *Bu eşik bir ilk varsayım; 6. haftanın verisiyle
gözden geçirilir.*

3. aşama bülteni gerektirir — hafızada "en son adım" olarak park edilmiş "The Deep Cut".
Sosyal, o bülteni anlamlı kılacak kitleyi kuran şey.

### 2.4 İlk 6 hafta: girdi hedefi, sonuç hedefi değil

Bu hesap için karşılaştırılabilir veri yok. "6 haftada 500 takipçi" gibi bir hedef koymak,
uydurulmuş bir sayı olurdu. Bu yüzden ilk 6 hafta:

- **Yapılanı ölçeriz (girdi):** kaç gönderi, kaç yanıt, ritim bozuldu mu.
- **Olanı kaydederiz (sonuç):** takipçi, gösterim, etkileşim — hedefsiz, sadece kayıt.
- **6. haftada** kaydedilen sonuçlardan ilk gerçek hedefler konur.

Bir girdi kuralı §1'den doğrudan çıkıyor ve şimdiden sabit: **hiçbir 7 günlük dönem
gönderisiz geçmez.** (§1'de 26 ve 43 günlük boşluklar vardı.) Diğer girdi sayıları —
haftalık gönderi, günlük yanıt — §7 ve §11'de kesinleşecek.

### 2.5 Ölçüm sistemi

| Metrik | Kaynak | Maliyet | Kim alır | Sıklık |
|---|---|---|---|---|
| Gönderi, takipçi, takip sayısı | Herkese açık profil | Ücretsiz, giriş gerekmez | Claude | Her Cuma |
| Gönderi başına beğeni, yanıt, repost | Gönderinin kendisi | Ücretsiz | Claude (IG) / sen (X) | Her Cuma |
| Gönderi başına gösterim (X) | X mobil, gönderi istatistiği | Ücretsiz, giriş gerekir | Sen | Her Cuma |
| Hesap panosu (X) | X Analytics | **Premium, $8/ay** | — | Şimdilik yok |
| Erişim, kaydetme, profil ziyareti (IG) | Instagram Insights | Ücretsiz, **profesyonel hesap** gerekir | Sen | Her Cuma |
| Sosyalden siteye trafik | GA (Organic Social) + UTM | Ücretsiz | Claude kurar, sen export edersin | Her Cuma |

Haftalık skor tablosu repoda tutulur; her Cuma bir satır. Biçimi §11'de.

### 2.6 Karar kuralları

- **6 hafta tutarlı uygulama olmadan hüküm yok.** Erken hüküm, Ağustos'tan beri yapılan hata.
- **Girdiler tutmadıysa** sorun strateji değil uygulamadır; strateji değişmez.
- **Girdiler tuttuysa ve 1. aşama metrikleri 6 hafta yerinde saydıysa** biçim ya da açı
  değişir — kanal kapatılmaz.
- **Her Cuma en fazla 3 karar**, `docs/TODO.md`'ye yazılır.

### 2.7 Senin kararın olanlar

- **Scout Gamer'ın nihai amacı** — reklamla büyüyen bir yayın mı, bir ürüne marka mı,
  topluluk mu? 1. ve 2. aşamayı etkilemez (hepsi önce kitle ister), ama 3. aşamayı belirler.
  Engelleyici değil.
- **X Premium** — önerim şimdilik hayır. 2 takipçili bir hesap için $8/ay bir pano;
  gönderi başına istatistikler 1. aşamaya yetiyor. 2. aşamada yeniden bakılır.
- **Instagram profesyonel hesap** — değilse geçiş öneriyorum: ücretsiz ve Insights'ı açıyor.
  Hesabın şu an profesyonel olup olmadığını giriş yapmadan göremiyorum.

---

## 3. Hedef kitle

*Veri: GSC, son 28 gün (25 Eylül export'u) — 1000 sorgu, 196 ülke, cihaz kırılımı.
Export Google'ın gösterdiği 1000 sorguyla sınırlı: 910 tıkın 269'u sorgu düzeyinde görünüyor,
gerisi anonimleştirilmiş uzun kuyruk. Oranlar yön gösterir, kesin değildir. Sosyaldeki 6
takipçi kitle hakkında bir şey söylemiyor — kitleyi aramadan okuyoruz.*

### 3.1 Aramada kim bizi buluyor — niyete göre

| Niyet | Sorgu | Tık | Gösterim | TO |
|---|---|---|---|---|
| **Genç yetenek listesi** — "best young strikers in the world" | 296 | **250** | 5.528 | 4,5% |
| Belirli oyuncu adı ve diğer | 475 | 12 | 1.078 | 1,1% |
| Dünya Kupası 2026 | 165 | **0** | 592 | 0% |
| **Oyun dili** — "argentina wonderkids", "best young midfielders fc 26" | 52 | 5 | 247 | 2,0% |
| Taktik | 11 | 2 | 35 | 5,7% |

Görünen tıkların **%93'ü** tek bir niyetten: *en iyi genç oyuncular listesi.*

### 3.2 Nerede ve neyle

- **196 ülke.** İlk beş: İngiltere %24, ABD %11, Hindistan %7, Kanada %4, Endonezya %4 —
  ilk beşin toplamı ancak %50. Sonra Malezya, Avustralya, Nijerya, Almanya, İtalya, İrlanda,
  Vietnam, Bangladeş, Singapur. Tek bir pazar yok; site ilkesi olan coğrafi tarafsızlık
  kitlenin kendisinde de var.
- **İngilizce konuşulan dünya + Güney/Güneydoğu Asya + Nijerya.** İngilizce olmayan sorgular
  da geliyor (Endonezyaca: *"cb muda terbaik"*, *"pemain muda argentina"*) — ama site
  İngilizce kalır; bu okurlar İngilizce içeriğe zaten geliyor.
- **Tıkların %76'sı mobilden.** Mobil TO %3,6, masaüstü %1,5. Sosyal zaten mobil; her görsel
  telefon ekranı için tasarlanır.

### 3.3 Beş kitle

**① Genç yetenek listesi okuru — ANA KİTLE**
*Kanıt:* tıkların %93'ü. *Ne istiyor:* isim, sıralama, üzerinde tartışılabilecek bir görüş.
*Sosyalde:* futbol X'inde "kim daha iyi" tartışmaları, liste paylaşımları, genel futbol
toplulukları. *Onlara verdiğimiz:* sitenin zaten en iyi yaptığı şey — doğrulanmış listeler.

**② Oyuncu — Career Mode ve Football Manager — FARKIMIZIN KİTLESİ**
*Kanıt:* aramada küçük (52 sorgu, 247 gösterim), ama dili belirgin: *"wonderkids"*,
*"fc 26"*. "Wonderkid" bir oyun terimi. *Ne istiyor:* kariyer modunda kimi almalı, kart
oyuncuyu olduğundan iyi mi kötü mü gösteriyor, potansiyeli ne. *Sosyalde:* oyun toplulukları,
reyting tartışmaları, oyun içerik üreticilerinin gönderileri. *Onlara verdiğimiz:* sitenin
tek gerçek farkı — **reyting ile sahadaki gerçeğin karşılaştırması.**
*Açık soru:* bu kitle gerçekten küçük mü, yoksa aramada küçük çünkü biz onlar için açıkça
yazmıyoruz mu? Veri bunu ayırt etmiyor. Sosyal, bunu test edeceğimiz yer.

**③ Kulüp taraftarı — ÇARPAN**
*Kanıt:* oyuncu adıyla gelen yüzlerce sorgu (tıkları düşük). *Ne istiyor:* "kendi"
gençlerinin değerinin görülmesi. *Sosyalde:* kulüp taraftar hesaplarının ve kulübün resmi
hesaplarının altı — sosyalin en hareketli köşeleri. *Onlara verdiğimiz:* adıyla yazılmış her
oyuncunun hazır bir taraftar kitlesi var; Dowman yazısı bir Arsenal taraftarının yazısıdır.

**④ Ülke takipçisi — İKİNCİL**
*Kanıt:* ülke listeleri aramada güçlü — Arjantin 112, İspanya 58, Almanya 40, Japonya ve
Fransa 30'ar tık. İlk ülkeler arasında Endonezya, Malezya, Nijerya, Hindistan. *Ne istiyor:*
kendi ülkesinin gelecek kuşağı. *Onlara verdiğimiz:* ülke listeleri — İngilizce.

**⑤ Dünya Kupası izleyicisi — HEDEF DEĞİL**
*Kanıt:* 165 sorgu, **0 tık.** Turnuva bitti. Bilinçli olarak dışarıda.

### 3.4 Çekirdek kişi

Beş kitlenin kesiştiği yer tek bir kişi — ve sitenin adı onu zaten tarif ediyor:

> **Scout Gamer:** hafta sonu maç izleyen, hafta içi kariyer modunda ya da Football
> Manager'da kadro kuran futbol meraklısı. "Bu çocuk gerçekten iyi mi, yoksa sadece kartı mı
> iyi?" sorusunu soran kişi.

① ana kitle, ② o kişinin bizi başkalarından ayıran tarafı. Stratejinin geri kalanı —
ses, içerik, etkileşim — bu kişiye göre kurulur.

### 3.5 Test edilecek varsayımlar

Aramadan okunan bir kitlenin sosyalde nerede ve nasıl davrandığı henüz ölçülmedi.
İlk 6 hafta bunları sınar:

- ② kitlesi sosyalde, aramada göründüğünden büyük mü?
- ③ kulüp taraftarı konuşmaları, genel futbol konuşmalarından daha fazla etkileşim getiriyor mu?
- Hangi ülke saatleri daha çok etkileşim getiriyor? (İngiltere + ABD, tıkların %35'i.)

---

## 4. Konumlanma ve ses

*Kaynaklar: sitenin editoryal sesi (`.claude/skills/scout-editor/SKILL.md` → "Editorial voice"),
§1'deki gerçek açıklamalar, §3'teki kitle.*

### 4.1 Konumlanma

> **Scout Gamer: genç oyuncuları reytinglerine karşı okuyan hesap.**

Uzun hali:

> §3'teki kişi için — maç izleyen, kariyer modunda ya da Football Manager'da kadro kuran ve
> *"bu çocuk gerçekten iyi mi, yoksa sadece kartı mı iyi?"* diye soran futbol meraklısı —
> Scout Gamer genç oyuncuyu oyunun reytingine karşı okuyan hesaptır: doğrulanmış sayılarla ve
> tarihli iddialarla.

Neden bu boşluk bizim: **istatistik hesapları** oyunsuz sayı verir; **oyun hesapları**
futbolsuz oyun verir; **transfer hesapları** oyuncusuz bonservis verir. İkisini birden tutan,
ve bunu doğrulanmış veriyle yapan bir hesap alanı boş. Sitenin adı — Scout + Gamer — zaten bu.

### 4.2 Ne değiliz

- **Transfer haber hesabı değil.** Haberi ilk veren olmak başkalarının işi; bizim işimiz
  bonservisin arkasındaki oyuncu.
- **Dünya Kupası hesabı değil.** Turnuva bitti (§3 ⑤).
- **Paket açılışı ya da FUT ticaret hesabı değil.** Oyunu futbolu okumak için kullanırız.
- **Sıcak yorum hesabı değil.** Her iddianın bir sayısı var.
- **Alay hesabı değil.** Oyuncuyla, taraftarla, EA ile dalga geçmeyiz. "Kart yanlış" demek,
  "EA aptal" demek değildir.

§1'deki odak dağınıklığı — Onana'nın kiralanması, 23 yaşındaki bir oyuncunun transferi,
bir maç önizlemesi — bu çizginin dışında kalıyor.

### 4.3 Ses — sekiz kural

Sitenin yazılarında zaten var olan ses; sosyale taşınmamıştı.

1. **Sayı önce, sıfat sonra.** *"Unmatched"* değil, *"€55m"*.
2. **Pozisyon al — kanıtla.** Sitenin kuralı: *"Take positions… Be confident."* Ama her
   pozisyonun bir sayısı ya da tarihi var.
3. **Kuru ve kesin.** Heyecan cümlesi yok. §1'den çıkan **yasak kalıplar:** *masterclass,
   unmatched, the future is here, game-changer, changing the game, making waves, can't stop
   talking about, discover, Tap the link in bio* (bir formül olarak).
4. **Oyun dilini doğal konuş.** *Wonderkid, potential, OVR, card, meta, hidden gem* — sitenin
   kuralıyla: *"analytical, never gimmicky."*
5. **Kimseyle alay etmeyiz** — EA'in reytingiyle bile.
6. **Kısa.** X'te en fazla iki cümle ve bir sayı. Instagram'da **ilk satır** sayıyı taşır —
   akışta sadece o görünüyor.
7. **Belirsizliği söyle.** *"Reported"*, *"per EA's ratings page"*. Doğruluk sesin parçası:
   #157'deki hata, sesin kendisinden emin olup verisinden emin olmamasıydı.
8. **Dil: İngilizce, sitenin İngilizcesi** — *centre-back, footballer*. Ama global okunur:
   yerel argo yok, çünkü kitle 196 ülkede.

### 4.4 Önce ve sonra — gerçek bir gönderiyle

**Önce** — Instagram, 13 Eylül (§1):

> The transfer market just went all-in on young wingers.
> Clubs are paying premium fees for pace, creativity, and potential on the flanks. We've
> ranked the breakout talents making waves this window—and revealed why scouts can't stop
> talking about them.
> Tap the link in bio to discover the next generation of wing threats.
> #Wingers #TransferMarket #YoungTalent #Football #Scouting #WorldCup2026 #footballtransfers

Tek bir isim yok, tek bir sayı yok, dört yasak kalıp, turnuva bittikten sonra `#WorldCup2026`.

**Sonra** — aynı yazının (#150) yayındaki verisiyle:

> €55m for Mika Godts. £30.8m for Malick Fofana. €12.5m for Leo Sauer.
>
> Three young wingers, three fees. Everyone can see who is fast. Almost nobody is paying for it.

Üç isim, üç doğrulanmış bonservis, yazının kendi kapanış cümlesi. Görsel: `stat` ya da `list`
kartı. Link ve hashtag'ler §9 ve §10'da.

### 4.5 Kimlik

**Bugünkü bio** (iki hesapta da benzer):
*"FOOTBALL × GAME CULTURE / Smart football, zero lecture. Scouting reports, transfer analysis —
built for fans who want more."*
*"Zero lecture"* iyi ve kalmalı. *"Transfer analysis"* artık çekirdek değil; *"built for fans
who want more"* her hesabın söylediği şey.

**Önerilen bio:**

> Football × Game Culture. Young players, read against the ratings — is he good, or is it just
> his card? Verified numbers, dated calls. scoutgamer.com

**Hesap adları tutarsız:** X'te `@scoutgamerx`, Instagram'da `@scoutgamer_fc`. Birini bilen
diğerini tahmin edemiyor. Birleştirmek önerilir — hangi adın iki platformda da boş olduğu
kontrol edilmeli. Karar senin.

---

## 5. Platform rolleri

### 5.1 Bugünkü durum: iki platform, tek rol

§1'de görebildiğimiz kadarıyla X ve Instagram **aynı işi** yaptı: aynı yazı, aynı başlık
kartı, benzer açıklama, iki platforma birden. (Örnek: kanatlar yazısı Instagram'da 13 Eylül'de,
X'te 15 Eylül'de, aynı kalıpla.) Platformlar farklı davranışları ödüllendirir; aynı içeriği
iki yere koymak, ikisinde de ortalamanın altında kalmak demek.

Kural: **her platformun tek bir ana işi var.** Aynı yazı her platforma girer, ama her birine
o platformun işine göre biçimlenmiş olarak.

### 5.2 Dört platform, dört iş

| Platform | Ana iş | Neden bu platform | Ana format | Asıl metrik |
|---|---|---|---|---|
| **X** | **Konuşma** | Futbol tartışması orada ve gerçek zamanlı; ② oyuncu ve ③ taraftar kitlesi orada tartışıyor | Başkalarının konuşmalarına yanıt (§7) + kısa, tek sayılı kendi gönderileri | Yanıtların etkileşimi · profil ziyareti · takipçi |
| **Instagram** | **Vitrin** | Görsel, kaydedilebilir; en güçlü formatımız (liste) bire bir oturuyor | Carousel: bir slayt, bir oyuncu, bir sayı | Kaydetme · paylaşma · erişim · takipçi |
| **Kısa video** (Reels, TikTok, Shorts) | **Keşif** | Takip etmeyenlere ulaşan format — dağıtım takipçiye değil ilgiye göre *(genel bilgi; bu hesaplar için test edilecek)* | 8–16 sn: "kart vs gerçek" | Erişim · izlenme süresi · takipçi |
| **Reddit** | **Topluluk ve trafik** | Takipçi grafiği yok, ilgi grafiği var; başlıklar Google'da dizinleniyor | Değer veren yorum; link sadece kuralların izin verdiği yerde | Yorum puanı · sitede Reddit'ten gelen oturum |

### 5.3 Bir yazı, dört biçim

Örnek: #150, genç kanatlar (§4.4'teki veri).

| Platform | Ne olur |
|---|---|
| X | *"€55m for Mika Godts. £30.8m for Malick Fofana. €12.5m for Leo Sauer. Everyone can see who is fast. Almost nobody is paying for it."* + transfer konuşmalarında bu sayılarla yanıtlar. Link, gönderinin altındaki ilk yanıtta. |
| Instagram | Carousel: kapak → her kanat için bir slayt (isim, bonservis, tek cümle) → kapanış slaytı (yazının cümlesi). |
| Kısa video | 15 sn: bonservis → oyuncu → yazının cümlesi. |
| Reddit | Bir transfer tartışmasında sorulan soruya yazıdaki bir gerçekle cevap. Link ancak subreddit kuralı izin veriyorsa. |

### 5.4 Sıralama — hepsi birden değil

Üç kanalı aynı anda açmak, düzensiz ritmin (§1.3 D) tekrarı olur.

| Dönem | Platformlar | Neden |
|---|---|---|
| **Hafta 1–2** | X + Instagram | Hesaplar zaten var. İş: §4'teki sesle yeni biçim + X'te yanıtlar. |
| **Hafta 3–4** | + Reddit (önce yalnızca katılım, link yok) | Reddit yeni ya da geçmişsiz hesaplara güvenmiyor; önce topluluk içinde bir geçmiş gerekiyor. |
| **Hafta 3–6** | + Kısa video | En pahalı üretim. X ve Instagram'da tutan 2–3 açı belli olunca, kazananlar videoya dönüşür — boşa video üretilmez. |

**Kapsam dışı, şimdilik:** Facebook, LinkedIn, Threads, Bluesky. Odak.

### 5.5 Platform ve otomasyon

Orkestra modeliyle (TODO'da not düşüldü, §11'e girecek) her platformda neyin otomatikleşeceği:

| Platform | Kendi gönderimiz | Başkasına yanıt / yorum |
|---|---|---|
| X | Onayla otomatik (API) | Ajan hazırlar, sen tek dokunuşla gönderirsin — kurallar otomatik yanıtı yasaklıyor |
| Instagram | Onayla otomatik (API — profesyonel hesap + Facebook sayfası) | Elle — API desteklemiyor |
| Kısa video | Yayın API'leri var; kurulumda doğrulanacak | Elle |
| Reddit | **Elle** | **Elle** — otomasyona en az tolerans gösteren platform; bilinçli olarak dışarıda |

### 5.6 Hesap durumu (2026-09-26, senin cevabınla)

**TikTok, YouTube ve Reddit hesabı yok.** Instagram Reels mevcut hesapla yapılır.

- **Reddit — erken aç.** Hafta 3'te katılım başlayacaksa hesabın şimdiden açılması gerekiyor:
  topluluklar yeni ve geçmişsiz hesaplara güvenmiyor. İlk haftalarda link yok, sadece
  gerçek katılım.
- **TikTok ve YouTube — hafta 3'e kadar.** Video, X ve Instagram'da tutan açılar belli
  olunca başlıyor; hesapların o zamana hazır olması yeterli.
- **Hesap adları:** yeni hesaplar açılırken §4.5'teki birleştirme kararı birlikte verilir —
  dört platformda da aynı ad.
- **Video:** sessiz + ekran metni mi, seslendirme mi? Hafta 3'e kadar karar yeterli.

Hesapları sen açarsın; ben hesap açmam.

---

## 6. İçerik ayakları ve formatlar

### 6.1 Hammadde: arşiv

*Sayım: 2026-09-26, yayındaki yazılar.*

**122 yazı yayında — 70'i Dünya Kupası dışı.** (27 liste, 20 taktik, 15 radar, 8 transfer.)
İçlerindeki hazır sosyal malzeme:

| Blok | Kaç yazıda | Sosyalde ne olur |
|---|---|---|
| Kapanış cümlesi (pull quote) | 89 | Verdict kartı, gönderinin son cümlesi |
| Oyuncu kartı | 83 | Carousel slaytı, kart vs gerçek |
| Karşılaştırma (vs) | 58 | Contrast kartı |
| SSS | 68 | X yanıt cümlesi |
| Stat bloğu | 40 | Stat kartı, videonun sayıları |

Sosyal **yeni içerik üretmek zorunda değil.** İşi, yazıların içinde zaten olanı taşımak —
§1'de taşınmayan tam da buydu. `scripts/social-pack.mjs` bu blokları bugün çıkarabiliyor.

### 6.2 Beş ayak

**① Listeler — "The best young X"**
*Kitle:* ① ana kitle — aramadaki tıkların %93'ü. *Kaynak:* 12 çekirdek liste
(pozisyon listeleri, ülke listeleri, Temmuz–Eylül). *Format:* Instagram carousel,
X'te tek sayılı gönderi. *Evergreen:* bu listeler haftalar sonra da paylaşılabilir.

**② Kart vs gerçek — farkımız**
*Kitle:* ② oyuncu, ama ①'i de yakalar. *Kaynak:* oyuncu kartlı yazılar + gerçek sezon
verisi. *Format:* contrast kartı, 15 sn video. *Dikkat:* elimizdeki reytingler FC 26'nın;
FC 27 çıktı. FC 27 verisi (~6 Ekim) gelene kadar bu ayakta **hangi oyunun reytingi olduğu
her gönderide açıkça yazılır** — *"FC 26 rated him 68"* — ya da FC 27'nin resmi sayfasından
doğrulanmış sayı kullanılır.

**③ Oyuncu profili — "the name before everyone"**
*Kitle:* ③ taraftar, ① liste okuru. *Kaynak:* radar yazıları, listelerdeki "deep cut"lar.
*Format:* stat kartı, X'te kısa dizi (thread). *Çarpan:* adı geçen oyuncunun kulübünün
taraftarları.

**④ Makbuz — "we said this, then this happened"**
*Kitle:* hepsi; §2'deki otorite hedefinin doğrudan aracı. *Kaynak:* tarihli yazılarımız +
sonrasında olan. *Format:* verdict kartı, üzerinde yazının tarihi. *Doğası gereği seyrek:*
ancak gerçek bir gelişme olduğunda — uydurulamaz, beklenir.

**⑤ Soru — "who's better?"**
*Kitle:* hepsi; §2'deki hızlı geri bildirim hedefinin aracı. *Kaynak:* listelerdeki
karşılaştırmalar. *Format:* Instagram hikâye anketi, X anketi. *Maliyet:* en düşük —
ve hangi açının ilgi gördüğünü söyler.

### 6.3 Başlangıç karışımı

Sosyal veri yok; bu oran **§3'ün kanıtından türetilmiş bir başlangıç varsayımı**, 6. haftada
gerçek veriyle değişir. Haftalık gönderi sayısı §11'de kesinleşecek; oran ona uygulanır.

| Ayak | Pay | Gerekçe |
|---|---|---|
| ① Listeler | ~%40 | Kanıtlanmış talep |
| ② Kart vs gerçek | ~%25 | Farkımız; §3'teki açık soruyu bilinçli olarak test eder |
| ③ Oyuncu profili | ~%20 | Taraftar çarpanı |
| ⑤ Soru | ~%15 | Ucuz etkileşim + geri bildirim |
| ④ Makbuz | fırsat oldukça | Takvime konmaz |

### 6.4 Format × platform

| | X | Instagram | Kısa video (hafta 3+) |
|---|---|---|---|
| ① Liste | Tek sayılı gönderi, liste dizisi | **Carousel** | "3 isim, 3 sayı" |
| ② Kart vs gerçek | Contrast kartı | Tek görsel / carousel | **"Kart 68, sezon 17"** |
| ③ Profil | Dizi (thread) | Carousel | Kısa profil |
| ④ Makbuz | Verdict kartı + tarih | Tek görsel | — |
| ⑤ Soru | Anket | **Hikâye anketi** | — |

Mevcut kart türleri (`/api/social-card`): **stat, contrast, verdict, list** ve başlık kartı
(Style A). Eksik olan: **carousel için oyuncu başına slayt** — bugünkü `list` kartı tek görsel.
§8'de ele alınacak.

### 6.5 Ne paylaşmıyoruz

- Dünya Kupası içeriği (§3 ⑤).
- Genç oyuncu açısı olmayan transfer haberi, maç önizlemesi (§4.2).
- **Yazının sadece başlığı** — §1'in ana hatası. Her gönderi yazının içinden en az bir
  gerçek taşır.

### 6.6 İki doğruluk kuralı

1. **Eski yazı yeniden paylaşılmadan önce gerçekleri yeniden doğrulanır** — kulüp, yaş,
   sayılar. Listeler evergreen ama oyuncular kulüp değiştiriyor (15 Eylül'de ana sayfa
   kartlarında gördüğümüz hata).
2. **"Oyunda toplam şu kadar oyuncu var" cümlesi kurulmaz.** Veri setimiz oyunun tamamı
   değil (§4 sonundaki not). Tek tek oyuncu reytingleri kullanılabilir; havuz sayıları değil.

---

## 7. Etkileşim stratejisi

Orkestra modelinde keşif ve yanıt ajanlarının uyacağı kurallar bu bölümdür.

### 7.1 Neden ana kaldıraç bu

6 takipçili bir hesabın kendi gönderisi, kabaca 6 kişinin akışına düşer. Başka bir hesabın
gönderisinin altındaki yanıt ise **o hesabın kitlesinin** önüne çıkar. Bu, ölçülmüş bir sonuç
değil, platformların işleyişinden gelen bir çıkarım — ama §1'deki tablo onunla tutarlı:
105 kendi gönderisi, 6 takipçi, başkalarının konuşmalarında görünür bir iz yok.

1. aşamada (§2.3) **yanıtlar ana iş, kendi gönderilerimiz vitrin.**

### 7.2 Hangi konuşmalar — öncelik sırasıyla

| # | Konuşma türü | Kitle (§3) | Neden bizim |
|---|---|---|---|
| 1 | **Reyting konuşmaları** — "bu kart adil mi", yeni kart açıklamaları, "oyundaki en iyi genç stoper kim" | ② + ① | Konumlanmamızın ta kendisi (§4.1) |
| 2 | **Genç oyuncu anları** — ilk gol, ilk maç, milli takım çağrısı, "bu çocuk kim?" | ③ + ① | Hakkında yazdığımız oyuncular; zamanlama belirleyici |
| 3 | **Sıralama tartışmaları** — başka hesapların "en iyi genç forvetler" gönderileri | ① | En güçlü içerik türümüz |
| 4 | **Kulüp konuşmaları** — taraftarların kendi gençleri hakkında | ③ | Taraftar çarpanı |
| 5 | **Ülke gençlik konuşmaları** | ④ | Ülke listelerimiz |

**Girilmeyen konuşmalar:** genç oyuncu açısı olmayan transfer dedikodusu, Dünya Kupası,
siyaset, kavga, hakemlik tartışmaları.

### 7.3 Hangi hesaplar

İsim listesi değil, kategori — her hesap **kullanılmadan önce var ve aktif olduğu doğrulanır.**
Hafta 1'de 20–30 hesaplık bir takip listesi kurulur; keşif ajanı onu günceller.

- **Oyun hesapları:** EA FC resmi hesapları, reyting veritabanı siteleri, kariyer modu ve
  Football Manager içerik üreticileri.
- **Veri ve istatistik hesapları.**
- **Kulüp hesapları** — resmi ve taraftar — hakkında yazdığımız oyuncuların kulüpleri.
- **Genç futbolu izleyen gazeteciler.**
- **Orta büyüklükteki hesaplar öncelikli.** Dev bir hesabın altındaki binlerce yanıt arasında
  kaybolunur; orta büyüklükte bir hesabın altında görünür olunur. *(Çıkarım; 6 haftada sınanır.)*

### 7.4 Nasıl — yanıt kuralları

1. **Onlarda olmayan bir gerçek ekle.** Bir sayı, bir tarih, bir bağlam — **yayındaki,
   doğrulanmış bir yazımızdan.**
2. **Gönderinin kendisine cevap ver.** Konuyu kendi yazımıza çekme.
3. **Link yok.** Biri sormadıkça. *"Check out our site"* hiçbir zaman.
4. **Katıl ya da karşı çık — kanıtla. Alay yok** — oyuncuyla, taraftarla, gönderi sahibiyle,
   EA ile.
5. **Bir konuşmaya bir yanıt.** Aynı hesabın altına her gün yazılmaz.
6. **Kısa ve İngilizce** (§4.3).
7. **Emin değilsen gönderme.** #157'nin dersi — yanlış bir gerçek, sıfır yanıttan kötüdür.
8. **Reşit olmayan oyuncuları etiketleme.** Hakkında yazdığımız oyuncuların çoğu 16–17 yaşında.
   Onlar hakkında konuşuruz, onlara değil — kişisel hesaplarına yanıt ya da etiket yok.

### 7.5 Yanıt türleri — gerçek örneklerle

Her örnekteki her gerçek yayındaki bir yazıdan (2026-09-26'da kontrol edildi).

**Reyting konuşması** — biri Ngumoha'nın kartını soruyor:
> 90 pace inside a 68 overall. The card reads last season, when he played on the left. A rating
> measures what a player has been asked to do.
*(#149)*

**Genç oyuncu anı** — Sullivan için "bu çocuk kim?" soruluyor:
> Debuted in MLS at 14 years 293 days — the youngest in any major American pro sport. Manchester
> City agreed his move when he was fourteen; he can join them in September 2027.
*(#157)*

**Sıralama tartışması** — birinin "en iyi genç kanatlar" listesinin altı:
> The market already voted on some of these: €55m for Godts, £30.8m for Fofana. The fees tell you
> who clubs think is ready now.
*(#150)*

**Kart vs gerçek** — yeni kart açıklamasının altı:
> His first card is a 67. Before it existed he had 17 goal contributions in an MLS season — the
> card arrived last.
*(#157)*

Ajanlar bu dört kalıbı her gün, o günün konuşmasına ve arşivdeki doğru yazıya göre doldurur.

### 7.6 Kendi gönderilerimizde

- Her yoruma **24 saat içinde** yanıt.
- İyi bir yorumu öne çıkar; bir soru sorarak konuşmayı uzat.
- 1. aşamada seyrek olacak — ama olduğunda en değerli etkileşim bu.

### 7.7 Takip politikası

- Etkileşim kurduğumuz hesapları takip et; toplu takip / bırak yok (spam sinyali).
- Etkileşim grupları (pod), takipçi satın alma, "takibe takip" yok.

### 7.8 Girdi hedefleri — başlangıç

§2.4'te "§7'de kesinleşecek" dediğim sayılar. **Başlangıç noktası; 6. haftada gözden geçirilir.**

| Platform | Hedef | Kim gönderir |
|---|---|---|
| X | **Hafta içi günde 5 yanıt** (~25/hafta) | Sen, tek dokunuşla (ajan hazırlar) |
| Instagram | **Günde 3 yorum** | Sen, elle (API desteklemiyor) |
| Reddit | Hafta 3'ten itibaren **haftada 3 değer veren yorum**, link yok | Sen, elle |

### 7.9 Günlük akış

**Ajanlar kurulduktan sonra:**
1. **Sabah — ajanlar:** keşif ajanı 10–15 aday konuşma bulur → yanıt ajanı 5–8 taslak yazar →
   doğrulama ajanı her gerçeği yazıya ve kaynağa karşı kontrol eder → onay kuyruğu.
2. **Sen, ~10 dk:** onayla / düzenle / reddet → X'te tek dokunuşla gönder → Instagram'da 3 yorum.
3. **Zamanlama:** aramadaki tıkların %35'i İngiltere + ABD'den (§3.2). Başlangıç önerisi,
   İngiltere akşamı ile ABD öğleden sonrasının kesiştiği saatler. **Test edilecek.**

**Ajanlar kurulana kadar:** her Pazartesi 20–25 satırlık bir yanıt bankası hazırlarım
(bu bölümdeki kurallarla, yazılardan). Sen hafta boyunca uygun konuşmalarda kullanırsın.

**Maliyet notu:** keşif ajanı X'te okuduğu her gönderi için $0,005 öder. Günde ~200 gönderi
taraması ayda ~$30 — TODO'daki açık "X API aylık tavanı" kararına bağlı.

### 7.10 Ölçüm

§2.5'teki tabloya ek olarak, her Cuma:
- Gönderilen yanıt sayısı (girdi) — hedefe karşı.
- Yanıt başına ortalama beğeni ve yanıt.
- En çok etkileşim alan 3 yanıt — hangi konuşma türünden (§7.2) — bir sonraki haftanın
  önceliğini belirler.

---

## 8. Görsel kimlik sistemi

### 8.1 Bugün elimizde ne var

`/api/social-card` beş kart türü, üç format üretiyor. Hepsi 2026-09-26'da, yayındaki
yazılardan doğrulanmış verilerle Instagram formatında (4:5) render edilip incelendi.

| Kart | Ne gösterir | §6 ayağı |
|---|---|---|
| **stat** | Tek dev sayı + etiket + not | ① ③ |
| **contrast** | İki sütun karşılaştırma | ② |
| **verdict** | Kapanış cümlesi, tırnak içinde | ④, kapanış |
| **list** | Numaralı isimler | ① |
| **cover** (Style A) | Kapak görseli + başlık | Yazı duyurusu — seyrek |

| Format | Boyut | Platform |
|---|---|---|
| `x` | 1200×675 (16:9) | X |
| `square` | 1080×1350 (4:5) | Instagram akışı, carousel |
| `story` | 1080×1920 (9:16) | Hikâye, Reels, TikTok, Shorts |

**§1'deki gönderilerde sadece başlık kartı kullanıldı.** Dört içerik kartı 20 Eylül'de
eklendi; sosyalde henüz hiç paylaşılmadı.

### 8.2 Render'lar ne gösteriyor

**Çalışan:**
- **Aynı çerçeve** — üstte renk şeridi, solda SG logosu, sağda kategori etiketi, altta
  başlık ve site. Akışta tanınırlık bundan gelir.
- **Tipografik** — fotoğraf yok, sadece sayı ve kelime. Hızlı, tutarlı, hak sorunu yok.
- **stat kartında sayı gerçekten kahraman** — 4:5'te de baskın.

**Çalışmayan:**
- **contrast ve list kartları 4:5'te küçük kalıyor.** İçerik görselin yüksekliğinin
  yalnızca **%11–14**'ünü kaplıyor; geri kalanı çerçeve ve boşluk. Metin boyutları X'in
  16:9 formatına göre ayarlı. Instagram vitrin platformumuz (§5) ve tıkların %76'sı mobil
  (§3) — telefonda bu kartlar olabileceğinden çok daha küçük okunuyor.
  *Düzeltme küçük: stat kartının zaten yaptığı gibi, formata göre büyüyen metin.*

### 8.3 Görsel ilkeler

1. **Sayı kahramandır.** Görseldeki en büyük şey gerçek — §4'teki "sayı önce" kuralının
   görsel karşılığı.
2. **Bir görsel, bir fikir.**
3. **Telefonda bir saniyede okunur.** Gövdede ~15 kelimeden fazla yok.
4. **Hep aynı çerçeve.** Tutarlılık, 6 takipçili bir hesabın akışta tanınmasının tek yolu.
5. **Tipografik varsayılan.** Oyuncu fotoğrafı yok, EA kart görseli ya da oyun ekran
   görüntüsü yok — hakkı bizde olmayan hiçbir görsel yok. Başlık kartındaki kapak görselleri
   yalnızca kullanım hakkı bizde olanlarla.
6. **Her görselin alternatif metni (alt text) var.** X ve Instagram destekliyor; erişilebilirlik
   için ve ajan bunu yazabilir.

### 8.4 Renk ve yazı

Koddaki mevcut değerler (`app/api/social-card/route.tsx`) — sistem bunlarla sabitlenir:

| Öğe | Değer | Kullanım |
|---|---|---|
| Arka plan | Koyu lacivert gradyan `#060f1e → #0d2338` | Her kart |
| Üst şerit | Nane → camgöbeği → kehribar `#00d4aa · #22d3ee · #FFB81C` | Her kart, marka imzası |
| Nane | `#2fe6c4` | Etiketler, birinci taraf, CTA |
| Mercan | `#ff6b5a` | İkinci taraf, liste numaraları |
| Kehribar | `#FFD479` | Kategori etiketi |
| Yazı | Space Grotesk 700 | Her şey |

### 8.5 Öneri: etiket ayağı söylesin

Sağ üstteki etiket bugün sitenin kategorisini gösteriyor (*PLAYER RADAR*, *SCOUT LIST*).
Öneri: **§6'daki ayağı** göstersin — *THE LIST*, *CARD VS REALITY*, *THE RECEIPT*,
*ONE TO WATCH*. Takipçi birkaç haftada formatları tanır; bir *RECEIPT* etiketi, açmadan
önce ne okuyacağını söyler.

### 8.6 Kurulacaklar — orkestra aşamasında

| # | Ne | Neden |
|---|---|---|
| a | **contrast ve list kartlarını 4:5'te büyüt** | §8.2 — en küçük düzeltme, en büyük etki |
| b | **Carousel seti** — kapak + oyuncu başına slayt (isim, kulüp, yaş, bir sayı, bir cümle) + kapanış | Instagram'ın ana formatı (§6.4); bugün list kartı tek görsel |
| c | **"Scout Gamer Read" kartı** — oyuncu, reyting, gerçek sezon sayısı, hüküm (Underrated / Fair / Overrated) | ② ayağının kendi kartı; Ağustos'tan beri bekliyor, **Style A'nın yerine değil, yanına** |
| d | **Kartın üzerinde oyun sürümü** — *"EA FC 26"* ya da *"EA FC 27"* | Reyting eskiyince kart kendi kendini yalanlamasın (§6.2) |
| e | **Makbuz kartında tarih** — *"Called on 3 Sep 2026"* | ④ ayağının kanıtı tarihin kendisi |
| f | **Alt text üretimi** | §8.3 ilke 6 |
| g | **Video şablonu (9:16)** — hafta 3+ | §5.4 |

Carousel slaytlarındaki kulüp ve yaş, `fc_players`'tan değil, **yazının doğrulanmış
verisinden** gelir — 15 Eylül'de ana sayfa kartlarında yaşanan hatanın dersi.
