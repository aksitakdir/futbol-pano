# Admin Güvenlik & RLS Sıkılaştırma — Süreç Notları

> Bu dosya, admin panelinin güvenlik açığını kapatmak için yapılan tüm çalışmanın
> kaydıdır. İlerlemeni kaybetmemek ve sonra geri dönüp bakmak için hazırlandı.
> Tarih: 2026 Mayıs.

---

## 1. SORUN NEYDİ?

Admin paneli (`/admin/*`) veritabanına **tarayıcıdan, anon key (herkese açık anahtar)**
ile yazıyordu. Anon key sitenin JavaScript paketinde görünür — yani **herkes** elde
edebilir.

Supabase'deki RLS (Row Level Security / Satır Düzeyi Güvenlik) politikaları da buna
izin verecek şekilde gevşekti:

- Bazı tablolarda `ALL USING(true)` politikası vardı → **internetteki herkes** o anon
  key ile bu tablolara yazıp **silebilirdi**.
- Bazı tablolarda (`contents`, `site_settings`, `static_contents`, `fc_players`) RLS
  **tamamen kapalıydı** → yani **makalelerin tümü** dahil her şey herkese açıktı.

`proxy.ts`'deki şifre koruması sadece **admin sayfasının görüntülenmesini** engelliyordu;
Supabase'e doğrudan istek atmayı engellemiyordu.

**Not:** Kullanıcı oylama sistemi (`arena_votes`, `transfer_ab_votes`) zaten DOĞRU
kuruluydu (sadece INSERT + SELECT). Açık ondan kaynaklanmıyordu; bunlara dokunulmadı.

---

## 2. ÇÖZÜM YAKLAŞIMI ("Tam çözüm")

Üç parçalı:

1. **Service-role key**: Sunucu tarafında kullanılan, RLS'i bypass eden gizli anahtar.
   Asla tarayıcıya gitmez. Tüm admin yazmaları bunu kullanacak.
2. **Sunucu tarafına taşıma**: Tüm yazma işlemleri tarayıcıdan alınıp, kimlik doğrulaması
   yapan sunucu kodlarına (Server Actions / API routes) taşındı.
3. **RLS kilidi**: En son, anon key'in yazma izni veritabanı seviyesinde tamamen kapatıldı.

Kilit mantığı: **Okuma açık kalır** (public sayfalar + admin paneli çalışsın diye),
**yazma sadece service-role ile** mümkün olur.

---

## 3. NELER DEĞİŞTİ? (Commit commit)

Hepsi `main` dalında, "security" etiketli commit'ler:

| Commit | Ne yaptı |
|--------|----------|
| `3ef4e4a` | `lib/supabase-admin.ts` eklendi (service-role client). Sunucu yazmaları (hub-sync, generate-content, migrate-content, cron, transfer-hub, view) service-role'e çevrildi. `server-only` paketi kuruldu. |
| `0f9fd46` | `lib/admin-auth.ts` eklendi — `isAdminRequest()` helper. API route'larının kimlik doğrulaması için (sg_admin cookie veya Basic auth). |
| `aa4c755` | Arena admin yazmaları server action'a taşındı (`app/admin/arena/actions.ts`). Desen kuruldu. |
| `74dd9a3` + `9c8ef80` | Kalan tüm admin sayfaları server action'a taşındı: ayarlar, icerikler, statik, transfers, yeni, duzenle, kadrolar. Artık HİÇBİR admin sayfası anon key ile yazmıyor. |
| `4d6bc95` | "Sign Out" bug'ı düzeltildi. Eskiden yanlış cookie'yi (`admin_session`) siliyordu; gerçek cookie `sg_admin` ve httpOnly olduğu için çıkış hiç çalışmıyordu. `POST /api/admin/logout` eklendi. |
| `(RLS audit)` | `supabase/rls_audit.sql` — mevcut durumu görmek için read-only teşhis sorgusu. |
| `(RLS lockdown)` | `supabase/rls_lockdown.sql` — anon yazmayı kapatan kilitleme SQL'i. |

### Yeni dosyalar
- `lib/supabase-admin.ts` — service-role Supabase client (server-only).
- `lib/admin-auth.ts` — `isAdminRequest()` kimlik doğrulama helper'ı.
- `app/admin/*/actions.ts` — her admin bölümü için kimlik-korumalı server action'lar.
- `app/admin/content-actions.ts` — makale oluştur/güncelle.
- `app/api/admin/logout/route.ts` — oturum kapatma.
- `supabase/rls_audit.sql`, `supabase/rls_lockdown.sql` — teşhis ve kilitleme SQL'leri.

### Mimari kural (bundan sonra geçerli)
- **Yazma işlemleri** → `lib/supabase-admin.ts`'teki `supabaseAdmin` (server-only).
  Her zaman `isAdminRequest()` ile koru.
- **Public okuma** → `lib/supabase.ts`'teki `supabase` (anon, RLS'e tabi).
- Service-role client'ı ASLA "use client" dosyasına import etme (`server-only` paketi
  bunu build hatasına çevirir).

