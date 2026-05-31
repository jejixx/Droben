const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const { logError, logInfo, logWarn } = require('./logger');

const commandsPath = path.join(__dirname, '..', 'commands');

/** @type {import('discord.js').RESTPostAPIChatInputApplicationCommandsJSONBody[]|null} */
let cachedDefinitions = null;

/**
 * Collecte les définitions slash depuis le dossier commands/.
 * @returns {import('discord.js').RESTPostAPIChatInputApplicationCommandsJSONBody[]}
 */
function collectCommandDefinitions() {
  if (cachedDefinitions) return cachedDefinitions;

  const commands = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.js')) {
        const command = require(fullPath);

        if ('data' in command && 'execute' in command) {
          commands.push(command.data.toJSON());
        } else {
          logWarn(`Commande ignorée (structure invalide) : ${fullPath}`);
        }
      }
    }
  }

  walk(commandsPath);
  cachedDefinitions = commands;

  return commands;
}

/**
 * Déploie les slash commands sur un serveur donné.
 * @param {string} clientId - ID de l'application Discord
 * @param {string} token - Token du bot
 * @param {string} guildId - ID du serveur cible
 * @param {string} [guildName] - Nom du serveur (pour les logs)
 */
async function deployGuildCommands(clientId, token, guildId, guildName = guildId) {
  const rest = new REST({ version: '10' }).setToken(token);
  const commands = collectCommandDefinitions();

  logInfo(`🔄 Déploiement de ${commands.length} commande(s) sur « ${guildName} »...`);

  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });

  logInfo(`✅ Commandes enregistrées sur « ${guildName} »`);
}

/**
 * Déploie les slash commands sur tous les serveurs du bot.
 * @param {import('discord.js').Client} client
 */
async function deployToAllGuilds(client) {
  const clientId = process.env.CLIENT_ID || client.user.id;
  const token = process.env.TOKEN;

  if (!token) {
    logError('deploy', new Error('Variable TOKEN manquante'));
    return;
  }

  const guilds = [...client.guilds.cache.values()];

  if (guilds.length === 0) {
    logWarn('Aucun serveur à synchroniser.');
    return;
  }

  logInfo(`📡 Synchronisation des commandes sur ${guilds.length} serveur(s)...`);

  for (const guild of guilds) {
    try {
      await deployGuildCommands(clientId, token, guild.id, guild.name);
    } catch (error) {
      logError(`deploy:${guild.name}`, error);
    }
  }
}

module.exports = {
  collectCommandDefinitions,
  deployGuildCommands,
  deployToAllGuilds,
};
