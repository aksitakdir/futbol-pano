import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { color, useLook } from "./theme";
import { backdropDefaults } from "./cover-window.mjs";

/** Where the backdrop looks (src/cover-window.mjs); render.mjs sets it from the faces in the cover. */
export type BackdropSpec = { aspect: number; center: [number, number]; zoom: [number, number]; blur: number };

/** One image of the backdrop, shown from frame `from`. A path without http is a file in video/public/. */
export type BackdropLayer = { from: number; src: string; spec?: Partial<BackdropSpec> };

/** A new backdrop image fades in over this many frames at the start of its scene. */
const FADE = 15;

/**
 * Which image sits behind each scene. Without extra images, the cover throughout. With
 * them (the other Midjourney variations of the cover, render.mjs: public/backdrops/<slug>/),
 * the cover stays behind the opening and the end card and the scenes between take the
 * extra images in turn.
 */
export function backdropLayers(
  cover: string | null,
  coverSpec: Partial<BackdropSpec> | undefined,
  extra: { src: string; spec?: Partial<BackdropSpec> }[] | undefined,
  scenes: { kind: string; from: number }[],
): BackdropLayer[] | undefined {
  if (!cover || !extra?.length) return undefined;
  let k = 0;
  return scenes.map((t) => (t.kind === "hook" || t.kind === "close" ? { from: t.from, src: cover, spec: coverSpec } : { from: t.from, ...extra[k++ % extra.length] }));
}

/** One image laid at its cover-fit size, drifting over the whole video. */
const Layer: React.FC<{ src: string; spec?: Partial<BackdropSpec> }> = ({ src, spec }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const look = useLook();
  const frameAspect = width / height;
  const s = { ...backdropDefaults(frameAspect), ...spec } as BackdropSpec;
  const t = frame / durationInFrames;
  const c = s.center[0] + (s.center[1] - s.center[0]) * t;
  const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * t;
  // The image's size against the frame's (object-fit: cover).
  const rw = Math.max(1, s.aspect / frameAspect);
  const rh = Math.max(1, frameAspect / s.aspect);
  return (
    <Img
      src={/^https?:\/\//.test(src) ? src : staticFile(src)}
      style={{
        position: "absolute", width: `${rw * 100}%`, height: `${rh * 100}%`, left: `${(0.5 - c * rw) * 100}%`, top: `${(0.5 - rh / 2) * 100}%`,
        transform: `scale(${z})`, transformOrigin: `${c * 100}% 50%`, filter: `blur(${s.blur}px) ${look.backdrop}`,
      }}
    />
  );
};

/**
 * The article's cover (or its variations) behind every scene: blurred, dimmed and
 * drifting slowly over the whole video, so each reel sits in its own key visual's
 * colours. Works in any frame: each image is laid at its cover-fit size with the
 * window's centre at the frame's centre, and zoomed about that point.
 */
export const Backdrop: React.FC<{ src: string | null; spec?: Partial<BackdropSpec>; layers?: BackdropLayer[] }> = ({ src, spec, layers }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const look = useLook();
  const plan = layers?.length ? layers : src ? [{ from: 0, src, spec }] : [];
  if (!plan.length) return null;
  let i = 0;
  for (let k = 0; k < plan.length; k++) if (plan[k].from <= frame) i = k;
  const cur = plan[i];
  const prev = i > 0 && plan[i - 1].src !== cur.src ? plan[i - 1] : null;
  const fade = prev ? Math.min(1, (frame - cur.from) / FADE) : 1;
  const dim = (pct: number) => `color-mix(in oklch, ${color.bg} ${pct}%, transparent)`;
  // Vertical: the text column runs down the left, so the left is washed most. Wide: the
  // card spans the frame, so the wash is more even. The theme sets how strong (theme.ts).
  const across = width / height < 1 ? look.wash : look.washWide;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {prev && fade < 1 ? <AbsoluteFill><Layer src={prev.src} spec={prev.spec} /></AbsoluteFill> : null}
      <AbsoluteFill style={{ opacity: fade }}><Layer src={cur.src} spec={cur.spec} /></AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(90deg, ${dim(across[0])} 0%, ${dim(across[1])} 70%, ${dim(across[2])} 100%)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(to bottom, ${color.bg} 0%, transparent 16%, transparent 78%, ${color.bg} 100%)` }} />
    </AbsoluteFill>
  );
};
