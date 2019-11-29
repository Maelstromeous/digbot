const HelpCommand = require('./HelpCommand');

module.exports = class AdminCommand extends HelpCommand {
    constructor(cradle) {
        super(cradle);

        this.name = 'admin';
        this.groupName = 'admin';
    }

    getChannel(request) {
        return request.author;
    }

    /**
     * @return {string}
     */
    help() {
        return 'Lists all admin commands';
    }
};
