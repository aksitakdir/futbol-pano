/**
 * Render an article's video and its cover frame.
 *
 *   node scripts/render.mjs <slug> [--template Rundown]
 *     → out/<slug>/reel.mp4 (1080×1920, H.264) and out/<slug>/cover.png. With a
 *       voice-over (data/<slug>.vo.json) and/or music (out/<slug>/music.mp3), reel.mp4
 *       carries the mix and reel-silent.mp4 is kept for in-app music.
 *
 * Run `node scripts/from-article.mjs <id|slug>` first to write data/<slug>.json.
 *
 * Encoding: Remotion's bundled ffmpeg is built for macOS 15 and does not load on
 * older macOS (the owner's machine runs 13). There, Remotion renders the frames and
 * scripts/frames2mp4.swift encodes them with AVFoundation. Elsewhere renderMedia
 * does both.
 */
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { bundle } from "@remotion/bundler";
import { renderFrames, renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { timeline } from "../src/timeline.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const slug = process.argv[2];
if (!slug) { console.error("Usage: node scripts/render.mjs <slug> [--template Rundown]"); process.exit(1); }
const inputProps = JSON.parse(fs.readFileSync(path.join(ROOT, "data", `${slug}.json`), "utf8"));
const t = process.argv.indexOf("--template");
const id = t !== -1 ? process.argv[t + 1] : inputProps.template ?? "Rundown";
const outDir = path.join(ROOT, "out", slug);
fs.mkdirSync(outDir, { recursive: true });
// Voice-over (scripts/voiceover.mjs) stretches the scenes to fit; music (scripts/music.mjs)
// goes under it. Without either, the reel is silent, as before.
const voFile = path.join(ROOT, "data", `${slug}.vo.json`);
const vo = fs.existsSync(voFile) ? JSON.parse(fs.readFileSync(voFile, "utf8")) : null;
if (vo?.clips?.length) inputProps.vo = { clips: vo.clips };
const music = path.join(outDir, "music.mp3");
const withAudio = !!inputProps.vo || fs.existsSync(music);

const oldMac = process.platform === "darwin" && Number(execFileSync("sw_vers", ["-productVersion"]).toString().split(".")[0]) < 15;

/** scripts/<name>.swift, compiled once into node_modules/.cache and rebuilt when the source changes. */
function swiftTool(name) {
  const bin = path.join(ROOT, "node_modules", ".cache", name);
  const source = path.join(HERE, `${name}.swift`);
  if (!fs.existsSync(bin) || fs.statSync(bin).mtimeMs < fs.statSync(source).mtimeMs) {
    fs.mkdirSync(path.dirname(bin), { recursive: true });
    execFileSync("swiftc", ["-O", source, "-o", bin], { stdio: "inherit" });
  }
  return bin;
}

/**
 * The backdrop drifts across the cover behind every card, and a face there reads as the
 * named player's portrait. Find the cover's faces (scripts/faces.swift, macOS Vision) and
 * keep the drift to a stretch of the cover clear of all of them; where no stretch is wide
 * enough, or the check cannot run, blur the cover past recognition instead.
 */
async function backdropFor(cover) {
  if (!cover) return undefined;
  const BLURRED = { blur: 28 };
  let found;
  try {
    const file = path.join(outDir, ".cover");
    fs.writeFileSync(file, Buffer.from(await (await fetch(cover)).arrayBuffer()));
    found = JSON.parse(execFileSync(swiftTool("faces"), [file]).toString());
    fs.rmSync(file);
  } catch (e) {
    console.warn(`warn  no face check on the cover (${String(e.message).split("\n")[0]}): backdrop blurred past recognition`);
    return BLURRED;
  }
  if (!found.faces.length) return undefined;
  // Share of the cover's width in view (objectFit cover on a 1080×1920 frame), at the
  // backdrop's smallest zoom (1.14), so the widest window it ever shows.
  const aspect = found.width / found.height;
  const frame = 1080 / 1920;
  if (aspect <= frame) return BLURRED;
  const view = frame / aspect;
  const half = view / 2 / 1.14;
  const margin = 0.06; // hair, ears and the blur around the face box
  let clear = [[view / 2, 1 - view / 2]]; // where the window's centre may go
  for (const f of found.faces) {
    const [lo, hi] = [f.x - margin - half, f.x + f.w + margin + half];
    clear = clear.flatMap(([a, b]) => [[a, Math.min(b, lo)], [Math.max(a, hi), b]]).filter(([a, b]) => b > a);
  }
  // Window centre → objectPosition %.
  const pct = (c) => Math.round(((c - view / 2) / (1 - view)) * 1000) / 10;
  const [best] = clear.map(([a, b]) => [pct(a), pct(b)]).sort((x, y) => (y[1] - y[0]) - (x[1] - x[0]));
  if (best && best[1] - best[0] >= 15) {
    console.log(`cover has ${found.faces.length} face(s): backdrop drifts ${best[0]}–${best[1]}% to stay clear of them`);
    return { pan: best };
  }
  console.log(`cover has ${found.faces.length} face(s) and no clear stretch: backdrop blurred past recognition`);
  return BLURRED;
}
inputProps.backdrop = await backdropFor(inputProps.cover);

const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src", "index.ts") });
const composition = await selectComposition({ serveUrl, id, inputProps });
console.log(`${id}: ${composition.durationInFrames} frames at ${composition.fps} fps = ${(composition.durationInFrames / composition.fps).toFixed(1)} s`);

await renderStill({ composition, serveUrl, inputProps, frame: 60, output: path.join(outDir, "cover.png") });

let last = -1;
const progress = (p) => {
  const pct = Math.floor(p * 10) * 10;
  if (pct !== last) { last = pct; process.stdout.write(`${pct}% `); }
};
const reel = path.join(outDir, withAudio ? "reel-silent.mp4" : "reel.mp4");

if (oldMac) {
  const frames = path.join(outDir, "frames");
  fs.rmSync(frames, { recursive: true, force: true });
  await renderFrames({
    composition, serveUrl, inputProps,
    imageFormat: "jpeg",
    jpegQuality: 92,
    outputDir: frames,
    onStart: () => {},
    onFrameUpdate: (done) => progress(done / composition.durationInFrames),
  });
  const encoder = swiftTool("frames2mp4");
  console.log("");
  execFileSync(encoder, [frames, String(composition.fps), reel, "10000000"], { stdio: "inherit" });
  fs.rmSync(frames, { recursive: true, force: true });
} else {
  await renderMedia({ composition, serveUrl, inputProps, codec: "h264", crf: 18, muted: true, outputLocation: reel, onProgress: ({ progress: p }) => progress(p) });
  console.log("");
}
if (withAudio) {
  const mixer = swiftTool("mixaudio");
  const clips = timeline(inputProps).filter((t) => t.file).map((t) => ({ file: path.join(ROOT, t.file), start: t.voiceAt }));
  const spec = { video: reel, out: path.join(outDir, "reel.mp4"), music: fs.existsSync(music) ? music : null, musicGain: 0.6, duckGain: 0.16, clips };
  const specFile = path.join(outDir, ".mix.json");
  fs.writeFileSync(specFile, JSON.stringify(spec, null, 2));
  execFileSync(mixer, [specFile], { stdio: "inherit" });
  fs.rmSync(specFile);
}
console.log(`wrote out/${slug}/reel.mp4${withAudio ? " (voice-over and music; reel-silent.mp4 without)" : ""} and cover.png`);
