const wcontainer  = document.getElementsByClassName('word-container');
const gcontainer  = document.getElementsByClassName('game-board-container');
const boardEl     = document.getElementById('game-board');
const listEl      = document.getElementById('list');
const themeBtn    = document.getElementById("toggle-theme");
const timerBtn    = document.getElementById("timer");
const initGameBtn = document.getElementById("init-game");
const newGameBtn  = document.getElementById("new-game");
const hintBtn     = document.getElementById("hint-button");
const instructionsBtn = document.getElementById("instructions-button");

let isDragging = false, startIdx = null, cells = [], targetWords = [];
let gameHints = [];
let timerInterval;
let seconds = 0;
let currentDifficulty = 'medium';
let currentTheme = 'random';
let boardWidth = 40;

async function initGame() {
    currentDifficulty = document.getElementById('difficulty-select').value;
    currentTheme = document.getElementById('theme-select').value;
    const res = await fetch(`/generate?difficulty=${currentDifficulty}&theme=${currentTheme}`);
    const data = await res.json();
    targetWords = data.words;
    gameHints = data.hints || [];
    boardWidth = data.width || 40;

    boardEl.style.gridTemplateColumns = `repeat(${boardWidth}, var(--cell-size, 30px))`;
    data.board.flat().forEach((letter, i) => {
        const div = document.createElement('div');
        div.className = 'cell';
        div.textContent = letter;
        div.dataset.index = i;
        boardEl.appendChild(div);
        cells.push(div);
    });

    const wContainer = document.querySelector('.word-container');
    requestAnimationFrame(() => {
        wContainer.style.maxWidth = boardEl.offsetWidth + 'px';
        wContainer.style.width = '100%';
        wContainer.style.margin = '2rem auto';
    });

    renderWordTable(targetWords.sort((a, b) => a.localeCompare(b)));
}

function getRandomColor() {
  // Use the golden angle to generate distinct hues sequentially
  if (typeof getRandomColor.currentHue === 'undefined') {
    getRandomColor.currentHue = Math.floor(Math.random() * 360);
  }
  getRandomColor.currentHue = (getRandomColor.currentHue + 137.5) % 360;
  return `hsl(${Math.floor(getRandomColor.currentHue)}, 80%, 60%)`; 
}

