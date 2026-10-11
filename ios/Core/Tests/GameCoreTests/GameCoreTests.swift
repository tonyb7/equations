import XCTest
@testable import GameCore

final class GameCoreTests: XCTestCase {
    func testOperationsAndNegativeTargets() {
        XCTAssertTrue(PracticePuzzle(left: 3, right: 7, answer: "−").accepts("−"))
        XCTAssertEqual(PracticePuzzle(left: 3, right: 7, answer: "−").target, -4)
        XCTAssertTrue(PracticePuzzle(left: 3, right: 7, answer: "×").accepts("×"))
        XCTAssertFalse(PracticePuzzle(left: 3, right: 7, answer: "+").accepts("×"))
    }
    func testEquivalentAnswersAreAccepted() {
        XCTAssertTrue(PracticePuzzle(left: 2, right: 2, answer: "+").accepts("×"))
        XCTAssertFalse(PracticePuzzle(left: 2, right: 2, answer: "+").accepts("/"))
    }
    func testRoomValidation() {
        XCTAssertEqual(RoomCode.normalize(" ab12 \n"), "AB12")
        for code in ["", "ABC", "ABCDE", "../x", "é123", "Ａ123"] { XCTAssertNil(RoomCode.normalize(code)) }
    }
    func testGeneratedPuzzlesHaveValidAnswers() {
        for _ in 0..<1000 { let puzzle = PracticePuzzle.random(); XCTAssertTrue(puzzle.accepts(puzzle.answer)) }
    }
}
