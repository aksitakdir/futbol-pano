import { loadFont as loadDisplay } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/InterTight";
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";

/** The site's own type and colours (app/layout.tsx, app/globals.css), so a video reads as Scout Gamer. */
export const fonts = {
  display: loadDisplay("normal", { weights: ["500", "700"], subsets: ["latin", "latin-ext"] }).fontFamily,
  body: loadBody("normal", { weights: ["400", "500", "600"], subsets: ["latin", "latin-ext"] }).fontFamily,
  mono: loadMono("normal", { weights: ["400", "500"], subsets: ["latin", "latin-ext"] }).fontFamily,
};

export const color = {
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
};

export const gradient = `linear-gradient(120deg, ${color.emerald} 0%, ${color.cyan} 55%, ${color.sky} 100%)`;

/**
 * Reels, TikTok and Shorts lay their own UI over the top ~220px and the bottom
 * ~380px of a 1080×1920 frame, and their like/comment/share column down the right
 * edge (`rail` keeps data away from it). Anything that must be read stays inside.
 */
export const safe = { top: 200, bottom: 400, x: 84, rail: 56 };
