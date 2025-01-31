const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Remplace "TON_TOKEN_ICI" par le token de ton bot
const TOKEN = "YXbVrNZPMYLLYfbTd--EV7IFWUj7DWyJ";

client.once('ready', () => {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on('messageCreate', message => {
    if (message.content.toLowerCase() === "bonjour") {
        message.reply("Salut ! 😊");
    }
});

client.login(TOKEN);
