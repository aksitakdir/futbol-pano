"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import CategoryHero from "../../components/category-hero";
import { supabase } from "@/lib/supabase";
import { arenaPath, CARD_COLOR_MAP, type ArenaGame } from "@/lib/arena-brackets";

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOut } } };

const ICONS = ["⭐", "🏆", "📋", "🇹🇷", "🌍", "⚽", "🎯", "🔥"];

export default function EnArenaHomePage() {
  const [games, setGames] = useState<ArenaGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("arena_games")
      .select("id,slug,status,title_tr,title_en,description_tr,description_en,card_color,game_type,participants")
      .eq("status", "published")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setGames((data as ArenaGame[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <main style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)", minHeight: "100vh" }}>
      <SiteHeader activeNav="arena" maxWidth="max-w-7xl" forceEn={true} />

      <div className="pt-[72px]">
        <CategoryHero accent="var(--sg-amber)">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-[2px] w-12" style={{ background: "var(--sg-amber)" }} />
              <span
                className="text-[10px] font-bold tracking-[0.3em]"
                style={{ color: "var(--sg-amber)", fontFamily: "var(--font-headline)" }}
              >
                Play & Share
              </span>
            </div>
            <h1
              className="mb-5 font-bold leading-none tracking-tighter"
              style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
            >
              Player <span style={{ color: "var(--sg-amber)" }}>Arena</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed" style={{ color: "var(--sg-text-secondary)" }}>
              Choose a bracket, pick your winners, share your champion. Matchups are reshuffled every time you open a
              bracket.
            </p>
          </div>
        </CategoryHero>
      </div>

      <div className="mx-auto max-w-7xl px-8 pb-20 pt-16">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "rgba(26,58,92,0.5)" }} />
          <p
            className="text-[10px] font-bold tracking-[0.25em]"
            style={{ color: "var(--sg-amber)", fontFamily: "var(--font-headline)" }}
          >
            Tournament Formats
          </p>
          <div className="h-px flex-1" style={{ background: "rgba(26,58,92,0.5)" }} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20" style={{ color: "var(--sg-text-muted)" }}>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--sg-amber)", borderTopColor: "transparent" }} />
            <span className="text-sm">Loading...</span>
          </div>
        ) : (
          <motion.div
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {games.map((g, i) => {
              const accent = CARD_COLOR_MAP[g.card_color] ?? "var(--sg-primary)";
              const icon = ICONS[i % ICONS.length];
              return (
                <motion.div key={g.slug} variants={fadeUp}>
                  <Link
                    href={arenaPath(g.slug) + "?lang=en"}
                    className="group flex h-full flex-col transition hover:-translate-y-0.5"
                    style={{ background: "var(--sg-surface)", borderLeft: `3px solid ${accent}` }}
                  >
                    <div className="relative flex flex-1 flex-col overflow-hidden p-6">
                      <div className="pointer-events-none absolute -right-2 -top-2 select-none text-[80px] opacity-[0.04]">
                        {icon}
                      </div>
                      <div className="mb-4 text-2xl">{icon}</div>
                      <h2
                        className="mb-2 text-base font-bold"
                        style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}
                      >
                        {g.title_en}
                      </h2>
                      <p className="mb-6 flex-1 text-sm leading-relaxed" style={{ color: "var(--sg-text-secondary)" }}>
                        {g.description_en}
                      </p>
                      <div
                        className="inline-flex w-full items-center justify-center py-3 text-sm font-bold transition hover:brightness-110"
                        style={{
                          background: accent,
                          color: "#060f1e",
                          fontFamily: "var(--font-headline)",
                          letterSpacing: "0.08em",
                        }}
                      >
                        PLAY
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
