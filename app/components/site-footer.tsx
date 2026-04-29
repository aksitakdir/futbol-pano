"use client";

import { useState } from "react";
import Link from "next/link";

type Props = { maxWidth?: string; };
type PolicyKey = "gizlilik" | "kullanim" | "iletisim";

const POLICIES: Record<PolicyKey, { title: string; content: string }> = {
  gizlilik: {
    title: "Gizlilik Politikası",
    content: `Scout Gamer olarak kullanıcılarımızın gizliliğine önem veriyoruz.\n\nToplanan Veriler\nSitemizi ziyaret ettiğinizde tarayıcı türü, IP adresi ve ziyaret süresi gibi teknik veriler otomatik olarak kaydedilebilir.\n\nÇerezler\nScout Gamer, kullanıcı deneyimini geliştirmek için çerezler kullanabilir.\n\nİletişim\niletisim@scoutgamer.com\n\nSon güncelleme: Nisan 2026`,
  },
  kullanim: {
    title: "Kullanım Koşulları",
    content: `Scout Gamer'ı kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.\n\nİçerik Kullanımı\nSitedeki tüm içerikler Scout Gamer'a aittir.\n\nSorumluluk Reddi\nOyuncu verileri EA FC 26 veritabanından alınmaktadır.\n\nSon güncelleme: Nisan 2026`,
  },
  iletisim: {
    title: "İletişim",
    content: `Scout Gamer ekibiyle iletişime geçmek için:\n\nE-posta\niletisim@scoutgamer.com\n\nSosyal Medya\nX: @ScoutGamer\nInstagram: @scoutgamer`,
  },
};

export default function SiteFooter({ maxWidth = "max-w-7xl" }: Props) {
  const [open, setOpen] = useState<PolicyKey | null>(null);

  return (
    <>
      <footer style={{ background: "var(--ink-900)", borderTop: "1px solid var(--ink-700)", marginTop: 80 }}>
        <div className={`mx-auto ${maxWidth} px-8`} style={{ padding: "60px 32px 40px" }}>
          <div className="grid gap-16" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}>

            {/* Sol — marka */}
            <div>
              <div className="grad-text" style={{ fontFamily: "var(--font-headline)", fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em" }}>
                Scout Gamer
              </div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--ink-400)", marginTop: 6 }}>
                FUTBOL × OYUN KÜLTÜRÜ
              </div>
              <p style={{ fontSize: 14, color: "var(--ink-300)", maxWidth: 360, marginTop: 16, lineHeight: 1.55 }}>
                Anlaşılabilir bir derinlik. Futbol scouting'i ile oyun kültürünü buluşturan içerik platformu.
              </p>
              <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
                <a href="https://x.com/ScoutGamer" target="_blank" rel="noopener noreferrer"
                  className="sg-btn" style={{ padding: "6px 12px", fontSize: 10 }}>
                  X
                </a>
                <a href="https://instagram.com/scoutgamer" target="_blank" rel="noopener noreferrer"
                  className="sg-btn" style={{ padding: "6px 12px", fontSize: 10 }}>
                  IG
                </a>
              </div>
            </div>

            {/* Bölümler */}
            <div>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Bölümler</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { href: "/radar", label: "RADAR" },
                  { href: "/listeler", label: "LİSTELER" },
                  { href: "/taktik-lab", label: "TAKTİK LAB" },
                  { href: "/arena", label: "ARENA" },
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    className="sg-link mono"
                    style={{ fontSize: 12, letterSpacing: "0.1em", color: "var(--ink-300)" }}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Platform</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(["gizlilik", "kullanim", "iletisim"] as PolicyKey[]).map(key => (
                  <button key={key} onClick={() => setOpen(key)}
                    className="sg-link mono text-left"
                    style={{ fontSize: 12, letterSpacing: "0.1em", color: "var(--ink-300)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {POLICIES[key].title.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Takip et */}
            <div>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Takip Et</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { href: "https://x.com/ScoutGamer", label: "X / TWITTER" },
                  { href: "https://instagram.com/scoutgamer", label: "INSTAGRAM" },
                ].map(item => (
                  <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer"
                    className="sg-link mono"
                    style={{ fontSize: 12, letterSpacing: "0.1em", color: "var(--ink-300)" }}>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Alt çizgi */}
          <div style={{
            marginTop: 60, paddingTop: 24,
            borderTop: "1px solid var(--ink-700)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", color: "var(--ink-400)",
          }}>
            <span>© 2026 SCOUTGAMER.COM · TÜM HAKLARI SAKLIDIR</span>
            <span>v0.1 · BUILT WITH SUPABASE × CLAUDE</span>
          </div>
        </div>
      </footer>

      {/* Slide-over panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-[998]"
            style={{ background: "rgba(6,15,30,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setOpen(null)} />
          <div className="fixed right-0 top-0 bottom-0 z-[999] w-full max-w-md flex flex-col overflow-hidden"
            style={{ background: "var(--ink-800)", borderLeft: "1px solid var(--ink-700)" }}>
            <div className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: "1px solid var(--ink-700)" }}>
              <div>
                <div className="h-[2px] w-8 mb-2" style={{ background: "var(--accent)" }} />
                <h2 style={{ fontFamily: "var(--font-headline)", fontSize: 16, fontWeight: 700, margin: 0 }}>
                  {POLICIES[open].title}
                </h2>
              </div>
              <button onClick={() => setOpen(null)}
                className="flex h-9 w-9 items-center justify-center transition hover:opacity-70"
                style={{ background: "var(--ink-700)", color: "var(--ink-300)", border: "none", borderRadius: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--ink-300)" }}>
                {POLICIES[open].content}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
