// Game configuration and state variables
const GOAL_CANS = 25;        // Total items needed to collect
const GAME_TIME = 30;        // Game duration in seconds
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;           // Holds the interval for spawning items
let timerInterval;           // Holds the interval for the timer
let timeLeft = GAME_TIME;    // Time left in seconds

// Milestones for feedback
const milestones = [5, 15, 25];

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

let cansPerSpawn = 1;
let spawnSpeed = 900; // ms
let difficultyInterval;

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive) return;
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => (cell.innerHTML = ''));

  // Pick random unique cells for cans/obstacles
  let availableIndexes = [...Array(cells.length).keys()];
  for (let i = 0; i < cansPerSpawn; i++) {
    if (availableIndexes.length === 0) break;
    const idx = Math.floor(Math.random() * availableIndexes.length);
    const cellIndex = availableIndexes.splice(idx, 1)[0];
    const cell = cells[cellIndex];

    const isObstacle = Math.random() < 0.2; // 20% chance for obstacle

    if (isObstacle) {
      cell.innerHTML = `
        <div class="water-can-wrapper">
          <div class="red-can" title="Don't click!"></div>
        </div>
      `;
      cell.querySelector('.red-can').addEventListener('click', function(e) {
        e.stopPropagation();
        if (!gameActive) return;
        currentCans = Math.max(0, currentCans - 1);
        updateScore();
        showFeedback('Oops! That was a bad can!', 'bad');
        cell.innerHTML = '';
      });
    } else {
      cell.innerHTML = `
        <div class="water-can-wrapper">
          <div class="water-can"></div>
        </div>
      `;
      cell.querySelector('.water-can').addEventListener('click', function(e) {
        e.stopPropagation();
        if (!gameActive) return;
        currentCans++;
        updateScore();
        checkMilestone();
        cell.innerHTML = '';
        if (currentCans >= GOAL_CANS) {
          endGame(true);
        }
      });
    }
  }
}

// Updates the score display
function updateScore() {
  document.getElementById('current-cans').textContent = currentCans;
}

// Shows feedback messages
function showFeedback(message, type = 'good') {
  const achievements = document.getElementById('achievements');
  achievements.textContent = message;
  achievements.style.color = type === 'good' ? '#4FCB53' : '#F5402C';
  achievements.style.fontWeight = 'bold';
  setTimeout(() => {
    achievements.textContent = '';
  }, 1200);
}

// Checks for milestone achievements
function checkMilestone() {
  if (milestones.includes(currentCans)) {
    let msg = '';
    if (currentCans === 5) msg = 'Great start! 5 cans!';
    if (currentCans === 15) msg = 'Halfway there!';
    if (currentCans === 25) msg = 'You did it! All cans collected!';
    showFeedback(msg, 'good');
  }
}

// Handles the game timer
function startTimer() {
  timeLeft = GAME_TIME;
  document.getElementById('timer').textContent = timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame(false);
    }
  }, 1000);
}

// Increase difficulty over time
function increaseDifficulty() {
  if (!gameActive) return;
  // Increase cans per spawn up to 3
  if (cansPerSpawn < 3) cansPerSpawn++;
  // Decrease spawn interval down to 800ms minimum (was 600ms)
  if (spawnSpeed > 800) spawnSpeed -= 100; // Even slower acceleration
  clearInterval(spawnInterval);
  spawnInterval = setInterval(spawnWaterCan, spawnSpeed);
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return;
  gameActive = true;
  currentCans = 0;
  cansPerSpawn = 1;
  spawnSpeed = 900;
  updateScore();
  createGrid();
  document.getElementById('achievements').textContent = '';
  document.getElementById('timer').textContent = GAME_TIME;
  startTimer();
  spawnWaterCan();
  spawnInterval = setInterval(spawnWaterCan, spawnSpeed);
  // Every 10 seconds, increase difficulty
  difficultyInterval = setInterval(increaseDifficulty, 10000);
}

// Ends the game
function endGame(won) {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  clearInterval(difficultyInterval);
  // Remove all cans
  document.querySelectorAll('.grid-cell').forEach(cell => cell.innerHTML = '');
  if (won) {
    showFeedback('Congratulations! You collected all the cans!', 'good');
  } else {
    showFeedback(`Time's up! You collected ${currentCans} cans.`, 'bad');
  }
}

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);

// Add red can styling
const style = document.createElement('style');
style.textContent = `
.red-can {
  width: 100%;
  height: 100%;
  background-image: url('img/redcan.png'); // <-- fixed file name
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 50%;
  animation: popUp 0.5s cubic-bezier(0.17, 0.67, 0.34, 2);
  transform-origin: center;
  cursor: pointer;
}
`;
document.head.appendChild(style);
