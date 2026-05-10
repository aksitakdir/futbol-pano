"use client";

import { motion } from "framer-motion";

/* ─── Public types ───────────────────────────────────────────────── */
export type PlayerCardData = {
  name: string;
  club: string;
  league: string;
  position: string;
  age: string | number;
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  whyWatch?: string;
  photo_url?: string; // kept for API compat — intentionally unused
};

type PlayerCardProps = {
  player: PlayerCardData;
  size?: "full" | "mini";
  showScoutNote?: boolean;
  tmLink?: string;
  gLink?: string;
  animated?: boolean;
};

/* ─── Gradient palette (name-hash → consistent, varied colours) ──── */
const GRADIENTS = [
  "linear-gradient(160deg, oklch(0.24 0.09 155), oklch(0.12 0.05 155))",  // emerald
  "linear-gradient(160deg, oklch(0.20 0.09 270), oklch(0.10 0.05 270))",  // purple
  "linear-gradient(160deg, oklch(0.18 0.06 230), oklch(0.10 0.03 230))",  // slate-blue
  "linear-gradient(160deg, oklch(0.22 0.10 18),  oklch(0.12 0.05 18))",   // rose
  "linear-gradient(160deg, oklch(0.20 0.09 45),  oklch(0.10 0.05 45))",   // amber
  "linear-gradient(160deg, oklch(0.20 0.08 200), oklch(0.10 0.04 200))",  // cyan
  "linear-gradient(160deg, oklch(0.22 0.09 310), oklch(0.11 0.05 310))",  // pink-violet
  "linear-gradient(160deg, oklch(0.18 0.07 130), oklch(0.10 0.04 130))",  // lime-dark
];

function nameHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (Math.imul(31, h) + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function gradient(name: string) {
  return GRADIENTS[nameHash(name) % GRADIENTS.length];
}

/* ─── Stat helpers ───────────────────────────────────────────────── */
const STATS = [
  { key: "pace",      label: "PAC" },
  { key: "shooting",  label: "SHO" },
  { key: "passing",   label: "PAS" },
  { key: "dribbling", label: "DRI" },
  { key: "defending", label: "DEF" },
  { key: "physical",  label: "PHY" },
] as const;

function statColor(v: number) {
  return v >= 80 ? "var(--emerald, #00d4aa)" : v >= 65 ? "var(--cyan, #22d3ee)" : "oklch(0.55 0.04 230)";
}

/* ─── Human silhouette SVG ───────────────────────────────────────── */
function Silhouette({ opacity = 0.13 }: { opacity?: number }) {
  return (
    <svg
      viewBox="0 0 100 155"
      fill={`oklch(1 0 0 / ${opacity})`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0, pointerEvents: "none" }}
      aria-hidden
    >
      {/* Head */}
      <circle cx="50" cy="36" r="20" />
      {/* Neck */}
      <rect x="44" y="54" width="12" height="10" rx="4" />
      {/* Shoulders / torso */}
      <path d="M8 75 Q8 62 50 62 Q92 62 92 75 L88 120 L12 120 Z" />
      {/* Legs */}
      <rect x="20" y="118" width="24" height="37" rx="8" />
      <rect x="56" y="118" width="24" height="37" rx="8" />
    </svg>
  );
}

