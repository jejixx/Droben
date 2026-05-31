/** Erreurs Discord fréquentes — message explicite sans stack trace */
const DISCORD_ERROR_HINTS = {
  10062: 'Interaction expirée (>3 s sans réponse)',
  40060: 'Interaction déjà traitée',
  50013: 'Permissions insuffisantes',
  50007: 'Impossible d\'envoyer un message à cet utilisateur',
  10008: 'Message introuvable',
  10003: 'Canal introuvable',
  10004: 'Serveur introuvable',
  10002: 'Application inconnue (CLIENT_ID incorrect ?)',
};

/**
 * Extrait le code d'erreur Discord si disponible.
 * @param {unknown} error
 * @returns {number|undefined}
 */
function getErrorCode(error) {
  if (error && typeof error === 'object' && 'code' in error) {
    return /** @type {{ code: number }} */ (error).code;
  }

  return undefined;
}

/**
 * Indique si l'erreur est une erreur Discord connue et non critique.
 * @param {unknown} error
 */
function isKnownDiscordError(error) {
  const code = getErrorCode(error);
  return code != null && code in DISCORD_ERROR_HINTS;
}

/**
 * Affiche une erreur formatée dans la console.
 * @param {string} context - Contexte (ex: "/help", "event:interactionCreate")
 * @param {unknown} error
 */
function logError(context, error) {
  const err = error instanceof Error ? error : new Error(String(error));
  const code = getErrorCode(err);
  const hint = code != null ? DISCORD_ERROR_HINTS[code] : null;
  const message = err.message || 'Erreur inconnue';

  const details = [`❌ [${context}]`, message];

  if (code != null) details.push(`(code ${code})`);
  if (hint) details.push(`— ${hint}`);

  console.error(details.join(' '));

  // Stack trace uniquement pour les erreurs inattendues
  if (!isKnownDiscordError(err) && err.stack) {
    console.error(err.stack);
  }
}

/**
 * Affiche un avertissement dans la console.
 * @param {string} message
 */
function logWarn(message) {
  console.warn(`⚠️ ${message}`);
}

/**
 * Affiche une info dans la console.
 * @param {string} message
 */
function logInfo(message) {
  console.log(message);
}

module.exports = {
  logError,
  logWarn,
  logInfo,
  isKnownDiscordError,
  getErrorCode,
};
