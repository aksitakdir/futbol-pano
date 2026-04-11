import Link from "next/link";

type Props = { maxWidth?: string; };

export default function SiteFooter({ maxWidth = "max-w-7xl" }: Props) {
  return (
    <footer style={{ background: "var(--sg-surface-low)", borderTop: "1px solid rgba(26,58,92,0.4)" }}>
      <div className={`mx-auto ${maxWidth} px-8 py-12`}>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

          {/* Sol — marka */}
          <div>
            <div className="mb-3" style={{ fontFamily: "var(--font-headline)", fontSize: "18px", fontWeight: 700, color: "var(--sg-primary)", letterSpacing: "-0.02em" }}>
              SCOUT GAMER
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--sg-text-muted)" }}>
              Futbol verisini sanata dönüştüren yeni nesil scouting platformu. Futbol × Oyun Kültürü.
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

          {/* Orta — navigasyon */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}>Hızlı Menü</p>
            <div className="flex flex-col gap-2">
              {[
                { href: "/listeler", label: "Listeler" },
                { href: "/radar", label: "Radar" },
                { href: "/taktik-lab", label: "Taktik Lab" },
                { href: "/arena", label: "Arena" },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="text-sm transition hover:opacity-80"
                  style={{ color: "var(--sg-text-secondary)", fontFamily: "var(--font-headline)" }}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Sağ — yasal */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}>Yasal</p>
            <div className="flex flex-col gap-2">
              {["Gizlilik Politikası", "Kullanım Koşulları", "İletişim"].map(label => (
                <span key={label} className="text-sm cursor-default"
                  style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}>{label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Alt çizgi */}
        <div className="mt-10 pt-6 flex flex-col items-center justify-between gap-3 sm:flex-row"
          style={{ borderTop: "1px solid rgba(26,58,92,0.4)" }}>
          <span className="text-[11px]" style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}>
            © 2026 SCOUT GAMER. KINETIC LABS LTD.
          </span>
          <div className="flex gap-4">
            <Link href="/arena" className="text-[11px] font-bold uppercase tracking-wider transition hover:opacity-80"
              style={{ color: "var(--sg-primary)", fontFamily: "var(--font-headline)" }}>
              Oyna & Paylaş
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}