const { RichEmbed } = require('discord.js');
const Command = require('./foundation/Command');

module.exports = class HelpCommand extends Command {
    constructor({ 'digbot.commands.foundation.CommandRegister': register }) {
        super();

        this.name = 'help';
        this.groupName = 'default';

        this.register = register;
    }

    /**
     * @param request
     * @return {Promise<void>}
     */
    async execute(request) {
        return this.getChannel(request)
            .send(this.createReply());
    }

    /**
     * @return {string}
     */
    createReply() {
        const embed = new RichEmbed().setTitle('Commands');

        this.register.getGroup(this.groupName)
            .filter(({ special }) => !special)
            .forEach(c => embed.addField(`!${c.name}`, c.help()));

        return embed;
    }

    getChannel(request) {
        return request.message.channel;
    }

    /**
     * @return {string}
     */
    help() {
        return 'Will give a more detailed explanation of the command.';
    }
};
