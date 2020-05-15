// Handle client networking.

import io from 'socket.io-client';
import { cleanInput, appendMessage, appendSidingOptions, 
         appendSolutionPrompt, appendAcceptPrompt, appendAssentToRejectPrompt } from './message_utils';
import { renderResources, initializeScoreboard, addScoreboardScore,
    highlightResourcesCube, updateTurnText, moveCube, renderGameVisuals,
    updateBonusButton } from './board';
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
    socket.on("server_message", (message) => appendMessage("Server", message));

    // Render every visual aspect of the board correctly for a spectator.
    // Required only if game has started
    socket.on("render_spectator_state", (game) => renderGameVisuals(game));

    // Joined as player. Render visuals as well as register callbacks as
    // appropriate (according to whether game has started)
    socket.on("render_player_state", (game) => {
        renderGameVisuals(game);
        if (game['game_started']) {
            initializeBoardCallbacks(socket, show_bonus_for(game, name));
            registerGoalSetButton(socket, name, game['players'][game['turn']], !game["goalset"]);
        }
        else {
            registerStartButton(socket);
        }
    });
    
    socket.on("begin_game", (data) => {
        let cubes = data['cubes']
        console.log("Rolled cubes: ", cubes);
        document.getElementById("start_game").onclick = () => {
            console.log("Game has already started!")
        };

        renderResources(cubes);
        addScoreboardScore(initializeScoreboard(data['players']), 0, 0, 0);

        let firstmover = data['players'][data['firstmove']];
        initializeBoardCallbacks(socket, firstmover === name);
        updateTurnText(firstmover);
        registerGoalSetButton(socket, name, firstmover, true);
    });

    socket.on("hide_no_goal", () => {
        let no_goal_button = document.getElementById("no_goal");
        no_goal_button.classList.add("hidden");
        no_goal_button.onclick = () => 
            console.log("No goal challenge somehow clicked...");
    });

    socket.on("highlight_cube", (pos) => highlightResourcesCube(pos));

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
                appendMessage("Server", `Waiting for ${sider} to side...`);
            }
        }

        if ((defender === name && challenge === "p_flub") || (caller === name && challenge === "a_flub")) {
            appendSolutionPrompt(socket);
        }
        else {
            appendMessage("Server", "Waiting for solutions to be submitted....");
        }
    });
    
    socket.on("review_solutions", (solutions) => {
        appendMessage("Server", "Time to review solutions!");
        
        let reviewing_one = false;
        for (let writer in solutions) {
            if (writer === name) {
                continue;
            }

            reviewing_one = true;
            appendAcceptPrompt(socket, writer, solutions[writer], false);
        }

        if (!reviewing_one) {
            appendMessage("Server", "Waiting for others to finish reviewing solutions...");
        }
    });

    socket.on("rejection_assent", (info) => {
        let rejecter = info['rejecter'];
        let writer = info['writer'];

        if (writer !== name) {
            appendMessage("Server", `Waiting for ${writer} to accept the rejection...`);
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

            appendMessage("Server", `${msg_pt1}${msg_pt2}${msg_pt3}`);
            return;
        }

        appendAcceptPrompt(socket, writer, solution, true);
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
