"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconList,
  IconShield,
  IconTrendUp,
  IconStar,
} from "../components/icons";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { supabase } from "@/lib/supabase";

type SupabaseContent = {
  id: string;
  title: string;
  slug: string;
  created_at: string;
};

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

const lists = [
  {
    slug: "en-iyi-10-genc-stoper",
    title: "En İyi 10 Genç Stoper",
    description: "Avrupa liglerinde 23 yaş altı modern stoper profiline uyan oyuncuların detaylı analizi.",
    icon: <IconShield className="text-emerald-300" />,
    accent: "#00d4aa",
  },
  {
    slug: "super-lig-gizli-isimler",
    title: "Süper Lig'in Gizli İsimleri",
    description: "Büyük kulüplerin radarına yeni yeni giren, veri tarafında öne çıkan isimler.",
    icon: <IconTrendUp className="text-sky-300" />,
    accent: "#22d3ee",
  },
  {
    slug: "surpriz-isimler-2025",
    title: "Bu Sezonun Sürpriz İsimleri",
    description: "2025 sezonunda beklentilerin üzerine çıkan, istatistiksel olarak sıçrama yapan oyuncular.",
    icon: <IconStar className="text-amber-300" />,
    accent: "#f59e0b",
  },
];

export default function ListsPage() {
  const [dbLists, setDbLists] = useState<SupabaseContent[]>([]);

  useEffect(() => {
    async function fetchLists() {
      const { data } = await supabase
        .from("contents")
        .select("id, title, slug, created_at")
        .eq("status", "yayinda")
        .eq("category", "listeler")
        .order("created_at", { ascending: false });
      if (data && data.length > 0) setDbLists(data);
    }
    fetchLists();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col">
        <SiteHeader activeNav="listeler" />

        <div className="flex-1">
          <motion.div
            className="mx-auto max-w-6xl px-4 py-8 lg:py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
          >
            {/* Sayfa başlığı */}
            <section className="mb-10">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-1 w-8 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-emerald-400/80">
                  Scout Gamer
                </p>
              </div>
              <h1 className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
                Kürasyonlu Listeler
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-400">
                Liglere, pozisyonlara ve yaş gruplarına göre kürasyonlu listeler.
                Her liste, veri ve scout gözlemlerini bir araya getirir.
              </p>
            </section>

            {/* DB'den gelen listeler */}
            {dbLists.length > 0 && (
              <motion.section
                className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {dbLists.map((item) => (
                  <motion.div key={item.id} variants={staggerChild}>
                    <Link
                      href={`/listeler/${item.slug}`}
                      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-500/25 bg-slate-950/80 transition hover:-translate-y-1 hover:border-emerald-500/60 hover:shadow-[0_0_30px_rgba(0,212,170,0.1)]"
                    >
                      {/* Accent çizgisi */}
                      <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <IconList className="text-emerald-300 opacity-70" />
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                            Yeni
                          </span>
                          <span className="ml-auto text-[10px] text-slate-500">
                            {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <h2 className="text-sm font-bold text-slate-50 transition group-hover:text-emerald-300">
                          {item.title}
                        </h2>
                        <div className="mt-auto pt-4 inline-flex items-center text-[11px] font-semibold text-emerald-400">
                          Listeyi Gör <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.section>
            )}

            {/* Statik listeler */}
            <motion.section
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {lists.map((list) => (
                <motion.div key={list.slug} variants={staggerChild}>
                  <Link
                    href={`/listeler/${list.slug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/70 transition hover:-translate-y-1 hover:border-slate-700/80 hover:shadow-[0_0_24px_rgba(15,23,42,0.8)]"
                  >
                    {/* Kategori accent çizgisi */}
                    <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${list.accent}, transparent)` }} />
                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-3 flex items-center gap-2">
                        {list.icon}
                        <span className="rounded-full border border-slate-700/60 bg-slate-900/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Liste
                        </span>
                      </div>
                      <h2 className="text-sm font-bold text-slate-50 transition group-hover:text-emerald-300">
                        {list.title}
                      </h2>
                      <p className="mt-2 text-[12px] leading-relaxed text-slate-400">
                        {list.description}
                      </p>
                      <div className="mt-auto pt-4 inline-flex items-center text-[11px] font-semibold text-slate-400 transition group-hover:text-emerald-300">
                        Listeyi Gör <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.section>
          </motion.div>
        </div>

        <SiteFooter maxWidth="max-w-6xl" />
      </div>
    </main>
  );
}
