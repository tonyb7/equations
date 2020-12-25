
// Given state object, derive which buttons should be *displayed*.
export function displayButtons(game) {
    if (game['game_started']) {
        hideStartAndLeaveButtons();
    }
}

// Hide the Start Game and Leave Game buttons once a game has started
export function hideStartAndLeaveButtons() {
    document.getElementById("start_game").remove();
    let leave_game_anchor = document.getElementById("leave_game_anchor");
    if (leave_game_anchor) {
        leave_game_anchor.remove();
    }
}

export function hideNewShakeButton() {
    let new_shake_button = document.getElementById("new_shake_button");
    if (new_shake_button) {
        new_shake_button.remove();
    }
}

