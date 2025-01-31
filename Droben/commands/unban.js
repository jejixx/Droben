const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'unban',
    description: 'Unban a user from the server.',
    async execute(message, args) {
        console.log('Unban command executed');

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            console.log('Bot does not have permission to unban members');
            return message.reply('I do not have permission to unban members.');
        }

        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            console.log('User does not have permission to unban members');
            return message.reply('You do not have permission to unban members.');
        }

   
        const userId = args[0];
        if (!userId) {
            console.log('No user ID provided');
            return message.reply('Please provide a valid user ID to unban.');
        }

        try {
            const bannedUsers = await message.guild.bans.fetch();
            const bannedUser = bannedUsers.get(userId);
            if (!bannedUser) {
                console.log('User is not banned');
                return message.reply('This user is not banned. Please provide the user ID to unban.');
            }
            await message.guild.members.unban(userId);
            message.reply(`User with ID ${userId} has been unbanned.`);
        } catch (error) {
            console.log('Failed to unban the user');
            console.error(error);
            message.reply('There was an error trying to unban this user.');
        }
    },
};