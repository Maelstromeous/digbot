const config = require('config');
const ServiceProvider = require('../foundation/ServiceProvider');

const autodelete = require('../admin/channels/autodelete.js');
const mentionSpam = require('../admin/antispam/mentionspam.js');
const play = require('../commands/PlayCommand.js');
const sfx = require('../commands/SfxCommand.js');
const server = require('../server/server.js');

module.exports = class CheckProvider extends ServiceProvider {
    async boot() {
        // Interval call auto delete to get rid of inactive temp channels
        setInterval(() => {
            if (server.getGuild(config.get('general.server')) === null) { return; }
            autodelete.execute(server.getGuild(config.get('general.server')));
        }, config.get('autoDeleteChannels'));

        // Call 5 min admin checks
        // Note: DO NOT CHANGE INTERVAL LENGTH without also changing the events.check function
        setInterval(() => {
            // events.check();
            // poll.check();
            mentionSpam.release();
        }, 300000);

        // Call daily admin check
        setInterval(() => {
            if (server.getGuild(config.get('general.server')) === null) { return; } // Check server has been stored
            // prune();
            sfx.ready();
            play.ready();
        }, 86400000);
    }
};
