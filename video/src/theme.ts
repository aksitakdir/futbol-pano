import { createContext, useContext, type CSSProperties } from "react";
import { loadFont as loadDisplay } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/InterTight";
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";

/** The site's own type and colours (app/layout.tsx, app/globals.css), so a video reads as Scout Gamer. */
export const fonts = {
  display: loadDisplay("normal", { weights: ["500", "700"], subsets: ["latin", "latin-ext"] }).fontFamily,
  body: loadBody("normal", { weights: ["400", "500", "600"], subsets: ["latin", "latin-ext"] }).fontFamily,
  mono: loadMono("normal", { weights: ["400", "500"], subsets: ["latin", "latin-ext"] }).fontFamily,
};

export type ThemeName = "dark" | "light";

/**
 * Two palettes on the same hues. Dark is the site's own (app/globals.css). Light keeps
 * the hues and darkens the accents until small text on a pale ground still reads.
 * `ink` is the colour things are mixed towards for contrast: white on dark, near-black on light.
 */
const palettes = {
  dark: {
    bg: "oklch(0.13 0.012 240)",
    surface: "oklch(0.20 0.016 240)",
    surfaceLow: "oklch(0.18 0.015 240)",
    border: "oklch(0.32 0.018 240 / 0.6)",
    text: "oklch(0.95 0.008 240)",
    textSecondary: "oklch(0.88 0.01 240)",
    muted: "oklch(0.62 0.02 240)",
    emerald: "oklch(0.78 0.16 165)",
    cyan: "oklch(0.82 0.13 200)",
    sky: "oklch(0.78 0.13 235)",
    amber: "oklch(0.82 0.14 75)",
    rose: "oklch(0.74 0.16 18)",
    ink: "oklch(1 0 0)",
  },
  light: {
    bg: "oklch(0.975 0.004 240)",
    surface: "oklch(0.92 0.008 240)",
    surfaceLow: "oklch(0.89 0.01 240)",
    border: "oklch(0.62 0.02 240 / 0.45)",
    text: "oklch(0.19 0.02 245)",
    textSecondary: "oklch(0.30 0.02 245)",
    muted: "oklch(0.48 0.02 245)",
    emerald: "oklch(0.53 0.13 165)",
    cyan: "oklch(0.54 0.10 210)",
    sky: "oklch(0.50 0.14 250)",
    amber: "oklch(0.58 0.14 60)",
    rose: "oklch(0.54 0.19 20)",
    ink: "oklch(0.15 0.02 245)",
  },
} satisfies Record<ThemeName, Record<string, string>>;

type Swatch = keyof typeof palettes.dark;

/** Colours as CSS variables, so one template draws either palette: the root sets them with themeVars(). */
export const color = Object.fromEntries(Object.keys(palettes.dark).map((k) => [k, `var(--sg-${k})`])) as Record<Swatch, string>;

/** The variables for a palette, for the composition's root element. */
export const themeVars = (theme: ThemeName): CSSProperties =>
  Object.fromEntries(Object.entries(palettes[theme]).map(([k, v]) => [`--sg-${k}`, v])) as CSSProperties;

const wash = (pct: number) => `color-mix(in oklch, ${color.bg} ${pct}%, transparent)`;

/**
 * What changes with the theme besides colour: how the cover is treated, the grain, and
 * the scrims that keep the opening title readable over it (the light theme shows the
 * cover at full brightness, so its scrims reach further up).
 */
const looks = {
  dark: { cover: "brightness(0.42) saturate(0.9)", coverWide: "brightness(0.5) saturate(0.95)", close: "brightness(0.62) saturate(1.1)", closeWide: "brightness(0.6) saturate(1.1)", backdrop: "brightness(0.5) saturate(1.15)", wash: [72, 50, 34], washWide: [74, 62, 52], closeWash: [62, 30, 10], grain: 0.09,
    scrim: `linear-gradient(to top, ${color.bg} 8%, transparent 55%), linear-gradient(to bottom, ${color.bg} 0%, transparent 30%)`,
    scrimWide: `linear-gradient(90deg, ${color.bg} 0%, ${wash(70)} 42%, transparent 72%), linear-gradient(to top, ${color.bg} 0%, transparent 30%), linear-gradient(to bottom, ${wash(85)} 0%, transparent 22%)` },
  light: { cover: "brightness(1.02) saturate(0.95)", coverWide: "brightness(1.02) saturate(0.95)", close: "brightness(1.05) saturate(0.9)", closeWide: "brightness(1.05) saturate(0.9)", backdrop: "brightness(1.1) saturate(0.85)", wash: [84, 72, 62], washWide: [86, 78, 70], closeWash: [80, 56, 30], grain: 0.05,
    scrim: `linear-gradient(to top, ${color.bg} 22%, ${wash(84)} 50%, transparent 80%), linear-gradient(to bottom, ${color.bg} 0%, transparent 26%)`,
    scrimWide: `linear-gradient(90deg, ${color.bg} 0%, ${wash(88)} 48%, transparent 82%), linear-gradient(to top, ${color.bg} 0%, transparent 30%), linear-gradient(to bottom, ${wash(90)} 0%, transparent 22%)` },
};

/**
 * The look a composition is drawn in: its theme, and `band`, the height kept clear
 * at the bottom for captions (0 without them). Set once at the root.
 */
export const Look = createContext<{ theme: ThemeName; band: number }>({ theme: "dark", band: 0 });
export const useLook = () => {
  const { theme, band } = useContext(Look);
  return { theme, band, ...looks[theme] };
};

export const gradient = `linear-gradient(120deg, ${color.emerald} 0%, ${color.cyan} 55%, ${color.sky} 100%)`;

/**
 * Gradient-filled text. background-clip: text paints only inside the element's box, and
 * at a tight line-height the descenders hang below it and come out cut off (the g of
 * "scoutgamer"). The padding extends the painted area; the negative margin keeps the layout.
 */
export const gradientText = (background: string = gradient): CSSProperties => ({
  background, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", paddingBottom: "0.25em", marginBottom: "-0.25em",
});

/**
 * Reels, TikTok and Shorts lay their own UI over the top ~220px and the bottom
 * ~380px of a 1080×1920 frame, and their like/comment/share column down the right
 * edge (`rail` keeps data away from it). Anything that must be read stays inside.
 */
export const safe = { top: 200, bottom: 400, x: 84, rail: 56 };
