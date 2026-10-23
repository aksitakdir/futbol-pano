// shrink.swift — re-encode a finished reel smaller, keeping its sound as it is.
//
//   swiftc -O scripts/shrink.swift -o node_modules/.cache/shrink
//   node_modules/.cache/shrink <in.mp4> <out.mp4> <bitrate, e.g. 3500000 or 3.5M>
//
// H.264 High / CABAC at an average bitrate, a keyframe every 4 s, B-frames allowed; the
// audio track is copied through untouched. For reels encoded before render.mjs dropped
// to 3.5 Mbps (October 2026): a test at 2.5 / 3.5 / 4.5 / 6 Mbps found no loss a viewer
// would see down to 3.5, and Instagram and X re-encode every upload lower than that.
import AVFoundation
import Foundation

func fail(_ msg: String) -> Never {
  FileHandle.standardError.write((msg + "\n").data(using: .utf8)!)
  exit(1)
}

let args = CommandLine.arguments
guard args.count == 4 else { fail("usage: shrink <in.mp4> <out.mp4> <bitrate e.g. 4500000 or 4.5M>") }
let inURL = URL(fileURLWithPath: args[1])
let outURL = URL(fileURLWithPath: args[2])
var brStr = args[3].uppercased()
var mult = 1.0
if brStr.hasSuffix("M") { mult = 1_000_000; brStr.removeLast() }
else if brStr.hasSuffix("K") { mult = 1_000; brStr.removeLast() }
guard let brVal = Double(brStr) else { fail("bad bitrate: \(args[3])") }
let bitrate = Int(brVal * mult)

let asset = AVURLAsset(url: inURL)
guard let vTrack = asset.tracks(withMediaType: .video).first else { fail("no video track") }
let aTrack = asset.tracks(withMediaType: .audio).first

try? FileManager.default.removeItem(at: outURL)

let reader: AVAssetReader
let writer: AVAssetWriter
do {
  reader = try AVAssetReader(asset: asset)
  writer = try AVAssetWriter(outputURL: outURL, fileType: .mp4)
} catch { fail("init: \(error)") }

// Video: decode to 4:2:0 biplanar (what the encoder wants natively).
let vOut = AVAssetReaderTrackOutput(track: vTrack, outputSettings: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange,
])
vOut.alwaysCopiesSampleData = false
guard reader.canAdd(vOut) else { fail("cannot add video output") }
reader.add(vOut)

let size = vTrack.naturalSize
let fps = vTrack.nominalFrameRate > 0 ? vTrack.nominalFrameRate : 30
let vSettings: [String: Any] = [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: Int(size.width),
  AVVideoHeightKey: Int(size.height),
  AVVideoCompressionPropertiesKey: [
    AVVideoAverageBitRateKey: bitrate,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    AVVideoH264EntropyModeKey: AVVideoH264EntropyModeCABAC,
    AVVideoMaxKeyFrameIntervalKey: 120,
    AVVideoMaxKeyFrameIntervalDurationKey: 4,
    AVVideoAllowFrameReorderingKey: true,
    AVVideoExpectedSourceFrameRateKey: Int(fps.rounded()),
  ] as [String: Any],
]
let vIn = AVAssetWriterInput(mediaType: .video, outputSettings: vSettings)
vIn.expectsMediaDataInRealTime = false
vIn.transform = vTrack.preferredTransform
guard writer.canAdd(vIn) else { fail("cannot add video input") }
writer.add(vIn)

// Audio: passthrough (outputSettings nil on both sides).
var aOut: AVAssetReaderTrackOutput?
var aIn: AVAssetWriterInput?
if let aTrack = aTrack {
  let o = AVAssetReaderTrackOutput(track: aTrack, outputSettings: nil)
  o.alwaysCopiesSampleData = false
  guard reader.canAdd(o) else { fail("cannot add audio output") }
  reader.add(o)
  let fmt = aTrack.formatDescriptions.first.map { $0 as! CMFormatDescription }
  let i = AVAssetWriterInput(mediaType: .audio, outputSettings: nil, sourceFormatHint: fmt)
  i.expectsMediaDataInRealTime = false
  guard writer.canAdd(i) else { fail("cannot add audio input") }
  writer.add(i)
  aOut = o
  aIn = i
}

guard reader.startReading() else { fail("reader start: \(String(describing: reader.error))") }
guard writer.startWriting() else { fail("writer start: \(String(describing: writer.error))") }
writer.startSession(atSourceTime: .zero)

let group = DispatchGroup()
func pump(_ output: AVAssetReaderTrackOutput, _ input: AVAssetWriterInput, _ label: String) {
  group.enter()
  let q = DispatchQueue(label: label)
  var done = false
  input.requestMediaDataWhenReady(on: q) {
    while input.isReadyForMoreMediaData && !done {
      if let sb = output.copyNextSampleBuffer() {
        if !input.append(sb) {
          FileHandle.standardError.write("append failed (\(label)): \(String(describing: writer.error))\n".data(using: .utf8)!)
          done = true
        }
      } else {
        done = true
      }
      if done {
        input.markAsFinished()
        group.leave()
      }
    }
  }
}
pump(vOut, vIn, "video")
if let o = aOut, let i = aIn { pump(o, i, "audio") }
group.wait()

if reader.status == .failed { fail("reader failed: \(String(describing: reader.error))") }
let sem = DispatchSemaphore(value: 0)
writer.finishWriting { sem.signal() }
sem.wait()
if writer.status != .completed { fail("writer failed: \(String(describing: writer.error))") }
let bytes = (try? FileManager.default.attributesOfItem(atPath: outURL.path)[.size] as? Int) ?? 0
print(String(format: "%@  %.2f MB  (target %.2f Mbps)", outURL.lastPathComponent, Double(bytes) / 1_000_000, Double(bitrate) / 1_000_000))
