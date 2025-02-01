const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        console.log('Message received:'); // Debug log

        // Ignore messages from bots
        if (message.author.bot) return;

        // Check if the message contains the word "feur" (case-insensitive)
        const regex = /\bfeur\b/i;
        if (regex.test(message.content)) {
            console.log('Feur detected'); // Debug log
            // Reply with squidward gif
            message.reply('https://tenor.com/view/brain-trash-spongebob-squidward-dumb-gif-17233216');
        }
    },
};