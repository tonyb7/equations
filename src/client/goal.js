// Module to hold everything related to handling the goal canvas
// roundRect taken from https://stackoverflow.com/a/3368118/8157027
// Dragging functionality taken from https://stackoverflow.com/a/24938627/8157027
// drawRotated taken from // https://stackoverflow.com/a/17412387/8157027

import { getEquationsAssetClone } from './assets';
import { hideGoalSettingButtons, renderGoal } from './board';
import { socket } from './networking';

let canvas;
let BB;
let offsetX;
let offsetY;

let cube_dim;
let cube_width;
let cube_height;
let cube_pos_y;

let dragok = false;
let startX;

let cubes = [];

export function initializeGoalsetting(game) {
    if (game['game_started']) {
        if (game['gametype'] == 'eq') {
            initializeGoalsettingGlobals();
            if (game['goalset']) {
                hideGoalSettingButtons();
            }
        }
        else if (game['gametype'] == 'os') {
            // TODO ONSETS

        }
    }
}

export function initializeGoalsettingGlobals() {
    canvas = document.getElementById("goal-sector");
    canvas.width = window.innerWidth * 0.33;
    canvas.height = window.innerHeight * 0.09;

    BB = canvas.getBoundingClientRect();
    offsetX = BB.left;
    offsetY = BB.top;

    cube_dim = canvas.width * 0.1;
    cube_width = cube_dim + 3;
    cube_height = cube_dim + 2;

    cube_pos_y = canvas.height/8;
}

function isWithinCube(r, mouseX, mouseY) {
    return mouseX > r.cube_pos_x && mouseX < r.cube_pos_x + cube_width && 
           mouseY > cube_pos_y && mouseY < cube_pos_y + cube_height;
}

function getBoundedXPos(x_pos) {
    x_pos = Math.min(x_pos, canvas.width - cube_width);
    x_pos = Math.max(x_pos, 4);
    return x_pos;
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
    console.log("mouse down");

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
}

function mouseUp(e) {
    console.log("mouse up");

    e.preventDefault();
    e.stopPropagation();

    dragok = false;
    for (var i = 0; i < cubes.length; i++) {
        if (cubes[i].isDragging) {
            cubes[i].isDragging = false;
            socket.emit("x_pos_update", {
                "order": i, 
                "x_pos_per_mille": cubes[i].cube_pos_x/(canvas.width/1000)
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

        // calculate the distance the mouse has moved
        // since the last mousemove
        var dx = mx - startX;

        // move each rect that isDragging 
        // by the distance the mouse has moved
        // since the last mousemove
        for (var i = 0; i < cubes.length; i++) {
            var r = cubes[i];
            if (r.isDragging) {
                r.cube_pos_x = getBoundedXPos(r.cube_pos_x + dx);
                break;
            }
        }

        // redraw the scene with the new rect positions
        drawCubes();

        // reset the starting mouse position for the next mousemove
        startX = mx;
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
    let context = canvas.getContext('2d');
    clear(context);

    context.strokeStyle = '#fff';
    context.lineWidth = 2.5; 

    // redraw each rect in the rects[] array
    for (var i = 0; i < cubes.length; i++) {
        let r = cubes[i];
        console.log("Calling draw rotated on ", r);
        drawRotated(context, r.cube, r.cube_pos_x, cube_pos_y, 
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
    console.log("Drawing the image!");
    context.drawImage(image,-width/2,-height/2, width, height);
    roundRect(context, -(width/2)-1, -(height/2)-1, width+3, height+2, 7);

    // we’re done with the rotating so restore the unrotated context
    context.restore();
}

export function resizeGoalsettingCanvas(e) {
    console.log("resize function called");

    e.preventDefault();
    e.stopPropagation();

    let old_canvas_width = canvas.width;
    canvas.width = window.innerWidth * 0.33;
    canvas.height = window.innerHeight * 0.09;

    BB = canvas.getBoundingClientRect();
    offsetX = BB.left;
    offsetY = BB.top;

    cube_dim = canvas.width * 0.1;
    cube_width = cube_dim + 3;
    cube_height = cube_dim + 2;
    cube_pos_y = canvas.height/8;

    // what happens to startX? what if someone resizes window while dragging cube?

    updateCubeXPos(old_canvas_width);
    drawCubes();
}

function updateCubeXPos(old_canvas_width) {
    for (var i = 0; i < cubes.length; i++) {
        console.log("OLD: ", cubes[i].cube_pos_x/(old_canvas_width/1000));
        cubes[i].cube_pos_x = getBoundedXPos(cubes[i].cube_pos_x * (canvas.width / old_canvas_width));
        // Emit here because goal line might not look the same after resize
        // due to getBoundedXPos
        socket.emit("x_pos_update", {
            "order": i, 
            "x_pos_per_mille":cubes[i].cube_pos_x/(canvas.width/1000),
        });
        console.log("NEW: ", cubes[i].cube_pos_x/(canvas.width/1000));
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

export function initializeGoalCanvas(game_info, cube_idx) {
    window.onresize = resizeGoalsettingCanvas;

    for (let cube_info of game_info) {
        let image = getEquationsAssetClone(cube_info['idx'], cube_idx);
        image.onload = drawCubes;
        cubes.push({
            order: cubes.length,  // index within the cubes array 
            idx: cube_info['idx'],
            cube: getEquationsAssetClone(cube_info['idx'], cube_idx),
            cube_pos_x: getBoundedXPos(cube_info['x'] * canvas.width/1000),
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

    let order = cubes.length;
    cubes.push({
        order: order,
        idx: idx,
        cube: cube_image.cloneNode(true),
        cube_pos_x: x_pos,
        isDragging: false,
        orientation: 0,
    });

    cube_image.remove();
    socket.emit("x_pos_update", {
        "order": order, 
        "x_pos_per_mille": x_pos/(canvas.width/1000),
    });
    drawCubes();
}

export function updateGoalline(type, i, new_val) {
    if (type === "x_pos") {
        cubes[i].cube_pos_x = getBoundedXPos(new_val * (canvas.width/1000));
    }
    else if (type === "orientation") {
        cubes[i].orientation = new_val;
    }
    drawCubes();
}
