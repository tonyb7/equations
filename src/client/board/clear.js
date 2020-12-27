import { clearGoalCanvas } from "../goal";
import { sector_code_map, sector_cube_count } from "./board";

export function clearBoard() {
    let sectorids = ['forbidden-sector', 'permitted-sector', 'required-sector'];

    console.log("Clearing board");
    clearGoal();
    for (let sectorid of sectorids) {
        clearSector(sectorid);
    }

    clearResources();
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

export function clearCards() {
    let cards_div = document.getElementById("resources-cards");
    for (let i = 0; i < 18; ++i) {
        let th = cards_div.querySelector(`#c${i}`);
        th.innerHTML = '';
    }
}
