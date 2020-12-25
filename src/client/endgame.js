// Functions for endgame stuff

import { appendServerMessage, appendSidingOptions, 
    appendSolutionPrompt, appendAcceptPrompt, appendAssentToRejectPrompt, 
    appendStartNewShakeButton, appendNoGoalButtons,
    appendEndShakeNoGoal } from './message_utils';
import { deregisterBoardCallbacks } from './callbacks/main';
import { updateTurnText } from './turntext';
import { addScoreboardScore } from './scoreboard';
import { socket } from './networking';
import { hideGoalSettingButtons } from './board';


const challengeTextMap = new Map([
    ["a_flub", "Challenge Now"],
    ["p_flub", "Challenge Impossible"],
    ["no_goal", "No Goal Declared"],
    ["force_out", "Last Cube Procedure"]
]);

export function displayEndgame(game, name) {
    updateClientOnEndgame(socket, name, game['endgame'], game['players']);
    if (game['game_started']) {
        if (game['challenge'] === "no_goal") {
            hideGoalSettingButtons();
        }
    }
}

export function updateClientOnEndgame(socket, name, endgame_info, players) {
    if (!endgame_info) {
        return;
    }

    updateTurnText(challengeTextMap.get(endgame_info["challenge"]));

    if (endgame_info["endgame_stage"] === "finished") {
        handleNextShakePrompt(socket, name, players);
    }
    else if (endgame_info["endgame_stage"] === "no_goal_finished") {
        handleNextShakePromptNoGoal(socket, name, players);
    }
    else {
        printEndgameState(endgame_info);

        if (endgame_info["endgame_stage"] === "waiting_for_reviewers") {
            reviewSolutions(socket, name, {"solutions": endgame_info["solutions"], "players": players});
            checkForRejectionAssents(socket, name, endgame_info);
        }
        else {
            if (endgame_info["challenge"] == "no_goal") {
                handleNoGoalSidingPrompt(socket, endgame_info["caller"], endgame_info["writers"], 
                    endgame_info["nonwriters"], name);
            }
            else {
                handleSidingPrompt(socket, endgame_info["sider"], name);
                handleSolutionPrompt(socket, endgame_info["writers"], name);
            }
        }
    }
}

function checkForRejectionAssents(socket, name, endgame_info) {
    // console.log(endgame_info);
    for (let reviewer in endgame_info["review_status"]) {
        if (endgame_info["review_status"].hasOwnProperty(reviewer)) {
            for (let writer in endgame_info["review_status"][reviewer]) {
                if (endgame_info["review_status"][reviewer].hasOwnProperty(writer)) {
                    let status = endgame_info["review_status"][reviewer][writer];
                    // console.log("rejecter: ", reviewer, " writer:", writer, " status: ", status);
                    if (status === "ASSENTING") {
                        handleRejectionAssent(socket, name, {"rejecter": reviewer, "writer": writer});
                    }
                }
            }
        }
    }
}

function printEndgameState(endgame_info) {
    let challenge = endgame_info["challenge"];
    if (challenge === "force_out") {
        appendServerMessage("The players are currently in a Force Out...");
    }
    else if (challenge === "no_goal") {
        appendServerMessage("A No Goal has been declared...");
    }
    else {
        let msgpt1 = `${endgame_info["challenger"]} has called `;
        let msgpt2 = `${challengeTextMap.get(challenge)} on ${endgame_info["last_mover"]}.`;
        appendServerMessage(`${msgpt1}${msgpt2}`);
    }
}

export function handleChallenge(socket, name, info) {
    let challenge = info["challenge"];
    let writers = info["writers"];
    let nonwriters = info["nonwriters"];
    let caller = info["caller"];
    let sider = info["sider"];

    // console.log("handle_challenge", challenge, defender, caller, sider);
    // console.log(challengeTextMap);
    // console.log(challengeTextMap.get(challenge));

    deregisterBoardCallbacks();
    updateTurnText(challengeTextMap.get(challenge));

    if (challenge === "no_goal") {
        handleNoGoalSidingPrompt(socket, caller, writers, nonwriters, name);
        return;
    }

    handleSidingPrompt(socket, sider, name);
    handleSolutionPrompt(socket, writers, name);
}

