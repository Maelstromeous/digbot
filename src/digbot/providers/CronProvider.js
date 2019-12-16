const config = require('config');
const { asFunction } = require('awilix');
const { CronJob } = require('cron');
const ServiceProvider = require('../foundation/ServiceProvider');

const autodelete = require('../admin/channels/autodelete.js');
const mentionSpam = require('../admin/antispam/mentionspam.js');
// const play = require('../commands/PlayCommand.js');
// const sfx = require('../commands/SfxCommand.js');
const server = require('../server/server.js');

module.exports = class CheckProvider extends ServiceProvider {
    register() {
        this.container.register(
            'cronjobMentionSpam',
            asFunction(
                () => new CronJob('0 */5 * * * *', () => {
                    mentionSpam.release();
                }),
            )
                .singleton()
                .disposer(job => job.stop()),
        );

        this.container.register(
            'cronjobAssets',
            asFunction(
                () => new CronJob('0 0 0 * * 0', () => {
                    sfx.ready();
                    play.ready();
                }),
            )
                .singleton()
                .disposer(job => job.stop()),
        );

        this.container.register(
            'cronjobChannels',
            asFunction(
                () => new CronJob('0 */20 * * * *', () => {
                    if (server.getGuild(config.get('general.server')) === null) { return; }
                    autodelete.execute(server.getGuild(config.get('general.server')));
                }),
            )
                .singleton()
                .disposer(job => job.stop()),
        );
    }

    async boot({ cronjobMentionSpam, cronjobChannels }) {
        // play.ready();
        // sfx.ready();

        cronjobMentionSpam.start();
        cronjobChannels.start();
        // cronjobAssets.start();
    }
};
