"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconHome,
  IconList,
  IconRadar,
  IconUsers,
  IconShield,
  IconTrendUp,
  IconStar,
} from "./components/icons";

export default function Home() {
  type FilterKey = "all" | "stoper" | "mid" | "forward";

  type ApiPlayer = {
    id: number;
    name: string;
    age: number;
    nationality?: string;
    position?: string;
    team?: string;
    league?: string;
    appearances?: number;
    minutes?: number;
    goals?: number;
  };

  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const filterButtons: { key: FilterKey; label: string }[] = [
    { key: "all", label: "Tümü" },
    { key: "stoper", label: "Stoper" },
    { key: "mid", label: "Orta Saha" },
    { key: "forward", label: "Forvet" },
  ];

  const filteredPlayers = players.filter((player) => {
    const pos = (player.position ?? "").toLowerCase();

    if (activeFilter === "all") return true;

    if (activeFilter === "stoper") {
      return (
        pos.includes("defender") ||
        pos.includes("centre-back") ||
        pos.includes("center back") ||
        pos.includes("centre back") ||
        pos.includes("cb")
      );
    }

    if (activeFilter === "mid") {
      return pos.includes("midfielder") || pos.includes("cm") || pos.includes("dm") || pos.includes("am");
    }

    if (activeFilter === "forward") {
      return (
        pos.includes("attacker") ||
        pos.includes("forward") ||
        pos.includes("striker") ||
        pos.includes("winger")
      );
    }

    return true;
  });

  useEffect(() => {
    let isMounted = true;

    async function loadPlayers() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/players", { cache: "no-store" });

        if (!res.ok) {
          const text = await res.text();
          if (!isMounted) return;
          setError(
            `Oyuncu verileri alınırken bir hata oluştu (status ${res.status}).`
          );
          console.error("Failed to fetch /api/players:", text);
          return;
        }

        const json = await res.json();
        const apiPlayers: ApiPlayer[] = Array.isArray(json?.players)
          ? json.players
          : [];

        if (!isMounted) return;

        setPlayers(apiPlayers);
      } catch (err) {
        console.error("Unexpected error fetching /api/players:", err);
        if (!isMounted) return;
        setError("Oyuncu verileri alınırken beklenmeyen bir hata oluştu.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPlayers();

    return () => {
      isMounted = false;
    };
  }, []);

  const lastUpdated = "14 Mart 2026";
  const featuredPlayer = players[0] ?? null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col">
        {/* Üst navigasyon */}
        <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 shadow-[0_0_40px_rgba(16,185,129,0.7)]" />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-sm font-semibold tracking-[0.22em] text-transparent">
                SCOUT INTELLIGENCE
              </span>
            </div>
            <nav className="hidden items-center gap-6 text-xs font-medium text-slate-300 md:flex">
              <Link href="/" className="flex items-center gap-1.5 text-emerald-300">
                <IconHome /> Ana Sayfa
              </Link>
              <Link href="/listeler" className="flex items-center gap-1.5 transition-colors hover:text-emerald-300">
                <IconList /> Listeler
              </Link>
              <Link href="/radar" className="flex items-center gap-1.5 transition-colors hover:text-emerald-300">
                <IconRadar /> Radar
              </Link>
              <Link href="/oyuncular" className="flex items-center gap-1.5 transition-colors hover:text-emerald-300">
                <IconUsers /> Oyuncular
              </Link>
            </nav>
            <div className="flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-900/70 p-0.5 text-xs">
              <button className="rounded-full bg-emerald-500/20 px-3 py-1 font-semibold text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.5)]">
                TR
              </button>
              <button className="rounded-full px-3 py-1 text-slate-300 hover:text-emerald-200">
                EN
              </button>
            </div>
          </div>
        </header>

        {/* İçerik */}
        <div className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
            {/* Üst durum satırı */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-3 rounded-full border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-xs text-slate-300 shadow-[0_10px_30px_rgba(15,23,42,0.9)]">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
                <span className="font-medium text-slate-200">
                  Son güncelleme:
                </span>
                <span className="text-slate-300/90">{lastUpdated}</span>
              </div>
              <div className="inline-flex items-center gap-2 text-xs text-emerald-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                <span className="font-medium tracking-wide">
                  Veri yenileniyor<span className="animate-pulse">...</span>
                </span>
              </div>
            </div>

            {/* Hero: Bu haftanın öne çıkan oyuncusu */}
            <section className="mb-10 grid gap-6 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1.3fr)]">
              <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
                <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-emerald-500/30 blur-3xl" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-300/90">
                  Bu haftanın öne çıkan oyuncusu
                </p>
                <h1 className="mt-3 bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
                  {loading
                    ? "Yükleniyor..."
                    : featuredPlayer?.name ?? "Veri bekleniyor"}
                </h1>
                <p className="mt-2 text-sm text-slate-300">
                  {loading && "Premier League gol krallığı verileri yükleniyor."}
                  {!loading &&
                    !featuredPlayer &&
                    "Şu anda öne çıkan oyuncu verisine erişilemiyor. Lütfen daha sonra tekrar deneyin."}
                  {!loading &&
                    featuredPlayer &&
                    `${featuredPlayer.team ?? "Kulüp bilgisi yok"} formasıyla ${
                      featuredPlayer.position?.toLowerCase() ??
                      "bilinmeyen pozisyon"
                    } rolünde bu sezon dikkat çekici bir gol katkısı sergiliyor.`}
                </p>

                <div className="mt-6 grid grid-cols-3 gap-4 text-xs">
                  <div className="rounded-xl bg-slate-900/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Lig
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-50">
                      {featuredPlayer?.league ?? "Premier League"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Sezon 2024
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-900/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Goller
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-300">
                      {featuredPlayer?.goals ?? "—"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Toplam gol sayısı
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-900/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Dakika
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-50">
                      {featuredPlayer?.minutes ?? "—"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Sahada kalma süresi
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <button className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.8)] transition hover:brightness-110">
                    Profili Gör
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Platform Özeti
                  </p>
                  <p className="mt-3 text-sm text-slate-200">
                    Scout Intelligence, Avrupa çapındaki genç yetenekleri
                    gerçek zamanlı verilerle tarayan bir içerik ve analiz
                    platformudur. Her hafta öne çıkan oyuncuları, gizli
                    kalmış profilleri ve radar yazılarını tek bir yerde
                    toplar.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-300">
                    <li>• API-Football verileriyle canlı performans takibi</li>
                    <li>• Pozisyona göre filtrelenebilir listeler</li>
                    <li>• Detaylı scout raporları ve oyuncu profilleri</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Ana içerik: tablo + listeler + radar */}
            <section className="space-y-10">
              {/* Oyuncu tablosu */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
                <div className="flex flex-col gap-3 border-b border-slate-800/80 px-5 pb-4 pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
                      Bu Haftanın En İyileri
                    </h2>
                    <p className="mt-1 text-xs text-slate-300/80">
                      Premier League 2024 sezonu gol krallığı sıralamasından
                      ilk 10 oyuncu.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {filterButtons.map((filter) => {
                      const isActive = activeFilter === filter.key;
                      return (
                        <button
                          key={filter.key}
                          type="button"
                          onClick={() => setActiveFilter(filter.key)}
                          className={[
                            "rounded-full border px-3 py-1.5 transition-all duration-150",
                            "backdrop-blur hover:-translate-y-[1px]",
                            isActive
                              ? "border-emerald-500/80 bg-emerald-500/20 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                              : "border-slate-700/90 bg-slate-900/80 text-slate-300 hover:border-emerald-500/60 hover:text-emerald-100",
                          ].join(" ")}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="relative overflow-x-auto px-2 pb-4 pt-2 sm:px-4">
                  {loading && (
                    <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-300">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                      Yükleniyor...
                    </div>
                  )}

                  {!loading && error && (
                    <div className="min-h-[220px] rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-red-200">
                      {error}
                    </div>
                  )}

                  {!loading && !error && filteredPlayers.length === 0 && (
                    <div className="min-h-[220px] rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                      Seçili filtreye uygun oyuncu bulunamadı.
                    </div>
                  )}

                  {!loading && !error && filteredPlayers.length > 0 && (
                    <table className="min-w-full border-separate border-spacing-0 text-sm">
                      <thead>
                        <tr className="bg-slate-900/80">
                          <th className="sticky left-0 z-10 border-b border-slate-700/80 bg-slate-900/90 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            #
                          </th>
                          <th className="border-b border-slate-700/80 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Oyuncu
                          </th>
                          <th className="border-b border-slate-700/80 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Pozisyon
                          </th>
                          <th className="border-b border-slate-700/80 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Yaş
                          </th>
                          <th className="border-b border-slate-700/80 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Kulüp
                          </th>
                          <th className="border-b border-slate-700/80 px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Goller
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPlayers.map((player, index) => (
                          <tr
                            key={player.id ?? player.name}
                            className="group transition-all duration-200 hover:bg-slate-800/70 hover:shadow-[0_0_0_1px_rgba(45,212,191,0.4)]"
                          >
                            <td className="sticky left-0 z-10 border-b border-slate-800/80 bg-slate-900/80 px-3 py-3 text-xs font-semibold text-slate-300">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800/80 text-[11px] text-emerald-300 ring-1 ring-emerald-500/40">
                                {index + 1}
                              </span>
                            </td>
                            <td className="border-b border-slate-800/80 px-3 py-3 text-sm font-medium text-slate-100">
                              {player.name}
                            </td>
                            <td className="border-b border-slate-800/80 px-3 py-3 text-xs font-medium text-emerald-300">
                              {player.position ?? "—"}
                            </td>
                            <td className="border-b border-slate-800/80 px-3 py-3 text-xs text-slate-300">
                              {player.age ?? "—"}
                            </td>
                            <td className="border-b border-slate-800/80 px-3 py-3 text-xs text-slate-300">
                              {player.team ?? "—"}
                            </td>
                            <td className="border-b border-slate-800/80 px-3 py-3 text-right text-sm font-semibold text-emerald-300">
                              {player.goals ?? 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Öne çıkan listeler */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Öne Çıkan Listeler
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    Kürasyonlu içerik listeleri
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { title: "En Değerli 10 Genç Stoper", slug: "en-iyi-10-genc-stoper", icon: <IconShield className="text-emerald-300" /> },
                    { title: "Süper Lig'in Gizli İsimleri", slug: "super-lig-gizli-isimler", icon: <IconTrendUp className="text-sky-300" /> },
                    { title: "Bu Sezonun Sürpriz İsimleri", slug: "surpriz-isimler-2025", icon: <IconStar className="text-amber-300" /> },
                  ].map((item) => (
                    <Link
                      key={item.slug}
                      href={`/listeler/${item.slug}`}
                      className="group flex flex-col items-start rounded-2xl border border-slate-800/80 bg-slate-950/60 px-4 py-4 text-left text-sm text-slate-200 shadow-[0_16px_50px_rgba(15,23,42,0.8)] transition hover:-translate-y-1 hover:border-emerald-500/70 hover:bg-slate-900/80"
                    >
                      <span className="mb-2 flex items-center gap-2">
                        {item.icon}
                        <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                          Liste
                        </span>
                      </span>
                      <span className="text-sm font-semibold">{item.title}</span>
                      <span className="mt-1 text-xs text-slate-400">
                        Detaylı analiz, performans metrikleri ve scout notları
                        ile birlikte.
                      </span>
                      <span className="mt-3 inline-flex items-center text-xs font-semibold text-emerald-300">
                        Listeyi aç
                        <span className="ml-1 transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Haftalık Radar */}
              <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300/90">
                      Haftalık Radar
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-slate-50 md:text-lg">
                      Premier League&apos;de gölgede kalan bitiriciler
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">
                      Bu haftaki radar yazımızda, skor tabelasına düzenli
                      yansımayan ancak xG, koşu kalitesi ve baskı altında
                      bitiricilik metrikleriyle scout ekranlarında öne çıkan
                      genç forvetleri inceliyoruz.
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <Link
                      href="/radar"
                      className="inline-flex items-center justify-center rounded-full bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_25px_rgba(148,163,184,0.5)] transition hover:bg-white"
                    >
                      Tümünü Oku
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/90">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-400 sm:flex-row">
            <span className="font-medium text-slate-300">
              Scout Intelligence
            </span>
            <div className="flex items-center gap-4">
              <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
              <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
              <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
            </div>
            <span className="text-[11px] text-slate-500">
              © 2026 Scout Intelligence
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}