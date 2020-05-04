// Handle client networking.

import io from 'socket.io-client';
import { cleanInput, appendMessage } from './message_utils';
import { rollCubes } from './board';

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
        registerSocketCallbacks(player_info);
        registerButtonCallbacks(player_info);

        // Tell server wanna join
        console.log(`Connecting as ${name} in room ${room_nonce}`);
        socket.emit("register_player", player_info);
    })
    .catch((error) => console.log("Error: ", error));
}

function registerSocketCallbacks(player_info) {
    socket.on('disconnect', () => {
        console.log(`${name} disconnected from room ${player_info['room']}`);
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
    
    socket.on("begin_game", (data) => {
        let cubes = data['cubes']
        console.log("Rolled cubes: ", cubes);
        document.getElementById("start-game").onclick = () => {
            console.log("Game has already started!")
        };
        rollCubes(cubes);

        let players = data['players'];
        let scoreboard = document.getElementById("scoreboard");
        for (let i = 0; i < players.length; ++i) {
            scoreboard.rows[0].cells.item(i).innerHTML = players[i];
        }

        console.log(data['firstmove']);
        console.log(players[data['firstmove']]);

        let firstmover = players[data['firstmove']];
        let turn_elt = document.getElementById("turn");
        console.log("turn_elt: ", turn_elt);
        turn_elt.innerHTML = `Turn: ${firstmover}`;
    });

    socket.on("highlight_cube", (pos) => {
        // TODO dehighlight once moved
        let surrounding_th = document.getElementById(`r${pos}`);
        let image = surrounding_th.querySelector("img");
        image.classList.add("highlight-img");
    });
}

function registerButtonCallbacks(player_info) {
    var buttons = document.getElementById("buttons-div");
    if (buttons.length === 0) {
        throw Error("Error finding buttons on page!?");
    }

    registerButton(buttons.querySelector("#start-game"), 'start_game', player_info);
    registerButton(buttons.querySelector('#flip-timer'), 'flip_timer', player_info);
    registerButton(buttons.querySelector('#claim-warning'), 'claim_warning', player_info);
    registerButton(buttons.querySelector('#claim-minus-one'), 'claim_minus_one', player_info);
    registerButton(buttons.querySelector('#a-flub'), 'a_flub', player_info);
    registerButton(buttons.querySelector('#p-flub'), 'p_flub', player_info);
    registerButton(buttons.querySelector('#force-out'), 'force_out', player_info);
}

function registerButton(button, socket_label, player_info) {
    button.onclick = () => {
        console.log(`Button for ${socket_label} clicked by ${player_info['name']}!`);
        socket.emit(socket_label, player_info);
    };
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
