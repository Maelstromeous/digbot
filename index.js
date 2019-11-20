const config = require('config');
const { version } = require('./package');

const app = require('./src/bootstrap');

const kernel = app.resolve('kernel');

global.app = app;

kernel.run()
    .then(() => {
        app.resolve('logger').info({
            message: `DigBot started. NODE_ENV=${config.util.getEnv('NODE_ENV')}, VERSION=${version}`,
            label: 'kernel',
        });

        process.on('SIGTERM', async () => {
            await kernel.terminate(1);
        });

        process.on('SIGINT', async () => {
            await kernel.terminate(1);
        });

        process.on('exit', async () => {
            await kernel.terminate(0);
        });
    });
