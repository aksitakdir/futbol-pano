"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconRadar,
  IconClock,
  IconArrowRight,
  IconBall,
  IconTrendUp,
  IconCompass,
  IconStar,
} from "../components/icons";
import SiteHeader from "../components/site-header";
import { supabase } from "@/lib/supabase";
import { stripHtml } from "@/lib/utils";

type SupabaseContent = {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
};

const STATIC_ARTICLES = [
  {
    title: "Premier Lig'de Gölgede Kalanlar",
    slug: "premier-lig-golgede-kalanlar",
    date: "10 Mart 2026",
    readTime: "7 dk",
    summary:
      "Skor tabelasına düzenli yansımayan ancak xG, koşu kalitesi ve baskı altında bitiricilik metrikleriyle scout ekranlarında öne çıkan genç forvetleri inceliyoruz.",
    icon: <IconBall className="text-rose-300" />,
  },
  {
    title: "Süper Lig Mart Raporu",
    slug: "super-lig-mart-raporu",
    date: "7 Mart 2026",
    readTime: "6 dk",
    summary:
      "Süper Lig'de mart ayında form grafiğini yukarı çeken genç oyuncular, pozisyon bazlı istatistikler ve dikkat çeken taktik trendler.",
    icon: <IconTrendUp className="text-emerald-300" />,
  },
  {
    title: "Transferde İzlenecekler",
    slug: "transferde-izlenecekler",
    date: "3 Mart 2026",
    readTime: "8 dk",
    summary:
      "Yaz transfer penceresi öncesinde fiyat/performans oranında en iyi genç oyuncu profilleri ve potansiyel hedef kulüpler.",
    icon: <IconCompass className="text-cyan-300" />,
  },
  {
    title: "U21 Avrupa'nın En İyileri",
    slug: "u21-avrupanin-en-iyileri",
    date: "28 Şubat 2026",
    readTime: "9 dk",
    summary:
      "Avrupa'nın beş büyük liginde 21 yaş altı oyuncuların sezon bazlı performans karşılaştırması, öne çıkan isimler ve gelişim eğrileri.",
    icon: <IconStar className="text-amber-300" />,
  },
];

export default function RadarPage() {
  const [dbArticles, setDbArticles] = useState<SupabaseContent[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchRadar() {
      const { data } = await supabase
        .from("contents")
        .select("id, title, slug, content, created_at")
        .eq("status", "yayinda")
        .eq("category", "radar")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setDbArticles(data);
      }
      setLoaded(true);
    }
    fetchRadar();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col">
        <SiteHeader activeNav="radar" />

        <div className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
            <section className="mb-8">
              <div className="flex items-center gap-2">
                <IconRadar className="text-emerald-300" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-300/90">
                  Haftalık Radar
                </p>
              </div>
              <h1 className="mt-3 bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
                Radar Yazı Arşivi
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Her hafta güncellenen scout radar yazıları. Gölgede kalan
                yetenekler, taktik trendler, transfer hedefleri ve pozisyon
                bazlı derinlemesine analizler.
              </p>
            </section>

            {/* Supabase articles */}
            {dbArticles.length > 0 && (
              <section className="mb-8 grid gap-5 md:grid-cols-2">
                {dbArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/radar/${article.slug}`}
                    className="group flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-slate-950/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.9)] transition hover:-translate-y-1 hover:border-emerald-500/70 hover:bg-slate-900/80"
                  >
                    <div>
                      <div className="mb-3 flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/40">
                          <IconRadar className="text-emerald-300" />
                        </span>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span>
                            {new Date(article.created_at).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                            Yeni
                          </span>
                        </div>
                      </div>
                      <h2 className="text-sm font-semibold text-slate-50">
                        {article.title}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-300">
                        {stripHtml(article.content).trim().slice(0, 150)}…
                      </p>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-300">
                      Oku
                      <IconArrowRight className="transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                ))}
              </section>
            )}

            {/* Static fallback articles */}
            <section className="grid gap-5 md:grid-cols-2">
              {STATIC_ARTICLES.map((article) => (
                <div
                  key={article.title}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.9)] transition hover:-translate-y-1 hover:border-emerald-500/70 hover:bg-slate-900/80"
                >
                  <div>
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/80 ring-1 ring-slate-700/80">
                        {article.icon}
                      </span>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>{article.date}</span>
                        <span className="flex items-center gap-1">
                          <IconClock /> {article.readTime}
                        </span>
                      </div>
                    </div>
                    <h2 className="text-sm font-semibold text-slate-50">
                      {article.title}
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">
                      {article.summary}
                    </p>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-300">
                    Oku
                    <IconArrowRight className="transition-transform group-hover:translate-x-0.5" />
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
