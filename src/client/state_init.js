// Render client initial state

import { hideGoalSettingButtons, num_resources_cubes, renderGameVisuals } from "./board";
import { initializeBoardCallbacks, registerGoalSetting, registerLeaveButton, registerStartButton } from "./callbacks";
import { updateClientOnEndgame } from "./endgame";
import { renderVariations } from "./variations";
import { socket } from "./networking";

// Render every visual aspect of the board correctly for a spectator.
// Required only if game has started
export function renderSpectatorState(game, name) {

    if (game['gametype'] == 'eq') {
        renderGameVisuals(game);
        renderVariations(socket, game['variations_state'], game['players'], name);
        updateClientOnEndgame(socket, name, game['endgame'], game['players']);    
    }
    else if (game['gametype'] == 'os') {
        
        // TODO ONSETS


    }
    else {
        console.log("Error: Can't render spectator state, unrecognized game type ", game['gametype']);
    }

}

// Joined as player. Render visuals as well as register callbacks as
// appropriate (according to whether game has started)
export function renderPlayerState(game, name) {

    if (game['gametype'] == 'eq') {
        renderGameVisuals(game);
        if (game['game_finished']) {
            return;
        }

        if (game['game_started']) {
            initializeBoardCallbacks(socket, show_bonus_for(game, name));
            registerGoalSetting(socket, name, game['players'][game['turn']], !game["goalset"]);

            renderVariations(socket, game['variations_state'], game['players'], name);
            updateClientOnEndgame(socket, name, game['endgame'], game['players']);

            console.log("challenge recorded: ", game['challenge']);
            if (game['challenge'] === "no_goal") {
                hideGoalSettingButtons();
            }
        }
        else {
            registerStartButton(socket);
            registerLeaveButton(socket, game, name);
        }
    }
    else if (game['gametype'] == 'os') {
        // TODO ONSETS


    }
    else {
        console.log("Error: Can't render player state, unrecognized game type ", game['gametype']);
    }

}

// Determine whether bonus button should be rendered for player in game
function show_bonus_for(game, player) {
    if (game['players'][game['turn']] != player) {
        return false;
    }

    if (game['challenge']) {
        return false;
    }
    
    if (num_resources_cubes() < 2) {
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
