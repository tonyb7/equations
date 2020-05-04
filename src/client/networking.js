// Handle client networking.

import io from 'socket.io-client';
import { cleanInput, appendMessage } from './message_utils';
import { getAsset } from './assets';

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
        console.log(`Received message ${message} from ${name}`);
        appendMessage(name, message);
    });

    socket.on("server_message", (message) => {
        let name = "Server";
        console.log(`Server sending message ${message}`);
        appendMessage(name, message);
    });
    
    socket.on("roll_cubes", (data) => {
        let cubes = data['cubes']
        console.log("Rolled cubes: ", cubes);
        document.getElementById("start-game").onclick = () => {
            console.log("Game has already started!")
        };

        const cube_color_map = new Map();
        cube_color_map.set(0, 'r');
        cube_color_map.set(1, 'b');
        cube_color_map.set(2, 'g');
        cube_color_map.set(3, 'bk');
        
        let resources_div = document.getElementById("resources-cubes");
        for (let i = 0; i < cubes.length; ++i) {
            let relevant_th = resources_div.querySelector(`#r${i}`);
            let image_name = `${cube_color_map.get(Math.floor(i/6))}${cubes[i]}.png`;
            let image_clone = getAsset(image_name).cloneNode(true);

            image_clone.onmouseover = () => {
                image_clone.classList.add("show-border");
            };
            image_clone.onmouseout = () => {
                image_clone.classList.remove("show-border");
            };
            image_clone.onclick = () => {
                // TODO if my turn and other cube has not been selected!!!
                image_clone.classList.add("highlight-img");
            };

            relevant_th.appendChild(image_clone);
        }
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
            console.log(`Sent message ${message} from user ${name}`);
        }
    });
}
