const providers = require('../../providers/Register');

module.exports = class RegisterProviders {
    /**
     * Registers all the services given by the service providers
     *
     * @param app
     */
    async bootstrap({ app }) {
        await app.registerConfiguredProviders(providers);
    }
};
