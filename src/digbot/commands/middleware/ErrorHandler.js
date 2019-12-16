module.exports = class ErrorHandler {
    constructor({ logger }) {
        this.logger = logger;
    }

    async handle(request, next) {
        await next(request).catch((error) => {
            this.logger.error({
                message: error.toString(),
                label: 'commandDispatcher',
            });

            request.respond('The hamster seems to have malfunctioned.');
        });
    }
};
