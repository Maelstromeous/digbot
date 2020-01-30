const config = require('config');
const { asFunction } = require('awilix');
const ServiceProvider = require('../foundation/ServiceProvider');

const mongoose = require('../database/Mongoose');

module.exports = class DatabaseProvider extends ServiceProvider {
    /**
     * Register any app dependency
     */
    register() {
        this.container.register('mongoose', asFunction(() => mongoose)
            .disposer(() => mongoose.disconnect()));
    }

    /**
     * Connects to the database and set a listener for errors.
     *
     * @return {Promise<void>}
     */
    async boot({ kernel, logger }) {
        await mongoose.connect(config.get('database.mongo.url'), {
            keepAlive: true,
            keepAliveInitialDelay: 300000,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        mongoose.connection.on('error', message => logger.error({
            message,
            label: 'mongoose',
        }));

        mongoose.connection.on('reconnectFailed', () => {
            logger.error({
                message: 'Connection to database lost',
                label: 'mongoose',
            });

            kernel.terminate(1);
        });
    }
};
