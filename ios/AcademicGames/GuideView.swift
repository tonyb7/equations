import SwiftUI

struct GuideView: View {
    @AppStorage("practiceSolved") private var solved = 0
    @AppStorage("practiceBestStreak") private var streak = 0
    @State private var reset = false
    var body: some View {
        NavigationStack {
            List {
                Section("Play with friends") {
                    Text("1. Open the online lobby and sign in.")
                    Text("2. Create an Equations or On-Sets room.")
                    Text("3. Share its code. Your friends sign in and choose Join as Player in the lobby.")
                    Text("4. With two or three players in the room, tap Start Game. Use chat to agree on variations.")
                    Text("The board is easiest in landscape. Scroll horizontally to reach chat and pinch to zoom.")
                }
                Section("Keep playing") {
                    Text("Practice is available without an account or internet. Your solved count and best streak are saved on this device.")
                    Text("Online matches need an internet connection. Returning from the background may reconnect you; if the server restarts, live room state may be lost.")
                }
                Section("Learn the games") {
                    Link("Equations rules", destination: URL(string: "https://www.agloa.org/eq-docs/")!)
                    Link("On-Sets rules", destination: URL(string: "https://www.agloa.org/os-docs/")!)
                }
                Section("About") {
                    Text("Academic Games • version 1.0")
                    Text("Sleeper Labs LLC is a no-revenue entity. This project exists purely for the community.")
                    Text("Online accounts and game data are stored by the game server. Offline practice progress stays on your device. No ads or analytics SDKs are included in this app.")
                    Link("Project source and support", destination: URL(string: "https://github.com/tonyb7/equations")!)
                    Link("Privacy Policy", destination: URL(string: "https://equations-online.herokuapp.com/privacy/")!)
                    Text("This is a community project, not an official AGLOA app.")
                }
                Section("This device") {
                    Button("Reset practice progress", role: .destructive) { reset = true }
                }
            }.navigationTitle("Guide")
                .confirmationDialog("Reset your saved practice progress?", isPresented: $reset) {
                    Button("Reset progress", role: .destructive) { solved = 0; streak = 0 }
                }
        }
    }
}
