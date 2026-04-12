"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

type Props = { activeNav?: string; maxWidth?: string; };

function Wordmark() {
  return (
    <Link href="/" className="flex flex-col items-start leading-none">
      <span style={{ fontFamily: "var(--font-headline)", color: "var(--sg-primary)", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.03em", textShadow: "0 0 20px rgba(70,241,197,0.3)" }}>
        SCOUT GAMER
      </span>
      <span style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-muted)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", marginTop: "2px" }}>
        Futbol × Oyun Kültürü
      </span>
    </Link>
  );
}

function navHrefMatches(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader({ activeNav, maxWidth = "max-w-7xl" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isEn = pathname.startsWith("/en");

  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const NAV_ITEMS = isEn
    ? [
        { href: "/en", label: "Home", key: "home" },
        { href: "/en/listeler", label: "Scouting Lists", key: "listeler" },
        { href: "/en/radar", label: "Radar", key: "radar" },
        { href: "/en/taktik-lab", label: "Tactics Lab", key: "taktik-lab" },
        { href: "/arena", label: "Arena", key: "arena" },
      ]
    : [
        { href: "/", label: "Ana Sayfa", key: "home" },
        { href: "/listeler", label: "Listeler", key: "listeler" },
        { href: "/radar", label: "Radar", key: "radar" },
        { href: "/taktik-lab", label: "Taktik Lab", key: "taktik-lab" },
        { href: "/arena", label: "Arena", key: "arena" },
      ];

  function toggleLang() {
    if (isEn) {
      const newPath = pathname.replace(/^\/en/, "") || "/";
      router.push(newPath);
    } else {
      router.push("/en" + pathname);
    }
  }

  const currentKey = activeNav ?? NAV_ITEMS.find((n) => navHrefMatches(pathname, n.href))?.key ?? "";

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const close = () => { if (mq.matches) setOpen(false); };
    mq.addEventListener("change", close);
    close();
    return () => mq.removeEventListener("change", close);
  }, [open]);

  const desktopItems = NAV_ITEMS.filter(n => n.key !== "home");

  const mobileOverlay = open && mounted ? (
    <div className="mobile-nav-fullscreen fixed inset-0 z-[9999] flex flex-col md:hidden"
      style={{ background: "var(--sg-bg)" }} role="dialog" aria-modal="true">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, var(--sg-primary) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>
      <div className="relative flex items-center justify-between px-6 pt-6 pb-5"
        style={{ borderBottom: "1px solid rgba(26,58,92,0.5)" }}>
        <Wordmark />
        <button type="button" onClick={() => setOpen(false)}
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ background: "var(--sg-surface)", color: "var(--sg-text-secondary)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <nav className="relative flex flex-1 flex-col gap-1 px-4 pt-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === currentKey;
          return (
            <Link key={item.key} href={item.href} onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-lg px-4 py-4 transition-all"
              style={{ background: isActive ? "rgba(70,241,197,0.08)" : "transparent", color: isActive ? "var(--sg-primary)" : "var(--sg-text-secondary)", fontFamily: "var(--font-headline)", fontWeight: 600, fontSize: "15px" }}>
              <span>{item.label}</span>
              {isActive && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--sg-primary)" }} />}
            </Link>
          );
        })}
        <button type="button" onClick={() => { toggleLang(); setOpen(false); }}
          className="flex items-center gap-2 rounded-lg px-4 py-3.5 transition"
          style={{ color: isEn ? "var(--sg-secondary)" : "var(--sg-text-muted)", fontFamily: "var(--font-headline)", fontWeight: 600, fontSize: "15px" }}>
          {isEn ? "🇹🇷 Türkçe" : "🇬🇧 English"}
        </button>
      </nav>
      <div className="relative px-4 pb-8 pt-4">
        <div className="rounded-lg px-4 py-3" style={{ background: "var(--sg-surface-low)" }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: "var(--sg-primary)", fontFamily: "var(--font-headline)", opacity: 0.7 }}>Scout Gamer Beta</p>
          <p className="mt-0.5 text-[11px]" style={{ color: "var(--sg-text-muted)" }}>Futbol keşif & oyun kültürü platformu</p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-300"
      style={{ background: scrolled ? "rgba(6,15,30,0.95)" : "rgba(6,15,30,0.7)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(26,58,92,0.5)" }}>
      <nav className={`mx-auto flex ${maxWidth} items-center justify-between px-6`} style={{ height: "72px" }}>
        <Wordmark />
        <div className="hidden md:flex items-center gap-1">
          {desktopItems.map((item) => {
            const isActive = item.key === currentKey;
            return (
              <Link key={item.key} href={item.href}
                className="relative px-4 py-2 transition-all duration-200"
                style={{ fontFamily: "var(--font-headline)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: isActive ? "var(--sg-primary)" : "var(--sg-text-muted)" }}>
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full"
                    style={{ background: "var(--sg-primary)" }} />
                )}
              </Link>
            );
          })}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button type="button" onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold tracking-wider transition hover:opacity-80"
            style={{ fontFamily: "var(--font-headline)", color: isEn ? "var(--sg-secondary)" : "var(--sg-text-muted)", border: `1px solid ${isEn ? "var(--sg-secondary)" : "rgba(26,58,92,0.5)"}` }}>
            {isEn ? "🇹🇷 Türkçe" : "🇬🇧 English"}
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen((s) => !s)}
            className="flex h-9 w-9 items-center justify-center transition hover:opacity-80"
            style={{ color: "var(--sg-text-muted)" }}
            aria-label={isEn ? "Search" : "Ara"}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </div>
        <button type="button" onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg transition md:hidden"
          style={{ background: "var(--sg-surface)", color: "var(--sg-text-secondary)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </nav>
      {searchOpen && (
        <div
          className="hidden border-t md:block"
          style={{
            borderColor: "rgba(26,58,92,0.5)",
            background: "rgba(6,15,30,0.98)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className={`mx-auto ${maxWidth} px-8 py-4`}>
            <input
              autoFocus
              type="text"
              placeholder={isEn ? "Search content..." : "İçerik ara..."}
              className="w-full bg-transparent text-base outline-none"
              style={{
                color: "var(--sg-text-primary)",
                fontFamily: "var(--font-headline)",
                caretColor: "var(--sg-primary)",
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchOpen(false);
                if (e.key === "Enter") {
                  const q = (e.target as HTMLInputElement).value.trim();
                  if (q) {
                    window.location.href = `${isEn ? "/en" : ""}/radar?q=${encodeURIComponent(q)}`;
                  }
                  setSearchOpen(false);
                }
              }}
            />
            <p
              className="mt-2 text-[10px]"
              style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}
            >
              {isEn ? "Press Enter to search, Esc to close" : "Enter ile ara, Esc ile kapat"}
            </p>
          </div>
        </div>
      )}
      {mobileOverlay ? createPortal(mobileOverlay, document.body) : null}
    </header>
  );
}