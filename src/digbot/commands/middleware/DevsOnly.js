const config = require('config');

module.exports = class DevsOnly {
    async handle(request, next) {
        if (config.get('devs').includes(request.author.id)) {
            await next(request);
        } else {
            request.react('🔒');
        }
    }
};
