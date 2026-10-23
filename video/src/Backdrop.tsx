import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { color, useLook } from "./theme";
import { backdropDefaults } from "./cover-window.mjs";

/** Where the backdrop looks (src/cover-window.mjs); render.mjs sets it from the faces in the cover. */
export type BackdropSpec = { aspect: number; center: [number, number]; zoom: [number, number]; blur: number };

/**
 * The article's cover behind every scene: blurred, dimmed and drifting slowly over
 * the whole video, so each reel sits in its own key visual's colours. Works in any
 * frame: the cover is laid at its cover-fit size with the window's centre at the
 * frame's centre, and zoomed about that point.
 */
export const Backdrop: React.FC<{ src: string | null; spec?: Partial<BackdropSpec> }> = ({ src, spec }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const look = useLook();
  if (!src) return null;
  const frameAspect = width / height;
  const s = { ...backdropDefaults(frameAspect), ...spec } as BackdropSpec;
  const t = frame / durationInFrames;
  const c = s.center[0] + (s.center[1] - s.center[0]) * t;
  const z = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * t;
  // The cover's size against the frame's (object-fit: cover).
  const rw = Math.max(1, s.aspect / frameAspect);
  const rh = Math.max(1, frameAspect / s.aspect);
  const dim = (pct: number) => `color-mix(in oklch, ${color.bg} ${pct}%, transparent)`;
  // Vertical: the text column runs down the left, so the left is washed most. Wide: the
  // card spans the frame, so the wash is more even. The theme sets how strong (theme.ts).
  const across = frameAspect < 1 ? look.wash : look.washWide;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={src}
        style={{
          position: "absolute", width: `${rw * 100}%`, height: `${rh * 100}%`, left: `${(0.5 - c * rw) * 100}%`, top: `${(0.5 - rh / 2) * 100}%`,
          transform: `scale(${z})`, transformOrigin: `${c * 100}% 50%`, filter: `blur(${s.blur}px) ${look.backdrop}`,
        }}
      />
      <AbsoluteFill style={{ background: `linear-gradient(90deg, ${dim(across[0])} 0%, ${dim(across[1])} 70%, ${dim(across[2])} 100%)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(to bottom, ${color.bg} 0%, transparent 16%, transparent 78%, ${color.bg} 100%)` }} />
    </AbsoluteFill>
  );
};
