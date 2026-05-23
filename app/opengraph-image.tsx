import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Scout Gamer — Football × Game Culture";
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
          background: "linear-gradient(135deg, #0a1628 0%, #060f1e 100%)",
          padding: "60px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle glow */}
        <div
          style={{
            position: "absolute",
            right: -80,
            top: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Left accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 6,
            height: "100%",
            background: "linear-gradient(180deg, #00d4aa, #22d3ee, #60a5fa)",
          }}
        />

        {/* Top: Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 8,
              background: "linear-gradient(135deg, #00d4aa, #22d3ee)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#060f1e",
            }}
          >
            S
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#e0f0ff", letterSpacing: "-0.02em" }}>
              Scout Gamer
            </span>
            <span style={{ fontSize: 12, color: "#4a7a9a", letterSpacing: "0.2em", fontFamily: "monospace" }}>
              FOOTBALL × GAME CULTURE
            </span>
          </div>
        </div>

        {/* Center: Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: -20 }}>
          <span
            style={{
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              background: "linear-gradient(135deg, #00d4aa, #22d3ee, #60a5fa)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Football × Game
          </span>
          <span
            style={{
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "#dae2fd",
            }}
          >
            Culture.
          </span>
          <span style={{ fontSize: 20, color: "#4a7a9a", marginTop: 24 }}>
            Young talent scouting, tactical analysis, and interactive tournaments.
          </span>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(74,122,154,0.3)",
            paddingTop: 16,
          }}
        >
          <span style={{ fontSize: 13, color: "#4a7a9a", letterSpacing: "0.15em", fontFamily: "monospace" }}>
            WWW.SCOUTGAMER.COM
          </span>
          <span style={{ fontSize: 13, color: "#4a7a9a", letterSpacing: "0.1em", fontFamily: "monospace" }}>
            RADAR · LISTS · TACTICS LAB · ARENA
          </span>
        </div>

        {/* Decorative right side stats */}
        <div
          style={{
            position: "absolute",
            right: 80,
            top: 160,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            opacity: 0.15,
          }}
        >
          <span style={{ fontSize: 12, color: "#22d3ee", letterSpacing: "0.2em", fontFamily: "monospace" }}>
            PAC · SHO · PAS · DRI · DEF
          </span>
          <span style={{ fontSize: 56, fontWeight: 700, color: "#00d4aa", fontFamily: "monospace", letterSpacing: "-0.05em" }}>
            86
          </span>
          <span style={{ fontSize: 14, color: "#22d3ee", letterSpacing: "0.15em" }}>OVR</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
