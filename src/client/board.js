// Functions related to moving cubes around the board
import { getAsset } from './assets';

export function rollCubes(cubes) {

    const cube_color_map = new Map();
    cube_color_map.set(0, 'r');
    cube_color_map.set(1, 'b');
    cube_color_map.set(2, 'g');
    cube_color_map.set(3, 'bk');
    
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
        image_clone.onclick = () => {
            // TODO if my turn and other cube has not been selected!!!
            image_clone.classList.add("highlight-img");
        };

        relevant_th.appendChild(image_clone);
    }

    console.log("Finished rolling cubes");
}
