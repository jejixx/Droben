const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Ban a user from the server.',
    async execute(message, args) {
        console.log('Ban command executed');

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            console.log('Bot does not have permission to ban members');
            return message.reply('I do not have permission to ban members.');
        }

        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            console.log('User does not have permission to ban members');
            return message.reply('You do not have permission to ban members.');
        }

        const userId = args[0];
        if (!userId) {
            console.log('No user ID provided');
            return message.reply('You need to provide a user ID to ban.');
        }

        // Extract user ID from mention
        const userIdMatch = userId.match(/^<@!?(\d+)>$/);
        const extractedUserId = userIdMatch ? userIdMatch[1] : userId;

        try {
            await message.guild.members.ban(extractedUserId);
            console.log(`User ${extractedUserId} banned successfully`);
            return message.reply(`User ${extractedUserId} has been banned.`);
        } catch (error) {
            console.error(`Failed to ban user ${extractedUserId}:`, error);
            return message.reply(`Failed to ban user ${extractedUserId}.`);
        }
    }
};