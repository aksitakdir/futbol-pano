"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_PASSWORD = "scout2026";
const STORAGE_KEY = "adminAuth";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/admin/icerikler",
    label: "Articles",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: "/admin/radar",
    label: "Radar",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
        <path d="M5.6 5.6l1.4 1.4M17 17l1.4 1.4M17 7l1.4-1.4M5.6 18.4l1.4-1.4" />
      </svg>
    ),
  },
  {
    href: "/admin/api-durum",
    label: "API Status",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    href: "/admin/ayarlar",
    label: "Settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
  {
    href: "/admin/statik",
    label: "Static Content",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
  },
  {
    href: "/admin/hub",
    label: "Transfers Hub",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14M12 5l7 7-7 7" />
        <circle cx="6" cy="6" r="2" />
        <circle cx="18" cy="18" r="2" />
      </svg>
    ),
  },
  {
    href: "/admin/kadrolar",
    label: "WC Squads",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
      </svg>
    ),
  },
  {
    href: "/admin/arena",
    label: "Arena Games",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAuthed(localStorage.getItem(STORAGE_KEY) === "true");
    setCheckedStorage(true);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, "true");
      setAuthed(true);
      setPwError("");
    } else {
      setPwError("Şifre yanlış");
    }
  }

  function handleLogout() {
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
    setPw("");
    setPwError("");
  }

  if (!checkedStorage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          Yükleniyor...
        </div>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border border-slate-800/80 bg-slate-900/80 p-8 shadow-2xl"
        >
          <div className="mb-6 flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500" />
            <span className="bg-gradient-to-r from-emerald-400 to-sky-500 bg-clip-text text-sm font-semibold tracking-widest text-transparent">
              ADMIN
            </span>
          </div>
          <h1 className="mb-1 text-lg font-extrabold">Admin Girişi</h1>
          <p className="mb-6 text-xs text-slate-400">CMS paneline erişmek için şifrenizi girin</p>
          <div className="relative mb-3">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Şifre"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-4 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
              tabIndex={-1}
            >
              {showPw ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>
          {pwError && <p className="mb-3 text-xs text-rose-400">{pwError}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Giriş
          </button>
        </form>
      </main>
    );
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex h-[100dvh] min-h-0 w-full flex-col bg-slate-950 text-slate-100 lg:flex-row">
      {/* Sidebar — desktop */}
      <aside className="hidden min-h-0 w-56 shrink-0 flex-col border-r border-slate-800/60 bg-slate-900/50 lg:flex">
        <Link
          href="/admin"
          className="flex items-center gap-2 border-b border-slate-800/60 px-5 py-4 transition hover:bg-slate-800/30"
        >
          <div className="h-7 w-7 shrink-0 rounded-lg bg-gradient-to-tr from-emerald-400 to-cyan-500" />
          <span className="bg-gradient-to-r from-emerald-400 to-sky-500 bg-clip-text text-xs font-semibold tracking-widest text-transparent">
            ADMIN
          </span>
        </Link>
        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-3 py-4">
          {NAV_ITEMS.map((n) => (
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
        </nav>
        <div className="shrink-0 border-t border-slate-800/60 px-3 py-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-slate-500 transition hover:text-rose-400"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Mobil üst bar — logo sol, site + menü sağ */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800/60 bg-slate-900/50 px-4 py-3 lg:hidden">
          <Link href="/admin" className="flex min-w-0 items-center gap-2">
            <div className="h-6 w-6 shrink-0 rounded-lg bg-gradient-to-tr from-emerald-400 to-cyan-500" />
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
              Site
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg border border-slate-700/60 p-2 text-slate-400"
              aria-label="Menü"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
          </div>
        </header>

        {/* Masaüstü — siteye çıkış sağ üst */}
        <div className="hidden shrink-0 items-center justify-end border-b border-slate-800/60 bg-slate-900/40 px-6 py-2.5 lg:flex">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border border-slate-700/50 px-3 py-1.5 text-[12px] font-medium text-slate-400 transition hover:border-emerald-500/40 hover:text-emerald-300"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            Siteyi Görüntüle
          </Link>
        </div>

        {/* Mobile nav dropdown */}
        {sidebarOpen && (
          <div className="max-h-[min(70vh,520px)] shrink-0 overflow-y-auto overscroll-contain border-b border-slate-800/60 bg-slate-900/80 px-4 py-3 lg:hidden">
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((n) => (
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
              <hr className="my-1 border-slate-800/60" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-slate-500 hover:text-rose-400"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Çıkış Yap
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
