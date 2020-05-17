// Module to hold everything related to handling the goal canvas
// roundRect taken from https://stackoverflow.com/a/3368118/8157027
// Dragging functionality taken from https://stackoverflow.com/a/24938627/8157027
// drawRotated taken from // https://stackoverflow.com/a/17412387/8157027

let canvas = document.getElementById("goal-sector");
canvas.width = window.innerWidth * 0.33;
canvas.height = window.innerHeight * 0.09;

let BB = canvas.getBoundingClientRect();
let offsetX = BB.left;
let offsetY = BB.top;

let cube_dim = window.innerHeight * 0.06;
let cube_width = cube_dim + 3;
let cube_height = cube_dim + 2;
let cube_pos_y = canvas.height/8;

let dragok = false;
let startX;

let cubes = [];

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
        if (mx > r.x && mx < r.x + cube_width && my > cube_pos_y && my < cube_pos_y + cube_height) {
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
                r.x = Math.min(r.x + dx, canvas.width - width);
                r.x = Math.max(r.x, 4);
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
        if (mx > r.x && mx < r.x + cube_width && my > cube_pos_y && my < cube_pos_y + cube_height) {
            // if yes, set that rects isDragging=true
            r.orientation = (r.orientation + 90) % 360;
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
        var r = cubes[i];
        drawRotated(context, r.cube, r.x, cube_pos_y, cube_dim, cube_dim, r.orientation);
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
    context.drawImage(image,-width/2,-height/2, width, height);
    roundRect(context, -(width/2)-1, -(height/2)-1, width+3, height+2, 7);

    // we’re done with the rotating so restore the unrotated context
    context.restore();
}

function resizeGoalsettingCanvas() {
    canvas.width = window.innerWidth * 0.33;
    canvas.height = window.innerHeight * 0.09;

    BB = canvas.getBoundingClientRect();
    offsetX = BB.left;
    offsetY = BB.top;

    cube_dim = window.innerHeight * 0.06;
    cube_width = cube_dim + 3;
    cube_height = cube_dim + 2;
    cube_pos_y = canvas.height/8;

    // what happens to startX? if someone resizes while dragging cube...

    drawCubes();
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


// window.onload = () => {
//     let b = document.getElementById("set-goal-button");
//     b.classList.remove("hidden");

//     let cube1 = new Image();
//     cube1.src = "../static/cubes/bk0.png";
//     cube1.classList.add("goal-highlight");
//     cube1.classList.add("rounded-corners");
//     cube1.classList.add("cube-size");

//     let cube2 = new Image();
//     cube2.src = "../static/cubes/g5.png";
//     cube2.classList.add("goal-highlight");
//     cube2.classList.add("rounded-corners");
//     cube2.classList.add("cube-size");

//     let canvas = document.getElementById("goal-sector");
//     canvas.width = window.innerWidth * 0.33;
//     canvas.height = window.innerHeight * 0.09;
//     window.addEventListener("resize", () => {
//         let canvas = document.getElementById("goal-sector");
//         canvas.width = window.innerWidth * 0.33;
//         canvas.height = window.innerHeight * 0.09;
//         drawCubes();
//     });

//     canvas.onmousedown = myDown;
//     canvas.onmouseup = myUp;
//     canvas.onmousemove = myMove;
//     canvas.oncontextmenu = myRightClick;
    
//     // let cubes = [];

//     let dim = window.innerHeight * 0.06;
//     let width = dim + 3;
//     let height = dim + 2;
//     let base_x = canvas.width/100;
    

//     // let context = canvas.getContext('2d');
//     cube1.onload = () => {

//         let x = base_x;


//         // context.drawImage(cube1, x, y, dim, dim);
//         // console.log(cube1);
//         // console.log(context);

//         // context.strokeStyle = '#fff';
//         // context.lineWidth = 2.5; 
//         // // context.strokeRect(x, y, dim, dim);
//         // roundRect(context, x-1, y-1, width, height, 7);

//         cubes.push({
//             cube: cube1, 
//             x: x,
//             isDragging: false,
//             orientation: 0,
//         });

//         drawCubes();
//     }

//     cube2.onload = () => {      
//         let x = 4*base_x + width;

//         // context.drawImage(cube2, x, y, dim, dim);

//         // context.strokeStyle = '#fff';
//         // context.lineWidth = 2.5; 
//         // // context.strokeRect(x, y, dim, dim);
//         // roundRect(context, x-1, y-1, width, height, 7);

//         cubes.push({
//             cube: cube2,
//             x: x,
//             isDragging: false,
//             orientation: 90,
//         });

//         drawCubes();
//     }
// }
