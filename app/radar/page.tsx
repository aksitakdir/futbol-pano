"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { supabase } from "@/lib/supabase";
import { stripHtml, estimateReadMinutes } from "@/lib/utils";

type Content = { id: string; title: string; slug: string; content: string; created_at: string; };

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } } };

const ACCENTS = ["var(--emerald)", "var(--cyan)", "var(--sky)", "var(--amber)", "var(--rose)"];

export default function RadarPage() {
  const [articles, setArticles] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("contents").select("id,title,slug,content,created_at")
      .eq("status", "yayinda").eq("category", "radar").order("created_at", { ascending: false })
      .then(({ data }) => { setArticles(data ?? []); setLoading(false); });
  }, []);

  return (
    <main style={{ background: "var(--ink-900)", color: "var(--ink-100)", minHeight: "100vh" }}>
      <SiteHeader activeNav="radar" />

      {/* Header */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "120px 32px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "end" }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>HAFTALIK ANALİZ</p>
            <h1 className="display" style={{ fontSize: "clamp(56px, 8vw, 100px)", fontWeight: 700, letterSpacing: "-0.04em", margin: 0, lineHeight: 0.9, color: "var(--accent)" }}>
              Radar
            </h1>
          </div>
          <p style={{ fontSize: 18, color: "var(--ink-200)", lineHeight: 1.5, margin: 0 }}>
            Tek oyuncu odaklı haftalık analizler. Veriler, taktikler ve oyun stilleri.
          </p>
        </div>
      </div>

      {/* İçerik */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 32px 80px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          </div>
        ) : articles.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--ink-400)", padding: "80px 0", textAlign: "center" }}>Henüz yayında radar yazısı yok.</p>
        ) : (
          <motion.div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}
            variants={stagger} initial="hidden" animate="visible">
            {articles.map((article, index) => {
              const accent = ACCENTS[index % ACCENTS.length];
              return (
                <motion.div key={article.id} variants={fadeUp}>
                  <Link href={`/radar/${article.slug}`} className="sg-lift"
                    style={{ background: "var(--ink-800)", border: "1px solid var(--ink-700)", borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
                    {/* Üst görsel alan */}
                    <div style={{ height: 180, position: "relative", overflow: "hidden", background: "linear-gradient(140deg, var(--ink-700) 0%, var(--ink-800) 100%)" }}>
                      <div className="sg-stripe" style={{ position: "absolute", inset: 0, opacity: 0.4 }} />
                      <div style={{ position: "absolute", bottom: 12, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: accent }}>RADAR</span>
                        <span className="mono" style={{ fontSize: 10, color: "var(--ink-400)" }}>
                          {new Date(article.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    {/* Accent çizgisi */}
                    <div style={{ height: 2, background: accent }} />
                    {/* İçerik */}
                    <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                      <h2 className="display" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 10px", lineHeight: 1.2, color: "var(--ink-100)" }}>
                        {article.title}
                      </h2>
                      <p style={{ fontSize: 13, color: "var(--ink-300)", lineHeight: 1.55, flex: 1 }}>
                        {stripHtml(article.content).replace(/\s+/g, " ").trim().slice(0, 120)}…
                      </p>
                      <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--ink-700)", paddingTop: 12 }}>
                        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--ink-400)" }}>
                          {estimateReadMinutes(article.content)} DK OKUMA
                        </span>
                        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: accent }}>OKU →</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
