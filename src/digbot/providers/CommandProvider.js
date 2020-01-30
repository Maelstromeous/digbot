const BaseProvider = require('../commands/foundation/CommandProvider');

module.exports = class CommandProvider extends BaseProvider {
    registerCommands() {
        this.group({
            middleware: [
                'digbot.commands.middleware.ErrorHandler',
                'digbot.commands.middleware.CommandChannelOnly',
            ],
        }, () => {
            // Default throttled commands
            this.group({
                middleware: [
                    'digbot.commands.middleware.Throttle',
                ],
            }, () => {
                this.command('digbot.commands.CatFactsCommand');
                this.command('digbot.commands.ChannelCommand');
                this.command('digbot.commands.DragonsCommand');
                this.command('digbot.commands.IgnoreCommand');
                this.command('digbot.commands.LmgtfyCommand');
                this.command('digbot.commands.PretendCommand');
                this.command('digbot.commands.TriviaCommand');
                this.command('digbot.commands.YesNoCommand');
            });

            // Command with unique throttle
            this.group({
                middleware: [
                    'digbot.commands.middleware.Throttle:2,5',
                ],
            }, () => {
                this.command('digbot.commands.CatsCommand');
                this.command('digbot.commands.DogsCommand');
                this.command('digbot.commands.PS2DIGCommand');
            });

            this.command('digbot.commands.HelpCommand', {
                group: 'inv',
                middleware: ['digbot.commands.middleware.Throttle:1,30,false'],
            });


            // Admin commands
            this.group({
                group: 'admin',
                middleware: [
                    'digbot.commands.middleware.AdminOnly',
                ],
            }, () => {
                this.command('digbot.commands.AdminCommand', { group: 'inv' });
                this.command('digbot.commands.ReportCommand', {
                    middleware: ['digbot.commands.middleware.Throttle:2,15'],
                });
            });

            // Dev commands
            this.group({
                group: 'dev',
                middleware: [
                    'digbot.commands.middleware.DevsOnly',
                ],
            }, () => {
                this.command('digbot.commands.RestartCommand');
                this.command('digbot.commands.StatsCommand');
            });
        });
    }
};
