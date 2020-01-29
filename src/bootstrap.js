const { asClass, asValue } = require('awilix');
const App = require('./digbot/foundation/App');
const Kernel = require('./digbot/foundation/Kernel');
const logger = require('./logger');


const app = new App();

app.register('logger', asValue(logger));
app.register('kernel', asClass(Kernel)
    .singleton());

module.exports = app;
