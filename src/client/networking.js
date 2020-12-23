// Handle client networking.

import io from 'socket.io-client';
import { appendMessage, appendServerMessage, 
         printFiveMinWarningMsg, appendEndShakeNoGoal } from './message_utils';
import { initializeScoreboard, highlightResourcesCube, unhighlightResourcesCube, 
    moveCube, hideGoalSettingButtons } from './board';
import { updateGoalline } from './goal';
import { handleChallenge, handleForceOut, reviewSolutions, handleRejectionAssent,
         handleReevaluateSolution, handleShakeFinish } from './endgame';
import { updateTimerOnFlip } from './timing';
import { handleVariationsFinished, renderVariations } from './variations';
import { setUniverse, universeError } from './universe';
import { renderPlayerState, renderSpectatorState } from './state_init';
import { handleGameBegin, handleShakeBegin, handleNextTurn, handleGameOver } from './game_flow';

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

    socket.on("render_spectator_state", (game) => renderSpectatorState(game, name));
    socket.on("render_player_state", (game) => renderPlayerState(game, name));

    socket.on("new_player", initializeScoreboard);
    socket.on("player_left", initializeScoreboard);
    
    socket.on("begin_game", (data) => handleGameBegin(data, name));
    socket.on("begin_shake", (data) => handleShakeBegin(data, name));
    socket.on("next_turn", (command) => handleNextTurn(command, name));
    socket.on("game_over_clientside", () => handleGameOver());

    socket.on("end_shake_no_goal", () => appendEndShakeNoGoal(socket));

    socket.on("hide_goal_setting_buttons", () => hideGoalSettingButtons());
    socket.on("update_goalline", (data) => updateGoalline(data['type'], data['order'], data['new_val']));

    socket.on("highlight_cube", (pos) => highlightResourcesCube(pos));
    socket.on("unhighlight_cube", (pos) => unhighlightResourcesCube(pos));

    socket.on("move_cube", (directions) => moveCube(directions));

    socket.on("handle_challenge", (info) => handleChallenge(socket, name, info));
    socket.on("force_out", (players) => handleForceOut(socket, name, players));
    socket.on("review_solutions", (review_soln_msg) => reviewSolutions(socket, name, review_soln_msg));
    socket.on("rejection_assent", (info) => handleRejectionAssent(socket, name, info));
    socket.on("reevaluate_solution", (info) => handleReevaluateSolution(socket, name, info));
    socket.on("finish_shake", (shake_finish_msg) => 
        handleShakeFinish(socket, name, shake_finish_msg["scores"], shake_finish_msg["game_finished"]));

    socket.on("five_minute_warning_message", () => printFiveMinWarningMsg());

    socket.on("update_variations", (info) => 
        renderVariations(socket, info['variations_state'], info['players'], name));
    socket.on("variations_finished", (data) => handleVariationsFinished(data, name));

    socket.on("timer_flip", (info) => updateTimerOnFlip(info));

    socket.on("universe_set", (univ_set_info) => setUniverse(univ_set_info, name));
    socket.on("universe_error", (error_info) => universeError(error_info, name));
}

export function sendChatMessage(text) {
    let name = document.getElementById("name").innerHTML;

    socket.emit('new_message', {'name': name, 'message': text});
}

export const emitCubeClicked = (pos) => socket.emit("cube_clicked", pos);

export function bonusButtonCallback() {
    this.classList.toggle("button-clicked");
    socket.emit("bonus_clicked");
}

