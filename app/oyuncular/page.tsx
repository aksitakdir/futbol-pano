"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconHome,
  IconList,
  IconRadar,
  IconUsers,
  IconSearch,
  IconShield,
  IconBall,
  IconCompass,
} from "../components/icons";

type PositionFilter = "all" | "defender" | "midfielder" | "forward";

type Player = {
  name: string;
  age: number;
  club: string;
  position: string;
  positionCategory: PositionFilter;
  value: string;
};

const samplePlayers: Player[] = [
  {
    name: "Pau Cubarsí",
    age: 18,
    club: "FC Barcelona",
    position: "Stoper",
    positionCategory: "defender",
    value: "€60M",
  },
  {
    name: "Lamine Yamal",
    age: 17,
    club: "FC Barcelona",
    position: "Sağ Kanat",
    positionCategory: "forward",
    value: "€150M",
  },
  {
    name: "Kobbie Mainoo",
    age: 19,
    club: "Manchester United",
    position: "Merkez Orta Saha",
    positionCategory: "midfielder",
    value: "€70M",
  },
  {
    name: "Arda Güler",
    age: 20,
    club: "Real Madrid",
    position: "Ofansif Orta Saha",
    positionCategory: "midfielder",
    value: "€50M",
  },
  {
    name: "Warren Zaïre-Emery",
    age: 19,
    club: "Paris Saint-Germain",
    position: "Box-to-Box Orta Saha",
    positionCategory: "midfielder",
    value: "€80M",
  },
  {
    name: "Micky van de Ven",
    age: 24,
    club: "Tottenham Hotspur",
    position: "Sol Stoper",
    positionCategory: "defender",
    value: "€55M",
  },
  {
    name: "Cole Palmer",
    age: 23,
    club: "Chelsea",
    position: "On Numara",
    positionCategory: "forward",
    value: "€110M",
  },
  {
    name: "Giorgio Scalvini",
    age: 21,
    club: "Atalanta",
    position: "Stoper / Defansif Orta Saha",
    positionCategory: "defender",
    value: "€45M",
  },
];

function positionIcon(category: PositionFilter) {
  if (category === "defender") return <IconShield className="text-emerald-300" />;
  if (category === "midfielder") return <IconCompass className="text-sky-300" />;
  if (category === "forward") return <IconBall className="text-rose-300" />;
  return null;
}

function positionBadgeColor(category: PositionFilter): string {
  if (category === "defender") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  if (category === "midfielder") return "bg-sky-500/15 text-sky-300 border-sky-500/40";
  if (category === "forward") return "bg-rose-500/15 text-rose-300 border-rose-500/40";
  return "bg-slate-500/15 text-slate-200 border-slate-500/40";
}

export default function PlayersPage() {
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState<PositionFilter>("all");

  const filtered = samplePlayers.filter((p) => {
    const matchesSearch =
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.club.toLowerCase().includes(search.toLowerCase());
    const matchesPos = posFilter === "all" || p.positionCategory === posFilter;
    return matchesSearch && matchesPos;
  });

  const filterButtons: { key: PositionFilter; label: string; icon: React.JSX.Element }[] = [
    { key: "all", label: "Tümü", icon: <IconUsers className="text-slate-300" /> },
    { key: "defender", label: "Stoper", icon: <IconShield className="text-emerald-300" /> },
    { key: "midfielder", label: "Orta Saha", icon: <IconCompass className="text-sky-300" /> },
    { key: "forward", label: "Forvet", icon: <IconBall className="text-rose-300" /> },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 shadow-[0_0_40px_rgba(16,185,129,0.7)]" />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-sm font-semibold tracking-[0.22em] text-transparent">
                SCOUT INTELLIGENCE
              </span>
            </Link>
            <nav className="hidden items-center gap-6 text-xs font-medium text-slate-300 md:flex">
              <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-emerald-300">
                <IconHome /> Ana Sayfa
              </Link>
              <Link href="/listeler" className="flex items-center gap-1.5 transition-colors hover:text-emerald-300">
                <IconList /> Listeler
              </Link>
              <Link href="/radar" className="flex items-center gap-1.5 transition-colors hover:text-emerald-300">
                <IconRadar /> Radar
              </Link>
              <Link href="/oyuncular" className="flex items-center gap-1.5 text-emerald-300">
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

        <div className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
            <section className="mb-8">
              <div className="flex items-center gap-2">
                <IconUsers className="text-emerald-300" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-300/90">
                  Oyuncu Keşfi
                </p>
              </div>
              <h1 className="mt-3 bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
                Oyuncu Arama
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                İsim veya kulübe göre ara, pozisyon filtresini kullan. Her
                oyuncunun profil kartında yaş, kulüp, pozisyon ve tahmini
                piyasa değeri bilgisi yer alıyor.
              </p>
            </section>

            {/* Arama ve filtreler */}
            <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-sm flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <IconSearch />
                </span>
                <input
                  type="text"
                  placeholder="Oyuncu veya kulüp ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 py-2.5 pl-9 pr-4 text-xs text-slate-100 placeholder-slate-500 shadow-[0_10px_30px_rgba(15,23,42,0.9)] outline-none transition focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {filterButtons.map((f) => {
                  const isActive = posFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setPosFilter(f.key)}
                      className={[
                        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-all duration-150",
                        "backdrop-blur hover:-translate-y-[1px]",
                        isActive
                          ? "border-emerald-500/80 bg-emerald-500/20 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                          : "border-slate-700/90 bg-slate-900/80 text-slate-300 hover:border-emerald-500/60 hover:text-emerald-100",
                      ].join(" ")}
                    >
                      {f.icon} {f.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Oyuncu kartları */}
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 px-4 py-6 text-center text-sm text-slate-300">
                Arama kriterlerine uygun oyuncu bulunamadı.
              </div>
            )}

            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {filtered.map((player) => (
                <div
                  key={player.name}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.9)] transition hover:-translate-y-1 hover:border-emerald-500/70 hover:bg-slate-900/80"
                >
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/80 ring-1 ring-slate-700/80">
                        {positionIcon(player.positionCategory)}
                      </span>
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                          positionBadgeColor(player.positionCategory),
                        ].join(" ")}
                      >
                        {player.position}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-50">
                      {player.name}
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {player.club} • {player.age} yaş
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-emerald-300">
                      {player.value}
                    </span>
                    <button className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1 text-[10px] font-medium text-slate-200 transition hover:border-emerald-500/70 hover:text-emerald-200">
                      Profili Gör
                    </button>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>

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
