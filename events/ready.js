const { Events } = require('discord.js');
const config = require('../config');
const { logInfo } = require('../utils/logger');

module.exports = {
  name: Events.ClientReady,
  once: true,
  /** @param {import('discord.js').Client} client */
  execute(client) {
    logInfo(`🤖 ${client.user.tag} — ${config.BOT_NAME} v${config.VERSION}`);
    logInfo(`📊 Présent sur ${client.guilds.cache.size} serveur(s)`);
  },
};
