const { join, relative } = require('path');

module.exports = class LoadModules {
    /**
     * Load all modules into the container
     *
     * @param app
     */
    bootstrap({ app }) {
        app.loadModules(
            ['src/**/*.js'],
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
        const splat = relative(join(process.cwd(), 'src'), path).split('/');

        splat.pop();

        return [...splat, name].join('.');
    }
};
