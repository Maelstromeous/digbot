const Dispatcher = require('../foundation/Dispatcher');
const Request = require('../commands/foundation/Request');

module.exports = class CommandDispatcher extends Dispatcher {
    /**
     * @param discordClient
     * @param register
     */
    constructor({ discordClient, 'digbot.commands.foundation.CommandRegister': register }) {
        super();

        this.prefix = '!';

        this.client = discordClient;
        this.register = register;
    }

    /**
     *
     * @return {Promise<void>}
     */
    async start() {
        this.registerListenersTo(this.client, {
            message: this.handler.bind(this),
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
     *
     * @param message
     */
    async handler(message) {
        if (message.author.bot || message.system) { return; }
        if (!message.cleanContent.startsWith(this.prefix)) { return; }

        // TODO: Parsing the message should yield the command pipeline as well as a request with parameters parsed
        const command = this.match(message);

        if (command) {
            const request = new Request(command, message);

            command.send(request);
        }
    }

    /**
     * @param message
     * @return {Command|undefined}
     */
    match(message) {
        return this.register.get(this.parseCommandName(message.cleanContent));
    }

    /**
     * @param content
     * @return {*}
     */
    parseCommandName(content) {
        return content.match(/[^\s]+/)[0].slice(1);
    }
};
