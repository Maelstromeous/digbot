// const config = require('config');
const { asClass } = require('awilix');
const { isString } = require('lodash');
const ServiceProvider = require('../foundation/ServiceProvider');

const CommandRegister = require('../commands/foundation/CommandRegister');

const play = require('../commands/PlayCommand');
const sfx = require('../commands/SfxCommand');


module.exports = class QueueProvider extends ServiceProvider {
    /**
     * TODO: Maybe register them in the config file?
     *
     * @return {({execute}|*)[]}
     */
    get commands() {
        return [
            'digbot.commands.AdminCommand',
            'digbot.commands.CatFactsCommand',
            'digbot.commands.CatsCommand',
            'digbot.commands.ChannelCommand',
            'digbot.commands.DogsCommand',
            'digbot.commands.DragonsCommand',
            'digbot.commands.HelpCommand',
            'digbot.commands.IgnoreCommand',
            'digbot.commands.LmgtfyCommand',
            'digbot.commands.MentionsCommand',
            'digbot.commands.PingCommand',
            'digbot.commands.PlayCommand',
            'digbot.commands.PretendCommand',
            'digbot.commands.PS2DIGCommand',
            'digbot.commands.ReportCommand',
            'digbot.commands.RestartCommand',
            'digbot.commands.SfxCommand',
            'digbot.commands.StatsCommand',
            'digbot.commands.TriviaCommand',
        ];
    }

    /**
     * Register any app dependencies
     */
    register() {
        this.container.register('commandRegister', asClass(CommandRegister)
            .singleton());
    }

    /**
     * Boots any dependency
     *
     * @return {Promise<void>}
     */
    async boot({ commandRegister }) {
        for (const command of this.commands) {
            if (isString(command)) {
                commandRegister.add(this.container.resolve(command));
            } else {
                commandRegister.add(this.container.build(command));
            }
        }

        play.ready();
        sfx.ready();
    }
};
