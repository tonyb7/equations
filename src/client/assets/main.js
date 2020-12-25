// Taken from https://github.com/vzhou842/example-.io-game/blob/master/src/client/assets.js

import { downloadEquationsCubesPromise } from "./equations";
import { downloadOnsetsCubesPromise, downloadOnsetsCardsPromise } from "./onsets";

// Download all assets regardless of what game type...since game type is not known
// at the time when this function is currently called...
export const downloadAssets = () => Promise.all(
    [downloadEquationsCubesPromise, downloadOnsetsCubesPromise, downloadOnsetsCardsPromise]
);
