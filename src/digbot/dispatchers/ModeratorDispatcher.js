const Dispatcher = require('../foundation/Dispatcher');

const modularChannelSystem = require('../admin/channels/modularchannels');
const nameCheck = require('../welcomepack/namecheck');

// TODO: This is a temporary dispatcher

module.exports = class ModeratorDispatcher extends Dispatcher {
    /**
     * @param discordClient
     * @param logger
     */
    constructor({ discordClient, logger }) {
        super();

        this.client = discordClient;
        this.logger = logger;
    }

    /**
     * @return {Promise<void>}
     */
    async start() {
        this.registerListenersTo(this.client, {
            guildMemberAdd: this.guildMemberAdd.bind(this),
            guildMemberUpdate: this.guildMemberUpdate.bind(this),
            voiceStateUpdate: this.voiceStateUpdate.bind(this),
        });
    }

    /**
     * @return {Promise<void>}
     */
    async stop() {
        this.unregisterListenersFromAll();
    }

    /**
     * @param member
     */
    guildMemberAdd(member) {
        nameCheck.execute(member);
    }

    /**
     * @param oldMember
     * @param newMember
     */
    guildMemberUpdate(oldMember, newMember) {
        nameCheck.execute(newMember);
    }

    /**
     * @param oldMember
     * @param newMember
     */
    voiceStateUpdate(oldMember, newMember) {
        modularChannelSystem.execute(oldMember, newMember);
    }
};
