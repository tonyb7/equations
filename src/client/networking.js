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
        let room_nonce = document.getElementById("room-nonce").innerHTML;
        let name = document.getElementById("name").innerHTML;
        console.log(`Connection was from ${name} in room ${room_nonce}`);
        socket.emit("register_player", {'room': room_nonce, 'name': name});
    });
}
