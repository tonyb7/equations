import Foundation

public struct PracticePuzzle: Equatable {
    public let left: Int
    public let right: Int
    public let target: Int
    public let answer: String
    public static let operations = ["+", "−", "×"]

    public init(left: Int, right: Int, answer: String) {
        precondition(Self.operations.contains(answer))
        self.left = left
        self.right = right
        self.answer = answer
        self.target = Self.evaluate(left, right, operation: answer)!
    }

    public func accepts(_ operation: String) -> Bool {
        Self.evaluate(left, right, operation: operation) == target
    }

    public static func random() -> PracticePuzzle {
        PracticePuzzle(left: Int.random(in: 2...12), right: Int.random(in: 2...12), answer: operations.randomElement()!)
    }

    private static func evaluate(_ left: Int, _ right: Int, operation: String) -> Int? {
        switch operation {
        case "+": return left + right
        case "−": return left - right
        case "×": return left * right
        default: return nil
        }
    }
}

public enum RoomCode {
    public static func normalize(_ input: String) -> String? {
        let value = input.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        guard value.count == 4, value.unicodeScalars.allSatisfy({ (48...57).contains($0.value) || (65...90).contains($0.value) }) else { return nil }
        return value
    }
}
