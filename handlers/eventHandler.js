const fs = require('fs');
const path = require('path');
const { logError, logWarn } = require('../utils/logger');

/**
 * Charge tous les événements du dossier events/ et les enregistre sur le client.
 * @param {import('discord.js').Client} client
 */
function loadEvents(client) {
  const eventsPath = path.join(__dirname, '..', 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);

    try {
      const event = require(filePath);

      if (!event.name || !event.execute) {
        logWarn(`Événement ignoré (structure invalide) : ${filePath}`);
        continue;
      }

      const handler = async (...args) => {
        try {
          await event.execute(...args, client);
        } catch (error) {
          logError(`event:${event.name}`, error);
        }
      };

      if (event.once) {
        client.once(event.name, handler);
      } else {
        client.on(event.name, handler);
      }
    } catch (error) {
      logError(`loadEvent:${file}`, error);
    }
  }
}

module.exports = { loadEvents };
