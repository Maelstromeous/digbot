const { duration } = require('moment');
const Command = require('./foundation/Command');

module.exports = class StartedCommand extends Command {
    constructor() {
        super();

        this.name = 'started';
    }

    /**
     * @param request
     * @return {Promise<*>}
     */
    async execute(request) {
        return request.respond(this.createReply());
    }

    /**
     * @return {String}
     */
    createReply() {
        const uptime = duration(process.uptime(), 'seconds');

        if (uptime.asDays() >= 1) {
            return `I've been running for ${uptime.humanize()}. Give a bot a break.`;
        }
        if (uptime.asHours() >= 1) {
            return `I've been running for ${uptime.humanize()}. Starting to get tired.`;
        }
        if (uptime.asMinutes() >= 1) {
            return `I've been running for ${uptime.humanize()}. One of these days I'll make it to an hour `
                + 'without some fool restarting me.';
        }

        return `I've been running for ${uptime.humanize()}. I haven't even been here a minute why are you asking?`;
    }

    /**
     * @return {string}
     */
    help() {
        return 'See how long the bot has been running for.';
    }
};
