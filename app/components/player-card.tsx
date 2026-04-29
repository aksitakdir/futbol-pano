"use client";

import { motion } from "framer-motion";

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
  size?: "full" | "mini";
  showScoutNote?: boolean;
  tmLink?: string;
  gLink?: string;
  animated?: boolean;
};

function statColor(val: number): string {
  if (val >= 80) return "var(--tier-elite, #00d4aa)";
  if (val >= 65) return "var(--tier-good, #22d3ee)";
  return "var(--tier-base, #4a7a9a)";
}

function statBarBg(val: number): string {
  if (val >= 80) return "linear-gradient(90deg, var(--emerald, #00d4aa), var(--cyan, #22d3ee))";
  if (val >= 65) return "linear-gradient(90deg, var(--cyan, #22d3ee), var(--sky, #60a5fa))";
  return "var(--ink-700, #1a3a5c)";
}

function jerseyColors(name: string): { jersey: string; accent: string } {
  const palettes = [
    { jersey: "#fff7d6", accent: "#e6c452" },
    { jersey: "#1a3a8a", accent: "#c8102e" },
    { jersey: "#d71920", accent: "#ffffff" },
    { jersey: "#034694", accent: "#dba111" },
    { jersey: "#001f5b", accent: "#e30613" },
    { jersey: "#000000", accent: "#ffffff" },
    { jersey: "#c8102e", accent: "#ffffff" },
    { jersey: "#6cabdd", accent: "#1c2c5b" },
    { jersey: "#7a263a", accent: "#ffd700" },
    { jersey: "#004d98", accent: "#a50044" },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return palettes[Math.abs(hash) % palettes.length];
}

const STATS = [
  { key: "pace",      label: "PAC" },
  { key: "shooting",  label: "SHO" },
  { key: "passing",   label: "PAS" },
  { key: "dribbling", label: "DRI" },
  { key: "defending", label: "DEF" },
  { key: "physical",  label: "PHY" },
] as const;

function PlayerPortrait({ player, hasPhoto }: { player: PlayerCardData; hasPhoto: boolean }) {
  const { jersey, accent } = jerseyColors(player.name);
  const initials = player.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  const uid = `pg-${player.name.replace(/[^a-zA-Z]/g, "")}`;

  return (
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${jersey} 0%, ${accent} 100%)`, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.15, backgroundImage: "repeating-linear-gradient(-45deg, rgba(0,0,0,0.4) 0 2px, transparent 2px 14px)" }} />

      {hasPhoto ? (
        <img
          src={`/api/player-image?url=${encodeURIComponent(player.photo_url!)}`}
          alt={player.name}
          style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", height: "95%", width: "auto", objectFit: "cover", objectPosition: "top center" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <svg viewBox="0 0 200 280" preserveAspectRatio="xMidYMax meet"
          style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", width: "120%", height: "95%" }}>
          <defs>
            <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,0,0,0.0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
            </linearGradient>
          </defs>
          <path d="M 100 60 Q 130 60 130 90 Q 130 110 115 118 Q 145 122 165 145 Q 180 168 180 200 Q 180 240 180 280 L 20 280 Q 20 240 20 200 Q 20 168 35 145 Q 55 122 85 118 Q 70 110 70 90 Q 70 60 100 60 Z"
            fill="rgba(0,0,0,0.3)" />
          <rect x="0" y="0" width="200" height="280" fill={`url(#${uid})`} />
        </svg>
      )}

      <div style={{
        position: "absolute", right: "-8px", top: "-22px",
        fontSize: "clamp(80px, 22vw, 160px)", fontWeight: 700,
        fontFamily: "var(--font-headline)",
        color: "rgba(0,0,0,0.12)", lineHeight: 0.85, letterSpacing: "-0.06em",
        userSelect: "none", pointerEvents: "none",
      }}>{initials}</div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%", background: "linear-gradient(to top, rgba(15,18,24,0.95) 0%, transparent 100%)" }} />
    </div>
  );
}

