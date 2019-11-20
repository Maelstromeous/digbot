const config = require('config');
const { get } = require('lodash');
const Command = require('./foundation/Command');
const mentionsCheck = require('../admin/antispam/mentionspam.js');

module.exports = class MentionsCommand extends Command {
    constructor() {
        super();

        this.name = 'mentions';
    }

    /**
     * @param request
     * @return {Promise<void>}
     */
    async execute(request) {
        if (config.get('features.disableMentionSpam')) {
            return request.respond(`${request.member.displayName}, the mention limits are currently disabled. `
                + 'Please don\'t make us regret turning it off though');
        }

        // If member is exempt from limits
        if (mentionsCheck.exemptMember(request.member)) {
            return request.respond(`${request.member.displayName}, you are exempt from the mention limit`);
        }

        const memberMentions = config.get('memberMentionLimit')
            - get(mentionsCheck.passList(), `[${request.author.id}].memberMentions`, 0);
        const roleMentions = config.get('roleMentionLimit')
            - get(mentionsCheck.passList(), `[${request.author.id}].roleMentions`, 0);

        return request.respond(this.createReply(request.member.displayName, memberMentions, roleMentions));
    }

    /**
     * @param name
     * @param memberMentions
     * @param roleMentions
     * @return {string}
     */
    createReply(name, memberMentions, roleMentions) {
        let reply = `__${name}'s mention allowance__:`;

        reply += memberMentions <= 0
            ? '\nMember mentions remaining: 0, **do not attempt to mention members again this period**'
            : `\nMember mentions remaining: ${memberMentions}`;

        reply += roleMentions <= 0
            ? '\nRole mentions remaining: 0, **do not attempt to mention roles again this period**'
            : `\nRole mentions remaining: ${roleMentions}`;

        reply += '\n(*Note: mention limits reset at 4AM*)';

        return reply;
    }

    /**
     * @return {string}
     */
    help() {
        return 'Check the number of mentions you have remaining of your daily mentions allowance. This resets every '
            + '24 hour period. Be sure that you check if you\'re not sure to avoid getting in trouble for spamming';
    }
};
