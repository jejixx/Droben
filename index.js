require('dotenv').config();

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const { logError, logWarn, logInfo } = require('./utils/logger');

// Client avec les intents nécessaires au fonctionnement du bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Collection des commandes slash chargées dynamiquement
client.commands = new Collection();

// Gestion globale des erreurs — évite les crashs silencieux
process.on('unhandledRejection', (error) => {
  logError('unhandledRejection', error);
});

process.on('uncaughtException', (error) => {
  logError('uncaughtException', error);
});

client.on('error', (error) => {
  logError('client', error);
});

client.on('warn', (message) => {
  logWarn(`Discord : ${message}`);
});

// Chargement des handlers
loadCommands(client);
loadEvents(client);

// Connexion au gateway Discord
if (!process.env.TOKEN) {
  logError('config', new Error('Variable TOKEN manquante dans le fichier .env'));
  process.exit(1);
}

client
  .login(process.env.TOKEN)
  .then(() => logInfo('✅ DroBen est en ligne !'))
  .catch((error) => {
    logError('login', error);
    process.exit(1);
  });
