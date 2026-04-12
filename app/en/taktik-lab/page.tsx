"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import { supabase } from "@/lib/supabase";
import { stripHtml } from "@/lib/utils";

type Content = {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  content: string;
  content_en?: string;
  created_at: string;
};

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } } };

const ACCENT = "var(--sg-tertiary)";

type Archetype = { name: string; slug: string; description: string; position: string; color: string; icon: string };

const ARCHETYPES: Archetype[] = [
  {
    name: "Box-to-Box Engine",
    slug: "box-to-box-engine",
    description: "High-intensity dynamism covering every blade of grass—the link between defensive graft and attacking transitions.",
    position: "Midfield",
    color: "var(--sg-secondary)",
    icon: "⚡",
  },
  {
    name: "Ball-Playing CB",
    slug: "ball-playing-cb",
    description: "Builds from the back: breaks the press with vertical passes and steers how the team progresses the ball.",
    position: "Defence",
    color: "var(--sg-primary)",
    icon: "🏗️",
  },
  {
    name: "Inverted Winger",
    slug: "inverted-winger",
    description: "Cuts inside to overload half-spaces, combining creativity and finishing from wide into central zones.",
    position: "Attack",
    color: "var(--sg-rose)",
    icon: "↩",
  },
  {
    name: "Inverted Full-back",
    slug: "inverted-fullback",
    description: "Steps into midfield from the back line, acting as an extra playmaker when the team has possession.",
    position: "Defence",
    color: "var(--sg-primary)",
    icon: "⇄",
  },
  {
    name: "False 9",
    slug: "false-9",
    description: "Drops deep to connect midfield and attack, pulling centre-backs out of shape and opening lanes.",
    position: "Attack",
    color: "var(--sg-rose)",
    icon: "9",
  },
  {
    name: "High Press Striker",
    slug: "high-press-striker",
    description: "The first line of defence: aggressive pressing without the ball sets the team’s defensive rhythm.",
    position: "Attack",
    color: "var(--sg-rose)",
    icon: "↑",
  },
];

const posColor: Record<string, string> = {
  Midfield: "var(--sg-secondary)",
  Defence: "var(--sg-primary)",
  Attack: "var(--sg-rose, #fb7185)",
};

export default function EnTaktikLabPage() {
  const [dbContents, setDbContents] = useState<Content[]>([]);

  useEffect(() => {
    supabase
      .from("contents")
      .select("id,title,title_en,slug,content,content_en,created_at")
      .eq("status", "yayinda")
      .eq("category", "taktik-lab")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data?.length) setDbContents(data);
      });
  }, []);

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="taktik-lab" />
      <motion.div className="pt-[72px]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: easeOut }}>
        <div className="relative mx-auto max-w-7xl overflow-hidden px-8 py-20">
          <div
            className="pointer-events-none absolute -right-40 -top-20 h-96 w-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, var(--sg-tertiary) 0%, transparent 70%)", filter: "blur(120px)" }}
          />
          <div className="relative max-w-3xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-[2px] w-12" style={{ background: ACCENT }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: ACCENT, fontFamily: "var(--font-headline)" }}>
                Tactical Analysis
              </span>
            </div>
            <h1 className="mb-5 font-bold leading-none tracking-tighter" style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
              Tactics <span style={{ color: ACCENT }}>Lab</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed" style={{ color: "var(--sg-text-secondary)" }}>
              Position archetypes, tactical systems and game plan analyses from a scout&apos;s perspective.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-8 pb-20">
          {dbContents.length > 0 && (
            <motion.section className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" animate="visible">
              {dbContents.map((item) => (
                <motion.div key={item.id} variants={fadeUp}>
                  <Link
                    href={`/en/taktik-lab/${item.slug}`}
                    className="group flex h-full flex-col transition hover:-translate-y-0.5"
                    style={{ background: "var(--sg-surface)", borderLeft: `3px solid ${ACCENT}` }}
                  >
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: ACCENT, fontFamily: "var(--font-headline)" }}>
                          Analysis
                        </span>
                        <span className="text-[10px]" style={{ color: "var(--sg-text-muted)" }}>
                          {new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <h2 className="mb-2 line-clamp-2 text-sm font-bold" style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}>
                        {item.title_en || item.title}
                      </h2>
                      <p className="mb-4 line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--sg-text-secondary)" }}>
                        {stripHtml(item.content_en || item.content).trim().slice(0, 120)}…
                      </p>
                      <div className="mt-auto inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: ACCENT, fontFamily: "var(--font-headline)" }}>
                        Read <span className="transition-transform group-hover:translate-x-0.5">→</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.section>
          )}
          <motion.section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" animate="visible">
            {ARCHETYPES.map((arch) => (
              <motion.article key={arch.slug} variants={fadeUp}>
                <Link
                  href={`/en/taktik-lab/${arch.slug}`}
                  className="group flex h-full flex-col transition hover:-translate-y-0.5"
                  style={{ background: "var(--sg-surface)", borderLeft: `3px solid ${arch.color}` }}
                >
                  <div className="relative flex flex-1 flex-col overflow-hidden p-6">
                    <div
                      className="pointer-events-none absolute -right-2 -top-2 select-none text-[80px] opacity-[0.04]"
                      style={{ fontFamily: "var(--font-headline)", color: arch.color }}
                    >
                      {arch.icon}
                    </div>
                    <div className="mb-5 flex h-10 w-10 items-center justify-center text-lg" style={{ background: `${arch.color}15`, color: arch.color }}>
                      {arch.icon}
                    </div>
                    <h2 className="mb-3 font-mono text-base font-bold uppercase tracking-tight" style={{ color: "var(--sg-text-primary)" }}>
                      {arch.name}
                    </h2>
                    <p className="mb-5 text-xs leading-relaxed" style={{ color: "var(--sg-text-secondary)" }}>
                      {arch.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <span
                        className="text-[9px] font-bold uppercase tracking-[0.2em]"
                        style={{ color: posColor[arch.position] ?? arch.color, fontFamily: "var(--font-headline)" }}
                      >
                        {arch.position}
                      </span>
                      <span className="text-[11px] font-bold transition-transform group-hover:translate-x-0.5" style={{ color: arch.color, fontFamily: "var(--font-headline)" }}>
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.section>
        </div>
      </motion.div>
      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
