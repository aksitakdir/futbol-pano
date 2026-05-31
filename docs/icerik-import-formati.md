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
# Ana Başlık
## Alt Başlık
```
- `#` → H2 başlık (yazının içindekiler/TOC listesine girer).
- `##` (veya daha fazla `#`) → H3 başlık.
- Başlıklarda satır içi biçimlendirme **çalışmaz** (düz metin görünür).

### Paragraf (Plain)
```
Bu bir paragraftır. Aynı bloğa ait
ardışık satırlar tek bir paragrafta birleştirilir.
```
- Arada boş satır olmayan ardışık düz metin satırları **tek paragraf** olur.
- Satır içi biçimlendirme **çalışır** (bkz. Bölüm 3).

### Bölüm (Section) — başlık + gövde
```
@section: Bölüm Başlığı
Bu başlığın altındaki gövde metni.
Bir sonraki boş satıra kadar süren tüm satırlar gövdeye girer.
```
- Başlık + gövdeyi tek blokta birleştirir; başlık TOC'a girer.
- Gövdede satır içi biçimlendirme **çalışır**.
- Gövde, **boş satıra kadar** olan satırları kapsar.

### Lead / Giriş Paragrafı (Intro)
```
@lead: Yazının vurgulu açılış paragrafı.
Birden fazla satır olabilir; boş satıra kadar devam eder.
```
- Büyük puntolu, drop-cap'li açılış metni.
- Çok satırlı: boş satıra kadar tüm satırları alır.
- Satır içi biçimlendirme **çalışır**.

### Callout / Bilgi Kutusu
```
@callout: Taktik notu ya da öne çıkan bilgi kutusu.
Bu da çok satırlı olabilir.
```
- Vurgulu bilgi/uyarı kutusu.
- Çok satırlı (boş satıra kadar). Satır içi biçimlendirme **çalışır**.

### Alıntı (Pull Quote)
```
> Bu bir vurgulu alıntıdır.
```
- İtalik, öne çıkan alıntı bloğu.
- **Tek satır.** Satır içi biçimlendirme **çalışmaz** (düz metin).

### Liste (List)
```
- Birinci madde
- İkinci madde
- Üçüncü madde
```
veya numaralı:
```
1. Birinci madde
2. İkinci madde
```
- `-` veya `*` → madde imli (ul) liste.
- `1.` `2.` (veya `1)` `2)`) → numaralı (ol) liste.
- **Ardışık** aynı tip maddeler tek listede gruplanır.
- Madde içinde satır içi biçimlendirme **çalışmaz** (düz metin).

### Görsel (Image)
```
![alt metni](https://ornek.com/gorsel.jpg)
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

---

## 3. Satır İçi Biçimlendirme

Yalnızca HTML olarak render edilen bloklarda çalışır:
**paragraf, `@lead`, `@callout`, `@section` gövdesi.**
(Başlık, alıntı ve liste maddelerinde çalışmaz — oralarda düz metin kullan.)

```
**kalın**           -> kalın
*italik*            -> italik
[bağlantı](https://ornek.com)  -> tıklanabilir link (yeni sekmede açılır)
```

- Linkler `target="_blank" rel="noopener noreferrer"` ile açılır.
- Diğer tüm HTML kaçışlanır (güvenlik) — yani `<`, `>`, `&` aynen metin olur.
  Ham HTML yazma; sadece yukarıdaki üç işaret çalışır.

---

## 4. Tam Örnek

```
@lead: Bu sezon Avrupa'nın en çok konuşulan genç yıldızı **Lamine Yamal**,
Barcelona forması altında çıtayı her maç biraz daha yükseltiyor.

# Sezona Damga Vuran Çıkış

Yamal, bu sezon *istikrarıyla* öne çıktı. Detaylı istatistikler için
[resmi sayfa](https://example.com) incelenebilir.

@section: Güçlü Yönleri
Top sürme, son pas ve soğukkanlılık konusunda yaşına göre olağanüstü.

- Çift ayak kullanımı
- Yüksek futbol IQ'su
- Bire bir etkinliği

> Yaşının çok ötesinde bir olgunluk sergiliyor.

@player: L. Yamal

![Yamal gol sevinci](https://example.com/yamal.jpg)

@video: https://youtu.be/abcdef12345

@callout: Bir sonraki maç bu **hafta sonu** oynanacak.
```

Yukarıdaki metin sırasıyla şu bloklara dönüşür:
intro → header(H2) → section → list(ul) → pullquote → player → image →
youtube → callout.

---

## 5. AI İçin Hızlı Kontrol Listesi

- [ ] Bloklar arasına **boş satır** koydum.
- [ ] Ham HTML **yazmadım**; sadece `**`, `*`, `[..](..)` kullandım.
- [ ] Satır içi biçimlendirmeyi yalnızca paragraf/lead/callout/section gövdesinde
      kullandım (başlık/alıntı/liste maddesinde değil).
- [ ] Oyuncu isimlerini olabildiğince **tam ve doğru** yazdım.
- [ ] Video için geçerli bir YouTube URL'i ya da ID verdim.
- [ ] Görsel için geçerli bir URL verdim.
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
```
