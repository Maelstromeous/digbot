module.exports = class Throttle {
    constructor({ logger }) {
        this.logger = logger;
    }

    async handle(request, next, max, decay, peruser, message) {
        const throttleKey = this.makeThrottleKey(request, peruser);

        if (await this.ratelimiter.tooManyAttempts(
            throttleKey,
            max || 5,
        )) {
            this.logger.info({
                message: `Command throttled: ${throttleKey}`,
                label: 'CommandDispatcher',
            });

            // TODO: Should probably throttle the throttle message
            if (message && peruser) {
                request.reply(message);
            } else if (message) {
                request.respond(message);
            } else {
                request.react('🛑');
            }
        } else {
            await this.ratelimiter.hit(throttleKey, decay || 5);

            await next(request);
        }
    }

    makeThrottleKey({ command, message }, peruser) {
        return peruser
            ? `${command.name}:${message.guild.id}:${message.author.id}`
            : `${command.name}:${message.guild.id}`;
    }
};
