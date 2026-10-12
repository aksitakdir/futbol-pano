// reel.swift — turn a sequence of Scout Gamer card PNGs into a vertical MP4.
//
// Why Swift: macOS ships AVFoundation, so this needs no ffmpeg, no download and
// no API. `scripts/social-video.mjs` fetches the cards, writes a spec and runs
// this; you should not need to call it by hand.
//
//   swiftc -O scripts/video/reel.swift -o node_modules/.cache/scout-reel
//   node_modules/.cache/scout-reel spec.json
//
// spec.json:
//   { "width": 1080, "height": 1920, "fps": 30, "crossfade": 0.45, "out": "reel.mp4",
//     "clips": [ { "image": "01.png", "duration": 3.0, "zoomFrom": 1.0, "zoomTo": 1.05 } ] }
//
// Each clip holds its card with a slow push-in (Ken Burns), and the next card
// fades in over the last `crossfade` seconds. Silent by design: the platforms'
// own licensed audio is added in the app when posting.

import AVFoundation
import CoreGraphics
import Foundation
import ImageIO

struct Clip: Decodable {
  let image: String
  let duration: Double
  let zoomFrom: Double?
  let zoomTo: Double?
}

struct Spec: Decodable {
  let width: Int
  let height: Int
  let fps: Int
  let crossfade: Double
  let out: String
  let clips: [Clip]
}

func fail(_ msg: String) -> Never {
  FileHandle.standardError.write((msg + "\n").data(using: .utf8)!)
  exit(1)
}

guard CommandLine.arguments.count >= 2 else { fail("usage: scout-reel spec.json") }
let specURL = URL(fileURLWithPath: CommandLine.arguments[1])
guard let specData = try? Data(contentsOf: specURL),
  let spec = try? JSONDecoder().decode(Spec.self, from: specData)
else { fail("cannot read spec \(specURL.path)") }
guard !spec.clips.isEmpty else { fail("spec has no clips") }

let base = specURL.deletingLastPathComponent()
func resolve(_ p: String) -> URL { p.hasPrefix("/") ? URL(fileURLWithPath: p) : base.appendingPathComponent(p) }

let images: [CGImage] = spec.clips.map { clip in
  let url = resolve(clip.image)
  guard let src = CGImageSourceCreateWithURL(url as CFURL, nil),
    let img = CGImageSourceCreateImageAtIndex(src, 0, nil)
  else { fail("cannot load image \(url.path)") }
  return img
}

// Timeline: clip i starts where clip i-1 begins to fade out.
var starts: [Double] = []
var t = 0.0
for (i, c) in spec.clips.enumerated() {
  starts.append(t)
  t += c.duration - (i < spec.clips.count - 1 ? spec.crossfade : 0)
}
let total = t
let frameCount = Int((total * Double(spec.fps)).rounded())

let outURL = resolve(spec.out)
try? FileManager.default.removeItem(at: outURL)
guard let writer = try? AVAssetWriter(outputURL: outURL, fileType: .mp4) else { fail("cannot create \(outURL.path)") }
let settings: [String: Any] = [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: spec.width,
  AVVideoHeightKey: spec.height,
  AVVideoCompressionPropertiesKey: [
    AVVideoAverageBitRateKey: 6_000_000,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    AVVideoMaxKeyFrameIntervalKey: spec.fps * 2,
  ] as [String: Any],
]
let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(
  assetWriterInput: input,
  sourcePixelBufferAttributes: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
    kCVPixelBufferWidthKey as String: spec.width,
    kCVPixelBufferHeightKey as String: spec.height,
  ])
writer.add(input)
writer.startWriting()
writer.startSession(atSourceTime: .zero)

let W = CGFloat(spec.width)
let H = CGFloat(spec.height)

/// Draw one card, scaled to cover the frame and pushed in by `zoom`, at `alpha`.
func draw(_ img: CGImage, zoom: Double, alpha: Double, in ctx: CGContext) {
  let iw = CGFloat(img.width)
  let ih = CGFloat(img.height)
  let cover = max(W / iw, H / ih) * CGFloat(zoom)
  let w = iw * cover
  let h = ih * cover
  ctx.saveGState()
  ctx.setAlpha(CGFloat(alpha))
  ctx.draw(img, in: CGRect(x: (W - w) / 2, y: (H - h) / 2, width: w, height: h))
  ctx.restoreGState()
}

let ease = { (x: Double) -> Double in x * x * (3 - 2 * x) }  // smoothstep

for f in 0..<frameCount {
  while !input.isReadyForMoreMediaData { usleep(2000) }
  let time = Double(f) / Double(spec.fps)

  var pb: CVPixelBuffer?
  guard let pool = adaptor.pixelBufferPool,
    CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pb) == kCVReturnSuccess, let buffer = pb
  else { fail("no pixel buffer at frame \(f)") }
  CVPixelBufferLockBaseAddress(buffer, [])
  guard
    let ctx = CGContext(
      data: CVPixelBufferGetBaseAddress(buffer), width: spec.width, height: spec.height, bitsPerComponent: 8,
      bytesPerRow: CVPixelBufferGetBytesPerRow(buffer), space: CGColorSpaceCreateDeviceRGB(),
      bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)
  else { fail("no context at frame \(f)") }
  ctx.interpolationQuality = .high
  ctx.setFillColor(CGColor(red: 0.04, green: 0.06, blue: 0.09, alpha: 1))
  ctx.fill(CGRect(x: 0, y: 0, width: W, height: H))

  for (i, c) in spec.clips.enumerated() {
    let local = time - starts[i]
    if local < 0 || local > c.duration { continue }
    let p = min(max(local / c.duration, 0), 1)
    let zoom = (c.zoomFrom ?? 1.0) + ((c.zoomTo ?? 1.05) - (c.zoomFrom ?? 1.0)) * ease(p)
    // Fade in over the crossfade window (except the first clip).
    let alpha = i == 0 ? 1.0 : min(1.0, ease(min(local / spec.crossfade, 1.0)))
    draw(images[i], zoom: zoom, alpha: alpha, in: ctx)
  }

  CVPixelBufferUnlockBaseAddress(buffer, [])
  adaptor.append(buffer, withPresentationTime: CMTime(value: CMTimeValue(f), timescale: CMTimeScale(spec.fps)))
}

input.markAsFinished()
let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()
if writer.status != .completed { fail("writer failed: \(writer.error?.localizedDescription ?? "unknown")") }
print("wrote \(outURL.path) — \(String(format: "%.1f", total))s, \(frameCount) frames")
