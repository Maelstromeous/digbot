const Command = require('./foundation/Command');
const { pingStatus } = require('../util/ping');

module.exports = class PingCommand extends Command {
    constructor({ discordClient }) {
        super();

        this.name = 'ping';

        this.client = discordClient;
    }

    /**
     * @param request
     * @return {Promise<void>}
     */
    async execute(request) {
        return request.respond(`Ping: ${Math.round(this.client.ping)} (${pingStatus(this.client.ping)})`);
    }

    /**
     * @return {string}
     */
    help() {
        return 'Pong! Test if the bot is alive.';
    }
};
