const config = require('config');

module.exports = class CommandChannelOnly {
    async handle(request, next) {
        if (this.guildCommandChannels(request.message.guild).includes(request.message.channel.id)) {
            await next(request);
        }
    }

    guildCommandChannels(guild) {
        if (config.has(`guilds.${guild.id}.commandChannels`)) {
            return config.get(`guilds.${guild.id}.commandChannels`);
        }

        return [];
    }
};
