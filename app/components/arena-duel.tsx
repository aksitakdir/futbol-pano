"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recordVoteAndGetLeaderboard } from "@/app/arena/actions";
import type { LeaderboardEntry } from "@/app/arena/actions";
import type { ArenaGameType } from "@/lib/arena-brackets";
import {
  bracketLabelSize,
  normalizeArenaParticipants,
  arenaRoundNamesForCount,
  arenaNextRoundHeading,
} from "@/lib/arena-brackets";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ParticipantData = {
  name: string;
  subtitle?: string;
  photo_url?: string;
  vs?: string; // fixed_8 only
};

type Participant = {
  name: string;
  subtitle?: string;
  photo_url?: string;
};

type Match = { left: Participant; right: Participant };

type Phase = "playing" | "round_transition" | "champion";

export type ArenaDuelProps = {
  participants: ParticipantData[];
  gameType: ArenaGameType;
  title: string;
  lang?: "tr" | "en";
  canonicalUrl?: string;
  gameSlug?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const MATCH_LABEL_TR = "Maç";
const MATCH_LABEL_EN = "Match";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildInitialMatches(participants: ParticipantData[], gameType: ArenaGameType): Match[] {
  if (gameType === "fixed_8") {
    return participants.map((p) => ({
      left: { name: p.name, subtitle: p.subtitle, photo_url: p.photo_url },
      right: { name: p.vs ?? "TBD", subtitle: undefined },
    }));
  }
  const shuffled = shuffle(participants);
  const matches: Match[] = [];
  for (let i = 0; i < shuffled.length - 1; i += 2) {
    matches.push({
      left: { name: shuffled[i].name, subtitle: shuffled[i].subtitle, photo_url: shuffled[i].photo_url },
      right: { name: shuffled[i + 1].name, subtitle: shuffled[i + 1].subtitle, photo_url: shuffled[i + 1].photo_url },
    });
  }
  return matches;
}

// ─── Confetti Particle ────────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  "var(--sg-primary)", "var(--sg-secondary)", "var(--sg-amber)",
  "var(--sg-tertiary)", "#fb7185", "#a78bfa",
];

function ConfettiParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 1.4 + Math.random() * 1.2,
        size: 6 + Math.random() * 8,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rot: Math.random() * 360,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: "-20px",
            width: p.size,
            height: p.size * 0.5,
            background: p.color,
            rotate: p.rot,
          }}
          animate={{
            y: ["0vh", "110vh"],
            rotate: [p.rot, p.rot + 360 * (Math.random() > 0.5 ? 1 : -1)],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: p.dur, delay: p.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}

// ─── Player Card ──────────────────────────────────────────────────────────────

type PlayerCardProps = {
  participant: Participant;
  side: "left" | "right";
  onSelect: () => void;
  isLoser: boolean;
  isSelected: boolean;
  disabled: boolean;
  lang: "tr" | "en";
};

function PlayerCard({ participant, side, onSelect, isLoser, isSelected, disabled, lang }: PlayerCardProps) {
  const isEn = lang === "en";
  const btnLabel = isEn ? "CHOOSE" : "SEÇ";

  return (
    <motion.div
      key={`card-${participant.name}`}
      className="relative flex min-w-0 flex-1 flex-col"
      initial={{ opacity: 0, x: side === "left" ? -40 : 40 }}
      animate={
        isLoser
          ? { opacity: 0, scale: 0.8, y: 30, filter: "blur(4px)" }
          : { opacity: 1, x: 0, scale: isSelected ? 1.03 : 1, filter: "blur(0px)" }
      }
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="flex h-full w-full cursor-pointer flex-col overflow-hidden border transition-all duration-200"
        style={{
          background: "var(--sg-surface)",
          borderColor: isSelected ? "var(--sg-amber)" : "rgba(26,58,92,0.6)",
          boxShadow: isSelected
            ? "0 0 28px rgba(249,189,34,0.22), 0 0 0 2px var(--sg-amber)"
            : "none",
        }}
        onClick={disabled ? undefined : onSelect}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => { if (!disabled && (e.key === "Enter" || e.key === " ")) onSelect(); }}
      >
        {/* Photo / avatar area — shorter on mobile */}
        <div
          className="relative flex shrink-0 items-center justify-center overflow-hidden"
          style={{ height: "clamp(80px, 18vw, 176px)", background: "var(--sg-surface-low)" }}
        >
          {participant.photo_url ? (
            <img
              src={participant.photo_url}
              alt={participant.name}
              className="h-full w-full object-cover"
              style={{ filter: "brightness(0.85) saturate(0.9)" }}
            />
          ) : (
            <div
              className="flex items-center justify-center rounded-full font-black"
              style={{
                width: "clamp(36px, 9vw, 72px)",
                height: "clamp(36px, 9vw, 72px)",
                fontSize: "clamp(14px, 4vw, 32px)",
                background: "rgba(70,241,197,0.08)",
                color: "var(--sg-primary)",
                fontFamily: "var(--font-headline)",
              }}
            >
              {participant.name.charAt(0)}
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, transparent 50%, var(--sg-surface) 100%)" }}
          />
        </div>

        {/* Info — compact padding on mobile */}
        <div className="flex flex-1 flex-col px-2 pb-3 pt-2 text-center sm:px-4 sm:pb-4 sm:pt-3 md:px-5 md:pb-5">
          <h3
            className="mb-0.5 font-black leading-tight tracking-tight sm:mb-1"
            style={{
              fontFamily: "var(--font-headline)",
              color: "var(--sg-text-primary)",
              fontSize: "clamp(11px, 3.2vw, 20px)",
            }}
          >
            {participant.name}
          </h3>
          {participant.subtitle && (
            <p
              className="mb-2 font-semibold uppercase sm:mb-3 md:mb-5"
              style={{
                color: "var(--sg-text-muted)",
                fontSize: "clamp(8px, 2vw, 11px)",
                letterSpacing: "0.12em",
              }}
            >
              {participant.subtitle}
            </p>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={disabled ? undefined : (e) => { e.stopPropagation(); onSelect(); }}
            className="btn btn-solid mt-auto w-full justify-center disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: isSelected ? "var(--sg-amber)" : "var(--sg-primary)",
              borderColor: isSelected ? "var(--sg-amber)" : "var(--sg-primary)",
              fontSize: "clamp(9px, 2.4vw, 12px)",
              padding: "clamp(8px, 1.5vw, 12px) 8px",
            }}
          >
            {btnLabel}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ArenaDuel({ participants, gameType, title, lang = "tr", canonicalUrl, gameSlug }: ArenaDuelProps) {
  const isEn = lang === "en";
  const matchLabel = isEn ? MATCH_LABEL_EN : MATCH_LABEL_TR;

  const normalizedParticipants = useMemo(
    () => normalizeArenaParticipants(participants, gameType) as ParticipantData[],
    [participants, gameType],
  );

  const labelN = bracketLabelSize(gameType, normalizedParticipants.length);
  const roundNames = useMemo(() => arenaRoundNamesForCount(labelN, lang), [labelN, lang]);

  const effectiveBracketN = gameType === "fixed_8" ? 16 : normalizedParticipants.length;
  const totalMatchesAll = Math.max(1, effectiveBracketN - 1);

  const initialMatches = useMemo(
    () => buildInitialMatches(normalizedParticipants, gameType),
    [normalizedParticipants, gameType],
  );

  // All rounds accumulated as we play
  const [rounds, setRounds] = useState<Match[][]>([initialMatches]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [matchIndex, setMatchIndex] = useState(0);
  const [roundWinners, setRoundWinners] = useState<Participant[]>([]);
  const [phase, setPhase] = useState<Phase>("playing");
  const [selectedSide, setSelectedSide] = useState<"left" | "right" | null>(null);
  const [champion, setChampion] = useState<Participant | null>(null);
  const [matchKey, setMatchKey] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Refs to avoid stale closure inside setTimeout
  const stateRef = useRef({ roundIndex, matchIndex, roundWinners, rounds });
  useEffect(() => {
    stateRef.current = { roundIndex, matchIndex, roundWinners, rounds };
  });

  const currentRound = rounds[roundIndex] ?? [];
  const currentMatch = currentRound[matchIndex];
  const totalMatchesInRound = currentRound.length;

  // Global progress across all rounds (e.g. 8+4+2+1 for 16 bracket)
  const matchesBefore = rounds.slice(0, roundIndex).reduce((s, r) => s + r.length, 0);
  const globalMatchNum = matchesBefore + matchIndex + 1;
  const progressPct = ((globalMatchNum - 1) / totalMatchesAll) * 100;

  const handleSelect = useCallback(
    (side: "left" | "right") => {
      if (selectedSide !== null) return;
      setSelectedSide(side);

      const { roundIndex: ri, matchIndex: mi, roundWinners: rw, rounds: rs } = stateRef.current;
      const round = rs[ri];
      const match = round[mi];
      const winner = side === "left" ? match.left : match.right;

      setTimeout(() => {
        const newWinners = [...rw, winner];

        if (mi + 1 < round.length) {
          // More matches in this round
          setRoundWinners(newWinners);
          setMatchIndex(mi + 1);
          setSelectedSide(null);
          setMatchKey((k) => k + 1);
        } else if (newWinners.length === 1) {
          // Champion!
          setChampion(newWinners[0]);
          setPhase("champion");
          // Oyu kaydet ve leaderboard'u güncelle
          if (gameSlug) {
            recordVoteAndGetLeaderboard(gameSlug, newWinners[0].name).then(setLeaderboard).catch(() => {});
          }
        } else {
          // Round complete — build next round
          const nextMatches: Match[] = [];
          for (let i = 0; i + 1 < newWinners.length; i += 2) {
            nextMatches.push({ left: newWinners[i], right: newWinners[i + 1] });
          }
          setRounds((prev) => [...prev, nextMatches]);
          setPhase("round_transition");

          setTimeout(() => {
            setRoundIndex(ri + 1);
            setMatchIndex(0);
            setRoundWinners([]);
            setSelectedSide(null);
            setMatchKey((k) => k + 1);
            setPhase("playing");
          }, 2600);
        }
      }, 580);
    },
    [selectedSide],
  );

  const handleRestart = useCallback(() => {
    const fresh = buildInitialMatches(normalizedParticipants, gameType);
    setRounds([fresh]);
    setRoundIndex(0);
    setMatchIndex(0);
    setRoundWinners([]);
    setPhase("playing");
    setSelectedSide(null);
    setChampion(null);
    setMatchKey((k) => k + 1);
  }, [normalizedParticipants, gameType]);

  const handleShare = useCallback(() => {
    if (!champion) return;
    const shareTitle = isEn
      ? `My champion in "${title}": ${champion.name}! Who's yours?`
      : `"${title}" turnuvasında şampiyonum: ${champion.name}! Seninki kim?`;
    // Embed champion name in URL so the shared link shows a champion-specific OG image
    const base = canonicalUrl ?? "https://www.scoutgamer.com/arena";
    const shareUrl = `${base}?champion=${encodeURIComponent(champion.name)}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: shareTitle, url: shareUrl }).catch(() => {});
    } else {
      const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareTitle + "\n" + shareUrl)}`;
      window.open(twitterUrl, "_blank", "noopener,noreferrer");
    }
  }, [champion, title, isEn, canonicalUrl]);

  // ── Champion Screen ──────────────────────────────────────────────────────────
  if (phase === "champion" && champion) {
    return (
      <div
        className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden px-6 py-16"
        style={{ background: "var(--sg-bg)" }}
      >
        <ConfettiParticles />

        {/* Glow halo */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
          style={{
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, var(--sg-amber) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-center gap-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl"
          >
            🏆
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs font-black uppercase tracking-[0.3em]"
            style={{ color: "var(--sg-amber)", fontFamily: "var(--font-headline)" }}
          >
            {isEn ? "Champion" : "Şampiyon"}
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="font-black leading-none tracking-tighter"
            style={{
              fontFamily: "var(--font-headline)",
              fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
              background: "linear-gradient(135deg, var(--sg-amber), var(--sg-primary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 24px rgba(249,189,34,0.4))",
            }}
          >
            {champion.name}
          </motion.h2>

          {champion.subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--sg-text-secondary)" }}
            >
              {champion.subtitle}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-4 flex gap-3"
          >
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-3 font-black uppercase tracking-wider transition-all hover:brightness-110 active:scale-95"
              style={{
                background: "var(--sg-amber)",
                color: "#060f1e",
                fontFamily: "var(--font-headline)",
                fontSize: "11px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
              </svg>
              {isEn ? "Share" : "Paylaş"}
            </button>
            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center gap-2 px-6 py-3 font-black uppercase tracking-wider transition-all hover:brightness-110 active:scale-95"
              style={{
                background: "var(--sg-surface)",
                color: "var(--sg-text-secondary)",
                border: "1px solid rgba(26,58,92,0.6)",
                fontFamily: "var(--font-headline)",
                fontSize: "11px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12a9 9 0 109-9M3 3v6h6" />
              </svg>
              {isEn ? "Play Again" : "Yeniden Oyna"}
            </button>
          </motion.div>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="mt-8 w-full max-w-xs"
            >
              <p
                className="mb-3 text-center text-xs font-black uppercase tracking-[0.2em]"
                style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}
              >
                {isEn ? "Community picks" : "Topluluk seçimleri"}
              </p>
              <div className="flex flex-col gap-2">
                {leaderboard.map((entry, i) => {
                  const maxVotes = leaderboard[0]?.vote_count ?? 1;
                  const pct = Math.round((entry.vote_count / maxVotes) * 100);
                  const isWinner = entry.champion_name === champion.name;
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <motion.div
                      key={entry.champion_name}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3 + i * 0.08 }}
                      className="flex items-center gap-2"
                    >
                      <span className="w-5 shrink-0 text-center text-sm">{medals[i] ?? `${i + 1}.`}</span>
                      <div className="relative flex-1 overflow-hidden rounded-sm" style={{ height: 26 }}>
                        <motion.div
                          className="absolute inset-y-0 left-0"
                          style={{
                            background: isWinner
                              ? "var(--sg-amber)"
                              : "rgba(26,58,92,0.7)",
                            opacity: isWinner ? 0.9 : 0.5,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 1.4 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                        />
                        <span
                          className="relative z-10 flex h-full items-center px-2 text-xs font-semibold truncate"
                          style={{ color: isWinner ? "#060f1e" : "var(--sg-text-primary)" }}
                        >
                          {entry.champion_name}
                        </span>
                      </div>
                      <span
                        className="w-8 shrink-0 text-right text-xs font-black tabular-nums"
                        style={{ color: isWinner ? "var(--sg-amber)" : "var(--sg-text-muted)" }}
                      >
                        {entry.vote_count}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // ── Round Transition Screen ──────────────────────────────────────────────────
  if (phase === "round_transition") {
    return (
      <div
        className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-20"
        style={{ background: "var(--sg-bg)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="text-4xl">⚡</div>
          <p
            className="text-xs font-black uppercase tracking-[0.3em]"
            style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}
          >
            {isEn ? "Round Complete" : "Round Tamamlandı"}
          </p>
          <h2
            className="font-black leading-none tracking-tighter"
            style={{
              fontFamily: "var(--font-headline)",
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              background: "linear-gradient(135deg, var(--sg-primary), var(--sg-secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {arenaNextRoundHeading(roundNames, roundIndex, lang)}
          </h2>

          <motion.div
            className="mt-2 h-1 overflow-hidden rounded-full"
            style={{ width: "160px", background: "rgba(26,58,92,0.5)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--sg-primary)" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.4, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ── Playing Screen ───────────────────────────────────────────────────────────
  if (!currentMatch) return null;

  const loserSide = selectedSide === "left" ? "right" : selectedSide === "right" ? "left" : null;

  return (
    // min-h-screen ensures the playing section alone fills the viewport — footer stays below the fold
    <div className="flex w-full flex-col" style={{ background: "var(--sg-bg)", minHeight: "100svh" }}>
      {/* Progress bar */}
      <div className="w-full px-4 py-4 md:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-2 flex items-center justify-between">
            <span
              className="text-xs font-black uppercase tracking-[0.2em]"
              style={{ color: "var(--sg-amber)", fontFamily: "var(--font-headline)" }}
            >
              {roundNames[roundIndex] ?? ""}
            </span>
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--sg-text-muted)", fontFamily: "var(--font-headline)" }}
            >
              {matchLabel} {matchIndex + 1}/{totalMatchesInRound}
            </span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: "rgba(26,58,92,0.5)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--sg-amber)" }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* Cards — always side-by-side on all screen sizes */}
      <AnimatePresence mode="wait">
        <motion.div
          key={matchKey}
          className="mx-auto flex w-full max-w-2xl flex-row items-stretch gap-2 px-3 pb-8 sm:gap-4 sm:px-5 md:gap-8 md:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Left card */}
          <PlayerCard
            participant={currentMatch.left}
            side="left"
            onSelect={() => handleSelect("left")}
            isLoser={loserSide === "left"}
            isSelected={selectedSide === "left"}
            disabled={selectedSide !== null}
            lang={lang}
          />

          {/* VS divider — always vertical */}
          <div className="flex shrink-0 flex-col items-center justify-center gap-2 py-4"
            style={{ width: "clamp(20px, 5vw, 40px)" }}>
            <div className="flex-1 w-px" style={{ background: "rgba(26,58,92,0.5)" }} />
            <motion.span
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="font-black tracking-widest"
              style={{
                color: "var(--sg-text-muted)",
                fontFamily: "var(--font-headline)",
                fontSize: "clamp(9px, 2.4vw, 14px)",
              }}
            >
              VS
            </motion.span>
            <div className="flex-1 w-px" style={{ background: "rgba(26,58,92,0.5)" }} />
          </div>

          {/* Right card */}
          <PlayerCard
            participant={currentMatch.right}
            side="right"
            onSelect={() => handleSelect("right")}
            isLoser={loserSide === "right"}
            isSelected={selectedSide === "right"}
            disabled={selectedSide !== null}
            lang={lang}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
