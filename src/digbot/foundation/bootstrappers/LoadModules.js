const { join, relative } = require('path');

module.exports = class LoadModules {
    constructor() {
        this.root = 'src/digbot';
    }

    /**
     * Load all modules into the container
     *
     * @param app
     */
    bootstrap({ app }) {
        app.loadModules(
            [`${this.root}/**.js`],
            {
                formatName: this.format.bind(this),
            },
        );
    }

    /**
     * @param name
     * @param path
     * @return {String}
     */
    format(name, { path }) {
        const splat = relative(join(process.cwd(), this.root), path)
            .split('/');

        splat.pop();

        return [...splat, name].join('.');
    }
};
