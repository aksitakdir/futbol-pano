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
