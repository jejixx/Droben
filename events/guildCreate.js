const { Events } = require('discord.js');
const { deployGuildCommands } = require('../utils/deployCommands');
const { logError, logInfo } = require('../utils/logger');

module.exports = {
  name: Events.GuildCreate,
  /** @param {import('discord.js').Guild} guild */
  async execute(guild, client) {
    logInfo(`📥 DroBen a rejoint « ${guild.name} » — déploiement des commandes slash...`);

    try {
      await deployGuildCommands(
        process.env.CLIENT_ID || client.user.id,
        process.env.TOKEN,
        guild.id,
        guild.name,
      );
    } catch (error) {
      logError(`deploy:guildCreate:${guild.name}`, error);
    }
  },
};
