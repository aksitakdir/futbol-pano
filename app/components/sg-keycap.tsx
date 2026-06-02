/**
 * ScoutGamer "SG" keycap logo (Style B — dark keycap with gradient text).
 *
 * A stylized keyboard keycap: a dark, lifted key body with a gradient "SG"
 * legend. Used in the site header, admin sidebar, and article layout. Pure
 * inline styles so it renders identically in client and (where needed)
 * server / satori-free contexts.
 */

const ACCENT = "linear-gradient(135deg, #00d4aa, #22d3ee, #FFB81C)";

export default function SgKeycap({ size = 34 }: { size?: number }) {
  const r = size * 0.2;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {/* Key body — dark, with a hard bottom edge for the "raised" look */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: r,
          background: "linear-gradient(180deg, #1a2738, #0c1623)",
          boxShadow: `0 ${size * 0.07}px 0 0 #060d16, 0 ${size * 0.13}px ${size * 0.22}px rgba(0,0,0,0.55)`,
        }}
      />
      {/* Top face — slightly inset, glossy top edge */}
      <div
        style={{
          position: "absolute",
          left: "9%",
          right: "9%",
          top: "7%",
          bottom: "18%",
          borderRadius: r * 0.8,
          background: "linear-gradient(180deg, #233447, rgba(22,36,54,0))",
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display, sans-serif)",
            fontSize: size * 0.34,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            background: ACCENT,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          SG
        </span>
      </div>
    </div>
  );
}
