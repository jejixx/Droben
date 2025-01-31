const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'unban',
    description: 'Unban a member from the server',
    async execute(message, args) {
        // Check if the message author has the 'BAN_MEMBERS' permission
        if (!message.member.permissions.has('BanMembers')) {
            return message.reply('You do not have permission to unban members.');
        }

        // Check if the bot has the 'BAN_MEMBERS' permission
        if (!message.guild.members.me.permissions.has('BanMembers')) {
            return message.reply('I do not have permission to unban members.');
        }

        // Get the user ID to unban
        const userId = args[0];
        if (!userId) {
            return message.reply('Please provide a valid user ID to unban.');
        }

        try {
            // Fetch the list of banned users
            const bannedUsers = await message.guild.bans.fetch();

            // Check if the user is banned
            const bannedUser = bannedUsers.get(userId);
            if (!bannedUser) {
                return message.reply('This user is not banned.');
            }

            // Unban the user
            await message.guild.members.unban(userId);
            message.reply(`User with ID ${userId} has been unbanned.`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to unban this user.');
        }
    },
};
