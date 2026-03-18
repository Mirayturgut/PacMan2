/* ============================================================
   style.css  –  Pacman Arcade UI
   Includes: D-pad mobile controls, responsive layout
   ============================================================ */

@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@400;700;900&display=swap');

/* ── Reset & Root ────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:          #04040f;
  --bg-card:     #080818;
  --bg-panel:    #0b0b22;
  --wall:        #1565c0;
  --wall-glow:   #42a5f5;
  --pacman:      #ffd700;
  --neon-cyan:   #00e5ff;
  --neon-pink:   #ff4081;
  --neon-green:  #69ff47;
  --text:        #e0e0ff;
  --text-muted:  #7070aa;
  --border:      rgba(0,229,255,0.25);
  --font-pixel:  'Press Start 2P', monospace;
  --font-ui:     'Orbitron', monospace;
  --radius:      6px;
  --shadow-neon: 0 0 8px var(--neon-cyan), 0 0 24px rgba(0,229,255,0.3);
  --shadow-gold: 0 0 8px var(--pacman),    0 0 24px rgba(255,215,0,0.3);
}

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-ui);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px 40px;
  background-image: repeating-linear-gradient(
    0deg, transparent, transparent 2px,
    rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px
  );
  /* Prevent scroll bounce / zooming on mobile */
  overscroll-behavior: none;
  touch-action: pan-y;
}

/* ── Header ──────────────────────────────────────────────── */
.header { text-align: center; margin-bottom: 20px; }

.title {
  font-family: var(--font-pixel);
  font-size: clamp(1.2rem, 4vw, 2rem);
  color: var(--pacman);
  text-shadow: var(--shadow-gold);
  letter-spacing: 4px;
  animation: titlePulse 3s ease-in-out infinite;
}
.title span { color: var(--neon-cyan); text-shadow: var(--shadow-neon); }

.subtitle {
  font-size: 0.55rem;
  color: var(--text-muted);
  letter-spacing: 6px;
  margin-top: 6px;
  text-transform: uppercase;
}

@keyframes titlePulse {
  0%,100% { text-shadow: var(--shadow-gold); }
  50%     { text-shadow: 0 0 16px var(--pacman), 0 0 40px rgba(255,215,0,0.5); }
}

/* ── Main layout ─────────────────────────────────────────── */
.game-wrapper {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  max-width: 900px;
}

/* ── Game card ───────────────────────────────────────────── */
.game-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 0 30px rgba(0,229,255,0.08), inset 0 0 20px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* Shrink to canvas on small screens */
  max-width: 100%;
}

/* ── Info bar ────────────────────────────────────────────── */
.info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 70px;
}

.info-label {
  font-family: var(--font-pixel);
  font-size: 0.42rem;
  color: var(--text-muted);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.info-value {
  font-family: var(--font-pixel);
  font-size: 0.9rem;
  color: var(--neon-cyan);
  text-shadow: var(--shadow-neon);
  line-height: 1;
}

#lives-display { display: flex; gap: 6px; align-items: center; }

.life-icon {
  width: 14px; height: 14px;
  background: var(--pacman);
  border-radius: 50%;
  clip-path: polygon(15% 40%, 100% 0%, 100% 100%, 15% 60%, 0% 50%);
  box-shadow: 0 0 6px var(--pacman);
  flex-shrink: 0;
}

/* ── Canvas wrapper ──────────────────────────────────────── */
.canvas-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
}

#game-canvas {
  display: block;
  border: 2px solid rgba(0,229,255,0.3);
  border-radius: var(--radius);
  box-shadow: 0 0 20px rgba(21,101,192,0.4), inset 0 0 10px rgba(0,0,0,0.6);
  image-rendering: pixelated;
  max-width: 100%;
  height: auto;
  /* Prevent iOS long-press context menu */
  -webkit-user-select: none;
  user-select: none;
  touch-action: none;
}

/* Canvas overlay */
.canvas-overlay {
  position: absolute;
  inset: 0;
  background: rgba(4,4,15,0.82);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 20px;
  backdrop-filter: blur(2px);
  text-align: center;
}
.canvas-overlay.hidden { display: none; }

.overlay-title {
  font-family: var(--font-pixel);
  font-size: clamp(0.65rem, 2.5vw, 1rem);
  color: var(--pacman);
  text-shadow: var(--shadow-gold);
  line-height: 1.8;
  white-space: pre-line;
}
.overlay-title.win  { color: var(--neon-green); text-shadow: 0 0 8px var(--neon-green), 0 0 24px rgba(105,255,71,.3); }
.overlay-title.lose { color: var(--neon-pink);  text-shadow: 0 0 8px var(--neon-pink),  0 0 24px rgba(255,64,129,.3); }

