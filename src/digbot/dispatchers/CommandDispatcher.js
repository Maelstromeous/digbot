const config = require('config');
const { get } = require('lodash');
const Dispatcher = require('../foundation/Dispatcher');
const Request = require('../commands/foundation/Request');

module.exports = class CommandDispatcher extends Dispatcher {
    /**
     * @param discordjsClient
     * @param register
     * @param logger
     * @param rateLimiter
     */
    constructor({ discordjsClient, logger, 'digbot.commands.foundation.CommandRegister': register, 'digbot.util.RateLimiter': rateLimiter }) {// eslint-disable-line
        super();

        this.prefix = '!';

        this.client = discordjsClient;
        this.logger = logger;
        this.register = register;
        this.ratelimiter = rateLimiter;
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
        // TODO: Bit of a cluster fuck, maybe split this up in multiple parts

        if (message.author.bot || message.system) { return; }

        if (!config.get('commandChannels')
            .includes(message.channel.id)) { return; }

        if (!message.cleanContent.startsWith(this.prefix)) { return; }

        const command = this.match(message);

        if (command) {
            const request = new Request(command, message);

            if (!this.canExecuteCommand(command, request)) {
                request.react('🔒');
                return;
            }

            const throttleKey = get(command, 'throttle.peruser', true)
                ? `${command.name}:${message.guild.id}:${message.author.id}`
                : `${command.name}:${message.guild.id}`;

            if (await this.ratelimiter.tooManyAttempts(
                throttleKey,
                get(command.throttle, 'attempts', 5),
            )) {
                this.logger.log('info', {
                    message: `Command throttled: ${throttleKey}`,
                    label: 'CommandDispatcher',
                });

                // TODO: Should probably throttle the throttle message
                if (command.throttled instanceof Function) {
                    get(command, 'throttle.peruser', true)
                        ? request.reply(command.throttled())
                        : request.respond(command.throttled());
                } else {
                    request.react('🛑');
                }

                return;
            }

            await this.ratelimiter.hit(throttleKey, get(command.throttle, 'decay', 5));


            command.execute(request)
                .catch((error) => {
                    this.logger.log('error', {
                        message: error.toString(),
                        label: 'commandDispatcher',
                    });

                    request.respond('I failed you'); // TODO: Better error message
                });
        }
    }

    /**
     * @param message
     * @return {Command|undefined}
     */
    match(message) {
        return this.register.get(this.sortOfParser(message.cleanContent));
    }

    /**
     * @param {string} content
     * @return {String}
     */
    sortOfParser(content) {
        return content.match(/[^\s]+/)[0].slice(1);
    }

    /**
     * Checks if the current request can be executed
     *
     * @param command
     * @param guild
     * @param member
     * @return {boolean}
     */
    canExecuteCommand(command, { message: { guild, member } }) {
        return !command.special
            || member.id === guild.ownerID
            || this.hasAdminRole(member);
    }

    /**
     * Returns the admin roles of the server
     *
     * @param guild
     * @return {Array}
     */
    getAdminRoles(guild) {
        return config.has(`guilds.${guild.id}.adminRoles`)
            ? config.get(`guilds.${guild.id}.adminRoles`)
            : [];
    }

    /**
     * Check if the member has a admin role
     *
     * @param member
     * @return {boolean}
     */
    hasAdminRole(member) {
        return this.getAdminRoles(member.guild).find(role => member.roles.has(role)) !== undefined;
    }
};
