"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const ADMIN_PASSWORD = "scout2026";

type ContentRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  status: string;
  created_at: string;
};

type Tab = "all" | "bekliyor" | "yayinda" | "reddedildi";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "bekliyor", label: "Bekleyenler" },
  { key: "yayinda", label: "Yayında" },
  { key: "reddedildi", label: "Reddedilenler" },
];

const CATEGORY_LABEL: Record<string, string> = {
  listeler: "Listeler",
  radar: "Radar",
  "taktik-lab": "Taktik Lab",
};

const CATEGORY_COLOR: Record<string, string> = {
  listeler: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  radar: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  "taktik-lab": "bg-violet-500/15 text-violet-300 border-violet-500/40",
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  bekliyor: { label: "Bekliyor", cls: "bg-amber-500/15 text-amber-300 border-amber-500/40" },
  yayinda: { label: "Yayında", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" },
  reddedildi: { label: "Reddedildi", cls: "bg-rose-500/15 text-rose-300 border-rose-500/40" },
};

const STORAGE_KEY = "adminAuth";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [checkedStorage, setCheckedStorage] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    setAuthed(stored === "true");
    setCheckedStorage(true);
  }, []);

  const [allContents, setAllContents] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set());

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Supabase fetch error:", error);
    setAllContents(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) fetchAll();
  }, [authed, fetchAll]);

  const counts = useMemo(() => {
    const c = { all: 0, bekliyor: 0, yayinda: 0, reddedildi: 0 };
    for (const item of allContents) {
      c.all++;
      if (item.status in c) c[item.status as keyof typeof c]++;
    }
    return c;
  }, [allContents]);

  const filtered = useMemo(() => {
    let list = allContents;
    if (tab !== "all") list = list.filter((c) => c.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (CATEGORY_LABEL[c.category] ?? c.category).toLowerCase().includes(q)
      );
    }
    return list;
  }, [allContents, tab, search]);

  async function updateStatus(id: string, newStatus: string) {
    setActionLoading((prev) => new Set(prev).add(id));
    const { error } = await supabase
      .from("contents")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Supabase update error:", error);
    } else {
      setAllContents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
    setActionLoading((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  async function bulkUpdateStatus(newStatus: string) {
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    setActionLoading(new Set(ids));
    const { error } = await supabase
      .from("contents")
      .update({ status: newStatus })
      .in("id", ids);

    if (error) {
      console.error("Supabase bulk update error:", error);
    } else {
      setAllContents((prev) =>
        prev.map((c) => (ids.includes(c.id) ? { ...c, status: newStatus } : c))
      );
      setSelected(new Set());
    }
    setActionLoading(new Set());
  }

  async function bulkDelete() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`${ids.length} içerik kalıcı olarak silinecek. Emin misin?`)) return;

    setActionLoading(new Set(ids));
    const { error } = await supabase.from("contents").delete().in("id", ids);

    if (error) {
      console.error("Supabase bulk delete error:", error);
    } else {
      setAllContents((prev) => prev.filter((c) => !ids.includes(c.id)));
      setSelected(new Set());
    }
    setActionLoading(new Set());
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((c) => c.id)));
    }
  }

  const allChecked = filtered.length > 0 && selected.size === filtered.length;

  // Wait for localStorage check to avoid flash of login form
  if (!checkedStorage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          Yükleniyor...
        </div>
      </main>
    );
  }

  // Login
  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border border-slate-800/80 bg-slate-950/80 p-8 shadow-[0_16px_50px_rgba(15,23,42,0.8)]"
        >
          <h1 className="mb-1 text-lg font-extrabold tracking-tight">
            Admin Girişi
          </h1>
          <p className="mb-6 text-xs text-slate-400">
            İçerik yönetim paneline erişmek için şifrenizi girin
          </p>
          <input
            type="password"
            placeholder="Şifre"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="mb-3 w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
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

  const emptyMessages: Record<Tab, string> = {
    all: "Henüz hiç içerik eklenmemiş",
    bekliyor: "Onay bekleyen içerik yok",
    yayinda: "Yayında içerik yok",
    reddedildi: "Reddedilen içerik yok",
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/admin" className="flex shrink-0 items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 shadow-[0_0_40px_rgba(16,185,129,0.7)]" />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-sm font-semibold tracking-[0.22em] text-transparent">
              ADMIN PANEL
            </span>
          </Link>

          <div className="relative hidden flex-1 sm:block sm:max-w-xs">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="text"
              placeholder="Başlık veya kategori ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/admin/yeni"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              + Yeni İçerik
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-600/80 px-4 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Mobile search */}
        <div className="relative mb-4 sm:hidden">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text"
            placeholder="Başlık veya kategori ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
          />
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-xl border border-slate-800/80 bg-slate-950/60 p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSelected(new Set()); }}
              className={[
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition",
                tab === t.key
                  ? "bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "text-slate-400 hover:text-slate-200",
              ].join(" ")}
            >
              {t.label}
              <span
                className={[
                  "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                  tab === t.key
                    ? "bg-emerald-500/25 text-emerald-200"
                    : "bg-slate-800 text-slate-400",
                ].join(" ")}
              >
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Bulk actions bar */}
        {selected.size > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
            <span className="text-xs font-semibold text-emerald-300">
              {selected.size} içerik seçili
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => bulkUpdateStatus("yayinda")}
                className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-[11px] font-semibold text-emerald-300 transition hover:bg-emerald-500/25"
              >
                Seçilenleri Yayınla
              </button>
              <button
                onClick={() => bulkUpdateStatus("bekliyor")}
                className="rounded-lg bg-amber-500/15 px-3 py-1.5 text-[11px] font-semibold text-amber-300 transition hover:bg-amber-500/25"
              >
                Beklemeye Al
              </button>
              <button
                onClick={bulkDelete}
                className="rounded-lg bg-rose-500/15 px-3 py-1.5 text-[11px] font-semibold text-rose-300 transition hover:bg-rose-500/25"
              >
                Seçilenleri Sil
              </button>
            </div>
            <button
              onClick={() => setSelected(new Set())}
              className="ml-auto text-[11px] text-slate-400 transition hover:text-slate-200"
            >
              Seçimi kaldır
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center gap-2 py-16 text-sm text-slate-400 justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            Yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 px-6 py-16 text-center">
            <p className="text-sm text-slate-400">
              {search.trim() ? `"${search}" ile eşleşen içerik bulunamadı` : emptyMessages[tab]}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800/80">
            {/* Table header */}
            <div className="grid grid-cols-[40px_1fr_100px_100px_110px_auto] items-center gap-2 border-b border-slate-800/60 bg-slate-950/80 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 max-lg:hidden">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleSelectAll}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-slate-600 bg-slate-900 accent-emerald-500"
                />
              </div>
              <div>Başlık</div>
              <div>Kategori</div>
              <div>Durum</div>
              <div>Tarih</div>
              <div className="text-right">İşlemler</div>
            </div>

            {/* Rows */}
            {filtered.map((item) => {
              const isOpen = expandedId === item.id;
              const isChecked = selected.has(item.id);
              const isActioning = actionLoading.has(item.id);
              const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.bekliyor;
              const catColor = CATEGORY_COLOR[item.category] ?? "bg-slate-500/15 text-slate-300 border-slate-500/40";

              return (
                <div key={item.id} className={["border-b border-slate-800/40 last:border-b-0 transition", isChecked ? "bg-emerald-500/[0.03]" : "bg-slate-950/60"].join(" ")}>
                  {/* Desktop row */}
                  <div className="grid grid-cols-[40px_1fr_100px_100px_110px_auto] items-center gap-2 px-4 py-3 max-lg:hidden">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(item.id)}
                        className="h-3.5 w-3.5 cursor-pointer rounded border-slate-600 bg-slate-900 accent-emerald-500"
                      />
                    </div>
                    <button
                      onClick={() => setExpandedId(isOpen ? null : item.id)}
                      className="flex items-center gap-2 text-left"
                    >
                      <svg
                        className={["h-3 w-3 shrink-0 text-slate-500 transition-transform", isOpen ? "rotate-90" : ""].join(" ")}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="truncate text-sm font-medium text-slate-100 hover:text-emerald-300 transition">
                        {item.title}
                      </span>
                    </button>
                    <span className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${catColor}`}>
                      {CATEGORY_LABEL[item.category] ?? item.category}
                    </span>
                    <span className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.cls}`}>
                      {status.label}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.created_at).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/duzenle/${item.id}`}
                        className="rounded-md border border-slate-700/60 bg-slate-900/70 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300 transition hover:border-amber-500/50"
                      >
                        Düzenle
                      </Link>
                      {item.status === "bekliyor" && (
                        <>
                          <button onClick={() => updateStatus(item.id, "yayinda")} disabled={isActioning} className="rounded-md bg-emerald-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-300 transition hover:bg-emerald-500/25 disabled:opacity-50">
                            Yayınla
                          </button>
                          <button onClick={() => updateStatus(item.id, "reddedildi")} disabled={isActioning} className="rounded-md bg-rose-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-50">
                            Reddet
                          </button>
                        </>
                      )}
                      {item.status === "yayinda" && (
                        <button onClick={() => updateStatus(item.id, "bekliyor")} disabled={isActioning} className="rounded-md bg-rose-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-50">
                          Kaldır
                        </button>
                      )}
                      {item.status === "reddedildi" && (
                        <button onClick={() => updateStatus(item.id, "bekliyor")} disabled={isActioning} className="rounded-md bg-amber-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300 transition hover:bg-amber-500/25 disabled:opacity-50">
                          Geri Al
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mobile row */}
                  <div className="space-y-3 px-4 py-4 lg:hidden">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(item.id)}
                        className="mt-1 h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-slate-600 bg-slate-900 accent-emerald-500"
                      />
                      <div className="flex-1">
                        <button
                          onClick={() => setExpandedId(isOpen ? null : item.id)}
                          className="text-left text-sm font-medium text-slate-100"
                        >
                          {item.title}
                        </button>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${catColor}`}>
                            {CATEGORY_LABEL[item.category] ?? item.category}
                          </span>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.cls}`}>
                            {status.label}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(item.created_at).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-6">
                      <Link href={`/admin/duzenle/${item.id}`} className="rounded-md border border-slate-700/60 bg-slate-900/70 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300">Düzenle</Link>
                      <button onClick={() => setExpandedId(isOpen ? null : item.id)} className="rounded-md border border-slate-700/60 bg-slate-900/70 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300">{isOpen ? "Kapat" : "Önizle"}</button>
                      {item.status === "bekliyor" && (
                        <>
                          <button onClick={() => updateStatus(item.id, "yayinda")} disabled={isActioning} className="rounded-md bg-emerald-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-300 disabled:opacity-50">Yayınla</button>
                          <button onClick={() => updateStatus(item.id, "reddedildi")} disabled={isActioning} className="rounded-md bg-rose-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-rose-300 disabled:opacity-50">Reddet</button>
                        </>
                      )}
                      {item.status === "yayinda" && (
                        <button onClick={() => updateStatus(item.id, "bekliyor")} disabled={isActioning} className="rounded-md bg-rose-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-rose-300 disabled:opacity-50">Kaldır</button>
                      )}
                      {item.status === "reddedildi" && (
                        <button onClick={() => updateStatus(item.id, "bekliyor")} disabled={isActioning} className="rounded-md bg-amber-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300 disabled:opacity-50">Geri Al</button>
                      )}
                    </div>
                  </div>

                  {/* Accordion preview */}
                  {isOpen && (
                    <div className="border-t border-slate-800/40 bg-slate-900/30 px-4 py-4 lg:pl-14">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        İçerik Önizlemesi
                      </p>
                      <div className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                        {item.content || "— İçerik yok —"}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer stats */}
        {!loading && filtered.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
            <span>Toplam {filtered.length} içerik gösteriliyor</span>
            <span>
              {counts.bekliyor} bekleyen · {counts.yayinda} yayında · {counts.reddedildi} reddedilen
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
