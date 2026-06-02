"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SgKeycap from "./sg-keycap";

type Props = { activeNav?: string; maxWidth?: string; forceEn?: boolean };
type SearchResult = { id: string; title: string; title_en?: string; slug: string; category: string; };

function categoryPath(cat: string): string {
  if (cat === "lists") return "/lists";
  if (cat === "radar") return "/radar";
  if (cat === "tactics-lab") return "/tactics-lab";
  return "/";
}

const CAT_LABEL: Record<string, string> = { lists: "Scouting Lists", radar: "Radar", "tactics-lab": "Tactics Lab" };
const CAT_COLOR: Record<string, string> = { lists: "var(--cyan)", radar: "var(--emerald)", "tactics-lab": "var(--sky)" };

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5 leading-none">
      <SgKeycap size={34} />
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1, color: "var(--sg-text-primary)" }}>Scout Gamer</div>
        <div style={{ fontFamily: "var(--font-mono-stack)", fontSize: 9, letterSpacing: "0.18em", color: "var(--sg-text-muted)", marginTop: 2 }}>FOOTBALL × GAME CULTURE</div>
      </div>
    </Link>
  );
}

function navHrefMatches(pathname: string, href: string): boolean {
  if (href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

const NAV_ITEMS = [
  { href: "/", label: "HOME", key: "home" },
  { href: "/world-cup-2026", label: "WC 2026", key: "wc-2026" },
  { href: "/transfers", label: "TRANSFERS", key: "transfer" },
  { href: "/radar", label: "RADAR", key: "radar" },
  { href: "/lists", label: "LISTS", key: "lists" },
  { href: "/arena", label: "ARENA", key: "arena" },
];

export default function SiteHeader({ activeNav }: Props) {
  const router = useRouter();
  const pathname = usePathname();
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
    const { data } = await supabase.from("contents").select("id,title,title_en,slug,category").eq("status", "published").or(`title.ilike.%${q}%,title_en.ilike.%${q}%`).limit(6);
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
    if (searchOpen) { setTimeout(() => searchRef.current?.focus(), 80); }
    else { setQuery(""); setResults([]); setSelectedIdx(-1); }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest("[data-search-container]")) setSearchOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") { setSearchOpen(false); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); return; }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, -1)); return; }
    if (e.key === "Enter" && selectedIdx >= 0 && results[selectedIdx]) {
      const r = results[selectedIdx];
      router.push(`${categoryPath(r.category)}/${r.slug}`);
      setSearchOpen(false);
    }
  }

  function SearchResults() {
    if (!query.trim()) return null;
    if (searching) return (
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
        <span className="mono text-xs" style={{ color: "var(--sg-text-muted)" }}>Searching...</span>
      </div>
    );
    if (results.length === 0) return <p className="mono px-4 py-3 text-xs" style={{ color: "var(--sg-text-muted)" }}>No results found.</p>;
    return (
      <>
        {results.map((r, idx) => {
          const isSelected = idx === selectedIdx;
          const color = CAT_COLOR[r.category] ?? "var(--accent)";
          return (
            <Link key={r.id} href={`${categoryPath(r.category)}/${r.slug}`}
              onClick={() => { setSearchOpen(false); setOpen(false); setQuery(""); }}
              className="flex items-center gap-3 px-4 py-2.5 transition-all"
              style={{ background: isSelected ? "oklch(1 0 0 / 0.04)" : "transparent", borderLeft: `2px solid ${isSelected ? color : "transparent"}` }}>
              <span className="mono shrink-0 text-[9px] px-1.5 py-0.5"
                style={{ background: `color-mix(in oklch, ${color} 15%, transparent)`, color, letterSpacing: "0.1em" }}>
                {CAT_LABEL[r.category] ?? r.category}
              </span>
              <span className="text-xs line-clamp-1 flex-1" style={{ color: "var(--sg-text-secondary)", fontFamily: "var(--font-body)" }}>
                {r.title_en || r.title}
              </span>
            </Link>
          );
        })}
      </>
    );
  }

  const mobileOverlay = open && mounted ? (
    <div className="mobile-nav-fullscreen fixed inset-0 z-[9999] flex flex-col md:hidden"
      style={{ background: "var(--sg-bg)" }} role="dialog" aria-modal="true">
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--sg-border)" }}>
        <Wordmark />
        <button type="button" onClick={() => setOpen(false)}
          className="flex h-9 w-9 items-center justify-center"
          style={{ background: "var(--sg-surface)", border: "1px solid var(--sg-border)", borderRadius: 999, color: "var(--sg-text-muted)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--sg-border)" }}>
        <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: "var(--sg-surface)", border: "1px solid var(--sg-border)", borderRadius: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--sg-text-muted)", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--sg-text-primary)", fontFamily: "var(--font-body)", caretColor: "var(--accent)" }} />
        </div>
        {query.trim() && (
          <div className="mt-1" style={{ background: "var(--sg-surface-low)", border: "1px solid var(--sg-border)", borderRadius: 6 }}>
            <SearchResults />
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4 py-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === currentKey;
          return (
            <Link key={item.key} href={item.href} onClick={() => setOpen(false)}
              className="mono flex items-center justify-between px-4 py-3.5 transition-all"
              style={{ fontSize: 11, letterSpacing: "0.16em", background: isActive ? "oklch(1 0 0 / 0.04)" : "transparent", border: `1px solid ${isActive ? "var(--sg-surface-top)" : "transparent"}`, borderRadius: 999, color: isActive ? "var(--accent)" : "var(--sg-text-secondary)" }}>
              <span>{item.label}</span>
              {isActive && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />}
            </Link>
          );
        })}
      </nav>
    </div>
  ) : null;

  return (
    <>
      <header className="fixed top-0 w-full z-50 transition-all duration-300"
        style={{ background: scrolled ? "color-mix(in oklch, var(--sg-bg) 92%, transparent)" : "color-mix(in oklch, var(--sg-bg) 75%, transparent)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid var(--sg-border)" }}>
        <nav className="sg-site-container flex items-center justify-between" style={{ height: "68px" }}>
          <Wordmark />

          <div className="hidden md:flex items-center gap-1">
            {desktopItems.map((item) => {
              const isActive = item.key === currentKey;
              return (
                <Link key={item.key} href={item.href}
                  className="mono transition-all duration-150"
                  style={{ padding: "8px 14px", borderRadius: 999, fontSize: 11, letterSpacing: "0.16em", color: isActive ? "var(--accent)" : "var(--sg-text-muted)", background: isActive ? "oklch(1 0 0 / 0.04)" : "transparent", border: `1px solid ${isActive ? "var(--sg-surface-top)" : "transparent"}` }}>
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button type="button" onClick={() => setSearchOpen(s => !s)}
              className="flex h-8 w-8 items-center justify-center transition hover:opacity-80"
              style={{ border: "1px solid var(--sg-surface-top)", background: searchOpen ? "color-mix(in oklch, var(--accent) 10%, transparent)" : "transparent", borderRadius: 999, color: searchOpen ? "var(--accent)" : "var(--sg-text-muted)" }}
              aria-label="Search">
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

          <button type="button" onClick={() => setOpen(true)}
            className="flex h-8 w-8 items-center justify-center transition md:hidden"
            style={{ border: "1px solid var(--sg-border)", borderRadius: 999, background: "transparent", color: "var(--sg-text-muted)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </nav>

        {searchOpen && (
          <div data-search-container className="hidden border-t md:block"
            style={{ borderColor: "var(--sg-border)", background: "color-mix(in oklch, var(--sg-bg) 96%, transparent)", backdropFilter: "blur(24px)" }}>
            <div className="sg-site-container py-4">
              <div className="flex items-center gap-3 pb-3" style={{ borderBottom: "1px solid var(--sg-border)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: "var(--sg-text-muted)", flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input ref={searchRef} type="text" value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search content, players, tactics..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "var(--sg-text-primary)", fontFamily: "var(--font-body)", caretColor: "var(--accent)" }} />
                {query && (
                  <button onClick={() => setQuery("")} className="mono text-xs transition hover:opacity-70" style={{ color: "var(--sg-text-muted)" }}>Clear</button>
                )}
              </div>
              <div className="pt-1">
                {query.trim() ? <SearchResults /> : (
                  <p className="mono pt-2 text-[10px]" style={{ color: "var(--sg-text-muted)", letterSpacing: "0.08em" }}>TYPE TO SEARCH — ESC TO CLOSE</p>
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
