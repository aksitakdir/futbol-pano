"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ContentHighlightPills } from "../components/content-highlight-pills";
import { arenaPath, CARD_COLOR_MAP, type ArenaGame } from "@/lib/arena-brackets";
import { extractArticleHighlights } from "@/lib/content-highlight-tags";

const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOut } },
};

const ICONS = ["⭐", "🏆", "📋", "🇹🇷", "🌍", "⚽", "🎯", "🔥"];

type Props = {
  games: ArenaGame[];
  lang?: "tr" | "en";
};

export default function ArenaGameGrid({ games, lang = "tr" }: Props) {
  const isEn = lang === "en";

  return (
    <motion.div
      className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {games.map((g, i) => {
        const accent = CARD_COLOR_MAP[g.card_color] ?? "var(--sg-primary)";
        const icon = ICONS[i % ICONS.length];
        const href = isEn ? arenaPath(g.slug) + "?lang=en" : arenaPath(g.slug);
        const cardTitle = isEn ? g.title_en : g.title_tr;
        const cardDesc = isEn ? g.description_en : g.description_tr;
        const pills = extractArticleHighlights([cardTitle, cardDesc].filter(Boolean).join("\n\n"), {
          max: 4,
          seed: g.slug,
          titleHint: cardTitle,
        });

        return (
          <motion.div key={g.slug} variants={fadeUp}>
            <Link
              href={href}
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
                  {cardTitle}
                </h2>
                <p className="mb-4 text-sm leading-relaxed" style={{ color: "var(--sg-text-secondary)" }}>
                  {cardDesc}
                </p>
                {pills.length > 0 ? (
                  <div className="mb-4">
                    <ContentHighlightPills
                      tags={pills}
                      accent={accent}
                      label={isEn ? "HIGHLIGHTS" : "METİN VURGULARI"}
                    />
                  </div>
                ) : null}
                <div
                  className="btn btn-solid mt-auto w-full justify-center"
                  style={{ background: accent, borderColor: accent }}
                >
                  {isEn ? "PLAY →" : "OYNA →"}
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
