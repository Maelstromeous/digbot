const { asClass } = require('awilix');
const App = require('./digbot/foundation/App');
const Kernel = require('./digbot/foundation/Kernel');

const app = new App();

app.register('kernel', asClass(Kernel).singleton());

module.exports = app;
