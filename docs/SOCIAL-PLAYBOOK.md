# Scout Gamer — Sosyal Medya Oyun Kitabı

Son güncelleme: 2026-09-26 · Sahibi: sosyal medya içerik yöneticisi (Claude) + hesap sahibi

Bu belge bir strateji değil, bir **işletim kılavuzu** — her bölüm "kim, ne zaman,
kaç dakika, hangi araçla" sorusuna cevap veriyor.

### Sıfır noktası (2026-09-26, hesaplara bakılarak ölçüldü)

| Hesap | Gönderi | Takipçi | Takip | Açılış |
|---|---|---|---|---|
| X `@scoutgamerx` | **54** | **2** | 68 | Haziran 2026 |
| Instagram `@scoutgamer_fc` | **51** | **4** | 106 | — |

**105 gönderi, 6 takipçi.** Paylaşım yapıldı, düzenli ve bol. Eksik olan paylaşım değil,
paylaşımın *biçimi*: görünen son X gönderisi (15 Eylül, genç kanatlar listesi) başlıktan
türetilmiş genel bir metin, üç genel hashtag (`#WorldCup2026` bir transfer listesinde) ve
gönderinin içinde link taşıyor — sıfır takipçili bir hesabın erişiminin en düşük olduğu
biçim. Bu belgenin değiştirmeye çalıştığı şey tam olarak bu.

> **Düzeltme.** Bu paragrafın ilk sürümü (ve daha önceki notlar) Ağustos planının "hiç
> çalıştırılmadığını" söylüyordu. Yanlıştı ve hiçbir veriye dayanmıyordu — hesaplara hiç
> bakılmamıştı. Doğrusu: planın üç kanalı (Reddit, kısa video, yanıt öncelikli X)
> başlamadı; paylaşım hiç durmadı.

Tüm gönderi ve yanıt metinleri **İngilizce** — site İngilizce, kitle global.
Açıklamalar Türkçe.

---

## 0. Tek cümlelik strateji

> **Oyunun veritabanının göremediğini biz görürüz.**

Her gönderi üç şey taşır: **belirli bir oyuncu · belirli bir sayı · reytingin
göstermediği bir hüküm.** Genel "genç yetenekler" içeriği değil — iddia.

Bu IP'nin kanıtı zaten GSC'de: en çok tık getiren 12 sorgunun 12'si
"best young strikers / centre backs" varyasyonu. İnsanlar genç oyuncu listesi arıyor;
biz o listeyi oyunun reytingine karşı okuyoruz.

---

## 1. Kim ne yapar

| Claude (içerik yöneticisi) | Hesap sahibi |
|---|---|
| Haftalık içerik paketi (post, carousel, video senaryosu) | Gönderileri hesaptan atar |
| Kartlar (`/api/social-card`, 5 varyant) | Yanıtları ve yorumları hesaptan yazar |
| Yanıt bankası (haftada 20 hazır cümle) | Kısa videoyu üretir (8–16 sn) |
| Hashtag ve thread takip listesi | Günde 30 dakika |
| UTM'li linkler, haftalık skor tablosu | Haftalık skor tablosunu okur, 3 kararı verir |
| Her gönderideki her iddianın doğrulanması | — |

**Kural:** Claude hesaplardan onaysız gönderi atmaz. Etkileşim (beğeni, yanıt, takip)
**otomatikleştirilmez** — hem platform kurallarına aykırı, hem de sıfır takipçili bir
hesabın tek sermayesi olan güvenilirliği yakar. Her yanıt bir insanın elinden çıkar.

---

## 2. Önce ölçüm (Hafta 0 — ertelenmez)

Bugün sosyal medyanın performansı hakkında **tek bir ölçümümüz yok.** Her teşhis tahmin.

- [ ] **UTM her linkte.** `?utm_source=x|instagram|reddit&utm_medium=social&utm_campaign=<slug>`
      `social-pack.mjs` bunu otomatik eklemeli (bkz. §11).
- [x] **Sıfır noktası** — yukarıdaki tablo (2026-09-26). Her Cuma aynı dört sayı tekrar alınır.
- [ ] **Haftalık skor tablosu** — beş satır, her Cuma:

