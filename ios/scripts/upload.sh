#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -z "${APPLE_TEAM_ID:-}" ]]; then
  echo "Set APPLE_TEAM_ID to the paid Apple Developer team's ID." >&2
  exit 1
fi
if [[ ! -d build/AcademicGames.xcarchive ]]; then
  echo "Run archive.sh first." >&2
  exit 1
fi
python3 - "$APPLE_TEAM_ID" <<'PY'
import plistlib, sys
with open("build/ExportOptions.plist", "wb") as output:
    plistlib.dump({"method": "app-store-connect", "destination": "upload", "teamID": sys.argv[1], "signingStyle": "automatic"}, output)
PY
xcodebuild -exportArchive -archivePath build/AcademicGames.xcarchive \
  -exportPath build/export -exportOptionsPlist build/ExportOptions.plist \
  -allowProvisioningUpdates
