// Module for holding helper functions that register and deregister 
// callbacks on the board and for buttons

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
            set_goal_button.classList.add("hidden");
            set_goal_button.onclick = () => 
                console.log("Set goal button somehow clicked...");
        };
    }
};

export function initializeBoardCallbacks(socket) {
    let board_sectors = ["forbidden-sector", "permitted-sector", 
                         "required-sector", "goal-sector"];
    for (const id of board_sectors) {
        document.getElementById(id).onclick = () => {
            console.log(`${id} clicked`);
            socket.emit("sector_clicked", id);
        };
    }

    registerGameStartCallbacks(socket);
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

    let button_ids = ["flip_timer", "claim_warning", "claim_minus_one",
                      "a_flub", "p_flub", "force_out"];
    for (const button_id of button_ids) {
        registerButton(socket, buttons.querySelector(`#${button_id}`), 
                       button_id);
    }

    let start_button = buttons.querySelector("#start_game");
    start_button.onclick = () => {};
}

function registerButton(socket, button, socket_label) {
    button.onclick = () => {
        console.log(`Button for ${socket_label} clicked!`);
        socket.emit(socket_label);
    };
}
