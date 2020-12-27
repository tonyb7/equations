import { displayVariations } from "./variations";
import { displayUniverse } from "./universe";

// Pregoal procedures include calling variations and setting the universe.
export function displayPregoalProcedures(game, name) {

    if (game['gametype'] == 'eq') {
        displayVariations(game, name);
    }
    else if (game['gametype'] == 'os') {
        displayUniverse(game, name);
        displayVariations(game, name);
    }

}
