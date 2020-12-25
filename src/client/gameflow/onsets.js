import { appendServerMessage } from "../message_utils";
import { addScoreboardScore, initializeScoreboard } from "../scoreboard";
import { initializeElapsedTimer } from "../timing";

// TODO ONSETS: Should cubes be rolled first, or universe set first? Rulebook seems to say they happen simulatneously...
export function handleGameBeginOnsets(data, name) {

    // Notify players via chat
    let cardsetter = data['cardsetter'];
    appendServerMessage(`${data['starter']} started the game! The cubes have been rolled!`);
    appendServerMessage(`${data['goalsetter']} is chosen to be the goal-setter.`);
    appendServerMessage(`${cardsetter} must choose how many cards to deal in the universe.`);

    // Display game data
    addScoreboardScore(initializeScoreboard(data['players']), 0, 0, 0);
    initializeElapsedTimer(data['starttime']);

    setUpNewShakeOnsets(data, name, cardsetter);
}

export function handleShakeBeginOnsets(data, name) {
    // Notify players via chat
    appendServerMessage(`A new shake has started! ${data['goalsetter']} is chosen to be the goalsetter.`);
    setUpNewShakeOnsets(data, name, data['cardsetter']);
}

function setUpNewShakeOnsets(data, name, cardsetter) {
    // Display board visuals

    // TODO: Need onsets versions of these
    // clearBoard();
    // renderResources(data['cubes']);

    // Move to appropriate game phase (setting the universe)
    renderUniversePrompt(name, cardsetter);

    // Register callbacks

    // TODO: Need onsets versions of these
    // initializeBoardCallbacks(data['goalsetter'] === name && data['show_bonus']);
    // registerGoalSettingCallbacks(name, data['goalsetter'], true);
}
