const { Events } = require('discord.js');
const config = require('../config');
const {
  getCommandCooldownSeconds,
  consumeCooldown,
  formatCooldownMessage,
} = require('../utils/cooldown');
const { logError } = require('../utils/logger');

module.exports = {
  name: Events.MessageCreate,
  /** @param {import('discord.js').Message} message */
  async execute(message, client) {
    // Ignorer les bots et les messages sans préfixe
    if (message.author.bot || !message.content.startsWith(config.PREFIX)) return;

    const args = message.content.slice(config.PREFIX.length).trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    const command = client.commands.get(commandName);

    if (!command?.executePrefix) return;

    const cooldownResult = consumeCooldown(
      message.author.id,
      commandName,
      getCommandCooldownSeconds(command),
    );

    if (!cooldownResult.allowed) {
      return message.reply(formatCooldownMessage(cooldownResult.remainingSeconds));
    }

    try {
      await command.executePrefix(message, args, client);
    } catch (error) {
      logError(`${config.PREFIX}${commandName}`, error);

      await message
        .reply('❌ Une erreur est survenue lors de l\'exécution de cette commande.')
        .catch((replyError) => logError(`${config.PREFIX}${commandName}:reply`, replyError));
    }
  },
};
