import { renderResources } from "../board/board";
import { clearBoard } from "../board/clear";
import { registerGoalSettingCallbacks } from "../callbacks/goal";
import { initializeBoardCallbacks } from "../callbacks/callbacks";
import { appendServerMessage } from "../message_utils";
import { addScoreboardScore, initializeScoreboard } from "../scoreboard";
import { initializeElapsedTimer } from "../timing";
import { renderVariations } from "../variations";

export function handleGameBeginEquations(data, name) {
    // Notify players via chat
    appendServerMessage(`${data['starter']} started the game! The cubes have been rolled!`);
    appendServerMessage(`${data['goalsetter']} is chosen to be the goal-setter.`);
    
    // Display game data
    addScoreboardScore(initializeScoreboard(data['players']), 0, 0, 0);
    initializeElapsedTimer(data['starttime']);
    
    setUpNewShakeEquations(data, name);
}

export function handleShakeBeginEquations(data, name) {
    // Notify players via chat
    appendServerMessage(`A new shake has started! ${data['goalsetter']} is chosen to be the goalsetter.`);

    // Game data should have already been updated somewhere else
    // So no code needed here for that (in contrast to handleGameBeginEquations)

    setUpNewShakeEquations(data, name);
}

// Functionality common to both first shake (new game) and >=second shakes
function setUpNewShakeEquations(data, name) {
    // Display board visuals
    clearBoard();
    renderResources(data['gametype'], data['cubes']);

    // Move to appropriate game phase (calling variations)
    renderVariations(data['variations_state'], data['players'], name, false);

    // Register callbacks
    initializeBoardCallbacks(data['players'].includes(name), data['goalsetter'] === name && data['show_bonus']);
    registerGoalSettingCallbacks(name, data['goalsetter'], true, data['gametype']);
}
