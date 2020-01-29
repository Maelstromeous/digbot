// TODO: Marked for removal
const logger = require('../logger');

module.exports = {
    // General debug messages
    debug(mod, message) {
        logger.debug({
            message,
            label: mod,
        });
    },
    // General major info, alert developers but do not crash
    devAlert(mod, message) {
        logger.info({
            message,
            label: mod,
        });
    },
    event(mod, message) {
        logger.verbose({
            message,
            label: mod,
        });
    },
    // General information messages
    info(mod, message) {
        logger.info({
            message,
            label: mod,
        });
    },
    // The server can continue to run, however it's things we maybe should address
    warning(mod, message) {
        logger.warn({
            message,
            label: mod,
        });
    },
};
