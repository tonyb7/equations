// Functions related to moving cubes around the board
import { getAsset } from './assets';
import { emitCubeClicked } from './networking';

const cube_color_map = new Map([
    [0, 'r'],
    [1, 'b'],
    [2, 'g'],
    [3, 'bk'],
]);

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

let cube_idx = [];

export function renderResources(cubes) {

    if (cube_idx.length === 0) {
        cube_idx = cubes;
    }
    
    console.log("Rolling cubes!");
    let resources_div = document.getElementById("resources-cubes");
    for (let i = 0; i < cubes.length; ++i) {
        if (cubes[i] === -1) { // TODO -1 is a magic number...
            continue;
        }

        let relevant_th = resources_div.querySelector(`#r${i}`);
        let image_name = `${cube_color_map.get(Math.floor(i/6))}${cubes[i]}.png`;
        let image_clone = getAsset(image_name).cloneNode(true);

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

export function renderGoal(cubes) {
    if (cubes.length > 6) {
        console.log("Something is wrong! Server stored more than 6 cubes in goal!");
    }

    fillSector(cubes, "goal-sector");
}

export function renderSector(cubes, sectorid) {
    let length_limits = [12, 16, 20];
    for (const length of length_limits) {
        if (cubes.length > length) {
            addRowsToSector(sectorid, length);
        }
    }

    fillSector(cubes, sectorid);
}

function fillSector(cubes, sectorid) {
    for (let i = 0; i < cubes.length; ++i) {
        let relevant_th = document.getElementById(`${sector_code_map.get(sectorid)}${i}`);
        let idx = cubes[i]; // idx is the position that cube was in resources originally
        let image_name = `${cube_color_map.get(Math.floor(idx/6))}${cube_idx[idx]}.png`;
        let image_clone = getAsset(image_name).cloneNode(true);
        relevant_th.appendChild(image_clone);
    }
}

export function initializeScoreboard(players) {
    let scoreboard = document.getElementById("scoreboard");
    for (let i = 0; i < players.length; ++i) {
        scoreboard.rows[0].cells.item(i).innerHTML = players[i];
    }
}

// Future TODO: next turn can be smarter if players stored
export function updateTurn(name) {
    let turn_elt = document.getElementById("actual-turn-text");
    turn_elt.innerHTML = `${name}`;
}

export function moveCube(directions) {
    let from_idx = directions['from'];

    // console.log("sector cube count: ", sector_cube_count);
    // console.log(directions['to']);
    // console.log(sector_cube_count[directions['to']]);

    let num_cubes_in_sector = sector_cube_count[directions['to']];
    let to_id = `${sector_code_map.get(directions['to'])}${num_cubes_in_sector}`;

    if (num_cubes_in_sector === 12 || num_cubes_in_sector === 16 
        || num_cubes_in_sector === 20) {
        addRowsToSector(directions['to'], num_cubes_in_sector);
    }

    sector_cube_count[directions['to']]++;
    let img_in_resources = document.getElementById("resources-cubes")
        .querySelector(`#r${from_idx}`).querySelector("img");
    
    img_in_resources.onmouseover = () => {};
    img_in_resources.onmouseout = () => {};
    img_in_resources.classList.remove("highlight-img");
    if (directions['to'] === 'goal-sector') {
        img_in_resources.classList.add("goal-highlight");
    }
    
    // console.log(to_id);
    // console.log(document.getElementById(to_id));

    document.getElementById(to_id).appendChild(img_in_resources);
}

function addRowsToSector(sectorid, begin_idx) {
    // console.log(`inserting row into table for ${sectorid} at ${begin_idx / 4}`);
    let table = document.getElementById(sectorid).querySelector('table');
    let new_row = table.insertRow();

    for (let i = 0; i < 4; ++i) {
        let new_cell = new_row.insertCell();
        new_cell.id = `${sector_code_map.get(sectorid)}${begin_idx + i}`;
    }
}
