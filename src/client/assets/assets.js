// Taken from https://github.com/vzhou842/example-.io-game/blob/master/src/client/assets.js

import { downloadEquationsCubesPromise, getEquationsAssetClone } from "./equations";
import { downloadOnsetsCubesPromise, downloadOnsetsCardsPromise, getOnsetsCubeAssetClone } from "./onsets";

// Download all assets regardless of what game type...since game type is not known
// at the time when this function is currently called...
export const downloadAssets = () => Promise.all(
    [downloadEquationsCubesPromise, downloadOnsetsCubesPromise, downloadOnsetsCardsPromise]
);

export const gametype_to_asset_cloner_map = new Map([
    ["eq", getEquationsAssetClone],
    ["os", getOnsetsCubeAssetClone],
]);
