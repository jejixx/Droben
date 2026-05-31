const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

/** Construit l'embed de latence */
function buildPingEmbed(latency, apiLatency) {
  return new EmbedBuilder()
    .setColor(config.COLOR)
    .setTitle('🏓 Pong !')
    .addFields(
      { name: 'Latence bot', value: `\`${latency}ms\``, inline: true },
      { name: 'Latence API', value: `\`${apiLatency}ms\``, inline: true },
    )
    .setFooter({ text: config.BOT_NAME })
    .setTimestamp();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Affiche la latence du bot et de l\'API Discord'),

  async execute(interaction) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.COLOR)
          .setTitle('🏓 Pong !')
          .setDescription('Calcul de la latence en cours...'),
      ],
    });

    const sent = await interaction.fetchReply();
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    await interaction.editReply({ embeds: [buildPingEmbed(latency, apiLatency)] });
  },

  async executePrefix(message) {
    const sent = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.COLOR)
          .setTitle('🏓 Pong !')
          .setDescription('Calcul de la latence en cours...'),
      ],
    });

    const latency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(message.client.ws.ping);

    await sent.edit({ embeds: [buildPingEmbed(latency, apiLatency)] });
  },
};
