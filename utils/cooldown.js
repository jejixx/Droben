const DEFAULT_COOLDOWN_SECONDS = 3;

/** @type {Map<string, number>} clé `${userId}:${commandName}` → timestamp d'expiration */
const cooldowns = new Map();

/**
 * @param {string} userId
 * @param {string} commandName
 */
function cooldownKey(userId, commandName) {
  return `${userId}:${commandName}`;
}

/**
 * Durée de cooldown en secondes pour une commande.
 * @param {{ cooldown?: number }} command
 */
function getCommandCooldownSeconds(command) {
  if (typeof command.cooldown === 'number' && command.cooldown >= 0) {
    return command.cooldown;
  }

  return DEFAULT_COOLDOWN_SECONDS;
}

/**
 * Vérifie le cooldown et l'enregistre si la commande peut s'exécuter.
 * @param {string} userId
 * @param {string} commandName
 * @param {number} cooldownSeconds
 * @returns {{ allowed: true } | { allowed: false, remainingSeconds: number }}
 */
function consumeCooldown(userId, commandName, cooldownSeconds) {
  const key = cooldownKey(userId, commandName);
  const cooldownMs = cooldownSeconds * 1000;
  const expiresAt = cooldowns.get(key);

  if (expiresAt !== undefined && Date.now() < expiresAt) {
    return {
      allowed: false,
      remainingSeconds: Math.ceil((expiresAt - Date.now()) / 1000),
    };
  }

  const newExpiresAt = Date.now() + cooldownMs;
  cooldowns.set(key, newExpiresAt);

  setTimeout(() => {
    if (cooldowns.get(key) === newExpiresAt) {
      cooldowns.delete(key);
    }
  }, cooldownMs);

  return { allowed: true };
}

/**
 * @param {number} remainingSeconds
 */
function formatCooldownMessage(remainingSeconds) {
  return `⏳ Attends ${remainingSeconds}s avant de réutiliser cette commande.`;
}

module.exports = {
  DEFAULT_COOLDOWN_SECONDS,
  getCommandCooldownSeconds,
  consumeCooldown,
  formatCooldownMessage,
};
