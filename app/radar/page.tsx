"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
import SiteFooter from "../components/site-footer";
import { supabase } from "@/lib/supabase";
import { stripHtml, estimateReadMinutes } from "@/lib/utils";

type SupabaseContent = {
  id: string;
  title: string;
  slug: string;
  content: string;
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

const CARD_ACCENTS = [
  { accent: "#00d4aa", iconBg: "bg-emerald-500/10 ring-emerald-500/30", Icon: IconBall, iconClass: "text-emerald-300" },
  { accent: "#22d3ee", iconBg: "bg-cyan-500/10 ring-cyan-500/30", Icon: IconTrendUp, iconClass: "text-cyan-300" },
  { accent: "#a78bfa", iconBg: "bg-violet-500/10 ring-violet-500/30", Icon: IconCompass, iconClass: "text-violet-300" },
  { accent: "#f59e0b", iconBg: "bg-amber-500/10 ring-amber-500/30", Icon: IconStar, iconClass: "text-amber-300" },
] as const;

function cardSummary(content: string): string {
  const t = stripHtml(content).replace(/\s+/g, " ").trim();
  return t.length > 180 ? `${t.slice(0, 180)}…` : t;
}

export default function RadarPage() {
  const [articles, setArticles] = useState<SupabaseContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRadar() {
      const { data, error } = await supabase
        .from("contents")
        .select("id, title, slug, content, created_at")
        .eq("status", "yayinda")
        .eq("category", "radar")
        .order("created_at", { ascending: false });
      if (error) console.error("Radar fetch:", error);
      setArticles(data ?? []);
      setLoading(false);
    }
    fetchRadar();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col">
        <SiteHeader activeNav="radar" />

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
              <div className="flex items-center gap-3">
                <IconRadar className="text-emerald-300 h-7 w-7" />
                <h1 className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
                  Radar Arşivi
                </h1>
              </div>
              <p className="mt-3 max-w-2xl text-sm text-slate-400">
                Haftalık oyuncu analizleri, keşfedilmemiş yetenekler ve scout perspektifinden derinlemesine incelemeler.
              </p>
            </section>

            {loading ? (
              <div className="flex justify-center py-20">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              </div>
            ) : articles.length === 0 ? (
              <section className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-950/50 px-6 py-14 text-center">
                <IconRadar className="mx-auto mb-3 h-10 w-10 text-slate-600" />
                <p className="text-sm text-slate-400">Henüz yayında radar yazısı yok.</p>
              </section>
            ) : (
              <motion.section
                className="grid gap-4 md:grid-cols-2"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {articles.map((article, index) => {
                  const style = CARD_ACCENTS[index % CARD_ACCENTS.length];
                  const Icon = style.Icon;
                  const readMins = estimateReadMinutes(article.content);
                  const summary = cardSummary(article.content);

                  return (
                    <motion.div key={article.id} variants={staggerChild}>
                      <Link
                        href={`/radar/${article.slug}`}
                        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/70 transition hover:-translate-y-1 hover:border-slate-700/60 hover:shadow-[0_0_30px_rgba(15,23,42,0.9)]"
                      >
                        {/* Accent çizgisi */}
                        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${style.accent}, transparent)` }} />

                        <div className="flex flex-1 flex-col p-5">
                          {/* Üst meta */}
                          <div className="mb-4 flex items-center gap-3">
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${style.iconBg}`}>
                              <Icon className={style.iconClass} />
                            </span>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                              <span>
                                {new Date(article.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                              </span>
                              <span className="flex items-center gap-1">
                                <IconClock /> {readMins} dk
                              </span>
                            </div>
                            {/* Radar badge */}
                            <span className="ml-auto rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                              Radar
                            </span>
                          </div>

                          <h2 className="line-clamp-2 text-sm font-bold leading-snug text-slate-50 transition group-hover:text-emerald-300">
                            {article.title}
                          </h2>
                          <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-slate-400">
                            {summary || "İçeriği görüntülemek için tıklayın."}
                          </p>

                          <div className="mt-auto pt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                            Oku
                            <IconArrowRight className="transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.section>
            )}
          </motion.div>
        </div>

        <SiteFooter maxWidth="max-w-6xl" />
      </div>
    </main>
  );
}
