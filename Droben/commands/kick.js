const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'kick',
    description: 'Kick a user from the server.',
    execute(message, args) {
        console.log('Kick command executed');
    
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            console.log('Bot does not have permission to kick members');
            return message.reply('I do not have permission to ban members.');
        }

        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            console.log('User does not have permission to kick members');
            return message.reply('You do not have permission to kick members.');
        }

        const user = message.mentions.users.first();
        if (!user) {
            console.log('No user mentioned');
            return message.reply('You need to mention a user to kick.');
        }

        const member = message.guild.members.resolve(user);
        if (!member) {
            console.log('User not found in the server');
            return message.reply('That user is not in this server.');
        }

        member.kick().then(() => {
            console.log(`User ${user.tag} has been kicked`);
            message.reply(`${user.tag} has been kicked.`);
        }).catch(err => {
            console.log('Failed to kick the member');
            message.reply('I was unable to kick the member.');
            console.error(err);
        });
    },
};