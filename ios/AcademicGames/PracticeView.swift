import SwiftUI
import UIKit
import GameCore

struct PracticeView: View {
    @State private var puzzle = PracticePuzzle.random()
    @State private var selection: String?
    @State private var feedback = ""
    @AppStorage("practiceSolved") private var solved = 0
    @AppStorage("practiceBestStreak") private var bestStreak = 0
    @State private var streak = 0

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 28) {
                    Label("Works offline", systemImage: "wifi.slash").font(.subheadline).foregroundStyle(.secondary)
                    Text("Find the operation").font(.largeTitle.bold())
                    Text("Choose the operation that makes the target.").multilineTextAlignment(.center)
                    Text("Target: \(puzzle.target)").font(.title.bold()).foregroundStyle(.indigo)
                    HStack(spacing: 16) {
                        cube(String(puzzle.left))
                        cube(selection ?? "?")
                        cube(String(puzzle.right))
                    }
                    HStack {
                        ForEach(PracticePuzzle.operations, id: \.self) { operation in
                            Button(operation) { choose(operation) }
                                .font(.largeTitle.bold()).frame(maxWidth: .infinity, minHeight: 64)
                                .buttonStyle(.borderedProminent).disabled(selection != nil)
                                .accessibilityLabel(operation == "×" ? "Multiply" : operation == "−" ? "Subtract" : "Add")
                        }
                    }
                    Text(feedback).font(.headline).accessibilityIdentifier("practiceFeedback")
                    if selection != nil {
                        Button("Next puzzle") { puzzle = .random(); selection = nil; feedback = "" }
                            .buttonStyle(.borderedProminent).controlSize(.large)
                    }
                    HStack {
                        Label("\(solved) solved", systemImage: "checkmark.circle")
                        Spacer()
                        Label("Best streak: \(bestStreak)", systemImage: "flame")
                    }.font(.subheadline)
                    Text("Arithmetic warm-up, not a full Equalities match. Multiplayer uses the online game.")
                        .font(.footnote).foregroundStyle(.secondary).multilineTextAlignment(.center)
                }.padding(24).frame(maxWidth: 600)
            }.frame(maxWidth: .infinity).navigationTitle("Practice")
        }
    }

    private func cube(_ text: String) -> some View {
        Text(text).font(.system(size: 36, weight: .bold, design: .rounded))
            .frame(minWidth: 64, minHeight: 80).frame(maxWidth: .infinity)
            .background(.indigo.opacity(0.12), in: RoundedRectangle(cornerRadius: 18))
    }

    private func choose(_ operation: String) {
        selection = operation
        if puzzle.accepts(operation) {
            solved += 1; streak += 1; bestStreak = max(bestStreak, streak)
            feedback = "Correct! \(puzzle.left) \(operation) \(puzzle.right) = \(puzzle.target)"
            UINotificationFeedbackGenerator().notificationOccurred(.success)
        } else {
            streak = 0
            feedback = "Try the next one. \(puzzle.left) \(puzzle.answer) \(puzzle.right) = \(puzzle.target)"
            UINotificationFeedbackGenerator().notificationOccurred(.warning)
        }
    }
}
