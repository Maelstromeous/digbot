const Command = require('./foundation/Command');

const antiduplicate = require('../util/antiduplicate.js');
const catFactCommand = require('../../assets/catfacts.js');

module.exports = class CatfactsCommand extends Command {
    constructor() {
        super();

        this.name = 'catfacts';
    }

    /**
     * @param request
     * @return {Promise<void>}
     */
    async execute(request) {
        return request.respond(antiduplicate.randomise(
            'catfacts',
            catFactCommand,
        ));
    }

    /**
     * @return {string}
     */
    help() {
        return 'Will post a random cat fact, drawing from a repository of over 100 cat facts!';
    }
};
