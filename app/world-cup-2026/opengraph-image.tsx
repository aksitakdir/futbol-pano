import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "World Cup 2026 — Scout Gamer";
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
          background: "linear-gradient(165deg, #1A0A32 0%, #0a1628 40%, #0f172a 100%)",
          padding: "52px 60px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative glows */}
        <div
          style={{
            position: "absolute",
            left: -100,
            top: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(228,0,124,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -80,
            bottom: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,180,160,0.14) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 200,
            top: -40,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,184,28,0.1) 0%, transparent 60%)",
          }}
        />

        {/* Left accent bar — WC gradient */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 6,
            height: "100%",
            background: "linear-gradient(180deg, #FFB81C, #E4007C, #00B4A0)",
          }}
        />

        {/* Top row: Logo */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 8,
                background: "linear-gradient(135deg, #00d4aa, #22d3ee)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 700,
                color: "#060f1e",
              }}
            >
              SG
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#e0f0ff", letterSpacing: "-0.02em" }}>
                Scout Gamer
              </span>
              <span style={{ fontSize: 10, color: "#4a7a9a", letterSpacing: "0.2em", fontFamily: "monospace" }}>
                FOOTBALL × GAME CULTURE
              </span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: -12 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#FFB81C",
              letterSpacing: "0.25em",
              fontFamily: "monospace",
            }}
          >
            FIFA WORLD CUP 2026
          </span>
          <span
            style={{
              fontSize: 68,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
              background: "linear-gradient(135deg, #FFB81C 0%, #E4007C 45%, #00B4A0 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            World Cup 2026
          </span>
          <span style={{ fontSize: 22, color: "#8899aa", marginTop: 8, lineHeight: 1.5 }}>
            Match schedule, squads, scout analysis & tournament coverage.
          </span>
          <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
            {[
              { n: "104", l: "Matches" },
              { n: "48", l: "Squads" },
              { n: "16", l: "Venues" },
            ].map((s) => (
              <div key={s.l} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: "#FFB81C", lineHeight: 1 }}>{s.n}</span>
                <span style={{ fontSize: 10, color: "#6b8599", letterSpacing: "0.12em", fontFamily: "monospace", marginTop: 4 }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,184,28,0.15)",
            paddingTop: 14,
          }}
        >
          <span style={{ fontSize: 12, color: "#4a7a9a", letterSpacing: "0.15em", fontFamily: "monospace" }}>
            SCOUTGAMER.COM/WORLD-CUP-2026
          </span>
          <span style={{ fontSize: 12, color: "#4a7a9a", letterSpacing: "0.1em", fontFamily: "monospace" }}>
            JUN 11 – JUL 19, 2026 · USA · MEXICO · CANADA
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
