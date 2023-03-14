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
const TIMER_W = 948;
const TIMER_H = 60;
const GAME_OVER = "GAME OVER";
const PAUSE = "PAUSE";
const NEXT = "NEXT";
const LINES = "LINES";
const SCORE = "SCORE";
const TIMER = "TIMER";
const TIMER_LIMIT = 10;
const DIFFICULTY_DIFFICULT = "DIFFICULT";
const DIFFICULTY_NORMAL = "NORMAL";
const DIFFICULTY_EASY = "EASY";
const PADDING = 20;
let drop_rate = 600;
let game_over = false;
let lines = 0;
let score = 0;
let timer_end = 0;

let field = [];
let orderIndex = -1;
let tetrominoOrder = [];
let tetrominoes = [];

let tetrominoShape = 0;
let nextTetrominoShape = 0;
let tempTetrominoShape = 0;

let paused = false;

// ----------------------------------------------------------------
// canvas 
// ----------------------------------------------------------------
let can = document.getElementById("can");
let ctx = can.getContext("2d");

can.width = FIELD_W;
can.height = FIELD_H;
ctx.strokeStyle = "blue";
ctx.strokeRect(0, 0, FIELD_W, FIELD_H);
can.style.border = "4px solid gray";


// ----------------------------------------------------------------
// canvas for timer
// ----------------------------------------------------------------
let timerCan = document.getElementById("timer");
let timerCtx = timerCan.getContext("2d");
timerCan.width = TIMER_W;
timerCan.height = TIMER_H;

// ----------------------------------------------------------------
// canvas for a next tetromino, score, lines
// ----------------------------------------------------------------
let infoCan = document.getElementById("info");
let infoCtx = infoCan.getContext("2d");
infoCan.width = FIELD_W;
infoCan.height = FIELD_H;

// ----------------------------------------------------------------
// initialize a field
// ----------------------------------------------------------------
function init() {
    for (let y = 0; y < FIELD_ROW; y++) {
        field[y] = [];
        for (let x = 0; x < FIELD_COL; x++) {
            field[y][x] = 0;
        }
    }
}

// a point of clearing lines
const POINTS = [100, 300, 500, 800];

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
// let tetro_shape = Math.floor(Math.random() * (TETROMINO_SHAPES.length - 1)) + 1;
let shapesNum = TETROMINO_SHAPES.length - 1;
tetrominoes = referenceOrder();
let tetro_shape = tetrominoes[0];
let next_tetro_shape = tetrominoes[1];
let tetroMino = TETROMINO_SHAPES[tetro_shape];
let nextTetroMino = TETROMINO_SHAPES[next_tetro_shape];


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
setDifficulty();
setTimer();
init();
draw();
setInterval(() => {
    if (!paused) dropMino()
}, drop_rate);

// ----------------------------------------------------------------
// set difficulty from a given parameter
// ----------------------------------------------------------------
function setDifficulty() {
    const params = new URLSearchParams(window.location.search);
    const difficulty = params.get('difficulty');
    switch (difficulty) {
        case "DIFFICULT":
            drop_rate = 300;
            break;
        case "EASY":
            drop_rate = 800;
            break;
        default:
            break;
    }
}

