"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { supabase } from "@/lib/supabase";
import { stripHtml } from "@/lib/utils";

type Content = { id: string; title: string; slug: string; content: string; created_at: string; };

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } } };

const ARCHETYPES = [
  { id: "b2b", slug: "box-to-box-engine", name: "Box-to-Box Engine", pos: "ORTA SAHA", color: "var(--sky)", desc: "Hem savunmada hem hücumda saha kaplayan motor.", exemplars: ["BELLİNGHAM", "TCHOUAMÉNİ", "WİRTZ"] },
  { id: "bpcb", slug: "ball-playing-cb", name: "Ball-Playing CB", pos: "DEFANS", color: "var(--cyan)", desc: "Pas dağılımı ile oyunu inşa eden modern stoper.", exemplars: ["VAN DİJK", "SALİBA", "RÜDİGER"] },
  { id: "iw", slug: "inverted-winger", name: "Inverted Winger", pos: "HÜCUM", color: "var(--emerald)", desc: "Ters ayağıyla içeri kesip bitiren kanat.", exemplars: ["SALAH", "YAMAL", "SAKA"] },
  { id: "ifb", slug: "inverted-fullback", name: "Inverted Full-back", pos: "DEFANS", color: "var(--amber)", desc: "Hücumda orta sahaya geçen modern bek.", exemplars: ["ZİNCHENKO", "STONES", "CANCELO"] },
  { id: "f9", slug: "false-9", name: "False 9", pos: "HÜCUM", color: "var(--rose)", desc: "Ceza sahası dışında oyun kuran pozisyonsuz forvet.", exemplars: ["FODEN", "MÜLLER", "FİRMİNO"] },
  { id: "hps", slug: "high-press-striker", name: "High Press Striker", pos: "HÜCUM", color: "var(--emerald)", desc: "Savunmadan başlayan ilk hat — modern santrforun temeli.", exemplars: ["NÚÑEZ", "HAALAND", "JACKSON"] },
];

export default function TaktikLabPage() {
  const [dbContents, setDbContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("contents").select("id,title,slug,content,created_at")
      .eq("status", "yayinda").eq("category", "taktik-lab").order("created_at", { ascending: false })
      .then(({ data }) => { setDbContents(data ?? []); setLoading(false); });
  }, []);

  return (
    <main style={{ background: "var(--ink-900)", color: "var(--ink-100)", minHeight: "100vh" }}>
      <SiteHeader activeNav="taktik-lab" />

      {/* Header */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "120px 32px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "end" }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>POZİSYON ARKETİPLERİ</p>
            <h1 className="display" style={{ fontSize: "clamp(56px, 8vw, 100px)", fontWeight: 700, letterSpacing: "-0.04em", margin: 0, lineHeight: 0.9, color: "var(--sky)" }}>
              Taktik Lab
            </h1>
          </div>
          <p style={{ fontSize: 18, color: "var(--ink-200)", lineHeight: 1.5, margin: 0 }}>
            Modern futbolun pozisyon arketipleri. Her arketip bir rol — hangi oyuncular en iyi uyguluyor?
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 32px 80px" }}>

        {/* Son analizler */}
        {!loading && dbContents.length > 0 && (
          <section style={{ marginBottom: 60 }}>
            <p className="eyebrow" style={{ marginBottom: 16 }}>SON ANALİZLER</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {dbContents.slice(0, 4).map(item => (
                <Link key={item.id} href={`/taktik-lab/${item.slug}`} className="sg-lift"
                  style={{ background: "var(--ink-800)", border: "1px solid var(--ink-700)", borderRadius: 4, padding: 24, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sky)" }}>TAKTİK</span>
                    <span className="mono" style={{ fontSize: 10, color: "var(--ink-400)" }}>
                      {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="display" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px", lineHeight: 1.2, color: "var(--ink-100)" }}>{item.title}</h2>
                  <p style={{ fontSize: 13, color: "var(--ink-300)", lineHeight: 1.55, flex: 1, margin: 0 }}>
                    {stripHtml(item.content).replace(/\s+/g, " ").trim().slice(0, 120)}…
                  </p>
                  <div style={{ marginTop: 12 }}>
                    <span className="mono" style={{ fontSize: 10, color: "var(--sky)", letterSpacing: "0.1em" }}>OKU →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Arketipler */}
        <section>
          <p className="eyebrow" style={{ marginBottom: 16 }}>ARKETİPLER</p>
          <motion.div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
            variants={stagger} initial="hidden" animate="visible">
            {ARCHETYPES.map(arch => (
              <motion.article key={arch.id} variants={fadeUp}>
                <Link href={`/taktik-lab/${arch.slug}`} className="sg-lift"
                  style={{ background: "var(--ink-800)", border: "1px solid var(--ink-700)", borderRadius: 4, padding: 24, display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ marginBottom: 16 }}>
                    <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: arch.color }}>{arch.pos}</span>
                  </div>
                  <h2 className="display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 10px", color: "var(--ink-100)" }}>
                    {arch.name}
                  </h2>
                  <p style={{ fontSize: 14, color: "var(--ink-300)", lineHeight: 1.5, flex: 1, margin: "0 0 20px" }}>
                    {arch.desc}
                  </p>
                  <div>
                    <p className="eyebrow" style={{ marginBottom: 8 }}>EN İYİ UYGULAYANLAR</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {arch.exemplars.map(e => (
                        <span key={e} className="sg-chip" style={{ fontSize: 9, color: arch.color, borderColor: arch.color }}>{e}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </section>
      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
