// Handle client networking.

import io from 'socket.io-client';
import { cleanInput, appendMessage } from './message_utils';
import { renderResources, initializeScoreboard, 
    updateTurn, moveCube, renderGoal, renderSector } from './board';

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
            'name': name
        };

        // Register callbacks
        registerSocketCallbacks(name);
        registerButtonCallbacks(["start_game"]);

        // Tell server wanna join
        console.log(`Connecting as ${name} in room ${room_nonce}`);
        socket.emit("register_player", player_info);
    })
    .catch((error) => console.log("Error: ", error));
}

function registerSocketCallbacks(name) {
    socket.on('disconnect', () => {
        console.log(`disconnected from room`);
        // socket.emit("deregister_player", player_info);
    });

    socket.on('message', (message_info) => {
        let name = message_info['name']
        let message = message_info['message']
        // console.log(`Received message ${message} from ${name}`);
        appendMessage(name, message);
    });

    socket.on("server_message", (message) => {
        let name = "Server";
        // console.log(`Server sending message ${message}`);
        appendMessage(name, message);
    });

    const checkIfGoalSetter = (firstmover, firstmove) => {
        if (!firstmove)
            return;

        if (firstmover === name) {
            let set_goal_button = document.getElementById("set-goal-button");
            set_goal_button.classList.remove("hidden");
            set_goal_button.onclick = () => {
                socket.emit("set_goal");
                set_goal_button.classList.add("hidden");
                set_goal_button.onclick = () => 
                    console.log("Set goal button somehow clicked...");
            };
        }
    };

    socket.on("render_game_state", (game) => {
        initializeBoardCallbacks();
        initializeScoreboard(game['players']);
        updateTurn(game['players'][game['turn']]);
        checkIfGoalSetter(game['players'][game['turn']], !game["goalset"]);

        renderResources(game['resources']);
        renderGoal(game['goal'], game['cube_index']);
        renderSector(game['forbidden'], "forbidden-sector", game['cube_index']); // magic constant bad
        renderSector(game['permitted'], "permitted-sector", game['cube_index']);
        renderSector(game['required'], "required-sector", game['cube_index']); 

        // TODO Remember to expand upon once more game features are added
        // TODO time, scores

    });
    
    socket.on("begin_game", (data) => {
        let cubes = data['cubes']
        console.log("Rolled cubes: ", cubes);
        document.getElementById("start_game").onclick = () => {
            console.log("Game has already started!")
        };

        renderResources(cubes);
        initializeScoreboard(data['players']);
        initializeBoardCallbacks();

        let firstmover = data['players'][data['firstmove']];
        updateTurn(firstmover);
        checkIfGoalSetter(firstmover, true);
    });

    socket.on("highlight_cube", (pos) => {
        // Should never receive highlight_cube on an invalid pos 
        // Server checks that pos in resources is valid
        let surrounding_th = document.getElementById(`r${pos}`);
        let image = surrounding_th.querySelector("img");
        image.classList.add("highlight-img");
    });

    socket.on("move_cube", (directions) => moveCube(directions));

    socket.on("next_turn", (player) => {
        updateTurn(player);

        // TODO timer stuff potentially

    });
}

function registerButtonCallbacks(button_ids) {
    let buttons = document.getElementById("buttons-div");
    if (buttons.length === 0) {
        throw Error("Error finding buttons on page!?");
    }

    for (const button_id of button_ids) {
        registerButton(buttons.querySelector(`#${button_id}`), button_id);
    }
}

function registerButton(button, socket_label) {
    button.onclick = () => {
        console.log(`Button for ${socket_label} clicked!`);
        socket.emit(socket_label);
    };
}

function initializeBoardCallbacks() {
    let board_sectors = ["forbidden-sector", "permitted-sector", "required-sector", "goal-sector"];
    for (const id of board_sectors) {
        document.getElementById(id).onclick = () => {
            console.log(`${id} clicked`);
            socket.emit("sector_clicked", id);
        };
    }

    let buttons = document.getElementById("buttons-div");
    if (buttons.length === 0) {
        throw Error("Error finding buttons on page!?");
    }

    let button_ids = ["flip_timer", "claim_warning", "claim_minus_one",
                      "a_flub", "p_flub", "force_out"];
    registerButtonCallbacks(button_ids);
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
            // console.log(`Sent message ${message} from user ${name}`);
        }
    });
}

export const emitCubeClicked = (pos) => socket.emit("cube_clicked", pos);
