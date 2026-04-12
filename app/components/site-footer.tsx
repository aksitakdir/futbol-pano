"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = { maxWidth?: string; };

type PolicyKey = "gizlilik" | "kullanim" | "iletisim";

const POLICIES: Record<PolicyKey, { title: string; content: string }> = {
  gizlilik: {
    title: "Gizlilik Politikası",
    content: `Scout Gamer olarak kullanıcılarımızın gizliliğine önem veriyoruz.

Toplanan Veriler
Sitemizi ziyaret ettiğinizde tarayıcı türü, IP adresi ve ziyaret süresi gibi teknik veriler otomatik olarak kaydedilebilir. Bu veriler yalnızca site performansını iyileştirmek amacıyla kullanılır.

Çerezler
Scout Gamer, kullanıcı deneyimini geliştirmek için çerezler kullanabilir. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz.

Üçüncü Taraf Hizmetler
Sitemiz Google Analytics ve benzeri analitik araçlar kullanabilir. Bu hizmetler kendi gizlilik politikalarına tabidir.

İletişim
Gizlilik ile ilgili sorularınız için iletisim@scoutgamer.com adresine ulaşabilirsiniz.

Son güncelleme: Nisan 2026`,
  },
  kullanim: {
    title: "Kullanım Koşulları",
    content: `Scout Gamer'ı kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.

İçerik Kullanımı
Sitedeki tüm içerikler Scout Gamer'a aittir. İzin alınmadan ticari amaçla kullanılamaz. Kaynak göstererek alıntı yapılabilir.

Kullanıcı Sorumluluğu
Siteyi yalnızca yasal amaçlar için kullanmayı kabul edersiniz. Zararlı, yanıltıcı veya yasadışı içerik paylaşılamaz.

Sorumluluk Reddi
Scout Gamer, içeriklerin doğruluğunu her zaman garanti edemez. Oyuncu verileri EA FC 26 veritabanından alınmaktadır ve gerçek performansı yansıtmayabilir.

Değişiklikler
Bu koşullar önceden haber vermeksizin güncellenebilir.

Son güncelleme: Nisan 2026`,
  },
  iletisim: {
    title: "İletişim",
    content: `Scout Gamer ekibiyle iletişime geçmek için aşağıdaki kanalları kullanabilirsiniz.

E-posta
iletisim@scoutgamer.com

Sosyal Medya
Twitter/X: @ScoutGamer
Instagram: @scoutgamer

İçerik İşbirlikleri
Scout Gamer'da içerik üretmek veya işbirliği yapmak istiyorsanız iletisim@scoutgamer.com adresine yazabilirsiniz.

Yanıt Süresi
Mesajlarınıza genellikle 1-2 iş günü içinde yanıt veriyoruz.`,
  },
};

const POLICIES_EN: Record<PolicyKey, { title: string; content: string }> = {
  gizlilik: {
    title: "Privacy Policy",
    content: `At Scout Gamer we care about your privacy.

Data we collect
When you visit, technical data such as browser type, IP address and session duration may be logged. This is used only to improve site performance.

Cookies
We may use cookies to improve your experience. You can disable them in your browser.

Third-party services
We may use Google Analytics and similar tools, which have their own policies.

Contact
Privacy questions: iletisim@scoutgamer.com

Last updated: April 2026`,
  },
  kullanim: {
    title: "Terms of Use",
    content: `By using Scout Gamer you agree to the following.

Content
All content belongs to Scout Gamer. No commercial use without permission. Attribution is allowed for quotes.

User responsibility
Use the site only for lawful purposes. No harmful, misleading or illegal content.

Disclaimer
We cannot guarantee accuracy at all times. Player data comes from the EA FC database and may not reflect real-world performance.

Changes
These terms may change without notice.

Last updated: April 2026`,
  },
  iletisim: {
    title: "Contact",
    content: `Reach the Scout Gamer team via:

Email
iletisim@scoutgamer.com

Social
Twitter/X: @ScoutGamer
Instagram: @scoutgamer

Partnerships
For content or partnerships: iletisim@scoutgamer.com

We usually reply within 1–2 business days.`,
  },
};

