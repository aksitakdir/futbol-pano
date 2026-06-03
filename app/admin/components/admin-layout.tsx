"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import SgKeycap from "@/app/components/sg-keycap";


const ICON = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  articles: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  lists: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="3.5" cy="6" r="1" /><circle cx="3.5" cy="12" r="1" /><circle cx="3.5" cy="18" r="1" />
    </svg>
  ),
  radar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
      <path d="M5.6 5.6l1.4 1.4M17 17l1.4 1.4M17 7l1.4-1.4M5.6 18.4l1.4-1.4" />
    </svg>
  ),
  tactics: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="3" x2="12" y2="21" /><circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  transfers: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" /><circle cx="6" cy="6" r="2" /><circle cx="18" cy="18" r="2" />
    </svg>
  ),
  wc: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" /><path d="M12 3a15 15 0 010 18M12 3a15 15 0 000 18M3 12h18" />
    </svg>
  ),
  arena: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
    </svg>
  ),
  wire: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 11a9 9 0 019 9M4 4a16 16 0 0116 16" /><circle cx="5" cy="19" r="1" />
    </svg>
  ),
  squads: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  analytics: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  api: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
} as const;

type NavItem = { href: string; label: string; icon: React.ReactNode };
type NavGroup = { title: string | null; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    title: null,
    items: [{ href: "/admin", label: "Dashboard", icon: ICON.dashboard }],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/articles", label: "All Articles", icon: ICON.articles },
      { href: "/admin/articles?category=lists", label: "Lists", icon: ICON.lists },
      { href: "/admin/articles?category=radar", label: "Radar", icon: ICON.radar },
      { href: "/admin/articles?category=tactics-lab", label: "Tactics Lab", icon: ICON.tactics },
      { href: "/admin/articles?category=transfer", label: "Transfers", icon: ICON.transfers },
      { href: "/admin/articles?category=wc-2026", label: "World Cup 2026", icon: ICON.wc },
    ],
  },
  {
    title: "Engagement",
    items: [
      { href: "/admin/arena", label: "Arena Games", icon: ICON.arena },
      { href: "/admin/transfers", label: "Transfer Wire", icon: ICON.wire },
    ],
  },
  {
    title: "Data",
    items: [
      { href: "/admin/squads", label: "WC Squads", icon: ICON.squads },
    ],
  },
  {
    title: "Site",
    items: [
      { href: "/admin/settings", label: "Settings", icon: ICON.settings },
      { href: "/admin/analytics", label: "Analytics", icon: ICON.analytics },
      { href: "/admin/api-durum", label: "API Status", icon: ICON.api },
    ],
  },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Reactive to ?category= changes (query-only nav doesn't change pathname),
  // so nav highlighting updates instantly without a refresh.
  const currentCategory = useSearchParams().get("category");
  const [authed, setAuthed] = useState(false);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAuthed(true);
    setCheckedStorage(true);
  }, []);

  async function handleLogout() {
    // sg_admin is httpOnly — only the server can clear it.
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // ignore — redirect anyway
    }
    window.location.href = "/";
  }

  if (!checkedStorage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          Loading...
        </div>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-400">Authenticating…</p>
      </main>
    );
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";

    // Articles links are distinguished by their ?category= value so the
    // "All Articles" item and the per-category items don't all light up.
    const [path, query] = href.split("?");
    if (path === "/admin/articles") {
      if (pathname !== "/admin/articles") return false;
      const cat = query ? new URLSearchParams(query).get("category") : null;
      return (cat ?? null) === (currentCategory ?? null);
    }

    return pathname.startsWith(path);
  }

  return (
    <div className="flex h-[100dvh] min-h-0 w-full flex-col bg-slate-950 text-slate-100 lg:flex-row">
      {/* Sidebar — desktop */}
      <aside className="hidden min-h-0 w-56 shrink-0 flex-col border-r border-slate-800/60 bg-slate-900/50 lg:flex">
        <Link
          href="/admin"
          className="flex items-center gap-2 border-b border-slate-800/60 px-5 py-4 transition hover:bg-slate-800/30"
        >
          <SgKeycap size={30} />
          <span className="bg-gradient-to-r from-emerald-400 to-sky-500 bg-clip-text text-xs font-semibold tracking-widest text-transparent">
            ADMIN
          </span>
        </Link>
        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-3 py-4">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.title ?? `g${gi}`} className={gi > 0 ? "mt-3" : ""}>
              {group.title ? (
                <p className="px-3 pb-1 pt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {group.title}
                </p>
              ) : null}
              {group.items.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={[
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition",
                    isActive(n.href)
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200",
                  ].join(" ")}
                >
                  {n.icon}
                  {n.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="shrink-0 border-t border-slate-800/60 px-3 py-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-slate-500 transition hover:text-rose-400"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800/60 bg-slate-900/50 px-4 py-3 lg:hidden">
          <Link href="/admin" className="flex min-w-0 items-center gap-2">
            <SgKeycap size={26} />
            <span className="bg-gradient-to-r from-emerald-400 to-sky-500 bg-clip-text text-xs font-semibold tracking-widest text-transparent">
              ADMIN
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700/50 px-2.5 py-1.5 text-[11px] font-medium text-slate-400 transition hover:border-emerald-500/40 hover:text-emerald-300"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              View site
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg border border-slate-700/60 p-2 text-slate-400"
              aria-label="Menu"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
          </div>
        </header>

        {/* Desktop — view site link */}
        <div className="hidden shrink-0 items-center justify-end border-b border-slate-800/60 bg-slate-900/40 px-6 py-2.5 lg:flex">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border border-slate-700/50 px-3 py-1.5 text-[12px] font-medium text-slate-400 transition hover:border-emerald-500/40 hover:text-emerald-300"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            View site
          </Link>
        </div>

        {/* Mobile nav dropdown */}
        {sidebarOpen && (
          <div className="max-h-[min(70vh,520px)] shrink-0 overflow-y-auto overscroll-contain border-b border-slate-800/60 bg-slate-900/80 px-4 py-3 lg:hidden">
            <nav className="flex flex-col gap-1">
              {NAV_GROUPS.map((group, gi) => (
                <div key={group.title ?? `g${gi}`} className={gi > 0 ? "mt-2" : ""}>
                  {group.title ? (
                    <p className="px-3 pb-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      {group.title}
                    </p>
                  ) : null}
                  {group.items.map((n) => (
                    <Link
                      key={n.href}
                      href={n.href}
                      onClick={() => setSidebarOpen(false)}
                      className={[
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition",
                        isActive(n.href) ? "bg-emerald-500/15 text-emerald-300" : "text-slate-400",
                      ].join(" ")}
                    >
                      {n.icon}
                      {n.label}
                    </Link>
                  ))}
                </div>
              ))}
              <hr className="my-1 border-slate-800/60" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-slate-500 hover:text-rose-400"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Sign Out
              </button>
            </nav>
          </div>
        )}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}
