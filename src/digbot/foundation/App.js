const EventEmitter = require('events');
const { createContainer, asValue, aliasTo } = require('awilix');

// TODO: Find a way to copy the type hinting from the Awilix container
module.exports = class App extends EventEmitter {
    constructor() {
        super();

        this.booted = false;
        this.hasBeenBootstrapped = false;

        this.serviceProviders = [];

        this.extendContainer();
        this.registerBaseBindings();
    }

    /**
     * Extends the instance with an Awilix container instance
     *
     * Note: this is possible due to Awilix generating a generic object
     */
    extendContainer() {
        Object.assign(this, createContainer());
    }

    /**
     * Registers base bindings
     */
    registerBaseBindings() {
        this.register('app', asValue(this));
        this.register('container', aliasTo('app'));
        this.register('cradle', asValue(this.cradle));
    }

    /**
     * Bootstraps the app
     *
     * @param bootstrappers
     */
    async bootstrapWith(bootstrappers = []) {
        // TODO: Maybe trigger some events to tell when something is (being) bootstrapped. Should be waited for.

        for (const Bootstrapper of bootstrappers) {
            // eslint-disable-next-line no-await-in-loop
            await (new Bootstrapper()).bootstrap(this.cradle);
        }

        this.hasBeenBootstrapped = true;
    }

    /**
     * Boot the application's service providers.
     */
    async boot() {
        if (this.booted) {
            return;
        }

        for (const provider of this.serviceProviders) {
            // eslint-disable-next-line no-await-in-loop
            await provider.boot(this.cradle);
        }

        this.booted = true;
        this.emit('booted');
    }

    /**
     * Register all of the configured providers.
     */
    async registerConfiguredProviders(providers) {
        for (const provider of providers) {
            await this.registerProvider(provider);
        }
    }

    /**
     * Register a serviceProvider and boot it if the app is already booted
     *
     * @param name
     * @return {Promise<void>}
     */
    async registerProvider(name) {
        const provider = this.resolve(name);
        this.serviceProviders.push(provider);

        provider.register();

        if (this.booted) {
            await provider.boot(this.cradle);
        }
    }
};
