const GRID_SIZE = 8;
const CELL_SIZE = 42;

const SHAPES_DATA = [
    { shape: [[1]], color: '#FF3366' },
    { shape: [[1, 1]], color: '#33CCFF' },
    { shape: [[1], [1]], color: '#FF9933' },
    { shape: [[1, 1, 1]], color: '#33FF99' },
    { shape: [[1], [1], [1]], color: '#CC33FF' },
    { shape: [[1, 1], [1, 1]], color: '#FFFF33' },
    { shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: '#FF3333' },
    { shape: [[1, 0], [1, 1]], color: '#3366FF' },
    { shape: [[1, 1, 1], [1, 0, 0], [1, 0, 0]], color: '#FF66CC' },
    { shape: [[1, 1, 1], [0, 1, 0]], color: '#00FF00' }
];

let grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
let usableBlocks = [];
let previewBlocks = [];
let score = 0;
let highScore = localStorage.getItem('blockGameHighScore') || 0;

// 新增：連擊追蹤變數
let currentCombo = 0;

let draggingData = null;
let dragClone = null;
let currentPreviewTarget = null;

function getRandomShape() {
    return SHAPES_DATA[Math.floor(Math.random() * SHAPES_DATA.length)];
}

function init() {
    usableBlocks = [];
    previewBlocks = [];
    currentCombo = 0; // 初始化連擊
    for (let i = 0; i < 3; i++) {
        usableBlocks.push(getRandomShape());
        previewBlocks.push(getRandomShape());
    }
    renderBoard();
    renderBlocks();
}

function updateScore(points) {
    score += points;
    document.getElementById('score').innerText = score;
}

function renderBoard(previewTarget = null, previewShape = null) {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            if (grid[r][c]) {
                cell.style.backgroundColor = grid[r][c];
            }

            if (previewTarget && previewShape) {
                const shapeArr = previewShape.shape;
                const dr = r - previewTarget.r;
                const dc = c - previewTarget.c;
                if (dr >= 0 && dr < shapeArr.length && dc >= 0 && dc < shapeArr[0].length) {
                    if (shapeArr[dr][dc]) {
                        cell.style.backgroundColor = previewShape.color;
                        cell.style.opacity = '0.5';
                    }
                }
            }
            boardEl.appendChild(cell);
        }
    }
}

function createShapeElement(blockData, type, index, isNew = false) {
    const container = document.createElement('div');
    container.className = 'shape-container';
    if (isNew) container.classList.add('slide-in');

    if (type === 'usable' && blockData) {
        container.onpointerdown = (e) => startDrag(e, index, blockData, container);
    }

    if (blockData) {
        const miniShape = document.createElement('div');
        miniShape.className = 'mini-shape';
        miniShape.style.gridTemplateColumns = `repeat(${blockData.shape[0].length}, 20px)`;

        blockData.shape.forEach(row => {
            row.forEach(val => {
                const minicell = document.createElement('div');
                minicell.className = 'mini-cell';
                if (val) minicell.style.backgroundColor = blockData.color;
                miniShape.appendChild(minicell);
            });
        });
        container.appendChild(miniShape);
    }
    return container;
}

function renderBlocks(animateLast = false) {
    const usableArea = document.getElementById('usable-area');
    const previewArea = document.getElementById('preview-area');
    usableArea.innerHTML = '';
    previewArea.innerHTML = '';

    usableBlocks.forEach((data, i) => {
        const isNew = animateLast && i === usableBlocks.length - 1;
        usableArea.appendChild(createShapeElement(data, 'usable', i, isNew));
    });
    previewBlocks.forEach((data, i) => {
        const isNew = animateLast && i === previewBlocks.length - 1;
        previewArea.appendChild(createShapeElement(data, 'preview', i, isNew));
    });
}

function startDrag(e, index, blockData, sourceEl) {
    draggingData = { index, blockData };
    dragClone = sourceEl.cloneNode(true);
    dragClone.className = 'drag-clone';
    document.body.appendChild(dragClone);
    sourceEl.style.opacity = '0';
    moveClone(e.clientX, e.clientY);
}

function moveClone(x, y) {
    if (!dragClone) return;
    dragClone.style.left = `${x}px`;
    dragClone.style.top = `${y}px`;
}

function getSnappingTarget(shapeArr, mouseX, mouseY) {
    const boardEl = document.getElementById('board');
    const rect = boardEl.getBoundingClientRect();
    const c = Math.floor((mouseX - rect.left) / CELL_SIZE);
    const r = Math.floor((mouseY - rect.top) / CELL_SIZE);

    const offsets = [[0, 0], [0, -1], [-1, 0], [1, 0], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]];

    for (let [dr, dc] of offsets) {
        if (isValidPlacement(shapeArr, r + dr, c + dc)) {
            return { r: r + dr, c: c + dc };
        }
    }
    return null;
}

function onDragMove(e) {
    if (!draggingData) return;
    moveClone(e.clientX, e.clientY);
    const target = getSnappingTarget(draggingData.blockData.shape, e.clientX, e.clientY);

    if (!currentPreviewTarget || !target || currentPreviewTarget.r !== target.r || currentPreviewTarget.c !== target.c) {
        currentPreviewTarget = target;
        renderBoard(target, draggingData.blockData);
    }
}

