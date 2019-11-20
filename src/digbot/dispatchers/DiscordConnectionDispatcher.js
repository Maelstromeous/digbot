const config = require('config');
const Dispatcher = require('../foundation/Dispatcher');

module.exports = class DiscordconnectionDispatcher extends Dispatcher {
    /**
     *
     * @param discordClient
     */
    constructor({ discordClient }) {
        super();

        this.client = discordClient;
    }

    /**
     *
     * @return {Promise<void>}
     */
    async start() {
        this.registerListenersTo(this.client, {
            disconnect: this.handler.bind(this),
        });
    }

    /**
     *
     * @return {Promise<void>}
     */
    async stop() {
        this.unregisterListenersFromAll();
    }

    /**
     */
    handler() {
        // Reconnects when connection is lost
        this.client.login(config.get('token'));
    }
};
