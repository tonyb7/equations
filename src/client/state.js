// Render front end given a rooms_info[room] dict

import { displayScoreboard } from "./scoreboard";
import { displayTurnText } from "./turntext";
import { displayTimers } from "./timing";
import { displayButtons } from "./buttons";
import { displayCubes } from "./board/board";
import { displayPregoalProcedures } from "./pregoal";
import { displayEndgame } from "./endgame";

import { registerButtonsPlayer } from "./callbacks/buttons";
import { registerGoalSetting } from "./callbacks/goal";
import { registerBoardCallbacks } from "./callbacks/callbacks";

// Render visuals on the board and output the correct chat prompts
// for indicating what phase the game is in.
export function displayState(game, name) {

    // Game data
    displayScoreboard(game);
    displayTurnText(game);
    displayTimers(game);
    displayButtons(game);

    // Board visuals
    displayCubes(game);

    // Restore appropriate phase of the game
    displayPregoalProcedures(game, name);
    displayEndgame(game, name);

}

// Render spectator state, but also add appropriate player callbacks
export function displayStatePlayer(game, name) {

    displayState(game, name);

    registerButtonsPlayer(game, name);
    registerGoalSetting(game, name);    
    registerBoardCallbacks(game, name);

}
