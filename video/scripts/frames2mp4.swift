// frames2mp4.swift — encode a folder of rendered frames as an H.264 MP4.
//
// Why: Remotion's bundled ffmpeg is built for macOS 15 and will not load on the
// owner's macOS 13 machine (dyld: _AVCaptureDeviceTypeContinuityCamera). Remotion
// still renders the frames in Chrome; this encodes them with AVFoundation, which
// macOS ships, so nothing else has to be downloaded. scripts/render.mjs compiles
// and runs it; you should not need to call it by hand.
//
//   swiftc -O scripts/frames2mp4.swift -o node_modules/.cache/frames2mp4
//   node_modules/.cache/frames2mp4 <frames-dir> <fps> <out.mp4> [bitrate]
//
// Frames are read in name order (element-0000.jpeg …). Silent by design: music is
// added in the app at posting time, from the platform's licensed library.

import AVFoundation
import CoreGraphics
import Foundation
import ImageIO

func fail(_ msg: String) -> Never {
  FileHandle.standardError.write((msg + "\n").data(using: .utf8)!)
  exit(1)
}

let args = CommandLine.arguments
guard args.count >= 4, let fps = Int32(args[2]) else { fail("usage: frames2mp4 <frames-dir> <fps> <out.mp4> [bitrate]") }
let dir = URL(fileURLWithPath: args[1])
let outURL = URL(fileURLWithPath: args[3])
let bitrate = args.count >= 5 ? Int(args[4]) ?? 10_000_000 : 10_000_000

let names = ((try? FileManager.default.contentsOfDirectory(atPath: dir.path)) ?? [])
  .filter { $0.hasSuffix(".jpeg") || $0.hasSuffix(".jpg") || $0.hasSuffix(".png") }
  .sorted()
guard !names.isEmpty else { fail("no frames in \(dir.path)") }

func load(_ name: String) -> CGImage {
  let url = dir.appendingPathComponent(name)
  guard let src = CGImageSourceCreateWithURL(url as CFURL, nil),
    let img = CGImageSourceCreateImageAtIndex(src, 0, nil)
  else { fail("cannot load \(url.path)") }
  return img
}

let first = load(names[0])
let W = first.width
let H = first.height

try? FileManager.default.removeItem(at: outURL)
guard let writer = try? AVAssetWriter(outputURL: outURL, fileType: .mp4) else { fail("cannot create \(outURL.path)") }
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: W,
  AVVideoHeightKey: H,
  AVVideoCompressionPropertiesKey: [
    AVVideoAverageBitRateKey: bitrate,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    AVVideoMaxKeyFrameIntervalKey: Int(fps) * 2,
  ] as [String: Any],
])
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(
  assetWriterInput: input,
  sourcePixelBufferAttributes: [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
    kCVPixelBufferWidthKey as String: W,
    kCVPixelBufferHeightKey as String: H,
  ])
writer.add(input)
writer.startWriting()
writer.startSession(atSourceTime: .zero)

for (i, name) in names.enumerated() {
  let img = i == 0 ? first : load(name)
  while !input.isReadyForMoreMediaData { usleep(2000) }
  var pb: CVPixelBuffer?
  guard let pool = adaptor.pixelBufferPool,
    CVPixelBufferPoolCreatePixelBuffer(nil, pool, &pb) == kCVReturnSuccess, let buffer = pb
  else { fail("no pixel buffer at frame \(i)") }
  CVPixelBufferLockBaseAddress(buffer, [])
  guard
    let ctx = CGContext(
      data: CVPixelBufferGetBaseAddress(buffer), width: W, height: H, bitsPerComponent: 8,
      bytesPerRow: CVPixelBufferGetBytesPerRow(buffer), space: CGColorSpaceCreateDeviceRGB(),
      bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)
  else { fail("no context at frame \(i)") }
  ctx.draw(img, in: CGRect(x: 0, y: 0, width: W, height: H))
  CVPixelBufferUnlockBaseAddress(buffer, [])
  adaptor.append(buffer, withPresentationTime: CMTime(value: CMTimeValue(i), timescale: CMTimeScale(fps)))
}

input.markAsFinished()
let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()
if writer.status != .completed { fail("writer failed: \(writer.error?.localizedDescription ?? "unknown")") }
print("wrote \(outURL.path) — \(names.count) frames, \(String(format: "%.1f", Double(names.count) / Double(fps)))s")
