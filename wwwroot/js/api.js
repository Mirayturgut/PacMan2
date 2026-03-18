/* ============================================================
   api.js  –  Backend API communication layer
   ============================================================ */

'use strict';

const API = (() => {

  // Backend origin – when served from the same ASP.NET host, relative paths work.
  // Change BASE_URL if running frontend separately from backend.
  const BASE_URL = '';

  /**
   * Submit a finished game score to the backend.
   * @param {object} data - { playerName, game, points, isWin, durationSeconds }
   * @returns {Promise<object>} saved score record
   */
  async function submitScore(data) {
    const response = await fetch(`${BASE_URL}/api/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerName:      data.playerName,
        game:            data.game ?? 'pacman',
        points:          data.points,
        isWin:           data.isWin,
        durationSeconds: data.durationSeconds,
      }),
    });

    if (!response.ok) {
      let errMsg = 'Score kaydedilemedi.';
      try {
        const body = await response.json();
        errMsg = body.error ?? errMsg;
      } catch (_) { /* ignore parse errors */ }
      throw new Error(errMsg);
    }

    return response.json();
  }

  /**
   * Fetch per-player aggregated leaderboard.
   * @returns {Promise<object[]>} sorted summary array
   */
  async function getLeaderboard() {
    const response = await fetch(`${BASE_URL}/api/scores/summary`);

    if (!response.ok) {
      throw new Error(`Leaderboard yüklenemedi. (HTTP ${response.status})`);
    }

    return response.json();
  }

  /**
   * Fetch raw score records.
   * @returns {Promise<object[]>}
   */
  async function getRawScores() {
    const response = await fetch(`${BASE_URL}/api/scores/raw`);

    if (!response.ok) {
      throw new Error(`Kayıtlar yüklenemedi. (HTTP ${response.status})`);
    }

    return response.json();
  }

  /**
   * Health-check endpoint.
   * @returns {Promise<{status: string}>}
   */
  async function health() {
    const response = await fetch(`${BASE_URL}/api/health`);
    return response.json();
  }

  return { submitScore, getLeaderboard, getRawScores, health };

})();
