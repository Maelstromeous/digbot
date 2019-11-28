const { isString } = require('lodash');

const ServiceProvider = require('../../foundation/ServiceProvider');

module.exports = class CommandProvider extends ServiceProvider {
    constructor(cradle) {
        super(cradle);

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
        if (!this.commandRegister) {
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
        const { middleware = [], group = 'default' } = this.mergeOpts(opts || {});

        const command = this.container.resolve(name);

        command.pipes(middleware.map((s) => {
            const [mw, parameters] = this.parseMiddleware(s);

            return [
                this.container.resolve(mw),
                'handle',
                ...parameters,
            ];
        }));

        this.registery.set(command.name, command, group);
    }

    mergeOpts(opts) {
        return [...this.optsStack].reverse()
            .reduce((acc, cur) => {
                acc.middleware = (cur.middleware || []).concat(acc.middleware || []);

                if (!acc.group) {
                    acc.group = cur.group;
                }

                return acc;
            }, opts);
    }


    parseMiddleware(string) {
        const [name, parameters] = string.split(':');

        if (isString(parameters)) {
            return [name, parameters.split(',')];
        }

        return [name, []];
    }

    registerCommands() {}
};
