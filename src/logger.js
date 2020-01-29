const config = require('config');
const { createLogger, format, transports: { Console: ConsoleTransport } } = require('winston');

module.exports = createLogger({
    level: config.get('logger.level'),
    transports: [
        new ConsoleTransport({
            handleExceptions: true,
            format: format.combine(
                format.colorize(),
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                format.printf(info => `${info.timestamp} [${info.label || 'general'}] ${info.level}: ${info.message}`),
            ),
        }),
    ],
});
