"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AdminLayout from "../components/admin-layout";
import { stripHtml, estimateReadMinutes } from "@/lib/utils";

type Row = {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  created_at: string;
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  bekliyor: { label: "Bekliyor", cls: "bg-amber-500/15 text-amber-300 border-amber-500/40" },
  yayinda: { label: "Yayında", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" },
  reddedildi: { label: "Reddedildi", cls: "bg-rose-500/15 text-rose-300 border-rose-500/40" },
};

export default function AdminRadarPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contents")
      .select("id, title, slug, content, status, created_at")
      .eq("category", "radar")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const published = rows.filter((r) => r.status === "yayinda").length;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold">Radar yazıları</h1>
            <p className="text-xs text-slate-400">
              Sitede /radar sayfasında gösterilen kartlar yalnızca <strong className="text-slate-300">Yayında</strong> durumundaki
              içeriklerdir. Buradan düzenleyin veya yenisini ekleyin.
            </p>
            <p className="mt-2 text-[11px] text-slate-500">
              Yayında: <span className="text-emerald-400">{published}</span> · Toplam kayıt: {rows.length}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/yeni?category=radar"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              + Yeni radar yazısı
            </Link>
            <Link
              href="/radar"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-700/60 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
            >
              Siteyi aç →
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16 text-sm text-slate-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700/60 bg-slate-900/30 px-6 py-12 text-center">
            <p className="text-sm text-slate-400">Henüz radar kategorisinde içerik yok.</p>
            <Link href="/admin/yeni?category=radar" className="mt-3 inline-block text-xs font-semibold text-emerald-400 hover:underline">
              İlk yazıyı ekle
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((item) => {
              const st = STATUS_LABEL[item.status] ?? STATUS_LABEL.bekliyor;
              const preview = stripHtml(item.content).replace(/\s+/g, " ").trim().slice(0, 120);
              const mins = estimateReadMinutes(item.content);
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${st.cls}`}>
                          {st.label}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.created_at).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          {" · ~"}
                          {mins} dk
                        </span>
                      </div>
                      <h2 className="text-sm font-semibold text-slate-100">{item.title}</h2>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{preview || "—"}…</p>
                      <code className="mt-2 block truncate text-[10px] text-slate-600">/{item.slug}</code>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Link
                        href={`/admin/duzenle/${item.id}`}
                        className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
                      >
                        Düzenle
                      </Link>
                      {item.status === "yayinda" && (
                        <Link
                          href={`/radar/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:text-slate-200"
                        >
                          Önizle
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
