const { RichEmbed } = require('discord.js');
const Command = require('./foundation/Command');

module.exports = class HelpCommand extends Command {
    constructor({ 'digbot.commands.foundation.CommandRegister': register }) {
        super();

        this.name = 'help';

        this.register = register;
    }

    /**
     * @param request
     * @return {Promise<void>}
     */
    async execute(request) {
        return request.respond(this.createReply());
    }

    /**
     * @return {string}
     */
    createReply() {
        const embed = new RichEmbed().setTitle('Commands');

        this.register.toArray().filter(({ special }) => !special).forEach(c => embed.addField(`!${c.name}`, c.help()));

        return embed;
    }

    /**
     * @return {string}
     */
    help() {
        return 'Will give a more detailed explanation of the command.';
    }
};
