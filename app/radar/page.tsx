"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import CategoryHero from "../components/category-hero";
import { supabase } from "@/lib/supabase";
import { stripHtml, estimateReadMinutes } from "@/lib/utils";

type SupabaseContent = { id: string; title: string; slug: string; content: string; created_at: string; };

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } } };

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
            <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" variants={stagger} initial="hidden" animate="visible">
              {articles.map((article) => (
                <motion.div key={article.id} variants={fadeUp}>
                  <Link href={`/radar/${article.slug}`}
                    className="sg-lift group flex flex-col h-full"
                    style={{ background: "var(--ink-800)", border: "1px solid var(--ink-700)", borderRadius: 4, overflow: "hidden", cursor: "pointer" }}>
                    {/* Kart üst — stripe texture arka plan */}
                    <div style={{ height: 160, position: "relative", overflow: "hidden", background: "linear-gradient(140deg, var(--ink-700) 0%, var(--ink-800) 100%)" }}>
                      <div style={{ position: "absolute", inset: 0, opacity: 0.4, backgroundImage: "repeating-linear-gradient(-45deg, var(--ink-700) 0 8px, var(--ink-800) 8px 16px)" }} />
                      {/* Kategori ve tarih */}
                      <div style={{ position: "absolute", bottom: 12, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--accent)" }}>RADAR</span>
                        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--ink-400)" }}>
                          {new Date(article.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    {/* İnce accent çizgisi */}
                    <div style={{ height: 2, background: "var(--accent)" }} />
                    {/* İçerik */}
                    <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                      <h2 className="display" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 10px", color: "var(--ink-100)", lineHeight: 1.2 }}>
                        {article.title}
                      </h2>
                      <p style={{ fontSize: 13, color: "var(--ink-300)", lineHeight: 1.55, flex: 1 }}>
                        {stripHtml(article.content).replace(/\s+/g, " ").trim().slice(0, 120)}…
                      </p>
                      <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--ink-400)" }}>
                          {estimateReadMinutes(article.content)} DK OKUMA
                        </span>
                        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--accent)" }}>OKU →</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
            </>
          )}
        </div>
      </motion.div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
