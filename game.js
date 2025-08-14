// --- Game Constants ---
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
const paddleWidth = 10;
const paddleHeight = 100;
const ballRadius = 10;
const WIN_SCORE = 5;

// --- DOM Elements ---
const score1El = document.getElementById('score1');
const score2El = document.getElementById('score2');
const overlay = document.getElementById('overlay');
const messageEl = document.getElementById('message');
const startBtn = document.getElementById('startBtn');
const nextRoundBtn = document.getElementById('nextRoundBtn');
const restartBtn = document.getElementById('restartBtn');
const bgmusic = document.getElementById('bgmusic');

// --- Game State ---
let leftPaddle, rightPaddle, ball, scores, isGameRunning, winner, isRoundActive, ballDirection;

// --- Sounds ---
let wallSound, paddleSound, scoreSound;
window.onload = function() {
  wallSound = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_12fca7cfa3.mp3');
  paddleSound = new Audio('https://cdn.pixabay.com/audio/2022/10/16/audio_12d2d3d417.mp3');
  scoreSound = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_12e9e7e4c7.mp3');
  wallSound.volume = 0.25;
  paddleSound.volume = 0.35;
  scoreSound.volume = 0.30;
};

// --- Init / Reset ---
function defaultState() {
  leftPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#f2aa4c'
  };
  rightPaddle = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#f2aa4c'
  };
  ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 0,
    vy: 0,
    radius: ballRadius,
    color: '#fff'
  };
  scores = { p1: 0, p2: 0 };
  updateScores();
  isGameRunning = false;
  isRoundActive = false;
  winner = null;
  ballDirection = (Math.random() > 0.5 ? 1 : -1);
}

function resetBall(direction) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.vx = 0;
  ball.vy = 0;
  ballDirection = direction || (Math.random() > 0.5 ? 1 : -1);
}

function serveBall() {
  // Serve after short delay
  setTimeout(() => {
    let direction = ballDirection || (Math.random() > 0.5 ? 1 : -1);
    ball.vx = 5 * direction;
    ball.vy = 5 * (Math.random() > 0.5 ? 1 : -1);
    isGameRunning = true;
    isRoundActive = true;
    overlay.style.display = 'none';
  }, 500);
}

// --- Paddle Controls ---
canvas.addEventListener('mousemove', (e) => {
  if (!isRoundActive) return;
  const rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top;
  leftPaddle.y = mouseY - paddleHeight / 2;
  if (leftPaddle.y < 0) leftPaddle.y = 0;
  if (leftPaddle.y + paddleHeight > canvas.height) leftPaddle.y = canvas.height - paddleHeight;
});

// --- Drawing ---
function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}
function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
}
function drawNet() {
  ctx.strokeStyle = "#fff3";
  ctx.lineWidth = 4;
  for (let i = 0; i < canvas.height; i += 30) {
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, i);
    ctx.lineTo(canvas.width / 2, i + 15);
    ctx.stroke();
  }
}
function render() {
  drawRect(0, 0, canvas.width, canvas.height, '#101820');
  drawNet();
  drawRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height, leftPaddle.color);
  drawRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height, rightPaddle.color);
  drawCircle(ball.x, ball.y, ball.radius, ball.color);
}
function updateScores() {
  score1El.textContent = scores.p1;
  score2El.textContent = scores.p2;
}

// --- Right Paddle AI ---
function updateRightPaddle() {
  const paddleCenter = rightPaddle.y + paddleHeight / 2;
  if (ball.y < paddleCenter - 10) {
    rightPaddle.y -= 4;
  } else if (ball.y > paddleCenter + 10) {
    rightPaddle.y += 4;
  }
  if (rightPaddle.y < 0) rightPaddle.y = 0;
  if (rightPaddle.y + paddleHeight > canvas.height) rightPaddle.y = canvas.height - paddleHeight;
}

