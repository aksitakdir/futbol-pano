"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconTaktik,
  IconShield,
  IconBall,
  IconCompass,
  IconArrowRight,
} from "../components/icons";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import Breadcrumb from "../components/breadcrumb";
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
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

const ARCHETYPES: Archetype[] = [
  {
    name: "Box-to-Box Engine",
    slug: "box-to-box-engine",
    description: "Savunmadan hücuma köprü kuran modern orta saha motoru",
    position: "Orta Saha",
  },
  {
    name: "Ball-Playing CB",
    slug: "ball-playing-cb",
    description: "Oyun kurucu gibi davranan modern stoper",
    position: "Defans",
  },
  {
    name: "Inverted Winger",
    slug: "inverted-winger",
    description: "İçe kesip gol tehlikesi yaratan kanat oyuncusu",
    position: "Hücum",
  },
  {
    name: "Inverted Full-back",
    slug: "inverted-fullback",
    description: "Orta sahaya kayarak üstünlük sağlayan modern bek",
    position: "Defans",
  },
  {
    name: "False 9",
    slug: "false-9",
    description: "Düşerek alan açan ve oyun kuran modern forvet",
    position: "Hücum",
  },
  {
    name: "High Press Striker",
    slug: "high-press-striker",
    description: "Savunmayı tepeden başlatan pressing forveti",
    position: "Hücum",
  },
];

function positionStyle(pos: Archetype["position"]) {
  switch (pos) {
    case "Orta Saha":
      return { bg: "bg-sky-500/15", text: "text-sky-300", border: "border-sky-500/30" };
    case "Defans":
      return { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/30" };
    case "Hücum":
      return { bg: "bg-rose-500/15", text: "text-rose-300", border: "border-rose-500/30" };
  }
}

function positionIcon(pos: Archetype["position"]) {
  switch (pos) {
    case "Orta Saha":
      return <IconCompass className="text-sky-300" />;
    case "Defans":
      return <IconShield className="text-emerald-300" />;
    case "Hücum":
      return <IconBall className="text-rose-300" />;
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
      <SiteHeader activeNav="taktik-lab" maxWidth="max-w-7xl" />

      <motion.div
        className="mx-auto max-w-7xl px-4 py-10 lg:py-14"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
      >
        <div className="mb-6">
          <Breadcrumb items={[{ label: "Taktik Lab" }]} />
        </div>
        <section className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 ring-2 ring-emerald-500/40">
            <IconTaktik className="text-emerald-300" />
          </div>
          <h1 className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent md:text-3xl">
            Taktik Lab
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Modern futbolun pozisyon arketiplerini keşfet
          </p>
        </section>

        {/* DB-driven content — shown above static archetypes */}
        {loading ? (
          <div className="mb-10 flex items-center justify-center py-10">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : dbContents.length > 0 ? (
          <section className="mb-12">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Güncel Analizler
            </h2>
            <motion.div
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {dbContents.map((item) => (
                <motion.div key={item.id} variants={staggerChild} className="min-h-0">
                  <Link
                    href={`/taktik-lab/${item.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-emerald-500/30 bg-slate-950/60 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.8)] transition hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-slate-900/80"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <IconTaktik className="text-emerald-300" />
                      <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        Taktik
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.created_at).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                    </div>
                    <h2 className="text-lg font-extrabold tracking-tight text-slate-50">
                      {item.title}
                    </h2>
                    <p className="mt-1.5 flex-1 line-clamp-3 text-sm leading-relaxed text-slate-400">
                      {stripHtml(item.content).trim().slice(0, 150)}…
                    </p>
                    <span className="mt-4 inline-flex items-center self-start text-xs font-semibold text-emerald-300 transition group-hover:text-emerald-200">
                      Detayları Gör
                      <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </section>
        ) : null}

        {/* Static archetype reference cards */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Pozisyon Arketipleri
          </h2>
          <motion.div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
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
                  className="group flex flex-col rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.8)] transition hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-slate-900/80"
                >
                  <div className="mb-3 flex items-center gap-2">
                    {positionIcon(arch.position)}
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${style.bg} ${style.text} ${style.border}`}
                    >
                      {arch.position}
                    </span>
                  </div>

                  <h2 className="text-lg font-extrabold tracking-tight text-slate-50">
                    {arch.name}
                  </h2>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-400">
                    {arch.description}
                  </p>

                  <Link
                    href={`/taktik-lab/${arch.slug}`}
                    className="mt-4 inline-flex items-center self-start text-xs font-semibold text-emerald-300 transition group-hover:text-emerald-200"
                  >
                    Detayları Gör
                    <span className="ml-1 transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                </motion.article>
              );
            })}
          </motion.div>
        </section>
      </motion.div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
