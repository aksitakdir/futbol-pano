/**
 * Render an article's video and its cover frame.
 *
 *   node scripts/render.mjs <slug> [--template Rundown] [--format x]
 *     → out/<slug>/reel.mp4 (1080×1920, H.264) and out/<slug>/cover.png. With a
 *       voice-over (data/<slug>.vo.json) and/or music (out/<slug>/music.mp3), reel.mp4
 *       carries the mix and reel-silent.mp4 is kept for in-app music.
 *     --format x renders the same video at 16:9 (1920×1080) for X, from the template's
 *       Wide composition, as reel-x.mp4 / reel-x-silent.mp4 / cover-x.png. Same
 *       timeline, so the same voice-over and music fit it.
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
import { backdropSpec, blurredSpec } from "../src/cover-window.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const slug = process.argv[2];
if (!slug) { console.error("Usage: node scripts/render.mjs <slug> [--template Rundown]"); process.exit(1); }
const inputProps = JSON.parse(fs.readFileSync(path.join(ROOT, "data", `${slug}.json`), "utf8"));
const t = process.argv.indexOf("--template");
const template = t !== -1 ? process.argv[t + 1] : inputProps.template ?? "Rundown";
const f = process.argv.indexOf("--format");
const format = f !== -1 ? process.argv[f + 1] : "vertical";
if (!["vertical", "x"].includes(format)) { console.error(`Unknown --format ${format}: vertical or x`); process.exit(1); }
if (format === "x" && template !== "Rundown") { console.error(`No 16:9 ${template} yet: --format x renders Rundown videos`); process.exit(1); }
const id = format === "x" ? `${template}Wide` : template;
/** Output names: reel.mp4 for the vertical reel, reel-x.mp4 for X. */
const suffix = format === "x" ? "-x" : "";
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
 * The faces in the cover (scripts/faces.swift, macOS Vision), for the backdrop: it
 * drifts across the cover behind every card, and a face there reads as the named
 * player's portrait (src/cover-window.mjs keeps them out of view). null when the
 * check cannot run.
 */
async function coverFaces(cover) {
  try {
    const file = path.join(outDir, ".cover");
    fs.writeFileSync(file, Buffer.from(await (await fetch(cover)).arrayBuffer()));
    const found = JSON.parse(execFileSync(swiftTool("faces"), [file]).toString());
    fs.rmSync(file);
    return found;
  } catch (e) {
    console.warn(`warn  no face check on the cover (${String(e.message).split("\n")[0]}): backdrop blurred past recognition`);
    return null;
  }
}
const faces = inputProps.cover ? await coverFaces(inputProps.cover) : null;

const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src", "index.ts") });
// The backdrop's window depends on the frame's shape, so read it from the composition
// first, then select again: Remotion renders with the props the composition was
// selected with, and a change to inputProps afterwards never reaches the frames.
let composition = await selectComposition({ serveUrl, id, inputProps });
if (inputProps.cover) {
  const frameAspect = composition.width / composition.height;
  inputProps.backdrop = faces ? backdropSpec(faces, frameAspect) : blurredSpec(frameAspect);
  if (faces?.faces.length) {
    const b = inputProps.backdrop;
    console.log(`cover has ${faces.faces.length} face(s): ${b.blur > 9 ? "backdrop blurred past recognition" : `backdrop kept to ${Math.round(b.center[0] * 100)}–${Math.round(b.center[1] * 100)}% of the cover at ${b.zoom[0]}× to stay clear of them`}`);
  }
  composition = await selectComposition({ serveUrl, id, inputProps });
  if (JSON.stringify(composition.props.backdrop) !== JSON.stringify(inputProps.backdrop)) throw new Error("backdrop did not reach the composition's props");
}
console.log(`${id}: ${composition.durationInFrames} frames at ${composition.fps} fps = ${(composition.durationInFrames / composition.fps).toFixed(1)} s`);

await renderStill({ composition, serveUrl, inputProps, frame: 60, output: path.join(outDir, `cover${suffix}.png`) });

let last = -1;
const progress = (p) => {
  const pct = Math.floor(p * 10) * 10;
  if (pct !== last) { last = pct; process.stdout.write(`${pct}% `); }
};
const reel = path.join(outDir, withAudio ? `reel${suffix}-silent.mp4` : `reel${suffix}.mp4`);

if (oldMac) {
  const frames = path.join(outDir, `frames${suffix}`);
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
  const spec = { video: reel, out: path.join(outDir, `reel${suffix}.mp4`), music: fs.existsSync(music) ? music : null, musicGain: 0.6, duckGain: 0.16, clips };
  const specFile = path.join(outDir, `.mix${suffix}.json`);
  fs.writeFileSync(specFile, JSON.stringify(spec, null, 2));
  execFileSync(mixer, [specFile], { stdio: "inherit" });
  fs.rmSync(specFile);
}
console.log(`wrote out/${slug}/reel${suffix}.mp4${withAudio ? ` (voice-over and music; reel${suffix}-silent.mp4 without)` : ""} and cover${suffix}.png`);
