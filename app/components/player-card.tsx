"use client";

import { motion } from "framer-motion";
import Image from "next/image";

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
  if (val >= 80) return "#00d4aa";
  if (val >= 65) return "#22d3ee";
  return "#4a7a9a";
}

function statBarColor(val: number): string {
  if (val >= 80) return "linear-gradient(90deg, #00d4aa, #22d3ee)";
  if (val >= 65) return "linear-gradient(90deg, #22d3ee, #60a5fa)";
  return "#1a3a5c";
}

const STATS = [
  { key: "pace",      label: "PAC" },
  { key: "shooting",  label: "SHO" },
  { key: "passing",   label: "PAS" },
  { key: "dribbling", label: "DRI" },
  { key: "defending", label: "DEF" },
  { key: "physical",  label: "PHY" },
] as const;

function PlayerPhoto({ url, name, size }: { url?: string; name: string; size: "full" | "mini" }) {
  const dim = size === "full" ? 80 : 52;
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  if (!url) {
    return (
      <div style={{
        width: dim, height: dim, borderRadius: "50%",
        background: "linear-gradient(135deg, #0f2a4a, #071628)",
        border: "2px solid #1a3a5c",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size === "full" ? 20 : 14,
        fontWeight: 900, color: "#00d4aa", flexShrink: 0,
      }}>
        {initials}
      </div>
    );
  }

  return (
    <div style={{
      width: dim, height: dim, borderRadius: "50%",
      border: "2px solid #00d4aa33",
      overflow: "hidden", flexShrink: 0,
      background: "#0a1628",
    }}>
      <Image
        src={url}
        alt={name}
        width={dim}
        height={dim}
        style={{ objectFit: "cover", objectPosition: "top" }}
        unoptimized
      />
    </div>
  );
}

function FullCard({ player, showScoutNote, tmLink, gLink, animated }: Omit<PlayerCardProps, "size">) {
  const card = (
    <div style={{
      width: "100%", maxWidth: "240px",
      background: "#060f1e", borderRadius: "14px",
      overflow: "hidden", border: "1px solid #1a3a5c",
      fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        padding: "14px 14px 12px",
        background: "linear-gradient(135deg, #0a1f3a 0%, #071628 100%)",
        borderBottom: "1px solid #1a3a5c", position: "relative",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,212,170,0.07) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
            <PlayerPhoto url={player.photo_url} name={player.name} size="full" />
            <div>
              <div style={{ fontSize: "40px", fontWeight: 900, color: "#00d4aa", lineHeight: 1, textShadow: "0 0 24px rgba(0,212,170,0.5)" }}>
                {player.overall}
              </div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#00d4aa", letterSpacing: "2px", textTransform: "uppercase" }}>
                {player.position}
              </div>
              <div style={{ fontSize: "10px", color: "#2a5a7a", marginTop: "2px" }}>{player.age} yaş</div>
            </div>
          </div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#e0f0ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {player.name}
          </div>
          <div style={{ fontSize: "11px", color: "#4a7a9a", marginTop: "2px" }}>{player.club}</div>
          <div style={{ height: "2px", background: "linear-gradient(90deg, #00d4aa, #22d3ee, transparent)", marginTop: "10px" }} />
        </div>
      </div>

      <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
        {STATS.map(({ key, label }) => {
          const val = player[key];
          return (
            <div key={key}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1.5px", color: "#2a5a7a", textTransform: "uppercase" }}>{label}</span>
                <span style={{ fontSize: "16px", fontWeight: 900, color: statColor(val), lineHeight: 1 }}>{val}</span>
              </div>
              <div style={{ height: "2px", background: "#0f2035", borderRadius: "2px", overflow: "hidden" }}>
                <motion.div
                  initial={animated ? { width: 0 } : { width: `${val}%` }}
                  animate={{ width: `${val}%` }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  style={{ height: "100%", borderRadius: "2px", background: statBarColor(val) }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {showScoutNote && player.whyWatch && (
        <div style={{ margin: "0 12px 12px", padding: "8px 10px", background: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.15)", borderRadius: "8px" }}>
          <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "2px", color: "#00d4aa", textTransform: "uppercase", marginBottom: "4px" }}>Scout Notu</div>
          <div style={{ fontSize: "11px", color: "#8ab0c0", lineHeight: 1.5 }}>{player.whyWatch}</div>
        </div>
      )}

      <div style={{ padding: "6px 14px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #0f2035" }}>
        <span style={{ fontSize: "9px", color: "#2a5a7a", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 700 }}>{player.league}</span>
        <div style={{ display: "flex", gap: "5px" }}>
          {tmLink && <a href={tmLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: "9px", fontWeight: 700, color: "#2a5a7a", background: "#0a1a2e", border: "1px solid #1a3050", borderRadius: "3px", padding: "2px 6px", textDecoration: "none" }}>TM</a>}
          {gLink && <a href={gLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: "9px", fontWeight: 700, color: "#2a5a7a", background: "#0a1a2e", border: "1px solid #1a3050", borderRadius: "3px", padding: "2px 6px", textDecoration: "none" }}>G</a>}
        </div>
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

function MiniCard({ player, animated }: Omit<PlayerCardProps, "size">) {
  const card = (
    <div style={{
      width: "100%",
      background: "#060f1e", borderRadius: "10px",
      overflow: "hidden", border: "1px solid #1a3a5c",
      fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        padding: "10px 10px 8px",
        background: "linear-gradient(135deg, #0a1f3a, #071628)",
        borderBottom: "1px solid #1a3a5c", position: "relative",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,212,170,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <PlayerPhoto url={player.photo_url} name={player.name} size="mini" />
            <div>
              <div style={{ fontSize: "26px", fontWeight: 900, color: "#00d4aa", lineHeight: 1, textShadow: "0 0 16px rgba(0,212,170,0.4)" }}>{player.overall}</div>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#00d4aa", letterSpacing: "2px", textTransform: "uppercase" }}>{player.position}</div>
            </div>
          </div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#e0f0ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{player.name}</div>
          <div style={{ fontSize: "9px", color: "#4a7a9a", marginTop: "1px" }}>{player.club}</div>
          <div style={{ height: "2px", background: "linear-gradient(90deg, #00d4aa, #22d3ee, transparent)", marginTop: "7px" }} />
        </div>
      </div>
      <div style={{ padding: "8px 10px 9px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px" }}>
        {STATS.map(({ key, label }) => {
          const val = player[key];
          return (
            <div key={key} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "14px", fontWeight: 900, color: statColor(val), lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: "8px", color: "#2a5a7a", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginTop: "2px" }}>{label}</div>
            </div>
          );
        })}
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
