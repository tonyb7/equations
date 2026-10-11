import AppKit
import Foundation

// Recreate the website favicon's EQ mark at App Store resolution.
// Original favicon colors: blue #488CCD and lime #AAFF55.
let size = 1024
let canvas = CGContext(data: nil, width: size, height: size, bitsPerComponent: 8,
                       bytesPerRow: size * 4, space: CGColorSpaceCreateDeviceRGB(),
                       bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
NSGraphicsContext.saveGraphicsState()
let context = NSGraphicsContext(cgContext: canvas, flipped: false)
NSGraphicsContext.current = context
NSColor(calibratedRed: 72 / 255.0, green: 140 / 255.0, blue: 205 / 255.0, alpha: 1).setFill()
NSBezierPath(rect: NSRect(x: 0, y: 0, width: size, height: size)).fill()
let attributes: [NSAttributedString.Key: Any] = [
    .font: NSFont(name: "Arial", size: 560)!,
    .foregroundColor: NSColor(calibratedRed: 170 / 255.0, green: 1, blue: 85 / 255.0, alpha: 1)
]
let text = NSAttributedString(string: "EQ", attributes: attributes)
let dimensions = text.size()
text.draw(at: NSPoint(x: (CGFloat(size) - dimensions.width) / 2, y: (CGFloat(size) - dimensions.height) / 2))
context.flushGraphics()
NSGraphicsContext.restoreGraphicsState()
let bitmap = NSBitmapImageRep(cgImage: canvas.makeImage()!)
try bitmap.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
