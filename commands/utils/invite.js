const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  MessageFlags,
} = require('discord.js');
const config = require('../../config');
const { INVITE_PRESETS, getPresetInvite } = require('../../utils/invite');

const SELECT_CUSTOM_ID = 'invite_permissions';

function getClientId(client) {
  return process.env.CLIENT_ID || client.user.id;
}

/** Embed affiché après sélection d'un niveau */
function buildInviteEmbed(presetKey, clientId) {
  const result = getPresetInvite(presetKey, clientId);
  if (!result) return null;

  const { preset, url } = result;

  return new EmbedBuilder()
    .setColor(config.COLOR)
    .setTitle(`🔗 Inviter ${config.BOT_NAME} — ${preset.label}`)
    .setDescription(`${preset.description}\n\n[Lien d'invitation](${url})`)
    .addFields({ name: 'Lien', value: `\`${url}\`` })
    .setFooter({ text: config.BOT_NAME })
    .setTimestamp();
}

/** Embed initial avec instructions */
function buildSelectorEmbed() {
  return new EmbedBuilder()
    .setColor(config.COLOR)
    .setTitle(`🔗 Inviter ${config.BOT_NAME}`)
    .setDescription('Sélectionnez ci-dessous les permissions que le bot aura sur le serveur cible.')
    .setFooter({ text: config.BOT_NAME })
    .setTimestamp();
}

/** Menu déroulant des niveaux de permissions */
function buildPermissionSelect() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(SELECT_CUSTOM_ID)
      .setPlaceholder('Choisissez un niveau de permissions')
      .addOptions(
        Object.entries(INVITE_PRESETS).map(([value, preset]) => ({
          label: preset.label,
          description: preset.description.slice(0, 100),
          value,
        })),
      ),
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Génère un lien pour inviter DroBen avec les permissions choisies')
    .addStringOption((option) =>
      option
        .setName('permissions')
        .setDescription('Niveau de permissions (optionnel — sinon menu de sélection)')
        .setRequired(false)
        .addChoices(
          { name: 'Minimal', value: 'minimal' },
          { name: 'Standard', value: 'standard' },
          { name: 'Modération', value: 'moderation' },
          { name: 'Administrateur', value: 'administrator' },
        ),
    ),

  async execute(interaction) {
    const clientId = getClientId(interaction.client);
    const presetKey = interaction.options.getString('permissions');

    // Réponse immédiate pour respecter la limite de 3 s de Discord
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (presetKey) {
      const embed = buildInviteEmbed(presetKey, clientId);

      if (!embed) {
        return interaction.editReply({ content: '❌ Niveau de permissions invalide.', embeds: [], components: [] });
      }

      return interaction.editReply({ embeds: [embed], components: [] });
    }

    await interaction.editReply({
      embeds: [buildSelectorEmbed()],
      components: [buildPermissionSelect()],
    });
  },

  async executePrefix(message, args) {
    const clientId = getClientId(message.client);
    const presetKey = args[0]?.toLowerCase();

    if (presetKey && !INVITE_PRESETS[presetKey]) {
      const available = Object.keys(INVITE_PRESETS).join(', ');
      return message.reply(`❌ Niveau invalide. Valeurs : \`${available}\``);
    }

    if (presetKey) {
      const embed = buildInviteEmbed(presetKey, clientId);
      return message.reply({ embeds: [embed] });
    }

    await message.reply({
      embeds: [buildSelectorEmbed()],
      components: [buildPermissionSelect()],
    });
  },

  /** Gère le menu déroulant — retourne true si l'interaction est traitée */
  async handleSelectMenu(interaction) {
    if (interaction.customId !== SELECT_CUSTOM_ID) return false;

    const embed = buildInviteEmbed(interaction.values[0], getClientId(interaction.client));

    if (!embed) {
      await interaction.update({
        content: '❌ Niveau de permissions invalide.',
        embeds: [],
        components: [],
      });
      return true;
    }

    await interaction.update({ embeds: [embed], components: [] });
    return true;
  },
};
