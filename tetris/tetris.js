const CELL = 30;
const COLS = 10;
const ROWS = 20;

const PIECES = [
    { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: '#00BFBF' }, // I
    { shape: [[1,1],[1,1]],                              color: '#BFBF00' }, // O
    { shape: [[0,1,0],[1,1,1],[0,0,0]],                  color: '#9900CC' }, // T
    { shape: [[0,1,1],[1,1,0],[0,0,0]],                  color: '#00AA00' }, // S
    { shape: [[1,1,0],[0,1,1],[0,0,0]],                  color: '#CC0000' }, // Z
    { shape: [[1,0,0],[1,1,1],[0,0,0]],                  color: '#0044CC' }, // J
    { shape: [[0,0,1],[1,1,1],[0,0,0]],                  color: '#CC6600' }, // L
];

const canvas    = document.getElementById('board');
const ctx       = canvas.getContext('2d');
const nextCvs   = [...document.querySelectorAll('.next-canvas')];
const nextCtxs  = nextCvs.map(c => c.getContext('2d'));
const scoreEl   = document.getElementById('score');
const levelEl   = document.getElementById('level');
const linesEl   = document.getElementById('lines');
const overlay   = document.getElementById('overlay');
const oTitle    = document.getElementById('overlay-title');
const oSub      = document.getElementById('overlay-sub');

let board, bag, nextQueue, current;
let score, level, lines;
let dropCounter, lastTime;
let paused, gameOver, animId;

// ─── Board ──────────────────────────────────────────────────────────────────

function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// ─── Bag randomizer ─────────────────────────────────────────────────────────

function refillBag() {
    bag = [0, 1, 2, 3, 4, 5, 6];
    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
    }
}

function nextPiece() {
    if (bag.length === 0) refillBag();
    const p = PIECES[bag.pop()];
    return { shape: p.shape.map(r => [...r]), color: p.color };
}

// ─── Piece logic ─────────────────────────────────────────────────────────────

function spawnPiece() {
    current = nextQueue.shift();
    nextQueue.push(nextPiece());
    current.x = Math.floor(COLS / 2) - Math.floor(current.shape[0].length / 2);
    current.y = 0;
    if (collides(current.shape, current.x, current.y)) {
        triggerGameOver();
    }
}

function collides(shape, ox, oy) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (!shape[r][c]) continue;
            const x = ox + c, y = oy + r;
            if (x < 0 || x >= COLS || y >= ROWS) return true;
            if (y >= 0 && board[y][x]) return true;
        }
    }
    return false;
}

function rotateCW(shape) {
    const rows = shape.length, cols = shape[0].length;
    const out = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            out[c][rows - 1 - r] = shape[r][c];
    return out;
}

function tryRotate(dir) {
    let newShape = current.shape;
    const times = dir === 1 ? 1 : 3;
    for (let i = 0; i < times; i++) newShape = rotateCW(newShape);
    for (const kick of [0, 1, -1, 2, -2]) {
        if (!collides(newShape, current.x + kick, current.y)) {
            current.shape = newShape;
            current.x += kick;
            return;
        }
    }
}

function lock() {
    for (let r = 0; r < current.shape.length; r++) {
        for (let c = 0; c < current.shape[r].length; c++) {
            if (!current.shape[r][c]) continue;
            const y = current.y + r;
            if (y < 0) { triggerGameOver(); return; }
            board[y][current.x + c] = current.color;
        }
    }
    clearLines();
    spawnPiece();
}

function clearLines() {
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            board.splice(r, 1);
            board.unshift(Array(COLS).fill(0));
            cleared++;
            r++;
        }
    }
    if (cleared === 0) return;
    const pts = [0, 100, 300, 500, 800][cleared] * level;
    score += pts;
    lines += cleared;
    level = Math.floor(lines / 10) + 1;
    scoreEl.textContent = score;
    levelEl.textContent = level;
    linesEl.textContent = lines;
}

function ghostY() {
    let gy = current.y;
    while (!collides(current.shape, current.x, gy + 1)) gy++;
    return gy;
}

function moveLeft()  { if (!collides(current.shape, current.x - 1, current.y)) current.x--; }
function moveRight() { if (!collides(current.shape, current.x + 1, current.y)) current.x++; }

function softDrop() {
    if (!collides(current.shape, current.x, current.y + 1)) {
        current.y++;
        score++;
        scoreEl.textContent = score;
        dropCounter = 0;
    }
}

function hardDrop() {
    const gy = ghostY();
    score += (gy - current.y) * 2;
    scoreEl.textContent = score;
    current.y = gy;
    lock();
}

function getDropInterval() {
    return Math.max(80, 1000 - (level - 1) * 100);
}

// ─── Drawing ─────────────────────────────────────────────────────────────────

function drawBlock(c2d, px, py, color, alpha) {
    c2d.globalAlpha = alpha ?? 1;
    c2d.fillStyle = color;
    c2d.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
    c2d.fillStyle = 'rgba(255,255,255,0.22)';
    c2d.fillRect(px + 1, py + 1, CELL - 2, 4);
    c2d.fillRect(px + 1, py + 1, 4, CELL - 2);
    c2d.fillStyle = 'rgba(0,0,0,0.28)';
    c2d.fillRect(px + 1, py + CELL - 5, CELL - 2, 4);
    c2d.fillRect(px + CELL - 5, py + 1, 4, CELL - 2);
    c2d.globalAlpha = 1;
}

