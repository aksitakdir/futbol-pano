import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { color, fonts } from "./theme";

/** One caption: seconds into the video (src/captions.mjs). */
export type Cue = { scene: string; start: number; end: number; text: string };

/**
 * Burnt-in captions: the cue being spoken, on a pill low in the frame. Most people
 * watch with the sound off. `left`/`right`/`bottom` keep it inside the platform's
 * safe area; the scenes keep that band clear (Look.band). A cue that follows straight
 * on from another swaps in place; one after a silence fades in.
 */
export const Captions: React.FC<{ cues?: Cue[]; left: number; right: number; bottom: number; size: number }> = ({ cues, left, right, bottom, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!cues?.length) return null;
  const t = frame / fps;
  const cue = cues.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;
  const joinedBefore = cues.some((c) => Math.abs(c.end - cue.start) < 0.05);
  const joinedAfter = cues.some((c) => Math.abs(c.start - cue.end) < 0.05);
  const fadeIn = joinedBefore ? 1 : Math.min(1, ((t - cue.start) * fps) / 4);
  const fadeOut = joinedAfter ? 1 : Math.min(1, ((cue.end - t) * fps) / 3);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left, right, bottom, display: "flex", justifyContent: "center", opacity: Math.min(fadeIn, fadeOut) }}>
        <div
          style={{
            padding: `${size * 0.3}px ${size * 0.6}px`, borderRadius: size * 0.5,
            background: `color-mix(in oklch, ${color.bg} 82%, transparent)`, border: `1px solid ${color.border}`,
            fontFamily: fonts.body, fontWeight: 600, fontSize: size, lineHeight: 1.25, color: color.text, textAlign: "center", textWrap: "balance",
          }}
        >
          {cue.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
