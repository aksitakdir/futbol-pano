"use client";

import type { PlayerCardData } from "./player-card";

type StatKey = "pace" | "shooting" | "passing" | "dribbling" | "defending" | "physical";

const ROWS_EN: { key: StatKey; short: string; full: string }[] = [
  { key: "pace", short: "PAC", full: "PACE" },
  { key: "shooting", short: "SHO", full: "SHOOT" },
  { key: "passing", short: "PAS", full: "PASS" },
  { key: "dribbling", short: "DRI", full: "DRIB" },
  { key: "defending", short: "DEF", full: "DEFEND" },
  { key: "physical", short: "PHY", full: "PHYSICAL" },
];

const ROWS_TR: { key: StatKey; short: string; full: string }[] = [
  { key: "pace", short: "PAC", full: "HIZ" },
  { key: "shooting", short: "SHO", full: "ŞUT" },
  { key: "passing", short: "PAS", full: "PAS" },
  { key: "dribbling", short: "DRI", full: "DRİB" },
  { key: "defending", short: "DEF", full: "DEF" },
  { key: "physical", short: "PHY", full: "FİZİK" },
];

function valueColor(v: number): string {
  if (v >= 85) return "#00d4aa";
  if (v >= 70) return "#22d3ee";
  if (v >= 55) return "oklch(0.72 0.10 220)";
  return "oklch(0.62 0.04 230)";
}

function fillGradient(v: number): string {
  if (v >= 80) return "linear-gradient(90deg, oklch(0.78 0.19 163), oklch(0.58 0.14 168))";
  if (v >= 65) return "linear-gradient(90deg, oklch(0.72 0.14 195), oklch(0.52 0.10 220))";
  return "linear-gradient(90deg, oklch(0.55 0.08 240), oklch(0.42 0.06 260))";
}

export type PlayerRatingBarsProps = {
  player: Pick<PlayerCardData, StatKey>;
  locale?: "en" | "tr";
};

export default function PlayerRatingBars({ player, locale = "en" }: PlayerRatingBarsProps) {
  const rows = locale === "tr" ? ROWS_TR : ROWS_EN;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {rows.map(({ key, short, full }) => {
        const val = Number(player[key]) || 0;
        const pct = Math.min(100, Math.max(0, val));
        const col = valueColor(val);
        return (
          <div key={key}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 12,
                marginBottom: 6,
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  color: "var(--sg-text-secondary)",
                }}
              >
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>{short}</span>
                {" · "}
                <span style={{ color: "var(--sg-text-muted)" }}>{full}</span>
              </span>
              <span
                className="display tabular-nums"
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: col,
                  flexShrink: 0,
                }}
              >
                {val}
              </span>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 999,
                background: "var(--sg-surface)",
                border: "1px solid var(--sg-border)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: 999,
                  background: fillGradient(val),
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
