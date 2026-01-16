const startMenu = document.getElementById('start-menu');
const gameScreen = document.getElementById('game-screen');
const pickXBtn = document.getElementById('pick-x');
const pickOBtn = document.getElementById('pick-o');
const newGameBtn = document.getElementById('new-game-btn');
const cells = document.querySelectorAll('.board-cell');
const turnIcon = document.getElementById('turn-icon');
const playerScoreEl = document.getElementById('player-score');
const tieScoreEl = document.getElementById('tie-score');
const cpuScoreEl = document.getElementById('cpu-score');
const playerScoreLabel = document.getElementById('player-score-label');
const cpuScoreLabel = document.getElementById('cpu-score-label');
const resultModal = document.getElementById('result-modal');
const restartModal = document.getElementById('restart-modal');
const modalResultText = document.getElementById('modal-result-text');
const modalWinnerAnnouncement = document.getElementById('modal-winner-announcement');
const quitBtn = document.getElementById('quit-btn');
const nextRoundBtn = document.getElementById('next-round-btn');
const restartBtn = document.getElementById('restart-btn');
const cancelRestartBtn = document.getElementById('cancel-restart-btn');
const confirmRestartBtn = document.getElementById('confirm-restart-btn');
const difficultyBtns = document.querySelectorAll('.difficulty-buttons .btn');
const thinkingIndicator = document.getElementById('thinking-indicator');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'x'; 
let playerSymbol = 'x';
let cpuSymbol = 'o';
let isGameOver = false;
let scores = { player: 0, tie: 0, cpu: 0 };
let difficulty = 'easy';
const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]             
];

pickXBtn.addEventListener('click', () => selectSymbol('x'));
pickOBtn.addEventListener('click', () => selectSymbol('o'));
difficultyBtns.forEach(btn => btn.addEventListener('click', () => selectDifficulty(btn.dataset.difficulty)));
newGameBtn.addEventListener('click', startGame);

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
    cell.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && handleCellClick(e));
});
restartBtn.addEventListener('click', () => showModal(restartModal));

cancelRestartBtn.addEventListener('click', () => hideModal(restartModal));
confirmRestartBtn.addEventListener('click', () => { hideModal(restartModal); resetBoard(); });
quitBtn.addEventListener('click', () => {
    hideModal(resultModal);
    startMenu.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    scores = { player: 0, tie: 0, cpu: 0 }; 
    updateScoreboard();
});
nextRoundBtn.addEventListener('click', () => { hideModal(resultModal); resetBoard(); });

function selectSymbol(symbol) {
    playerSymbol = symbol;
    cpuSymbol = (symbol === 'x') ? 'o' : 'x';
    pickXBtn.classList.toggle('active', symbol === 'x');
    pickOBtn.classList.toggle('active', symbol === 'o');
    cells.forEach(cell => {
        cell.classList.remove('x-hover', 'o-hover');
        cell.classList.add(`${playerSymbol}-hover`);
    });
}


function selectDifficulty(level) {
    difficulty = level;
    difficultyBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.difficulty === level));
}

function startGame() {
    startMenu.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    playerScoreLabel.textContent = `${playerSymbol.toUpperCase()} (YOU)`;
    cpuScoreLabel.textContent = `${cpuSymbol.toUpperCase()} (CPU)`;
    resetBoard();
}

function resetBoard() {
    board.fill('');
    isGameOver = false;
    currentPlayer = 'x';
    cells.forEach(cell => {
        cell.className = 'board-cell'; 
        cell.innerHTML = `<i></i>`;
        cell.classList.add(`${playerSymbol}-hover`);
        cell.setAttribute('aria-label', 'Empty');
        cell.setAttribute('tabindex', '0');
    });
    updateTurnIndicator();
    if (currentPlayer === cpuSymbol) {
        triggerCpuMove();
    }
}

function handleCellClick(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    if (board[index] !== '' || isGameOver || currentPlayer !== playerSymbol) {
        return;
    }
    makeMove(index, playerSymbol);
    if (!isGameOver) {
        switchTurn();
        triggerCpuMove();
    }
}

function makeMove(index, symbol) {
    if (board[index] !== '' || isGameOver) return;
    board[index] = symbol;

    const cell = cells[index];
    cell.classList.add(symbol, 'show');
    cell.innerHTML = `<i class="bi bi-${symbol === 'x' ? 'x-lg' : 'circle'}"></i>`;
    cell.setAttribute('aria-label', `Cell marked as ${symbol.toUpperCase()}`);
    cell.setAttribute('tabindex', '-1');

    if (checkWin(symbol)) {
        endGame(false, symbol);
    } else if (board.every(cell => cell !== '')) {
        endGame(true); // Draw
    }
}

