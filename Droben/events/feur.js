const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        console.log('Message received:', message.content); // Debug log

        // Ignore messages from bots
        if (message.author.bot) return;

        // Check if the message contains the substring "feur"
        if (message.content.toLowerCase().includes('feur')) {
            console.log('Feur detected'); // Debug log
            // Reply with squidward gif
            message.reply('https://tenor.com/view/brain-trash-spongebob-squidward-dumb-gif-17233216');
        }
    },
};