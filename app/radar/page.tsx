"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconClock } from "../components/icons";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import CategoryHero from "../components/category-hero";
import { supabase } from "@/lib/supabase";
import { stripHtml, estimateReadMinutes } from "@/lib/utils";

type SupabaseContent = { id: string; title: string; slug: string; content: string; created_at: string; };

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } } };

function summary(content: string, max = 160): string {
  const t = stripHtml(content).replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export default function RadarPage() {
  const [articles, setArticles] = useState<SupabaseContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("contents").select("id,title,slug,content,created_at")
      .eq("status", "yayinda").eq("category", "radar").order("created_at", { ascending: false })
      .then(({ data }) => { setArticles(data ?? []); setLoading(false); });
  }, []);

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="radar" />

      <motion.div className="pt-[72px]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: easeOut }}>

        <CategoryHero accent="var(--sg-primary)">
          <div className="max-w-3xl">
            <p className="eyebrow" style={{ marginBottom: 12 }}>Haftalık Radar</p>
            <h1 className="display" style={{ fontSize: "clamp(3rem, 8vw, 84px)", fontWeight: 700, lineHeight: 0.92, letterSpacing: "-0.04em", margin: "0 0 20px" }}>
              Radar <span style={{ color: "var(--accent)" }}>Arşivi</span>
            </h1>
            <p style={{ fontSize: 18, color: "var(--ink-200)", lineHeight: 1.5, maxWidth: 540, margin: 0 }}>
              Haftalık oyuncu analizleri, keşfedilmemiş yetenekler ve scout perspektifinden derinlemesine incelemeler.
            </p>
          </div>
        </CategoryHero>

        <div className="max-w-7xl mx-auto px-8 pt-16 pb-20">
          {loading ? (
            <div className="flex justify-center py-20">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: "var(--sg-primary)", borderTopColor: "transparent" }} />
            </div>
          ) : articles.length === 0 ? (
            <div className="py-20 text-center" style={{ color: "var(--sg-text-muted)" }}>
              <p className="text-sm">Henüz yayında radar yazısı yok.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1" style={{ background: "rgba(26,58,92,0.5)" }} />
                <p className="text-[10px] font-bold uppercase tracking-[0.25em]"
                  style={{ color: "var(--sg-primary)", fontFamily: "var(--font-headline)" }}>Güncel Radarlar</p>
                <div className="h-px flex-1" style={{ background: "rgba(26,58,92,0.5)" }} />
              </div>
            <motion.div className="grid gap-4 md:grid-cols-2" variants={stagger} initial="hidden" animate="visible">
              {articles.map((article, index) => {
                const readMins = estimateReadMinutes(article.content);
                const sum = summary(article.content);
                // Dört renk rotasyonu
                const accents = ["var(--sg-primary)", "var(--sg-secondary)", "var(--sg-tertiary)", "var(--sg-amber)"];
                const accent = accents[index % accents.length];

                return (
                  <motion.div key={article.id} variants={fadeUp}>
                    <Link href={`/radar/${article.slug}`}
                      className="group flex flex-col h-full transition hover:-translate-y-0.5"
                      style={{ background: "var(--ink-800)", border: "1px solid var(--ink-700)", borderLeft: `3px solid ${accent}` }}>
                      <div className="flex flex-1 flex-col p-5">
                        {/* Meta */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em]"
                            style={{ color: accent, fontFamily: "var(--font-headline)" }}>Radar</span>
                          <div className="flex items-center gap-3 text-[10px]" style={{ color: "var(--sg-text-muted)" }}>
                            <span>{new Date(article.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}</span>
                            <span className="flex items-center gap-1"><IconClock /> {readMins} dk</span>
                          </div>
                        </div>

                        <h2 className="text-sm font-bold leading-snug mb-3 transition line-clamp-2"
                          style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}>
                          {article.title}
                        </h2>
                        <p className="text-xs leading-relaxed line-clamp-3 mb-4" style={{ color: "var(--sg-text-secondary)" }}>
                          {sum || "İçeriği görüntülemek için tıklayın."}
                        </p>

                        <div className="mt-auto inline-flex items-center gap-1 text-[11px] font-bold"
                          style={{ color: accent, fontFamily: "var(--font-headline)" }}>
                          Detayları Gör <span className="transition-transform group-hover:translate-x-0.5">→</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
            </>
          )}
        </div>
      </motion.div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
