import Link from "next/link";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import Breadcrumb from "../components/breadcrumb";
import { ARENA_BRACKETS, arenaPath } from "@/lib/arena-brackets";

const ACCENTS = [
  "from-emerald-500/20 to-cyan-500/10 border-emerald-500/40 hover:border-emerald-400/70 hover:shadow-[0_20px_50px_rgba(16,185,129,0.2)]",
  "from-sky-500/20 to-indigo-500/10 border-sky-500/40 hover:border-sky-400/70 hover:shadow-[0_20px_50px_rgba(56,189,248,0.18)]",
  "from-violet-500/20 to-fuchsia-500/10 border-violet-500/40 hover:border-violet-400/70 hover:shadow-[0_20px_50px_rgba(167,139,250,0.2)]",
  "from-rose-500/15 to-amber-500/10 border-rose-500/35 hover:border-rose-400/60 hover:shadow-[0_20px_50px_rgba(244,63,94,0.15)]",
  "from-amber-500/15 to-orange-500/10 border-amber-500/40 hover:border-amber-400/65 hover:shadow-[0_20px_50px_rgba(251,191,36,0.15)]",
];

const ICONS = ["⭐", "🏆", "📋", "🇹🇷", "🌍"];

export default function ArenaHomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <SiteHeader activeNav="arena" maxWidth="max-w-7xl" />

      <div className="mx-auto w-full max-w-7xl px-4 py-3">
        <Breadcrumb items={[{ label: "Oyna & Paylaş" }]} />
      </div>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12">
        <div className="mb-10 text-center">
          <h1 className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
            Oyna & Paylaş
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
            Bir bracket seç, kazananları işaretle, şampiyonunu paylaş. Şampiyonlar Ligi dışındaki formatlarda
            eşleşmeler her açılışta yeniden karışır.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {ARENA_BRACKETS.map((b, i) => (
            <Link
              key={b.slug}
              href={arenaPath(b.slug)}
              className={[
                "group flex flex-col rounded-2xl border bg-gradient-to-br p-6 shadow-[0_12px_40px_rgba(15,23,42,0.85)] transition-all duration-300",
                "hover:-translate-y-1",
                ACCENTS[i % ACCENTS.length],
              ].join(" ")}
            >
              <span className="mb-3 text-3xl" aria-hidden>
                {ICONS[i % ICONS.length]}
              </span>
              <h2 className="text-lg font-bold text-slate-50 transition group-hover:text-emerald-200 md:text-xl">
                {b.cardTitle}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{b.cardDescription}</p>
              <span className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500/90 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition group-hover:bg-emerald-400">
                Oyna
              </span>
            </Link>
          ))}
        </div>
      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
