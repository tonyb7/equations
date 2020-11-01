// Functions relating to the flow of the game (game start, shake start,
// shake end, next turn, etc)

import { addScoreboardScore, clearBoard, initializeScoreboard, renderResources, updateBonusButton, updateTurnText } from "./board";
import { deregisterBoardCallbacks, initializeBoardCallbacks, registerGoalSetting } from "./callbacks";
import { appendServerMessage } from "./message_utils";
import { initializeElapsedTimer } from "./timing";
import { renderVariations } from "./variations";

export function handleGameBegin(data) {
    let cubes = data['cubes']
    document.getElementById("start_game").remove();
    let leave_game_anchor = document.getElementById("leave_game_anchor");
    if (leave_game_anchor) {
        leave_game_anchor.remove();
    }
    
    appendServerMessage(`${data['starter']} started the game! The cubes have been rolled!`);
    appendServerMessage(`${data['goalsetter']} is chosen to be the goalsetter.`);
    
    renderVariations(socket, data['variations_state'], data['players'], name);
    
    initializeElapsedTimer(data['starttime']);
    renderResources(cubes);
    addScoreboardScore(initializeScoreboard(data['players']), 0, 0, 0);

    let firstmover = data['goalsetter'];
    initializeBoardCallbacks(socket, firstmover === name);
    registerGoalSetting(socket, name, firstmover, true);

}

export function handleShakeBegin(data) {
    let new_shake_button = document.getElementById("new_shake_button");
    if (new_shake_button) {
        new_shake_button.remove();
    }
    
    appendServerMessage(`A new shake has started! ${data['goalsetter']} is chosen to be the goalsetter.`);
    clearBoard();
    renderResources(data['cubes']);

    renderVariations(socket, data['variations_state'], data['players'], name);

    let firstmover = data['goalsetter'];
    initializeBoardCallbacks(socket, firstmover === name && data['show_bonus']);
    registerGoalSetting(socket, name, firstmover, true);

}

export function handleNextTurn(command) {
    let player = command["player"];
    let show_bonus = command["show_bonus"];
    
    updateTurnText(player);
    updateBonusButton((player === name) && show_bonus);
    
    // TODO timer stuff potentially
}

export function handleGameOver() {
    appendServerMessage("The game has finished!");
    updateTurnText("Game Ended");
    deregisterBoardCallbacks();
}

