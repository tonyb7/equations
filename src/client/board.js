// Functions related to moving cubes around the board
import { getEquationsAssetClone } from './assets';
import { emitCubeClicked, bonusButtonCallback } from './networking';
import { initializeGoalCanvas, deregisterGoalsettingCanvas, 
         clearGoalCanvas, addCubeToGoal, initializeGoalsettingGlobals } from './goal';
import { initializeElapsedTimer, updateGameTimer } from './timing';

const sector_code_map = new Map([
    ["forbidden-sector", 'f'],
    ["permitted-sector", 'p'],
    ["required-sector", 'q'],
    ["goal-sector", 'g'],
]);

let sector_cube_count = {
    "forbidden-sector": 0,
    "permitted-sector": 0,
    "required-sector": 0,
    "goal-sector": 0,
};

export function renderResources(cubes) {
    
    console.log("Rolling cubes!");
    let resources_div = document.getElementById("resources-cubes");
    for (let i = 0; i < cubes.length; ++i) {
        if (cubes[i] === -1) { // TODO -1 is a magic number...
            continue;
        }

        let relevant_th = resources_div.querySelector(`#r${i}`);
        let image_clone = getEquationsAssetClone(i, cubes);

        image_clone.onmouseover = () => {
            image_clone.classList.add("show-border");
        };
        image_clone.onmouseout = () => {
            image_clone.classList.remove("show-border");
        };
        image_clone.onclick = () => emitCubeClicked(i);

        relevant_th.appendChild(image_clone);
    }

    console.log("Finished rolling cubes");
}

export function renderGoal(goal_info, cube_idx) {
    if (goal_info.length > 6) {
        console.log("Something is wrong! Server stored more than 6 cubes in goal!");
    }

    sector_cube_count["goal-sector"] = goal_info.length;
    initializeGoalCanvas(goal_info, cube_idx);
}

export function renderSector(cubes, sectorid, cube_idx) {
    let length_limits = [12, 16, 20];
    for (const length of length_limits) {
        if (cubes.length > length) {
            addRowsToSector(sectorid, length);
        }
    }

    sector_cube_count[sectorid] = cubes.length;
    fillSector(cubes, sectorid, cube_idx);
}

function fillSector(cubes, sectorid, cube_idx) {
    for (let i = 0; i < cubes.length; ++i) {
        let relevant_th = document.getElementById(`${sector_code_map.get(sectorid)}${i}`);
        let idx = cubes[i]; // idx is the position that cube was in resources originally

        relevant_th.appendChild(getEquationsAssetClone(idx, cube_idx));
    }
}

function clearGoal() {
    clearGoalCanvas();
    sector_cube_count["goal-sector"] = 0;
}

function clearSector(sectorid) {
    let sector_table = document.getElementById(sectorid).querySelector('table');

    // console.log("sector id ", sectorid);
    // console.log("sector table: ", sector_table);

    for (let i = sector_table.rows.length - 1; i >= 3; --i) {
        // console.log("deleting row ", i);
        sector_table.deleteRow(i);
    }

    for (let i = 0; i < 12; ++i) { // magic bad
        let th = sector_table.querySelector(`#${sector_code_map.get(sectorid)}${i}`);
        th.innerHTML = '';
    }

    sector_cube_count[sectorid] = 0;
}

function clearResources() {
    let resources_div = document.getElementById("resources-cubes");
    for (let i = 0; i < 24; ++i) {
        let th = resources_div.querySelector(`#r${i}`);
        th.innerHTML = '';
    }
}

export function initializeScoreboard(players) {
    let scoreboard = document.getElementById("scoreboard");
    for (let i = 0; i < players.length; ++i) {
        scoreboard.rows[0].cells.item(i).innerHTML = players[i];
    }
    for (let i = players.length; i < 3; ++i) {
        scoreboard.rows[0].cells.item(i).innerHTML = "--------";
    }
    return scoreboard;
}

function fillScoreboardScores(scoreboard, p1scores, p2scores, p3scores) {
    if (typeof p1scores === "undefined") {
        return;
    }

    if (p1scores.length !== p2scores.length || p2scores.length != p3scores.length) {
        console.log("Something is messed up with the scores! Not of same length!");
    }

    for (let i = 0; i < p1scores.length; ++i) {
        addScoreboardScore(scoreboard, p1scores[i], p2scores[i], p3scores[i]);
    }
}

export function addScoreboardScore(scoreboard, p1score, p2score, p3score) {
    if (scoreboard.rows.length === 2 && scoreboard.rows[1].cells[0].innerHTML == 0) { // hacky
        scoreboard.deleteRow(1);
    }

    let new_row = scoreboard.insertRow();
    new_row.insertCell().innerHTML = p1score;
    new_row.insertCell().innerHTML = p2score;
    new_row.insertCell().innerHTML = p3score;
}

