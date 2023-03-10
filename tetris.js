// ----------------------------------------------------------------
// variables
// ----------------------------------------------------------------
const FIELD_COL = 10;
const FIELD_ROW = 20;
const BLOCK_SIZE = 30;
const TETROMINO_SIZE = 4;
const FIELD_W = BLOCK_SIZE * FIELD_COL;
const FIELD_H = BLOCK_SIZE * FIELD_ROW;
const SHAPE_J_INDEX = 6;
const SHAPE_L_INDEX = 7;
let drop_rate = 800;
let game_over = false;

let orderIndex = 0;
let tetrominoOrder = [];

// ----------------------------------------------------------------
// canvas 
// ----------------------------------------------------------------
let can = document.getElementById("can");
let ctx = can.getContext("2d");

can.width = FIELD_W;
can.height = FIELD_H;
can.style.border = "5px solid gray";

// ----------------------------------------------------------------
// tetris settings
// ----------------------------------------------------------------
// game over flag

// initialize a field
let field = [];
function init() {
    for (let y = 0; y < FIELD_ROW; y++) {
        field[y] = [];
        for (let x = 0; x < FIELD_COL; x++) {
            field[y][x] = 0;
        }
    }
}

// a color of tetro minoes
const TETROMINO_COLORS = [
    "#000000", // BLANK (make it easier to use indexes from 1)
    "#32c7ef", // SHAPE: I => lightblue
    "#f7d307", // SHAPE: O => yellow
    "#ad4d9c", // SHAPE: T => purple
    "#41b642", // SHAPE: S => green
    "#ef1f29", // SHAPE: Z => red
    "#5a65ad", // SHAPE: J => dark blue
    "#ef7921", // SHAPE: L => orange
]

