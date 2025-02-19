const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'kick',
    description: 'Kick a user from the server.',
    async execute(message, args) {
        console.log('Kick command executed');

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            console.log('Bot does not have permission to kick members');
            return message.reply('I do not have permission to kick members.');
        }

        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            console.log('User does not have permission to kick members');
            return message.reply('You do not have permission to kick members.');
        }

        const userId = args[0];
        if (!userId) {
            console.log('No user ID provided');
            return message.reply('You need to provide a user ID to kick.');
        }

        // Extract user ID from mention
        const userIdMatch = userId.match(/^<@!?(\d+)>$/);
        const extractedUserId = userIdMatch ? userIdMatch[1] : userId;

        try {
            const member = await message.guild.members.fetch(extractedUserId);
            if (!member) {
                console.log('User not found in the server');
                return message.reply('That user is not in this server.');
            }

            await member.kick();
            console.log(`User ${extractedUserId} kicked successfully`);
            return message.reply(`User ${extractedUserId} has been kicked.`);
        } catch (error) {
            console.error(`Failed to kick user ${extractedUserId}:`, error);
            return message.reply(`Failed to kick user ${extractedUserId}.`);
        }
    }
};