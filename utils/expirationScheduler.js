const config = require('../config');
const { logError, logInfo, logWarn } = require('./logger');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** @type {NodeJS.Timeout|null} */
let intervalHandle = null;

async function callProcessExpirations() {
  const baseUrl = (config.NEXTJS_INTERNAL_URL || '').replace(/\/$/, '');
  const secret = config.INTERNAL_API_SECRET;

  if (!baseUrl) {
    logWarn('Scheduler expiration : NEXTJS_INTERNAL_URL non configuré — ignoré.');
    return;
  }

  if (!secret) {
    logWarn('Scheduler expiration : INTERNAL_API_SECRET non configuré — ignoré.');
    return;
  }

  const url = `${baseUrl}/api/internal/process-expirations`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      let detail = `HTTP ${res.status}`;

      try {
        const body = await res.json();
        if (body?.error) detail = body.error;
      } catch {
        // corps non JSON
      }

      logError('expiration-scheduler', new Error(`supp-gap a répondu ${detail}`));
      return;
    }

    const data = await res.json();
    const processed = typeof data?.processed === 'number' ? data.processed : 0;

    logInfo(`📅 Expirations pass prépayé traitées : ${processed}`);
  } catch (error) {
    logError('expiration-scheduler', error);
  }
}

/** Démarre l'appel quotidien à supp-gap pour révoquer les passes expirés. */
function startExpirationScheduler() {
  if (intervalHandle) {
    logInfo('ℹ️ Scheduler d\'expiration déjà démarré.');
    return;
  }

  intervalHandle = setInterval(() => {
    void callProcessExpirations();
  }, ONE_DAY_MS);

  logInfo(`📅 Scheduler d'expiration pass prépayé — intervalle 24h (${config.NEXTJS_INTERNAL_URL || 'non configuré'})`);
}

module.exports = { startExpirationScheduler, callProcessExpirations };
