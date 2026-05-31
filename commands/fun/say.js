const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

/** Construit l'embed du message say */
function buildSayEmbed(text, authorTag) {
  return new EmbedBuilder()
    .setColor(config.COLOR)
    .setDescription(text)
    .setFooter({ text: `Demandé par ${authorTag}` })
    .setTimestamp();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Fait parler le bot avec un message personnalisé')
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('Le message à envoyer')
        .setRequired(true)
        .setMaxLength(2000),
    ),

  async execute(interaction) {
    const text = interaction.options.getString('message', true);
    await interaction.reply({ embeds: [buildSayEmbed(text, interaction.user.tag)] });
  },

  async executePrefix(message, args) {
    const text = args.join(' ');

    if (!text) {
      return message.reply(`❌ Usage : \`${config.PREFIX}say <message>\``);
    }

    if (text.length > 2000) {
      return message.reply('❌ Le message ne peut pas dépasser 2000 caractères.');
    }

    await message.channel.send({ embeds: [buildSayEmbed(text, message.author.tag)] });
  },
};
