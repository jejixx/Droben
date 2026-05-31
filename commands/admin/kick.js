const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require('discord.js');
const config = require('../../config');

/** Logique commune d'expulsion d'un membre */
async function kickMember(guild, targetUser, moderator, reason) {
  const member = await guild.members.fetch(targetUser.id);

  if (targetUser.id === moderator.id) {
    return { error: '❌ Vous ne pouvez pas vous expulser vous-même.' };
  }

  if (targetUser.id === guild.client.user.id) {
    return { error: '❌ Je ne peux pas m\'expulser moi-même.' };
  }

  if (!member.kickable) {
    return {
      error: '❌ Je n\'ai pas la permission d\'expulser ce membre (rôle trop élevé ou permissions manquantes).',
    };
  }

  await member.kick(reason);

  const embed = new EmbedBuilder()
    .setColor(config.COLOR)
    .setTitle('👢 Membre expulsé')
    .addFields(
      { name: 'Membre', value: `${targetUser.tag} (\`${targetUser.id}\`)`, inline: true },
      { name: 'Modérateur', value: `${moderator.tag}`, inline: true },
      { name: 'Raison', value: reason },
    )
    .setFooter({ text: config.BOT_NAME })
    .setTimestamp();

  return { embed };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulse un membre du serveur')
    .addUserOption((option) =>
      option
        .setName('membre')
        .setDescription('Le membre à expulser')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('raison')
        .setDescription('Raison de l\'expulsion')
        .setRequired(false)
        .setMaxLength(512),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('membre', true);
    const reason = interaction.options.getString('raison') ?? 'Aucune raison fournie';

    const result = await kickMember(
      interaction.guild,
      targetUser,
      interaction.user,
      reason,
    );

    if (result.error) {
      return interaction.reply({ content: result.error, flags: MessageFlags.Ephemeral });
    }

    await interaction.reply({ embeds: [result.embed] });
  },

  async executePrefix(message, args) {
    if (!message.member?.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply('❌ Vous n\'avez pas la permission d\'expulser des membres.');
    }

    const targetUser = message.mentions.users.first();

    if (!targetUser) {
      return message.reply(`❌ Usage : \`${config.PREFIX}kick @membre [raison]\``);
    }

    const reason = args.filter((arg) => !arg.includes(targetUser.id)).join(' ') || 'Aucune raison fournie';

    const result = await kickMember(message.guild, targetUser, message.author, reason);

    if (result.error) {
      return message.reply(result.error);
    }

    await message.reply({ embeds: [result.embed] });
  },
};
