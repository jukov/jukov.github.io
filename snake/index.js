import * as utils from "./utils.js";

const SIZE = 20;
const CELL_SIZE = 25;
const SPEED = 200;
const COOKIE_BEST_SCORE = "bestScore";

const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

let bgColor;
let cellColor;
let snakeColor;
let headColor;
let appleColor;

const canvas = document.getElementById("snake");
const scoreView = document.getElementById("score");
const bestView = document.getElementById("best");
const context = canvas.getContext("2d");

class Node {
    x;
    y;
    next;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

let head;

let score = 0;
let appleX = 0;
let appleY = 0;
let direction = RIGHT;
let directionQueue = [];

function draw() {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            context.fillStyle = cellColor;
            utils.roundRect(
                context,
                i * CELL_SIZE + CELL_SIZE,
                j * CELL_SIZE + CELL_SIZE,
                CELL_SIZE - 2,
                CELL_SIZE - 2,
                CELL_SIZE / 5,
                true,
                false
            );
        }
    }

    context.fillStyle = headColor;
    let snake = head;
    context.beginPath();
    circleCell(snake.x, snake.y);
    context.fill();

    context.fillStyle = snakeColor;
    snake = snake.next;
    while (snake !== undefined) {
        context.beginPath();
        circleCell(snake.x, snake.y);
        context.fill();
        snake = snake.next;
    }

    context.fillStyle = appleColor;
    context.beginPath();
    circleCell(appleX, appleY);
    context.fill();
}

function circleCell(x, y) {
    context.arc(
        x * CELL_SIZE + CELL_SIZE / 2 - 1 + CELL_SIZE,
        y * CELL_SIZE + CELL_SIZE / 2 - 1 + CELL_SIZE,
        CELL_SIZE / 2 - 2, 0, 2 * Math.PI
    )
}

document.addEventListener('keydown', (e) => {
    let lastDirection = directionQueue[directionQueue.length - 1];

    if (e.code === "ArrowUp" || e.code === "KeyW") {
        if (lastDirection != UP) {
            directionQueue.push(UP);
        }
    } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        if (lastDirection != DOWN) {
            directionQueue.push(DOWN);
        }
    } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        if (lastDirection != LEFT) {
            directionQueue.push(LEFT);
        }
    } else if (e.code === "ArrowRight" || e.code === "KeyD") {
        if (lastDirection != RIGHT) {
            directionQueue.push(RIGHT);
        }
    }
});

function moveBody(node, toX, toY) {
    let x = node.x;
    let y = node.y;
    node.x = toX;
    node.y = toY;
    if (node.next !== undefined) {
        moveBody(node.next, x, y);
    }
}

function addBody() {
    let snake = head;
    while (snake.next !== undefined) {
        snake = snake.next;
    }
    snake.next = new Node(snake.x, snake.y);
}

function isDefeat() {
    let snake = head.next;
    while (snake !== undefined) {
        if (snake.x === head.x && snake.y === head.y) {
            return true;
        }
        snake = snake.next;
    }
    return false;
}

function calc() {
    if (isDefeat()) {
        reset();
        return;
    }

    if (directionQueue.length !== 0) {
        const newDirection = directionQueue.shift();
        const leftInvalid = direction === LEFT && newDirection === RIGHT;
        const rightInvalid = direction === RIGHT && newDirection === LEFT;
        const upInvalid = direction === UP && newDirection === DOWN;
        const downInvalid = direction === DOWN && newDirection === UP;
        if (!leftInvalid && !rightInvalid && !upInvalid && !downInvalid) {
            direction = newDirection;
        }
    }

    let x = head.x;
    let y = head.y;
    if (direction === UP) {
        head.y--;
    } else if (direction === DOWN) {
        head.y++;
    } else if (direction === LEFT) {
        head.x--;
    } else if (direction === RIGHT) {
        head.x++;
    } else {
        console.error("Unexpected direction " + direction);
    }

    if (head.x < 0) {
        head.x = SIZE - 1;
    }
    if (head.x >= SIZE) {
        head.x = 0;
    }
    if (head.y < 0) {
        head.y = SIZE - 1;
    }
    if (head.y >= SIZE) {
        head.y = 0;
    }

    if (checkApple()) {
        addBody()
        newApple();
        score++;
        updateBestScore();
        scoreView.innerHTML = score;
    }

    moveBody(head.next, x, y);
}

function underSnake(x, y) {
    let snake = head;
    while (snake !== undefined) {
        if (snake.x === x && snake.y === y) {
            return true;
        } else {
            snake = snake.next;
        }
    }
    return false;
}

function newApple() {
    let x = 0;
    let y = 0;
    while (true) {
        x = Math.floor(Math.random() * SIZE);
        y = Math.floor(Math.random() * SIZE);
        if (!underSnake(x, y)) {
            break;
        }
    }
    appleX = x;
    appleY = y;
}

function reset() {
    setColors();

    head = new Node(10, 10);
    head.next = new Node(9, 10);
    head.next.next = new Node(8, 10);

    direction = RIGHT;
    directionQueue = [];

    updateBestScore();
    scoreView.innerHTML = "0";
    score = 0;

    newApple();
    draw();
}

function updateBestScore() {
    const current = utils.getCookie(COOKIE_BEST_SCORE);
    if (current == undefined || current < score) {
        utils.setCookie(COOKIE_BEST_SCORE, score, 365);
        bestView.innerHTML = score;
    }
}

function checkApple() {
    return head.x === appleX && head.y === appleY;
}

function loop() {
    calc();
    draw();
}

function setBest() {
    const current = utils.getCookie(COOKIE_BEST_SCORE);
    if (current != undefined) {
        bestView.innerHTML = current;
    }
}

function setColors() {
    const primaryHue = Math.floor(Math.random() * (360 + 1));
    const accentHue = (primaryHue + 120) % 360;
    const background = utils.hslToHex(primaryHue, 20, 50);
    const primary = utils.hslToHex(primaryHue, 60, 30);
    const primaryDark = utils.hslToHex(primaryHue, 70, 20);
    const secondary = utils.hslToHex(primaryHue, 20, 60);
    const accent = utils.hslToHex(accentHue, 50, 30);

    const text = document.getElementsByClassName("text");
    for (let i = 0; i < text.length; i++) {
        text[i].style.color = primary
    }
    const border = document.getElementsByClassName("border");
    for (let i = 0; i < border.length; i++) {
        border[i].style.borderColor = primary
    }
    document.body.style.backgroundColor = background;

    bgColor = background;
    cellColor = secondary;
    snakeColor = primary;
    headColor = primaryDark;
    appleColor = accent;

    var canvas = document.createElement('canvas');
    canvas.width = 16; canvas.height = 16;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = background;
    utils.roundRect(ctx, 0, 0, 16, 16, 6, true, false)
    var link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL("image/x-icon");
    document.getElementsByTagName('head')[0].appendChild(link);
}

setBest();
reset();
setInterval(loop, SPEED);