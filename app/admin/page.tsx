"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AdminLayout from "./components/admin-layout";
import { AdminStatCard } from "./components/admin-stat-card";

type ContentRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  created_at: string;
};

const CATEGORY_LABEL: Record<string, string> = {
  listeler: "Listeler",
  radar: "Radar",
  "taktik-lab": "Taktik Lab",
};

/** Analytics ile aynı kategori vurgu renkleri */
const CATEGORY_COLOR: Record<string, string> = {
  listeler: "text-emerald-400",
  radar: "text-sky-400",
  "taktik-lab": "text-amber-400",
};

export default function AdminDashboard() {
  const [contents, setContents] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("contents")
        .select("id, title, slug, category, status, created_at")
        .order("created_at", { ascending: false });
      setContents(data ?? []);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      total: contents.length,
      yayinda: contents.filter((c) => c.status === "yayinda").length,
      bekliyor: contents.filter((c) => c.status === "bekliyor").length,
      thisWeek: contents.filter((c) => new Date(c.created_at) >= weekAgo).length,
    };
  }, [contents]);

  const recent = contents.slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Dashboard</h1>
            <p className="text-xs text-slate-400">İçerik yönetim paneline genel bakış</p>
          </div>
          <Link
            href="/admin/yeni"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            + Yeni İçerik
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-20 text-sm text-slate-400 justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            Yükleniyor...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <AdminStatCard label="Toplam İçerik" value={stats.total} sub="veritabanı" color="slate" />
              <AdminStatCard label="Yayında" value={stats.yayinda} sub="yayımlanmış" color="emerald" />
              <AdminStatCard label="Bekleyen" value={stats.bekliyor} sub="onay bekliyor" color="amber" />
              <AdminStatCard label="Bu Hafta" value={stats.thisWeek} sub="son 7 gün" color="sky" />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Link
                href="/admin/icerikler"
                className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/40 px-4 py-3 text-xs font-medium text-slate-300 transition hover:bg-slate-800/30 hover:text-slate-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                İçerikleri Yönet
              </Link>
              <Link
                href="/admin/radar"
                className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/40 px-4 py-3 text-xs font-medium text-slate-300 transition hover:bg-slate-800/30 hover:text-slate-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2" /></svg>
                Radar yazıları
              </Link>
              <Link
                href="/admin/api-durum"
                className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/40 px-4 py-3 text-xs font-medium text-slate-300 transition hover:bg-slate-800/30 hover:text-slate-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                API Durumunu Gör
              </Link>
              <Link
                href="/admin/ayarlar"
                className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/40 px-4 py-3 text-xs font-medium text-slate-300 transition hover:bg-slate-800/30 hover:text-slate-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33" /></svg>
                Ayarları Düzenle
              </Link>
              <Link
                href="/admin/statik"
                className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/40 px-4 py-3 text-xs font-medium text-slate-300 transition hover:bg-slate-800/30 hover:text-slate-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>
                Statik İçerikler
              </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/40">
              <div className="flex items-center justify-between border-b border-slate-700/60 px-5 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Son Eklenen İçerikler</p>
                <Link href="/admin/icerikler" className="text-[11px] font-medium text-emerald-400 transition hover:text-emerald-300">
                  Tümünü Gör →
                </Link>
              </div>
              {recent.length === 0 ? (
                <div className="px-5 py-8 text-center text-xs text-slate-500">Henüz içerik eklenmemiş</div>
              ) : (
                <div>
                  {recent.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 border-b border-slate-700/40 px-5 py-3 transition hover:bg-slate-800/30 last:border-b-0"
                    >
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/admin/duzenle/${item.id}`}
                          className="block truncate text-sm font-medium text-slate-100 transition hover:text-emerald-300"
                        >
                          {item.title}
                        </Link>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px]">
                          <span className={CATEGORY_COLOR[item.category] ?? "text-slate-400"}>
                            {CATEGORY_LABEL[item.category] ?? item.category}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-500">
                            {new Date(item.created_at).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <span
                        className={[
                          "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          item.status === "yayinda"
                            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                            : item.status === "bekliyor"
                            ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                            : "border-rose-500/40 bg-rose-500/15 text-rose-300",
                        ].join(" ")}
                      >
                        {item.status === "yayinda" ? "Yayında" : item.status === "bekliyor" ? "Bekliyor" : "Reddedildi"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Kategoriye Göre Özet</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {Object.entries(CATEGORY_LABEL).map(([key, label]) => {
                  const count = contents.filter((c) => c.category === key).length;
                  const pct = contents.length > 0 ? Math.round((count / contents.length) * 100) : 0;
                  return (
                    <div key={key}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${CATEGORY_COLOR[key]}`}>{label}</span>
                        <span className="font-mono text-lg font-black text-slate-200">{count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="mt-1 text-right text-[10px] text-slate-500">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
