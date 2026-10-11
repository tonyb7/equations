#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -z "${APPLE_TEAM_ID:-}" ]]; then
  echo "Set APPLE_TEAM_ID to the paid Apple Developer team's ID." >&2
  exit 1
fi
xcodebuild -project AcademicGames.xcodeproj -scheme AcademicGames \
  -configuration Release -destination 'generic/platform=iOS' \
  -archivePath build/AcademicGames.xcarchive \
  DEVELOPMENT_TEAM="$APPLE_TEAM_ID" \
  CURRENT_PROJECT_VERSION="${BUILD_NUMBER:-3}" \
  -allowProvisioningUpdates archive
echo "Archive ready: ios/build/AcademicGames.xcarchive"
