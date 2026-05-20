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
  photo_url?: string;
};

type PlayerCardProps = {
  player: PlayerCardData;
  /** Küçük grid için — layout hep dikey ve aynı oran */
  compact?: boolean;
  showScoutNote?: boolean;
  tmLink?: string;
  gLink?: string;
  animated?: boolean;
};

/* ─── Card themes ─────────────────────────────────────────────────── */
type CardTheme = {
  bg: string;
  initials: string;
};

const CARD_THEMES: CardTheme[] = [
  {
    bg: "linear-gradient(168deg, oklch(0.82 0.11 98), oklch(0.58 0.10 82))",
    initials: "oklch(0.48 0.09 88 / 0.52)",
  },
  {
    bg: "linear-gradient(168deg, oklch(0.72 0.14 301), oklch(0.50 0.12 292))",
    initials: "oklch(0.42 0.14 298 / 0.48)",
  },
  {
    bg: "linear-gradient(168deg, oklch(0.74 0.08 240), oklch(0.52 0.07 232))",
    initials: "oklch(0.40 0.08 238 / 0.46)",
  },
  {
    bg: "linear-gradient(168deg, oklch(0.78 0.10 18), oklch(0.58 0.09 22))",
    initials: "oklch(0.48 0.10 22 / 0.48)",
  },
  {
    bg: "linear-gradient(168deg, oklch(0.80 0.12 72), oklch(0.58 0.11 65))",
    initials: "oklch(0.50 0.11 68 / 0.48)",
  },
  {
    bg: "linear-gradient(168deg, oklch(0.76 0.10 200), oklch(0.54 0.09 198))",
    initials: "oklch(0.42 0.09 202 / 0.46)",
  },
  {
    bg: "linear-gradient(168deg, oklch(0.74 0.13 313), oklch(0.52 0.11 308))",
    initials: "oklch(0.42 0.13 312 / 0.46)",
  },
  {
    bg: "linear-gradient(168deg, oklch(0.78 0.11 128), oklch(0.56 0.09 132))",
    initials: "oklch(0.46 0.10 132 / 0.46)",
  },
];

/** Single-direction diagonal lines (previous linear hatch) */
const CARD_TEXTURE =
  "repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.075) 0 1px, transparent 1px 14px)";

const HEADER_FG = "oklch(0.22 0.02 260)";

function nameHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (Math.imul(31, h) + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function cardTheme(name: string): CardTheme {
  return CARD_THEMES[nameHash(name) % CARD_THEMES.length]!;
}

function cardSerial(name: string): string {
  const n = (nameHash(name) % 899) + 1;
  return String(n).padStart(3, "0");
}

/** Compact scales typography/spacing; aspect stays portrait */
function d(compact: boolean, px: number) {
  return compact ? Math.max(6, Math.round(px * 0.82)) : px;
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

/** Orijinal tasarıma göre baş harf alanı ~%20 büyütme (108→130, 198→238 taban px) */
const INITIAL_ZONE_HEIGHT_BASE = 238;
const INITIAL_FONT_BASE = 130;

function statColor(v: number) {
  if (v >= 85) return "#00d4aa";
  if (v >= 70) return "#22d3ee";
  if (v >= 55) return "oklch(0.72 0.10 220)";
  return "oklch(0.50 0.04 230)";
}

function LinkPill({ href, label, size = "md" }: { href: string; label: string; size?: "sm" | "md" }) {
  const fs = size === "sm" ? 7 : 8;
  const px = size === "sm" ? "5px" : "6px";
  const py = "2px";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontSize: fs,
        fontWeight: 700,
        color: "oklch(1 0 0 / 0.40)",
        background: "oklch(1 0 0 / 0.07)",
        border: "1px solid oklch(1 0 0 / 0.12)",
        borderRadius: 4,
        padding: `${py} ${px}`,
        textDecoration: "none",
        letterSpacing: "0.06em",
      }}
    >
      {label}
    </a>
  );
}

