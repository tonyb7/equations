// Handle client networking.

import io from 'socket.io-client';
import { cleanInput, appendMessage, appendServerMessage, appendSidingOptions, 
         appendSolutionPrompt, appendAcceptPrompt, appendAssentToRejectPrompt, 
         appendStartNewShakeButton } from './message_utils';
import { renderResources, initializeScoreboard, addScoreboardScore,
    highlightResourcesCube, unhighlightResourcesCube, updateTurnText, moveCube, 
    renderGameVisuals, updateBonusButton, hideGoalSettingButtons, clearBoard,
    num_resources_cubes } from './board';
import { initializeBoardCallbacks, registerGoalSetButton, 
         registerStartButton, deregisterBoardCallbacks } from './callbacks';

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(`${socketProtocol}://${window.location.host}`, {reconnection: false});
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
        socket.emit("register_player", player_info);
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
    socket.on("render_spectator_state", (game) => renderGameVisuals(game));

    // Joined as player. Render visuals as well as register callbacks as
    // appropriate (according to whether game has started)
    socket.on("render_player_state", (game) => {
        renderGameVisuals(game);
        if (game['game_finished']) {
            return;
        }

        if (game['game_started']) {
            initializeBoardCallbacks(socket, show_bonus_for(game, name));
            registerGoalSetButton(socket, name, game['players'][game['turn']], !game["goalset"]);
        }
        else {
            registerStartButton(socket);
        }
    });

    socket.on("new_player", (players) => {
        initializeScoreboard(players);
    });
    
    socket.on("begin_game", (data) => {
        let cubes = data['cubes']
        document.getElementById("start_game").remove();
        
        appendServerMessage(`${data['starter']} started the game! The cubes have been rolled!`);
        appendServerMessage(`${data['goalsetter']} is chosen to be the goalsetter.`);
        appendServerMessage("Move cubes by clicking a cube in resources, then clicking the " +
                    "area on the mat you want to move it to. Press \"Goal Set!\" when you're done!");

        renderResources(cubes);
        addScoreboardScore(initializeScoreboard(data['players']), 0, 0, 0);

        let firstmover = data['goalsetter'];
        initializeBoardCallbacks(socket, firstmover === name);
        updateTurnText(firstmover);
        registerGoalSetButton(socket, name, firstmover, true);
    });

    socket.on("begin_shake", (data) => {
        document.getElementById("new_shake_button").remove();

        appendServerMessage(`A new shake has started! ${data['goalsetter']} is chosen to be the goalsetter.`);
        clearBoard();
        renderResources(data['cubes']);

        let firstmover = data['goalsetter'];
        initializeBoardCallbacks(socket, firstmover === name);
        updateTurnText(firstmover);
        registerGoalSetButton(socket, name, firstmover, true);
    });

    socket.on("hide_goal_setting_buttons", () => hideGoalSettingButtons());

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

    // TODO move
    const challengeTextMap = new Map([
        ["a_flub", "Challenge Now"],
        ["p_flub", "Challenge Never"],
        ["no_goal", "Challenge No Goal"],
    ]);

    socket.on("handle_challenge", (info) => {
        let challenge = info["challenge"];
        let defender = info["defender"];
        let caller = info["caller"];
        let sider = info["sider"];

        console.log("handle_challenge", challenge, defender, caller, sider);
        console.log(challengeTextMap);
        console.log(challengeTextMap.get(challenge));

        deregisterBoardCallbacks();
        updateTurnText(challengeTextMap.get(challenge));

        if (challenge === "no_goal") {
            // TODO
            return;
        }

        if (sider != null) {
            if (sider === name) {
                appendSidingOptions(socket);
            }
            else {
                appendServerMessage(`Waiting for ${sider} to side...`);
            }
        }

        if ((defender === name && challenge === "p_flub") || (caller === name && challenge === "a_flub")) {
            appendSolutionPrompt(socket);
        }
        else {
            appendServerMessage("Waiting for solutions to be submitted....");
        }
    });

    socket.on("force_out", () => {
        deregisterBoardCallbacks();
        updateTurnText("Force Out");

        appendServerMessage("It is now Force Out.");
        appendSolutionPrompt(socket);
    });
    
    socket.on("review_solutions", (solutions) => {
        appendServerMessage("Time to review solutions!");
        
        let reviewing_one = false;
        for (let writer in solutions) {
            if (writer === name) {
                continue;
            }

            reviewing_one = true;
            appendAcceptPrompt(socket, writer, solutions[writer], false);
        }

        if (!reviewing_one) {
            appendServerMessage("Waiting for others to finish reviewing solutions...");
        }
    });

    socket.on("rejection_assent", (info) => {
        let rejecter = info['rejecter'];
        let writer = info['writer'];

        if (writer !== name) {
            appendServerMessage(`Waiting for ${writer} to accept the rejection...`);
            return;
        }

        appendAssentToRejectPrompt(socket, rejecter);
    });

    socket.on("reevaluate_solution", (info) => {
        let rejecter = info['rejecter'];
        let writer = info['writer'];
        let solution = info['solution'];

        if (rejecter !== name) {
            let msg_pt1 = `${writer} does not agree that his/her solution `;
            let msg_pt2 = `is incorrect. Waiting for ${rejecter} to re-evaluate `;
            let msg_pt3 = "whether the solution is correct...";

            appendServerMessage(`${msg_pt1}${msg_pt2}${msg_pt3}`);
            return;
        }

        appendAcceptPrompt(socket, writer, solution, true);
    });

    socket.on("finish_shake", (scores) => {
        let p1score = scores['p1score'];
        let p2score = scores['p2score'];
        let p3score = scores['p3score'];

        appendServerMessage("This shake has finished! The scoreboard has been updated.");
        addScoreboardScore(document.getElementById("scoreboard"), p1score, p2score, p3score);
        appendStartNewShakeButton(socket);
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
        console.log("Can't bonus with less than 2 cubes in resources");
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

    let max_score = Math.max(p1score, p2score, p3score);
    let min_score = 0;
    if (p3score === 0) {
        min_score = Math.min(p1score, p2score);
    }
    else {
        min_score = Math.min(p1score, p2score, p3score);
    }

    if (player_score !== 0 && max_score !== min_score && max_score === player_score) {
        return false;
    }

    return true;
}

export function bonusButtonCallback() {
    this.classList.toggle("button-clicked");
    socket.emit("bonus_clicked");
}