// a shape of tetro minoes
const TETROMINO_SHAPES = [
    // BLANK (make it easier to use indexes from 1)
    [],
    // SHAPE: I
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    // SHAPE: O
    [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    // SHAPE: T
    [
        [0, 0, 0, 0],
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    // SHAPE: S
    [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
    ],
    // SHAPE: Z
    [
        [0, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    // SHAPE: J
    [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    // SHAPE: L
    [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
];

// a shape of tetro minoes
let tetro_shape = Math.floor(Math.random() * (TETROMINO_SHAPES.length - 1)) + 1;
let tetroMino = TETROMINO_SHAPES[tetro_shape];

// the start position of a tetro mino
const START_X = (FIELD_COL - TETROMINO_SIZE) / 2;
const START_Y = -1;
const START_Y_JL = 0;

// a coordinate of a tetro mino
let tetro_x = START_X;
let tetro_y = (tetro_shape !== SHAPE_J_INDEX && tetro_shape !== SHAPE_L_INDEX) ? START_Y : START_Y_JL;

// ----------------------------------------------------------------
// call functions
// ----------------------------------------------------------------
init();
draw();
setInterval(dropMino, drop_rate);

// ----------------------------------------------------------------
// generate numbers of an array randomly with no duplicates
// ----------------------------------------------------------------
function generateRandomArr() {
    let num = TETROMINO_SHAPES.length - 1;
    let array = [...Array(num)].map((_, i) => i + 1);
    for (let i = array.length - 1; i <= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ----------------------------------------------------------------
// reference the order from an array
// ----------------------------------------------------------------
function referenceOrderArr() {
    if (orderIndex === 0 || orderIndex === 6) {
        orderIndex = 0;
        tetrominoOrder = generateRandomArr();
    }
    let tetroMinoIndex = tetrominoOrder[orderIndex];
    orderIndex++;
    return tetroMinoIndex;
}

// ----------------------------------------------------------------
// draw a block
// ----------------------------------------------------------------
function drawBlock(x, y, color) {
    let px = x * BLOCK_SIZE;
    let py = y * BLOCK_SIZE;
    ctx.fillStyle = TETROMINO_COLORS[color];
    ctx.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = "black";
    ctx.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
}

// ----------------------------------------------------------------
// draw a field and a tetromino if game is over 
// ----------------------------------------------------------------
function draw() {
    drawField();
    drawMino();

    if (game_over) {
        let s = "GAME OVER";
        ctx.font = "40px 'Titillium Web'";
        let w = ctx.measureText(s).width;
        let x = FIELD_W / 2 - w / 2;
        let y = FIELD_H / 2 - 20;
        ctx.lineWidth = 4;
        ctx.strokeText(s, x, y);
        ctx.fillStyle = "white";
        ctx.fillText(s, x, y);
    }
}

// ----------------------------------------------------------------
// draw a field
// ----------------------------------------------------------------
function drawField() {
    ctx.clearRect(0, 0, FIELD_W, FIELD_H);
    for (let y = 0; y < FIELD_ROW; y++) {
        for (let x = 0; x < FIELD_COL; x++) {
            if (field[y][x]) {
                drawBlock(x, y, field[y][x]);
            }
        }
    }
}

// ----------------------------------------------------------------
// draw a tetromino
// ----------------------------------------------------------------
function drawMino() {
    for (let y = 0; y < TETROMINO_SIZE; y++) {
        for (let x = 0; x < TETROMINO_SIZE; x++) {
            if (tetroMino[y][x]) {
                drawBlock(tetro_x + x, tetro_y + y, tetro_shape);
            }
        }
    }
}

// ----------------------------------------------------------------
// collision detection
// ----------------------------------------------------------------
function detectCollision(detect_x, detect_y, newMino) {
    if (!newMino) newMino = tetroMino;
    for (let y = 0; y < TETROMINO_SIZE; y++) {
        for (let x = 0; x < TETROMINO_SIZE; x++) {

            if (newMino[y][x]) {
                let next_x = tetro_x + detect_x + x;
                let next_y = tetro_y + detect_y + y;

                if (next_y < 0 ||
                    next_x < 0 ||
                    next_y >= FIELD_ROW ||
                    next_x >= FIELD_COL ||
                    field[next_y][next_x]
                ) return false;
            }
        }
    }
    return true;
}

// ----------------------------------------------------------------
// rotate a tetromino
// ----------------------------------------------------------------
function rotate() {
    let rotateMino = [];
    for (let y = 0; y < TETROMINO_SIZE; y++) {
        rotateMino[y] = [];
        for (let x = 0; x < TETROMINO_SIZE; x++) {
            rotateMino[y][x] = tetroMino[TETROMINO_SIZE - x - 1][y];
        }
    }
    return rotateMino;
}

// ----------------------------------------------------------------
// freeze a tetromino
// ----------------------------------------------------------------
function freezeMino() {
    for (let y = 0; y < TETROMINO_SIZE; y++) {
        for (let x = 0; x < TETROMINO_SIZE; x++) {
            if (tetroMino[y][x]) {
                field[tetro_y + y][tetro_x + x] = tetro_shape;
            }
        }
    }
}

// ----------------------------------------------------------------
// line clear
// ----------------------------------------------------------------
function lineClear() {
    let lineCount = 0;
    for (let y = 0; y < FIELD_ROW; y++) {
        let boolean = true;
        for (let x = 0; x < FIELD_COL; x++) {
            if (!field[y][x]) {
                boolean = false;
                break;
            }
        }
        // 
        if (boolean) {
            lineCount++;
            for (let new_y = y; new_y > 0; new_y--) {
                for (let new_x = 0; new_x < FIELD_COL; new_x++) {
                    field[new_y][new_x] = field[new_y - 1][new_x];
                }
            }
        }
    }
}

// ----------------------------------------------------------------
// drop a tetromino
// ----------------------------------------------------------------
function dropMino() {

    if (game_over) return;

    if (detectCollision(0, 1)) {
        tetro_y++;
    } else {
        freezeMino();
        lineClear();
        tetro_shape = Math.floor(Math.random() * (TETROMINO_SHAPES.length - 1)) + 1;
        tetroMino = TETROMINO_SHAPES[tetro_shape];
        tetro_x = START_X;
        tetro_y = (tetro_shape !== SHAPE_J_INDEX && tetro_shape !== SHAPE_L_INDEX) ? START_Y : START_Y_JL;

        if (!detectCollision(0, 0)) game_over = true;
    }
    draw();
}

// ----------------------------------------------------------------
// move tetro mino with keys
// ----------------------------------------------------------------
document.onkeydown = (e) => {

    if (game_over) return;

    switch (e.key) {
        case "ArrowDown": // speed up
            if (detectCollision(0, 1)) tetro_y++;
            break;
        case "ArrowUp": // rotate
            let rotateMino = rotate();
            if (detectCollision(0, 1, rotateMino)) tetroMino = rotateMino;
            break;
        case "ArrowLeft": // move to left
            if (detectCollision(-1, 0)) tetro_x--;
            break;
        case "ArrowRight": // move to right
            if (detectCollision(1, 0)) tetro_x++;
            break;
        case "Shift": // fall down
            break;
    }

    draw();
}