| Metrik | Kaynak | Neden |
|---|---|---|
| Profil ziyareti | X Analytics, IG Insights | İlk 6 haftanın asıl ölçüsü |
| Takipçi (net) | platform | Kitle edinme |
| Yanıt başına etkileşim | platform | Hangi yanıt tipi çalışıyor |
| Sosyalden gelen oturum | GA → Traffic acquisition | Trafik — ama 6. haftadan sonra |
| Siteye tıklama / UTM kampanya | GA | Hangi içerik taşıyor |

**İlk 6 hafta tıklamayla ölçülmez.** Sıfır takipçiyle trafik beklemek, kanalı
işe yaramadan kapatmanın en hızlı yolu.

---

## 3. Hesap hijyeni (bir kez, 1 saat)

- [ ] **X bio:** `Young talent, read against the ratings. Where the game's database is wrong — before it updates. 🔎 scoutgamer.com`
- [ ] **IG bio:** aynı ton, link-in-bio UTM'li.
- [ ] **Sabit gönderi (X):** sitenin 1 numaralı sayfası — *The Best Young Centre-Backs* —
      oyuncu başına bir tweet'lik thread olarak.
- [ ] **Kapak/header:** Style A kartından.
- [ ] Not: kullanıcı adları tutarsız — X `@scoutgamerx`, IG `@scoutgamer_fc`.
      Şimdilik dokunulmaz; karar senin.

---

## 4. İçerik ayakları

| Ayak | Pay | Ne | Kart |
|---|---|---|---|
| **The game is wrong** | %40 | Reyting vs gerçek: kart X diyor, sezon Y diyor | `contrast`, `stat` |
| **Lists** | %20 | Kanıtlanmış arama formatı, sosyal için paketlenmiş | `list` + carousel |
| **Deep cuts** | %25 | Herkesten önce bilinmesi gereken isim | `stat` |
| **The receipt** | %15 | "Şu tarihte şunu yazdık, şu oldu" | `verdict` |

**Receipt formatı farkımız.** Kimse tuttuğu tahminin arkasında durmak istemez; biz
tarihli yazıyoruz. Bankadakiler: Bouaddi (12 Tem), Robinio Vaz, Ngumoha (20 Eyl).

> **Düzeltme (2026-09-26).** Eski notlarda bu ayak *"kart yanlış / lig yok / yaş yok"*
> diye kuruluydu. **"Lig yok" yanlıştı.** MLS, EA FC'de lisanslı; bizim Kaggle veri
> setimizde 0 MLS oyuncusu olması setin eksikliği, oyunun değil. "Yaş yok" doğru —
> EA 17 yaş altını oyuna almıyor (Dowman). Bkz. §10.

---

## 5. Platform formatları

**X**
- Tekil gönderi + kart görseli. **Link gönderide değil, kendi gönderimizin altındaki
  ilk yanıtta** — birçok kaynak ana gönderideki linkin erişimi düşürdüğünü söylüyor; X
  bunu resmi olarak belgelemedi (bkz. SOCIAL-STRATEGY.md §10.4).
- Liste → thread: bir oyuncu, bir tweet, bir kart.
- Hashtag en fazla 2.

**Instagram**
- **Carousel** (haftada 2): kapak → oyuncu başına bir slayt → CTA slaytı.
  `social-pack.mjs` slayt metinlerini hazır veriyor.
- **Reels** — kısa video buraya ve TikTok/Shorts'a aynı dosya.
- **Story anketi:** *"Is his FC 27 rating fair? Yes / Too low"* — sıfır maliyetli etkileşim.
- Hashtag 5–8, caption sonunda.

**Reddit** — ilk hafta trafik getirebilecek tek kanal. Önce değer; link yalnızca
subreddit kuralları izin veriyorsa. Her ilk gönderiden önce kurallar okunur.

