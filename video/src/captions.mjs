/**
 * Captions from the voice-over: the approved lines (data/<slug>.vo.json) cut into
 * short cues and timed against the timeline. Shared by the templates (src/Captions.tsx
 * draws them) and scripts/render.mjs (which measures the pauses in each clip and
 * writes the same cues as captions.srt for X).
 *
 * The text is the line as spoken, word for word. No word timings come back from
 * the voice-over, so each cue gets a share of its clip in proportion to its length,
 * and a cue boundary that lands near a pause in the clip is moved onto the pause.
 */

/** A cue holds at most this many characters: two short lines on a phone. */
const MAX = 46;
/** A boundary moves onto a pause whose middle lies within this many seconds of it. */
const SNAP = 0.8;
/** How long a cue stays up after the last word of its clip. */
const HOLD = 0.3;

const pad = (i) => String(i).padStart(2, "0");

/**
 * The spoken line for each scene, keyed like the timeline (hook, item-00 …, stat-00 …,
 * contrast, quote, ballot, close), the same order scripts/voiceover.mjs reads them in.
 * @param {{ hook?: string; items?: string[]; stats?: string[]; contrast?: string; quote?: string; ballot?: string; close?: string }} lines
 */
export function linesByScene(lines) {
  return Object.fromEntries([
    ["hook", lines.hook],
    ...(lines.items ?? []).map((t, i) => [`item-${pad(i)}`, t]),
    ...(lines.stats ?? []).map((t, i) => [`stat-${pad(i)}`, t]),
    ["contrast", lines.contrast], ["quote", lines.quote], ["ballot", lines.ballot], ["close", lines.close],
  ].filter(([, t]) => t));
}

/** Split words into pieces of at most MAX characters, as even as the words allow. */
function byWords(text) {
  const words = text.split(/\s+/);
  const n = Math.ceil(text.length / MAX);
  const target = text.length / n;
  const out = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && (next.length > MAX || (cur.length >= target && out.length < n - 1))) { out.push(cur); cur = w; } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * A line cut into cues: sentences first, then clauses at commas, then words; short
 * neighbours are joined back up to MAX so a cue is never a lone "Seventy-one."
 * @param {string} line
 */
export function chunk(line) {
  const sentences = line.trim().split(/(?<=[.!?:])\s+/);
  const pieces = sentences.flatMap((s) => {
    if (s.length <= MAX) return [s];
    const clauses = s.split(/(?<=[,;—])\s+/);
    const merged = [];
    for (const c of clauses) {
      const last = merged.at(-1);
      if (last && `${last} ${c}`.length <= MAX) merged[merged.length - 1] = `${last} ${c}`;
      else merged.push(c);
    }
    return merged.flatMap((c) => (c.length <= MAX ? [c] : byWords(c)));
  });
  const cues = [];
  for (const p of pieces) {
    const last = cues.at(-1);
    if (last && `${last} ${p}`.length <= MAX && /[.!?:]$/.test(last) && last.length < MAX / 2) cues[cues.length - 1] = `${last} ${p}`;
    else cues.push(p);
  }
  // A cue never ends on "the", "on", "of"…: those words move to the start of the next cue.
  for (let i = 0; i < cues.length - 1; i++) {
    let words = cues[i].split(" ");
    while (words.length > 1 && LEAD_WORDS.test(words.at(-1)) && `${words.at(-1)} ${cues[i + 1]}`.length <= MAX) {
      cues[i + 1] = `${words.pop()} ${cues[i + 1]}`;
    }
    cues[i] = words.join(" ");
  }
  return cues;
}

/** Words that lead into what follows, so they belong at the start of a cue, not its end. */
const LEAD_WORDS = /^(the|a|an|of|on|in|at|to|for|by|with|from|into|among|about|over|after|before|between|without|through|per|and|or|but|his|her|their|its|than|as|aged|whether)$/i;

const squash = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

/**
 * The cues for a video.
 * @param {{
 *   lines: Parameters<typeof linesByScene>[0];
 *   timeline: { scene: string; from: number; frames: number; voiceAt: number | null }[];
 *   clips: { scene: string; seconds: number }[];
 *   fps: number;
 *   speech?: Record<string, { start: number; end: number; pauses: { start: number; end: number }[] }>;
 *   onScreen?: string | null;
 * }} o  `speech` (seconds within each clip) comes from scripts/render.mjs; without it the
 *   whole clip counts as speech. A line that is also on screen word for word (`onScreen`,
 *   the pull quote) gets no captions: the scene already shows it.
 * @returns {{ scene: string; start: number; end: number; text: string }[]} seconds in the video
 */
export function buildCues({ lines, timeline, clips, fps, speech = {}, onScreen = null }) {
  const byScene = linesByScene(lines);
  const length = new Map(clips.map((c) => [c.scene, c.seconds]));
  const cues = [];
  for (const t of timeline) {
    const line = byScene[t.scene];
    if (!line || t.voiceAt === null || !length.has(t.scene)) continue;
    if (onScreen && squash(line) === squash(onScreen)) continue;
    const s = speech[t.scene] ?? { start: 0, end: length.get(t.scene), pauses: [] };
    const texts = chunk(line);
    // Each cue's share of the speech, by its length (+2 for the breath between cues).
    const weights = texts.map((x) => x.length + 2);
    const total = weights.reduce((a, b) => a + b, 0);
    const bounds = [s.start];
    let acc = 0;
    const free = [...s.pauses];
    for (let i = 0; i < texts.length - 1; i++) {
      acc += weights[i];
      let at = s.start + ((s.end - s.start) * acc) / total;
      const near = free
        .map((p, k) => ({ k, mid: (p.start + p.end) / 2 }))
        .filter((p) => Math.abs(p.mid - at) <= SNAP && p.mid > bounds.at(-1))
        .sort((a, b) => Math.abs(a.mid - at) - Math.abs(b.mid - at))[0];
      if (near) { at = near.mid; free.splice(near.k, 1); }
      bounds.push(Math.max(at, bounds.at(-1) + 0.4));
    }
    // The last cue holds a moment after the last word, but never into the next scene.
    const sceneEnd = (t.from + t.frames) / fps;
    texts.forEach((text, i) => {
      const start = t.voiceAt + bounds[i];
      const end = i === texts.length - 1 ? Math.min(t.voiceAt + s.end + HOLD, sceneEnd - 0.05) : t.voiceAt + bounds[i + 1];
      cues.push({ scene: t.scene, start: round(start), end: round(end), text });
    });
  }
  return cues;
}

const round = (x) => Math.round(x * 1000) / 1000;

/** SubRip, for X's caption upload. */
export function toSrt(cues) {
  const ts = (x) => {
    const ms = Math.round(x * 1000);
    const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)},${String(ms % 1000).padStart(3, "0")}`;
  };
  return cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join("\n");
}
