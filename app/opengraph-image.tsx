import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Scout Gamer — Young Talent Scouting, World Cup 2026 & Game Culture";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(155deg, #060f1e 0%, #0a1628 35%, #0d1f35 65%, #091420 100%)",
          padding: "56px 64px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glows */}
        <div
          style={{
            position: "absolute",
            left: -120,
            top: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,212,170,0.12) 0%, transparent 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -60,
            top: 100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 200,
            bottom: -100,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,184,28,0.07) 0%, transparent 60%)",
          }}
        />

        {/* Left accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 5,
            height: "100%",
            background: "linear-gradient(180deg, #00d4aa, #22d3ee, #FFB81C)",
          }}
        />

        {/* Subtle grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.03,
            backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 40px), repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 40px)",
          }}
        />

        {/* Top: Logo + WC badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: "linear-gradient(135deg, #00d4aa, #22d3ee)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 700,
                color: "#060f1e",
              }}
            >
              SG
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#e8f4ff", letterSpacing: "-0.02em" }}>
                Scout Gamer
              </span>
              <span style={{ fontSize: 10, color: "#5a8aaa", letterSpacing: "0.22em", fontFamily: "monospace" }}>
                FOOTBALL × GAME CULTURE
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 999,
              background: "rgba(255,184,28,0.1)",
              border: "1px solid rgba(255,184,28,0.25)",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: "#FFB81C", letterSpacing: "0.14em", fontFamily: "monospace" }}>
              WORLD CUP 2026
            </span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative", zIndex: 1, marginTop: -16 }}>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
              background: "linear-gradient(135deg, #00d4aa 0%, #22d3ee 45%, #60a5fa 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Rising Talent.
          </span>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
              color: "#dae5fd",
            }}
          >
            Scout Reports.
          </span>
          <span style={{ fontSize: 18, color: "#6a92b0", marginTop: 20, lineHeight: 1.5, maxWidth: 560 }}>
            World Cup 2026 squads & match schedule, young talent scouting, transfer analysis, and interactive tournaments.
          </span>
        </div>

        {/* Feature pills — right side */}
        <div
          style={{
            position: "absolute",
            right: 64,
            top: 200,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            zIndex: 1,
          }}
        >
          {[
            { label: "WC 2026 SCHEDULE", color: "#FFB81C", bg: "rgba(255,184,28,0.08)", border: "rgba(255,184,28,0.2)" },
            { label: "48 TEAM SQUADS", color: "#E4007C", bg: "rgba(228,0,124,0.08)", border: "rgba(228,0,124,0.2)" },
            { label: "PLAYER RADAR", color: "#00d4aa", bg: "rgba(0,212,170,0.08)", border: "rgba(0,212,170,0.2)" },
            { label: "TRANSFER WIRE", color: "#22d3ee", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.2)" },
            { label: "ARENA BRACKETS", color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)" },
          ].map((pill) => (
            <div
              key={pill.label}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: pill.bg,
                border: `1px solid ${pill.border}`,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: pill.color }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: pill.color, letterSpacing: "0.12em", fontFamily: "monospace" }}>
                {pill.label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(90,138,170,0.2)",
            paddingTop: 14,
            position: "relative",
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: 12, color: "#5a8aaa", letterSpacing: "0.16em", fontFamily: "monospace" }}>
            WWW.SCOUTGAMER.COM
          </span>
          <span style={{ fontSize: 11, color: "#3d6a88", letterSpacing: "0.1em", fontFamily: "monospace" }}>
            RADAR · WC 2026 · TRANSFERS · LISTS · ARENA
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