/* ─── Single vertical card ───────────────────────────────────────── */
function CardInner({
  player,
  compact,
  showScoutNote,
  tmLink,
  gLink,
}: Omit<PlayerCardProps, "animated"> & { compact: boolean }) {
  const initials = player.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const theme = cardTheme(player.name);

  const bw = compact ? "min(260px, 100%)" : 260;
  const rad = d(compact, 14);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: bw,
        margin: "0 auto",
        borderRadius: rad,
        overflow: "hidden",
        background: theme.bg,
        border: "1px solid oklch(0 0 0 / 0.12)",
        position: "relative",
        fontFamily: "var(--font-mono-stack, 'IBM Plex Mono', monospace)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: CARD_TEXTURE,
        }}
      />

      <div
        style={{
          position: "relative",
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: d(compact, 10),
          padding: `${d(compact, 12)}px ${d(compact, 14)}px ${d(compact, 8)}px`,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: d(compact, 8),
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: HEADER_FG,
              textTransform: "uppercase",
              lineHeight: 1.35,
            }}
          >
            SCOUT GAMER • №{cardSerial(player.name)}
          </div>
          <div
            style={{
              fontSize: d(compact, 8),
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "oklch(0.35 0.03 260)",
              textTransform: "uppercase",
              marginTop: d(compact, 4),
            }}
          >
            {player.league} / {player.position}
          </div>
        </div>
        <div
          style={{
            flexShrink: 0,
            textAlign: "right",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              fontSize: d(compact, 36),
              fontWeight: 900,
              color: HEADER_FG,
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            {player.overall}
          </div>
          <div
            style={{
              fontSize: d(compact, 7),
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: "oklch(0.38 0.02 260)",
              marginTop: d(compact, 3),
            }}
          >
            OVR
          </div>
        </div>
      </div>

      {/* Merkez — büyük yarı saydam baş harfler (silüet yerine) */}
      <div
        style={{
          position: "relative",
          flexShrink: 0,
          height: d(compact, INITIAL_ZONE_HEIGHT_BASE),
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontSize: d(compact, INITIAL_FONT_BASE),
            fontWeight: 900,
            letterSpacing: "-0.12em",
            lineHeight: 0.82,
            color: theme.initials,
            fontFamily: "var(--font-display, 'Space Grotesk', sans-serif)",
            userSelect: "none",
          }}
        >
          {initials}
        </span>
      </div>

      <div
        style={{
          position: "relative",
          flexShrink: 0,
          padding: `${d(compact, 10)}px ${d(compact, 14)}px ${d(compact, 8)}px`,
          background: "oklch(0 0 0 / 0.35)",
          borderTop: "1px solid oklch(1 0 0 / 0.07)",
        }}
      >
        <div
          style={{
            fontSize: d(compact, 15),
            fontWeight: 700,
            color: "oklch(1 0 0 / 0.95)",
            lineHeight: 1.15,
            fontFamily: "var(--font-display, 'Space Grotesk', sans-serif)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {player.name}
        </div>
        <div
          style={{
            fontSize: d(compact, 9),
            color: "oklch(1 0 0 / 0.42)",
            letterSpacing: "0.07em",
            marginTop: d(compact, 3),
          }}
        >
          {player.club} · {player.league}
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          padding: `${d(compact, 9)}px ${d(compact, 12)}px ${d(compact, 10)}px`,
          background: "oklch(0 0 0 / 0.50)",
          borderTop: "1px solid oklch(1 0 0 / 0.06)",
        }}
      >
        {STATS.map(({ key, label }) => {
          const val = player[key];
          return (
            <div key={key} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: d(compact, 13),
                  fontWeight: 900,
                  color: statColor(val),
                  lineHeight: 1,
                }}
              >
                {val}
              </div>
              <div
                style={{
                  fontSize: d(compact, 7),
                  color: "oklch(1 0 0 / 0.30)",
                  letterSpacing: "0.07em",
                  marginTop: 2,
                  textTransform: "uppercase",
                }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {showScoutNote && player.whyWatch && (
        <div
          style={{
            flexShrink: 0,
            margin: `0 ${d(compact, 12)}px ${d(compact, 10)}px`,
            padding: `${d(compact, 8)}px ${d(compact, 10)}px`,
            background: "oklch(1 0 0 / 0.04)",
            border: "1px solid oklch(1 0 0 / 0.10)",
            borderRadius: 6,
          }}
        >
          <div
            style={{
              fontSize: d(compact, 8),
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "oklch(0.72 0.14 199)",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Scout Notu
          </div>
          <div style={{ fontSize: d(compact, 10), color: "oklch(1 0 0 / 0.55)", lineHeight: 1.55 }}>
            {player.whyWatch}
          </div>
        </div>
      )}

      {(tmLink || gLink) && (
        <div
          style={{
            flexShrink: 0,
            padding: `${d(compact, 6)}px ${d(compact, 12)}px ${d(compact, 10)}px`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 5,
          }}
        >
          {tmLink && <LinkPill href={tmLink} label="TM" />}
          {gLink && <LinkPill href={gLink} label="G" />}
        </div>
      )}
    </div>
  );
}

export default function PlayerCard({
  player,
  compact = false,
  showScoutNote,
  tmLink,
  gLink,
  animated = true,
}: PlayerCardProps) {
  const inner = (
    <CardInner
      player={player}
      compact={compact}
      showScoutNote={showScoutNote}
      tmLink={tmLink}
      gLink={gLink}
    />
  );

  if (!animated) return inner;
  return (
    <motion.div
      initial={{ opacity: 0, y: compact ? 14 : 20, scale: compact ? 0.94 : 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: compact ? 0.45 : 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: "100%", display: "flex", justifyContent: "center" }}
    >
      {inner}
    </motion.div>
  );
}
