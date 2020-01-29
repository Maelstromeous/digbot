const { readFile } = require('fs');
const { template } = require('lodash');
const Dispatcher = require('../foundation/Dispatcher');

class WelcomeDispatcher extends Dispatcher {
    constructor({ discordClient, 'digbot.util.GuildConfig': guildConfig, 'digbot.util.RateLimiter': rateLimiter }) {
        super();

        this.discord = discordClient;
        this.guildConfig = guildConfig;
        this.rateLimiter = rateLimiter;
    }

    async start() {
        this.registerListenersTo(this.discord, {
            guildMemberAdd: this.guildMemberAdd.bind(this),
        });
    }

    async stop() {
        this.unregisterListenersFromAll();
    }

    async guildMemberAdd(member) {
        const throttleKey = `welcome:${member.guild.id}:${member.id}`;

        if (await this.rateLimiter.tooManyAttempts(
            throttleKey,
            1,
        )) {
            return;
        }

        await this.rateLimiter.hit(throttleKey, 60);

        readFile('../../assets/welcomemessage.md', (e, message) => (e || member.send(message)));

        if (this.guildConfig.has(member.guild, 'welcome.channel')) {
            this.discord.channels.get(this.guildConfig.get(member.guild, 'welcome.channel'))
                .send(this.guildConfig.has(member.guild, 'welcome.message')
                    ? template(this.guildConfig.get(member.guild, 'welcome.message'))({ member })
                    : `Welcome, **${member.displayName}**!`);
        }
    }
}

module.exports = WelcomeDispatcher;
