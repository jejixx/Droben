require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const { logError, logWarn, logInfo } = require('./utils/logger');

const { CLIENT_ID, GUILD_ID, TOKEN } = process.env;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  logError('deploy', new Error('Variables TOKEN, CLIENT_ID et GUILD_ID requises dans .env'));
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

/**
 * Parcourt récursivement le dossier commands/ et collecte les définitions slash.
 * @param {string} dir - Chemin du dossier à parcourir
 */
function collectCommands(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      collectCommands(fullPath);
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

try {
  collectCommands(commandsPath);

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  logInfo(`🔄 Déploiement de ${commands.length} commande(s) sur le serveur de dev...`);

  rest
    .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
    .then(() => logInfo('✅ Commandes slash enregistrées avec succès !'))
    .catch((error) => {
      logError('deploy', error);
      process.exit(1);
    });
} catch (error) {
  logError('deploy:collect', error);
  process.exit(1);
}
