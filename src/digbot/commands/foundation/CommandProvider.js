const ServiceProvider = require('../../foundation/ServiceProvider');
const Pipeline = require('../../util/Pipeline');

module.exports = class CommandProvider extends ServiceProvider {
    constructor() {
        super();

        this.optsStack = [];
    }

    /**
     * Boots any dependency
     *
     * @return {Promise<void>}
     */
    async boot() {
        this.registerCommands();
    }

    get registery() {
        if (this.commandRegister) {
            this.commandRegister = this.container.resolve('digbot.commands.foundation.CommandRegister');
        }

        return this.commandRegister;
    }

    group(opts, register) {
        this.optsStack.push(opts);

        register();

        if (this.optsStack.pop() !== opts) {
            throw new Error('Options stack mismatched element on pop');
        }
    }

    command(name, opts) {
        const pipeline = new Pipeline();
        const { middleware } = this.mergeOpts(opts);

        const command = this.container.resolve(name);

        pipeline.pipe(command, 'execute');

        pipeline.pipes(middleware.map((s) => {
            const [mw, parameters] = this.parseMiddleware(s);

            return [
                this.container.resolve(mw),
                ...parameters,
            ];
        }));

        this.registery.set(command.name, pipeline);
    }

    parseMiddleware(string) {
        const [name, parameters] = string.split(':');

        if (parameters instanceof String) {
            return [name, parameters.split(',')];
        }

        return [name, []];
    }

    registerCommands() {}
};