// --- Collisions ---
function collision(paddle, ball) {
  return (
    ball.x - ball.radius < paddle.x + paddle.width &&
    ball.x + ball.radius > paddle.x &&
    ball.y - ball.radius < paddle.y + paddle.height &&
    ball.y + ball.radius > paddle.y
  );
}

// --- Game Logic ---
function update() {
  if (!isGameRunning || !isRoundActive) return;

  // Move Ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Top/Bottom Wall
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
    ball.vy = -ball.vy;
    if (wallSound) wallSound.play();
  }

  // Paddle Collisions
  if (collision(leftPaddle, ball)) {
    ball.vx = Math.abs(ball.vx);
    let collidePoint = (ball.y - (leftPaddle.y + paddleHeight / 2)) / (paddleHeight / 2);
    let angleRad = collidePoint * (Math.PI / 4);
    let speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    ball.vx = speed * Math.cos(angleRad);
    ball.vy = speed * Math.sin(angleRad);
    if (paddleSound) paddleSound.play();
  } else if (collision(rightPaddle, ball)) {
    ball.vx = -Math.abs(ball.vx);
    let collidePoint = (ball.y - (rightPaddle.y + paddleHeight / 2)) / (paddleHeight / 2);
    let angleRad = collidePoint * (Math.PI / 4);
    let speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    ball.vx = -speed * Math.cos(angleRad);
    ball.vy = speed * Math.sin(angleRad);
    if (paddleSound) paddleSound.play();
  }

  // Score
  if (ball.x - ball.radius < 0) {
    // Player 2 scores
    scores.p2++;
    updateScores();
    if (scoreSound) scoreSound.play();
    if (scores.p2 >= WIN_SCORE) {
      endMatch(2);
    } else {
      nextRound(-1, "Player 2 Scores!");
    }
  } else if (ball.x + ball.radius > canvas.width) {
    // Player 1 scores
    scores.p1++;
    updateScores();
    if (scoreSound) scoreSound.play();
    if (scores.p1 >= WIN_SCORE) {
      endMatch(1);
    } else {
      nextRound(1, "Player 1 Scores!");
    }
  }

  // Update AI paddle
  updateRightPaddle();
}

// --- Rounds and Match Handling ---
function endMatch(who) {
  isGameRunning = false;
  isRoundActive = false;
  winner = who;
  overlay.style.display = 'block';
  startBtn.style.display = 'none';
  nextRoundBtn.style.display = 'none';
  restartBtn.style.display = 'inline-block';
  messageEl.textContent = winner === 1 ? "Player 1 Wins! 🏆" : "Player 2 Wins! 😢";
  bgmusic.pause();
}

function nextRound(direction, msg) {
  isRoundActive = false;
  overlay.style.display = 'block';
  messageEl.textContent = msg;
  startBtn.style.display = 'none';
  nextRoundBtn.style.display = 'inline-block';
  restartBtn.style.display = 'none';
  resetBall(direction);
}

// --- Loop ---
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

// --- Button Event Listeners ---
startBtn.onclick = function() {
  overlay.style.display = 'none';
  bgmusic.currentTime = 0;
  bgmusic.play();
  resetBall(ballDirection);
  serveBall();
};

nextRoundBtn.onclick = function() {
  overlay.style.display = 'none';
  serveBall();
};

restartBtn.onclick = function() {
  bgmusic.currentTime = 0;
  bgmusic.play();
  defaultState();
  overlay.style.display = 'none';
  startBtn.style.display = 'none';
  nextRoundBtn.style.display = 'none';
  restartBtn.style.display = 'none';
  messageEl.textContent = '';
  resetBall(ballDirection);
  setTimeout(() => {
    serveBall();
  }, 300);
};

// --- Initial Overlay ---
function showStartOverlay() {
  overlay.style.display = 'block';
  messageEl.textContent = 'Click "Start Game" to Play!';
  startBtn.style.display = 'inline-block';
  nextRoundBtn.style.display = 'none';
  restartBtn.style.display = 'none';
}

defaultState();
showStartOverlay();
gameLoop();
