const fs = require('fs');
const path = require('path');
const { logError, logWarn } = require('../utils/logger');

/**
 * Charge récursivement toutes les commandes du dossier commands/
 * et les ajoute à client.commands (Collection).
 * @param {import('discord.js').Client} client
 */
function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.js')) {
        try {
          const command = require(fullPath);

          if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
          } else {
            logWarn(`Commande ignorée (structure invalide) : ${fullPath}`);
          }
        } catch (error) {
          logError(`loadCommand:${entry.name}`, error);
        }
      }
    }
  }

  walk(commandsPath);
}

module.exports = { loadCommands };
