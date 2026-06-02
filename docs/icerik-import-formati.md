# ScoutGamer — İçerik Import Formatı (Block Editor)

Bu belge, admin panelindeki **Block Editor → "⇊ Import from text"** özelliğinin
anladığı işaretleme dilini tanımlar. Amaç: içerik üretirken (insan ya da AI) bu
kurallara uygun **tek bir metin** hazırlamak; sistem onu otomatik olarak block
editör bloklarına dönüştürür.

> **AI araçları için:** Bu dosya bir SPEC'tir. Çıktını AŞAĞIDAKİ sözdizimine
> **birebir** uyacak şekilde, düz metin olarak üret. HTML üretme; satır içi
> biçimlendirme dışında etiket kullanma. Tanımlı olmayan bir sözdizimi
> uydurma — tanınmayan satırlar paragraf sayılır.

---

## 1. Temel Kural

- **Bloklar boş satırla ayrılır.** İki blok arasında en az bir boş satır bırak.
- Her satır baştaki/sondaki boşluklardan arındırılır (trim edilir).
- Tanınmayan herhangi bir satır **paragraf** olarak işlenir.
- Bloklar yazıldıkları **sırayla** eklenir.

---

## 2. Blok Tipleri

### Başlık (Heading)
```
# Main Heading
## Sub Heading
```
- `#` → H2 başlık (yazının içindekiler/TOC listesine girer).
- `##` (veya daha fazla `#`) → H3 başlık.
- Başlıklarda satır içi biçimlendirme **çalışmaz** (düz metin görünür).

### Paragraf (Plain)
```
This is a paragraph. Consecutive lines in the same
block are merged into a single paragraph.
```
- Arada boş satır olmayan ardışık düz metin satırları **tek paragraf** olur.
- Satır içi biçimlendirme **çalışır** (bkz. Bölüm 3).

### Bölüm (Section) — başlık + gövde
```
@section: Section Heading
Body text under this heading.
All lines until the next blank line go into the body.
```
- Başlık + gövdeyi tek blokta birleştirir; başlık TOC'a girer.
- Gövdede satır içi biçimlendirme **çalışır**.
- Gövde, **boş satıra kadar** olan satırları kapsar.

### Lead / Giriş Paragrafı (Intro)
```
@lead: The article's bold opening paragraph.
It can span multiple lines; continues until a blank line.
```
- Büyük puntolu, drop-cap'li açılış metni.
- Çok satırlı: boş satıra kadar tüm satırları alır.
- Satır içi biçimlendirme **çalışır**.

### Callout / Bilgi Kutusu
```
@callout: A tactical note or highlighted info box.
This can also span multiple lines.
```
- Vurgulu bilgi/uyarı kutusu.
- Çok satırlı (boş satıra kadar). Satır içi biçimlendirme **çalışır**.

### Alıntı (Pull Quote)
```
> This is a highlighted pull quote.
```
- İtalik, öne çıkan alıntı bloğu.
- **Tek satır.** Satır içi biçimlendirme **çalışmaz** (düz metin).

### Liste (List)
```
- First item
- Second item
- Third item
```
veya numaralı:
```
1. First item
2. Second item
```
- `-` veya `*` → madde imli (ul) liste.
- `1.` `2.` (veya `1)` `2)`) → numaralı (ol) liste.
- **Ardışık** aynı tip maddeler tek listede gruplanır.
- Madde içinde satır içi biçimlendirme **çalışmaz** (düz metin).

### Görsel (Image)
```
![alt text](https://example.com/image.jpg)
```
- Standart markdown görsel sözdizimi. `alt` boş bırakılabilir: `![](url)`.

### Video (YouTube)
```
@video: https://www.youtube.com/watch?v=VIDEO_ID
@video: https://youtu.be/VIDEO_ID
@video: VIDEO_ID
```
- Tam YouTube URL'i ya da doğrudan video ID'si verilebilir; sistem ID'yi çözer.

### Oyuncu Kartı (Player)
```
@player: L. Yamal
@player: L. Yamal, K. Mbappé, Pedri
```
- Her isim için ayrı bir zengin oyuncu kartı bloğu oluşturur.
- Virgülle birden fazla isim verilebilir.
- **Yarı otomatik:** sistem ismi `fc_players` veritabanında arar; editörde
  doğrulayıp düzeltebilirsin. İsmi olabildiğince tam ve doğru yaz.

### Karşılaştırma (Versus / vs.)
```
@vs: Left Title | Right Title
left point 1 | right point 1
left point 2 | right point 2
```
- İki sütunlu karşılaştırma kartı (ör. Messi vs Ronaldo), ortada "VS".
- İlk satır: `@vs: Sol | Sağ` → iki tarafın başlığı (dikey çizgi `|` ile ayrılır).
- Sonraki her satır bir madde çifti: `sol | sağ`. Boş satıra kadar sürer.
- Bir taraf boş bırakılabilir (ör. `sadece sol madde |`); boş maddeler
  görmezden gelinir.
- Madde başına `- ` koyabilirsin (zorunlu değil): `- sol | - sağ`.
- Madde içinde satır içi biçimlendirme **çalışmaz** (düz metin).

