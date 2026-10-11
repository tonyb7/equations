import SwiftUI

@main
struct AcademicGamesApp: App {
    var body: some Scene {
        WindowGroup { RootView().tint(.indigo) }
    }
}

struct RootView: View {
    var body: some View {
        TabView {
            PlayView().tabItem { Label("Play", systemImage: "person.2.fill") }
            PracticeView().tabItem { Label("Practice", systemImage: "square.grid.2x2.fill") }
            GuideView().tabItem { Label("Guide", systemImage: "book.fill") }
        }
    }
}
