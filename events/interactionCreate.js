const { Events, MessageFlags } = require('discord.js');
const { logError, logWarn, isKnownDiscordError } = require('../utils/logger');

module.exports = {
  name: Events.InteractionCreate,
  /** @param {import('discord.js').Interaction} interaction */
  async execute(interaction, client) {
    // Ne traiter que les commandes slash (ChatInput)
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      logWarn(`Commande slash inconnue : /${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      logError(`/${interaction.commandName}`, error);

      // Ne pas tenter de répondre si l'interaction est déjà expirée ou traitée
      if (isKnownDiscordError(error)) return;

      const payload = {
        content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
        flags: MessageFlags.Ephemeral,
      };

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(payload);
        } else {
          await interaction.reply(payload);
        }
      } catch (replyError) {
        if (!isKnownDiscordError(replyError)) {
          logError(`/${interaction.commandName}:reply`, replyError);
        }
      }
    }
  },
};