export default function SiteFooter({ maxWidth = "max-w-7xl" }: Props) {
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");
  const [open, setOpen] = useState<PolicyKey | null>(null);
  const policy = open ? (isEn ? POLICIES_EN[open] : POLICIES[open]) : null;

  return (
    <>
      <footer style={{ background: "var(--sg-surface-low)", borderTop: "1px solid rgba(26,58,92,0.4)" }}>
        <div className={`mx-auto ${maxWidth} px-8 py-12`}>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div>
              <div className="mb-3" style={{ fontFamily: "var(--font-headline)", fontSize: "18px", fontWeight: 700, color: "var(--sg-primary)", letterSpacing: "-0.02em" }}>
                SCOUT GAMER
              </div>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--sg-text-muted)" }}>
                {isEn
                  ? "Next-gen scouting platform turning football data into art. Football × Game Culture."
                  : "Futbol verisini sanata dönüştüren yeni nesil scouting platformu. Futbol × Oyun Kültürü."}
              </p>
              <div className="mt-5 flex gap-3">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center transition hover:opacity-70"
                  style={{ background: "var(--sg-surface)", color: "var(--sg-text-muted)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center transition hover:opacity-70"
                  style={{ background: "var(--sg-surface)", color: "var(--sg-text-muted)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></svg>
                </a>
              </div>
            </div>

            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}>{isEn ? "Quick links" : "Hızlı Menü"}</p>
              <div className="flex flex-col gap-2">
                {(isEn
                  ? [
                      { href: "/en/listeler", label: "Scouting Lists" },
                      { href: "/en/radar", label: "Radar" },
                      { href: "/en/taktik-lab", label: "Tactics Lab" },
                      { href: "/en/arena", label: "Arena" },
                    ]
                  : [
                      { href: "/listeler", label: "Listeler" },
                      { href: "/radar", label: "Radar" },
                      { href: "/taktik-lab", label: "Taktik Lab" },
                      { href: "/arena", label: "Arena" },
                    ]
                ).map(item => (
                  <Link key={item.href} href={item.href}
                    className="text-sm transition hover:opacity-80"
                    style={{ color: "var(--sg-text-secondary)", fontFamily: "var(--font-headline)" }}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}>{isEn ? "Legal" : "Yasal"}</p>
              <div className="flex flex-col gap-2">
                {(["gizlilik", "kullanim", "iletisim"] as PolicyKey[]).map(key => (
                  <button key={key} onClick={() => setOpen(key)}
                    className="text-left text-sm transition hover:opacity-80"
                    style={{ color: "var(--sg-text-secondary)", fontFamily: "var(--font-headline)" }}>
                    {(isEn ? POLICIES_EN[key] : POLICIES[key]).title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 flex flex-col items-center justify-between gap-3 sm:flex-row"
            style={{ borderTop: "1px solid rgba(26,58,92,0.4)" }}>
            <span className="text-[11px]" style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}>
              © 2026 SCOUT GAMER. KINETIC LABS LTD.
            </span>
            <Link href={isEn ? "/en/arena" : "/arena"} className="text-[11px] font-bold uppercase tracking-wider transition hover:opacity-80"
              style={{ color: "var(--sg-primary)", fontFamily: "var(--font-headline)" }}>
              {isEn ? "Play & Share" : "Oyna & Paylaş"}
            </Link>
          </div>
        </div>
      </footer>

      {/* Slide-over panel */}
      {open && policy && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-[998]" style={{ background: "rgba(6,15,30,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setOpen(null)} />
          {/* Panel */}
          <div className="fixed right-0 top-0 bottom-0 z-[999] w-full max-w-md flex flex-col overflow-hidden"
            style={{ background: "var(--sg-surface-low)", borderLeft: "1px solid rgba(26,58,92,0.5)" }}>
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: "1px solid rgba(26,58,92,0.4)" }}>
              <div>
                <div className="h-[2px] w-8 mb-2" style={{ background: "var(--sg-primary)" }} />
                <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-headline)" }}>
                  {policy.title}
                </h2>
              </div>
              <button onClick={() => setOpen(null)}
                className="flex h-9 w-9 items-center justify-center transition hover:opacity-70"
                style={{ background: "var(--sg-surface)", color: "var(--sg-text-muted)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {/* Panel içerik */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--sg-text-secondary)" }}>
                {policy.content}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
