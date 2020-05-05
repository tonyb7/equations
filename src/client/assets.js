// Taken from https://github.com/vzhou842/example-.io-game/blob/master/src/client/assets.js

const ASSET_NAMES = [
    'r0.png', 'r1.png', 'r2.png', 'r3.png', 'r4.png', 'r5.png',
    'b0.png', 'b1.png', 'b2.png', 'b3.png', 'b4.png', 'b5.png',
    'g0.png', 'g1.png', 'g2.png', 'g3.png', 'g4.png', 'g5.png',
    'bk0.png', 'bk1.png', 'bk2.png', 'bk3.png', 'bk4.png', 'bk5.png',
]

const assets = {};

const downloadPromise = Promise.all(ASSET_NAMES.map(downloadAsset));

function downloadAsset(assetName) {
    return new Promise(resolve => {
        const asset = new Image();
        asset.onload = () => {
            console.log(`Downloaded ${assetName}`);
            assets[assetName] = asset;
            resolve();
        };
        asset.src = `/static/cubes/${assetName}`;
        asset.classList.add("rounded-corners");
    });
}

export const downloadAssets = () => downloadPromise;

export const getAsset = assetName => assets[assetName];

