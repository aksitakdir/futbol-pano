"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import { supabase } from "@/lib/supabase";

type Content = {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  content?: string;
  content_en?: string;
  created_at: string;
};

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } } };

const STATIC_LISTS = [
  {
    slug: "en-iyi-10-genc-stoper",
    title: "Top 10 Young Centre-Backs",
    description: "Detailed analysis of players fitting the modern CB profile under 23 across European leagues.",
    color: "var(--sg-primary)",
  },
  {
    slug: "super-lig-gizli-isimler",
    title: "Hidden Gems of the Süper Lig",
    description: "Names just entering the radar of major clubs, standing out on the data side.",
    color: "var(--sg-secondary)",
  },
  {
    slug: "surpriz-isimler-2025",
    title: "Surprise Performers of 2025",
    description: "Players who exceeded expectations in 2025, making statistical breakthroughs.",
    color: "var(--sg-amber)",
  },
];

export default function EnListelerPage() {
  const [dbLists, setDbLists] = useState<Content[]>([]);

  useEffect(() => {
    supabase
      .from("contents")
      .select("id,title,title_en,slug,content,content_en,created_at")
      .eq("status", "yayinda")
      .eq("category", "listeler")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data?.length) setDbLists(data);
      });
  }, []);

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="listeler" />
      <motion.div className="pt-[72px]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: easeOut }}>
        <div className="relative mx-auto max-w-7xl overflow-hidden px-8 py-20">
          <div
            className="pointer-events-none absolute -right-40 -top-20 h-96 w-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, var(--sg-secondary) 0%, transparent 70%)", filter: "blur(120px)" }}
          />
          <div className="relative max-w-3xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-[2px] w-12" style={{ background: "var(--sg-secondary)" }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--sg-secondary)", fontFamily: "var(--font-headline)" }}>
                Curated Lists
              </span>
            </div>
            <h1 className="mb-5 font-bold leading-none tracking-tighter" style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
              Scouting <span style={{ color: "var(--sg-secondary)" }}>Lists</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed" style={{ color: "var(--sg-text-secondary)" }}>
              Curated lists by league, position and age group. Data and scout observations combined.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-8 pb-20">
          {dbLists.length > 0 && (
            <motion.section className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" animate="visible">
              {dbLists.map((item) => (
                <motion.div key={item.id} variants={fadeUp}>
                  <Link
                    href={`/en/listeler/${item.slug}`}
                    className="group flex h-full flex-col transition hover:-translate-y-0.5"
                    style={{ background: "var(--sg-surface)" }}
                  >
                    <div className="h-[3px]" style={{ background: "var(--sg-secondary)" }} />
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--sg-secondary)", fontFamily: "var(--font-headline)" }}>
                          New
                        </span>
                        <span className="text-[10px]" style={{ color: "var(--sg-text-muted)" }}>
                          {new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <h2 className="mb-4 text-sm font-bold leading-snug" style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}>
                        {item.title_en || item.title}
                      </h2>
                      <div className="mt-auto inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: "var(--sg-secondary)", fontFamily: "var(--font-headline)" }}>
                        View List <span className="transition-transform group-hover:translate-x-0.5">→</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.section>
          )}
          <motion.section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" animate="visible">
            {STATIC_LISTS.map((list) => (
              <motion.div key={list.slug} variants={fadeUp}>
                <Link
                  href={`/en/listeler/${list.slug}`}
                  className="group flex h-full flex-col transition hover:-translate-y-0.5"
                  style={{ background: "var(--sg-surface)", borderLeft: `3px solid ${list.color}` }}
                >
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="mb-2 text-sm font-bold" style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}>
                      {list.title}
                    </h2>
                    <p className="mb-4 text-xs leading-relaxed" style={{ color: "var(--sg-text-secondary)" }}>
                      {list.description}
                    </p>
                    <div className="mt-auto inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: list.color, fontFamily: "var(--font-headline)" }}>
                      View List <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.section>
        </div>
      </motion.div>
      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
