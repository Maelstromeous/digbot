module.exports = class Pipeline {
    constructor() {
        this.entrance = passable => passable;
    }

    pipes(pipes) {
        for (const pipe of pipes.reverse()) { // TODO: Backwards iterator?
            this.pipe(pipe);
        }

        return this;
    }

    pipe(...args) {
        const next = this.entrance;

        if (args[0] instanceof Function) {
            // Function passed directly
            const [method, ...parameters] = args;

            this.entrance = passable => method(passable, next, ...parameters);
        } else if (args[0] instanceof Object && args[1] instanceof String) {
            const [object, method, ...parameters] = args;

            this.entrance = passable => object[method](passable, next, ...parameters);
        } else {
            throw new TypeError('The argument passed to pipe is not recognized.');
        }

        return this;
    }

    send(passable) {
        return this.entrance(passable);
    }
};
