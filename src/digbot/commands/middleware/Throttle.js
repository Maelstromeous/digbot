module.exports = class Throttle {
    constructor({ logger, 'digbot.util.RateLimiter': ratelimiter }) {
        this.logger = logger;
        this.ratelimiter = ratelimiter;
    }

    async handle(request, next, max = 5, decay = 5, peruser = true) {
        const throttleKey = this.makeThrottleKey(request, peruser);

        if (await this.ratelimiter.tooManyAttempts(
            throttleKey,
            max,
        )) {
            this.logger.info({
                message: `Command throttled: ${throttleKey}`,
                label: 'CommandDispatcher',
            });

            // TODO: Should probably throttle the throttle message
            if (request.command.throttled instanceof Function) {
                peruser.toString() === 'true' // TODO: Need to address typecasting, maybe
                    ? request.reply(request.command.throttled())
                    : request.respond(request.command.throttled());
            } else {
                request.react('🛑');
            }
        } else {
            await this.ratelimiter.hit(throttleKey, decay);

            await next(request);
        }
    }

    makeThrottleKey({ command, message }, peruser) {
        return peruser
            ? `${command.name}:${message.guild.id}:${message.author.id}`
            : `${command.name}:${message.guild.id}`;
    }
};