**Kısa video (8–16 sn)** — üç şablon:
```
0–3s   Oyuncunun adı + tek cümlelik kanca
3–8s   Kartın sayısı  (FC 27: 67)
8–13s  Gerçeğin sayısı (17 goal contributions, 16 years old)
13–16s Hüküm (the card will move — the question is how fast)
```
**Öneri:** ses yok, ekranda metin. Üretimi üç kat hızlı ve sosyal videoların çoğu
zaten sessiz izleniyor. (Ağustos'tan beri açık karar — senin onayını bekliyor.)

---

## 6. Etkileşim motoru — nereye, nasıl yanıt verilir

Sıfır takipçili bir hesabın büyümesi **kendi gönderilerinden değil, başkalarının
thread'lerindeki yanıtlardan** gelir.

### Öncelik sırası

1. **FC 27 reyting şikayetleri** — *"why is X only 7x?"* Cevap bizde, gerçek sayıyla.
   **Şu an zirvede** (bkz. §10).
2. **"Bu çocuk kim?" thread'leri** — genç bir oyuncu gol attıktan sonraki **ilk 30 dakika.**
   Geç gelen yanıt görünmez.
3. **Wonderkid / FM thread'leri** — liste yazıları birebir oturuyor.
4. **Genç oyuncu transfer söylentileri** — yaş, dakika, rol bizde doğrulanmış.
5. **Sabit takip listesi** — yanıtları okunan ~20 hesap (§7).

### Yanıt kuralları

- **Bir gerçek, onlarda olmayan.** Fikir değil, sayı.
- **İlk yanıtta link yok.** Link sadece biri sorduğunda.
- Asla "check out our site". Asla tartışma. Yazarla asla alay yok.
- Bir thread'e **bir** yanıt.
- Her sayı yayınlanmış, doğrulanmış bir yazıdan ya da taze bir kaynaktan gelir (§9).

### Yanıt şablonları (İngilizce)

**Reyting şikayeti:**
> {Player} at {rating} is the card reading last season. {One verified fact from this season}. The number will move — the only question is how far.

**Gol sonrası "kim bu":**
> {Age}. {Record or context in one clause}. {Club's approach in one clause}.

**Receipt:**
> We had him in our {month} list when his card said {rating}. {What happened since}.

**Deep cut:**
> If you like {Player A}, {Player B} is the name before everyone has it: {one fact}.

**Karşılaştırma:**
> {A}: {number}. {B}: {number}. Same age, very different {minutes/role/fee}.

### CTA merdiveni

```
yanıt (link yok) → profil ziyareti → sabit gönderi → site (UTM)
```

Yanıt satmaz, **merak** yaratır. Satış profilde ve sabit gönderide yapılır.
Bu yüzden bio ve sabit gönderi hafta 0'da hazır olmak zorunda.

---

## 7. Takip listesi

### Kayıtlı aramalar (X)
- `"FC 27" rating underrated`
- `"FC 27" "should be higher"`
- `wonderkid`
- `"youngest ever" scorer`
- `{takip edilen oyuncu adı} rating`

### Hashtag'ler
`#FC27` `#EAFC27` `#UltimateTeam` `#FUT` `#FM26` `#Wonderkids` `#USMNT` `#MLS`

Hashtag süs değil, keşif aramasıdır. **Hafta 1'de hepsinin hacmi elle kontrol edilir**;
ölü olan listeden çıkar.

### Hesaplar (başlangıç — kullanmadan önce her biri doğrulanır)
- **Oyun:** `@EASPORTSFC`, `@FUTBIN`
- **Veri:** `@OptaJoe`, `@Squawka`
- **Lig / milli:** `@MLS`, `@USMNT`
- **Kulüp:** yazdığımız oyuncuların kulüpleri — örn. `@PhilaUnion`, `@Arsenal`, `@LFC`
- **Transfer:** `@FabrizioRomano` — yalnızca genç oyuncu haberlerinde, yalnızca değer katan yanıt

Liste her hafta §8'deki pakette güncellenir.

---

## 8. Haftalık ritim

### Günlük — 30 dakika (hesap sahibi)
| Dakika | İş |
|---|---|
| 10 | Kayıtlı aramaları tara → **5 yanıt** (yanıt bankasından) |
| 10 | Günün planlı gönderisini at |
| 10 | Kendi gönderilerimize gelen yanıtlara dön |

### Haftalık
- **Pazartesi — Claude:** haftanın paketi. 5 X gönderisi, 2 carousel, 3 video senaryosu,
  20 satırlık yanıt bankası, güncel takip listesi, hepsi UTM'li.
- **Cuma — birlikte:** skor tablosu → **en fazla 3 karar** → `docs/TODO.md`.

### Takvim şablonu
| Gün | Ayak |
|---|---|
| Pzt | List |
| Sal | The game is wrong |
| Çar | Deep cut |
| Per | Receipt / video |
| Cum | Carousel |
| Hafta sonu | Sadece maç günü yanıtları |

**Sıralama kuralı:** önce X yanıtları + Reddit oturur, sonra video eklenir. Üç kanalı
aynı anda açmak, Ağustos'ta sıfırın sebebiydi.

---

## 9. Doğrulama kuralı — her gönderi için

**Bir gönderideki her sayı ve her iddia, ya yayınlanmış ve doğrulanmış bir yazıdan
ya da o hafta bulunmuş bir kaynaktan gelir.**

Bu kural 2026-09-26'da bir hatadan doğdu: #157 Sullivan yazısı *"EA FC 26 MLS'i
taşımıyor, lisanssız"* dedi. Yanlıştı — MLS oyunda; Sullivan'ın FC 26'da olmamasının
sebebi yaş kuralıydı. Hata, veri setimizdeki 0 MLS oyuncusunun **oyunun kendisi**
sanılmasından çıktı ve yayın kapısı bunu göremedi, çünkü kartı olmayan oyuncular
hakkındaki iddiaları denetlemiyor (Chilwell vakasıyla aynı kör nokta).

Sosyal medyada bu tür bir hata, tam da güvenilirlik kazanmaya çalıştığımız yerde —
reyting topluluğunun önünde — yapılır. **Oyunun kendisi hakkındaki her iddia**
(kim var, kim yok, hangi lig, hangi kural) gönderilmeden önce EA'in resmi sayfasından
ya da FUTBIN'den doğrulanır.

---

## 10. Açılış kampanyası — FC 27 reyting haftaları (26 Eylül → 10 Ekim)

**Neden şimdi:** FC 27 25 Eylül'de çıktı. Reyting tartışması ilk iki haftada zirve
yapar. Sitenin bütün IP'si bu tartışma. Bu pencere kaçarsa bir yıl beklenir.

| # | İçerik | Ayak | Kaynak |
|---|---|---|---|
| 1 | **Sullivan: ilk kartı 67, ama o kart gelmeden 17 gol katkısı ve 16 yaşında milli takım.** | Game is wrong | EA resmi sayfa + #157 (26 Eyl'de düzeltildi) |
| 2 | **Ngumoha receipt:** 20 Eylül'de "kart ona inanmıyor" yazdık. FC 27 ne verdi? | Receipt | #149 + EA FC 27 |
| 3 | **Dowman:** 3 PL rekoru, **kartı yok** — EA 17 yaş altını almıyor. 31 Aralık'ta 17 olacak. | Game is wrong | #158 (Sullivan satırları düzeltildikten sonra) |
| 4 | **"Our centre-backs list vs FC 27"** — 1 numaralı sayfamızın oyuncuları yeni reytinglerle | List | #136 + EA FC 27 |
| 5 | **Günlük:** reyting şikayeti thread'lerine yanıt | Etkileşim | Yanıt bankası |

**Bağımlılık:** 2 ve 4 için FC 27 reytingleri lazım. FC 27 importu yapılmadan da
EA'in resmi sayfalarından 5–10 oyuncu elle alınabilir — kampanya import'u beklemez.

---

## 11. Claude'un kuracağı araçlar

- [ ] **UTM'i `social-pack.mjs`'e ekle** — her link kaynak/kampanya taşısın.
- [ ] **Yanıt bankası üreteci** — yayındaki yazılardan §6 şablonlarına göre 20 satır.
- [ ] **FC 26 → FC 27 fark listesi** — hakkında yazdığımız her oyuncunun reyting değişimi.
      Receipt ayağının yakıtı. FC 27 importuna bağlı.
- [ ] **Haftalık skor tablosu** — GSC ingest işiyle birlikte (bkz. `TODO.md`).
- [ ] **Player card varyantı** — "Scout Gamer Read" (oyuncu + FC reytingi + gerçek seviye
      + tier). Ağustos'tan beri açık; Style A'ya **ek**, onun yerine değil.

---

## 12. Hedefler — gerçekçi

| Süre | Hedef |
|---|---|
| 2 hafta | Rutin oturdu: günde 5 yanıt, haftada 5 gönderi, skor tablosu dolu |
| 6 hafta | Profil ziyaretleri artıyor; hangi yanıt tipinin çalıştığı biliniyor |
| 3 ay | Sosyal, GA'da ölçülebilir bir trafik kaynağı |

Sıfırdan anlamlı çekiş 3–6 ay sürer. İlk 4–6 hafta neredeyse hiçbir şey görünmez —
bu, planın çalışmadığı anlamına gelmez.
