import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { color, fonts, gradient, safe } from "./theme";

/** Film grain over everything, like the site's .grain surfaces. */
export const Grain: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.09, mixBlendMode: "overlay" }}>
    <svg width="100%" height="100%">
      <filter id="g">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#g)" />
    </svg>
  </AbsoluteFill>
);

/** Thin diagonal hatching from the site's hero, very faint. */
export const Hatch: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => (
  <AbsoluteFill style={{ opacity, backgroundImage: "repeating-linear-gradient(-45deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 22px)" }} />
);

/** "SCOUT GAMER" lockup, top-left inside the safe area. */
export const Brand: React.FC<{ tag?: string }> = ({ tag }) => (
  <div style={{ position: "absolute", top: safe.top - 70, left: safe.x, right: safe.x, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ width: 54, height: 54, borderRadius: 12, background: color.surface, border: `1px solid ${color.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.display, fontWeight: 700, fontSize: 22 }}>
        <span style={{ background: gradient, WebkitBackgroundClip: "text", color: "transparent" }}>SG</span>
      </div>
      <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 30, color: color.text, letterSpacing: "-0.02em" }}>Scout Gamer</div>
    </div>
    {tag ? <div style={{ fontFamily: fonts.mono, fontSize: 20, letterSpacing: "0.2em", color: color.muted }}>{tag}</div> : null}
  </div>
);

/** A spring from 0 to 1 starting at `delay` frames. */
export function useIn(delay = 0, damping = 18): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.8 } });
}

/** Fade + rise for a block of text. */
export const Rise: React.FC<{ delay?: number; distance?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, distance = 40, children, style }) => {
  const p = useIn(delay);
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * distance}px)`, ...style }}>{children}</div>;
};

/** Initials in a gradient tile, the site's stand-in for a player photo (no third-party images). */
export const Monogram: React.FC<{ name: string; size?: number; accent?: string }> = ({ name, size = 220, accent = color.emerald }) => {
  const initials = name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.16, position: "relative", overflow: "hidden", background: `linear-gradient(150deg, color-mix(in oklch, ${accent} 38%, ${color.surface}) 0%, ${color.surface} 70%)`, border: `1px solid color-mix(in oklch, ${accent} 50%, transparent)` }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(-45deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 14px)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.display, fontWeight: 700, fontSize: size * 0.46, letterSpacing: "-0.05em", color: `color-mix(in oklch, ${accent} 70%, white)`, opacity: 0.9 }}>
        {initials}
      </div>
    </div>
  );
};

/** Rating that counts up while its bar fills. The bar runs from `floor` to 99. */
export const RatingBar: React.FC<{ value: number; delay?: number; floor?: number; accent?: string; label: string }> = ({ value, delay = 0, floor = 60, accent = color.emerald, label }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => 1 - Math.pow(1 - x, 3) });
  const shown = Math.round(floor + (value - floor) * t);
  const width = ((value - floor) / (99 - floor)) * 100 * t;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
        <span style={{ fontFamily: fonts.mono, fontSize: 24, letterSpacing: "0.2em", color: color.muted }}>{label}</span>
        <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 120, lineHeight: 0.9, letterSpacing: "-0.04em", color: accent }}>{shown}</span>
      </div>
      <div style={{ height: 10, borderRadius: 999, background: color.surfaceLow, overflow: "hidden" }}>
        <div style={{ width: `${width}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, color-mix(in oklch, ${accent} 50%, transparent), ${accent})` }} />
      </div>
    </div>
  );
};
