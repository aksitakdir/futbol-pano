"use client";

import Link from "next/link";

const lists = [
  {
    slug: "en-iyi-10-genc-stoper",
    title: "En İyi 10 Genç Stoper",
    description:
      "Avrupa liglerinde 23 yaş altı modern stoper profiline uyan oyuncuların detaylı analizi.",
  },
  {
    slug: "super-lig-gizli-isimler",
    title: "Süper Lig'in Gizli İsimleri",
    description:
      "Büyük kulüplerin radarına yeni yeni giren, veri tarafında öne çıkan isimler.",
  },
  {
    slug: "surpriz-isimler-2025",
    title: "Bu Sezonun Sürpriz İsimleri",
    description:
      "2025 sezonunda beklentilerin üzerine çıkan, istatistiksel olarak sıçrama yapan oyuncular.",
  },
  {
    slug: "en-degerli-u20-oyuncular",
    title: "En Değerli U20 Oyuncular",
    description:
      "Piyasa değeri, potansiyel ve gelişim eğrisi ile dikkat çeken U20 yıldız adayları.",
  },
  {
    slug: "bundesliga-gelecek-yildizlari",
    title: "Bundesliga'nın Gelecek Yıldızları",
    description:
      "Almanya'da top koşturan ve önümüzdeki 3 yıl içinde patlama beklenen gençler.",
  },
  {
    slug: "premier-lig-genc-yetenekler",
    title: "Premier Lig Genç Yetenekler",
    description:
      "İngiltere'nin en üst seviyesinde süre almaya başlayan genç ve dinamik profil oyuncular.",
  },
];

export default function ListsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 shadow-[0_0_40px_rgba(16,185,129,0.7)]" />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-sm font-semibold tracking-[0.22em] text-transparent">
                SCOUT INTELLIGENCE
              </span>
            </div>
            <nav className="hidden items-center gap-8 text-xs font-medium text-slate-300 md:flex">
              <Link href="/" className="transition-colors hover:text-emerald-300">
                Ana Sayfa
              </Link>
              <span className="text-emerald-300">Listeler</span>
              <span className="text-slate-500">Radar</span>
              <span className="text-slate-500">Oyuncular</span>
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-300/90">
                Kürasyonlu Listeler
              </p>
              <h1 className="mt-3 bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
                Scout Intelligence Liste Arşivi
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Liglere, pozisyonlara ve yaş gruplarına göre kürasyonlu listeler.
                Her liste, veri ve scout gözlemlerini bir araya getirerek
                oyuncuları daha iyi konumlandırmana yardımcı olur.
              </p>
            </section>

            <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {lists.map((list) => (
                <Link
                  key={list.slug}
                  href={`/listeler/${list.slug}`}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/70 px-4 py-4 text-left shadow-[0_18px_60px_rgba(15,23,42,0.9)] transition hover:-translate-y-1 hover:border-emerald-500/70 hover:bg-slate-900/80"
                >
                  <div>
                    <span className="mb-2 inline-flex rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                      Liste
                    </span>
                    <h2 className="text-sm font-semibold text-slate-50">
                      {list.title}
                    </h2>
                    <p className="mt-2 text-xs text-slate-300">
                      {list.description}
                    </p>
                  </div>
                  <div className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-300">
                    Listeyi Gör
                    <span className="ml-1 transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </div>
                </Link>
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

