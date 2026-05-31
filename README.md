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
```

| Variable    | Description |
|-------------|-------------|
| `TOKEN`     | Token du bot (onglet **Bot** du portail développeur) |
| `CLIENT_ID` | ID de l'application (onglet **General Information**) |
| `GUILD_ID`  | ID du serveur où déployer les commandes en développement |

> **Activer les intents** dans le portail :
> - **Server Members Intent** (nécessaire pour `/kick`)
> - **Message Content Intent** (nécessaire pour les commandes avec préfixe `!`)

### Récupérer un ID Discord

1. Activer le **Mode développeur** dans Discord (*Paramètres → Avancés*).
2. Clic droit sur le serveur ou l'application → **Copier l'identifiant**.

## Scripts npm

| Commande         | Description |
|------------------|-------------|
| `npm run deploy` | Enregistre les slash commands sur le serveur de dev (`GUILD_ID`) |
| `npm run dev`    | Lance le bot avec **nodemon** (rechargement auto) |
| `npm start`      | Lance le bot en production |

## Démarrage rapide

```bash
# 1. Remplir .env (TOKEN, CLIENT_ID, GUILD_ID)
# 2. Déployer les commandes
npm run deploy

# 3. Lancer le bot
npm run dev
```

Au démarrage, la console affiche :

```
✅ DroBen est en ligne !
🤖 DroBen#1234 — DroBen v1.0.0
📊 Présent sur X serveur(s)
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