function handleNoGoalSidingPrompt(socket, goalsetter, writers, nonwriters, name) {
    if (name === goalsetter) {
        appendServerMessage("Waiting for other player to agree or disagree with your No Goal declaration...");
    }
    else if (nonwriters.includes(name)) {
        appendServerMessage("Waiting for one more player to agree or disagree with the No Goal declaration...");
    }
    else if (writers.includes(name)) {
        appendSolutionPrompt(socket);
    }
    else {
        appendNoGoalButtons(socket, goalsetter);
    }
}

function handleSidingPrompt(socket, sider, name) {
    if (sider != null) {
        if (sider === name) {
            appendSidingOptions(socket);
        }
        else {
            appendServerMessage(`Waiting for ${sider} to side...`);
        }
    }
}

function handleSolutionPrompt(socket, writers, name) {
    if (writers.includes(name)) {
        appendSolutionPrompt(socket);
    }
    else {
        appendServerMessage("Waiting for solutions to be submitted....");
    }
}

export function handleForceOut(socket, name, players) {
    updateTurnText("Force Out");
    appendServerMessage("It is now Force Out.");
    if (!players.includes(name)) {
        appendServerMessage("Waiting for players to write solutions...");
        return;
    }

    deregisterBoardCallbacks();
    appendSolutionPrompt(socket);
}

export function reviewSolutions(socket, name, review_soln_msg) {
    appendServerMessage("Time to review solutions!");
        
    let solutions = review_soln_msg["solutions"];
    let players = review_soln_msg["players"];

    let reviewing_one = false;
    for (let writer in solutions) {
        if (writer === name) {
            continue;
        }

        reviewing_one = true;
        appendAcceptPrompt(socket, writer, solutions[writer], false, players.includes(name));
    }

    if (!reviewing_one) {
        appendServerMessage("Waiting for others to finish reviewing solutions...");
    }
}

export function handleRejectionAssent(socket, name, info) {
    let rejecter = info['rejecter'];
    let writer = info['writer'];

    if (writer !== name) {
        appendServerMessage(`Waiting for ${writer} to accept the rejection...`);
        return;
    }

    appendAssentToRejectPrompt(socket, rejecter);
}

export function handleReevaluateSolution(socket, name, info) {
    let rejecter = info['rejecter'];
    let writer = info['writer'];
    let solution = info['solution'];

    if (rejecter !== name) {
        let msg_pt1 = `${writer} does not agree that his/her solution `;
        let msg_pt2 = `is incorrect. Waiting for ${rejecter} to re-evaluate `;
        let msg_pt3 = "whether the solution is correct...";

        appendServerMessage(`${msg_pt1}${msg_pt2}${msg_pt3}`);
        return;
    }

    appendAcceptPrompt(socket, writer, solution, true, true);
}

export function handleShakeFinish(socket, name, scores, game_finished) {
    let p1score = scores['p1score'];
    let p2score = scores['p2score'];
    let p3score = scores['p3score'];
    let players = scores['players'];

    appendServerMessage("This shake has finished! The scoreboard has been updated.");
    addScoreboardScore(document.getElementById("scoreboard"), p1score, p2score, p3score);
    if (!game_finished) {
        handleNextShakePrompt(socket, name, players);
    } 
    else {
        socket.emit("game_over");
    }
}

function handleNextShakePrompt(socket, name, players) {
    if (players.includes(name)) {
        appendServerMessage("Click here to start a new shake: ");
        appendStartNewShakeButton(socket);
    }
    else {
        appendServerMessage("Waiting for players to start a new shake...");
    }
}

function handleNextShakePromptNoGoal(socket, name, players) {
    if (players.includes(name)) {
        appendServerMessage("Click here to restart the shake: ");
        appendEndShakeNoGoal(socket);
    }
    else {
        appendServerMessage("Waiting for players to restart the shake...");
    }
}
