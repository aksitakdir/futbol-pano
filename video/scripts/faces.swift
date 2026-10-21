// Faces in an image, found by macOS's Vision framework.
//
//   faces <image> → JSON { "width": 1456, "height": 816, "faces": [{ "x": 0.52, "w": 0.18 }, …] }
//
// x and w are fractions of the image width (a face's left edge and its width). The video backdrop
// pans across the article's cover behind named players, and a face there reads as
// that player's portrait, so render.mjs keeps the pan clear of every face found.
import Foundation
import ImageIO
import Vision

guard CommandLine.arguments.count == 2 else {
  FileHandle.standardError.write("usage: faces <image>\n".data(using: .utf8)!)
  exit(1)
}
let url = URL(fileURLWithPath: CommandLine.arguments[1])
let request = VNDetectFaceRectanglesRequest()
do {
  try VNImageRequestHandler(url: url, options: [:]).perform([request])
} catch {
  FileHandle.standardError.write("Vision failed: \(error)\n".data(using: .utf8)!)
  exit(1)
}
let faces = (request.results ?? []).map { f in
  ["x": Double(f.boundingBox.minX), "w": Double(f.boundingBox.width)]
}
let props = CGImageSourceCreateWithURL(url as CFURL, nil).flatMap { CGImageSourceCopyPropertiesAtIndex($0, 0, nil) } as? [CFString: Any]
let out: [String: Any] = [
  "width": props?[kCGImagePropertyPixelWidth] as? Int ?? 0,
  "height": props?[kCGImagePropertyPixelHeight] as? Int ?? 0,
  "faces": faces,
]
let json = try JSONSerialization.data(withJSONObject: out, options: [.sortedKeys])
print(String(data: json, encoding: .utf8)!)
