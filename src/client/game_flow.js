// Functions relating to the flow of the game (game start, shake start,
// shake end, next turn, etc)

import { addScoreboardScore, clearBoard, initializeScoreboard, renderResources, updateBonusButton, updateTurnText } from "./board";
import { deregisterBoardCallbacks, initializeBoardCallbacks, registerGoalSetting } from "./callbacks";
import { appendServerMessage } from "./message_utils";
import { initializeElapsedTimer } from "./timing";
import { renderVariations } from "./variations";
import { socket } from "./networking";

export function handleGameBegin(data, name) {
    let cubes = data['cubes'];
    document.getElementById("start_game").remove();
    let leave_game_anchor = document.getElementById("leave_game_anchor");
    if (leave_game_anchor) {
        leave_game_anchor.remove();
    }
    
    let gametype = data['game'];
    if (gametype == 'eq') {

        appendServerMessage(`${data['starter']} started the game! The cubes have been rolled!`);
        appendServerMessage(`${data['goalsetter']} is chosen to be the goal-setter.`);
        
        renderVariations(socket, data['variations_state'], data['players'], name);
        
        initializeElapsedTimer(data['starttime']);
        renderResources(cubes);
        addScoreboardScore(initializeScoreboard(data['players']), 0, 0, 0);
    
        let firstmover = data['goalsetter'];
        initializeBoardCallbacks(socket, firstmover === name);
        registerGoalSetting(socket, name, firstmover, true);  

    }
    else if (gametype == 'os') {

        /* ON-SETS SPECIFIC */

        let cardsetter = data['cardsetter'];

        // TODO: Should cubes be rolled first, or universe set first? Rulebook seems to say they happen simulatneously...
        appendServerMessage(`${data['starter']} started the game! The cubes have been rolled!`);
        appendServerMessage(`${data['goalsetter']} is chosen to be the goal-setter.`);
        appendServerMessage(`${cardsetter} must choose how many cards to deal in the universe.`)

        if (name != cardsetter) {
            appendServerMessage(`Waiting for ${cardsetter} to set the universe...`);
        }
        else {
            appendUniverseSizePrompt(socket);
        }

        initializeElapsedTimer(data['starttime']);
        // renderOnsetsResources(cubes);
        addScoreboardScore(initializeScoreboard(data['players']), 0, 0, 0);

        // let firstmover = data['goalsetter'];
        // initializeBoardCallbacks(socket, firstmover === name);
        // registerGoalSetting(socket, name, firstmover, true);   
        

        // TODO ONSETS
    }
    else {
        console.log("Error: Can't begin game, unrecognized game type ", gametype);
    }
}

export function handleShakeBegin(data, name) {
    let new_shake_button = document.getElementById("new_shake_button");
    if (new_shake_button) {
        new_shake_button.remove();
    }
    
    let gametype = data['game'];
    if (gametype == 'eq') {
        appendServerMessage(`A new shake has started! ${data['goalsetter']} is chosen to be the goalsetter.`);
        clearBoard();
        renderResources(data['cubes']);

        renderVariations(socket, data['variations_state'], data['players'], name);

        let firstmover = data['goalsetter'];
        initializeBoardCallbacks(socket, firstmover === name && data['show_bonus']);
        registerGoalSetting(socket, name, firstmover, true);
    }
    else if (gametype == 'os') {
       
        /* ON-SETS SPECIFIC */
        // TODO ONSETS



    }
    else {
        console.log("Error: Can't begin shake, unrecognized game type ", gametype);
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

