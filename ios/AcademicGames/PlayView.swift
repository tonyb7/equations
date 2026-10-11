import SwiftUI
import WebKit
import GameCore

@MainActor
final class OnlineGame: ObservableObject {
    static let baseURL = URL(string: "https://equations-online.herokuapp.com")!
    @Published var loading = false
    @Published var error: String?
    @Published var roomURL: URL?
    let webView: WKWebView

    init() {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        let script = """
        if (!document.querySelector('meta[name=viewport]')) {
          const meta = document.createElement('meta'); meta.name='viewport';
          meta.content='width=device-width, initial-scale=1'; document.head.appendChild(meta);
        }
        const style=document.createElement('style');
        style.textContent = document.getElementById('main') ?
          '#main{min-width:1000px;min-height:650px} body{margin:8px} button,input{min-height:44px;font-size:16px!important} p,label,a,#note{font-size:14px!important} h2,h3{font-size:18px!important}' :
          'button,input{font-size:18px!important;padding:10px!important;min-height:44px} body{padding:12px} h1{font-size:26px} img{max-width:100%}';
        document.head.appendChild(style);
        """
        configuration.userContentController.addUserScript(WKUserScript(source: script, injectionTime: .atDocumentEnd, forMainFrameOnly: true))
        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.keyboardDismissMode = .interactive
        webView.isInspectable = true
    }

    func load(_ url: URL = OnlineGame.baseURL) {
        error = nil
        webView.load(URLRequest(url: url))
    }
}

struct PlayView: View {
    @StateObject private var game = OnlineGame()
    @State private var roomCode = ""
    @State private var invalidRoom = false
    @State private var started = false
    @State private var showReloadWarning = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if !started {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 24) {
                            Image(systemName: "square.grid.3x3.fill").font(.system(size: 70)).foregroundStyle(.indigo)
                            Text("Your next match starts here.").font(.largeTitle.bold())
                            Text("Play Equations and On-Sets with friends. Sign in or create an account, create a room, and share its code. A game needs 2 or 3 players.")
                            Button("Open online lobby") { started = true; game.load() }
                                .buttonStyle(.borderedProminent).controlSize(.large)
                            Text("Already have a room?").font(.headline)
                            HStack {
                                TextField("4-character code", text: $roomCode)
                                    .textInputAutocapitalization(.characters).autocorrectionDisabled().textFieldStyle(.roundedBorder)
                                Button("Open") { openRoom() }.buttonStyle(.bordered)
                            }
                            if invalidRoom { Text("Enter a room code such as AB12.").foregroundStyle(.red) }
                            Text("Sign in first, then join through the lobby to become a player. Opening a room link doesn't add you to its player list.").font(.footnote).foregroundStyle(.secondary)
                            Label("Online play needs an internet connection.", systemImage: "wifi")
                            Label("Rotate to landscape and scroll or pinch to see the full board.", systemImage: "iphone.landscape")
                        }.padding(24).frame(maxWidth: 650)
                    }
                } else {
                    if game.loading { ProgressView("Connecting…").padding(8) }
                    if let error = game.error {
                        VStack(spacing: 12) {
                            Text("Couldn't load the game").font(.headline)
                            Text(error).font(.footnote).multilineTextAlignment(.center)
                            Button("Try again") { game.load(game.webView.url ?? OnlineGame.baseURL) }
                        }.padding().frame(maxWidth: .infinity).background(.thinMaterial)
                    }
                    GameWebView(game: game)
                }
            }
            .navigationTitle("Online play").navigationBarTitleDisplayMode(.inline)
            .toolbar {
                if started {
                    ToolbarItem(placement: .topBarLeading) {
                        Button { if game.webView.canGoBack { game.webView.goBack() } else { started = false } }
                            label: { Image(systemName: "chevron.left") }.accessibilityLabel("Back")
                    }
                    ToolbarItemGroup(placement: .topBarTrailing) {
                        if let url = game.roomURL { ShareLink(item: url) { Image(systemName: "square.and.arrow.up") } }
                        Button { showReloadWarning = true } label: { Image(systemName: "arrow.clockwise") }
                            .accessibilityLabel("Reload game")
                    }
                }
            }
            .confirmationDialog("Reloading briefly disconnects you from the game.", isPresented: $showReloadWarning) {
                Button("Reload") { game.load(game.webView.url ?? OnlineGame.baseURL) }
            }
        }
    }

    private func openRoom() {
        guard let code = RoomCode.normalize(roomCode) else { invalidRoom = true; return }
        invalidRoom = false; started = true
        game.load(OnlineGame.baseURL.appendingPathComponent("game/\(code)/"))
    }
}

struct GameWebView: UIViewRepresentable {
    @ObservedObject var game: OnlineGame
    func makeCoordinator() -> Coordinator { Coordinator(game: game) }
    func makeUIView(context: Context) -> WKWebView {
        game.webView.navigationDelegate = context.coordinator
        game.webView.uiDelegate = context.coordinator
        return game.webView
    }
    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        let game: OnlineGame
        init(game: OnlineGame) { self.game = game }
        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            game.loading = true; game.error = nil; game.roomURL = nil
        }
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            game.loading = false
            if let url = webView.url, url.path.hasPrefix("/game/") { game.roomURL = url }
        }
        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) { failed(error) }
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) { failed(error) }
        func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
            game.loading = false; game.error = "The game view closed. Tap Try again to reconnect."
        }
        private func failed(_ error: Error) {
            if (error as NSError).code == NSURLErrorCancelled { return }
            game.loading = false; game.error = error.localizedDescription
        }
        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = action.request.url else { decisionHandler(.cancel); return }
            if url.scheme == "https", url.host == OnlineGame.baseURL.host { decisionHandler(.allow); return }
            if action.navigationType == .linkActivated, ["https", "mailto"].contains(url.scheme ?? "") { UIApplication.shared.open(url) }
            decisionHandler(.cancel)
        }
        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let url = action.request.url, url.scheme == "https" {
                if url.host == OnlineGame.baseURL.host { webView.load(URLRequest(url: url)) }
                else { UIApplication.shared.open(url) }
            }
            return nil
        }
    }
}
