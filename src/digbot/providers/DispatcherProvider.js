const ServiceProvider = require('../foundation/ServiceProvider');

module.exports = class DispatcherProvider extends ServiceProvider {
    get dispatchers() {
        return [
            'digbot.dispatchers.DiscordConnectionDispatcher',
            'digbot.dispatchers.CommandDispatcher',
            'digbot.dispatchers.ModeratorDispatcher',
            'digbot.dispatchers.PresenceDispatcher',
            'digbot.dispatchers.RoleDispatcher',
            'digbot.dispatchers.GameLoggingDispatcher',
        ];
    }

    /**
     *
     * @param kernel
     * @return {Promise<void>}
     */
    async boot({ kernel }) {
        kernel.registerDispatchers(this.dispatchers.map(this.container.resolve));
    }
};
