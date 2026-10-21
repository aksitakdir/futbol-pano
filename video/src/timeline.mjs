/**
 * Scene timing for the Rundown template, shared by the composition (src/Rundown.tsx)
 * and the audio mix (scripts/render.mjs), so picture and voice cannot drift apart.
 *
 * Without voice-over every scene has a fixed length. With it (props.vo.clips, written
 * by scripts/voiceover.mjs), a scene lasts until its line has been read: the line
 * starts `lead` seconds into the scene and the cut comes `tail` seconds after it ends.
 */
export const FPS = 30;
export const BASE = { hook: 100, item: 66, quote: 120, ballot: 140, close: 110 };
const LEAD = { hook: 0.5, item: 0.2, quote: 0.35, ballot: 0.35, close: 0.35 };
const TAIL = 0.35;

/** @param {{ items: unknown[]; quote: string | null; ballot: unknown[]; vo?: { clips?: { scene: string; seconds: number; file: string }[] } }} p */
export function timeline(p) {
  const clips = new Map((p.vo?.clips ?? []).map((c) => [c.scene, c]));
  const scenes = [["hook", "hook"], ...p.items.map((_, i) => [`item-${String(i).padStart(2, "0")}`, "item"])];
  if (p.quote) scenes.push(["quote", "quote"]);
  if (p.ballot.length) scenes.push(["ballot", "ballot"]);
  scenes.push(["close", "close"]);
  let at = 0;
  return scenes.map(([scene, kind]) => {
    const clip = clips.get(scene);
    const voiced = clip ? Math.ceil((LEAD[kind] + clip.seconds + TAIL) * FPS) : 0;
    const frames = Math.max(BASE[kind], voiced);
    const entry = { scene, kind, from: at, frames, voiceAt: clip ? at / FPS + LEAD[kind] : null, file: clip?.file ?? null };
    at += frames;
    return entry;
  });
}

/** @param {Parameters<typeof timeline>[0]} p */
export const totalFrames = (p) => timeline(p).reduce((s, t) => s + t.frames, 0);
