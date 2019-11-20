const Dispatcher = require('../foundation/Dispatcher');

const GamePresence = require('../database/GamePresence');

module.exports = class GameLoggingDispatcher extends Dispatcher {
    /**
     * @param discordClient
     * @param logger
     */
    constructor({ discordClient }) {
        super();

        this.client = discordClient;
    }

    /**
     * @return {Promise<void>}
     */
    async start() {
        this.registerListenersTo(this.client, {
            guildMemberAdd: member => this.filter(member)
                && setImmediate(this.started, member),
            guildMemberRemove: member => this.filter(member)
                && setImmediate(this.ended, member),
            presenceUpdate: (old, member) => this.filter(member)
                && setImmediate(this.started, member)
                && setImmediate(this.ended, old),
        });
    }

    /**
     * @return {Promise<void>}
     */
    async stop() {
        this.unregisterListenersFromAll();
    }

    /**
     * Filter members who's presences should not be recorded
     *
     * @param member
     * @return {boolean}
     */
    filter(member) {
        return !member.user.bot;
    }

    /**
     * Log when someone started playing a game
     *
     * @param member
     */
    async started(member) {
        if (member.presence.game && member.presence.game.type === 0) {
            await GamePresence.create({
                guild: member.guild.id,
                member: member.id,
                game: member.presence.game.name,
                start: Date.now(),
                end: null,
            });
        }
    }

    /**
     * Log when someone stopped playing a game
     *
     * @param member
     */
    async ended(member) {
        if (member.presence.game && member.presence.game.type === 0) {
            await GamePresence.updateOne({
                guild: member.guild.id,
                member: member.id,
                game: member.presence.game.name,
                end: null,
            }, { end: Date.now() });
        }
    }
};
