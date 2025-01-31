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

        try {
            const user = await message.guild.members.ban(userId, { reason: args.slice(1).join(' ') || 'No reason provided' });
            console.log(`User ${user.tag} has been banned`);
            message.reply(`${user.tag} has been banned.`);
        } catch (error) {
            console.log('Failed to ban the member');
            message.reply('I was unable to ban this member.');
            console.error(error);
        }
    },
};