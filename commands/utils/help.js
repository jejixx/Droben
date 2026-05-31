const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

/** Construit l'embed d'aide */
function buildHelpEmbed(commands) {
  const commandList = commands
    .map((cmd) => `• **${cmd.data.name}** — ${cmd.data.description}`)
    .sort()
    .join('\n');

  return new EmbedBuilder()
    .setColor(config.COLOR)
    .setTitle(`📖 Aide — ${config.BOT_NAME}`)
    .setDescription(commandList || 'Aucune commande disponible.')
    .addFields(
      { name: 'Version', value: config.VERSION, inline: true },
      { name: 'Préfixe', value: `\`${config.PREFIX}\``, inline: true },
    )
    .setFooter({ text: config.BOT_NAME })
    .setTimestamp();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche la liste des commandes disponibles'),

  async execute(interaction) {
    await interaction.reply({ embeds: [buildHelpEmbed(interaction.client.commands)] });
  },

  async executePrefix(message) {
    await message.reply({ embeds: [buildHelpEmbed(message.client.commands)] });
  },
};
