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
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

const CARD_STYLES = [
  { Icon: IconBall, ring: "ring-rose-500/40 bg-rose-500/10", iconClass: "text-rose-300" },
  { Icon: IconTrendUp, ring: "ring-emerald-500/40 bg-emerald-500/10", iconClass: "text-emerald-300" },
  { Icon: IconCompass, ring: "ring-cyan-500/40 bg-cyan-500/10", iconClass: "text-cyan-300" },
  { Icon: IconStar, ring: "ring-amber-500/40 bg-amber-500/10", iconClass: "text-amber-300" },
] as const;

function cardSummary(content: string): string {
  const t = stripHtml(content).replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length > 220 ? `${t.slice(0, 220)}…` : t;
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
                Tüm metinler yönetim panelinden yayınlanır; kartlar güncel veritabanı
                içeriğinizi yansıtır. Düzenlemek için panelde{" "}
                <strong className="text-slate-200">Radar</strong> bölümünü kullanın.
              </p>
            </section>

            {loading ? (
              <div className="flex justify-center py-20 text-sm text-slate-400">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              </div>
            ) : articles.length === 0 ? (
              <section className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/50 px-6 py-14 text-center">
                <IconRadar className="mx-auto mb-3 h-10 w-10 text-slate-600" />
                <p className="text-sm font-medium text-slate-300">
                  Henüz yayında radar yazısı yok
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Admin panelinde <span className="text-slate-400">Radar</span> kategorisinde içerik
                  oluşturup <span className="text-slate-400">Yayınla</span> durumuna alın; kartlar burada
                  otomatik listelenir.
                </p>
              </section>
            ) : (
              <motion.section
                className="grid gap-5 md:grid-cols-2"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {articles.map((article, index) => {
                  const style = CARD_STYLES[index % CARD_STYLES.length];
                  const Icon = style.Icon;
                  const readMins = estimateReadMinutes(article.content);
                  const summary = cardSummary(article.content);

                  return (
                    <motion.div key={article.id} variants={staggerChild} className="min-h-0">
                      <Link
                        href={`/radar/${article.slug}`}
                        className="group flex h-full flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.9)] transition hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-slate-900/80"
                      >
                        <div>
                          <div className="mb-3 flex items-center gap-3">
                            <span
                              className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${style.ring}`}
                            >
                              <Icon className={style.iconClass} />
                            </span>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                              <span>
                                {new Date(article.created_at).toLocaleDateString("tr-TR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <IconClock />
                                {readMins} dk
                              </span>
                            </div>
                          </div>
                          <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-50">
                            {article.title}
                          </h2>
                          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-300">
                            {summary || "Özet için içeriğe giriş ekleyin."}
                          </p>
                        </div>
                        <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-300">
                          Oku
                          <IconArrowRight className="transition-transform group-hover:translate-x-0.5" />
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
