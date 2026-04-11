"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import CategoryHero from "../components/category-hero";
import { supabase } from "@/lib/supabase";
import { stripHtml } from "@/lib/utils";

type SupabaseContent = { id: string; title: string; slug: string; content: string; created_at: string; };

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } } };

type Archetype = { name: string; slug: string; description: string; position: string; color: string; icon: string; };

const ARCHETYPES: Archetype[] = [
  { name: "Box-to-Box Engine", slug: "box-to-box-engine", description: "Sahadaki her santimetreyi kapsayan yüksek yoğunluklu dinamizm. Savunma desteği ile hücum geçişlerini bağlayan temel dişli.", position: "Orta Saha", color: "var(--sg-secondary)", icon: "⚡" },
  { name: "Ball-Playing CB", slug: "ball-playing-cb", description: "Modern oyunun kurucusu. Sadece savunmakla kalmaz, dikine paslarla pres hattını kırar ve oyun kurulumunu yönetir.", position: "Defans", color: "var(--sg-primary)", icon: "🏗️" },
  { name: "Inverted Winger", slug: "inverted-winger", description: "İçeri kat ederek yarım alanlarda kaos yaratan, yaratıcılık ve bitiriciliği kanattan merkeze taşıyan profil.", position: "Hücum", color: "var(--sg-rose)", icon: "↩" },
  { name: "Inverted Full-back", slug: "inverted-fullback", description: "Savunma çizgisinden orta sahaya eklenlenen, topa sahipken ekstra bir oyun kurucu gibi davranan modern bek tanımı.", position: "Defans", color: "var(--sg-primary)", icon: "⇄" },
  { name: "False 9", slug: "false-9", description: "Geleneksel forvet tanımının ötesinde; derine inerek orta sahayı beşleyen ve rakip stopleri pozisyon dışına çeken beyin.", position: "Hücum", color: "var(--sg-rose)", icon: "9" },
  { name: "High Press Striker", slug: "high-press-striker", description: "Savunmanın ilk hattı. Rakibi hataya zorlayan agresif pres gücüyle, topsuz oyunda takımın savunma ritmini belirleyen forvet.", position: "Hücum", color: "var(--sg-rose)", icon: "↑" },
];

const posColor: Record<string, string> = {
  "Orta Saha": "var(--sg-secondary)",
  "Defans": "var(--sg-primary)",
  "Hücum": "var(--sg-rose, #fb7185)",
};

