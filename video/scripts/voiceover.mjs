/**
 * Voice-over for a video, through ElevenLabs.
 *
 *   node scripts/voiceover.mjs samples "<line>"          # one sample per candidate voice → out/vo-samples/
 *   node scripts/voiceover.mjs <slug> --voice <voice_id>  # one clip per scene → out/<slug>/vo/, timings → data/<slug>.vo.json
 *
 * The lines live in data/<slug>.vo.json ({ voice, lines: { hook, items: [...], quote, ballot, close } }),
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
  const clips = [];
  const scenes = [["hook", spec.lines.hook], ...spec.lines.items.map((t, i) => [`item-${String(i).padStart(2, "0")}`, t]), ["quote", spec.lines.quote], ["ballot", spec.lines.ballot], ["close", spec.lines.close]];
  for (const [scene, text] of scenes) {
    if (!text) continue;
    const file = path.join(dir, `${scene}.mp3`);
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
