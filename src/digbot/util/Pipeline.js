const { isString } = require('lodash');

module.exports = class Pipeline {
    constructor() {
        this.entrance = passable => passable;
    }

    pipes(pipes) {
        for (const pipe of pipes.reverse()) { // TODO: Backwards iterator?
            this.pipe(...pipe);
        }

        return this;
    }

    pipe(...args) {
        const next = this.entrance;

        if (args[0] instanceof Function) {
            // Function passed directly
            const [method, ...parameters] = args;

            this.entrance = passable => method(passable, next, ...parameters);
        } else if (args[0] instanceof Object && isString(args[1])) {
            const [object, method, ...parameters] = args;

            if (!(object[method] instanceof Function)) {
                throw new TypeError(`object.${method} is not a function`);
            }

            this.entrance = passable => object[method](passable, next, ...parameters);
        } else {
            throw new TypeError(`The argument passed to pipe is not recognized: ${args}`);
        }

        return this;
    }

    send(passable) {
        return this.entrance(passable);
    }
};
