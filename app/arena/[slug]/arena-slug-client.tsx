"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import Breadcrumb from "../../components/breadcrumb";
import ArenaDuel from "../../components/arena-duel";
import type { ArenaGame } from "@/lib/arena-brackets";
import { getLeaderboard } from "@/app/arena/actions";
import type { LeaderboardEntry } from "@/app/arena/actions";

type Props = {
  game: ArenaGame;
  canonicalUrl: string;
  initialChampion?: string;
};

// ── Confetti particle (tiny, purely decorative) ──────────────────────────────
function Particle({ x, color, delay }: { x: number; color: string; delay: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute top-0 rounded-full"
      style={{ left: `${x}%`, width: 8, height: 8, background: color }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{ y: "110vh", opacity: [1, 1, 0], rotate: 360 * 3 }}
      transition={{ duration: 2.8 + Math.random() * 1.2, delay, ease: "linear" }}
    />
  );
}

const CONFETTI_COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#F97316"];

function ConfettiLayer() {
  const particles = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 1.6,
    }))
  );
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {particles.current.map((p) => (
        <Particle key={p.id} x={p.x} color={p.color} delay={p.delay} />
      ))}
    </div>
  );
}

// ── Champion Result View ─────────────────────────────────────────────────────
function ChampionResultView({
  champion,
  game,
  canonicalUrl,
  onPlay,
}: {
  champion: string;
  game: ArenaGame;
  canonicalUrl: string;
  onPlay: () => void;
}) {
  const gameTitle = game.title_en || game.title_tr;
  const accentColor = CARD_COLOR_MAP[game.card_color as keyof typeof CARD_COLOR_MAP] ?? "#F59E0B";
  const [shared, setShared] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    getLeaderboard(game.slug, 5).then(setLeaderboard).catch(() => {});
  }, [game.slug]);

  const handleShare = useCallback(() => {
    const shareUrl = `${canonicalUrl}?champion=${encodeURIComponent(champion)}`;
    const shareText = `My champion in "${gameTitle}": ${champion}! Who's yours?`;
    if (navigator.share) {
      navigator.share({ title: `Scout Gamer Arena`, text: shareText, url: shareUrl }).catch(() => {});
    } else {
      const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(tweet, "_blank", "noopener,noreferrer");
    }
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  }, [champion, gameTitle, canonicalUrl]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20"
      style={{ background: "var(--sg-bg)" }}
    >
      <ConfettiLayer />

      {/* Glow backdrop */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 0 }}
      >
        <div
          className="rounded-full blur-3xl"
          style={{
            width: 420,
            height: 420,
            background: accentColor,
            opacity: 0.12,
          }}
        />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 text-center"
        initial={{ opacity: 0, scale: 0.75, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
      >
        {/* Trophy */}
        <motion.div
          className="text-6xl sm:text-7xl"
          animate={{ rotate: [-6, 6, -6] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        >
          🏆
        </motion.div>

        {/* Eyebrow */}
        <p
          className="text-xs font-black uppercase tracking-widest"
          style={{ color: accentColor, letterSpacing: "0.18em" }}
        >
          Their Champion
        </p>

        {/* Champion name */}
        <motion.h1
          className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl"
          style={{
            fontFamily: "var(--font-headline)",
            color: "var(--sg-text-primary)",
            textShadow: `0 0 40px ${accentColor}66`,
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {champion}
        </motion.h1>

        {/* Game context */}
        <motion.p
          className="text-sm"
          style={{ color: "var(--sg-text-secondary)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          {`chosen as champion in "${gameTitle}"`}
        </motion.p>

        {/* Divider */}
        <motion.div
          className="h-px w-24 rounded-full"
          style={{ background: accentColor, opacity: 0.4 }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.45 }}
        />

        {/* Challenge text */}
        <motion.p
          className="max-w-xs text-sm font-semibold"
          style={{ color: "var(--sg-text-secondary)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Who would YOU pick as champion?
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            type="button"
            onClick={onPlay}
            className="btn btn-solid"
            style={{ background: accentColor, borderColor: accentColor, padding: "12px 28px" }}
          >
            Play & pick yours →
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="btn"
            style={{ borderColor: `${accentColor}60` }}
          >
            {shared ? "✓ Copied!" : "↗ Share result"}
          </button>
        </motion.div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="w-full max-w-xs"
          >
            <p
              className="mb-3 text-center text-xs font-black uppercase tracking-[0.2em]"
              style={{ color: "var(--sg-text-muted)" }}
            >
              Community picks
            </p>
            <div className="flex flex-col gap-2">
              {leaderboard.map((entry, i) => {
                const maxVotes = leaderboard[0]?.vote_count ?? 1;
                const pct = Math.round((entry.vote_count / maxVotes) * 100);
                const isChamp = entry.champion_name === champion;
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <motion.div
                    key={entry.champion_name}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.95 + i * 0.08 }}
                    className="flex items-center gap-2"
                  >
                    <span className="w-5 shrink-0 text-center text-sm">{medals[i] ?? `${i + 1}.`}</span>
                    <div className="relative flex-1 overflow-hidden rounded-sm" style={{ height: 26 }}>
                      <motion.div
                        className="absolute inset-y-0 left-0"
                        style={{
                          background: isChamp ? accentColor : "rgba(26,58,92,0.7)",
                          opacity: isChamp ? 0.9 : 0.5,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 1.05 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                      />
                      <span
                        className="relative z-10 flex h-full items-center truncate px-2 text-xs font-semibold"
                        style={{ color: isChamp ? "#060f1e" : "var(--sg-text-primary)" }}
                      >
                        {entry.champion_name}
                      </span>
                    </div>
                    <span
                      className="w-8 shrink-0 text-right text-xs font-black tabular-nums"
                      style={{ color: isChamp ? accentColor : "var(--sg-text-muted)" }}
                    >
                      {entry.vote_count}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Back link */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <Link
            href="/arena"
            className="text-xs transition hover:underline"
            style={{ color: "var(--sg-text-secondary)" }}
          >
            ← Browse all arenas
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

const CARD_COLOR_MAP: Record<string, string> = {
  amber: "#F59E0B",
  primary: "#3B82F6",
  secondary: "#10B981",
  tertiary: "#8B5CF6",
};

// ── Main client component ────────────────────────────────────────────────────

export default function ArenaSlugClient({ game, canonicalUrl, initialChampion }: Props) {
  const title = game.title_en || game.title_tr;
  const description = game.description_en || game.description_tr;
  const router = useRouter();

  const [showResult, setShowResult] = useState(!!initialChampion);
  const [duelKey, setDuelKey] = useState(0);

  const handlePlay = useCallback(() => {
    // Strip champion param from URL without a page reload
    router.replace(`/arena/${game.slug}`, { scroll: false });
    setShowResult(false);
    setDuelKey((k) => k + 1);
  }, [router, game.slug]);

  const remount = useCallback(() => {
    setShowResult(false);
    setDuelKey((k) => k + 1);
  }, []);

  return (
    <main
      className="flex min-h-screen flex-col"
      style={{ background: "var(--sg-bg)", color: "var(--sg-text-primary)" }}
    >
      <SiteHeader activeNav="arena" maxWidth="max-w-7xl" />

      <AnimatePresence mode="wait">
        {showResult && initialChampion ? (
          <motion.div
            key="result"
            className="flex flex-1 flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChampionResultView
              champion={initialChampion}
              game={game}
              canonicalUrl={canonicalUrl}
              onPlay={handlePlay}
            />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            className="flex flex-1 flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Breadcrumb + controls + title */}
            <div className="sg-site-container pt-[88px] pb-2">
              <Breadcrumb
                items={[
                  { label: "Arena", href: "/arena" },
                  { label: title },
                ]}
              />
            </div>

            <div className="sg-site-container flex flex-wrap items-center gap-3 pb-4">
              <Link
                href="/arena"
                className="btn"
              >
                ← All Arenas
              </Link>
              <button
                type="button"
                onClick={remount}
                className="btn"
              >
                🔀 New Matchups
              </button>
            </div>

            <div className="mx-auto w-full max-w-2xl px-4 pb-6 text-center">
              <h1
                className="text-2xl font-black tracking-tight md:text-3xl"
                style={{ fontFamily: "var(--font-headline)", color: "var(--sg-text-primary)" }}
              >
                {title}
              </h1>
              <p className="mt-2 text-sm" style={{ color: "var(--sg-text-secondary)" }}>
                {description}
              </p>
            </div>

            {game.participants?.length > 0 && (
              <div className="flex flex-1 flex-col">
                <ArenaDuel
                  key={duelKey}
                  participants={game.participants}
                  gameType={game.game_type}
                  title={title}
                  lang="en"
                  canonicalUrl={canonicalUrl}
                  gameSlug={game.slug}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <SiteFooter maxWidth="max-w-7xl" />
    </main>
  );
}