export function highlightResourcesCube(position) {
    // Should never receive highlight_cube on an invalid pos 
    // Server checks that pos in resources is valid
    let surrounding_th = document.getElementById(`r${position}`);
    let image = surrounding_th.querySelector("img");
    image.classList.add("highlight-img");
}

export function unhighlightResourcesCube(position) {
    let surrounding_th = document.getElementById(`r${position}`);
    let image = surrounding_th.querySelector("img");
    image.classList.remove("highlight-img");
}

export function updateTurnText(name) {
    let turn_elt = document.getElementById("actual-turn-text");
    turn_elt.innerHTML = `${name}`;
}

export function moveCube(directions) {
    // console.log("moving cube with directions ", directions);

    let from_idx = directions['from'];

    let num_cubes_in_sector = sector_cube_count[directions['to']];
    let to_id = `${sector_code_map.get(directions['to'])}${num_cubes_in_sector}`;

    // console.log("num_cubes_in_sector: ", num_cubes_in_sector);
    // console.log("to_id: ", to_id);

    if (num_cubes_in_sector === 12 || num_cubes_in_sector === 16 
        || num_cubes_in_sector === 20) {
        addRowsToSector(directions['to'], num_cubes_in_sector);
    }

    sector_cube_count[directions['to']]++;
    let img_in_resources = document.getElementById("resources-cubes")
        .querySelector(`#r${from_idx}`).querySelector("img");
    
    img_in_resources.onmouseover = () => {};
    img_in_resources.onmouseout = () => {};
    img_in_resources.onclick = () => {};
    img_in_resources.classList.remove("highlight-img");
    if (directions['to'] === 'goal-sector') {
        addCubeToGoal(directions['from'], img_in_resources);
    }
    else {
        document.getElementById(to_id).appendChild(img_in_resources);
    }

    updateBonusButton(false);
    // console.log("successfully moved cube");
}

function addRowsToSector(sectorid, begin_idx) {
    // console.log(`inserting row into table for ${sectorid} at ${begin_idx / 4}`);
    // console.log("table ", table);

    let table = document.getElementById(sectorid).querySelector('table');
    let new_row = table.insertRow();

    for (let i = 0; i < 4; ++i) {
        let new_cell = new_row.insertCell();
        new_cell.id = `${sector_code_map.get(sectorid)}${begin_idx + i}`;
    }

    // console.log("new table ", table);
}

// Render all visuals, including the board, resources/cubes, and scoreboard
export const renderGameVisuals = (game) => {
    fillScoreboardScores(initializeScoreboard(game['players']), 
        game["p1scores"], game["p2scores"], game["p3scores"]);
    
    if (game["game_finished"]) {
        updateTurnText("Game Ended");
    }
    else if (!game["game_started"]) {
        updateTurnText("Not Started");
    }
    else {
        updateTurnText(game['players'][game['turn']]);
        initializeElapsedTimer(game['starttime']);
        updateGameTimer(game["last_timer_flip"]);
    }

    if (game["game_started"]) {
        document.getElementById("start_game").remove();
        initializeGoalsettingGlobals();
        if (game["goalset"]) {
            hideGoalSettingButtons();
        }

        renderResources(game['resources']);
        renderGoal(game['goal'], game['cube_index']);
        renderSector(game['forbidden'], "forbidden-sector", game['cube_index']);
        renderSector(game['permitted'], "permitted-sector", game['cube_index']);
        renderSector(game['required'], "required-sector", game['cube_index']);
    } 

    // TODO Remember to expand upon once more game features are added
    // TODO time, scores
}

export function updateBonusButton(show) {
    let bonus_button = document.getElementById("bonus-button");
    bonus_button.classList.remove("button-clicked");
    if (show) {
        bonus_button.classList.remove("hidden");
        bonus_button.onclick = bonusButtonCallback.bind(bonus_button);
    }
    else {
        bonus_button.classList.add("hidden");
        bonus_button.onclick = () => {};
    }
}

export function hideGoalSettingButtons() {
    let no_goal_button = document.getElementById("no_goal");
    no_goal_button.classList.add("hidden");
    no_goal_button.onclick = () => 
        console.log("No goal challenge somehow clicked...");

    let set_goal_button = document.getElementById("set-goal-button");
    set_goal_button.classList.add("hidden");
    set_goal_button.onclick = () => 
        console.log("Set goal button somehow clicked...");

    deregisterGoalsettingCanvas();
}

export function clearBoard() {
    let sectorids = ['forbidden-sector', 'permitted-sector', 'required-sector'];

    console.log("Clearing board");
    clearGoal();
    for (let sectorid of sectorids) {
        clearSector(sectorid);
    }

    clearResources();
}

export function num_resources_cubes() {
    let not_in_resources = Object.values(sector_cube_count).reduce((a, b) => a + b);
    console.log("cubes not in resources: ", not_in_resources);
    return 24 - not_in_resources;
}