### SSS (FAQ)
```
@faq: Frequently Asked Questions
First question? Answer text here.
Second question? Another answer.
No question mark, split here | Answer can be given this way too.
```
- Soru-cevap listesi; sayfada açılır-kapanır (`<details>`) olarak render edilir.
- **SEO için FAQPage structured data (JSON-LD)** otomatik eklenir → Google'da
  zengin sonuç / "Bunları da merak ediyor olabilirsiniz" şansı.
- İlk satır: `@faq: Başlık` → opsiyonel başlık (içindekiler/TOC'a girer). Başlık
  istemiyorsan sadece `@faq:` yaz.
- Sonraki her satır bir Q&A. İki yazım da geçerli:
  - `Soru? Cevap` → ilk soru işaretinden böler.
  - `Soru | Cevap` → dikey çizgiyle böler (soru işareti yoksa kullan).
- **Önemli:** Hem soru hem cevap dolu olmalı; cevabı boş olan sorular SEO
  schema'ya **dahil edilmez** (Google'a bozuk veri gitmesin diye).

---

## 3. Satır İçi Biçimlendirme

Yalnızca HTML olarak render edilen bloklarda çalışır:
**paragraf, `@lead`, `@callout`, `@section` gövdesi.**
(Başlık, alıntı ve liste maddelerinde çalışmaz — oralarda düz metin kullan.)

```
**bold**            -> kalın
*italic*            -> italik
[link text](https://example.com)  -> tıklanabilir link (yeni sekmede açılır)
```

- Linkler `target="_blank" rel="noopener noreferrer"` ile açılır.
- Diğer tüm HTML kaçışlanır (güvenlik) — yani `<`, `>`, `&` aynen metin olur.
  Ham HTML yazma; sadece yukarıdaki üç işaret çalışır.

---

## 4. Tam Örnek

```
@lead: The most talked-about young star in Europe this season, **Lamine Yamal**,
keeps raising the bar with every match in a Barcelona shirt.

# A Breakout That Defined the Season

Yamal stood out with his *consistency* this season. See the
[official page](https://example.com) for detailed stats.

@section: Strengths
Exceptional for his age in dribbling, final passing and composure.

- Two-footed ability
- High footballing IQ
- One-on-one effectiveness

> He shows a maturity well beyond his years.

@player: L. Yamal

@vs: Yamal | Mbappé
Breakout at 17 | Early maturity
Left-wing maestro | Clinical finishing
Barcelona | Real Madrid

@faq: Frequently Asked Questions
How old is Yamal? Born in 2007, the youngest star on the team.
What position does he play? Effective on the right wing and in the number-ten role.

![Yamal goal celebration](https://example.com/yamal.jpg)

@video: https://youtu.be/abcdef12345

@callout: The next match is this **weekend**.
```

Yukarıdaki metin sırasıyla şu bloklara dönüşür:
intro → header(H2) → section → list(ul) → pullquote → player → vs → faq →
image → youtube → callout.

---

## 5. AI İçin Hızlı Kontrol Listesi

- [ ] Bloklar arasına **boş satır** koydum.
- [ ] Ham HTML **yazmadım**; sadece `**`, `*`, `[..](..)` kullandım.
- [ ] Satır içi biçimlendirmeyi yalnızca paragraf/lead/callout/section gövdesinde
      kullandım (başlık/alıntı/liste maddesinde değil).
- [ ] Oyuncu isimlerini olabildiğince **tam ve doğru** yazdım.
- [ ] Video için geçerli bir YouTube URL'i ya da ID verdim.
- [ ] Görsel için geçerli bir URL verdim.
- [ ] `@vs:` kullandıysam başlık satırında `|` ile iki tarafı ayırdım, madde
      satırlarında da `sol | sağ` formatını korudum.
- [ ] `@faq:` kullandıysam her soru için **dolu bir cevap** yazdım (boş cevaplı
      sorular SEO schema'ya alınmaz).
- [ ] Tanımlı olmayan bir sözdizimi **uydurmadım**.

---

## 6. Sözdizimi Özet Tablosu

| Yazım | Blok | Satır içi biçim? |
|-------|------|------------------|
| `# Metin` | Header (H2, TOC'a girer) | Hayır |
| `## Metin` | Header (H3) | Hayır |
| düz metin | Paragraf | **Evet** |
| `@section: Başlık` + gövde | Section (başlık + gövde) | Evet (gövdede) |
| `@lead: ...` | Intro (giriş paragrafı, çok satırlı) | **Evet** |
| `@callout: ...` | Callout (bilgi kutusu, çok satırlı) | **Evet** |
| `> Metin` | Pull quote (tek satır) | Hayır |
| `- madde` / `* madde` | Liste (ul) | Hayır |
| `1. madde` | Liste (ol) | Hayır |
| `![alt](url)` | Görsel | — |
| `@video: url\|id` | YouTube | — |
| `@player: A, B` | Oyuncu kartı (her isim ayrı) | — |
| `@vs: Sol \| Sağ` + `l \| r` satırları | Versus (iki sütun karşılaştırma) | Hayır |
| `@faq: Başlık` + `Soru? Cevap` satırları | SSS (Q&A + SEO schema) | Hayır |
```
