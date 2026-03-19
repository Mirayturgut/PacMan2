/* ============================================================
   ui.js  –  UI management: modal, leaderboard, overlays, HUD
   ============================================================ */

'use strict';

const UI = (() => {

  // ── Element references ────────────────────────────────────
  const els = {};

  function init() {
    els.scoreVal      = document.getElementById('score-value');
    els.livesDisplay  = document.getElementById('lives-display');
    els.timerVal      = document.getElementById('timer-value');
    els.statusMsg     = document.getElementById('status-message');
    els.overlay       = document.getElementById('canvas-overlay');
    els.overlayTitle  = document.getElementById('overlay-title');
    els.overlayScore  = document.getElementById('overlay-score');
    els.startBtn      = document.getElementById('btn-start');
    els.restartBtn    = document.getElementById('btn-restart');
    els.leaderBtn     = document.getElementById('btn-leaderboard');
    els.playerInput   = document.getElementById('player-name');
    els.modal         = document.getElementById('leaderboard-modal');
    els.modalBody     = document.getElementById('modal-body');
    els.modalClose    = document.getElementById('modal-close');
    els.powerBarWrap  = document.getElementById('power-bar-wrap');
    els.powerBarFill  = document.getElementById('power-bar-fill');

    // Modal events
    els.modalClose.addEventListener('click', hideModal);
    els.modal.addEventListener('click', (e) => {
      if (e.target === els.modal) hideModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && els.modal.classList.contains('open')) hideModal();
    });

    // Leaderboard button
    els.leaderBtn.addEventListener('click', openLeaderboard);
  }

  // ── Score / HUD ───────────────────────────────────────────

  function updateScore(score) {
    if (els.scoreVal) els.scoreVal.textContent = score.toLocaleString();
  }

  function updateLives(lives) {
    if (!els.livesDisplay) return;
    els.livesDisplay.innerHTML = '';
    for (let i = 0; i < lives; i++) {
      const icon = document.createElement('div');
      icon.className = 'life-icon';
      els.livesDisplay.appendChild(icon);
    }
  }

  function updateTimer(seconds) {
    if (!els.timerVal) return;
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    els.timerVal.textContent = `${m}:${s}`;
  }

  function setStatus(text, cls) {
    if (!els.statusMsg) return;
    els.statusMsg.textContent = text;
    els.statusMsg.className = '';
    if (cls) els.statusMsg.classList.add(`status-${cls}`);
  }

  // ── Power bar ─────────────────────────────────────────────

  function showPowerBar(fraction) {
    if (!els.powerBarWrap) return;
    els.powerBarWrap.classList.remove('hidden');
    els.powerBarFill.style.width = `${Math.max(0, fraction * 100).toFixed(1)}%`;
  }

  function hidePowerBar() {
    if (!els.powerBarWrap) return;
    els.powerBarWrap.classList.add('hidden');
  }

  // ── Canvas overlay ────────────────────────────────────────

  function showOverlay(title, titleClass, scoreText, showRestart, showStart) {
    if (!els.overlay) return;
    els.overlayTitle.textContent   = title;
    els.overlayTitle.className     = `overlay-title${titleClass ? ' ' + titleClass : ''}`;
    els.overlayScore.innerHTML     = scoreText || '';
    els.restartBtn.classList.toggle('hidden', !showRestart);
    els.startBtn.closest('.player-input-row').classList.toggle('hidden', !showStart);
    els.overlay.classList.remove('hidden');
  }

  function hideOverlay() {
    if (!els.overlay) return;
    els.overlay.classList.add('hidden');
  }

  // ── Leaderboard modal ─────────────────────────────────────

  function showModal() {
    els.modal.classList.add('open');
    els.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    els.modalClose.focus();
  }

  function hideModal() {
    els.modal.classList.remove('open');
    els.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  async function openLeaderboard() {
    showModal();
    els.modalBody.innerHTML = '<p class="loading-text">YÜKLENİYOR...</p>';

    try {
      const data = await API.getLeaderboard();
      renderLeaderboard(data);
    } catch (err) {
      els.modalBody.innerHTML = `<p class="error-text">⚠ ${err.message}</p>`;
    }
  }

  function renderLeaderboard(rows) {
    if (!rows || rows.length === 0) {
      els.modalBody.innerHTML = '<p class="empty-text">Henüz kayıt yok. İlk sen ol!</p>';
      return;
    }

    const medals = ['🥇', '🥈', '🥉'];

    const html = `
      <table class="leaderboard-table" aria-label="Leaderboard">
        <thead>
          <tr>
            <th>#</th>
            <th>OYUNCU</th>
            <th>TOPLAM SKOR</th>
            <th>OYUN</th>
            <th>KAZANMA</th>
            <th>EN İYİ SKOR</th>
            <th>SON OYNAMA</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, i) => {
            const rank     = i + 1;
            const medal    = medals[i] ?? '';
            const rankCls  = rank <= 3 ? `rank-${rank}` : '';
            const lastDate = row.lastPlayedAtUtc
              ? new Date(row.lastPlayedAtUtc + 'Z').toLocaleString('tr-TR', {
                 timeZone: 'Europe/Istanbul',
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })
              : '–';

            return `
              <tr>
                <td><span class="rank-badge ${rankCls}">${medal || rank}</span></td>
                <td><strong>${escapeHtml(row.playerName)}</strong></td>
                <td>${row.totalScore.toLocaleString()}</td>
                <td>${row.totalGames}</td>
                <td>
                  ${row.totalWins}
                  <span class="win-badge">${Math.round((row.totalWins / row.totalGames) * 100)}%</span>
                </td>
                <td>${row.bestScore.toLocaleString()}</td>
                <td>${lastDate}</td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>`;

    els.modalBody.innerHTML = html;
  }

  // ── Helpers ───────────────────────────────────────────────

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getPlayerName() {
    return (els.playerInput?.value ?? '').trim();
  }

  function showNameError() {
    if (!els.playerInput) return;
    els.playerInput.style.borderColor = '#ff4081';
    els.playerInput.focus();
    setTimeout(() => {
      els.playerInput.style.borderColor = '';
    }, 1500);
  }

  function setScoreSubmitFeedback(success, msg) {
    if (els.overlayScore) {
      const color = success ? 'var(--neon-green)' : 'var(--neon-pink)';
      els.overlayScore.innerHTML += `<br><span style="color:${color};font-size:0.45rem">${escapeHtml(msg)}</span>`;
    }
  }

  return {
    init,
    updateScore,
    updateLives,
    updateTimer,
    setStatus,
    showPowerBar,
    hidePowerBar,
    showOverlay,
    hideOverlay,
    showModal,
    hideModal,
    getPlayerName,
    showNameError,
    setScoreSubmitFeedback,
  };

})();
