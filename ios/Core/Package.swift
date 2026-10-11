// swift-tools-version: 5.9
import PackageDescription
let package = Package(name: "GameCore", products: [.library(name: "GameCore", targets: ["GameCore"])], targets: [.target(name: "GameCore"), .testTarget(name: "GameCoreTests", dependencies: ["GameCore"])])
