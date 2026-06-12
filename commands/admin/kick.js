const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require('discord.js');
const config = require('../../config');

const HIERARCHY_ERROR =
  '❌ Tu ne peux pas expulser un membre de rang égal ou supérieur au tien.';

/**
 * Vérifie que le modérateur peut expulser la cible (hiérarchie des rôles).
 * @param {import('discord.js').Guild} guild
 * @param {import('discord.js').GuildMember} moderatorMember
 * @param {import('discord.js').GuildMember} targetMember
 * @returns {string|null} Message d'erreur ou null si autorisé
 */
function checkModeratorHierarchy(guild, moderatorMember, targetMember) {
  if (guild.ownerId === moderatorMember.id) {
    return null;
  }

  if (
    moderatorMember.roles.highest.comparePositionTo(targetMember.roles.highest) <= 0
  ) {
    return HIERARCHY_ERROR;
  }

  return null;
}

/** Logique commune d'expulsion d'un membre */
async function kickMember(guild, targetMember, moderatorMember, reason) {
  const targetUser = targetMember.user;
  const moderator = moderatorMember.user;

  if (targetUser.id === moderator.id) {
    return { error: '❌ Vous ne pouvez pas vous expulser vous-même.' };
  }

  if (targetUser.id === guild.client.user.id) {
    return { error: '❌ Je ne peux pas m\'expulser moi-même.' };
  }

  const hierarchyError = checkModeratorHierarchy(guild, moderatorMember, targetMember);

  if (hierarchyError) {
    return { error: hierarchyError };
  }

  if (!targetMember.kickable) {
    return {
      error: '❌ Je n\'ai pas la permission d\'expulser ce membre (rôle trop élevé ou permissions manquantes).',
    };
  }

  await targetMember.kick(reason);

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
    const moderatorMember = interaction.member;

    if (!moderatorMember || !interaction.guild) {
      return interaction.reply({
        content: '❌ Cette commande ne peut être utilisée que sur un serveur.',
        flags: MessageFlags.Ephemeral,
      });
    }

    let targetMember;

    try {
      targetMember = await interaction.guild.members.fetch(targetUser.id);
    } catch {
      return interaction.reply({
        content: '❌ Ce membre n\'est pas sur ce serveur.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const result = await kickMember(
      interaction.guild,
      targetMember,
      moderatorMember,
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

    let targetMember;

    try {
      targetMember = await message.guild.members.fetch(targetUser.id);
    } catch {
      return message.reply('❌ Ce membre n\'est pas sur ce serveur.');
    }

    const result = await kickMember(message.guild, targetMember, message.member, reason);

    if (result.error) {
      return message.reply(result.error);
    }

    await message.reply({ embeds: [result.embed] });
  },
};
