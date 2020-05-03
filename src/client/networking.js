// Handle client networking.

import io from 'socket.io-client';

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

        // Register callbacks
        socket.on('disconnect', () => {
            console.log(`${name} disconnected from room ${room_nonce}`);
        });
        registerButtonCallbacks();

        // Tell server wanna join
        console.log(`Connecting as ${name} in room ${room_nonce}`);
        socket.emit("register_player", {'room': room_nonce, 'name': name});
    });
}

function registerButtonCallbacks() {
    var buttons = document.getElementById("buttons-div");
    if (buttons.length === 0) {
        console.log("Error finding buttons on page!?");
        return;
    }

    let start_btn = buttons.querySelector("#start-game");
    start_btn.onclick = () => {
        console.log("Start game button clicked!");
    };

    let flip_timer_btn = buttons.querySelector('#flip-timer');
    flip_timer_btn.onclick = () => {
        console.log("Flip timer button clicked!");
    };

    let claim_warning_btn = buttons.querySelector("#claim-warning");
    claim_warning_btn.onclick = () => {
        console.log("Claim 10 second warning button clicked!");
    };

    let claim_minus_one_btn = buttons.querySelector('#claim-minus-one');
    claim_minus_one_btn.onclick = () => {
        console.log("Claim minus one button clicked!");
    };

    let a_flub_btn = buttons.querySelector('#a-flub');
    a_flub_btn.onclick = () => {
        console.log("Challenge now button clicked!");
    }; 

    let p_flub_btn = buttons.querySelector('#p-flub');
    p_flub_btn.onclick = () => {
        console.log("Challenge impossible button clicked!");
    }; 

    let force_out_btn = buttons.querySelector('#force-out');
    force_out_btn.onclick = () => {
        console.log("Force out button clicked!");
    };
}
