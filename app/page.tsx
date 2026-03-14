"use client";

import { useEffect, useState } from "react";

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

  type UiPlayer = ApiPlayer & {
    analysis: string;
  };

  const [players, setPlayers] = useState<UiPlayer[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
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

        const uiPlayers: UiPlayer[] = apiPlayers.map((p) => {
          const baseName = p.name ?? "Bilinmeyen Oyuncu";
          const team = p.team ?? "Bilinmeyen Kulüp";
          const pos = p.position ?? "Bilinmeyen Pozisyon";
          const minutes = p.minutes ?? 0;
          const goals = p.goals ?? 0;

          const per90 =
            minutes > 0 ? (goals / (minutes / 90)).toFixed(2) : "0.00";

          const analysis = `Model, ${baseName} için ${team} formasıyla ${pos.toLowerCase()} rolünde oynarken özellikle dakikalarına oranla gol katkısının (≈ ${per90} gol / 90 dk) ve sahadaki sürekliliğinin altını çiziyor.`;

          return {
            ...p,
            analysis,
          };
        });

        if (!isMounted) return;

        setPlayers(uiPlayers);
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-xs text-slate-300 shadow-[0_10px_30px_rgba(15,23,42,0.9)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
            <span className="font-medium text-slate-200">Son güncelleme:</span>
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

        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400/80">
              Scout Intelligence
            </p>
            <h1 className="mt-3 bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-4xl lg:text-5xl">
              Futbol Yetenek Panosu
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-300/80 md:text-base">
              Avrupa&apos;nın dört bir yanındaki genç yetenekleri gerçek zamanlı
              veriler ve AI destekli analizlerle takip et.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/30 bg-slate-900/70 px-4 py-3 shadow-[0_0_40px_rgba(16,185,129,0.25)] backdrop-blur">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 ring-2 ring-emerald-400/60" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-300/90">
                Canlı Durum
              </p>
              <p className="text-sm text-slate-100">
                5 öne çıkan yetenek listelendi
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/70 shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-500/15 via-cyan-500/10 to-transparent blur-3xl" />

            <div className="relative flex items-center justify-between px-5 pt-4 pb-3 sm:px-6">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
                  Öne Çıkan Oyuncular
                </h2>
                <p className="mt-1 text-xs text-slate-300/80">
                  Son 12 ayda performans verileri ile öne çıkan 5 genç yetenek
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/40">
              U19 Segmenti
              </span>
            </div>

          <div className="relative z-10 border-t border-slate-800/80 px-5 pb-3 pt-2 sm:px-6">
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

            <div className="relative overflow-x-auto">
              {loading && (
                <div className="flex min-h-[200px] items-center justify-center text-sm text-slate-300">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                  Yükleniyor...
                </div>
              )}

              {!loading && error && (
                <div className="min-h-[200px] rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {!loading && !error && filteredPlayers.length === 0 && (
                <div className="min-h-[200px] rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
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
                    {filteredPlayers.map((player, index) => {
                      const isExpanded = expandedPlayer === player.name;
                      return (
                        <>
                          <tr
                            key={player.id ?? player.name}
                            onClick={() =>
                              setExpandedPlayer(
                                isExpanded ? null : player.name
                              )
                            }
                            className={[
                              "group cursor-pointer transition-all duration-200",
                              "hover:bg-slate-800/70 hover:shadow-[0_0_0_1px_rgba(45,212,191,0.4)]",
                              isExpanded ? "bg-slate-900/80" : "",
                            ].join(" ")}
                          >
                            <td className="sticky left-0 z-10 border-b border-slate-800/80 bg-slate-900/80 px-3 py-3 text-xs font-semibold text-slate-300">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800/80 text-[11px] text-emerald-300 ring-1 ring-emerald-500/40">
                                {index + 1}
                              </span>
                            </td>
                            <td className="border-b border-slate-800/80 px-3 py-3 text-sm font-medium text-slate-100">
                              <div className="flex items-center gap-2">
                                <span className="block">{player.name}</span>
                                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-300/80">
                                  {isExpanded ? "Analizi gizle" : "AI analizi"}
                                </span>
                              </div>
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
                          {isExpanded && (
                            <tr className="bg-slate-950/70">
                              <td
                                colSpan={6}
                                className="border-b border-slate-800/80 px-3 py-3 text-xs text-slate-200"
                              >
                                <div className="flex gap-3">
                                  <div className="mt-1 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-500/15 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/40">
                                    AI
                                  </div>
                                  <p className="leading-relaxed">
                                    {player.analysis}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
              <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Pano Özeti
              </h3>
              <p className="mt-3 text-sm text-slate-200">
                Bu demo pano, gerçek bir scout ekibinin kullanacağı profesyonel
                bir spor veri platformu hissi vermek için tasarlandı. Oyuncu
                kartları, pozisyon bazlı filtreler ve gelişmiş metrikler kolayca
                eklenebilir.
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl bg-slate-800/70 p-3">
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    Ortalama Yaş
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-slate-50">
                    18.2
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-800/70 p-3">
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    Toplam Değer
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-emerald-300">
                    €11.9M
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900/40 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Yakında
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-200">
                <li className="flex items-center justify-between">
                  <span>Gerçek API entegrasyonu</span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-500/40">
                    Planlandı
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Gelişmiş metrik panosu</span>
                  <span className="rounded-full bg-slate-800/90 px-2 py-0.5 text-[10px] text-slate-200">
                    Tasarım
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Scout notları &amp; raporlar</span>
                  <span className="rounded-full bg-slate-800/90 px-2 py-0.5 text-[10px] text-slate-200">
                    Tasarım
                  </span>
                </li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}