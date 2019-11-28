const config = require('config');

module.exports = class CommandChannelOnly {
    async handle(request, next) {
        if (this.guildCommandChannels(request.message.guild).includes(request.message.channel.id)) {
            await next(request);
        }
    }

    guildCommandChannels(guild) {
        if (config.has(`guild.${guild.id}.commandChannels`)) {
            return config.get(`guild.${guild.id}.commandChannels`);
        }

        return [];
    }
};
