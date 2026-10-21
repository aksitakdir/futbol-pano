// mixaudio.swift — lay a voice-over and a music bed under a silent video.
//
// Why Swift: Remotion mixes audio with its bundled ffmpeg, which does not load on
// macOS 13 (see frames2mp4.swift). AVFoundation ships with macOS. scripts/render.mjs
// writes the spec and runs this; you should not need to call it by hand.
//
//   swiftc -O scripts/mixaudio.swift -o node_modules/.cache/mixaudio
//   node_modules/.cache/mixaudio spec.json
//
// spec.json: { "video": "reel-silent.mp4", "out": "reel.mp4", "music": "music.mp3" | null,
//              "musicGain": 0.6, "duckGain": 0.16, "clips": [ { "file": "vo/hook.mp3", "start": 0.5 } ] }
//
// The music sits at `musicGain` and drops to `duckGain` while the voice speaks. Lines
// closer than a second apart count as one passage, so the bed does not pump between
// sentences. The mix is exported as AAC first, then joined to the untouched video.

import AVFoundation
import Foundation

struct Clip: Decodable { let file: String; let start: Double }
struct Spec: Decodable {
  let video: String
  let out: String
  let music: String?
  let musicGain: Double
  let duckGain: Double
  let clips: [Clip]
}

func fail(_ msg: String) -> Never {
  FileHandle.standardError.write((msg + "\n").data(using: .utf8)!)
  exit(1)
}
func t(_ s: Double) -> CMTime { CMTime(seconds: max(0, s), preferredTimescale: 600) }

guard CommandLine.arguments.count >= 2 else { fail("usage: mixaudio spec.json") }
let specURL = URL(fileURLWithPath: CommandLine.arguments[1])
guard let spec = try? JSONDecoder().decode(Spec.self, from: Data(contentsOf: specURL)) else { fail("cannot read \(specURL.path)") }
let base = specURL.deletingLastPathComponent()
func url(_ p: String) -> URL { p.hasPrefix("/") ? URL(fileURLWithPath: p) : base.appendingPathComponent(p) }

func export(_ session: AVAssetExportSession) {
  let done = DispatchSemaphore(value: 0)
  session.exportAsynchronously { done.signal() }
  done.wait()
  if session.status != .completed { fail("export failed: \(session.error?.localizedDescription ?? "unknown")") }
}

let video = AVURLAsset(url: url(spec.video))
let length = video.duration
guard let videoTrack = video.tracks(withMediaType: .video).first else { fail("no video track in \(spec.video)") }

// ── 1. the audio: voice clips at their starts, music from zero ──
let audio = AVMutableComposition()
guard let voice = audio.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) else { fail("no voice track") }
var spans: [(Double, Double)] = []
for c in spec.clips {
  let a = AVURLAsset(url: url(c.file))
  guard let tr = a.tracks(withMediaType: .audio).first else { fail("no audio in \(c.file)") }
  try? voice.insertTimeRange(CMTimeRange(start: .zero, duration: a.duration), of: tr, at: t(c.start))
  spans.append((c.start, c.start + a.duration.seconds))
}

var params: [AVMutableAudioMixInputParameters] = []
if let m = spec.music {
  let a = AVURLAsset(url: url(m))
  guard let tr = a.tracks(withMediaType: .audio).first, let bed = audio.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid)
  else { fail("no audio in \(m)") }
  let len = min(a.duration, length)
  try? bed.insertTimeRange(CMTimeRange(start: .zero, duration: len), of: tr, at: .zero)
  let p = AVMutableAudioMixInputParameters(track: bed)
  p.setVolume(Float(spec.musicGain), at: .zero)
  // Merge lines less than a second apart into passages.
  var passages: [(Double, Double)] = []
  for s in spans.sorted(by: { $0.0 < $1.0 }) {
    if let last = passages.last, s.0 - last.1 < 1.0 { passages[passages.count - 1].1 = max(last.1, s.1) } else { passages.append(s) }
  }
  let G = Float(spec.musicGain), D = Float(spec.duckGain)
  // AVFoundation refuses overlapping ramps, so lay them down in order: each starts no
  // earlier than the last one ended, and the closing fade starts from wherever the
  // level is (a voice-over that runs to the end leaves the bed ducked).
  let end = len.seconds
  var cursor = 0.0
  var level = G
  func ramp(_ from: Double, _ dur: Double, to: Float) {
    let start = max(from, cursor)
    let d = min(dur, end - 0.6 - start)
    guard d > 0.02 else { return }
    p.setVolumeRamp(fromStartVolume: level, toEndVolume: to, timeRange: CMTimeRange(start: t(start), duration: t(d)))
    cursor = start + d
    level = to
  }
  for (a0, a1) in passages {
    ramp(a0 - 0.25, 0.25, to: D)
    ramp(a1 + 0.05, 0.4, to: G)
  }
  // Fade the bed out over the last 0.6 s.
  p.setVolumeRamp(fromStartVolume: level, toEndVolume: 0, timeRange: CMTimeRange(start: t(max(cursor, end - 0.6)), duration: t(min(0.6, end - max(cursor, end - 0.6)))))
  params.append(p)
}
let vp = AVMutableAudioMixInputParameters(track: voice)
vp.setVolume(1.0, at: .zero)
params.append(vp)
let mix = AVMutableAudioMix()
mix.inputParameters = params

let mixed = base.appendingPathComponent(".mix.m4a")
try? FileManager.default.removeItem(at: mixed)
guard let ex1 = AVAssetExportSession(asset: audio, presetName: AVAssetExportPresetAppleM4A) else { fail("no audio exporter") }
ex1.outputURL = mixed
ex1.outputFileType = .m4a
ex1.audioMix = mix
ex1.timeRange = CMTimeRange(start: .zero, duration: length)
export(ex1)

// ── 2. the picture, untouched, with the mixed audio ──
let final = AVMutableComposition()
guard let fv = final.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid),
  let fa = final.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid)
else { fail("no output tracks") }
try? fv.insertTimeRange(CMTimeRange(start: .zero, duration: length), of: videoTrack, at: .zero)
let mixedAsset = AVURLAsset(url: mixed)
guard let ma = mixedAsset.tracks(withMediaType: .audio).first else { fail("mix has no audio") }
try? fa.insertTimeRange(CMTimeRange(start: .zero, duration: min(mixedAsset.duration, length)), of: ma, at: .zero)

let outURL = url(spec.out)
try? FileManager.default.removeItem(at: outURL)
guard let ex2 = AVAssetExportSession(asset: final, presetName: AVAssetExportPresetPassthrough) else { fail("no exporter") }
ex2.outputURL = outURL
ex2.outputFileType = .mp4
export(ex2)
try? FileManager.default.removeItem(at: mixed)
print("wrote \(outURL.path) — \(String(format: "%.1f", length.seconds))s, \(spec.clips.count) voice clips\(spec.music != nil ? " + music" : "")")
