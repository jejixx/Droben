const { Events, MessageFlags } = require('discord.js');
const {
  getCommandCooldownSeconds,
  consumeCooldown,
  formatCooldownMessage,
} = require('../utils/cooldown');
const { logError, logWarn, isKnownDiscordError } = require('../utils/logger');

function getInteractionContext(interaction) {
  return interaction.guild?.name ?? 'DM';
}

async function handleInteractionError(interaction, context, error) {
  if (isKnownDiscordError(error)) return;

  logError(context, error, { guild: getInteractionContext(interaction) });

  const payload = {
    content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
    flags: MessageFlags.Ephemeral,
  };

  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload);
    } else if (interaction.isMessageComponent() && !interaction.replied) {
      await interaction.reply(payload);
    } else if (interaction.isMessageComponent()) {
      await interaction.update({ content: payload.content, embeds: [], components: [] });
    } else {
      await interaction.reply(payload);
    }
  } catch (replyError) {
    if (!isKnownDiscordError(replyError)) {
      logError(`${context}:reply`, replyError, { guild: getInteractionContext(interaction) });
    }
  }
}

module.exports = {
  name: Events.InteractionCreate,
  /** @param {import('discord.js').Interaction} interaction */
  async execute(interaction, client) {
    // Menu déroulant — sélection des permissions /invite
    if (interaction.isStringSelectMenu()) {
      for (const command of client.commands.values()) {
        if (typeof command.handleSelectMenu !== 'function') continue;

        try {
          const handled = await command.handleSelectMenu(interaction);
          if (handled) return;
        } catch (error) {
          await handleInteractionError(interaction, `select:${interaction.customId}`, error);
          return;
        }
      }

      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      logWarn(`Commande slash inconnue : /${interaction.commandName} (${getInteractionContext(interaction)})`);
      return;
    }

    const cooldownResult = consumeCooldown(
      interaction.user.id,
      interaction.commandName,
      getCommandCooldownSeconds(command),
    );

    if (!cooldownResult.allowed) {
      return interaction.reply({
        content: formatCooldownMessage(cooldownResult.remainingSeconds),
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      await handleInteractionError(interaction, `/${interaction.commandName}`, error);
    }
  },
};
