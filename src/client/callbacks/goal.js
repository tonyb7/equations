import { initializeGoalsettingGlobals, registerGoalsettingCanvas } from "../goal";
import { socket } from "../networking";

export function registerGoalSetting(game, name) {
    if (!game['game_started']) {
        return;
    }
    registerGoalSettingCallbacks(name, game['players'][game['turn']], !game["goalset"]);
}

const registerGoalSettingCallbacks = (name, firstmover, firstmove) => {
    initializeGoalsettingGlobals();
    window.onresize = resizeGoalsettingCanvas;

    if (!firstmove)
        return;

    if (firstmover === name) {
        let set_goal_button = document.getElementById("set-goal-button");
        set_goal_button.classList.remove("hidden");
        set_goal_button.onclick = () => {
            socket.emit("set_goal");
        };
        registerGoalsettingCanvas();
    }
};

export function deregisterGoalSetCallback() {
    let set_goal_button = document.getElementById("set-goal-button");
    set_goal_button.classList.add("hidden");
    set_goal_button.onclick = () => {};
}
