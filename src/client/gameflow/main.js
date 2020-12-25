// Functions relating to the flow of the game (game start, shake start,
// shake end, next turn, etc)

import { updateBonusButton } from "../board";
import { hideNewShakeButton, hideStartAndLeaveButtons } from "../buttons";
import { deregisterBoardCallbacks } from "../callbacks/main";
import { appendServerMessage } from "../message_utils";
import { updateTurnText } from "../turntext";

import { handleGameBeginEquations, handleShakeBeginEquations } from "./equations";
import { handleGameBeginOnsets, handleShakeBeginOnsets } from "./onsets";

export function handleGameBegin(data, name) {
    hideStartAndLeaveButtons();

    if (data['gametype'] == 'eq') {
        handleGameBeginEquations(data, name);
    }
    else if (data['gametype'] == 'os') {
        handleGameBeginOnsets(data, name);
    }
    else {
        console.log(`Error: Can't begin game, unrecognized game type ${data['gametype']}`);
    }
}

export function handleShakeBegin(data, name) {
    hideNewShakeButton();

    if (data['gametype'] == 'eq') {
        handleShakeBeginEquations(data, name);
    }
    else if (data['gametype'] == 'os') {
        handleShakeBeginOnsets(data, name);
    }
    else {
        console.log(`Error: Can't begin shake, unrecognized game type ${data['gametype']}`);
    }
}

export function handleNextTurn(command, name) {
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

