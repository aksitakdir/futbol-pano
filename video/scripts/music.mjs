/**
 * An instrumental bed for a video, through ElevenLabs Music.
 *
 *   node scripts/music.mjs <slug> <seconds> ["<prompt>"]   → out/<slug>/music.mp3
 *
 * Generated rather than licensed from a library, so the track is cleared for the
 * site's social channels under the owner's ElevenLabs plan (confirm the plan's
 * terms if it changes). Instrumental only: the voice-over carries the words.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, "..", ".env.local"), "utf8").split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }),
);
const [slug, secs, custom] = process.argv.slice(2);
if (!slug || !secs) { console.error('Usage: node scripts/music.mjs <slug> <seconds> ["<prompt>"]'); process.exit(1); }

const prompt = custom ?? [
  "Instrumental only, no vocals.",
  "Modern sports broadcast theme for a football awards countdown: driving electronic beat around 118 BPM,",
  "tight drums, deep pulsing bass, light synth arpeggios and occasional orchestral hits.",
  "Keep the mid-range sparse and steady so a voice-over sits clearly on top.",
  "Build gently through the countdown, lift to a confident, triumphant peak in the final fifteen seconds,",
  "then end cleanly on a final hit.",
].join(" ");

const res = await fetch("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", {
  method: "POST",
  headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "content-type": "application/json" },
  body: JSON.stringify({ prompt, music_length_ms: Math.round(Number(secs) * 1000), model_id: "music_v1" }),
});
if (!res.ok) { console.error(`ElevenLabs Music ${res.status}: ${(await res.text()).slice(0, 400)}`); process.exit(1); }
const out = path.join(ROOT, "out", slug, "music.mp3");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
console.log(`wrote out/${slug}/music.mp3`);
