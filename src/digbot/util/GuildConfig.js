const config = require('config');

// TODO: Should be a contract independent of implementation and usage
//   Also every key should have a default behaviour
module.exports = class GuildConfig {
    has(guild, key) {
        return config.has(`guilds.${guild.id}.${key}`);
    }

    get(guild, key) {
        return config.get(`guilds.${guild.id}.${key}`);
    }
};
