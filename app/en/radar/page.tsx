"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconClock } from "../../components/icons";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import { supabase } from "@/lib/supabase";
import { stripHtml, estimateReadMinutes } from "@/lib/utils";

type Content = { id: string; title: string; title_en?: string; slug: string; content: string; created_at: string };

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } } };
const ACCENTS = ["var(--sg-primary)", "var(--sg-secondary)", "var(--sg-tertiary)", "var(--sg-amber)"];

export default function EnRadarPage() {
  const [articles, setArticles] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("contents")
      .select("id,title,title_en,slug,content,created_at")
      .eq("status", "yayinda")
      .eq("category", "radar")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setArticles(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="radar" />
      <motion.div className="pt-[72px]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: easeOut }}>
        <div className="relative mx-auto max-w-7xl overflow-hidden px-8 py-20">
          <div
            className="pointer-events-none absolute -right-40 -top-20 h-96 w-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, var(--sg-primary) 0%, transparent 70%)", filter: "blur(120px)" }}
          />
          <div className="relative max-w-3xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-[2px] w-12" style={{ background: "var(--sg-primary)" }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--sg-primary)", fontFamily: "var(--font-headline)" }}>
                Weekly Radar
              </span>
            </div>
            <h1 className="mb-5 font-bold leading-none tracking-tighter" style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
              Radar <span style={{ color: "var(--sg-primary)" }}>Archive</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed" style={{ color: "var(--sg-text-secondary)" }}>
              Weekly player analyses, undiscovered talents and in-depth scouting reports.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-8 pb-20">
          {loading ? (
            <div className="flex justify-center py-20">
              <span
                className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: "var(--sg-primary)", borderTopColor: "transparent" }}
              />
            </div>
          ) : (
            <motion.div className="grid gap-4 md:grid-cols-2" variants={stagger} initial="hidden" animate="visible">
              {articles.map((article, index) => {
                const accent = ACCENTS[index % ACCENTS.length];
                const hasEn = !!article.title_en;
                return (
                  <motion.div key={article.id} variants={fadeUp}>
                    <Link
                      href={`/en/radar/${article.slug}`}
                      className="group flex h-full flex-col transition hover:-translate-y-0.5"
                      style={{ background: "var(--sg-surface)", borderLeft: `3px solid ${accent}` }}
                    >
                      <div className="flex flex-1 flex-col p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: accent, fontFamily: "var(--font-headline)" }}>
                            Radar
                          </span>
                          <div className="flex items-center gap-3">
                            {!hasEn && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase" style={{ background: "rgba(249,189,34,0.15)", color: "var(--sg-amber)", fontFamily: "var(--font-headline)" }}>
                                Coming Soon
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--sg-text-muted)" }}>
                              <IconClock /> {estimateReadMinutes(article.content)} min
                            </span>
                          </div>
                        </div>
                        <h2 className="mb-3 line-clamp-2 text-sm font-bold leading-snug" style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}>
                          {article.title_en || article.title}
                        </h2>
                        <p className="mb-4 line-clamp-3 text-xs leading-relaxed" style={{ color: "var(--sg-text-secondary)" }}>
                          {stripHtml(article.content).replace(/\s+/g, " ").trim().slice(0, 160)}…
                        </p>
                        <div className="mt-auto inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: accent, fontFamily: "var(--font-headline)" }}>
                          Read <span className="transition-transform group-hover:translate-x-0.5">→</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </motion.div>
      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
