# Academic Games for iPhone and iPad

This first version combines the existing online Equalities/Set Maker game with a SwiftUI lobby, native room sharing, an offline arithmetic practice mode, saved practice progress, and an in-app guide. It targets iOS 17+. It uses the existing HTTPS game server; no separate paid backend is needed.

**Status:** the Xcode project is generated. Core logic is testable separately. Full Xcode is required for an iOS build, Simulator, device testing, screenshots, and submission. The app is a development candidate, not yet an App Store submission-ready release. See the release checklist below.

## 1. Install Xcode and open the project

Install the full **Xcode** app from the Mac App Store. Open it once, accept its license, and install the iOS platform/Simulator components it offers. Command Line Tools alone are insufficient.

In Terminal:

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
open ios/AcademicGames.xcodeproj
```

If Xcode is installed under a different name/location, use that path. To regenerate the project after changing `project.yml`:

```bash
brew install xcodegen
xcodegen generate --spec ios/project.yml
```

## 2. Test in Simulator

In Xcode, choose the **AcademicGames** scheme and an installed iPhone Simulator from the device selector at the top. Press **Command+R**. You don't need a paid developer account for Simulator.

Test these flows:

1. Open Practice, answer correctly and incorrectly, and check feedback. Restart the app; solved count and best streak should persist. Turn off connectivity and confirm Practice still works.
2. Open the online lobby, sign in with a game account, and create a room. In a separate browser or device, sign in as another account and **Join as Player** using the code. Start Game and send chat in both directions.
3. Try Equalities and Set Maker. Rotate to landscape. Scroll to the chat panel, pinch to zoom, tap cubes, set a goal, and complete a turn. Check the keyboard doesn't prevent reaching controls.
4. Share a room link using the native toolbar. The friend must still sign in and join as a player through the lobby. This version doesn't claim universal-link support.
5. Background the app briefly, return, and verify reconnection. Disable internet while loading a page and verify a useful error/retry state. A socket outage after a page has loaded is handled by the existing game's reconnect logic, not the native page-loading banner.
6. Check small and large iPhones, iPad, larger text, and VoiceOver. The online board retains its desktop layout and supports scrolling/zooming; it still needs real-device usability testing.

Core and build checks:

```bash
swift test --package-path ios/Core
bash ios/scripts/check.sh
```

The second command first runs a standalone core check, then intentionally fails if full Xcode is absent. XCTest itself also needs full Xcode on this Mac. The core tests cover arithmetic, equivalent correct answers, generated puzzle validity, and room-code validation. They do not establish that the iOS UI compiles or works on a device.

## 3. Install on your own iPhone

Connect the iPhone to your Mac, unlock it, and trust the computer. If requested, enable **Developer Mode** in iPhone Settings > Privacy & Security and restart it.

In Xcode:

1. Add your Apple Account in Xcode Settings > Accounts.
2. Select the project, then the AcademicGames target > Signing & Capabilities.
3. Keep automatic signing enabled and select your team. For local testing you can use a free Personal Team, subject to Apple's provisioning limits.
4. Replace the default bundle identifier `com.sleeperlabs.academicgames` if Apple reports it isn't available. Use a unique identifier you control; keep it consistent for App Store distribution.
5. Select your connected iPhone and press Command+R. Follow any trust/signing prompts.

## 4. Share through TestFlight

TestFlight and App Store distribution require an [Apple Developer Program membership](https://developer.apple.com/programs/), generally **US$99/year** or local currency. The adult project owner should enroll and own the app's publishing account; don't use a shared password or have your 16-year-old brother purchase membership for this project.

1. Enroll, then register the app's bundle ID and create an app record in [App Store Connect](https://appstoreconnect.apple.com/). Use the same bundle ID as the Xcode target.
2. In Xcode choose your paid team, increment the build number for every upload, and select a generic iOS device destination.
3. Choose Product > Archive. In Organizer, validate the archive and select Distribute App > App Store Connect > Upload.
4. Wait for processing, then open the app's TestFlight tab. Complete the required beta information and encryption/export-compliance questions accurately.
5. Invite internal testers. For external testers, create an external group and submit the build for TestFlight review when requested. Testers install Apple's TestFlight app and accept the invitation.

Apple's [upload instructions](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/) and [TestFlight guide](https://developer.apple.com/testflight/) are the source of truth for current Xcode and submission requirements. A simulator build cannot be uploaded as an App Store build.

## 5. Finish these release requirements before public submission

The existing server supports account creation and live chat. Those features create real release work:

- **Account deletion:** implement a way to initiate deletion inside the app, including server-side account/data deletion. Resetting local practice progress or deleting the app does not delete the online account. [Apple's account deletion requirements](https://developer.apple.com/support/offering-account-deletion-in-your-app/).
- **Chat safety:** implement reporting, blocking, appropriate moderation/filtering, and a reachable support contact for the existing multiplayer chat. Decide who handles reports. Follow [App Review guideline 1.2](https://developer.apple.com/app-store/review/guidelines/).
- **Privacy:** publish an accurate privacy policy and support page, link the policy inside the app, and complete App Store privacy answers covering the server too: accounts, game data, chat, IP/server logs, and service providers. The included privacy manifest declares the native preference-storage API reason; its empty collection list does **not** mean the online service collects no data. [App privacy guidance](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy).
- **Actual device testing:** verify gameplay is comfortable on a phone. Improve the online board for touch if scrolling/zooming is insufficient. Test reconnects and lifecycle behavior. Online gameplay currently uses the shared website, not a rewritten native game engine.
- **Review access:** prepare two reviewer accounts and instructions for joining the same room and starting a match. Keep the backend live. Never put credentials in Git.
- **Content and licensing:** review rights to game names, graphics, rules, and this repository's AGPL license before distribution. Don't claim an official AGLOA affiliation.
- **Listing:** choose the final name and bundle ID, provide real-device/simulator screenshots, a description, support and privacy URLs, and accurate age-rating answers reflecting chat. Don't choose a Kids category or a rating merely because the game is educational.
- **Functionality:** demonstrate the native offline practice, saved progress, and sharing as well as the game. Apple decides whether the app satisfies [minimum functionality guideline 4.2](https://developer.apple.com/app-store/review/guidelines/); adding these features does not guarantee approval.

Once these are done, select the processed build in App Store Connect, finish the listing and review information, choose manual release if you want control over launch timing, and submit for App Review. Address any reviewer feedback before releasing it.

## Architecture and limits

- `AcademicGames/`: SwiftUI screens and WKWebView wrapper; persistent WebKit cookies keep online login separate from Safari.
- `Core/`: dependency-free Swift package for practice and room validation.
- `project.yml`: XcodeGen project definition; generated `.xcodeproj` is included for direct opening.
- `PrivacyInfo.xcprivacy`: required-reason declaration for on-device preferences.
- Online navigation stays on the game host. User-tapped external HTTPS links open outside the app. App Transport Security is not disabled.
- No purchases, ads, tracking SDKs, push notifications, or Android build are included.
- Practice is a small arithmetic warm-up, not an implementation of official Equalities tournament rules.
- This does not modify or deploy the Flask server. Live multiplayer remains on the existing Heroku app and retains its server limitations.

The app icon is generated from simple geometric artwork by `scripts/make-icon.swift`; to regenerate it run:

```bash
swift ios/scripts/make-icon.swift ios/AcademicGames/Assets.xcassets/AppIcon.appiconset/AppIcon.png
```
