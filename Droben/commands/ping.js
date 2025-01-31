module.exports = {
    name: 'ping',
    description: 'Ping!',
    execute(message, args) {
        const latency = Date.now() - message.createdTimestamp;
        message.channel.send(`Pong! Latency is ${latency}ms.`);
    },
};