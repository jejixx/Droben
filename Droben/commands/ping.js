module.exports = {
    name: 'ping',
    description: 'Ping!',
    async execute(message, args) {
        const sent = await message.channel.send('Pinging...');
        const latency = sent.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(message.client.ws.ping);
        sent.edit(`Pong! Latency is ${latency}ms. API Latency is ${apiLatency}ms.`);
    },
};