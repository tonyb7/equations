// Module to hold everything related to handling the goal canvas
// roundRect taken from https://stackoverflow.com/a/3368118/8157027
// Dragging functionality taken from https://stackoverflow.com/a/24938627/8157027
// drawRotated taken from // https://stackoverflow.com/a/17412387/8157027

import { gametype_to_asset_cloner_map } from './assets/assets';
import { hideGoalSettingButtons } from './board/board';
import { socket } from './networking';

let canvas;
let BB;
let offsetX;
let offsetY;

let cube_dim;
let cube_width;
let cube_height;
let init_cube_pos_y;

let dragok = false;
let startX;
let startY;

let gametype = 'eq'; // default value

const CANVAS_WIDTH_PROP_EQ = 0.33;
const CANVAS_HEIGHT_PROP_EQ = 0.09;

const CANVAS_WIDTH_PROP_OS = 0.2; // lower to make cube wider
const CANVAS_HEIGHT_PROP_OS = 0.18; // lower to make cube taller

let cubes = [];

export function initializeGoalsetting(game) {
    if (game['game_started']) {
        initializeGoalsettingGlobals(game['gametype']);
        if (game['goalset']) {
            hideGoalSettingButtons();
        }
    }
}

export function initializeGoalsettingGlobals(gametype_in) {
    gametype = gametype_in;

    canvas = document.getElementById("goal-sector");
    setCanvasDimensions(gametype_in);

    BB = canvas.getBoundingClientRect();
    offsetX = BB.left;
    offsetY = BB.top;

    setDimensionGlobals(gametype_in);
}

function setCanvasDimensions(gametype_in) {
    if (gametype_in === 'eq') {
        canvas.width = window.innerWidth * CANVAS_WIDTH_PROP_EQ;
        canvas.height = window.innerHeight * CANVAS_HEIGHT_PROP_EQ;
    }
    else if (gametype_in === 'os') {
        canvas.width = window.innerWidth * CANVAS_WIDTH_PROP_OS;
        canvas.height = window.innerHeight * CANVAS_HEIGHT_PROP_OS;
    }
}

function setDimensionGlobals(gametype_in) {
    if (gametype_in === 'eq') {
        cube_dim = canvas.width * 0.1;
        cube_width = cube_dim + 3;
        cube_height = cube_dim + 2;
        init_cube_pos_y = canvas.height / 8;
    }
    else if (gametype_in === 'os') { 
        // I don't think these are making a difference...
        cube_dim = canvas.width * 0.2;
        cube_width = cube_dim;
        cube_height = cube_dim + 10;
        init_cube_pos_y = canvas.height / 4;
    }
}

function isWithinCube(r, mouseX, mouseY) {
    return mouseX > r.cube_pos_x && mouseX < r.cube_pos_x + cube_width && 
           mouseY > r.cube_pos_y && mouseY < r.cube_pos_y + cube_height;
}

function getBoundedXPos(x_pos) {
    x_pos = Math.min(x_pos, canvas.width - cube_width);
    x_pos = Math.max(x_pos, 4);
    return x_pos;
}

function getBoundedYPos(y_pos) {
    // console.log("initial y_pos=", y_pos);
    // console.log("canvas.height=", canvas.height);
    // console.log("cube_height=", cube_height);
    y_pos = Math.min(y_pos, canvas.height - cube_height);
    // console.log("after first bound: ", y_pos);
    y_pos = Math.max(y_pos, 4);
    // console.log("after second bound: ", y_pos);
    return y_pos;
}

// Draw a rounded border around an image on the Canvas
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === 'undefined') {
        stroke = true;
    }
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    if (typeof radius === 'number') {
        radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
        var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
        for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
        }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}

function mouseDown(e) {
    // console.log("mouse down");

    e.preventDefault();
    e.stopPropagation();

    let mx = parseInt(e.clientX - offsetX);
    let my = parseInt(e.clientY - offsetY);

    // test each rect to see if mouse is inside
    dragok = false;
    for (var i = cubes.length - 1; i >= 0; i--) {
        var r = cubes[i];
        if (isWithinCube(r, mx, my)) {
            // if yes, set that rects isDragging=true
            dragok = true;
            r.isDragging = true;
            break;
        }
    }

    // save the current mouse position
    startX = mx;
    startY = my;
}

