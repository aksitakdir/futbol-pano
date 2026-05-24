import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "World Cup 2026 Match Schedule — Scout Gamer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  const groups = [
    { g: "A", teams: ["MEX", "RSA", "KOR", "CZE"] },
    { g: "B", teams: ["CAN", "BIH", "QAT", "SUI"] },
    { g: "C", teams: ["BRA", "MAR", "HAI", "SCO"] },
    { g: "D", teams: ["USA", "PAR", "AUS", "TUR"] },
    { g: "E", teams: ["GER", "CUW", "CIV", "ECU"] },
    { g: "F", teams: ["NED", "JPN", "SWE", "TUN"] },
  ];

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
            top: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(228,0,124,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -50,
            bottom: -80,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,180,160,0.12) 0%, transparent 70%)",
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

        {/* Top row: Logo + badge */}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 999,
              background: "rgba(255,184,28,0.12)",
              border: "1px solid rgba(255,184,28,0.3)",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: "#FFB81C", letterSpacing: "0.15em", fontFamily: "monospace" }}>
              FIFA WORLD CUP 2026
            </span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: -8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#FFB81C",
              letterSpacing: "0.25em",
              fontFamily: "monospace",
            }}
          >
            MATCH SCHEDULE
          </span>
          <span
            style={{
              fontSize: 54,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              background: "linear-gradient(135deg, #FFB81C 0%, #ffffff 50%, #00B4A0 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            104 Matches
          </span>
          <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#dae2fd" }}>
            June 11 – July 19, 2026
          </span>
          <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
            {[
              { n: "48", l: "Teams" },
              { n: "16", l: "Venues" },
              { n: "12", l: "Groups" },
              { n: "3", l: "Host Nations" },
            ].map((s) => (
              <div key={s.l} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: "#FFB81C", lineHeight: 1 }}>{s.n}</span>
                <span style={{ fontSize: 10, color: "#6b8599", letterSpacing: "0.12em", fontFamily: "monospace", marginTop: 2 }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Group mini-grid (decorative) */}
        <div style={{ display: "flex", gap: 10, position: "absolute", right: 60, top: 200 }}>
          {groups.map((g) => (
            <div
              key={g.g}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "8px 10px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,184,28,0.1)",
                width: 60,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800, color: "#FFB81C", marginBottom: 4, fontFamily: "monospace" }}>{g.g}</span>
              {g.teams.map((t) => (
                <span key={t} style={{ fontSize: 9, color: "#6b8599", fontFamily: "monospace", lineHeight: 1.6 }}>{t}</span>
              ))}
            </div>
          ))}
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
            SCOUTGAMER.COM/WORLD-CUP-2026/SCHEDULE
          </span>
          <span style={{ fontSize: 12, color: "#4a7a9a", letterSpacing: "0.1em", fontFamily: "monospace" }}>
            USA · MEXICO · CANADA
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
