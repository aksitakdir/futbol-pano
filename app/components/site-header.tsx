"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = { activeNav?: string; maxWidth?: string; forceEn?: boolean; };
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
const CAT_COLOR: Record<string, string> = {
  listeler: "var(--cyan)",
  radar: "var(--emerald)",
  "taktik-lab": "var(--sky)",
};

/* ── Theme hook ───────────────────────────────────────────────── */
function useTheme() {
  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("sg-theme") as "dark" | "light" | null;
    const initial = saved ?? "dark";
    setThemeState(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  const setTheme = (t: "dark" | "light") => {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    localStorage.setItem("sg-theme", t);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");
  return { theme, toggle };
}

/* ── Logo ─────────────────────────────────────────────────────── */
function Wordmark({ isEn }: { isEn: boolean }) {
  return (
    <Link href={isEn ? "/en" : "/tr"} className="flex items-center gap-2.5 leading-none">
      <div style={{
        width: 30, height: 30, borderRadius: 6, flexShrink: 0,
        background: "linear-gradient(135deg, var(--accent), var(--accent-2), var(--accent-3))",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--ink-900)" }}>S</span>
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1, color: "var(--sg-text-primary)" }}>
          Scout Gamer
        </div>
        <div style={{ fontFamily: "var(--font-mono-stack)", fontSize: 9, letterSpacing: "0.18em", color: "var(--sg-text-muted)", marginTop: 2 }}>
          {isEn ? "FOOTBALL × GAME CULTURE" : "FUTBOL × OYUN KÜLTÜRÜ"}
        </div>
      </div>
    </Link>
  );
}

function navHrefMatches(pathname: string, href: string): boolean {
  if (href === "/" || href === "/en") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* ── Theme toggle icon ─────────────────────────────────────────── */
function ThemeIcon({ theme }: { theme: "dark" | "light" }) {
  return theme === "dark" ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function SiteHeader({ activeNav, maxWidth = "max-w-7xl", forceEn }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isEn = forceEn ?? pathname.startsWith("/en");
  const { theme, toggle: toggleTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const NAV_ITEMS = isEn
    ? [
        { href: "/en", label: "HOME", key: "home" },
        { href: "/en/listeler", label: "LISTS", key: "listeler" },
        { href: "/en/radar", label: "RADAR", key: "radar" },
        { href: "/en/taktik-lab", label: "TACTICS LAB", key: "taktik-lab" },
        { href: "/en/arena", label: "ARENA", key: "arena" },
      ]
    : [
        { href: "/tr", label: "ANA SAYFA", key: "home" },
        { href: "/listeler", label: "LİSTELER", key: "listeler" },
        { href: "/radar", label: "RADAR", key: "radar" },
        { href: "/taktik-lab", label: "TAKTİK LAB", key: "taktik-lab" },
        { href: "/arena", label: "ARENA", key: "arena" },
      ];

  function toggleLang() {
    if (isEn) {
      const trPath = pathname.replace(/^\/en/, "") || "/";
      router.push(trPath === "/" ? "/tr" : trPath);
    } else {
      const enPath = pathname === "/tr" ? "" : pathname;
      router.push("/en" + enPath);
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

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 80);
    } else {
      setQuery(""); setResults([]); setSelectedIdx(-1);
    }
  }, [searchOpen]);

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
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, -1)); return; }
    if (e.key === "Enter" && selectedIdx >= 0 && results[selectedIdx]) {
      const r = results[selectedIdx];
      router.push(`${categoryPath(r.category, isEn)}/${r.slug}`);
      setSearchOpen(false);
    }
  }

  /* ── Shared search results list ── */
  function SearchResults() {
    if (!query.trim()) return null;
    if (searching) return (
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
        <span className="mono text-xs" style={{ color: "var(--sg-text-muted)" }}>{isEn ? "Searching..." : "Aranıyor..."}</span>
      </div>
    );
    if (results.length === 0) return (
      <p className="mono px-4 py-3 text-xs" style={{ color: "var(--sg-text-muted)" }}>{isEn ? "No results found." : "Sonuç bulunamadı."}</p>
    );
    return (
      <>
        {results.map((r, idx) => {
          const isSelected = idx === selectedIdx;
          const color = CAT_COLOR[r.category] ?? "var(--accent)";
          return (
            <Link key={r.id} href={`${categoryPath(r.category, isEn)}/${r.slug}`}
              onClick={() => { setSearchOpen(false); setOpen(false); setQuery(""); }}
              className="flex items-center gap-3 px-4 py-2.5 transition-all"
              style={{ background: isSelected ? "oklch(1 0 0 / 0.04)" : "transparent", borderLeft: `2px solid ${isSelected ? color : "transparent"}` }}>
              <span className="mono shrink-0 text-[9px] px-1.5 py-0.5"
                style={{ background: `color-mix(in oklch, ${color} 15%, transparent)`, color, letterSpacing: "0.1em" }}>
                {isEn ? CAT_LABEL_EN[r.category] : CAT_LABEL_TR[r.category]}
              </span>
              <span className="text-xs line-clamp-1 flex-1" style={{ color: "var(--sg-text-secondary)", fontFamily: "var(--font-body)" }}>
                {isEn ? (r.title_en || r.title) : r.title}
              </span>
            </Link>
          );
        })}
      </>
    );
  }

  /* ── Mobile overlay ── */
  const mobileOverlay = open && mounted ? (
    <div className="mobile-nav-fullscreen fixed inset-0 z-[9999] flex flex-col md:hidden"
      style={{ background: "var(--sg-bg)" }} role="dialog" aria-modal="true">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--sg-border)" }}>
        <Wordmark isEn={isEn} />
        <button type="button" onClick={() => setOpen(false)}
          className="flex h-9 w-9 items-center justify-center"
          style={{ background: "var(--sg-surface)", border: "1px solid var(--sg-border)", borderRadius: 999, color: "var(--sg-text-muted)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Mobil arama */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--sg-border)" }}>
        <div className="flex items-center gap-2 px-3 py-2.5"
          style={{ background: "var(--sg-surface)", border: "1px solid var(--sg-border)", borderRadius: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--sg-text-muted)", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder={isEn ? "Search..." : "Ara..."}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--sg-text-primary)", fontFamily: "var(--font-body)", caretColor: "var(--accent)" }} />
        </div>
        {query.trim() && (
          <div className="mt-1" style={{ background: "var(--sg-surface-low)", border: "1px solid var(--sg-border)", borderRadius: 6 }}>
            <SearchResults />
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 px-4 py-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === currentKey;
          return (
            <Link key={item.key} href={item.href} onClick={() => setOpen(false)}
              className="mono flex items-center justify-between px-4 py-3.5 transition-all"
              style={{
                fontSize: 11, letterSpacing: "0.16em",
                background: isActive ? "oklch(1 0 0 / 0.04)" : "transparent",
                border: `1px solid ${isActive ? "var(--sg-surface-top)" : "transparent"}`,
                borderRadius: 999,
                color: isActive ? "var(--accent)" : "var(--sg-text-secondary)",
              }}>
              <span>{item.label}</span>
              {isActive && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="flex items-center gap-3 px-4 pb-8 pt-3" style={{ borderTop: "1px solid var(--sg-border)" }}>
        <button type="button" onClick={() => { toggleLang(); setOpen(false); }}
          className="mono flex-1 py-2.5 text-center transition"
          style={{ fontSize: 11, letterSpacing: "0.14em", background: "var(--sg-surface)", border: "1px solid var(--sg-border)", borderRadius: 999, color: "var(--sg-text-secondary)" }}>
          {isEn ? "EN ↔ TR" : "TR ↔ EN"}
        </button>
        <button type="button" onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center transition hover:opacity-80"
          style={{ background: "var(--sg-surface)", border: "1px solid var(--sg-border)", borderRadius: 999, color: "var(--sg-text-muted)" }}
          aria-label="Toggle theme">
          <ThemeIcon theme={theme} />
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <header className="fixed top-0 w-full z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? "color-mix(in oklch, var(--sg-bg) 92%, transparent)"
            : "color-mix(in oklch, var(--sg-bg) 75%, transparent)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--sg-border)",
        }}>
        <nav className={`mx-auto flex ${maxWidth} items-center justify-between px-6`} style={{ height: "68px" }}>
          <Wordmark isEn={isEn} />

          {/* Desktop nav — monospace pill items */}
          <div className="hidden md:flex items-center gap-1">
            {desktopItems.map((item) => {
              const isActive = item.key === currentKey;
              return (
                <Link key={item.key} href={item.href}
                  className="mono transition-all duration-150"
                  style={{
                    padding: "8px 14px", borderRadius: 999,
                    fontSize: 11, letterSpacing: "0.16em",
                    color: isActive ? "var(--accent)" : "var(--sg-text-muted)",
                    background: isActive ? "oklch(1 0 0 / 0.04)" : "transparent",
                    border: `1px solid ${isActive ? "var(--sg-surface-top)" : "transparent"}`,
                  }}>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop right controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language toggle */}
            <button type="button" onClick={toggleLang}
              className="mono transition hover:opacity-80"
              style={{
                padding: "6px 14px", borderRadius: 999, fontSize: 10, letterSpacing: "0.14em",
                border: "1px solid var(--sg-surface-top)", background: "transparent", color: "var(--sg-text-secondary)",
              }}>
              {isEn ? "EN ↔ TR" : "TR ↔ EN"}
            </button>

            {/* Theme toggle */}
            <button type="button" onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center transition hover:opacity-80"
              style={{
                border: "1px solid var(--sg-surface-top)", background: "transparent",
                borderRadius: 999, color: "var(--sg-text-muted)",
              }}
              aria-label="Toggle theme">
              <ThemeIcon theme={theme} />
            </button>

            {/* Search */}
            <button type="button" onClick={() => setSearchOpen(s => !s)}
              className="flex h-8 w-8 items-center justify-center transition hover:opacity-80"
              style={{
                border: "1px solid var(--sg-surface-top)",
                background: searchOpen ? "color-mix(in oklch, var(--accent) 10%, transparent)" : "transparent",
                borderRadius: 999,
                color: searchOpen ? "var(--accent)" : "var(--sg-text-muted)",
              }}
              aria-label={isEn ? "Search" : "Ara"}>
              {searchOpen ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
              )}
            </button>
          </div>

          {/* Hamburger */}
          <button type="button" onClick={() => setOpen(true)}
            className="flex h-8 w-8 items-center justify-center transition md:hidden"
            style={{ border: "1px solid var(--sg-border)", borderRadius: 999, background: "transparent", color: "var(--sg-text-muted)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </nav>

        {/* Search dropdown */}
        {searchOpen && (
          <div data-search-container className="hidden border-t md:block"
            style={{ borderColor: "var(--sg-border)", background: "color-mix(in oklch, var(--sg-bg) 96%, transparent)", backdropFilter: "blur(24px)" }}>
            <div className={`mx-auto ${maxWidth} px-6 py-4`}>
              <div className="flex items-center gap-3 pb-3" style={{ borderBottom: "1px solid var(--sg-border)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: "var(--sg-text-muted)", flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input ref={searchRef} type="text" value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={isEn ? "Search content, players, tactics..." : "İçerik, oyuncu, taktik ara..."}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "var(--sg-text-primary)", fontFamily: "var(--font-body)", caretColor: "var(--accent)" }} />
                {query && (
                  <button onClick={() => setQuery("")} className="mono text-xs transition hover:opacity-70"
                    style={{ color: "var(--sg-text-muted)" }}>
                    {isEn ? "Clear" : "Temizle"}
                  </button>
                )}
              </div>
              <div className="pt-1">
                {query.trim() ? <SearchResults /> : (
                  <p className="mono pt-2 text-[10px]" style={{ color: "var(--sg-text-muted)", letterSpacing: "0.08em" }}>
                    {isEn ? "TYPE TO SEARCH — ESC TO CLOSE" : "YAZMAYA BAŞLA — ESC İLE KAPAT"}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {mobileOverlay ? createPortal(mobileOverlay, document.body) : null}
    </>
  );
}
