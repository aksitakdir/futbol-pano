"use client";

import Link from "next/link";
import {
  IconList,
  IconRadar,
  IconUsers,
  IconBracket,
  IconTaktik,
} from "../components/icons";
import Breadcrumb from "../components/breadcrumb";

export default function TurnuvaPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
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
            <Link href="/taktik-lab" className="flex items-center gap-1.5 transition-colors hover:text-emerald-300">
              <IconTaktik /> Taktik Lab
            </Link>
            <Link href="/turnuva" className="flex items-center gap-1.5 text-[#00d4aa]">
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

      <div className="mx-auto max-w-7xl px-4 py-3">
        <Breadcrumb items={[{ label: "Turnuva" }]} />
      </div>

      <iframe
        src="/ucl-bracket.html"
        className="flex-1 border-none"
        style={{ minHeight: "calc(100vh - 97px)" }}
        title="Gelecek Yıldızlar Turnuvası"
      />
    </main>
  );
}
