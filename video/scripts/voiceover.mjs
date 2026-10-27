/**
 * Voice-over for a video, through ElevenLabs.
 *
 *   node scripts/voiceover.mjs samples "<line>"          # one sample per candidate voice → out/vo-samples/
 *   node scripts/voiceover.mjs <slug> --voice <voice_id>  # one clip per scene → out/<slug>/vo/, timings → data/<slug>.vo.json
 *
 * The lines live in data/<slug>.vo.json ({ voice, lines: { hook, items|stats: [...], contrast, quote, ballot, close } }),
 * written by hand and approved by the owner before any credits are spent; every
 * number in them must match data/<slug>.json, which comes from the article.
 * The key is read from ../.env.local (ELEVENLABS_API_KEY) and never printed.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, "..", ".env.local"), "utf8").split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }),
);
const KEY = env.ELEVENLABS_API_KEY;
if (!KEY) { console.error("ELEVENLABS_API_KEY is empty in .env.local"); process.exit(1); }

/** ElevenLabs' public premade voices that suit sports narration. */
export const CANDIDATES = {
  daniel: "onwK4e9ZLuTAKqWW03F9", // British, steady, broadcast
  brian: "nPczCjzI2devNBz1zQrb", // American, deep, narration
  charlie: "IKne3meq5aSn9XLyUdCD", // Australian, conversational, energetic
};
const MODEL = "eleven_multilingual_v2"; // pronounces Zaïre-Emery, Cubarsí, Alajbegović best
const SETTINGS = { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true };

async function speak(voiceId, text, outFile) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "content-type": "application/json" },
    body: JSON.stringify({ text, model_id: MODEL, voice_settings: SETTINGS }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
}

/** Length of an audio file in seconds, read by macOS (afinfo). */
function seconds(file) {
  const out = execFileSync("afinfo", [file]).toString();
  return Number(out.match(/estimated duration: ([\d.]+)/)?.[1] ?? 0);
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === "samples") {
  const line = rest.join(" ");
  for (const [name, id] of Object.entries(CANDIDATES)) {
    const file = path.join(ROOT, "out", "vo-samples", `${name}.mp3`);
    await speak(id, line, file);
    console.log(`${name}: ${seconds(file).toFixed(1)} s → out/vo-samples/${name}.mp3`);
  }
} else if (cmd) {
  const slug = cmd;
  const v = rest.indexOf("--voice");
  const specFile = path.join(ROOT, "data", `${slug}.vo.json`);
  const spec = JSON.parse(fs.readFileSync(specFile, "utf8"));
  const voice = v !== -1 ? rest[v + 1] : spec.voice;
  if (!voice) { console.error("No voice: pass --voice <id> or set \"voice\" in the .vo.json"); process.exit(1); }
  const dir = path.join(ROOT, "out", slug, "vo");
  // --only hook,contrast re-voices just those scenes (a corrected line costs its own
  // characters, not the whole script); every other clip and its timing is kept.
  const o = rest.indexOf("--only");
  const only = o !== -1 ? rest[o + 1].split(",") : null;
  const kept = new Map((spec.clips ?? []).map((c) => [c.scene, c]));
  const clips = [];
  // Lines per scene: hook, items[] (Rundown) or stats[] (Profile), contrast, quote, ballot, close.
  const L = spec.lines;
  const pad = (i) => String(i).padStart(2, "0");
  const scenes = [
    ["hook", L.hook],
    ...(L.items ?? []).map((t, i) => [`item-${pad(i)}`, t]),
    ...(L.stats ?? []).map((t, i) => [`stat-${pad(i)}`, t]),
    ["contrast", L.contrast], ["quote", L.quote], ["ballot", L.ballot], ["close", L.close],
  ];
  for (const [scene, text] of scenes) {
    if (!text) continue;
    const file = path.join(dir, `${scene}.mp3`);
    if (only && !only.includes(scene)) {
      if (!kept.has(scene) || !fs.existsSync(file)) { console.error(`--only: no earlier clip for ${scene}; voice it too`); process.exit(1); }
      clips.push(kept.get(scene));
      console.log(`${scene.padEnd(8)} kept`);
      continue;
    }
    await speak(voice, text, file);
    clips.push({ scene, file: path.relative(ROOT, file), seconds: Number(seconds(file).toFixed(3)) });
    console.log(`${scene.padEnd(8)} ${clips.at(-1).seconds.toFixed(2)} s  ${text}`);
  }
  spec.voice = voice;
  spec.clips = clips;
  fs.writeFileSync(specFile, JSON.stringify(spec, null, 2) + "\n");
  console.log(`total speech ${clips.reduce((s, c) => s + c.seconds, 0).toFixed(1)} s — timings written to data/${slug}.vo.json`);
} else {
  console.error('Usage: node scripts/voiceover.mjs samples "<line>" | <slug> [--voice <id>]');
  process.exit(1);
}
