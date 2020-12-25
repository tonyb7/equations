// Contains callback functions that act on the whole board
// (including buttons & goalline)

import { registerButtonCallbacks, deregisterButtonCallbacks } from './buttons';
import { deregisterGoalSetCallback } from './goal';
import { num_resources_cubes, updateBonusButton } from '../board/board';
import { socket } from '../networking';

const board_sectors = [
    "forbidden-sector", "permitted-sector", 
    "required-sector", "goal-sector",
];

// Make board sectors clickable
// Make buttons clickable
// Show or hide bonus button based on show_bonus
export function registerBoardCallbacks(game, name) {
    if (!game['game_started']) {
        return;
    }

    initializeBoardCallbacks(show_bonus_for(game, name));
}

export function initializeBoardCallbacks(show_bonus) {
    for (const id of board_sectors) {
        document.getElementById(id).onclick = () => {
            console.log(`${id} clicked`);
            socket.emit("sector_clicked", id);
        };
    }

    registerButtonCallbacks(socket);
    updateBonusButton(show_bonus);
}

// Make board sectors not clickable
// Make buttons not clickable
// Hide the bonus button
export function deregisterBoardCallbacks() {
    for (const id of board_sectors) {
        document.getElementById(id).onclick = () => {};
    }

    deregisterButtonCallbacks();
    deregisterGoalSetCallback();
    updateBonusButton(false);
}

// Determine whether bonus button should be rendered for player in game
function show_bonus_for(game, player) {
    if (game['players'][game['turn']] != player) {
        return false;
    }

    if (game['challenge']) {
        return false;
    }
    
    if (num_resources_cubes(game['gametype']) < 2) {
        // console.log("Can't bonus with less than 2 cubes in resources");
        return false;
    }

    if (game['started_move']) {
        // started_move indicates that a cube has been moved
        return false;
    }

    const idx = game['players'].findIndex((name) => name === player);
    if (idx === -1) {
        console.log("Error! Player not in game in render_player_state");
        return false;
    }
    
    const adder = (acc, curr) => acc + curr;
    const player_score = game[`p${idx+1}scores`].reduce(adder);

    let p1score = game['p1scores'].reduce(adder);
    let p2score = game['p2scores'].reduce(adder);
    let p3score = game['p3scores'].reduce(adder);
    let scores = [p1score, p2score, p3score];

    let num_greater = 0;
    for (let score of scores) {
        if (player_score > score) {
            ++num_greater;
        }
    }

    if (num_greater === 2) {
        return false;
    }

    return true;
}
