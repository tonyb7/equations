// Functions related to moving cubes around the board
import { getAsset } from './assets';
import { emitCubeClicked } from './networking';

const cube_color_map = new Map([
    [0, 'r'],
    [1, 'b'],
    [2, 'g'],
    [3, 'bk'],
]);

export function rollCubes(cubes) {
    
    console.log("Rolling cubes!");
    let resources_div = document.getElementById("resources-cubes");
    for (let i = 0; i < cubes.length; ++i) {
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
