"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import CategoryHero from "../components/category-hero";
import { supabase } from "@/lib/supabase";
import { arenaPath, CARD_COLOR_MAP, type ArenaGame } from "@/lib/arena-brackets";

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOut } } };

const ICONS = ["⭐", "🏆", "📋", "🇹🇷", "🌍", "⚽", "🎯", "🔥"];

export default function ArenaHomePage() {
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
      <SiteHeader activeNav="arena" maxWidth="max-w-7xl" />

      <div className="pt-[72px]">
        <CategoryHero accent="var(--sg-amber)">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-[2px] w-12" style={{ background: "var(--sg-amber)" }} />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.3em]"
                style={{ color: "var(--sg-amber)", fontFamily: "var(--font-headline)" }}
              >
                Arena Turnuvası
              </span>
            </div>
            <h1
              className="font-bold tracking-tighter leading-none mb-5"
              style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
            >
              Player <span style={{ color: "var(--sg-amber)" }}>Arena</span>
            </h1>
            <p className="text-base leading-relaxed max-w-xl" style={{ color: "var(--sg-text-secondary)" }}>
              Bir bracket seç, kazananları işaretle, şampiyonunu paylaş. Her açılışta eşleşmeler yeniden karışır.
            </p>
          </div>
        </CategoryHero>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-16 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1" style={{ background: "rgba(26,58,92,0.5)" }} />
          <p
            className="text-[10px] font-bold uppercase tracking-[0.25em]"
            style={{ color: "var(--sg-amber)", fontFamily: "var(--font-headline)" }}
          >
            Turnuva Formatları
          </p>
          <div className="h-px flex-1" style={{ background: "rgba(26,58,92,0.5)" }} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20" style={{ color: "var(--sg-text-muted)" }}>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--sg-amber)", borderTopColor: "transparent" }} />
            <span className="text-sm">Yükleniyor...</span>
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
                    href={arenaPath(g.slug)}
                    className="group flex h-full flex-col transition hover:-translate-y-0.5"
                    style={{ background: "var(--sg-surface)", borderLeft: `3px solid ${accent}` }}
                  >
                    <div className="relative flex flex-1 flex-col p-6 overflow-hidden">
                      <div className="pointer-events-none absolute -right-2 -top-2 text-[80px] opacity-[0.04] select-none">
                        {icon}
                      </div>
                      <div className="mb-4 text-2xl">{icon}</div>
                      <h2
                        className="text-base font-bold mb-2"
                        style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}
                      >
                        {g.title_tr}
                      </h2>
                      <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: "var(--sg-text-secondary)" }}>
                        {g.description_tr}
                      </p>
                      <div
                        className="inline-flex w-full items-center justify-center py-3 text-sm font-bold transition hover:brightness-110"
                        style={{ background: accent, color: "#060f1e", fontFamily: "var(--font-headline)", letterSpacing: "0.08em" }}
                      >
                        OYNA
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
