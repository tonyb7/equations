/* EQUATIONS assets */

const EQUATIONS_CUBE_NAMES = [
    'r0.png', 'r1.png', 'r2.png', 'r3.png', 'r4.png', 'r5.png',
    'b0.png', 'b1.png', 'b2.png', 'b3.png', 'b4.png', 'b5.png',
    'g0.png', 'g1.png', 'g2.png', 'g3.png', 'g4.png', 'g5.png',
    'bk0.png', 'bk1.png', 'bk2.png', 'bk3.png', 'bk4.png', 'bk5.png',
]

const equations_assets = {};

export const downloadEquationsCubesPromise = Promise.all(EQUATIONS_CUBE_NAMES.map(downloadEquationsCube));

function downloadEquationsCube(assetName) {
    return new Promise(resolve => {
        const asset = new Image();
        asset.onload = () => {
            // console.log(`Downloaded ${assetName}`);
            equations_assets[assetName] = asset;
            resolve();
        };
        asset.src = `/static/cubes/${assetName}`;
        asset.classList.add("rounded-corners");
    });
}

const getEquationsAsset = assetName => equations_assets[assetName];

const eq_cube_color_map = new Map([
    [0, 'r'],
    [1, 'b'],
    [2, 'g'],
    [3, 'bk'],
]);

function getEquationsImageName(index, cube_index) {
    return `${eq_cube_color_map.get(Math.floor(index/6))}${cube_index[index]}.png`;
}

export function getEquationsAssetClone(index, cube_index) {
    let image_name = getEquationsImageName(index, cube_index);
    return getEquationsAsset(image_name).cloneNode(true);
}
