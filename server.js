const express = require('express');
const config = require('./config');
const { provision, customize, remove } = require('./lib/perks');
const { logError, logInfo } = require('./utils/logger');

/** @type {import('http').Server|null} */
let httpServer = null;

/**
 * Vérifie le header Authorization: Bearer <INTERNAL_API_SECRET>.
 */
function bearerAuth(req, res, next) {
  const secret = config.INTERNAL_API_SECRET;

  if (!secret) {
    logError('internal-api', new Error('INTERNAL_API_SECRET non configuré'));
    return res.status(500).json({ error: 'Internal API not configured' });
  }

  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = header.slice('Bearer '.length);

  if (token !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}

/**
 * Démarre le serveur HTTP interne (127.0.0.1 uniquement).
 * @param {import('discord.js').Client} client
 */
function startInternalServer(client) {
  if (httpServer) {
    logInfo('ℹ️ Serveur HTTP interne déjà démarré.');
    return;
  }

  const app = express();
  app.use(express.json());
  app.use(bearerAuth);

  app.post('/perks/provision', async (req, res) => {
    try {
      const result = await provision(client, req.body);
      return res.json(result);
    } catch (error) {
      logError('POST /perks/provision', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/perks/customize', async (req, res) => {
    try {
      const result = await customize(client, req.body);
      return res.json(result);
    } catch (error) {
      logError('POST /perks/customize', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/perks/remove', async (req, res) => {
    try {
      const result = await remove(client, req.body);
      return res.json(result);
    } catch (error) {
      logError('POST /perks/remove', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  const { host, port } = config.INTERNAL_API;

  httpServer = app.listen(port, host, () => {
    logInfo(`🔒 API interne perks — http://${host}:${port}`);
  });

  httpServer.on('error', (error) => {
    logError('internal-api:listen', error);
  });
}

module.exports = { startInternalServer };
