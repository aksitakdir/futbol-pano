"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconList,
  IconRadar,
  IconUsers,
  IconBracket,
  IconTaktik,
  IconShield,
  IconBall,
  IconCompass,
  IconArrowRight,
} from "../components/icons";
import Breadcrumb from "../components/breadcrumb";
import { supabase } from "@/lib/supabase";

type SupabaseContent = {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
};

type Archetype = {
  name: string;
  description: string;
  position: "Orta Saha" | "Defans" | "Hücum";
};

const ARCHETYPES: Archetype[] = [
  {
    name: "Box-to-Box Engine",
    description: "Savunmadan hücuma köprü kuran modern orta saha motoru",
    position: "Orta Saha",
  },
  {
    name: "Ball-Playing CB",
    description: "Oyun kurucu gibi davranan modern stoper",
    position: "Defans",
  },
  {
    name: "Inverted Winger",
    description: "İçe kesip gol tehlikesi yaratan kanat oyuncusu",
    position: "Hücum",
  },
  {
    name: "Inverted Full-back",
    description: "Orta sahaya kayarak üstünlük sağlayan modern bek",
    position: "Defans",
  },
  {
    name: "False 9",
    description: "Düşerek alan açan ve oyun kuran modern forvet",
    position: "Hücum",
  },
  {
    name: "High Press Striker",
    description: "Savunmayı tepeden başlatan pressing forveti",
    position: "Hücum",
  },
];

function positionStyle(pos: Archetype["position"]) {
  switch (pos) {
    case "Orta Saha":
      return { bg: "bg-sky-500/15", text: "text-sky-300", border: "border-sky-500/30" };
    case "Defans":
      return { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/30" };
    case "Hücum":
      return { bg: "bg-rose-500/15", text: "text-rose-300", border: "border-rose-500/30" };
  }
}

function positionIcon(pos: Archetype["position"]) {
  switch (pos) {
    case "Orta Saha":
      return <IconCompass className="text-sky-300" />;
    case "Defans":
      return <IconShield className="text-emerald-300" />;
    case "Hücum":
      return <IconBall className="text-rose-300" />;
  }
}

export default function TaktikLabPage() {
  const [dbContents, setDbContents] = useState<SupabaseContent[]>([]);

  useEffect(() => {
    async function fetchTaktik() {
      const { data } = await supabase
        .from("contents")
        .select("id, title, slug, content, created_at")
        .eq("status", "yayinda")
        .eq("category", "taktik-lab")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setDbContents(data);
      }
    }
    fetchTaktik();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 shadow-[0_0_40px_rgba(16,185,129,0.7)]" />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-sm font-semibold tracking-[0.22em] text-transparent">
              SCOUT INTELLIGENCE
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-xs font-medium text-slate-300 md:flex">
            <Link href="/listeler" className="flex items-center gap-1.5 transition-colors hover:text-emerald-300">
              <IconList /> Listeler
            </Link>
            <Link href="/radar" className="flex items-center gap-1.5 transition-colors hover:text-emerald-300">
              <IconRadar /> Radar
            </Link>
            <Link href="/oyuncular" className="flex items-center gap-1.5 transition-colors hover:text-emerald-300">
              <IconUsers /> Oyuncular
            </Link>
            <Link href="/taktik-lab" className="flex items-center gap-1.5 text-emerald-300">
              <IconTaktik /> Taktik Lab
            </Link>
            <Link href="/turnuva" className="flex items-center gap-1.5 transition-colors hover:text-emerald-300">
              <IconBracket /> Turnuva
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

      <div className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
        <div className="mb-6">
          <Breadcrumb items={[{ label: "Taktik Lab" }]} />
        </div>
        <section className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 ring-2 ring-emerald-500/40">
            <IconTaktik className="text-emerald-300" />
          </div>
          <h1 className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
            Taktik Lab
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Modern futbolun pozisyon arketiplerini keşfet
          </p>
        </section>

        {dbContents.length > 0 && (
          <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dbContents.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col rounded-2xl border border-emerald-500/30 bg-slate-950/60 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.8)] transition hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-slate-900/80"
              >
                <div className="mb-3 flex items-center gap-2">
                  <IconTaktik className="text-emerald-300" />
                  <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    Yeni
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(item.created_at).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold tracking-tight text-slate-50">
                  {item.title}
                </h2>
                <p className="mt-1.5 flex-1 line-clamp-3 text-sm leading-relaxed text-slate-400">
                  {item.content.slice(0, 140)}…
                </p>
                <span className="mt-4 inline-flex items-center self-start text-xs font-semibold text-emerald-300 transition group-hover:text-emerald-200">
                  Detayları Gör
                  <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ARCHETYPES.map((arch) => {
            const style = positionStyle(arch.position);
            return (
              <div
                key={arch.name}
                className="group flex flex-col rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.8)] transition hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-slate-900/80"
              >
                <div className="mb-3 flex items-center gap-2">
                  {positionIcon(arch.position)}
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${style.bg} ${style.text} ${style.border}`}
                  >
                    {arch.position}
                  </span>
                </div>

                <h2 className="text-lg font-extrabold tracking-tight text-slate-50">
                  {arch.name}
                </h2>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-400">
                  {arch.description}
                </p>

                <button className="mt-4 inline-flex items-center self-start text-xs font-semibold text-emerald-300 transition group-hover:text-emerald-200">
                  Detayları Gör
                  <span className="ml-1 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="border-t border-slate-800/80 bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-400 sm:flex-row">
          <span className="font-medium text-slate-300">Scout Intelligence</span>
          <div className="flex items-center gap-4">
            <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
            <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
            <span className="h-6 w-6 rounded-full border border-slate-700/80 bg-slate-900/80" />
          </div>
          <span className="text-[11px] text-slate-500">© 2026 Scout Intelligence</span>
        </div>
      </footer>
    </main>
  );
}
