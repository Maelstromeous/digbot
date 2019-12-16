const { RichEmbed } = require('discord.js');
const Command = require('./foundation/Command');

module.exports = class YesNoCommand extends Command {
    constructor({ 'digbot.apis.Foolproof': foolproof }) {
        super();

        this.name = 'yesno';

        this.api = foolproof;
    }

    /**
     * @param request
     * @return {Promise<void>}
     */
    async execute(request) {
        const { answer, image } = await this.api.getAnswer();

        return request.respond(
            new RichEmbed()
                .setImage(image)
                .setTitle(answer.toUpperCase()),
        );
    }

    /**
     * @return {string}
     */
    help() {
        return 'Helps you make a decision by answering yes or no(not guaranteed).';
    }
};