export default function TaktikLabPage() {
  const [dbContents, setDbContents] = useState<SupabaseContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("contents").select("id,title,slug,content,created_at")
      .eq("status", "yayinda").eq("category", "taktik-lab").order("created_at", { ascending: false })
      .then(({ data }) => { setDbContents(data ?? []); setLoading(false); });
  }, []);

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="taktik-lab" />

      <motion.div className="pt-[72px]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: easeOut }}>

        <CategoryHero accent="var(--sg-tertiary)" variant="surface-low">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-[2px] w-12" style={{ background: "var(--sg-tertiary)" }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]"
                style={{ color: "var(--sg-tertiary)", fontFamily: "var(--font-headline)" }}>Analiz Motoru</span>
            </div>
            <h1 className="font-bold tracking-tighter leading-none mb-5"
              style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
              Anlaşılabilir <span style={{ color: "var(--sg-tertiary)" }}>Sofistikasyon</span>
            </h1>
            <p className="text-base leading-relaxed max-w-2xl" style={{ color: "var(--sg-text-secondary)" }}>
              Taktik Lab, ham veriyi sahadaki gerçekliğe dönüştürür. Oyuncu profillerini sadece sayılarla değil, oyunun DNA&apos;sını oluşturan pozisyonel arketip modelleriyle tanımlıyoruz. Her oyuncu bir rol değil, bir fonksiyondur.
            </p>
          </div>
        </CategoryHero>

        <div className="max-w-7xl mx-auto px-8 py-16">

          {/* DB içerikleri */}
          {!loading && dbContents.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1" style={{ background: "rgba(26,58,92,0.5)" }} />
                <p className="text-[10px] font-bold uppercase tracking-[0.25em]"
                  style={{ color: "var(--sg-tertiary)", fontFamily: "var(--font-headline)" }}>Güncel Analizler</p>
                <div className="h-px flex-1" style={{ background: "rgba(26,58,92,0.5)" }} />
              </div>
              <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" animate="visible">
                {dbContents.map(item => (
                  <motion.div key={item.id} variants={fadeUp}>
                    <Link href={`/taktik-lab/${item.slug}`}
                      className="group flex flex-col h-full transition hover:-translate-y-0.5"
                      style={{ background: "var(--sg-surface)", borderLeft: "3px solid var(--sg-tertiary)" }}>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em]"
                            style={{ color: "var(--sg-tertiary)", fontFamily: "var(--font-headline)" }}>Taktik</span>
                          <span className="text-[10px]" style={{ color: "var(--sg-text-muted)" }}>
                            {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <h2 className="text-sm font-bold mb-2 line-clamp-2"
                          style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}>{item.title}</h2>
                        <p className="text-xs leading-relaxed line-clamp-2 mb-4" style={{ color: "var(--sg-text-secondary)" }}>
                          {stripHtml(item.content).trim().slice(0, 120)}…
                        </p>
                        <div className="mt-auto inline-flex items-center gap-1 text-[11px] font-bold"
                          style={{ color: "var(--sg-tertiary)", fontFamily: "var(--font-headline)" }}>
                          Detayları Gör <span className="transition-transform group-hover:translate-x-0.5">→</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}

          {/* Pozisyon arketipleri */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1" style={{ background: "rgba(26,58,92,0.5)" }} />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em]"
                style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}>Pozisyon Arketipleri</p>
              <div className="h-px flex-1" style={{ background: "rgba(26,58,92,0.5)" }} />
            </div>
            <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" animate="visible">
              {ARCHETYPES.map(arch => (
                <motion.article key={arch.slug} variants={fadeUp}>
                  <Link href={`/taktik-lab/${arch.slug}`}
                    className="group flex flex-col h-full transition hover:-translate-y-0.5"
                    style={{ background: "var(--sg-surface)", borderLeft: `3px solid ${arch.color}` }}>
                    <div className="relative flex flex-1 flex-col p-6 overflow-hidden">
                      {/* Büyük arka plan ikonu */}
                      <div className="pointer-events-none absolute -right-2 -top-2 text-[80px] opacity-[0.04] select-none"
                        style={{ fontFamily: "var(--font-headline)", color: arch.color }}>
                        {arch.icon}
                      </div>
                      {/* İkon kutu */}
                      <div className="mb-5 flex h-10 w-10 items-center justify-center text-lg"
                        style={{ background: `${arch.color}15`, color: arch.color }}>
                        {arch.icon}
                      </div>
                      <h2 className="font-mono text-base font-bold uppercase tracking-tight mb-3"
                        style={{ color: "var(--sg-text-primary)" }}>
                        {arch.name}
                      </h2>
                      <p className="text-xs leading-relaxed mb-5" style={{ color: "var(--sg-text-secondary)" }}>
                        {arch.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]"
                          style={{ color: posColor[arch.position] ?? arch.color, fontFamily: "var(--font-headline)" }}>
                          {arch.position}
                        </span>
                        <span className="text-[11px] font-bold transition-transform group-hover:translate-x-0.5"
                          style={{ color: arch.color, fontFamily: "var(--font-headline)" }}>→</span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          </section>

          {/* CTA */}
          <div className="mt-16 p-10 md:p-14 text-center relative overflow-hidden" style={{ background: "var(--sg-surface-low)" }}>
            <div className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse at center, rgba(167,139,250,0.08) 0%, transparent 70%)" }} />
            <div className="relative">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tighter mb-3"
                style={{ fontFamily: "var(--font-headline)" }}>
                Kendi Taktiğini Oluşturmaya Hazır mısın?
              </h2>
              <p className="text-sm mb-6 max-w-lg mx-auto" style={{ color: "var(--sg-text-secondary)" }}>
                Arketip modellerini kullanarak oyuncu havuzunu filtreleyebilir, sistemine en uygun parçayı saniyeler içinde bulabilirsin.
              </p>
              <Link href="/listeler"
                className="inline-flex items-center gap-2 px-8 py-3.5 font-bold uppercase tracking-wider transition hover:brightness-110"
                style={{ background: "var(--sg-tertiary)", color: "#060f1e", fontFamily: "var(--font-headline)", fontSize: "12px" }}>
                Sistem Analizine Başla
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
