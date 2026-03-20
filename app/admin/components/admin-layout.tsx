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
    label: "İçerikler",
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
    label: "API Durumu",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    href: "/admin/ayarlar",
    label: "Site Ayarları",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
  {
    href: "/admin/statik",
    label: "Statik İçerikler",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
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
          <input
            type="password"
            placeholder="Şifre"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="mb-3 w-full rounded-lg border border-slate-700/80 bg-slate-800/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60"
          />
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
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar — desktop */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-800/60 bg-slate-900/50 lg:flex">
        <div className="flex items-center gap-2 border-b border-slate-800/60 px-5 py-4">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-emerald-400 to-cyan-500" />
          <span className="bg-gradient-to-r from-emerald-400 to-sky-500 bg-clip-text text-xs font-semibold tracking-widest text-transparent">
            ADMIN
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
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
        <div className="border-t border-slate-800/60 px-3 py-3">
          <Link href="/" className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-slate-500 transition hover:text-slate-300">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            Siteyi Görüntüle
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-slate-500 transition hover:text-rose-400"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-800/60 bg-slate-900/50 px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-emerald-400 to-cyan-500" />
            <span className="bg-gradient-to-r from-emerald-400 to-sky-500 bg-clip-text text-xs font-semibold tracking-widest text-transparent">
              ADMIN
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg border border-slate-700/60 p-2 text-slate-400"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
        </header>

        {/* Mobile nav dropdown */}
        {sidebarOpen && (
          <div className="border-b border-slate-800/60 bg-slate-900/80 px-4 py-3 lg:hidden">
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
              <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-slate-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                Siteyi Görüntüle
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-slate-500 hover:text-rose-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Çıkış Yap
              </button>
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
