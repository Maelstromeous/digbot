const { get } = require('lodash');

module.exports = class Command {
    constructor({ opts }) {
        this.middleware = get(opts, 'middleware', []);
    }

    /**
     * @param message
     * @return {Promise<void>}
     */
    async execute(message) {} // eslint-disable-line no-unused-vars, no-empty-function
};