// ----------------------------------------------------------------
// generate numbers of an array randomly with no duplicates
// ----------------------------------------------------------------
function generateRandomArr() {
    let array = [...Array(shapesNum)].map((_, i) => i + 1);
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ----------------------------------------------------------------
// reference the order from an array
// ----------------------------------------------------------------
function referenceOrder() {
    // first execution
    if (orderIndex === -1) {
        tetrominoOrder = generateRandomArr();
        tempTetrominoShape = tetrominoOrder[shapesNum - 1];
        orderIndex++;
    }

    // before the last index of the order array
    if (orderIndex === shapesNum - 2) {
        tetrominoShape = tetrominoOrder[orderIndex];
        nextTetrominoShape = tempTetrominoShape;
        tetrominoOrder = generateRandomArr();
        tempTetrominoShape = tetrominoOrder[shapesNum - 1];
        orderIndex++;
        return [tetrominoShape, nextTetrominoShape];

        // the last index of the order array
    } else if (orderIndex === shapesNum - 1) {
        tetrominoShape = nextTetrominoShape;
        nextTetrominoShape = tetrominoOrder[0];
        orderIndex = 0;
        return [tetrominoShape, nextTetrominoShape];

    } else {
        tetrominoShape = tetrominoOrder[orderIndex];
        nextTetrominoShape = tetrominoOrder[orderIndex + 1];
        orderIndex++;
        return [tetrominoShape, nextTetrominoShape];
    }
}

// ----------------------------------------------------------------
// draw a block
// ----------------------------------------------------------------
function drawBlock(x, y, color) {
    let px = x * BLOCK_SIZE;
    let py = y * BLOCK_SIZE;
    ctx.fillStyle = TETROMINO_COLORS[color];
    ctx.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
}

// ----------------------------------------------------------------
// draw a field and a tetromino if game is over 
// ----------------------------------------------------------------
function draw() {
    drawField();
    drawInfo();
    drawMino();

    if (game_over) {
        drawGameOver();
    }
}

// ----------------------------------------------------------------
// draw game over
// ----------------------------------------------------------------
function drawGameOver(timerId) {
    clearInterval(timerId);
    ctx.font = "40px 'Titillium Web'";
    let w = ctx.measureText(GAME_OVER).width;
    let x = FIELD_W / 2 - w / 2;
    let y = FIELD_H / 2 - 20;
    ctx.lineWidth = 4;
    ctx.strokeText(GAME_OVER, x, y);
    ctx.fillStyle = "white";
    ctx.fillText(GAME_OVER, x, y);
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
// draw a next tetromino
// ----------------------------------------------------------------
function drawNextMino() {
    for (let y = 0; y < TETROMINO_SIZE; y++) {
        for (let x = 0; x < TETROMINO_SIZE; x++) {
            if (nextTetroMino[y][x]) {
                drawNewBlock(2.5 + x, 2.5 + y, next_tetro_shape);
            }
        }
    }
}

// ----------------------------------------------------------------
// draw a next block
// ----------------------------------------------------------------
function drawNewBlock(x, y, color) {
    let px = x * BLOCK_SIZE;
    let py = y * BLOCK_SIZE;
    infoCtx.fillStyle = TETROMINO_COLORS[color];
    infoCtx.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
    infoCtx.lineWidth = 1;
    infoCtx.strokeStyle = "black";
    infoCtx.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
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
    let clearingLines = 0;
    for (let y = 0; y < FIELD_ROW; y++) {
        let boolean = true;
        for (let x = 0; x < FIELD_COL; x++) {
            if (!field[y][x]) {
                boolean = false;
                break;
            }
        }

        if (boolean) {
            clearingLines++;
            lines++;
            for (let new_y = y; new_y > 0; new_y--) {
                for (let new_x = 0; new_x < FIELD_COL; new_x++) {
                    field[new_y][new_x] = field[new_y - 1][new_x];
                }
            }
        }
    }
    if (clearingLines) {
        calculateScore(clearingLines);
    }
}

// ----------------------------------------------------------------
// calculating a score
// ----------------------------------------------------------------
function calculateScore(clearingLines) {
    score += POINTS[clearingLines - 1];
}

// ----------------------------------------------------------------
// set timer
// ----------------------------------------------------------------
function setTimer() {
    timer_end = TIMER_LIMIT * 60 * 1000;
    timerCtx.font = "bold 40px 'Titillium Web'";
    timerCtx.fillStyle = "black";
    let textSize = timerCtx.measureText(TIMER);
    let width = textSize.width;
    let textHeight = textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent;
    drawTimer(width, textHeight);

    const timerId = setInterval(() => {
        if (!paused && !game_over) {
            timerCtx.clearRect(0, 0, TIMER_W, TIMER_H);
            if (timer_end > 0) {
                timer_end = timer_end - 1000;
            } else {
                game_over = true;
                drawGameOver(timerId);
            }
            drawTimer(width, textHeight);
        }
    }, 1000);
}

// ----------------------------------------------------------------
// draw timer
// ----------------------------------------------------------------
function drawTimer(width, height) {
    // calculate the minutes and seconds
    const minutes = Math.floor(timer_end / (60 * 1000));
    const seconds = (timer_end / 1000) % 60;
    // format the time as a string 00:00
    const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    timerCtx.fillText(TIMER, PADDING, height + 20);
    timerCtx.fillText(timeString, width + 40, height + 20);
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
        tetrominoes = referenceOrder();
        tetro_shape = tetrominoes[0];
        next_tetro_shape = tetrominoes[1];
        tetroMino = TETROMINO_SHAPES[tetro_shape];
        nextTetroMino = TETROMINO_SHAPES[next_tetro_shape];
        tetro_x = START_X;
        tetro_y = (tetro_shape !== SHAPE_J_INDEX && tetro_shape !== SHAPE_L_INDEX) ? START_Y : START_Y_JL;

        if (!detectCollision(0, 0)) game_over = true;
    }
    draw();
}

// ----------------------------------------------------------------
// draw a field and a tetromino if game is over 
// ----------------------------------------------------------------
function drawPause() {
    ctx.font = "40px 'Titillium Web'";
    let w = ctx.measureText(PAUSE).width;
    let x = FIELD_W / 2 - w / 2;
    let y = FIELD_H / 2 - 20;
    ctx.lineWidth = 4;
    ctx.strokeText(PAUSE, x, y);
    ctx.fillStyle = "white";
    ctx.fillText(PAUSE, x, y);
}

// ----------------------------------------------------------------
// draw a next tetromino, a score, and lines 
// ----------------------------------------------------------------
function drawInfo() {

    infoCtx.clearRect(0, 0, 300, 600);
    let textSize;
    let textHeight;

    infoCtx.font = "bold 40px 'Titillium Web'";

    // NEXT
    let str = NEXT;
    infoCtx.fillStyle = "black";
    textSize = infoCtx.measureText(str);
    textHeight = textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent;
    infoCtx.fillText(str, PADDING, textHeight + 10);
    infoCtx.lineWidth = 3;
    infoCtx.strokeStyle = "gray";
    infoCtx.fillStyle = "#fff9d8";
    infoCtx.fillRect(PADDING, textHeight + 30, 220, 150);
    infoCtx.strokeRect(PADDING, textHeight + 30, 220, 150);
    drawNextMino();

    // SCORE
    str = SCORE;
    infoCtx.fillStyle = "black";
    infoCtx.fillText(str, PADDING, 280);
    infoCtx.fillText(score, PADDING, 330);

    // LINES
    str = LINES;
    infoCtx.fillStyle = "black";
    infoCtx.fillText(str, PADDING, 400);
    infoCtx.fillText(lines, PADDING, 450);
}

// ----------------------------------------------------------------
// move a tetro mino with keys
// ----------------------------------------------------------------
document.onkeydown = (e) => {

    if (game_over) return;

    if (e.key === "Shift") {
        paused = !paused;
        if (paused) drawPause();
    }

    if (!paused) {

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
            case "Enter": // fall down
                while (detectCollision(0, 1)) tetro_y++;
                break;
        }

        draw();
    }
}

