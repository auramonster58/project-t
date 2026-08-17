import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

guard CommandLine.arguments.count == 3 else {
  fputs("Usage: remove-green-background.swift input.png output.png\n", stderr)
  exit(1)
}

let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2])
guard let source = CGImageSourceCreateWithURL(input as CFURL, nil),
      let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
  fatalError("Cannot open input image")
}

let width = image.width
let height = image.height
let bytesPerRow = width * 4
var pixels = [UInt8](repeating: 0, count: height * bytesPerRow)
guard let context = CGContext(
  data: &pixels,
  width: width,
  height: height,
  bitsPerComponent: 8,
  bytesPerRow: bytesPerRow,
  space: CGColorSpaceCreateDeviceRGB(),
  bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
) else {
  fatalError("Cannot create bitmap context")
}
context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))

for pixel in 0..<(width * height) {
  let offset = pixel * 4
  let red = Int(pixels[offset])
  let green = Int(pixels[offset + 1])
  let blue = Int(pixels[offset + 2])
  let other = max(red, blue)
  let greenExcess = green - other
  guard green > 70, greenExcess > 25 else { continue }

  let removal = min(1, Double(greenExcess - 25) / 145)
  let alpha = Double(pixels[offset + 3]) * (1 - removal)
  pixels[offset + 1] = UInt8(max(0, green - greenExcess))
  pixels[offset + 3] = UInt8(max(0, min(255, alpha)))
}

guard let result = context.makeImage(),
      let destination = CGImageDestinationCreateWithURL(
        output as CFURL,
        UTType.png.identifier as CFString,
        1,
        nil
      ) else {
  fatalError("Cannot create output image")
}
CGImageDestinationAddImage(destination, result, nil)
guard CGImageDestinationFinalize(destination) else {
  fatalError("Cannot save output image")
}
