require('dotenv').config();

const { logError, logInfo } = require('./utils/logger');
const { collectCommandDefinitions, deployGuildCommands } = require('./utils/deployCommands');

const { CLIENT_ID, GUILD_ID, TOKEN } = process.env;

if (!TOKEN || !CLIENT_ID) {
  logError('deploy', new Error('Variables TOKEN et CLIENT_ID requises dans .env'));
  process.exit(1);
}

if (!GUILD_ID) {
  logError('deploy', new Error('Variable GUILD_ID requise pour un déploiement manuel (npm run deploy)'));
  process.exit(1);
}

try {
  const commands = collectCommandDefinitions();

  if (commands.length === 0) {
    logError('deploy', new Error('Aucune commande trouvée dans commands/'));
    process.exit(1);
  }

  deployGuildCommands(CLIENT_ID, TOKEN, GUILD_ID)
    .catch((error) => {
      logError('deploy', error);
      process.exit(1);
    });
} catch (error) {
  logError('deploy:collect', error);
  process.exit(1);
}
