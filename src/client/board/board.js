// Functions related to moving cubes around the board
import { gametype_to_asset_cloner_map } from '../assets/assets';

import { emitCubeClicked, bonusButtonCallback } from '../networking';
import { initializeGoalCanvas, deregisterGoalsettingCanvas, 
         addCubeToGoal, initializeGoalsetting } from '../goal';

export const sector_code_map = new Map([
    ["forbidden-sector", 'f'],
    ["permitted-sector", 'p'],
    ["required-sector", 'q'],
    ["goal-sector", 'g'],
]);

export let sector_cube_count = {
    "forbidden-sector": 0,
    "permitted-sector": 0,
    "required-sector": 0,
    "goal-sector": 0,
};

const gametype_to_num_cubes_map = new Map([
    ["eq", 24],
    ["os", 18],
]);

export function displayCubes(game) {
    if (!game['game_started']) {
        return;
    }
    console.assert(game['cube_index'].length > 0);

    initializeGoalsetting(game);
    renderGoal(game['gametype'], game['goal'], game['cube_index']);

    renderResources(game['gametype'], game['resources']);
    renderSector(game['gametype'], game['forbidden'], "forbidden-sector", game['cube_index']);
    renderSector(game['gametype'], game['permitted'], "permitted-sector", game['cube_index']);
    renderSector(game['gametype'], game['required'], "required-sector", game['cube_index']);
}

export function renderResources(gametype, cubes) {
    console.log("Rolling cubes!");
    let resources_div = document.getElementById("resources-cubes");
    for (let i = 0; i < gametype_to_num_cubes_map.get(gametype); ++i) {
        if (cubes[i] === -1) { // TODO -1 is a magic number...
            continue;
        }

        let relevant_th = resources_div.querySelector(`#r${i}`);
        let image_cloner = gametype_to_asset_cloner_map.get(gametype);
        let image_clone = image_cloner(i, cubes);

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

export function renderGoal(gametype, goal_info, cube_idx) {
    if (goal_info.length > 6) {
        console.log("Something is wrong! Server stored more than 6 cubes in goal!");
    }

    sector_cube_count["goal-sector"] = goal_info.length;
    initializeGoalCanvas(gametype, goal_info, cube_idx);
}

function renderSector(gametype, cubes, sectorid, cube_idx) {
    let length_limits = [12, 16, 20];
    for (const length of length_limits) {
        if (cubes.length > length) {
            addRowsToSector(sectorid, length);
        }
    }

    sector_cube_count[sectorid] = cubes.length;
    fillSector(gametype, cubes, sectorid, cube_idx);
}

function fillSector(gametype, cubes, sectorid, cube_idx) {
    for (let i = 0; i < cubes.length; ++i) {
        let relevant_th = document.getElementById(`${sector_code_map.get(sectorid)}${i}`);
        let idx = cubes[i]; // idx is the position that cube was in resources originally

        let asset_cloner = gametype_to_asset_cloner_map.get(gametype);
        relevant_th.appendChild(asset_cloner(idx, cube_idx));
    }
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

export function num_resources_cubes(gametype) {
    let not_in_resources = Object.values(sector_cube_count).reduce((a, b) => a + b);
    // console.log("cubes not in resources: ", not_in_resources);

    let total_cubes = gametype_to_num_cubes_map.get(gametype);
    return total_cubes - not_in_resources;
}

