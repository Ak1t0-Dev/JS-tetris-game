// ----------------------------------------------------------------
// variables
// ----------------------------------------------------------------
const FIELD_COL = 10;
const FIELD_ROW = 20;
const BLOCK_SIZE = 20;
const TETROMINO_SIZE = 4;
const FIELD_W = BLOCK_SIZE * FIELD_COL;
const FIELD_H = BLOCK_SIZE * FIELD_ROW;

let can = document.getElementById("can");
let ctx = can.getContext("2d");

can.width = FIELD_W;
can.height = FIELD_H;
can.style.border = "5px solid gray";

let tetro_x = 0;
let tetro_y = 0;

let tetromino = [
    [0, 0, 0, 0],
    [0, 1, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
];

drawMino();
// ----------------------------------------------------------------
// draw a tetro mino
// ----------------------------------------------------------------
function drawMino() {
    ctx.clearRect(0, 0, FIELD_W, FIELD_H);
    for (let y = 0; y < TETROMINO_SIZE; y++) {
        for (let x = 0; x < TETROMINO_SIZE; x++) {
            if (tetromino[y][x]) {
                let px = (tetro_x + x) * BLOCK_SIZE;
                let py = (tetro_y + y) * BLOCK_SIZE;
                ctx.fillStyle = "blue";
                ctx.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = "black";
                ctx.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

// ----------------------------------------------------------------
// move tetro mino with keys
// ----------------------------------------------------------------
document.onkeydown = (e) => {
    switch (e.key) {
        case "ArrowDown": // speed up
            tetro_y++;
            break;
        case "ArrowUp": // rotate
            console.log(e.key);
            break;
        case "ArrowLeft": // move to left
            tetro_x--;
            break;
        case "ArrowRight": // move to right
            tetro_x++;
            break;
        case "Shift": // fall down
            console.log(e.key);
            break;
        default:
            console.log(e.key);
            break;
    }
    drawMino();
}