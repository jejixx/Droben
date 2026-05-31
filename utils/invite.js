const { PermissionFlagsBits } = require('discord.js');

/** Présélections de permissions pour le lien d'invitation */
const INVITE_PRESETS = {
  minimal: {
    label: 'Minimal',
    description: 'Envoyer des messages et utiliser les embeds',
    permissions: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.EmbedLinks,
      PermissionFlagsBits.ReadMessageHistory,
    ],
  },
  standard: {
    label: 'Standard',
    description: 'Minimal + expulser des membres (/kick)',
    permissions: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.EmbedLinks,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.KickMembers,
    ],
  },
  moderation: {
    label: 'Modération',
    description: 'Standard + bannir, modérer et gérer les messages',
    permissions: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.EmbedLinks,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.KickMembers,
      PermissionFlagsBits.BanMembers,
      PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.ManageMessages,
    ],
  },
  administrator: {
    label: 'Administrateur',
    description: 'Accès total au serveur',
    permissions: [PermissionFlagsBits.Administrator],
  },
};

/** Calcule le bitmask des permissions */
function combinePermissions(permissions) {
  return permissions.reduce((acc, flag) => acc | flag, 0n);
}

/** Génère l'URL d'invitation OAuth2 du bot */
function buildInviteUrl(clientId, permissions) {
  const params = new URLSearchParams({
    client_id: clientId,
    permissions: permissions.toString(),
    scope: 'bot applications.commands',
  });

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

/** Retourne preset + URL pour un niveau donné */
function getPresetInvite(presetKey, clientId) {
  const preset = INVITE_PRESETS[presetKey];
  if (!preset) return null;

  const permissions = combinePermissions(preset.permissions);
  const url = buildInviteUrl(clientId, permissions);

  return { preset, url };
}

module.exports = {
  INVITE_PRESETS,
  combinePermissions,
  buildInviteUrl,
  getPresetInvite,
};
