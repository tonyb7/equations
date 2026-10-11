import Foundation

@main
struct CoreCheck {
    static func main() {
        precondition(PracticePuzzle(left: 3, right: 7, answer: "−").target == -4)
        precondition(PracticePuzzle(left: 3, right: 7, answer: "×").accepts("×"))
        precondition(!PracticePuzzle(left: 3, right: 7, answer: "+").accepts("×"))
        precondition(PracticePuzzle(left: 2, right: 2, answer: "+").accepts("×"))
        precondition(!PracticePuzzle(left: 2, right: 2, answer: "+").accepts("/"))
        precondition(RoomCode.normalize(" ab12 \n") == "AB12")
        for code in ["", "ABC", "ABCDE", "../x", "é123", "Ａ123"] { precondition(RoomCode.normalize(code) == nil) }
        for _ in 0..<1000 { let puzzle = PracticePuzzle.random(); precondition(puzzle.accepts(puzzle.answer)) }
        print("PASS: arithmetic, equivalent answers, room validation, 1,000 generated puzzles")
    }
}
