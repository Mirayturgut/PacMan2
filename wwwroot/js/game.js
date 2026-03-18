/* ============================================================
   game.js  –  Pacman core game logic & canvas renderer
   ============================================================ */

'use strict';

const Game = (() => {
  const CELL = 24;
  const COLS = 21;
  const ROWS = 23;

  const PACMAN_SPEED = 5;
  const GHOST_SPEED = 5.4;
  const GHOST_FRIGHT_MULT = 0.42;

  const POWER_DURATION = 8000;
  const GHOST_EAT_SCORE = 200;
  const PELLET_SCORE = 10;
  const POWER_SCORE = 50;
  const WIN_BONUS = 2000;

  const GHOST_HOUSE_COL = 10;
  const GHOST_HOUSE_ROW = 9;
  const GHOST_DOOR_ROW = 8;

  const GHOST_COLORS = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852'];
  const P = { CHASER: 'chaser', AMBUSHER: 'ambusher', RANDOM: 'random', SCATTER: 'scatter' };

  const SCATTER_CORNERS = [
    { col: 1, row: 1 },
    { col: COLS - 2, row: 1 },
    { col: COLS - 2, row: ROWS - 2 },
    { col: 1, row: ROWS - 2 },
  ];

  // 0=path  1=wall  2=pellet  3=power-pellet  4=ghost-door
  const BASE_MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,2,1],
    [1,2,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,1,2,1],
    [1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1],
    [1,1,1,1,2,1,1,1,0,0,0,0,0,1,1,1,2,1,1,1,1],
    [1,1,1,1,2,1,0,0,0,1,4,1,0,0,0,1,2,1,1,1,1],
    [1,1,1,1,2,1,0,1,1,1,1,1,1,1,0,1,2,1,1,1,1],
    [0,0,0,0,2,0,0,1,0,0,0,0,0,1,0,0,2,0,0,0,0],
    [1,1,1,1,2,1,0,1,1,1,1,1,1,1,0,1,2,1,1,1,1],
    [1,1,1,1,2,1,0,0,0,0,0,0,0,0,0,1,2,1,1,1,1],
    [1,1,1,1,2,1,0,1,1,1,1,1,1,1,0,1,2,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,2,1],
    [1,2,2,1,2,2,2,2,2,2,0,2,2,2,2,2,2,1,2,3,1],
    [1,2,2,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,2,1,1],
    [1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,2,1,1,1,2,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  let canvas, ctx;
  let map, totalPellets, pelletsLeft;
  let pacman, ghosts;
  let score, lives, elapsedSec;
  let gameStatus;
  let powerMode, powerTimer;
  let lastTime, animFrame;
  let timerInterval;
  let scoreSubmitted;
  let inputQueue;
  let ghostEatCombo;
  let touchStartX = 0, touchStartY = 0;

  const DIR_MAP = {
    ArrowLeft: { dx: -1, dy: 0 },
    ArrowRight: { dx: 1, dy: 0 },
    ArrowUp: { dx: 0, dy: -1 },
    ArrowDown: { dx: 0, dy: 1 },
    a: { dx: -1, dy: 0 }, A: { dx: -1, dy: 0 },
    d: { dx: 1, dy: 0 }, D: { dx: 1, dy: 0 },
    w: { dx: 0, dy: -1 }, W: { dx: 0, dy: -1 },
    s: { dx: 0, dy: 1 }, S: { dx: 0, dy: 1 },
  };

  function init() {
    canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    canvas.width = COLS * CELL;
    canvas.height = ROWS * CELL;
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';

    document.getElementById('btn-start').addEventListener('click', onStart);
    document.getElementById('btn-restart').addEventListener('click', onRestart);
    document.addEventListener('keydown', onKey);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });
    bindDpad();

    UI.init();
    gameStatus = 'idle';
    UI.showOverlay('PAC-MAN', '', '', false, true);
    UI.setStatus('OYUNCU ADINI GİR VE BAŞLAT', 'ready');
    UI.updateScore(0);
    UI.updateLives(3);
    UI.updateTimer(0);

    buildMap();
    pacman = makePacman();
    ghosts = buildGhosts();
    render();
  }

  function bindDpad() {
    [
      ['dpad-up', { dx: 0, dy: -1 }],
      ['dpad-down', { dx: 0, dy: 1 }],
      ['dpad-left', { dx: -1, dy: 0 }],
      ['dpad-right', { dx: 1, dy: 0 }],
    ].forEach(([id, dir]) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      const press = (e) => {
        e.preventDefault();
        if (gameStatus === 'playing') inputQueue = { ...dir };
      };

      btn.addEventListener('click', press);
      btn.addEventListener('touchstart', press, { passive: false });
      btn.addEventListener('pointerdown', press);
    });
  }

  function buildMap() {
    totalPellets = 0;
    map = BASE_MAP.map(row => row.map(cell => {
      if (cell === 2 || cell === 3) totalPellets++;
      return cell;
    }));
    pelletsLeft = totalPellets;
  }

  function cellAt(col, row) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return 1;
    return map[row][col];
  }

  function isWalkable(col, row, forGhost = false) {
    const c = cellAt(col, row);
    if (c === 1) return false;
    if (c === 4 && !forGhost) return false;
    return true;
  }

  function getCellCenter(col, row) {
    return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 };
  }

  function pixelToCell(x, y) {
    return {
      col: Math.round((x - CELL / 2) / CELL),
      row: Math.round((y - CELL / 2) / CELL),
    };
  }

  function makePacman() {
    return {
      x: 10 * CELL + CELL / 2,
      y: 16 * CELL + CELL / 2,
      dx: 0,
      dy: 0,
      speed: PACMAN_SPEED,
      mouthAngle: 0.25,
      mouthDir: 1,
    };
  }

  function makeGhost(col, row, color, index, personality, scatterIdx, releaseDelay) {
    return {
      x: col * CELL + CELL / 2,
      y: row * CELL + CELL / 2,
      dx: 0,
      dy: 0,
      speed: GHOST_SPEED,
      color,
      index,
      personality,
      scatterCornerIndex: scatterIdx,
      frightened: false,
      released: false,
      releaseDelay,
      moveCooldown: 0,
    };
  }

  function buildGhosts() {
    return [
      makeGhost(GHOST_HOUSE_COL - 1, GHOST_HOUSE_ROW, GHOST_COLORS[0], 0, P.CHASER, 0, 0.0),
      makeGhost(GHOST_HOUSE_COL + 1, GHOST_HOUSE_ROW, GHOST_COLORS[1], 1, P.AMBUSHER, 1, 1.1),
      makeGhost(GHOST_HOUSE_COL, GHOST_HOUSE_ROW, GHOST_COLORS[2], 2, P.RANDOM, 2, 2.2),
      makeGhost(GHOST_HOUSE_COL, GHOST_HOUSE_ROW - 1, GHOST_COLORS[3], 3, P.SCATTER, 3, 3.3),
    ];
  }

  function onStart() {
    if (!UI.getPlayerName()) {
      UI.showNameError();
      return;
    }
    startGame();
  }

  function onRestart() {
    startGame();
  }

  function startGame() {
    cancelAnimationFrame(animFrame);
    clearInterval(timerInterval);

    buildMap();
    pacman = makePacman();
    ghosts = buildGhosts();
    score = 0;
    lives = 3;
    elapsedSec = 0;
    powerMode = false;
    powerTimer = 0;
    scoreSubmitted = false;
    inputQueue = null;
    ghostEatCombo = 1;
    gameStatus = 'playing';

    UI.updateScore(0);
    UI.updateLives(3);
    UI.updateTimer(0);
    UI.setStatus('OYNUYOR', 'playing');
    UI.hidePowerBar();
    UI.hideOverlay();

    const inputRow = document.querySelector('.player-input-row');
    if (inputRow) inputRow.classList.add('hidden');
    document.getElementById('btn-restart').classList.remove('hidden');

    timerInterval = setInterval(() => {
      if (gameStatus === 'playing') {
        elapsedSec++;
        UI.updateTimer(elapsedSec);
      }
    }, 1000);

    lastTime = null;
    animFrame = requestAnimationFrame(gameLoop);
  }

  function onKey(e) {
    const dir = DIR_MAP[e.key];
    if (!dir || gameStatus !== 'playing') return;
    e.preventDefault();
    inputQueue = { ...dir };
  }

  function onTouchStart(e) {
    const t = e.touches[0];
    if (t) {
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    }
  }

  function onTouchEnd(e) {
    if (gameStatus !== 'playing') return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const thr = 24;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > thr) inputQueue = { dx: 1, dy: 0 };
      else if (dx < -thr) inputQueue = { dx: -1, dy: 0 };
    } else {
      if (dy > thr) inputQueue = { dx: 0, dy: 1 };
      else if (dy < -thr) inputQueue = { dx: 0, dy: -1 };
    }
  }

  function gameLoop(ts) {
    if (!lastTime) lastTime = ts;
    const dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;

    if (gameStatus === 'playing') update(dt);
    render();

    if (gameStatus !== 'gameover' && gameStatus !== 'win') {
      animFrame = requestAnimationFrame(gameLoop);
    }
  }

  function update(dt) {
    updatePacman(dt);
    updateGhosts(dt);
    checkCollisions();

    if (powerMode) {
      powerTimer -= dt * 1000;
      if (powerTimer <= 0) {
        deactivatePowerMode();
      } else {
        UI.showPowerBar(powerTimer / POWER_DURATION);
      }
    }
  }

  function updatePacman(dt) {
    const { col, row } = pixelToCell(pacman.x, pacman.y);
    const ctr = getCellCenter(col, row);
    const nearX = Math.abs(pacman.x - ctr.x) < CELL * 0.4;
    const nearY = Math.abs(pacman.y - ctr.y) < CELL * 0.4;

    if (inputQueue && nearX && nearY) {
      if (isWalkable(col + inputQueue.dx, row + inputQueue.dy)) {
        pacman.dx = inputQueue.dx;
        pacman.dy = inputQueue.dy;
        inputQueue = null;
      }
    }

    const amt = pacman.speed * CELL * dt;
    let nx = pacman.x + pacman.dx * amt;
    let ny = pacman.y + pacman.dy * amt;

    const laC = Math.round((nx + pacman.dx * CELL * 0.5 - CELL / 2) / CELL);
    const laR = Math.round((ny + pacman.dy * CELL * 0.5 - CELL / 2) / CELL);
    if (!isWalkable(laC, laR)) {
      nx = ctr.x;
      ny = ctr.y;
      pacman.dx = 0;
      pacman.dy = 0;
    }

    if (pacman.dx !== 0) ny += (ctr.y - ny) * 0.3;
    if (pacman.dy !== 0) nx += (ctr.x - nx) * 0.3;
    if (nx < 0) nx = COLS * CELL;
    if (nx > COLS * CELL) nx = 0;

    pacman.x = nx;
    pacman.y = ny;

    pacman.mouthAngle += 0.12 * pacman.mouthDir;
    if (pacman.mouthAngle >= 0.35) pacman.mouthDir = -1;
    if (pacman.mouthAngle <= 0.02) pacman.mouthDir = 1;

    const { col: ec, row: er } = pixelToCell(pacman.x, pacman.y);
    const eatenCell = cellAt(ec, er);

    if (eatenCell === 2) {
      map[er][ec] = 0;
      pelletsLeft--;
      score += PELLET_SCORE;
      UI.updateScore(score);
      if (pelletsLeft <= 0) triggerWin();
    } else if (eatenCell === 3) {
      map[er][ec] = 0;
      pelletsLeft--;
      score += POWER_SCORE;
      UI.updateScore(score);
      activatePowerMode();
      if (pelletsLeft <= 0) triggerWin();
    }
  }

  function bestDir(possible, gc, gr, tc, tr, flee = false) {
    return [...possible].sort((a, b) => {
      const da = Math.hypot((gc + a.dx) - tc, (gr + a.dy) - tr);
      const db = Math.hypot((gc + b.dx) - tc, (gr + b.dy) - tr);
      return flee ? db - da : da - db;
    })[0];
  }

  function chooseGhostDir(ghost) {
    const { col: gc, row: gr } = pixelToCell(ghost.x, ghost.y);
    const { col: pc, row: pr } = pixelToCell(pacman.x, pacman.y);

    const possible = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ].filter(d => !(d.dx === -ghost.dx && d.dy === -ghost.dy) && isWalkable(gc + d.dx, gr + d.dy, true));

    if (possible.length === 0) {
      ghost.dx = -ghost.dx;
      ghost.dy = -ghost.dy;
      return;
    }

    if (ghost.frightened) {
      const d = bestDir(possible, gc, gr, pc, pr, true);
      ghost.dx = d.dx;
      ghost.dy = d.dy;
      return;
    }

    let d;
    switch (ghost.personality) {
      case P.CHASER:
        d = bestDir(possible, gc, gr, pc, pr);
        break;
      case P.AMBUSHER: {
        const ldx = pacman.dx || 0;
        const ldy = pacman.dy !== 0 ? pacman.dy : -1;
        const tc = Math.max(1, Math.min(COLS - 2, pc + ldx * 4));
        const tr = Math.max(1, Math.min(ROWS - 2, pr + ldy * 4));
        d = bestDir(possible, gc, gr, tc, tr);
        break;
      }
      case P.RANDOM:
        d = possible[Math.floor(Math.random() * possible.length)];
        break;
      case P.SCATTER: {
        const corner = SCATTER_CORNERS[ghost.scatterCornerIndex];
        if (Math.abs(gc - corner.col) <= 1 && Math.abs(gr - corner.row) <= 1) {
          ghost.scatterCornerIndex = (ghost.scatterCornerIndex + 1) % SCATTER_CORNERS.length;
        }
        const t = SCATTER_CORNERS[ghost.scatterCornerIndex];
        d = bestDir(possible, gc, gr, t.col, t.row);
        break;
      }
      default:
        d = bestDir(possible, gc, gr, pc, pr);
        break;
    }

    ghost.dx = d.dx;
    ghost.dy = d.dy;
  }

  function updateGhosts(dt) {
    for (const g of ghosts) {
      if (!g.released) {
        g.releaseDelay -= dt;
        if (g.releaseDelay > 0) continue;

        const door = getCellCenter(GHOST_HOUSE_COL, GHOST_DOOR_ROW);
        const dx = door.x - g.x;
        const dy = door.y - g.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 2) {
          const amt = g.speed * 1.15 * CELL * dt;
          g.x += (dx / dist) * Math.min(amt, dist);
          g.y += (dy / dist) * Math.min(amt, dist);
        } else {
          g.x = door.x;
          g.y = door.y;
          g.released = true;
          g.dx = 0;
          g.dy = -1;
          g.moveCooldown = 0;
        }
        continue;
      }

      g.moveCooldown -= dt;
      if (g.moveCooldown <= 0) {
        chooseGhostDir(g);
        g.moveCooldown = 0.08 + Math.random() * 0.06;
      }

      const spd = g.frightened ? GHOST_SPEED * GHOST_FRIGHT_MULT : GHOST_SPEED;
      const amt = spd * CELL * dt;
      let nx = g.x + g.dx * amt;
      let ny = g.y + g.dy * amt;

      const laC = Math.round((nx + g.dx * CELL * 0.45 - CELL / 2) / CELL);
      const laR = Math.round((ny + g.dy * CELL * 0.45 - CELL / 2) / CELL);
      if (!isWalkable(laC, laR, true)) {
        const currentCell = pixelToCell(g.x, g.y);
        const ctr = getCellCenter(currentCell.col, currentCell.row);
        nx = ctr.x;
        ny = ctr.y;
        g.dx = 0;
        g.dy = 0;
        g.moveCooldown = 0;
      }

      if (nx < 0) nx = COLS * CELL;
      if (nx > COLS * CELL) nx = 0;
      g.x = nx;
      g.y = ny;
    }
  }

  function checkCollisions() {
    if (gameStatus !== 'playing') return;

    for (let i = ghosts.length - 1; i >= 0; i--) {
      const ghost = ghosts[i];
      if (Math.hypot(pacman.x - ghost.x, pacman.y - ghost.y) > CELL * 0.75) continue;

      if (ghost.frightened) {
        score += GHOST_EAT_SCORE * ghostEatCombo;
        ghostEatCombo = Math.min(ghostEatCombo * 2, 8);
        UI.updateScore(score);

        // Ghost'u kalıcı olarak oyundan çıkar
        ghosts.splice(i, 1);
      } else {
        loseLife();
        break;
      }
    }
  }

  function loseLife() {
    lives--;
    UI.updateLives(lives);

    if (lives <= 0) {
      triggerGameOver();
      return;
    }

    gameStatus = 'dead';
    UI.setStatus('ÖLDÜ! HAZIRLAN...', 'dead');

    setTimeout(() => {
      if (gameStatus !== 'dead') return;
      respawnPacman();
      gameStatus = 'playing';
      UI.setStatus('OYNUYOR', 'playing');
    }, 1500);
  }

  function respawnPacman() {
    pacman = makePacman();
    inputQueue = null;

    for (const g of ghosts) {
      g.frightened = false;
      g.dx = 0;
      g.dy = 0;
      g.moveCooldown = 0;
    }

    if (powerMode) deactivatePowerMode();
  }

  function activatePowerMode() {
    powerMode = true;
    powerTimer = POWER_DURATION;
    ghostEatCombo = 1;
    for (const g of ghosts) g.frightened = true;
    UI.showPowerBar(1);
  }

  function deactivatePowerMode() {
    powerMode = false;
    UI.hidePowerBar();
    for (const g of ghosts) g.frightened = false;
  }

  function triggerWin() {
    gameStatus = 'win';
    clearInterval(timerInterval);
    score += WIN_BONUS;
    UI.updateScore(score);
    UI.setStatus('KAZANDIN! 🎉', 'win');
    UI.showOverlay(
      'TEBRİKLER!\nTÜM YEMLERİ YEDİN!',
      'win',
      `SKOR: ${score.toLocaleString()}\nSÜRE: ${elapsedSec}s\n+${WIN_BONUS} BONUS`,
      true,
      false
    );
    submitScore(true);
  }

  function triggerGameOver() {
    gameStatus = 'gameover';
    clearInterval(timerInterval);
    UI.setStatus('GAME OVER', 'gameover');
    UI.showOverlay('GAME OVER', 'lose', `SKOR: ${score.toLocaleString()}\nSÜRE: ${elapsedSec}s`, true, false);
    submitScore(false);
  }

  async function submitScore(isWin) {
    if (scoreSubmitted) return;
    scoreSubmitted = true;
    const playerName = UI.getPlayerName();
    if (!playerName) return;

    try {
      await API.submitScore({ playerName, game: 'pacman', points: score, isWin, durationSeconds: elapsedSec });
      UI.setScoreSubmitFeedback(true, '✓ Skor kaydedildi!');
    } catch (err) {
      UI.setScoreSubmitFeedback(false, `✗ ${err.message}`);
    }
  }

  function render() {
    if (!ctx || !map) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#04040f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMaze();
    drawGhosts();
    drawPacman();
  }

  function drawMaze() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = map[r][c];
        const x = c * CELL;
        const y = r * CELL;

        if (cell === 1) {
          ctx.fillStyle = '#1565c0';
          ctx.fillRect(x, y, CELL, CELL);
          ctx.strokeStyle = 'rgba(66,165,245,0.55)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);
        } else if (cell === 2) {
          ctx.beginPath();
          ctx.arc(x + CELL / 2, y + CELL / 2, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ffe4a0';
          ctx.fill();
        } else if (cell === 3) {
          const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 200);
          ctx.beginPath();
          ctx.arc(x + CELL / 2, y + CELL / 2, 6 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = '#ffd700';
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  function drawPacman() {
    if (!pacman) return;
    const { x, y, mouthAngle, dx, dy } = pacman;

    let angle = 0;
    if (dx === 1) angle = 0;
    if (dx === -1) angle = Math.PI;
    if (dy === -1) angle = -Math.PI / 2;
    if (dy === 1) angle = Math.PI / 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, CELL / 2 - 2, mouthAngle, Math.PI * 2 - mouthAngle);
    ctx.closePath();
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function drawGhosts() {
    if (!ghosts) return;

    for (const ghost of ghosts) {
      const { x, y, frightened, color } = ghost;
      let bodyColor = color;

      if (frightened) {
        const flash = powerTimer < 2000 && Math.floor(Date.now() / 250) % 2 === 0;
        bodyColor = flash ? '#ffffff' : '#1a1aff';
      }

      const r = CELL / 2 - 2;
      ctx.save();
      ctx.translate(x, y);

      ctx.beginPath();
      ctx.arc(0, -r * 0.2, r, Math.PI, 0, false);

      const steps = 4;
      const stepW = (r * 2) / steps;
      for (let i = 0; i <= steps; i++) {
        ctx.lineTo(-r + i * stepW, i % 2 === 0 ? r * 0.8 : r * 0.4);
      }
      ctx.closePath();

      ctx.fillStyle = bodyColor;
      if (!frightened) {
        ctx.shadowColor = bodyColor;
        ctx.shadowBlur = 8;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      if (!frightened) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.3, r * 0.28, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.35, -r * 0.3, r * 0.28, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#0000cc';
        ctx.beginPath(); ctx.arc(-r * 0.35 + ghost.dx * 2, -r * 0.3 + ghost.dy * 2, r * 0.14, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.35 + ghost.dx * 2, -r * 0.3 + ghost.dy * 2, r * 0.14, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.2, r * 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.3, -r * 0.2, r * 0.15, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const wx = -r * 0.5 + i * (r * 0.25);
          const wy = r * 0.15 + (i % 2 === 0 ? r * 0.1 : -r * 0.1);
          if (i === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => Game.init());