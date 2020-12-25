import { socket } from "../networking";

// Given state object, derive which buttons should be *displayed*.
export function displayButtons(game) {
    if (game['game_started']) {
        document.getElementById("start_game").remove();
    }
}

// Give state object, derive which buttons should be *registered*.
// Only relevant for players, as only players can click the buttons
// that this function manages.
export function registerButtonsPlayer(game, name) {
    if (!game['game_started']) {
        registerStartButton(socket);
        registerLeaveButton(socket, game, name);
    }
}

function registerStartButton(socket) {
    let buttons = getButtonsDiv();
    let start_button = buttons.querySelector("#start_game");
    start_button.onclick = () => {
        console.log("Button for start_game clicked!");
        socket.emit("start_game");
    };
}

function registerLeaveButton(socket, game, name) {
    if (!game['tournament'] && game['players'].includes(name)) {
        let leave_button = document.createElement("button");
        leave_button.innerHTML = "Leave Game";
        leave_button.onclick = () => {
            socket.emit("leave_game");
        };

        let leave_anchor = document.createElement("a");
        leave_anchor.id = "leave_game_anchor";
        leave_anchor.href = "/";
        leave_anchor.appendChild(leave_button);

        let buttons = document.getElementById("buttons-div");
        buttons.appendChild(leave_anchor);
    }
}

function getButtonsDiv() {
    let buttons = document.getElementById("buttons-div");
    if (buttons.length === 0) {
        throw Error("Error finding buttons on page!?");
    }
    return buttons;
}

const button_ids = [
    "flip_timer", "claim_warning", "claim_minus_one",
    "a_flub", "p_flub", "no_goal",
];

// Register buttons used for the game
export function registerButtonCallbacks(socket) {
    let buttons = getButtonsDiv();

    for (const button_id of button_ids) {
        registerButton(socket, buttons.querySelector(`#${button_id}`), 
                       button_id);
    }
}

function registerButton(socket, button, socket_label) {
    button.onclick = () => {
        console.log(`Button for ${socket_label} clicked!`);
        socket.emit(socket_label);
    };
}

export function deregisterButtonCallbacks() {
    let buttons = getButtonsDiv();
    for (const button_id of button_ids) {
        buttons.querySelector(`#${button_id}`).onclick = () => {};
    }
}