function highlightLine(start, end) {
    const size = boardWidth;
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
          c.style.background = `linear-gradient(135deg, ${randomColor} 0%, ${randomColor} 100%)`; // apply color
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

    // Local leaderboard logic
    let bestTime = localStorage.getItem(`bestTime_${currentDifficulty}`);
    let isNewBest = false;
    if (!bestTime || seconds < parseInt(bestTime)) {
        localStorage.setItem(`bestTime_${currentDifficulty}`, seconds);
        isNewBest = true;
        loadBestTime(); // update UI
    }

    let htmlMessage = `Você encontrou todas as palavras em <b>${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}</b>.`;
    if (isNewBest) {
        htmlMessage += `<br><br><b style="color: #28a745;">🎉 Novo Recorde! 🎉</b>`;
    }

    Swal.fire({
      title: 'Parabéns!',
      theme: 'auto',
      html: htmlMessage,
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

function renderWordTable(targetWords) {
  const tableEl = document.getElementById('word-table');
  if (!tableEl) return;

  tableEl.innerHTML = '';

  targetWords.forEach(word => {
    const cell = document.createElement('div');
    cell.className = 'word-item';
    cell.id = `word-${word.toLowerCase()}`;
    cell.textContent = word.toUpperCase();
    tableEl.appendChild(cell);
  });
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

  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");

  // 3. Initialize the game logic
  if (typeof initGame === "function") {
    initGame();
    startTimer(); // Start the clock only when they actually play
  }

});

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

const showInstructions = () => {
  Swal.fire({
    title: 'Como Jogar',
    theme: 'auto',
    html: `
      <div style="text-align: left; font-size: 0.95rem;">
        <h3 style="text-align: center; margin-bottom: 1rem;">Instruções do Caça-Palavras</h3>
        <p><strong>🎯 Objetivo:</strong> Encontre todas as palavras escondidas no tabuleiro!</p>
        <hr style="margin: 1rem 0;">
        <p><strong>📋 Como Jogar:</strong></p>
        <ul style="text-align: left;">
          <li>Escolha um <strong>Tema</strong> no menu inicial para jogar com palavras de uma categoria (Animais, Países, etc.) ou palavras aleatórias.</li>
          <li>Clique e arraste para selecionar letras no tabuleiro</li>
          <li>As palavras podem estar em qualquer direção: horizontal, vertical ou diagonal</li>
          <li>Você pode selecionar palavras para frente ou para trás</li>
          <li>Quando encontrar uma palavra corretamente, ela será marcada como encontrada</li>
        </ul>
        <hr style="margin: 1rem 0;">
        <p><strong>💡 Dicas:</strong></p>
        <ul style="text-align: left;">
          <li>Use o botão "Dica" para destacar uma letra de cada palavra</li>
          <li>O cronômetro mostra quanto tempo você levou e, se quiser, pode pausar clicando nele</li>
          <li>Encontre todas as palavras para ganhar!</li>
        </ul>
        <hr style="margin: 1rem 0;">
        <p><strong>✨ Boa Sorte!</strong></p>
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'Entendido',
    customClass: {
      icon: 'no-border'
    }
  });
};

instructionsBtn.addEventListener("click", showInstructions);
const startInstructionsBtn = document.getElementById("start-instructions-btn");
if (startInstructionsBtn) {
  startInstructionsBtn.addEventListener("click", showInstructions);
}

newGameBtn.addEventListener("click", () => {

  Swal.fire({
      title: 'Novo Jogo',
      theme: 'auto',
        html: `
        <p style="margin-bottom: 1.5rem; text-align: center;">Seu progresso atual será perdido. Escolha as configurações para o novo jogo:</p>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            <div class="setting-group">
                <label for="swal-difficulty" class="settings-label">Nível de Dificuldade:</label>
                <select id="swal-difficulty" class="form-select">
                  <option value="easy" ${currentDifficulty === 'easy' ? 'selected' : ''}>Fácil</option>
                  <option value="medium" ${currentDifficulty === 'medium' ? 'selected' : ''}>Médio</option>
                  <option value="hard" ${currentDifficulty === 'hard' ? 'selected' : ''}>Difícil</option>
                </select>
            </div>
            <div class="setting-group">
                <label for="swal-theme" class="settings-label">Tema:</label>
                <select id="swal-theme" class="form-select">
                  <option value="random" ${currentTheme === 'random' ? 'selected' : ''}>Aleatório</option>
                  <option value="animais" ${currentTheme === 'animais' ? 'selected' : ''}>Animais</option>
                  <option value="paises" ${currentTheme === 'paises' ? 'selected' : ''}>Países</option>
                  <option value="alimentos" ${currentTheme === 'alimentos' ? 'selected' : ''}>Alimentos</option>
                  <option value="tecnologia" ${currentTheme === 'tecnologia' ? 'selected' : ''}>Tecnologia</option>
                </select>
            </div>
        </div>
      `,
      icon: 'question',
      confirmButtonText: 'Iniciar Novo Jogo',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      customClass: {
        icon: 'no-border'
      },
      preConfirm: () => {
        return {
          difficulty: document.getElementById('swal-difficulty').value,
          theme: document.getElementById('swal-theme').value
        }
      }
  }).then((result) => {

    if (!result.isConfirmed) return; // If they cancel, do nothing
    
    // Sync back to main selectors
    const diffSelect = document.getElementById('difficulty-select');
    if (diffSelect) diffSelect.value = result.value.difficulty;
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) themeSelect.value = result.value.theme;

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

// Load best time function
function loadBestTime() {
    const difficultySelect = document.getElementById('difficulty-select');
    if (!difficultySelect) return;
    const difficulty = difficultySelect.value;
    const bestTime = localStorage.getItem(`bestTime_${difficulty}`);
    const display = document.getElementById('best-time-display');
    if (display) {
        if (bestTime) {
            const mins = String(Math.floor(bestTime / 60)).padStart(2, '0');
            const secs = String(bestTime % 60).padStart(2, '0');
            display.textContent = `${mins}:${secs}`;
        } else {
            display.textContent = '--:--';
        }
    }
}

const difficultySelectObj = document.getElementById('difficulty-select');
if (difficultySelectObj) {
    difficultySelectObj.addEventListener('change', loadBestTime);
}
document.addEventListener('DOMContentLoaded', loadBestTime);
loadBestTime();