function drawPieceSmall(nctx, nc, piece) {
    nctx.fillStyle = '#0a0a0a';
    nctx.fillRect(0, 0, nc.width, nc.height);

    const S = 18;
    let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
    piece.shape.forEach((row, r) => row.forEach((cell, c) => {
        if (cell) { minR = Math.min(minR, r); maxR = Math.max(maxR, r); minC = Math.min(minC, c); maxC = Math.max(maxC, c); }
    }));

    const bw = (maxC - minC + 1) * S;
    const bh = (maxR - minR + 1) * S;
    const startX = Math.floor((nc.width  - bw) / 2);
    const startY = Math.floor((nc.height - bh) / 2);

    piece.shape.forEach((row, r) => row.forEach((cell, c) => {
        if (!cell) return;
        const px = startX + (c - minC) * S;
        const py = startY + (r - minR) * S;
        nctx.fillStyle = piece.color;
        nctx.fillRect(px + 1, py + 1, S - 2, S - 2);
        nctx.fillStyle = 'rgba(255,255,255,0.22)';
        nctx.fillRect(px + 1, py + 1, S - 2, 3);
        nctx.fillRect(px + 1, py + 1, 3, S - 2);
    }));
}

function draw() {
    // Background
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(COLS * CELL, r * CELL); ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
        ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, ROWS * CELL); ctx.stroke();
    }

    // Locked board
    for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
            if (board[r][c]) drawBlock(ctx, c * CELL, r * CELL, board[r][c]);

    // Ghost
    const gy = ghostY();
    for (let r = 0; r < current.shape.length; r++)
        for (let c = 0; c < current.shape[r].length; c++)
            if (current.shape[r][c] && gy + r !== current.y + r)
                drawBlock(ctx, (current.x + c) * CELL, (gy + r) * CELL, current.color, 0.18);

    // Current piece
    for (let r = 0; r < current.shape.length; r++)
        for (let c = 0; c < current.shape[r].length; c++)
            if (current.shape[r][c])
                drawBlock(ctx, (current.x + c) * CELL, (current.y + r) * CELL, current.color);

    // Next queue
    nextCtxs.forEach((nctx, i) => drawPieceSmall(nctx, nextCvs[i], nextQueue[i]));
}

// ─── Overlay ─────────────────────────────────────────────────────────────────

function showOverlay(title, sub) {
    oTitle.textContent = title;
    oSub.textContent = sub;
    overlay.classList.remove('hidden');
}

function hideOverlay() {
    overlay.classList.add('hidden');
}

function triggerGameOver() {
    gameOver = true;
    showOverlay('GAME OVER', `Score: ${score}  —  Enter для рестарта`);
}

function togglePause() {
    paused = !paused;
    if (paused) {
        showOverlay('ПАУЗА', 'P / Esc для продолжения');
    } else {
        hideOverlay();
        lastTime = performance.now();
    }
}

// ─── Game loop ───────────────────────────────────────────────────────────────

function update(time = 0) {
    animId = requestAnimationFrame(update);
    if (gameOver || paused) return;

    const delta = time - lastTime;
    lastTime = time;

    dropCounter += delta;
    if (dropCounter >= getDropInterval()) {
        dropCounter = 0;
        if (!collides(current.shape, current.x, current.y + 1)) {
            current.y++;
        } else {
            lock();
        }
    }

    draw();
}

// ─── Input ───────────────────────────────────────────────────────────────────

const DAS_DELAY = 150;
const ARR_RATE  = 45;
const dasTimers = {};

function clearDAS(code) {
    clearTimeout(dasTimers[code + '_d']);
    clearInterval(dasTimers[code + '_a']);
}

function startDAS(code) {
    clearDAS(code);
    dasTimers[code + '_d'] = setTimeout(() => {
        dasTimers[code + '_a'] = setInterval(() => {
            if (!paused && !gameOver) { handleMovement(code); draw(); }
        }, ARR_RATE);
    }, DAS_DELAY);
}

function handleMovement(code) {
    switch (code) {
        case 'ArrowLeft':  moveLeft();  break;
        case 'ArrowRight': moveRight(); break;
        case 'ArrowDown':  softDrop();  break;
    }
}

document.addEventListener('keydown', e => {
    if (e.repeat) return;

    if (e.code === 'Enter') {
        if (gameOver) init();
        return;
    }
    if (e.code === 'KeyP' || e.code === 'Escape') {
        if (!gameOver) togglePause();
        return;
    }
    if (paused || gameOver) return;

    switch (e.code) {
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowDown':
            handleMovement(e.code);
            draw();
            startDAS(e.code);
            break;
        case 'ArrowUp':
        case 'KeyX':
            tryRotate(1); draw();
            break;
        case 'KeyZ':
            tryRotate(-1); draw();
            break;
        case 'Space':
            e.preventDefault();
            hardDrop(); draw();
            break;
    }
});

document.addEventListener('keyup', e => {
    clearDAS(e.code);
});

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
    if (animId) cancelAnimationFrame(animId);

    board       = createBoard();
    bag         = [];
    refillBag();
    nextQueue   = [nextPiece(), nextPiece(), nextPiece()];
    score       = 0;
    level       = 1;
    lines       = 0;
    dropCounter = 0;
    lastTime    = 0;
    paused      = false;
    gameOver    = false;

    scoreEl.textContent = '0';
    levelEl.textContent = '1';
    linesEl.textContent = '0';
    hideOverlay();

    spawnPiece();
    animId = requestAnimationFrame(update);
}

showOverlay('TETRIS', 'Enter для старта');
gameOver = true;

document.addEventListener('keydown', function startOnEnter(e) {
    if (e.code === 'Enter') {
        document.removeEventListener('keydown', startOnEnter);
        init();
    }
}, { capture: true });
