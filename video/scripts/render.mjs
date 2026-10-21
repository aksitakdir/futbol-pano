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
const t = process.argv.indexOf("--template");
const id = t !== -1 ? process.argv[t + 1] : "Rundown";
const inputProps = JSON.parse(fs.readFileSync(path.join(ROOT, "data", `${slug}.json`), "utf8"));
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
  const encoder = path.join(ROOT, "node_modules", ".cache", "frames2mp4");
  const source = path.join(HERE, "frames2mp4.swift");
  if (!fs.existsSync(encoder) || fs.statSync(encoder).mtimeMs < fs.statSync(source).mtimeMs) {
    fs.mkdirSync(path.dirname(encoder), { recursive: true });
    execFileSync("swiftc", ["-O", source, "-o", encoder], { stdio: "inherit" });
  }
  console.log("");
  execFileSync(encoder, [frames, String(composition.fps), reel, "10000000"], { stdio: "inherit" });
  fs.rmSync(frames, { recursive: true, force: true });
} else {
  await renderMedia({ composition, serveUrl, inputProps, codec: "h264", crf: 18, muted: true, outputLocation: reel, onProgress: ({ progress: p }) => progress(p) });
  console.log("");
}
if (withAudio) {
  const mixer = path.join(ROOT, "node_modules", ".cache", "mixaudio");
  const source = path.join(HERE, "mixaudio.swift");
  if (!fs.existsSync(mixer) || fs.statSync(mixer).mtimeMs < fs.statSync(source).mtimeMs) {
    fs.mkdirSync(path.dirname(mixer), { recursive: true });
    execFileSync("swiftc", ["-O", source, "-o", mixer], { stdio: "inherit" });
  }
  const clips = timeline(inputProps).filter((t) => t.file).map((t) => ({ file: path.join(ROOT, t.file), start: t.voiceAt }));
  const spec = { video: reel, out: path.join(outDir, "reel.mp4"), music: fs.existsSync(music) ? music : null, musicGain: 0.6, duckGain: 0.16, clips };
  const specFile = path.join(outDir, ".mix.json");
  fs.writeFileSync(specFile, JSON.stringify(spec, null, 2));
  execFileSync(mixer, [specFile], { stdio: "inherit" });
  fs.rmSync(specFile);
}
console.log(`wrote out/${slug}/reel.mp4${withAudio ? " (voice-over and music; reel-silent.mp4 without)" : ""} and cover.png`);