function FullCard({ player, showScoutNote, tmLink, gLink, animated }: Omit<PlayerCardProps, "size">) {
  const hasPhoto = !!player.photo_url;

  const card = (
    <div style={{
      width: "100%", maxWidth: "260px",
      background: "var(--ink-800, #0a1628)",
      borderRadius: 4, overflow: "hidden",
      border: "1px solid var(--ink-700, #1a3a5c)",
      fontFamily: "var(--font-body, 'Trebuchet MS', sans-serif)",
      isolation: "isolate",
    }}>
      {/* Portrait */}
      <div style={{ position: "relative", aspectRatio: "3 / 4", width: "100%" }}>
        <PlayerPortrait player={player} hasPhoto={hasPhoto} />

        {/* Top meta */}
        <div style={{ position: "absolute", top: 12, left: 14, right: 14, zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(0,0,0,0.6)" }}>SCOUT GAMER</div>
            <div className="mono" style={{ fontSize: 8, letterSpacing: "0.14em", color: "rgba(0,0,0,0.45)", marginTop: 2 }}>{player.league} / {player.position}</div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", padding: "4px 8px", borderRadius: 2 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--tier-elite, #00d4aa)", lineHeight: 1, fontFamily: "var(--font-headline)" }}>{player.overall}</div>
          </div>
        </div>

        {/* Bottom name */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, padding: "12px 14px" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.1, fontFamily: "var(--font-headline)", letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {player.name}
          </div>
          <div className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 3, letterSpacing: "0.1em" }}>{player.club}</div>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{ padding: "10px 14px 12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4 }}>
          {STATS.map(({ key, label }) => {
            const val = player[key];
            return (
              <div key={key} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: statColor(val), lineHeight: 1, fontFamily: "var(--font-headline)" }}>{val}</div>
                <div className="mono" style={{ fontSize: 7, color: "var(--ink-500, #4a7a9a)", marginTop: 3, letterSpacing: "0.1em" }}>{label}</div>
                <div style={{ height: 2, background: "var(--ink-700, #1a3a5c)", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
                  <motion.div
                    initial={animated ? { width: 0 } : { width: `${val}%` }}
                    animate={{ width: `${val}%` }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                    style={{ height: "100%", borderRadius: 2, background: statBarBg(val) }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {showScoutNote && player.whyWatch && (
          <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.12)", borderRadius: 2 }}>
            <div className="eyebrow" style={{ fontSize: 8, marginBottom: 4 }}>Scout Notu</div>
            <div style={{ fontSize: 11, color: "var(--ink-300, #8ab0c0)", lineHeight: 1.5 }}>{player.whyWatch}</div>
          </div>
        )}

        {(tmLink || gLink) && (
          <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end", gap: 4 }}>
            {tmLink && <a href={tmLink} target="_blank" rel="noopener noreferrer" className="sg-btn" style={{ fontSize: 9, padding: "3px 8px" }}>TM</a>}
            {gLink && <a href={gLink} target="_blank" rel="noopener noreferrer" className="sg-btn" style={{ fontSize: 9, padding: "3px 8px" }}>G</a>}
          </div>
        )}
      </div>
    </div>
  );

  if (!animated) return card;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
    >
      {card}
    </motion.div>
  );
}

function MiniCard({ player, animated, tmLink, gLink }: Omit<PlayerCardProps, "size">) {
  const hasPhoto = !!player.photo_url;

  const card = (
    <div style={{
      width: "100%",
      background: "var(--ink-800, #0a1628)",
      borderRadius: 4, overflow: "hidden",
      border: "1px solid var(--ink-700, #1a3a5c)",
      fontFamily: "var(--font-body, 'Trebuchet MS', sans-serif)",
      isolation: "isolate",
    }}>
      <div style={{ position: "relative", aspectRatio: "1 / 1.15", width: "100%" }}>
        <PlayerPortrait player={player} hasPhoto={hasPhoto} />

        <div style={{ position: "absolute", top: 6, right: 6, zIndex: 2, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", padding: "2px 6px", borderRadius: 2 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "var(--tier-elite, #00d4aa)", lineHeight: 1, fontFamily: "var(--font-headline)" }}>{player.overall}</div>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, padding: "6px 8px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", lineHeight: 1.1, fontFamily: "var(--font-headline)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {player.name}
          </div>
          <div className="mono" style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", marginTop: 1, letterSpacing: "0.08em" }}>
            {player.club} · {player.position}
          </div>
        </div>
      </div>

      <div style={{ padding: "7px 8px 9px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>
          {STATS.map(({ key, label }) => {
            const val = player[key];
            return (
              <div key={key} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: statColor(val), lineHeight: 1, fontFamily: "var(--font-headline)" }}>{val}</div>
                <div className="mono" style={{ fontSize: 7, color: "var(--ink-500, #4a7a9a)", marginTop: 2, letterSpacing: "0.08em" }}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (!animated) return card;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
    >
      {card}
    </motion.div>
  );
}

export default function PlayerCard({ player, size = "full", showScoutNote, tmLink, gLink, animated = true }: PlayerCardProps) {
  if (size === "mini") return <MiniCard player={player} showScoutNote={showScoutNote} tmLink={tmLink} gLink={gLink} animated={animated} />;
  return <FullCard player={player} showScoutNote={showScoutNote} tmLink={tmLink} gLink={gLink} animated={animated} />;
}
