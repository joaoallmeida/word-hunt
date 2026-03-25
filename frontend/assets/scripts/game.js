const wcontainer  = document.getElementsByClassName('word-container');
const gcontainer  = document.getElementsByClassName('game-board-container');
const boardEl     = document.getElementById('game-board');
const listEl      = document.getElementById('list');
const themeBtn    = document.getElementById("toggle-theme");
const timerBtn    = document.getElementById("timer");
const initGameBtn = document.getElementById("init-game");
const newGameBtn  = document.getElementById("new-game");
const hintBtn     = document.getElementById("hint-button");

let isDragging = false, startIdx = null, cells = [], targetWords = [];
let gameHints = [];
let timerInterval;
let seconds = 0;

async function initGame() {
    const res = await fetch('http://0.0.0.0:5000/generate');
    const data = await res.json();
    targetWords = data.words;
    gameHints = data.hints || [];

    boardEl.style.gridTemplateColumns = `repeat(40, var(--cell-size, 30px))`;
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

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}

function highlightLine(start, end) {
    const size = 40;
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
  const randomColor = getRandomColor(); // generate color for this word
  console.log('Random Color:', randomColor); // Debug log
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
          c.style.backgroundColor = randomColor; // apply color
          c.style.borderColor = randomColor; // optional: match border color to background
      });

      // 3. Mark word in the side table (The "Fix")
      // We use lowerCase and trim to ensure the ID matches your renderWordTable function
      const wordElement = document.getElementById(`word-${finalWord.toLowerCase().trim()}`);

      if (wordElement) {
        wordElement.classList.add('found');
        wordElement.style.color = randomColor; // optional: match the color
        selected.forEach(c => c.classList.remove('hint'));
      }

  } else {
      // No match? Just clean up the selection
      selected.forEach(c => c.classList.remove('selecting'));
  }

  // 4. Optional: Check for game completion here if needed
  const allWordsFound = Array.from(document.querySelectorAll('.word-item')).every(el => el.classList.contains('found'));
  if (allWordsFound) {
    stopTimer();
    Swal.fire({
      title: 'Parabéns!',
      theme: 'auto',
      html: `Você encontrou todas as palavras em <b>${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}</b>.`,
      iconHtml: '<img width="48" height="48" src="assets/images/trophy_icon.png" alt="prize"/>',
      icon: 'success',
      confirmButtonText: 'Jogar Novamente',
      showCloseButton: true,
      customClass: {
        icon: 'no-border' // A custom CSS class to remove the default border
      }
    }).then(() => {
      // Reset the game when they click "Jogar Novamente"
      newGameBtn.click();
    });
  }
}

function renderWordTable(targetWords, columns = 4) {
  const tableEl = document.getElementById('word-table');
  if (!tableEl) return;

  tableEl.innerHTML = '';

  for (let i = 0; i < targetWords.length; i += columns) {
    const row = document.createElement('div');
    row.className = 'word-row';

    targetWords.slice(i, i + columns).forEach(word => {
    const cell = document.createElement('div');
    cell.className = 'word-item';
    cell.id = `word-${word.toLowerCase()}`;
    cell.textContent = word.toUpperCase();
      row.appendChild(cell);
  });

    tableEl.appendChild(row);
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    timerBtn.innerHTML = `<img src="assets/images/clock_icon.png" alt="Icon" width="24" height="24">&nbsp;&nbsp;${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

boardEl.addEventListener('pointerdown', e => {
    if (!e.target.dataset.index) return;
    e.target.releasePointerCapture(e.pointerId);
    isDragging = true;
    startIdx = parseInt(e.target.dataset.index);
});

window.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target || !target.dataset || !target.dataset.index) return;
    const endIdx = parseInt(target.dataset.index);
    highlightLine(startIdx, endIdx);
});

window.addEventListener('pointerup', () => {
    if (!isDragging) return;
    isDragging = false;
    checkSelection();
});

// keep session unless closed or clicking new game.
window.addEventListener("beforeunload", function (event) {
  event.preventDefault();
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

initGameBtn.addEventListener("click", () => {

  timerBtn.classList.remove("hidden");
  newGameBtn.classList.remove("hidden");
  hintBtn.classList.remove("hidden");
  wcontainer[0].classList.remove("hidden")
  gcontainer[0].classList.remove("hidden")

  initGameBtn.classList.add("hidden");

  // 3. Initialize the game logic
  if (typeof initGame === "function") {
    initGame();
    startTimer(); // Start the clock only when they actually play
  }

}
);

hintBtn.addEventListener("click", () => {
  for (let i = 0; i < gameHints.length; i++) {
    const hint = gameHints[i];
    const cell = cells[hint.index];
    if (cell && !cell.classList.contains('found') && !cell.classList.contains('hint')) {
      cell.classList.add('hint');
      break;
    }
  }
});

newGameBtn.addEventListener("click", () => {

  Swal.fire({
      title: 'Novo Jogo',
      theme: 'auto',
      html: `Tem certeza que deseja iniciar um novo jogo? Seu progresso atual será perdido.`,
      // iconHtml: '<img width="48" height="48" src="assets/images/question_icon_01.png" alt="question"/>',
      icon: 'question',
      confirmButtonText: 'Iniciar Novo Jogo',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      customClass: {
        icon: 'no-border' // A custom CSS class to remove the default border
    }
  }).then((result) => {

    if (!result.isConfirmed) return; // If they cancel, do nothing

    // Stop timer
    stopTimer();
    seconds = 0;
    timerBtn.innerHTML = `<img src="assets/images/clock_icon.png" alt="Icon" width="24" height="24">&nbsp;&nbsp;00:00`;

    // Clear board & words
    boardEl.innerHTML = "";
    cells = [];
    targetWords = [];
    gameHints = [];
    startIdx = null;

    // Reset word list
    document.getElementById("word-table").innerHTML = "";

    // Start new game
    initGameBtn.click();

  });

});
