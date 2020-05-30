// Handle client networking.

import io from 'socket.io-client';
import { cleanInput, appendMessage, appendServerMessage, appendInstructions, 
         printFiveMinWarningMsg } from './message_utils';
import { renderResources, initializeScoreboard, addScoreboardScore,
    highlightResourcesCube, unhighlightResourcesCube, updateTurnText, moveCube, 
    renderGameVisuals, updateBonusButton, hideGoalSettingButtons, clearBoard,
    num_resources_cubes } from './board';
import { initializeBoardCallbacks, registerGoalSetting, 
         registerStartButton, 
         deregisterBoardCallbacks} from './callbacks';
import { updateGoalline } from './goal';
import { updateClientOnEndgame, handleChallenge,
         handleForceOut, reviewSolutions, handleRejectionAssent,
         handleReevaluateSolution, handleShakeFinish } from './endgame';
import { initializeElapsedTimer } from './timing';

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
export const socket = io(`${socketProtocol}://${window.location.host}`, {reconnection: false});
const connectedPromise = new Promise(resolve => {
    socket.on('connect', () => {
        console.log('Connected to server!');
        resolve();
    });
});

export const connect = () => {
    connectedPromise.then(() => {
        // Retrieve room and player info
        let room_nonce = document.getElementById("room-nonce").innerHTML;
        let name = document.getElementById("name").innerHTML;

        let player_info = {
            'room': room_nonce, 
            'name': name,
        };

        // Register callbacks
        registerSocketCallbacks(name);

        // Tell server wanna join
        console.log(`Connecting as ${name} in room ${room_nonce}`);
        socket.emit("register_client", player_info);
    })
    .catch((error) => console.log("Error: ", error));
}

function registerSocketCallbacks(name) {
    socket.on('disconnect', () => console.log(`disconnected from room`));

    socket.on('message', (message_info) => appendMessage(message_info['name'], 
                                                         message_info['message']));
    socket.on("server_message", (message) => appendServerMessage(message));

    // Render every visual aspect of the board correctly for a spectator.
    // Required only if game has started
    socket.on("render_spectator_state", (game) => {
        renderGameVisuals(game);
        updateClientOnEndgame(socket, name, game['endgame'], game['players']);
    });

    // Joined as player. Render visuals as well as register callbacks as
    // appropriate (according to whether game has started)
    socket.on("render_player_state", (game) => {
        renderGameVisuals(game);
        if (game['game_finished']) {
            return;
        }

        if (game['game_started']) {
            initializeBoardCallbacks(socket, show_bonus_for(game, name));
            registerGoalSetting(socket, name, game['players'][game['turn']], !game["goalset"]);
            updateClientOnEndgame(socket, name, game['endgame'], game['players']);
        }
        else {
            registerStartButton(socket);
        }
    });

    socket.on("new_player", initializeScoreboard);
    socket.on("player_left", initializeScoreboard);
    
    socket.on("begin_game", (data) => {
        let cubes = data['cubes']
        document.getElementById("start_game").remove();
        
        appendServerMessage(`${data['starter']} started the game! The cubes have been rolled!`);
        appendServerMessage(`${data['goalsetter']} is chosen to be the goalsetter.`);
        appendInstructions();

        if (data['starter'] === name) {
            appendServerMessage("Press \"Goal Set!\" when you're done!");
        }
        else {
            appendServerMessage(`Waiting for ${data['goalsetter']} to finish setting the goal...`);
        }
        
        initializeElapsedTimer(data['starttime']);
        renderResources(cubes);
        addScoreboardScore(initializeScoreboard(data['players']), 0, 0, 0);

        let firstmover = data['goalsetter'];
        initializeBoardCallbacks(socket, firstmover === name);
        updateTurnText(firstmover);
        registerGoalSetting(socket, name, firstmover, true);
    });

    socket.on("begin_shake", (data) => {
        let new_shake_button = document.getElementById("new_shake_button");
        if (new_shake_button) {
            new_shake_button.remove();
        }

        appendServerMessage(`A new shake has started! ${data['goalsetter']} is chosen to be the goalsetter.`);
        clearBoard();
        renderResources(data['cubes']);

        let firstmover = data['goalsetter'];
        initializeBoardCallbacks(socket, firstmover === name && data['show_bonus']);
        updateTurnText(firstmover);
        registerGoalSetting(socket, name, firstmover, true);
    });

    socket.on("hide_goal_setting_buttons", () => hideGoalSettingButtons());
    socket.on("update_goalline", (data) => {
        updateGoalline(data['type'], data['order'], data['new_val']);
    });

    socket.on("highlight_cube", (pos) => highlightResourcesCube(pos));
    socket.on("unhighlight_cube", (pos) => unhighlightResourcesCube(pos));

    socket.on("move_cube", (directions) => moveCube(directions));

    socket.on("next_turn", (command) => {
        let player = command["player"];
        let show_bonus = command["show_bonus"];

        updateTurnText(player);
        updateBonusButton((player === name) && show_bonus);
        
        // TODO timer stuff potentially
    });

    socket.on("handle_challenge", (info) => handleChallenge(socket, name, info));
    socket.on("force_out", (players) => handleForceOut(socket, name, players));
    socket.on("review_solutions", (review_soln_msg) => reviewSolutions(socket, name, review_soln_msg));
    socket.on("rejection_assent", (info) => handleRejectionAssent(socket, name, info));
    socket.on("reevaluate_solution", (info) => handleReevaluateSolution(socket, name, info));
    socket.on("finish_shake", (shake_finish_msg) => 
        handleShakeFinish(socket, name, shake_finish_msg["scores"], shake_finish_msg["game_finished"]));

    socket.on("five_minute_warning_message", () => printFiveMinWarningMsg());
    socket.on("game_over_clientside", () => {
        appendServerMessage("The game has finished!");
        updateTurnText("Game Ended");
        deregisterBoardCallbacks();
    });
}

export function handleChatEnter() {
    let $window = $(window);
    let $inputMessage = $('.inputMessage');
    $window.keydown(event => {
        // enter key was pressed
        if ($inputMessage.is(":focus") && event.which === 13 && $inputMessage.val().length > 0) {
            let message = $inputMessage.val();
            let name = document.getElementById("name").innerHTML;
            message = cleanInput(message);

            $inputMessage.val('');
            socket.emit('new_message', {'name': name, 'message': message});
        }
    });
}

export const emitCubeClicked = (pos) => socket.emit("cube_clicked", pos);

// Determine whether bonus button should be rendered for player in game
function show_bonus_for(game, player) {
    if (game['players'][game['turn']] != player) {
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

export function bonusButtonCallback() {
    this.classList.toggle("button-clicked");
    socket.emit("bonus_clicked");
}
