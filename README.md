# DroBen

Bot Discord modulaire écrit en **Node.js** avec **discord.js v14**.  
Chargement automatique des commandes slash et des événements.

## Prérequis

- [Node.js](https://nodejs.org/) **v18+**
- Un bot créé sur le [Discord Developer Portal](https://discord.com/developers/applications)
- Un serveur Discord de test (recommandé pour le déploiement en dev)

## Installation

```bash
git clone <url-du-repo>
cd Droben
npm install
```

## Configuration

Copiez ou complétez le fichier `.env` à la racine du projet :

```env
TOKEN=votre_token_bot
CLIENT_ID=id_de_l_application
GUILD_ID=id_du_serveur_de_test

# API interne (supp-gap → DroBen, 127.0.0.1 uniquement)
INTERNAL_API_PORT=4001
INTERNAL_API_SECRET=          # identique à supp-gap (openssl rand -hex 32)
SUPPGAP_GUILD_ID=             # serveur SUPP GAP (réutilise GUILD_ID si identique)
PREMIUM_ROLE_ID=              # rôle Premium fixe
SUBSCRIBER_CATEGORY_ID=       # catégorie des salons vocaux d'abonnés
NEXTJS_INTERNAL_URL=http://localhost:3000  # app supp-gap (scheduler d'expiration)
```

| Variable    | Description |
|-------------|-------------|
| `TOKEN`     | Token du bot (onglet **Bot** du portail développeur) |
| `CLIENT_ID` | ID de l'application (onglet **General Information**) |
| `GUILD_ID`  | ID du serveur pour un déploiement manuel (`npm run deploy`) — optionnel si le bot tourne |
| `INTERNAL_API_PORT` | Port de l'API HTTP interne (défaut `4001`) |
| `INTERNAL_API_SECRET` | Secret partagé avec supp-gap (`Authorization: Bearer`) |
| `SUPPGAP_GUILD_ID` | ID du serveur où provisionner les perks (défaut : `GUILD_ID`) |
| `PREMIUM_ROLE_ID` | ID du rôle Premium fixe à attribuer aux abonnés |
| `SUBSCRIBER_CATEGORY_ID` | ID de la catégorie Discord pour les salons vocaux privés |
| `NEXTJS_INTERNAL_URL` | URL de supp-gap pour le scheduler d'expiration des passes (défaut `http://127.0.0.1:3000`) |

> **Activer les intents** dans le portail :
> - **Server Members Intent** (nécessaire pour `/kick`)
> - **Message Content Intent** (nécessaire pour les commandes avec préfixe `!`)

### Récupérer un ID Discord

1. Activer le **Mode développeur** dans Discord (*Paramètres → Avancés*).
2. Clic droit sur le serveur ou l'application → **Copier l'identifiant**.

## Scripts npm

| Commande         | Description |
|------------------|-------------|
| `npm run deploy` | Déploiement manuel sur un serveur (`GUILD_ID`) |
| `npm run dev`    | Lance le bot avec **nodemon** (rechargement auto) |
| `npm start`      | Lance le bot en production |

## Déploiement automatique des slash commands

Le bot enregistre les commandes slash **automatiquement** :

- **Au démarrage** — synchronisation sur tous les serveurs où DroBen est présent
- **À l'invitation** — dès que le bot rejoint un nouveau serveur (`guildCreate`)

Plus besoin de lancer `npm run deploy` à chaque nouvelle invitation (sauf déploiement manuel ciblé).

## Démarrage rapide

```bash
# 1. Remplir .env (TOKEN, CLIENT_ID)
# 2. Lancer le bot — les commandes se déploient automatiquement
npm run dev
```

Au démarrage, la console affiche :

```
✅ DroBen est en ligne !
🤖 DroBen#1234 — DroBen v1.0.0
📊 Présent sur X serveur(s)
📡 Synchronisation des commandes sur X serveur(s)...
✅ Commandes enregistrées sur « Mon Serveur »
```

## Commandes disponibles

| Commande | Catégorie | Description |
|----------|-----------|-------------|
| `/ping`  | fun       | Affiche la latence du bot et de l'API Discord |
| `/say`   | fun       | Envoie un message personnalisé via embed |
| `/kick`  | admin     | Expulse un membre du serveur |
| `/help`  | utils     | Liste toutes les commandes disponibles |

Les commandes sont aussi disponibles avec le préfixe `!` (ex. `!ping`, `!say Bonjour`, `!kick @user raison`, `!help`).

## Structure du projet

```
DroBen/
├── index.js              # Point d'entrée — connexion et chargement des handlers
├── deploy-commands.js    # Déploiement des slash commands (REST API)
├── config.js             # Constantes globales (couleur, nom, version…)
├── commands/             # Commandes slash (sous-dossiers par catégorie)
│   ├── fun/
│   ├── admin/
│   └── utils/
├── events/               # Événements Discord (ready, interactionCreate…)
├── handlers/             # Chargement dynamique commandes + événements
├── .env                  # Variables d'environnement (non versionné)
└── package.json
```

## Ajouter une commande

1. Créer un fichier `.js` dans `commands/<catégorie>/`.
2. Exporter un objet `{ data, execute }` avec `SlashCommandBuilder`.
3. Relancer `npm run deploy`, puis redémarrer le bot.

Exemple minimal :

```js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('exemple')
    .setDescription('Ma nouvelle commande'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.COLOR)
      .setDescription('Hello !');

    await interaction.reply({ embeds: [embed] });
  },
};
```

## Sécurité

- **Ne jamais** committer le fichier `.env` (déjà ignoré par `.gitignore`).
- **Ne jamais** partager votre token publiquement (chat, README, GitHub…).
- Si un token est exposé, **régénérez-le immédiatement** dans le portail développeur.

## Licence

MIT