function onDragEnd(e) {
    if (!draggingData) return;

    if (currentPreviewTarget) {
        placeShape(currentPreviewTarget.r, currentPreviewTarget.c, draggingData.blockData);

        usableBlocks.splice(draggingData.index, 1);
        usableBlocks.push(previewBlocks.shift());
        previewBlocks.push(getRandomShape());

        renderBlocks(true);
        setTimeout(checkGameOver, 100);
    } else {
        renderBlocks();
        renderBoard();
    }

    if (dragClone) dragClone.remove();
    dragClone = null;
    draggingData = null;
    currentPreviewTarget = null;
}

function isValidPlacement(shape, startR, startC) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                const boardR = startR + r;
                const boardC = startC + c;
                if (boardR < 0 || boardR >= GRID_SIZE || boardC < 0 || boardC >= GRID_SIZE) return false;
                if (grid[boardR][boardC] !== null) return false;
            }
        }
    }
    return true;
}

function placeShape(r, c, blockData) {
    let blocksPlaced = 0;
    for (let sr = 0; sr < blockData.shape.length; sr++) {
        for (let sc = 0; sc < blockData.shape[sr].length; sc++) {
            if (blockData.shape[sr][sc]) {
                grid[r + sr][c + sc] = blockData.color;
                blocksPlaced++;
            }
        }
    }
    // 放上去的基本分數
    updateScore(blocksPlaced);

    // 檢查消除
    clearLines();
    renderBoard();
}

function clearLines() {
    let rowsToClear = [];
    let colsToClear = [];

    for (let r = 0; r < GRID_SIZE; r++) {
        if (grid[r].every(val => val !== null)) rowsToClear.push(r);
    }
    for (let c = 0; c < GRID_SIZE; c++) {
        if (grid.every(row => row[c] !== null)) colsToClear.push(c);
    }

    const cellsToClear = new Set();
    rowsToClear.forEach(r => {
        for (let c = 0; c < GRID_SIZE; c++) cellsToClear.add(`${r},${c}`);
    });
    colsToClear.forEach(c => {
        for (let r = 0; r < GRID_SIZE; r++) cellsToClear.add(`${r},${c}`);
    });

    let linesCleared = rowsToClear.length + colsToClear.length;

    if (linesCleared > 0) {
        currentCombo++; // 增加連擊數

        // 分數計算：每條線10分 * 連擊倍率
        let clearPoints = linesCleared * 10 * currentCombo;
        updateScore(clearPoints);

        // 觸發連擊動畫 (Combo大於1才顯示)
        if (currentCombo > 1) {
            showComboAnimation(currentCombo);
        }

        // 觸發碎裂動畫與清空邏輯陣列
        cellsToClear.forEach(pos => {
            const [r, c] = pos.split(',').map(Number);
            createShatterParticles(r, c, grid[r][c]);
            grid[r][c] = null;
        });
    } else {
        // 沒有消除，連擊中斷
        currentCombo = 0;
    }
}

// 新增：顯示連擊浮動文字
function showComboAnimation(comboCount) {
    const comboEl = document.createElement('div');
    comboEl.className = 'combo-text';
    comboEl.innerText = `Combo x${comboCount}!`;
    document.body.appendChild(comboEl);

    // 動畫結束後移除 DOM
    setTimeout(() => comboEl.remove(), 1200);
}

function createShatterParticles(r, c, color) {
    const boardRect = document.getElementById('board').getBoundingClientRect();
    const cellX = boardRect.left + c * CELL_SIZE + 2;
    const cellY = boardRect.top + r * CELL_SIZE + 2;
    const offsets = [[0, 0], [20, 0], [0, 20], [20, 20]];

    offsets.forEach(([dx, dy]) => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.backgroundColor = color;
        particle.style.left = `${cellX + dx}px`;
        particle.style.top = `${cellY + dy}px`;

        const tx = (Math.random() - 0.5) * 100 + 'px';
        const ty = (Math.random() * 100 + 150) + 'px';
        const rot = (Math.random() * 360 - 180) + 'deg';

        particle.style.setProperty('--tx', tx);
        particle.style.setProperty('--ty', ty);
        particle.style.setProperty('--rot', rot);

        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 600);
    });
}

function checkGameOver() {
    let canPlaceAny = false;
    for (const block of usableBlocks) {
        if (!block) continue;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (isValidPlacement(block.shape, r, c)) {
                    canPlaceAny = true;
                    break;
                }
            }
            if (canPlaceAny) break;
        }
        if (canPlaceAny) break;
    }

    if (!canPlaceAny) {
        showGameOver();
    }
}

function showGameOver() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('blockGameHighScore', highScore);
    }
    document.getElementById('final-score').innerText = score;
    document.getElementById('high-score').innerText = highScore;
    document.getElementById('game-over').classList.remove('hidden');
}

// 重新開始時也要重置連擊數
document.getElementById('restart-btn').addEventListener('click', () => {
    grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
    score = 0;
    currentCombo = 0;
    updateScore(0);
    document.getElementById('game-over').classList.add('hidden');
    init();
});

document.addEventListener('pointermove', onDragMove);
document.addEventListener('pointerup', onDragEnd);
init();