import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

guard CommandLine.arguments.count == 3 else {
  fputs("Usage: remove-black-background.swift input.png output.png\n", stderr)
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
guard let context = CGContext(data: &pixels, width: width, height: height,
  bitsPerComponent: 8, bytesPerRow: bytesPerRow,
  space: CGColorSpaceCreateDeviceRGB(),
  bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
  fatalError("Cannot create bitmap context")
}
context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))

var visited = [Bool](repeating: false, count: width * height)
var queue = [Int]()
queue.reserveCapacity(width * height / 2)

func isBlackBackground(_ pixel: Int) -> Bool {
  let offset = pixel * 4
  return pixels[offset] <= 3 && pixels[offset + 1] <= 3 && pixels[offset + 2] <= 3
}

func enqueue(_ pixel: Int) {
  guard !visited[pixel], isBlackBackground(pixel) else { return }
  visited[pixel] = true
  queue.append(pixel)
}

for x in 0..<width {
  enqueue(x)
  enqueue((height - 1) * width + x)
}
for y in 0..<height {
  enqueue(y * width)
  enqueue(y * width + width - 1)
}

var cursor = 0
while cursor < queue.count {
  let pixel = queue[cursor]
  cursor += 1
  let x = pixel % width
  let y = pixel / width
  if x > 0 { enqueue(pixel - 1) }
  if x + 1 < width { enqueue(pixel + 1) }
  if y > 0 { enqueue(pixel - width) }
  if y + 1 < height { enqueue(pixel + width) }
}

for pixel in queue {
  let offset = pixel * 4
  pixels[offset] = 0
  pixels[offset + 1] = 0
  pixels[offset + 2] = 0
  pixels[offset + 3] = 0
}

guard let result = context.makeImage(),
      let destination = CGImageDestinationCreateWithURL(
        output as CFURL, UTType.png.identifier as CFString, 1, nil
      ) else {
  fatalError("Cannot create output image")
}
CGImageDestinationAddImage(destination, result, nil)
guard CGImageDestinationFinalize(destination) else { fatalError("Cannot save output image") }
