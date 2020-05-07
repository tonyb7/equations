// Handle client networking.

import io from 'socket.io-client';
import { cleanInput, appendMessage } from './message_utils';
import { renderResources, initializeScoreboard, addScoreboardScore,
    highlightResourcesCube, updateTurnText, moveCube, renderGameVisuals,
    updateBonusButton } from './board';
import { initializeBoardCallbacks, registerGoalSetButton, registerStartButton } from './callbacks';

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
            initializeBoardCallbacks(socket, game['players'][game['turn']], name);
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
        initializeBoardCallbacks(socket, firstmover, name);
        updateTurnText(firstmover);
        registerGoalSetButton(socket, name, firstmover, true);
    });

    socket.on("highlight_cube", (pos) => highlightResourcesCube(pos));

    socket.on("move_cube", (directions) => moveCube(directions));

    socket.on("next_turn", (player) => {
        updateTurnText(player);
        updateBonusButton(player, name);
        
        // TODO timer stuff potentially
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
