"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { ARENA_BRACKETS, arenaPath } from "@/lib/arena-brackets";

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOut } } };

const ACCENT_COLORS = [
  "var(--sg-primary)",
  "var(--sg-secondary)",
  "var(--sg-tertiary)",
  "var(--sg-amber)",
  "var(--sg-rose, #fb7185)",
];

const ICONS = ["⭐", "🏆", "📋", "🇹🇷", "🌍"];

export default function ArenaHomePage() {
  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="arena" maxWidth="max-w-7xl" />

      {/* Hero */}
      <div className="relative overflow-hidden pt-[72px]">
        <div className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, var(--sg-amber) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-[2px] w-12" style={{ background: "var(--sg-amber)" }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]"
              style={{ color: "var(--sg-amber)", fontFamily: "var(--font-headline)" }}>Arena Tournament</span>
          </div>
          <h1 className="font-bold tracking-tighter leading-none mb-5"
            style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
            Player <span style={{ color: "var(--sg-amber)" }}>Arena</span>
          </h1>
          <p className="text-base leading-relaxed max-w-xl" style={{ color: "var(--sg-text-secondary)" }}>
            Bir bracket seç, kazananları işaretle, şampiyonunu paylaş. Her açılışta eşleşmeler yeniden karışır.
          </p>
        </div>
      </div>

      {/* Bracket grid */}
      <div className="max-w-7xl mx-auto px-8 pb-20">
        <motion.div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          variants={stagger} initial="hidden" animate="visible">
          {ARENA_BRACKETS.map((b, i) => {
            const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
            return (
              <motion.div key={b.slug} variants={fadeUp}>
                <Link href={arenaPath(b.slug)}
                  className="group flex h-full flex-col transition hover:-translate-y-0.5"
                  style={{ background: "var(--sg-surface)", borderLeft: `3px solid ${accent}` }}>
                  <div className="relative flex flex-1 flex-col p-6 overflow-hidden">
                    {/* Büyük arka plan ikonu */}
                    <div className="pointer-events-none absolute -right-2 -top-2 text-[80px] opacity-[0.04] select-none">
                      {ICONS[i % ICONS.length]}
                    </div>
                    <div className="mb-4 text-2xl">{ICONS[i % ICONS.length]}</div>
                    <h2 className="text-base font-bold mb-2 transition"
                      style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}>
                      {b.cardTitle}
                    </h2>
                    <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: "var(--sg-text-secondary)" }}>
                      {b.cardDescription}
                    </p>
                    <div className="inline-flex w-full items-center justify-center py-3 text-sm font-bold transition hover:brightness-110"
                      style={{ background: accent, color: "#060f1e", fontFamily: "var(--font-headline)", letterSpacing: "0.08em" }}>
                      OYNA
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
