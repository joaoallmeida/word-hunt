const wcontainer = document.getElementsByClassName('word-container');
const gcontainer = document.getElementsByClassName('game-board-container');
const boardEl = document.getElementById('game-board');
const listEl = document.getElementById('list');
const restartBtn = document.getElementById("restart-game");
const timerBtn = document.getElementById("timer");
const themeBtn = document.getElementById("toggle-theme");
const initGameBtn = document.getElementById("init-game");
const newGameBtn = document.getElementById("new-game");

let isDragging = false, startIdx = null, cells = [], targetWords = [];
let timerInterval;
let seconds = 0;

restartBtn.hidden = true; // Hide restart button until the game starts
timerBtn.hidden   = true; // Hide timer until the game starts
newGameBtn.hidden = true; // Hide new game button until the game starts
wcontainer[0].hidden = true; // Show the initial word container (start screen)
gcontainer[0].hidden = true; // Show the initial game board container (start screen)

async function initGame() {
    const res = await fetch('http://localhost:5000/generate');
    const data = await res.json();
    targetWords = data.words;
    
    boardEl.style.gridTemplateColumns = `repeat(20, 40px)`;
        data.board.flat().forEach((letter, i) => {
            const div = document.createElement('div');
            div.className = 'cell';
            div.textContent = letter;
            div.dataset.index = i;
            boardEl.appendChild(div);
            cells.push(div);
        });

    renderWordTable(targetWords.sort((a, b) => a.localeCompare(b)));
}

function highlightLine(start, end) {
    const size = 20;
    const x1 = start % size, y1 = Math.floor(start / size);
    const x2 = end % size, y2 = Math.floor(end / size);
    const dx = x2 - x1, dy = y2 - y1;

    if (dy === 0 || dx === 0 || Math.abs(dx) === Math.abs(dy)) {
        cells.forEach(c => c.classList.remove('selecting'));
        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        for (let i = 0; i <= steps; i++) {
            const cx = x1 + (dx === 0 ? 0 : (dx/Math.abs(dx)) * i);
            const cy = y1 + (dy === 0 ? 0 : (dy/Math.abs(dy)) * i);
            cells[cy * size + cx].classList.add('selecting');
        }
    }
}

function checkSelection() {
    const selected = Array.from(document.querySelectorAll('.selecting'));
    if (selected.length === 0) return; // Safety check

    const word = selected.map(c => c.textContent).join('').toUpperCase();
    const reversedWord = word.split('').reverse().join('').toUpperCase();

    // 1. Check if either version exists in the targetWords array
    const finalWord = targetWords.find(w => w.toUpperCase() === word || w.toUpperCase() === reversedWord);

    if (finalWord) {
        // 2. Mark cells as found
        selected.forEach(c => { 
            c.classList.replace('selecting', 'found'); 
        });

        // 3. Mark word in the side table (The "Fix")
        // We use lowerCase and trim to ensure the ID matches your renderWordTable function
        const wordElement = document.getElementById(`word-${finalWord.toLowerCase().trim()}`);
        
        if (wordElement) {
            wordElement.classList.add('found');
        }
    } else {
        // No match? Just clean up the selection
        selected.forEach(c => c.classList.remove('selecting'));
    }
}

function renderWordTable(targetWords) {
  const tableEl = document.getElementById('word-table');
  if (!tableEl) return;
  
  tableEl.innerHTML = ''; // Clear existing content

  // We use a DocumentFragment to minimize browser reflows (better performance)
  const fragment = document.createDocumentFragment();

  targetWords.forEach(word => {
    const wordDiv = document.createElement('div');
    wordDiv.className = 'word-item';
    // Ensure the ID handles spaces or special characters if necessary
    wordDiv.id = `word-${word.toLowerCase()}`; 
    wordDiv.textContent = word.toUpperCase(); // Better for word searches
    
    fragment.appendChild(wordDiv);
  });

  tableEl.appendChild(fragment);
}

function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    timerBtn.textContent = `⏱️ ${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerBtn.textContent = "⏱️ 00:00";
}

boardEl.addEventListener('mousedown', e => {
    if (!e.target.dataset.index) return;
    isDragging = true;
    startIdx = parseInt(e.target.dataset.index);
});

window.addEventListener('mousemove', e => {
    if (!isDragging || !e.target.dataset?.index) return;
    const endIdx = parseInt(e.target.dataset.index);
    highlightLine(startIdx, endIdx);
});

window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    checkSelection();
});

themeBtn.addEventListener("click", () => {
  // We toggle 'light-theme' because the CSS is dark by default
  const isLight = document.body.classList.toggle("light-theme");
  // Update button text based on the NEW state
  themeBtn.textContent = isLight 
    ? "🌙" 
    : "☀️";
});

timerBtn.addEventListener('click', () => {
  // Simple toggle logic
  if (!timerInterval) {
    startTimer();
  } else {
    stopTimer();
    timerInterval = null; // Reset so it can start again
  }
});

restartBtn.addEventListener("click", () => {
  // Clear board & words
  stopTimer();
  seconds = 0; // Reset seconds for a fresh start

  document.getElementById("game-board").innerHTML = "";
  document.getElementById("word-table").innerHTML = "";

  // Call your existing game init function
  if (typeof initGame === "function") {
    initGame();
    startTimer(); // Restart the clock immediately for a fresh game
  } else {
    location.reload(); // fallback
  }
});

initGameBtn.addEventListener("click", () => {

  restartBtn.hidden = false; // Show restart button once the game starts
  timerBtn.hidden = false; // Show timer once the game starts
  newGameBtn.hidden = false; // Show new game button once the game starts
  wcontainer[0].hidden = false; // Show the word container
  gcontainer[0].hidden = false; // Show the game board container

  // 3. Initialize the game logic
  if (typeof initGame === "function") {
    initGame();
    startTimer(); // Start the clock only when they actually play
    initGameBtn.hidden = true; // Hide the start button after starting
  }
}
);

newGameBtn.addEventListener("click", () => {
  // Clear board & words
  stopTimer();
  seconds = 0; // Reset seconds for a fresh start

  document.getElementById("game-board").innerHTML = "";
  document.getElementById("word-table").innerHTML = "";

  // Call your existing game init function
  if (typeof initGame === "function") {
    initGame();
    startTimer(); // Restart the clock immediately for a fresh game
  } else {
    location.reload(); // fallback
  }
});