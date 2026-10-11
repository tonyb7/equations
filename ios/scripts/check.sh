#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build
swiftc -parse-as-library Core/Sources/GameCore/PracticePuzzle.swift scripts/core-check.swift -o build/core-check
build/core-check
plutil -lint AcademicGames/Info.plist AcademicGames/PrivacyInfo.xcprivacy
if ! xcodebuild -version >/dev/null 2>&1; then
  echo "Core tests passed. Full Xcode is required to build the iOS app." >&2
  exit 1
fi
swift test --package-path Core
xcodebuild -project AcademicGames.xcodeproj -scheme AcademicGames \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath build CODE_SIGNING_ALLOWED=NO build
