import AppKit
import Foundation
let size = 1024
let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8, samplesPerPixel: 3, hasAlpha: false, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: size * 3, bitsPerPixel: 24)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
NSColor(calibratedRed: 0.10, green: 0.12, blue: 0.32, alpha: 1).setFill()
NSBezierPath(rect: NSRect(x: 0, y: 0, width: size, height: size)).fill()
let symbols = ["+", "×", "−", "="]
let colors: [NSColor] = [.systemTeal, .systemBlue, .systemOrange, .systemIndigo]
for i in 0..<4 {
    let x = 142 + (i % 2) * 390
    let y = 142 + (i / 2) * 390
    colors[i].setFill()
    NSBezierPath(roundedRect: NSRect(x: x, y: y, width: 350, height: 350), xRadius: 64, yRadius: 64).fill()
    let attrs: [NSAttributedString.Key: Any] = [.font: NSFont.systemFont(ofSize: 210, weight: .bold), .foregroundColor: NSColor.white]
    let text = NSAttributedString(string: symbols[i], attributes: attrs)
    let dimensions = text.size()
    text.draw(at: NSPoint(x: CGFloat(x) + (350 - dimensions.width) / 2, y: CGFloat(y) + (350 - dimensions.height) / 2))
}
NSGraphicsContext.restoreGraphicsState()
try bitmap.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
