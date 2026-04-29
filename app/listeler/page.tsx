"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { IconShield, IconTrendUp, IconStar } from "../components/icons";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import CategoryHero from "../components/category-hero";
import { supabase } from "@/lib/supabase";

type SupabaseContent = { id: string; title: string; slug: string; created_at: string; };

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } } };

const STATIC_LISTS = [
  { slug: "en-iyi-10-genc-stoper", title: "En İyi 10 Genç Stoper", description: "Avrupa liglerinde 23 yaş altı modern stoper profiline uyan oyuncuların detaylı analizi.", icon: <IconShield />, color: "var(--sg-primary)" },
  { slug: "super-lig-gizli-isimler", title: "Süper Lig'in Gizli İsimleri", description: "Büyük kulüplerin radarına yeni yeni giren, veri tarafında öne çıkan isimler.", icon: <IconTrendUp />, color: "var(--sg-secondary)" },
  { slug: "surpriz-isimler-2025", title: "Bu Sezonun Sürpriz İsimleri", description: "2025 sezonunda beklentilerin üzerine çıkan, istatistiksel olarak sıçrama yapan oyuncular.", icon: <IconStar />, color: "var(--sg-amber)" },
];

export default function ListsPage() {
  const [dbLists, setDbLists] = useState<SupabaseContent[]>([]);

  useEffect(() => {
    supabase.from("contents").select("id,title,slug,created_at").eq("status", "yayinda").eq("category", "listeler").order("created_at", { ascending: false })
      .then(({ data }) => { if (data?.length) setDbLists(data); });
  }, []);

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="listeler" />

      <motion.div className="pt-[72px]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: easeOut }}>

        <CategoryHero accent="var(--sg-secondary)">
          <div className="max-w-3xl">
            <p className="eyebrow" style={{ marginBottom: 12 }}>Kürasyonlu Listeler</p>
            <h1 className="display" style={{ fontSize: "clamp(3rem, 8vw, 84px)", fontWeight: 700, lineHeight: 0.92, letterSpacing: "-0.04em", margin: "0 0 20px" }}>
              Scout&apos;un <span style={{ color: "var(--cyan)" }}>Listeleri</span>
            </h1>
            <p style={{ fontSize: 18, color: "var(--ink-200)", lineHeight: 1.5, maxWidth: 540, margin: 0 }}>
              Liglere, pozisyonlara ve yaş gruplarına göre kürasyonlu listeler.
            </p>
          </div>
        </CategoryHero>

        <div className="max-w-7xl mx-auto px-8 pt-16 pb-20">
          {/* Filter bar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 32, paddingBottom: 16, borderBottom: "1px solid var(--ink-700)", flexWrap: "wrap" }}>
            {["TÜMÜ", "GENÇ", "TRANSFER", "TAKTİK", "TÜRKİYE"].map((f, i) => (
              <button key={f} type="button"
                className={i === 0 ? "sg-chip sg-chip-solid" : "sg-chip"}
                style={{ cursor: "pointer" }}>
                {f}
              </button>
            ))}
          </div>
          {dbLists.length > 0 && (
            <motion.section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1" style={{ background: "rgba(26,58,92,0.5)" }} />
                <p className="text-[10px] font-bold uppercase tracking-[0.25em]"
                  style={{ color: "var(--sg-secondary)", fontFamily: "var(--font-headline)" }}>Güncel Listeler</p>
                <div className="h-px flex-1" style={{ background: "rgba(26,58,92,0.5)" }} />
              </div>
              <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" animate="visible">
                {dbLists.map(item => {
                  const accentColor = "var(--sg-secondary)";
                  return (
                  <motion.div key={item.id} variants={fadeUp}>
                    <Link href={`/listeler/${item.slug}`}
                      className="group flex flex-col h-full transition hover:-translate-y-0.5"
                      style={{ background: "var(--ink-800)", border: "1px solid var(--ink-700)", borderLeft: "3px solid var(--sg-secondary)" }}>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: accentColor }}>
                            LİSTE
                          </span>
                          <span className="text-[10px]" style={{ color: "var(--sg-text-muted)" }}>
                            {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <h2 className="text-sm font-bold leading-snug mb-4 line-clamp-2 transition"
                          style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}>
                          {item.title}
                        </h2>
                        <div className="mt-auto inline-flex items-center gap-1 text-[11px] font-bold"
                          style={{ color: "var(--sg-secondary)", fontFamily: "var(--font-headline)" }}>
                          Detayları Gör <span className="transition-transform group-hover:translate-x-0.5">→</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                  );
                })}
              </motion.div>
            </motion.section>
          )}

          <motion.section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1" style={{ background: "rgba(26,58,92,0.5)" }} />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em]"
                style={{ color: "var(--sg-secondary)", fontFamily: "var(--font-headline)" }}>Öne Çıkan Listeler</p>
              <div className="h-px flex-1" style={{ background: "rgba(26,58,92,0.5)" }} />
            </div>
            <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" animate="visible">
            {STATIC_LISTS.map(list => (
              <motion.div key={list.slug} variants={fadeUp}>
                <Link href={`/listeler/${list.slug}`}
                  className="group flex flex-col h-full transition hover:-translate-y-0.5"
                  style={{ background: "var(--ink-800)", border: "1px solid var(--ink-700)", borderLeft: `3px solid ${list.color}` }}>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center"
                      style={{ background: `${list.color}15`, color: list.color }}>
                      {list.icon}
                    </div>
                    <h2 className="text-sm font-bold mb-2 transition"
                      style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}>
                      {list.title}
                    </h2>
                    <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--sg-text-secondary)" }}>
                      {list.description}
                    </p>
                    <div className="mt-auto inline-flex items-center gap-1 text-[11px] font-bold transition"
                      style={{ color: list.color, fontFamily: "var(--font-headline)" }}>
                      Detayları Gör <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            </motion.div>
          </motion.section>
        </div>
      </motion.div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
