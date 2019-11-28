const Pipeline = require('../../util/Pipeline');

module.exports = class Command extends Pipeline {
    constructor() {
        super();

        this.pipe(this, 'execute');
    }

    /**
     * @param message
     * @return {Promise<void>}
     */
    async execute(message) {} // eslint-disable-line no-unused-vars, no-empty-function
};