---

## 4. ENV (ORTAM DEĞİŞKENLERİ)

`SUPABASE_SERVICE_ROLE_KEY` eklendi:
- **Nereden alınır:** Supabase Dashboard → Project Settings → API → `service_role` (secret).
- **Yerel:** `.env.local` dosyasına eklendi (zaten `.gitignore`'da, repoya gitmez).
- **Canlı:** Vercel'e MUTLAKA eklenmeli (aşağıdaki adımlara bak).

⚠️ Bu anahtar tam yetkilidir, RLS'i bypass eder. Gizli tutulmalı, asla public olmamalı.

---

## 5. CANLIYA ALMA SIRASI (ÇOK ÖNEMLİ — bu sırayla)

RLS'i kilitlemeden ÖNCE service-role key canlıda hazır olmalı. Yoksa canlı admin
paneli yazamaz hale gelir.

### Adım 1 — Push (Claude yapacak)
Tüm commit'ler `origin/main`'e gönderilir. Vercel otomatik deploy alır.
> Bu aşamada RLS hâlâ açık, anon fallback çalıştığı için site bozulmaz.

### Adım 2 — Vercel env (SEN yapacaksın)
1. Vercel Dashboard → futbol-pano → **Settings → Environment Variables**
2. Yeni değişken:
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (Supabase'den aldığın service_role secret)
   - Ortamlar: Production + Preview + Development (hepsi işaretli)
3. **Save**
4. **Redeploy** yap (Deployments → en üstteki → ⋯ → Redeploy). Env değişikliği eski
   deploy'a yansımaz, yeniden deploy şart.

### Adım 3 — Canlı test (SEN/birlikte)
Canlı admin panelinden küçük bir işlem yap (ör. bir makalenin durumunu değiştir).
Çalışıyorsa service-role doğru ayarlanmış demektir.

### Adım 4 — RLS kilidini çek (SEN, Supabase'de)
1. Supabase Dashboard → **SQL Editor** → New query
2. `supabase/rls_lockdown.sql` içeriğini yapıştır → **Run**
3. Bu SQL:
   - RLS kapalı tabloları açar + okuma politikası ekler (contents, site_settings,
     static_contents, fc_players).
   - Tehlikeli `ALL USING(true)` politikalarını siler (arena_games,
     hub_completed_transfers, hub_transfer_scenarios, wc_squad_players).
   - Sadece okuma (`SELECT USING true`) bırakır.
   - Oylama tablolarına (arena_votes, transfer_ab_votes) DOKUNMAZ.
   - Tekrar çalıştırılabilir (idempotent).

### Adım 5 — Son doğrulama
- Public site açılıyor mu? (makaleler, arena, kadrolar, transferler görünüyor mu)
- Arena oyununda oy verilebiliyor mu?
- Admin panelden kaydetme/silme çalışıyor mu?
- (İstersen) anon key ile yazma denemesi artık reddedilmeli.

---

## 6. GERİ ALMA (bir şey ters giderse)

- **RLS SQL'inden sonra site okuması bozulduysa:** Bir okuma politikası eksik kalmıştır.
  İlgili tabloya geçici olarak `CREATE POLICY "tmp read" ON <tablo> FOR SELECT USING (true);`
  ekle, sonra incele.
- **Admin yazamıyorsa:** Service-role key Vercel'de yok ya da redeploy yapılmadı. Adım 2'yi
  kontrol et.
- **Tamamen eski hale dönmek (önerilmez):** İlgili tabloda
  `ALTER TABLE <tablo> DISABLE ROW LEVEL SECURITY;` — ama bu açığı geri açar.
- **Kod tarafı:** `git revert <commit>` ile ilgili commit geri alınabilir; her commit
  bağımsız ve build'i geçer durumda.

---

## 7. SONRAKİ ADIMLAR (opsiyonel, sonra yapılabilir)

- **Taslak okuma gizliliği (Aşama B):** Şu an anon key ile taslak (pending/draft) satırları
  *okunabilir* (yazılamaz). İstenirse okuma da `published`'a daraltılır; o zaman admin
  okumaları da server action'a taşınmalı.
- **Secret rotasyonu:** `.env.local` bu sohbette okunduğu için `ADMIN_PASSWORD` ve
  `ANTHROPIC_API_KEY` ileride döndürülebilir (zorunlu değil, iyi pratik).
- **Büyük admin dosyalarını parçalama:** `icerikler` (843 satır), `duzenle` (837),
  `arena` (708) — bakım kolaylığı için.
- **Türkçe route'ları İngilizce'ye taşıma:** yeni→new, duzenle→edit, icerikler→articles vb.
  (CLAUDE.md'deki dil göçü hedefiyle uyumlu olması için.)

---

## 8. ÖZET (tek cümle)

Admin yazmaları artık service-role + kimlik doğrulamalı sunucu kodundan geçiyor; RLS
kilidi çekilince anon key ile yazma tamamen kapanacak, okuma ve oylama çalışmaya devam
edecek.