function switchTurn() {
    currentPlayer = (currentPlayer === 'x') ? 'o' : 'x';
    updateTurnIndicator();
}

function endGame(isDraw, winner = null) {
    isGameOver = true;
    if (!isDraw && winner) {
        const winPattern = winPatterns.find(pattern => pattern.every(index => board[index] === winner));
        winPattern.forEach(index => cells[index].classList.add('win-line'));
    }
    setTimeout(() => showResult(isDraw, winner), 750);
}

function updateTurnIndicator() {
    turnIcon.className = `bi bi-${currentPlayer === 'x' ? 'x-lg' : 'circle'}`;
}

function showResult(isDraw, winner) {
    if (isDraw) {
        scores.tie++;
        modalResultText.textContent = '';
        modalWinnerAnnouncement.innerHTML = `<h2 class="tie-color">ROUND TIED</h2>`;
    } else {
        const winnerIsPlayer = winner === playerSymbol;
        winnerIsPlayer ? scores.player++ : scores.cpu++;
        modalResultText.textContent = winnerIsPlayer ? 'Hurray! YOU WON' : 'OH NO, YOU LOST...';
        modalWinnerAnnouncement.innerHTML = `
            <i class="icon-winner bi bi-${winner === 'x' ? 'x-lg' : 'circle'}"></i>
            <h2 class="${winner}-win-color">TAKES THE ROUND</h2>`;
        modalWinnerAnnouncement.querySelector('.icon-winner').style.color = 
            winner === 'x' ? 'var(--clr-light-blue)' : 'var(--clr-light-yellow)';
    }
    updateScoreboard();
    showModal(resultModal);
}

function updateScoreboard() {
    playerScoreEl.textContent = scores.player;
    tieScoreEl.textContent = scores.tie;
    cpuScoreEl.textContent = scores.cpu;
}

const showModal = (modal) => modal.classList.add('show');
const hideModal = (modal) => modal.classList.remove('show');


function triggerCpuMove() {
    if (isGameOver) return;
    thinkingIndicator.classList.add('visible');
    const delay = getDynamicDelay(difficulty);
    
    setTimeout(() => {
        thinkingIndicator.classList.remove('visible');
        const move = getComputerMove();
        if (move !== null) {
            makeMove(move, cpuSymbol);
            if (!isGameOver) {
                switchTurn();
            }
        }
    }, delay);
}

function getDynamicDelay(level) {
    switch(level) {
        case 'easy': return Math.random() * 600 + 400;   
        case 'hard': return Math.random() * 1200 + 800;  
        case 'medium':
        default:     return Math.random() * 1000 + 600; 
    }
}

function getComputerMove() {
    switch (difficulty) {
        case 'easy': return getEasyMove();
        case 'medium': return getMediumMove();
        case 'hard': return getHardMove();
        default: return getRandomMove();
    }
}

const getEmptyCells = () => board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
const checkWin = (symbol) => winPatterns.some(pattern => pattern.every(index => board[index] === symbol));
const getRandomMove = () => {
    const emptyCells = getEmptyCells();
    return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : null;
};

function findWinningMove(symbol) {
    for (const index of getEmptyCells()) {
        board[index] = symbol;
        if (checkWin(symbol)) {
            board[index] = ''; return index;
        }
        board[index] = '';
    }
    return null;
}

function findForkMove(symbol) {
    const emptyCells = getEmptyCells();
    if (emptyCells.length < 5) return null; 

    for (const index of emptyCells) {
        board[index] = symbol;
        let winOpportunities = 0;
        for(const nextIndex of getEmptyCells()) {
            board[nextIndex] = symbol;
            if(checkWin(symbol)) winOpportunities++;
            board[nextIndex] = '';
        }
        board[index] = '';
        if (winOpportunities >= 2) return index;
    }
    return null;
}

function getEasyMove() {
    let blockMove = findWinningMove(playerSymbol);
    if (blockMove !== null) return blockMove;
    if (Math.random() < 0.20) { 
         let winMove = findWinningMove(cpuSymbol);
         if (winMove !== null) return winMove;
    }
    return getRandomMove();
}
selectSymbol('x');