/* ─── FULL card ──────────────────────────────────────────────────── */
function FullCard({ player, showScoutNote, tmLink, gLink, animated }: Omit<PlayerCardProps, "size">) {
  const initials = player.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const bg = gradient(player.name);

  const inner = (
    <div style={{
      width: "100%", maxWidth: 220,
      borderRadius: 12, overflow: "hidden",
      background: bg,
      border: "1px solid oklch(1 0 0 / 0.08)",
      position: "relative",
      fontFamily: "var(--font-mono-stack, 'IBM Plex Mono', monospace)",
    }}>
      {/* Diagonal stripe texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(-45deg, oklch(1 0 0 / 0.04) 0 1px, transparent 1px 14px)",
      }} />

      {/* ── Top bar: position + overall ── */}
      <div style={{
        position: "relative", display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "10px 12px 0",
      }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "oklch(1 0 0 / 0.45)" }}>
          {player.position}
        </span>
        <span style={{ fontSize: 30, fontWeight: 900, color: "oklch(1 0 0 / 0.90)", lineHeight: 1, letterSpacing: "-0.03em" }}>
          {player.overall}
        </span>
      </div>

      {/* ── Silhouette area ── */}
      <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
        {/* Background initials */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 100, fontWeight: 900, letterSpacing: "-0.08em",
          color: "oklch(1 0 0 / 0.07)",
          fontFamily: "var(--font-display, 'Space Grotesk', sans-serif)",
          userSelect: "none", lineHeight: 1,
          transform: "translateY(10%)",
        }}>
          {initials}
        </div>
        {/* Humanoid silhouette */}
        <Silhouette opacity={0.14} />
      </div>

      {/* ── Name + club gradient overlay ── */}
      <div style={{
        position: "relative",
        padding: "6px 12px 4px",
        background: "linear-gradient(to top, oklch(0 0 0 / 0.75) 0%, transparent 100%)",
      }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: "oklch(1 0 0 / 0.92)", lineHeight: 1.15,
          fontFamily: "var(--font-display, 'Space Grotesk', sans-serif)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {player.name}
        </div>
        <div style={{ fontSize: 8, color: "oklch(1 0 0 / 0.40)", letterSpacing: "0.07em", marginTop: 2 }}>
          {player.club} · {player.league}
        </div>
      </div>

      {/* ── Stat strip ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(6, 1fr)",
        padding: "7px 10px 9px",
        background: "oklch(0 0 0 / 0.45)",
        position: "relative",
      }}>
        {STATS.map(({ key, label }) => {
          const val = player[key];
          return (
            <div key={key} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: statColor(val), lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 7, color: "oklch(1 0 0 / 0.28)", letterSpacing: "0.06em", marginTop: 1 }}>{label}</div>
            </div>
          );
        })}
      </div>

      {/* Scout note (optional) */}
      {showScoutNote && player.whyWatch && (
        <div style={{
          margin: "0 10px 10px",
          padding: "8px 10px",
          background: "oklch(1 0 0 / 0.04)",
          border: "1px solid oklch(1 0 0 / 0.10)",
          borderRadius: 6,
          position: "relative",
        }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", color: "oklch(0.72 0.14 199)", textTransform: "uppercase", marginBottom: 4 }}>
            Scout Notu
          </div>
          <div style={{ fontSize: 10, color: "oklch(1 0 0 / 0.55)", lineHeight: 1.55 }}>{player.whyWatch}</div>
        </div>
      )}

      {/* TM / G links */}
      {(tmLink || gLink) && (
        <div style={{
          padding: "5px 10px 8px", display: "flex", justifyContent: "flex-end", gap: 4,
          borderTop: "1px solid oklch(1 0 0 / 0.06)", position: "relative",
        }}>
          {tmLink && <a href={tmLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 8, fontWeight: 700, color: "oklch(1 0 0 / 0.35)", background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.10)", borderRadius: 3, padding: "2px 6px", textDecoration: "none" }}>TM</a>}
          {gLink && <a href={gLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 8, fontWeight: 700, color: "oklch(1 0 0 / 0.35)", background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.10)", borderRadius: 3, padding: "2px 6px", textDecoration: "none" }}>G</a>}
        </div>
      )}
    </div>
  );

  if (!animated) return inner;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {inner}
    </motion.div>
  );
}

/* ─── MINI card ──────────────────────────────────────────────────── */
function MiniCard({ player, animated, tmLink, gLink }: Omit<PlayerCardProps, "size">) {
  const initials = player.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const bg = gradient(player.name);

  const inner = (
    <div style={{
      width: "100%",
      borderRadius: 10, overflow: "hidden",
      background: bg,
      border: "1px solid oklch(1 0 0 / 0.08)",
      position: "relative",
      fontFamily: "var(--font-mono-stack, 'IBM Plex Mono', monospace)",
    }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(-45deg, oklch(1 0 0 / 0.04) 0 1px, transparent 1px 12px)" }} />

      {/* Top: position + overall */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px 0" }}>
        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.14em", color: "oklch(1 0 0 / 0.40)" }}>{player.position}</span>
        <span style={{ fontSize: 22, fontWeight: 900, color: "oklch(1 0 0 / 0.90)", lineHeight: 1 }}>{player.overall}</span>
      </div>

      {/* Silhouette */}
      <div style={{ position: "relative", height: 100, overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 64, fontWeight: 900, letterSpacing: "-0.08em",
          color: "oklch(1 0 0 / 0.07)",
          fontFamily: "var(--font-display, 'Space Grotesk', sans-serif)",
          userSelect: "none", lineHeight: 1, transform: "translateY(12%)",
        }}>
          {initials}
        </div>
        <Silhouette opacity={0.13} />
      </div>

      {/* Name + club */}
      <div style={{ position: "relative", padding: "4px 10px 3px", background: "linear-gradient(to top, oklch(0 0 0 / 0.70) 0%, transparent 100%)" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "oklch(1 0 0 / 0.92)", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-display, 'Space Grotesk', sans-serif)" }}>{player.name}</div>
        <div style={{ fontSize: 7, color: "oklch(1 0 0 / 0.38)", letterSpacing: "0.06em", marginTop: 1 }}>{player.club}</div>
      </div>

      {/* Stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", padding: "6px 8px 8px", background: "oklch(0 0 0 / 0.45)", position: "relative" }}>
        {STATS.map(({ key, label }) => {
          const val = player[key];
          return (
            <div key={key} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: statColor(val), lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 6, color: "oklch(1 0 0 / 0.25)", letterSpacing: "0.05em", marginTop: 1 }}>{label}</div>
            </div>
          );
        })}
      </div>

      {(tmLink || gLink) && (
        <div style={{ padding: "4px 8px 6px", display: "flex", justifyContent: "flex-end", gap: 3, borderTop: "1px solid oklch(1 0 0 / 0.06)", position: "relative" }}>
          {tmLink && <a href={tmLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 7, fontWeight: 700, color: "oklch(1 0 0 / 0.30)", background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.10)", borderRadius: 3, padding: "2px 5px", textDecoration: "none" }}>TM</a>}
          {gLink && <a href={gLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 7, fontWeight: 700, color: "oklch(1 0 0 / 0.30)", background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.10)", borderRadius: 3, padding: "2px 5px", textDecoration: "none" }}>G</a>}
        </div>
      )}
    </div>
  );

  if (!animated) return inner;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {inner}
    </motion.div>
  );
}

/* ─── Export ─────────────────────────────────────────────────────── */
export default function PlayerCard({ player, size = "full", showScoutNote, tmLink, gLink, animated = true }: PlayerCardProps) {
  if (size === "mini") return <MiniCard player={player} showScoutNote={showScoutNote} tmLink={tmLink} gLink={gLink} animated={animated} />;
  return <FullCard player={player} showScoutNote={showScoutNote} tmLink={tmLink} gLink={gLink} animated={animated} />;
}