.overlay-score {
  font-family: var(--font-pixel);
  font-size: 0.5rem;
  color: var(--text-muted);
  line-height: 2;
  white-space: pre-line;
}

/* ── Player input row ────────────────────────────────────── */
.player-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

#player-name {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: var(--font-pixel);
  font-size: 0.5rem;
  padding: 10px 14px;
  outline: none;
  letter-spacing: 2px;
  width: 190px;
  transition: border-color .2s, box-shadow .2s;
}
#player-name:focus { border-color: var(--neon-cyan); box-shadow: 0 0 8px rgba(0,229,255,.3); }
#player-name::placeholder { color: var(--text-muted); }

/* ── Buttons ─────────────────────────────────────────────── */
.btn {
  font-family: var(--font-pixel);
  font-size: 0.5rem;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  padding: 10px 16px;
  letter-spacing: 1px;
  transition: transform .1s, box-shadow .2s, background .2s;
  white-space: nowrap;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.btn:active { transform: scale(0.94); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-primary { background: var(--pacman); color: #000; box-shadow: 0 0 10px rgba(255,215,0,.4); }
.btn-primary:hover:not(:disabled) { background: #ffe033; box-shadow: var(--shadow-gold); }

.btn-secondary { background: transparent; color: var(--neon-cyan); border: 1px solid var(--neon-cyan); box-shadow: 0 0 8px rgba(0,229,255,.2); }
.btn-secondary:hover:not(:disabled) { background: rgba(0,229,255,.1); box-shadow: var(--shadow-neon); }

.btn-danger { background: transparent; color: var(--neon-pink); border: 1px solid var(--neon-pink); box-shadow: 0 0 8px rgba(255,64,129,.2); }
.btn-danger:hover:not(:disabled) { background: rgba(255,64,129,.1); box-shadow: 0 0 8px var(--neon-pink), 0 0 24px rgba(255,64,129,.3); }

/* ── Controls bar ────────────────────────────────────────── */
.controls { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }

/* ── Power bar ───────────────────────────────────────────── */
.power-bar-wrap { display: flex; align-items: center; gap: 8px; }
.power-bar-wrap.hidden { display: none; }

.power-bar-label { font-family: var(--font-pixel); font-size: 0.38rem; color: var(--neon-pink); white-space: nowrap; }
.power-bar-track { flex: 1; height: 6px; background: rgba(255,255,255,.1); border-radius: 3px; overflow: hidden; }
.power-bar-fill  { height: 100%; background: linear-gradient(90deg,var(--neon-pink),var(--pacman)); border-radius: 3px; transition: width .1s linear; box-shadow: 0 0 6px var(--neon-pink); }

/* ── Status message ──────────────────────────────────────── */
#status-message {
  font-family: var(--font-pixel);
  font-size: 0.5rem;
  text-align: center;
  padding: 6px;
  min-height: 22px;
  letter-spacing: 2px;
  transition: color .3s;
}
.status-ready    { color: var(--text-muted); }
.status-playing  { color: var(--neon-green); }
.status-dead     { color: var(--neon-pink); }
.status-win      { color: var(--pacman); animation: titlePulse 1s ease-in-out infinite; }
.status-gameover { color: var(--neon-pink); animation: titlePulse 1s ease-in-out infinite; }

/* ═══════════════════════════════════════════════════════════
   ON-SCREEN D-PAD
   ═══════════════════════════════════════════════════════════ */
.dpad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin: 4px auto 0;
  /* Show by default on all screens; hidden on big screens via media query */
}

.dpad-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dpad-center {
  width: 52px;
  height: 52px;
  background: rgba(0,229,255,0.04);
  border-radius: var(--radius);
}

.dpad-btn {
  width: 52px;
  height: 52px;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--neon-cyan);
  font-size: 1.2rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background .1s, transform .08s, box-shadow .1s;
  touch-action: manipulation;
}

.dpad-btn:active {
  background: rgba(0,229,255,0.18);
  box-shadow: var(--shadow-neon);
  transform: scale(0.91);
}

/* ── Side panel (desktop) ────────────────────────────────── */
.side-panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  min-width: 180px;
  max-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-section-title {
  font-family: var(--font-pixel);
  font-size: 0.45rem;
  color: var(--neon-cyan);
  text-shadow: var(--shadow-neon);
  letter-spacing: 3px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.panel-info-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.panel-info-list li { display: flex; justify-content: space-between; font-size: 0.5rem; color: var(--text-muted); }
.panel-info-list .val { color: var(--text); font-family: var(--font-pixel); font-size: 0.45rem; }

.keys-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 4px; margin-top: 4px; }
.key { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 4px; padding: 6px 4px; text-align: center; font-family: var(--font-pixel); font-size: 0.42rem; color: var(--text-muted); }
.key.center { grid-column: 2; }

/* ── Modal ───────────────────────────────────────────────── */
.modal-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(4,4,15,.88);
  z-index: 100;
  justify-content: center;
  align-items: center;
  padding: 16px;
  backdrop-filter: blur(4px);
}
.modal-backdrop.open { display: flex; animation: fadeIn .2s ease; }

@keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.modal {
  background: var(--bg-card);
  border: 1px solid var(--neon-cyan);
  border-radius: 12px;
  box-shadow: 0 0 40px rgba(0,229,255,.2), 0 0 80px rgba(0,0,0,.6);
  width: 100%;
  max-width: 720px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  animation: slideUp .25s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.modal-title { font-family: var(--font-pixel); font-size: 0.75rem; color: var(--neon-cyan); text-shadow: var(--shadow-neon); letter-spacing: 4px; }

.modal-close {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  cursor: pointer;
  font-family: var(--font-pixel);
  font-size: 0.6rem;
  padding: 6px 10px;
  border-radius: var(--radius);
  transition: color .2s, border-color .2s;
}
.modal-close:hover { color: var(--neon-pink); border-color: var(--neon-pink); }

.modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}
.modal-body::-webkit-scrollbar { width: 6px; }
.modal-body::-webkit-scrollbar-track { background: var(--bg); }
.modal-body::-webkit-scrollbar-thumb { background: var(--wall); border-radius: 3px; }

/* ── Leaderboard table ───────────────────────────────────── */
.leaderboard-table { width: 100%; border-collapse: collapse; font-size: 0.45rem; }
.leaderboard-table th { font-family: var(--font-pixel); font-size: 0.38rem; color: var(--neon-cyan); letter-spacing: 2px; text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--border); white-space: nowrap; }
.leaderboard-table td { padding: 10px; border-bottom: 1px solid rgba(255,255,255,.04); font-family: var(--font-ui); font-size: 0.6rem; color: var(--text); white-space: nowrap; }
.leaderboard-table tr:first-child td { color: var(--pacman); }
.leaderboard-table tr:nth-child(2)  td { color: var(--neon-cyan); }
.leaderboard-table tr:nth-child(3)  td { color: var(--neon-green); }
.leaderboard-table tr:hover td { background: rgba(0,229,255,.04); }

.rank-badge { display: inline-block; font-family: var(--font-pixel); font-size: 0.38rem; padding: 2px 5px; border-radius: 3px; background: rgba(0,0,0,.4); border: 1px solid var(--border); }
.rank-1 { border-color: var(--pacman);    color: var(--pacman); }
.rank-2 { border-color: var(--neon-cyan); color: var(--neon-cyan); }
.rank-3 { border-color: var(--neon-green);color: var(--neon-green); }

.win-badge { display: inline-block; background: rgba(105,255,71,.15); color: var(--neon-green); border: 1px solid rgba(105,255,71,.3); border-radius: 3px; font-size: 0.38rem; padding: 2px 6px; }

.loading-text, .empty-text, .error-text { text-align: center; padding: 40px 0; font-family: var(--font-pixel); font-size: 0.5rem; letter-spacing: 2px; }
.loading-text { color: var(--text-muted); animation: blink 1s step-end infinite; }
.empty-text   { color: var(--text-muted); }
.error-text   { color: var(--neon-pink); }

@keyframes blink { 50% { opacity: 0; } }

/* ── Utility ─────────────────────────────────────────────── */
.hidden { display: none !important; }

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════ */

/* Mid-range: hide side panel, keep D-pad */
@media (max-width: 700px) {
  .side-panel { display: none; }
  .title      { font-size: 1.1rem; }
}

/* Small phones */
@media (max-width: 420px) {
  body { padding: 6px 2px 20px; }

  .game-card { padding: 10px; gap: 8px; }

  .info-bar   { justify-content: center; }
  .info-item  { min-width: 60px; }
  .info-value { font-size: 0.75rem; }

  #player-name { width: 150px; font-size: 0.45rem; }

  .dpad-btn    { width: 46px; height: 46px; font-size: 1.1rem; }
  .dpad-center { width: 46px; height: 46px; }

  .btn         { font-size: 0.45rem; padding: 8px 12px; }
}

/* Large screens: hide D-pad (keyboard preferred) */
@media (min-width: 900px) {
  .dpad { display: none; }
}