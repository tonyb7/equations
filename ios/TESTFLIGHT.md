# TestFlight beta release

## Current release candidate

Version **1.0.0 (6)** uses the names **Academic Games**, **Equations**, and **On-Sets**. The bundle identifier remains `com.sleeperlabs.academicgames`; the signing team is **Sleeper Labs LLC (U38WUGYRBV)**. Internal project and scheme names remain AcademicGames.

If Xcode's first-upload dialog says AcademicGames is taken, change the App Store **Name** field to Academic Games. Keep the existing bundle ID. If necessary, create that record in App Store Connect first, then retry the upload.

The command-line archive currently fails at signing with `errSecInternalComponent` because macOS Keychain refuses access to the signing key. Archive from Xcode and approve its Keychain prompt locally. Compilation and simulator tests pass, but this does not mean a signed build has been uploaded.

## Apple account setup

Use the adult owner's paid Apple Developer Program membership. Sign in through Xcode > Settings > Accounts; don't send passwords to Codex. Open the AcademicGames target > Signing & Capabilities, select the paid team, and keep automatic signing enabled. Register `com.sleeperlabs.academicgames` (or choose a different unique identifier and update `project.yml`).

Create an iOS app record in App Store Connect using the same bundle ID, name **Academic Games** if available, primary language English, and an internal SKU such as `academic-games-ios`. Creating the app record is separate from uploading its build.

## Build and upload

Run `bash ios/scripts/check.sh` before archiving. In Xcode select Any iOS Device, then Product > Archive. In Organizer choose Distribute App > App Store Connect > Upload. For a first closed beta choose internal testing; don't submit for public App Store release yet.

Alternatively, after the account is configured, run:

```bash
APPLE_TEAM_ID=YOUR_TEAM_ID BUILD_NUMBER=6 bash ios/scripts/archive.sh
APPLE_TEAM_ID=YOUR_TEAM_ID bash ios/scripts/upload.sh
```

Use a new build number for every upload. A signed archive requires Apple credentials and provisioning; an unsigned or simulator build cannot be uploaded. Apple processes the upload before it appears under TestFlight.

## Beta description

Academic Games lets friends play Equations and On-Sets using the shared online game server. Native arithmetic practice works offline and saves progress on the device. This early beta is for testing multiplayer connectivity and the experience on iPhone and iPad.

## What to test

- Open Practice, solve puzzles, restart the app, and check saved progress. Verify offline practice in airplane mode.
- Sign into two different game accounts on two devices (or one app and one browser).
- Create a room; have the other player join through the lobby as a player.
- Start Game, send chat both directions, move cubes, set a goal, and finish a turn.
- Test Equations and On-Sets. Rotate, scroll the board, zoom, and use the keyboard/chat.
- Background and resume; briefly interrupt connectivity and confirm reconnection.
- Report crashes and unusable controls through TestFlight feedback.

Known limitations: the online board retains a wide layout; it needs scrolling/zooming on phones. Offline practice is arithmetic training rather than a tournament game. Live matches use the existing Heroku server. Public-release account deletion and chat moderation/reporting/blocking remain unfinished.

## Invite testers

After processing, complete required TestFlight beta information, including a feedback email supplied by the owner and accurate export-compliance answers. For internal testing, invite eligible App Store Connect users to an internal group. Invite family members as external testers if they don't need App Store Connect access; external builds go through Apple's beta review. Don't grant production permissions just to let someone test.

External review needs working reviewer accounts and clear two-player instructions. Arrange dedicated review credentials without committing them to Git. Supply a real contact name, email, and phone when App Store Connect asks. Use the owner's details with their agreement.

Before external review/public release, work through the account deletion, chat safety, privacy, and device-testing requirements in `README.md`. Beta review may also raise these issues. Native extras don't guarantee approval under Apple's minimum-functionality rule.

References: [Uploading builds](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/), [TestFlight](https://developer.apple.com/testflight/), [App Review guidelines](https://developer.apple.com/app-store/review/guidelines/).
