const { Events } = require('discord.js');
const config = require('../config');
const { deployToAllGuilds } = require('../utils/deployCommands');
const { logInfo } = require('../utils/logger');

module.exports = {
  name: Events.ClientReady,
  once: true,
  /** @param {import('discord.js').Client} client */
  async execute(client) {
    logInfo(`🤖 ${client.user.tag} — ${config.BOT_NAME} v${config.VERSION}`);
    logInfo(`📊 Présent sur ${client.guilds.cache.size} serveur(s)`);

    // Synchronise les slash commands sur tous les serveurs existants
    await deployToAllGuilds(client);
  },
};
