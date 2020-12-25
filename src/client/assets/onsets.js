/* ON-SETS assets */

const ONSETS_CUBE_NAMES = [
    'c0.png', 'c1.png', 'c2.png', 'c3.png', 'c4.png', 'c5.png', // colors
    'r0.png', 'r1.png', 'r2.png', 'r3.png', 'r4.png', 'r5.png', // operations
    'b0.png', 'b1.png', 'b2.png', 'b3.png', 'b4.png', 'b5.png', // restrictions
    'n0.png', 'n1.png', 'n2.png', 'n3.png', 'n4.png', 'n5.png', // digits
]

const ONSETS_CARD_NAMES = [
    'card00.png', 'card01.png', 'card02.png', 'card03.png', 
    'card04.png', 'card05.png', 'card06.png', 'card07.png',
    'card08.png', 'card09.png', 'card10.png', 'card11.png',
    'card12.png', 'card13.png', 'card14.png', 'card15.png',
]

const onsets_assets = {}

export const downloadOnsetsCubesPromise = Promise.all(ONSETS_CUBE_NAMES.map(downloadOnsetsCube));

function downloadOnsetsCube(assetName) {
    return new Promise(resolve => {
        const asset = new Image();
        asset.onload = () => {
            // console.log(`Downloaded onsets cube ${assetName}`);
            onsets_assets[assetName] = asset;
            resolve();
        };
        asset.src = `/static/onsets/onsets-cubes/${assetName}`;
        asset.classList.add("rounded-corners");
    });
}

export const downloadOnsetsCardsPromise = Promise.all(ONSETS_CARD_NAMES.map(downloadOnsetsCard));

function downloadOnsetsCard(assetName) {
    return new Promise(resolve => {
        const asset = new Image();
        asset.onload = () => {
            // console.log(`Downloaded onsets card ${assetName}`);
            onsets_assets[assetName] = asset;
            resolve();
        };
        asset.src = `/static/onsets/onsets-cards/${assetName}`;
        asset.classList.add("rounded-corners");
    });
}

const getOnsetsAsset = assetName => onsets_assets[assetName];

// Convention defined by me:
// First 8 in cube index define color cubes
// Next 4 define operation cubes
// Next 3 define restriction cubes
// Next 3 define digit cubes
// Last 6 are unused
function getOnsetsImageName(index, cube_index) {
    if (index < 8) {
        return `c${cube_index[index]}.png`; // color cube
    }
    if (index < 12) {
        return `r${cube_index[index]}.png`; // operation cube
    }
    if (index < 15) {
        return `b${cube_index[index]}.png`; // restriction cube
    }
    if (index < 18) {
        return `n${cube_index[index]}.png`; // digit cube
    }
    console.log("ERROR: Out of bounds access to onsets cube_index at index ", index);
}

export function getOnsetsCubeAssetClone(index, cube_index) {
    let image_name = getOnsetsImageName(index, cube_index);
    return getOnsetsAsset(image_name).cloneNode(true);
}

export function getOnsetsCardAssetClone(cardName) {
    return getOnsetsAsset(cardName).cloneNode(true);
}
