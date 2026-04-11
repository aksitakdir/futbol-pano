"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconTaktik,
  IconShield,
  IconBall,
  IconCompass,
} from "../components/icons";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { supabase } from "@/lib/supabase";
import { stripHtml } from "@/lib/utils";

type SupabaseContent = {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
};

type Archetype = {
  name: string;
  slug: string;
  description: string;
  position: "Orta Saha" | "Defans" | "Hücum";
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

const ARCHETYPES: Archetype[] = [
  { name: "Box-to-Box Engine", slug: "box-to-box-engine", description: "Savunmadan hücuma köprü kuran modern orta saha motoru", position: "Orta Saha" },
  { name: "Ball-Playing CB", slug: "ball-playing-cb", description: "Oyun kurucu gibi davranan modern stoper", position: "Defans" },
  { name: "Inverted Winger", slug: "inverted-winger", description: "İçe kesip gol tehlikesi yaratan kanat oyuncusu", position: "Hücum" },
  { name: "Inverted Full-back", slug: "inverted-fullback", description: "Orta sahaya kayarak üstünlük sağlayan modern bek", position: "Defans" },
  { name: "False 9", slug: "false-9", description: "Düşerek alan açan ve oyun kuran modern forvet", position: "Hücum" },
  { name: "High Press Striker", slug: "high-press-striker", description: "Savunmayı tepeden başlatan pressing forveti", position: "Hücum" },
];

type PosStyle = { accent: string; bg: string; text: string; border: string };

function positionStyle(pos: Archetype["position"]): PosStyle {
  switch (pos) {
    case "Orta Saha": return { accent: "#22d3ee", bg: "bg-sky-500/10", text: "text-sky-300", border: "border-sky-500/25" };
    case "Defans":    return { accent: "#00d4aa", bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/25" };
    case "Hücum":     return { accent: "#fb7185", bg: "bg-rose-500/10", text: "text-rose-300", border: "border-rose-500/25" };
  }
}

function positionIcon(pos: Archetype["position"]) {
  switch (pos) {
    case "Orta Saha": return <IconCompass className="text-sky-300" />;
    case "Defans":    return <IconShield className="text-emerald-300" />;
    case "Hücum":     return <IconBall className="text-rose-300" />;
  }
}

export default function TaktikLabPage() {
  const [dbContents, setDbContents] = useState<SupabaseContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTaktik() {
      const { data } = await supabase
        .from("contents")
        .select("id, title, slug, content, created_at")
        .eq("status", "yayinda")
        .eq("category", "taktik-lab")
        .order("created_at", { ascending: false });
      setDbContents(data ?? []);
      setLoading(false);
    }
    fetchTaktik();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <SiteHeader activeNav="taktik-lab" maxWidth="max-w-6xl" />

      <motion.div
        className="mx-auto max-w-6xl px-4 py-8 lg:py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
      >
        {/* Sayfa başlığı */}
        <section className="mb-10">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400" />
            <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-violet-400/80">Scout Gamer</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
              <IconTaktik className="text-violet-300" />
            </div>
            <h1 className="bg-gradient-to-r from-violet-400 via-cyan-400 to-sky-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
              Taktik Lab
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Modern futbolun pozisyon arketipleri, taktik analizler ve oyun planları.
            Scout perspektifinden sahayı okumak için.
          </p>
        </section>

        {/* DB içerikleri */}
        {loading ? (
          <div className="mb-10 flex justify-center py-10">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
          </div>
        ) : dbContents.length > 0 && (
          <section className="mb-12">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-800/60" />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-violet-400/80">Güncel Analizler</p>
              <div className="h-px flex-1 bg-slate-800/60" />
            </div>
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {dbContents.map((item) => (
                <motion.div key={item.id} variants={staggerChild}>
                  <Link
                    href={`/taktik-lab/${item.slug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-violet-500/20 bg-slate-950/70 transition hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-[0_0_24px_rgba(167,139,250,0.1)]"
                  >
                    <div className="h-0.5 w-full bg-gradient-to-r from-violet-400 to-transparent" />
                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <IconTaktik className="text-violet-300 opacity-70" />
                        <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-violet-300">
                          Taktik
                        </span>
                        <span className="ml-auto text-[10px] text-slate-500">
                          {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <h2 className="text-sm font-bold text-slate-50 transition group-hover:text-violet-300">
                        {item.title}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-slate-400">
                        {stripHtml(item.content).trim().slice(0, 120)}…
                      </p>
                      <div className="mt-auto pt-4 inline-flex items-center text-[11px] font-semibold text-violet-400">
                        Detayları Gör <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
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
          <div className="mb-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-800/60" />
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Pozisyon Arketipleri</p>
            <div className="h-px flex-1 bg-slate-800/60" />
          </div>
          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {ARCHETYPES.map((arch) => {
              const style = positionStyle(arch.position);
              return (
                <motion.article
                  key={arch.slug}
                  variants={staggerChild}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/70 transition hover:-translate-y-1 hover:border-slate-700/60"
                >
                  <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${style.accent}, transparent)` }} />
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-3 flex items-center gap-2">
                      {positionIcon(arch.position)}
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] ${style.bg} ${style.text} ${style.border}`}>
                        {arch.position}
                      </span>
                    </div>
                    <h2 className="font-mono text-sm font-bold tracking-tight text-slate-50 transition group-hover:text-emerald-300">
                      {arch.name}
                    </h2>
                    <p className="mt-2 text-[12px] leading-relaxed text-slate-400">
                      {arch.description}
                    </p>
                    <Link
                      href={`/taktik-lab/${arch.slug}`}
                      className="mt-auto pt-4 inline-flex items-center text-[11px] font-semibold text-slate-400 transition group-hover:text-emerald-300"
                    >
                      Detayları Gör <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </section>
      </motion.div>

      <SiteFooter maxWidth="max-w-6xl" />
    </main>
  );
}
