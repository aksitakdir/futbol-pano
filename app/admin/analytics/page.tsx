"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AdminLayout from "../components/admin-layout";
import { AdminStatCard } from "../components/admin-stat-card";

type ContentRow = {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  category: string;
  status: string;
  view_count: number;
  hero_variant?: string;
  accent?: string;
  created_at: string;
};

type ArenaGame = {
  id: string;
  player_a: string;
  player_b: string;
  created_at: string;
};

type ArenaVote = {
  game_id: string;
};

const CATEGORY_LABEL: Record<string, string> = {
  listeler: "Listeler",
  radar: "Radar",
  "taktik-lab": "Taktik Lab",
};

const CATEGORY_COLOR: Record<string, string> = {
  listeler: "emerald",
  radar: "sky",
  "taktik-lab": "amber",
};

export default function AnalyticsPage() {
  const [contents, setContents] = useState<ContentRow[]>([]);
  const [arenaGames, setArenaGames] = useState<ArenaGame[]>([]);
  const [arenaVotes, setArenaVotes] = useState<ArenaVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"content" | "arena" | "generation">("content");
  const [migrating, setMigrating] = useState(false);
  const [migrateResult, setMigrateResult] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      const [{ data: contentsData }, { data: gamesData }, { data: votesData }] = await Promise.all([
        supabase
          .from("contents")
          .select("id,title,title_en,slug,category,status,view_count,hero_variant,accent,created_at")
          .order("view_count", { ascending: false })
          .limit(50),
        supabase
          .from("arena_games")
          .select("id,player_a,player_b,created_at")
          .order("created_at", { ascending: false })
          .limit(20),
        supabase.from("arena_votes").select("game_id"),
      ]);

      setContents((contentsData as ContentRow[]) ?? []);
      setArenaGames((gamesData as ArenaGame[]) ?? []);
      setArenaVotes((votesData as ArenaVote[]) ?? []);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const published = contents.filter((c) => c.status === "yayinda");
  const pending = contents.filter((c) => c.status === "bekliyor");
  const totalViews = contents.reduce((sum, c) => sum + (c.view_count ?? 0), 0);
  const generatedLast7d = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity -- “son 7 gün” için duvar saati anlık kullanılır (istemci admin)
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return contents.filter((c) => new Date(c.created_at).getTime() >= cutoff).length;
  }, [contents]);
  const topContent = [...published].sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0)).slice(0, 10);

  const votesByGame: Record<string, number> = {};
  arenaVotes.forEach((v) => {
    votesByGame[v.game_id] = (votesByGame[v.game_id] ?? 0) + 1;
  });
  const gamesWithVotes = arenaGames.map((g) => ({ ...g, votes: votesByGame[g.id] ?? 0 })).sort((a, b) => b.votes - a.votes);

  const byCategory: Record<string, number> = {};
  published.forEach((c) => {
    byCategory[c.category] = (byCategory[c.category] ?? 0) + 1;
  });

  const byHeroVariant: Record<string, number> = {};
  contents.forEach((c) => {
    const v = c.hero_variant ?? "text-only";
    byHeroVariant[v] = (byHeroVariant[v] ?? 0) + 1;
  });

  async function runBatchMigration() {
    setMigrating(true);
    setMigrateResult(null);
    try {
      const res = await fetch("/api/migrate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch: true }),
      });
      const data = (await res.json()) as { migrated?: number; failed?: number; total?: number; error?: string };
      if (data.error) {
        setMigrateResult(`Hata: ${data.error}`);
      } else {
        setMigrateResult(`✓ ${data.migrated ?? 0} içerik migrate edildi, ${data.failed ?? 0} hata (toplam: ${data.total ?? 0})`);
      }
    } catch {
      setMigrateResult("Bağlantı hatası");
    }
    setMigrating(false);
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          Yükleniyor...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Analytics</h1>
            <p className="mt-0.5 text-xs text-slate-400">İçerik performansı, Arena ve üretim istatistikleri</p>
          </div>
          <Link
            href="/admin"
            className="rounded-lg border border-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:text-slate-200"
          >
            ← Admin
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <AdminStatCard label="Yayında" value={published.length} sub="toplam içerik" color="emerald" />
          <AdminStatCard label="Toplam Görüntüleme" value={totalViews.toLocaleString()} sub="tüm içerikler" color="sky" />
          <AdminStatCard label="Bekleyen İçerik" value={pending.length} sub="onay bekliyor" color="amber" />
          <AdminStatCard label="Arena Maçı" value={arenaGames.length} sub={`${arenaVotes.length} oy`} color="rose" />
        </div>

        <div className="flex gap-2 border-b border-slate-700/60">
          {(["content", "arena", "generation"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={[
                "-mb-px border-b-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition",
                activeTab === tab
                  ? "border-emerald-400 text-emerald-300"
                  : "border-transparent text-slate-500 hover:text-slate-300",
              ].join(" ")}
            >
              {tab === "content" ? "İçerik" : tab === "arena" ? "Arena" : "Üretim"}
            </button>
          ))}
        </div>

        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Kategoriye Göre Dağılım</p>
              <div className="flex gap-4">
                {Object.entries(byCategory).map(([cat, count]) => (
                  <div key={cat} className="flex-1 text-center">
                    <div
                      className={`text-2xl font-black ${
                        CATEGORY_COLOR[cat] === "emerald"
                          ? "text-emerald-400"
                          : CATEGORY_COLOR[cat] === "sky"
                            ? "text-sky-400"
                            : "text-amber-400"
                      }`}
                    >
                      {count}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">{CATEGORY_LABEL[cat] ?? cat}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/40">
              <div className="border-b border-slate-700/60 px-5 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">En Çok Görüntülenen İçerikler</p>
              </div>
              {topContent.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Görüntüleme verisi yok.{" "}
                  <span className="text-slate-400">
                    Supabase&apos;de <code className="text-xs text-emerald-400">increment_view_count</code> fonksiyonunu ve migration&apos;ı çalıştırın.
                  </span>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/60">
                      <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">#</th>
                      <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">Başlık</th>
                      <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">Kategori</th>
                      <th className="px-5 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">Görüntüleme</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topContent.map((c, i) => (
                      <tr key={c.id} className="border-b border-slate-700/40 transition hover:bg-slate-800/30">
                        <td className="px-5 py-3 font-mono text-xs text-slate-500">{i + 1}</td>
                        <td className="px-5 py-3">
                          <Link
                            href={`/admin/duzenle/${c.id}`}
                            className="line-clamp-1 font-medium text-slate-100 transition hover:text-emerald-300"
                          >
                            {c.title}
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-[10px] text-slate-400">{CATEGORY_LABEL[c.category] ?? c.category}</span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono font-bold text-emerald-400">{(c.view_count ?? 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === "arena" && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/40">
              <div className="border-b border-slate-700/60 px-5 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">En Popüler Arena Maçları</p>
              </div>
              {gamesWithVotes.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">Arena maçı bulunamadı.</div>
              ) : (
                <div className="divide-y divide-slate-700/40">
                  {gamesWithVotes.map((g, i) => (
                    <div key={g.id} className="flex items-center gap-4 px-5 py-3 transition hover:bg-slate-800/30">
                      <span className="w-5 text-center font-mono text-xs text-slate-500">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-100">
                          {g.player_a} <span className="text-slate-500">vs</span> {g.player_b}
                        </p>
                        <p className="text-[11px] text-slate-500">{new Date(g.created_at).toLocaleDateString("tr-TR")}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-rose-400">{g.votes}</div>
                        <div className="text-[10px] text-slate-500">oy</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "generation" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-400">sections_json Hard Migration</p>
              <p className="mb-4 text-[11px] text-slate-400">
                Mevcut HTML içerikleri yapısal sections_json formatına dönüştürür.{" "}
                <code className="text-[10px] text-sky-300">sections_json IS NULL</code> olan içerikleri işler (max 50/batch).
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={runBatchMigration}
                  disabled={migrating}
                  className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
                >
                  {migrating ? "Migrate ediliyor..." : "Batch Migrate (50 içerik)"}
                </button>
                {migrateResult ? (
                  <span className={`text-[11px] ${migrateResult.startsWith("✓") ? "text-emerald-400" : "text-rose-400"}`}>{migrateResult}</span>
                ) : null}
              </div>
              <p className="mt-3 text-[10px] text-slate-500">
                Not: Önce Supabase SQL Editor&apos;da <code className="text-slate-400">supabase/v2_columns_migration.sql</code> dosyasını çalıştırın.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <AdminStatCard label="Son 7 Gün" value={generatedLast7d} sub="üretilen içerik" color="emerald" />
              <AdminStatCard label="Toplam Bekleyen" value={pending.length} sub="yayına alınmadı" color="amber" />
              <AdminStatCard label="Toplam Yayında" value={published.length} sub="aktif içerik" color="sky" />
            </div>

            <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Hero Stili Dağılımı</p>
              <div className="space-y-2">
                {Object.entries(byHeroVariant)
                  .sort((a, b) => b[1] - a[1])
                  .map(([variant, count]) => {
                    const total = contents.length;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={variant} className="flex items-center gap-3">
                        <span className="w-28 font-mono text-[11px] text-slate-400">{variant}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-right text-xs text-slate-400">{count}</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {pending.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/5">
                <div className="border-b border-amber-500/20 px-5 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-400">Yayına Alınmayı Bekleyen</p>
                </div>
                <div className="divide-y divide-slate-700/40">
                  {pending.slice(0, 10).map((c) => (
                    <div key={c.id} className="flex items-center gap-3 px-5 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-200">{c.title_en || c.title}</p>
                        <p className="text-[10px] text-slate-500">
                          {CATEGORY_LABEL[c.category] ?? c.category} · {c.hero_variant ?? "text-only"}
                        </p>
                      </div>
                      <Link href={`/admin/duzenle/${c.id}`} className="text-[11px] font-medium text-emerald-400 transition hover:text-emerald-300">
                        Düzenle →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
