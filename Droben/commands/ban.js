module.exports = {
    name: 'ban',
    description: 'ban!',
    async execute(message, args) {
        // Check if the message author has the 'BAN_MEMBERS' permission
        if (!message.member.permissions.has('BanMembers')) {
            return message.reply('You do not have permission to ban members.');
        }

        // Check if the bot has the 'BAN_MEMBERS' permission
        if (!message.guild.members.me.permissions.has('BanMembers')) {
            return message.reply('I do not have permission to ban members.');
        }

        // Get the member to ban
        const member = message.mentions.members.first();
        if (!member) {
            return message.reply('Please mention a valid member to ban.');
        }

        // Check if the member is bannable
        if (!member.bannable) {
            return message.reply('I cannot ban this user.');
        }

        // Ban the member
        try {
            await member.ban({ reason: args.slice(1).join(' ') || 'No reason provided' });
            message.reply(`${member.user.tag} has been banned.`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to ban this member.');
        }
    },
};
