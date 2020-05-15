// Module for holding helper functions that register and deregister 
// callbacks on the board and for buttons

import { updateBonusButton } from './board';

const board_sectors = ["forbidden-sector", "permitted-sector", 
                         "required-sector", "goal-sector"];

const button_ids = ["flip_timer", "claim_warning", "claim_minus_one",
                    "a_flub", "p_flub", "no_goal"];

export function registerStartButton(socket) {
    let buttons = getButtonsDiv();
    let start_button = buttons.querySelector("#start_game");
    start_button.onclick = () => {
        console.log("Button for start_game clicked!");
        socket.emit("start_game");
    };
}

export const registerGoalSetButton = (socket, name, firstmover, firstmove) => {
    if (!firstmove)
        return;

    if (firstmover === name) {
        let set_goal_button = document.getElementById("set-goal-button");
        set_goal_button.classList.remove("hidden");
        set_goal_button.onclick = () => {
            socket.emit("set_goal");
        };
    }
};

export function initializeBoardCallbacks(socket, show_bonus) {
    for (const id of board_sectors) {
        document.getElementById(id).onclick = () => {
            console.log(`${id} clicked`);
            socket.emit("sector_clicked", id);
        };
    }

    registerGameStartCallbacks(socket);
    registerBonusButtonCallback(socket);
    updateBonusButton(show_bonus);
}

function getButtonsDiv() {
    let buttons = document.getElementById("buttons-div");
    if (buttons.length === 0) {
        throw Error("Error finding buttons on page!?");
    }
    return buttons;
}

function registerGameStartCallbacks(socket) {
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

function registerBonusButtonCallback(socket) {
    let bonus_button = document.getElementById("bonus-button");
    bonus_button.onclick = () => {
        bonus_button.classList.add("button-clicked");
        socket.emit("bonus_clicked");
    };
}

export function deregisterBoardCallbacks() {
    for (const id of board_sectors) {
        document.getElementById(id).onclick = () => {};
    }

    deregisterButtonCallbacks();
    deregisterBonusButtonCallback();
    deregisterGoalSetCallback();
    updateBonusButton(false);
}

function deregisterButtonCallbacks() {
    let buttons = getButtonsDiv();
    for (const button_id of button_ids) {
        buttons.querySelector(`#${button_id}`).onclick = () => {};
    }
}

function deregisterBonusButtonCallback() {
    document.getElementById("bonus-button").onclick = () => {};
}

function deregisterGoalSetCallback() {
    let set_goal_button = document.getElementById("set-goal-button");
    set_goal_button.classList.add("hidden");
    set_goal_button.onclick = () => {};
}
