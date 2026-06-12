const {
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');
const config = require('../config');

const ROLE_NAME_MAX = 100;
const CHANNEL_NAME_MAX = 100;

/**
 * @param {import('discord.js').Client} client
 */
async function resolveGuild(client) {
  const guildId = config.SUPPGAP_GUILD_ID;

  if (!guildId) {
    throw new Error('SUPPGAP_GUILD_ID non configuré');
  }

  return client.guilds.fetch(guildId);
}

/** @param {string|undefined|null} value */
function truncateName(value, max = ROLE_NAME_MAX) {
  if (!value || typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

/** @param {string|undefined|null} hex */
function parseHexColor(hex) {
  if (!hex || typeof hex !== 'string') return null;

  const match = hex.match(/^#([0-9a-fA-F]{6})$/);
  if (!match) return null;

  return Number.parseInt(match[1], 16);
}

/**
 * @param {import('discord.js').Guild} guild
 * @param {import('discord.js').GuildMember} member
 */
function buildVoiceOverwrites(guild, member) {
  return [
    {
      id: guild.id,
      deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
    },
    {
      id: member.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageRoles,
      ],
    },
  ];
}

/**
 * @param {import('discord.js').Guild} guild
 * @param {import('discord.js').GuildMember} member
 * @param {string|undefined|null} existingRoleId
 * @param {string|undefined|null} roleName
 * @param {string|undefined|null} roleColor
 */
async function ensureCustomRole(guild, member, existingRoleId, roleName, roleColor) {
  if (existingRoleId) {
    const existing = await guild.roles.fetch(existingRoleId).catch(() => null);

    if (existing) {
      if (!member.roles.cache.has(existing.id)) {
        await member.roles.add(existing, 'SUPP GAP Premium — attribution rôle personnalisé');
      }

      return existing.id;
    }
  }

  const name = truncateName(roleName || member.user.username) || member.user.username;
  const color = parseHexColor(roleColor);

  const role = await guild.roles.create({
    name,
    color: color ?? undefined,
    reason: 'SUPP GAP Premium — rôle personnalisé',
  });

  await member.roles.add(role, 'SUPP GAP Premium — attribution rôle personnalisé');

  return role.id;
}

/**
 * @param {import('discord.js').Guild} guild
 * @param {import('discord.js').GuildMember} member
 * @param {string|undefined|null} existingChannelId
 * @param {string} channelName
 */
async function ensureVoiceChannel(guild, member, existingChannelId, channelName) {
  const name = truncateName(channelName, CHANNEL_NAME_MAX) || member.user.username;
  const overwrites = buildVoiceOverwrites(guild, member);

  if (existingChannelId) {
    const existing = await guild.channels.fetch(existingChannelId).catch(() => null);

    if (existing?.type === ChannelType.GuildVoice) {
      await existing.permissionOverwrites.set(overwrites);
      return existing.id;
    }
  }

  const channel = await guild.channels.create({
    name,
    type: ChannelType.GuildVoice,
    parent: config.SUBSCRIBER_CATEGORY_ID || undefined,
    permissionOverwrites: overwrites,
    reason: 'SUPP GAP Premium — salon vocal privé',
  });

  return channel.id;
}

/**
 * @param {import('discord.js').Client} client
 * @param {{ discordId: string, roleId?: string|null, channelId?: string|null, roleName?: string|null, roleColor?: string|null }} payload
 */
async function provision(client, payload) {
  const { discordId, roleId, channelId, roleName, roleColor } = payload;

  if (!discordId) {
    throw new Error('discordId requis');
  }

  if (!config.PREMIUM_ROLE_ID) {
    throw new Error('PREMIUM_ROLE_ID non configuré');
  }

  const guild = await resolveGuild(client);

  let member;

  try {
    member = await guild.members.fetch(discordId);
  } catch {
    return {
      provisioned: false,
      reason: 'member_absent',
      roleId: roleId ?? null,
      channelId: channelId ?? null,
    };
  }

  const premiumRole = await guild.roles.fetch(config.PREMIUM_ROLE_ID);

  if (!premiumRole) {
    throw new Error(`Rôle Premium introuvable (${config.PREMIUM_ROLE_ID})`);
  }

  if (!member.roles.cache.has(premiumRole.id)) {
    await member.roles.add(premiumRole, 'SUPP GAP Premium — abonnement actif');
  }

  const resolvedRoleId = await ensureCustomRole(
    guild,
    member,
    roleId,
    roleName,
    roleColor,
  );

  const channelLabel = truncateName(roleName || member.user.username) || member.user.username;
  const resolvedChannelId = await ensureVoiceChannel(
    guild,
    member,
    channelId,
    channelLabel,
  );

  return {
    provisioned: true,
    roleId: resolvedRoleId,
    channelId: resolvedChannelId,
  };
}

/**
 * @param {import('discord.js').Client} client
 * @param {{ roleId: string, channelId?: string|null, roleName?: string|null, roleColor?: string|null }} payload
 */
async function customize(client, payload) {
  const { roleId, channelId, roleName, roleColor } = payload;

  if (!roleId) {
    return { ok: false, error: 'roleId requis' };
  }

  const guild = await resolveGuild(client);
  const role = await guild.roles.fetch(roleId).catch(() => null);

  if (!role) {
    return { ok: false, error: 'role_not_found' };
  }

  const editPayload = {};

  if (roleName) {
    editPayload.name = truncateName(roleName);
  }

  const color = parseHexColor(roleColor);

  if (color != null) {
    editPayload.color = color;
  }

  if (Object.keys(editPayload).length > 0) {
    await role.edit({
      ...editPayload,
      reason: 'SUPP GAP Premium — personnalisation',
    });
  }

  if (roleName && channelId) {
    const channel = await guild.channels.fetch(channelId).catch(() => null);

    if (channel?.type === ChannelType.GuildVoice) {
      await channel.setName(
        truncateName(roleName, CHANNEL_NAME_MAX),
        'SUPP GAP Premium — renommage salon vocal',
      );
    }
  }

  return { ok: true };
}

/**
 * @param {import('discord.js').Client} client
 * @param {{ discordId: string, roleId?: string|null, channelId?: string|null }} payload
 */
async function remove(client, payload) {
  const { discordId, roleId, channelId } = payload;

  if (!discordId) {
    throw new Error('discordId requis');
  }

  const guild = await resolveGuild(client);

  if (config.PREMIUM_ROLE_ID) {
    const member = await guild.members.fetch(discordId).catch(() => null);

    if (member?.roles.cache.has(config.PREMIUM_ROLE_ID)) {
      await member.roles
        .remove(config.PREMIUM_ROLE_ID, 'SUPP GAP Premium — révocation')
        .catch(() => {});
    }
  }

  if (roleId) {
    const role = await guild.roles.fetch(roleId).catch(() => null);

    if (role) {
      await role.delete('SUPP GAP Premium — suppression rôle personnalisé').catch(() => {});
    }
  }

  if (channelId) {
    const channel = await guild.channels.fetch(channelId).catch(() => null);

    if (channel) {
      await channel.delete('SUPP GAP Premium — suppression salon vocal').catch(() => {});
    }
  }

  return { ok: true };
}

module.exports = { provision, customize, remove };
