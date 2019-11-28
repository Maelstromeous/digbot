const config = require('config');

module.exports = class AdminOnly {
    async handle(request, next) {
        if (this.canExecuteCommand(request)) {
            await next(request);
        }

        request.react('🔒');
    }

    canExecuteCommand({ message: { guild, member } }) {
        return member.id === guild.ownerID || this.hasAdminRole(member);
    }

    hasAdminRole(member) {
        return this.getAdminRoles(member.guild).find(role => member.roles.has(role)) !== undefined;
    }

    getAdminRoles(guild) {
        return config.has(`guilds.${guild.id}.adminRoles`)
            ? config.get(`guilds.${guild.id}.adminRoles`)
            : [];
    }
};
