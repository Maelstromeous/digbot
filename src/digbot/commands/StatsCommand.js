const { duration } = require('moment');
const Command = require('./foundation/Command');
const { version } = require('../../../package');

module.exports = class StatsCommand extends Command {
    constructor({ discordClient }) {
        super();

        this.name = 'stats';

        this.client = discordClient;
    }

    /**
     * @param request
     * @return {Promise<void>}
     */
    async execute(request) {
        const reply = await request.respond('pong');

        // TODO: Use RichEmbed
        return reply.edit(
            '__**DIGBot Stats**__\n'
            + `**Version:** ${version}\n`
            + `**Ping:** ${Math.round(this.client.ping)}ms\n`
            + `**Runtime:** ${duration(process.uptime(), 'seconds')
                .humanize()}\n`
            + `**Stable Discord connection for:** ${duration(this.client.uptime)
                .humanize()}\n`,
        );
    }

    /**
     * @return {string}
     */
    help() {
        return 'Display bot statistics such as uptime, memory usage and number of servers.';
    }
};