function mouseUp(e) {
    // console.log("mouse up");

    e.preventDefault();
    e.stopPropagation();

    dragok = false;
    for (var i = 0; i < cubes.length; i++) {
        if (cubes[i].isDragging) {
            cubes[i].isDragging = false;
            socket.emit("xy_pos_update", {
                "order": i, 
                "x_pos_per_mille": cubes[i].cube_pos_x/(canvas.width/1000),
                "y_pos_per_mille": cubes[i].cube_pos_y/(canvas.height/1000),
            });
            return;
        }
    }
}

function mouseMove(e) {
    // if we're dragging anything...
    if (dragok) {
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // get the current mouse position
        var mx = parseInt(e.clientX - offsetX);
        var my = parseInt(e.clientY - offsetY);

        // calculate the distance the mouse has moved
        // since the last mousemove
        var dx = mx - startX;
        var dy = my - startY;

        // move each rect that isDragging 
        // by the distance the mouse has moved
        // since the last mousemove
        for (var i = 0; i < cubes.length; i++) {
            var r = cubes[i];
            if (r.isDragging) {
                r.cube_pos_x = getBoundedXPos(r.cube_pos_x + dx);
                r.cube_pos_y = getBoundedYPos(r.cube_pos_y + dy);
                break;
            }
        }

        // redraw the scene with the new rect positions
        drawCubes();

        // reset the starting mouse position for the next mousemove
        startX = mx;
        startY = my;
    }
}

function mouseRightClick(e) {

    e.preventDefault();
    e.stopPropagation();
    
    let mx = parseInt(e.clientX - offsetX);
    let my = parseInt(e.clientY - offsetY);

    for (var i = cubes.length - 1; i >= 0; i--) {
        var r = cubes[i];
        if (isWithinCube(r, mx, my)) {
            // if yes, set that rects isDragging=true
            r.orientation = (r.orientation + 90) % 360;
            socket.emit("orientation_update", {
                "order": i, 
                "orientation": r.orientation
            });
            break;
        }
    }

    drawCubes();

    return false;
}

