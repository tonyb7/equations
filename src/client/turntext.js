
export function updateTurnText(name) {
    let turn_elt = document.getElementById("actual-turn-text");
    turn_elt.innerHTML = `${name}`;
}

export function displayTurnText(game) {
    if (game["game_finished"]) {
        updateTurnText("Game Ended");
    }
    else if (!game["game_started"]) {
        updateTurnText("Not Started");
    }
    else {
        // TODO finish variations logic too, so updateTurnText can hopefully be a "private" function...?

        updateTurnText(game['players'][game['turn']]);
    }
}
