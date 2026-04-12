"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = { activeNav?: string; maxWidth?: string; };

type SearchResult = { id: string; title: string; title_en?: string; slug: string; category: string; };

function categoryPath(cat: string, en: boolean): string {
  const base = en ? "/en" : "";
  if (cat === "listeler") return `${base}/listeler`;
  if (cat === "radar") return `${base}/radar`;
  if (cat === "taktik-lab") return `${base}/taktik-lab`;
  return base || "/";
}

const CAT_LABEL_TR: Record<string, string> = { listeler: "Listeler", radar: "Radar", "taktik-lab": "Taktik Lab" };
const CAT_LABEL_EN: Record<string, string> = { listeler: "Scouting Lists", radar: "Radar", "taktik-lab": "Tactics Lab" };
const CAT_COLOR: Record<string, string> = { listeler: "var(--sg-secondary)", radar: "var(--sg-primary)", "taktik-lab": "var(--sg-tertiary)" };

function Wordmark({ isEn }: { isEn: boolean }) {
  return (
    <Link href={isEn ? "/en" : "/"} className="flex flex-col items-start leading-none">
      <span style={{ fontFamily: "var(--font-headline)", color: "var(--sg-primary)", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.03em", textShadow: "0 0 20px rgba(70,241,197,0.3)" }}>
        SCOUT GAMER
      </span>
      <span style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-muted)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", marginTop: "2px" }}>
        {isEn ? "FOOTBALL x GAME CULTURE" : "FUTBOL x OYUN KULTURU"}
      </span>
    </Link>
  );
}

function navHrefMatches(pathname: string, href: string): boolean {
  if (href === "/" || href === "/en") return pathname === href;
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

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const NAV_ITEMS = isEn
    ? [
        { href: "/en", label: "Home", key: "home" },
        { href: "/en/listeler", label: "Scouting Lists", key: "listeler" },
        { href: "/en/radar", label: "Radar", key: "radar" },
        { href: "/en/taktik-lab", label: "Tactics Lab", key: "taktik-lab" },
        { href: "/en/arena", label: "Arena", key: "arena" },
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
      router.push(pathname.replace(/^\/en/, "") || "/");
    } else {
      router.push("/en" + pathname);
    }
  }

  const currentKey = activeNav ?? NAV_ITEMS.find((n) => navHrefMatches(pathname, n.href))?.key ?? "";
  const desktopItems = NAV_ITEMS.filter(n => n.key !== "home");

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

  // Arama fonksiyonu
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearching(false); return; }
    setSearching(true);
    const { data } = await supabase
      .from("contents")
      .select("id,title,title_en,slug,category")
      .eq("status", "yayinda")
      .or(`title.ilike.%${q}%,title_en.ilike.%${q}%`)
      .limit(6);
    setResults(data ?? []);
    setSearching(false);
    setSelectedIdx(-1);
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim()) { setResults([]); return; }
    searchTimeout.current = setTimeout(() => doSearch(query), 280);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [query, doSearch]);

  // Search açıldığında focus
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 80);
    } else {
      setQuery("");
      setResults([]);
      setSelectedIdx(-1);
    }
  }, [searchOpen]);

  // Dışarı tıklayınca search kapat
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-search-container]")) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") { setSearchOpen(false); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, -1)); return; }
    if (e.key === "Enter") {
      if (selectedIdx >= 0 && results[selectedIdx]) {
        const r = results[selectedIdx];
        router.push(`${categoryPath(r.category, isEn)}/${r.slug}`);
        setSearchOpen(false);
      }
    }
  }

  const mobileOverlay = open && mounted ? (
    <div className="mobile-nav-fullscreen fixed inset-0 z-[9999] flex flex-col md:hidden"
      style={{ background: "var(--sg-bg)" }} role="dialog" aria-modal="true">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, var(--sg-primary) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>
      <div className="relative flex items-center justify-between px-6 pt-6 pb-5"
        style={{ borderBottom: "1px solid rgba(26,58,92,0.5)" }}>
        <Wordmark isEn={isEn} />
        <button type="button" onClick={() => setOpen(false)}
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ background: "var(--sg-surface)", color: "var(--sg-text-secondary)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Mobil arama */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-2.5"
          style={{ background: "var(--sg-surface)", border: "1px solid rgba(26,58,92,0.5)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--sg-text-muted)", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={isEn ? "Search..." : "Ara..."}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--sg-text-primary)", fontFamily: "var(--font-headline)", caretColor: "var(--sg-primary)" }}
          />
        </div>
        {query.trim() && (
          <div className="mt-1" style={{ background: "var(--sg-surface-low)", border: "1px solid rgba(26,58,92,0.5)" }}>
            {searching ? (
              <div className="flex items-center gap-2 px-3 py-3">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--sg-primary)", borderTopColor: "transparent" }} />
                <span className="text-xs" style={{ color: "var(--sg-text-muted)" }}>{isEn ? "Searching..." : "Aranıyor..."}</span>
              </div>
            ) : results.length === 0 ? (
              <p className="px-3 py-3 text-xs" style={{ color: "var(--sg-text-muted)" }}>{isEn ? "No results found." : "Sonuç bulunamadı."}</p>
            ) : results.map(r => (
              <Link key={r.id} href={`${categoryPath(r.category, isEn)}/${r.slug}`}
                onClick={() => { setOpen(false); setQuery(""); setResults([]); }}
                className="flex items-center gap-3 px-3 py-2.5 transition hover:opacity-80"
                style={{ borderBottom: "1px solid rgba(26,58,92,0.3)" }}>
                <span className="text-[8px] font-bold shrink-0 px-1.5 py-0.5"
                  style={{ background: `${CAT_COLOR[r.category] ?? "var(--sg-primary)"}15`, color: CAT_COLOR[r.category] ?? "var(--sg-primary)", fontFamily: "var(--font-headline)" }}>
                  {isEn ? CAT_LABEL_EN[r.category] : CAT_LABEL_TR[r.category]}
                </span>
                <span className="text-xs font-medium line-clamp-1" style={{ color: "var(--sg-text-primary)", fontFamily: "var(--font-headline)" }}>
                  {isEn ? (r.title_en || r.title) : r.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <nav className="relative flex flex-1 flex-col gap-1 px-4 pt-2">
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

        {/* Mobil dil toggle */}
        <button type="button" onClick={() => { toggleLang(); setOpen(false); }}
          className="flex items-center gap-2 rounded-lg px-4 py-4 transition"
          style={{ color: "var(--sg-text-secondary)", fontFamily: "var(--font-headline)", fontWeight: 600, fontSize: "15px" }}>
          <span style={{ opacity: isEn ? 0.4 : 1, color: isEn ? "var(--sg-text-muted)" : "var(--sg-primary)" }}>TR</span>
          <span style={{ color: "var(--sg-text-muted)", fontSize: "11px" }}>/</span>
          <span style={{ opacity: isEn ? 1 : 0.4, color: isEn ? "var(--sg-secondary)" : "var(--sg-text-muted)" }}>EN</span>
        </button>
      </nav>

      <div className="relative px-4 pb-8 pt-4">
        <div className="rounded-lg px-4 py-3" style={{ background: "var(--sg-surface-low)" }}>
          <p className="text-[10px] font-bold" style={{ color: "var(--sg-primary)", fontFamily: "var(--font-headline)", opacity: 0.7, letterSpacing: "0.18em" }}>SCOUT GAMER BETA</p>
          <p className="mt-0.5 text-[11px]" style={{ color: "var(--sg-text-muted)" }}>
            {isEn ? "Football scouting & game culture platform" : "Futbol kesfif & oyun kulturu platformu"}
          </p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <header className="fixed top-0 w-full z-50 transition-all duration-300"
        style={{ background: scrolled ? "rgba(6,15,30,0.95)" : "rgba(6,15,30,0.7)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(26,58,92,0.5)" }}>
        <nav className={`mx-auto flex ${maxWidth} items-center justify-between px-6`} style={{ height: "72px" }}>
          <Wordmark isEn={isEn} />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {desktopItems.map((item) => {
              const isActive = item.key === currentKey;
              return (
                <Link key={item.key} href={item.href}
                  className="relative px-4 py-2 transition-all duration-200"
                  style={{ fontFamily: "var(--font-headline)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: isActive ? "var(--sg-primary)" : "var(--sg-text-muted)" }}>
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full"
                      style={{ background: "var(--sg-primary)" }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop sağ — lang toggle + search */}
          <div className="hidden md:flex items-center gap-3">
            {/* Modern dil toggle pill */}
            <button type="button" onClick={toggleLang}
              className="flex items-center gap-0 transition-all duration-200 hover:opacity-90"
              style={{ background: "var(--sg-surface)", border: "1px solid rgba(26,58,92,0.6)", padding: "3px", gap: "0" }}>
              <span className="px-3 py-1.5 text-[10px] font-bold transition-all duration-200"
                style={{
                  fontFamily: "var(--font-headline)",
                  letterSpacing: "0.12em",
                  background: !isEn ? "var(--sg-primary)" : "transparent",
                  color: !isEn ? "#060f1e" : "var(--sg-text-muted)",
                }}>
                TR
              </span>
              <span className="px-3 py-1.5 text-[10px] font-bold transition-all duration-200"
                style={{
                  fontFamily: "var(--font-headline)",
                  letterSpacing: "0.12em",
                  background: isEn ? "var(--sg-secondary)" : "transparent",
                  color: isEn ? "#060f1e" : "var(--sg-text-muted)",
                }}>
                EN
              </span>
            </button>

            {/* Search butonu */}
            <button type="button" onClick={() => setSearchOpen(s => !s)}
              className="flex h-9 w-9 items-center justify-center transition-all hover:opacity-80"
              style={{ color: searchOpen ? "var(--sg-primary)" : "var(--sg-text-muted)", background: searchOpen ? "rgba(70,241,197,0.08)" : "transparent" }}
              aria-label={isEn ? "Search" : "Ara"}>
              {searchOpen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
              )}
            </button>
          </div>

          {/* Hamburger */}
          <button type="button" onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition md:hidden"
            style={{ background: "var(--sg-surface)", color: "var(--sg-text-secondary)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </nav>

        {/* Search dropdown */}
        {searchOpen && (
          <div data-search-container className="hidden border-t md:block"
            style={{ borderColor: "rgba(26,58,92,0.5)", background: "rgba(6,15,30,0.98)", backdropFilter: "blur(24px)" }}>
            <div className={`mx-auto ${maxWidth} px-6 py-4`}>
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--sg-text-muted)", flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={isEn ? "Search content, players, tactics..." : "Icerik, oyuncu, taktik ara..."}
                  className="flex-1 bg-transparent text-base outline-none"
                  style={{ color: "var(--sg-text-primary)", fontFamily: "var(--font-headline)", caretColor: "var(--sg-primary)" }}
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-xs transition hover:opacity-70"
                    style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}>
                    {isEn ? "Clear" : "Temizle"}
                  </button>
                )}
              </div>

              {/* Sonuçlar */}
              {query.trim() && (
                <div className="mt-3 -mx-6 px-6">
                  {searching ? (
                    <div className="flex items-center gap-2 py-4">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                        style={{ borderColor: "var(--sg-primary)", borderTopColor: "transparent" }} />
                      <span className="text-sm" style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}>
                        {isEn ? "Searching..." : "Araniyor..."}
                      </span>
                    </div>
                  ) : results.length === 0 ? (
                    <p className="py-4 text-sm" style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}>
                      {isEn ? `No results for "${query}"` : `"${query}" icin sonuc bulunamadi`}
                    </p>
                  ) : (
                    <div className="grid gap-1 pb-3">
                      {results.map((r, idx) => {
                        const isSelected = idx === selectedIdx;
                        const catLabel = isEn ? CAT_LABEL_EN[r.category] : CAT_LABEL_TR[r.category];
                        const color = CAT_COLOR[r.category] ?? "var(--sg-primary)";
                        return (
                          <Link key={r.id}
                            href={`${categoryPath(r.category, isEn)}/${r.slug}`}
                            onClick={() => { setSearchOpen(false); setQuery(""); }}
                            className="flex items-center gap-4 px-3 py-3 transition-all"
                            style={{ background: isSelected ? "rgba(70,241,197,0.06)" : "transparent", borderLeft: isSelected ? `2px solid ${color}` : "2px solid transparent" }}>
                            <span className="shrink-0 text-[9px] font-bold px-2 py-0.5 min-w-[60px] text-center"
                              style={{ background: `${color}12`, color, fontFamily: "var(--font-headline)", letterSpacing: "0.1em" }}>
                              {catLabel}
                            </span>
                            <span className="text-sm font-medium line-clamp-1 flex-1"
                              style={{ color: isSelected ? "var(--sg-text-primary)" : "var(--sg-text-secondary)", fontFamily: "var(--font-headline)" }}>
                              {isEn ? (r.title_en || r.title) : r.title}
                            </span>
                            {isSelected && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color, flexShrink: 0 }}>
                                <path d="M5 12h14M12 5l7 7-7 7" />
                              </svg>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {!query.trim() && (
                <p className="mt-2 text-[10px]" style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)", letterSpacing: "0.08em" }}>
                  {isEn ? "TYPE TO SEARCH — ESC TO CLOSE" : "YAZMAYA BASLA — ESC ILE KAP"}
                </p>
              )}
            </div>
          </div>
        )}
      </header>

      {mobileOverlay ? createPortal(mobileOverlay, document.body) : null}
    </>
  );
}