// clear the canvas
function clear(context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCubes() {
    if (!canvas) {
        initializeGoalsettingGlobals(gametype);
    }

    let context = canvas.getContext('2d');
    clear(context);

    context.strokeStyle = '#fff';
    context.lineWidth = 2.5; 

    // redraw each rect in the rects[] array
    for (var i = 0; i < cubes.length; i++) {
        let r = cubes[i];
        // console.log("Calling draw rotated on ", r);
        drawRotated(context, r.cube, r.cube_pos_x, r.cube_pos_y,
                    cube_dim, cube_dim, r.orientation);
    }
}

function drawRotated(context, image, x, y, width, height, degrees) {
    // save the unrotated context of the canvas so we can restore it later
    // the alternative is to untranslate & unrotate after drawing
    context.save();

    // move to the center of image
    context.translate(x + width/2, y + height/2);

    // rotate the canvas to the specified degrees
    context.rotate(degrees*Math.PI/180);

    // draw the image
    // since the context is rotated, the image will be rotated also
    // console.log("Drawing the image!");
    context.drawImage(image,-width/2,-height/2, width, height);
    roundRect(context, -(width/2)-1, -(height/2)-1, width+3, height+2, 7);

    // we’re done with the rotating so restore the unrotated context
    context.restore();
}

export function resizeGoalsettingCanvas(e) {
    // console.log("resize function called");

    e.preventDefault();
    e.stopPropagation();

    let old_canvas_width = canvas.width;
    let old_canvas_height = canvas.height;
    setCanvasDimensions(gametype);

    BB = canvas.getBoundingClientRect();
    offsetX = BB.left;
    offsetY = BB.top;

    setDimensionGlobals(gametype);

    // what happens to startX? what if someone resizes window while dragging cube?

    updateCubesXYPos(old_canvas_width, old_canvas_height);
    drawCubes();
}

function updateCubesXYPos(old_canvas_width, old_canvas_height) {
    for (var i = 0; i < cubes.length; i++) {
        // console.log("OLD: ", cubes[i].cube_pos_x/(old_canvas_width/1000));
        cubes[i].cube_pos_x = getBoundedXPos(cubes[i].cube_pos_x * (canvas.width / old_canvas_width));
        cubes[i].cube_pos_y = getBoundedYPos(cubes[i].cube_pos_y * (canvas.height / old_canvas_height));
        // Emit here because goal line might not look the same after resize
        // due to getBoundedXPos
        socket.emit("xy_pos_update", {
            "order": i, 
            "x_pos_per_mille": cubes[i].cube_pos_x/(canvas.width/1000),
            "y_pos_per_mille": cubes[i].cube_pos_y/(canvas.height/1000),
        });
        // console.log("NEW: ", cubes[i].cube_pos_x/(canvas.width/1000));
    }
}

export function registerGoalsettingCanvas() {
    canvas.onmousedown = mouseDown;
    canvas.onmouseup = mouseUp;
    canvas.onmousemove = mouseMove;
    canvas.oncontextmenu = mouseRightClick;
};

export function deregisterGoalsettingCanvas() {
    canvas.onmousedown = () => {};
    canvas.onmouseup = () => {};
    canvas.onmousemove = () => {};
    canvas.oncontextmenu = () => {};
};

export function initializeGoalCanvas(gametype, game_info, cube_idx) {
    window.onresize = resizeGoalsettingCanvas;

    for (let cube_info of game_info) {
        let image_cloner = gametype_to_asset_cloner_map.get(gametype);
        let image = image_cloner(cube_info['idx'], cube_idx);

        image.onload = drawCubes;

        let x_pos = getBoundedXPos(cube_info['x'] * canvas.width/1000);
        let y_pos = init_cube_pos_y;
        // console.log("y_pos: ", y_pos);
        // console.log("cube_info: ", cube_info);
        if ('y' in cube_info) { // for backwards compat. with games already in the db
            // console.log("GoT here");
            y_pos = getBoundedYPos(cube_info['y'] * canvas.width/1000);
            // console.log("new y_pos ", y_pos);
        }

        cubes.push({
            order: cubes.length,  // index within the cubes array 
            idx: cube_info['idx'],
            cube: image_cloner(cube_info['idx'], cube_idx),
            cube_pos_x: x_pos,
            cube_pos_y: y_pos,
            isDragging: false,
            orientation: cube_info['orientation'],
        });
    }
}

export function clearGoalCanvas() {
    // https://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
    cubes.length = 0; // clear the array 
    drawCubes();
}

export function addCubeToGoal(idx, cube_image) {
    let x_pos = canvas.width / 100;
    if (cubes.length !== 0) {
        x_pos += cubes.length * ((3 * x_pos) + cube_width);
    }
    let y_pos = init_cube_pos_y;

    let order = cubes.length;
    cubes.push({
        order: order,
        idx: idx,
        cube: cube_image.cloneNode(true),
        cube_pos_x: x_pos,
        cube_pos_y: y_pos,
        isDragging: false,
        orientation: 0,
    });

    cube_image.remove();
    socket.emit("xy_pos_update", {
        "order": order, 
        "x_pos_per_mille": x_pos/(canvas.width/1000),
        "y_pos_per_mille": y_pos/(canvas.height/1000),
    });
    drawCubes();
}

export function updateGoalline(type, i, new_val) {
    if (type === "xy_pos") {
        cubes[i].cube_pos_x = getBoundedXPos(new_val[0] * (canvas.width/1000));
        cubes[i].cube_pos_y = getBoundedYPos(new_val[1] * (canvas.height/1000));
    }
    else if (type === "orientation") {
        cubes[i].orientation = new_val;
    }
    drawCubes();
}
