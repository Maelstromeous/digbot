const config = require('config');
const { google } = require('googleapis');
const yt = require('ytdl-core');

const Command = require('./foundation/Command');
const logger = require('../logger');
const server = require('../server/server.js');
const sfxCommand = require('../../assets/sfx/sfx-assets.js');

const youtube = google.youtube({
    version: 'v3',
    auth: config.get('youtubeKey'),
}); // create youtube API client

const TAG = '!sfxCommand';


let busy = false;
let failing = false;

const queue = [];
const verification = {};

module.exports = class SfxCommand extends Command {
    constructor() {
        super();

        this.name = 'sfx';
    }

    async execute({ message: msg }) {
        if (!config.get('features.sfx')) {
            sendMessageToChannel(msg.channel, 'Sorry this feature has been disabled');
            return false;
        }

        if (msg.content.length === 4 || msg.content.substring(5) === ' ') {
            sendMessageToChannel(msg.channel, 'Please provide an sfxCommand to play. E.g. !sfxCommand cena');
            return false;
        }

        if (msg.content.substring(5) === 'list') {
            sendMessageToChannel(msg.channel, list(msg));
            return false;
        }
        if (typeof sfxCommand[msg.content.substring(5)] === 'undefined') {
            sendMessageToChannel(msg.channel, 'Sorry I don\'t recognise that sound effect');
            return false;
        }
        if (!msg.member.voiceChannel) {
            sendMessageToChannel(msg.channel, 'Please be in a voice channel first!');
            return false;
        }
        if (busy) {
            sendMessageToChannel(msg.channel, `Added !sfx effect *${msg.content.substring(5)}* `
                + `to play queue for ${msg.member.displayName}, queue length: ${queue.length}`, true)
                .then((botMessage) => {
                    queueAdd(msg, botMessage);
                })
                .catch(() => {
                    logger.event(TAG, 'Queue failed to add due to failed promise (busy)');
                    sendMessageToChannel(msg.channel, 'Sorry, the sfxCommand encountered an error, please try again.');
                });
            return true;
        }
        sendMessageToChannel(
            msg.channel,
            `Playing effect: *${msg.content.substring(5)}* for ${msg.member.displayName}`,
            true,
        )
            .then((botMessage) => {
                queueAdd(msg, botMessage);
                play();
            })
            .catch(() => {
                logger.event(TAG, 'Queue failed to add due to failed promise');
                sendMessageToChannel(msg.channel, 'Sorry, the sfxCommand encountered an error, please try again.');
            });
        return true;
    }

    // Called on ready and then every 24 hours, verifies all sfxCommand on file are good links
    static ready() {
        if (!config.get('features.sfx')) { return; }
        for (const x in sfxCommand) {
            if (sfxCommand[x].source === 'youtube') {
                verify(sfxCommand[x].link, x);
            }
        }
    }

    /**
     * @return {string}
     */
    help() {
        return 'Play a sound effect in your voice channel';
    }
};


// Send the user a list of all available sound effects
function list(msg) {
    let message = '__Full list of available sound effects__: ';
    for (const effect in sfxCommand) {
        message += `\n!sfx ${effect} - ${sfxCommand[effect].description}`;
    }
    if (message.length < 2000) {
        msg.author.send(message)
            .then(() => {
                logger.debug(TAG, 'Succesfully sent message');
            })
            .catch((err) => {
                logger.warning(TAG, `Failed to send message error: ${err}`);
            });
        return `I'll PM you the full list of sound effects ${msg.member.displayName}`;
    }
    logger.warning(
        TAG,
        'You fools, you damned fools, !sfxCommand list message is over 2k in characters and needs to be refactored',
    );
    return 'Sorry this command is temporarily broken we\'ve got top men working on it right now.';
}

// Called when there is a verified sfxCommand to be played, all info required is passed via the queue
function play() {
    logger.event(TAG, 'play');
    if (server.getReady() === false) {
        logger.debug(TAG, 'Server not ready, setting play on timeout');
        setTimeout(() => {
            logger.debug(TAG, 'Calling play again');
            this.play();
        }, 10000);
        return false;
    }
    if (queue.length > 1) {
        logger.info(TAG, `Play called, ${queue.length - 1} more in queue`);
    }
    busy = true;
    const failSafe = setTimeout(release, 30000); // Reset busy status after 30 seconds
    logger.info(TAG, `${queue[0].user} called the ${queue[0].effect} effect for `
        + `the channel ${queue[0].channelName} with ${queue[0].channelSize} occupants`);

    // If sfxCommand is local file
    if (sfxCommand[queue[0].effect].source === 'local') {
        const file = `../../../${sfxCommand[queue[0].effect].path}`;
        const { options } = sfxCommand[queue[0].effect];
        queue[0].voiceChannel.join()
            .then((connection) => {
                logger.event(TAG, 'Bot Connected to channel');
                logger.debug(TAG, `Connected to channel: ${queue[0].channelName}`);
                connection.on('disconnect', () => {
                    logger.event(TAG, 'Bot Disconnected from channel');
                    logger.debug(TAG, `Disconected from channel: '${queue[0].channelName}`);
                    queue[0].botMessage.delete()
                        .then(() => {
                            logger.info(TAG, 'Succesfully finished playing and deleted message');
                        })
                        .catch((err) => {
                            logger.warning(TAG, `Failed to delete message after playing, ${err}`);
                        });
                    if (failSafe) {
                        clearTimeout(failSafe);
                    }
                    failing = false;
                    playEnd(true);
                });
                connection.on('error', (err) => {
                    logger.warning(TAG, `Error from connection: ${err}`);
                });
                const dispatcher = connection.playFile(file, options);
                dispatcher.on('end', () => {
                    queue[0].voiceChannel.leave();
                    queue[0].botMessage.delete()
                        .then(() => {
                            logger.info(TAG, 'Succesfully finished playing and deleted message');
                        })
                        .catch((err) => {
                            logger.warning(TAG, `Failed to delete message after playing, ${err}`);
                        });
                });
                dispatcher.on('start', () => {
                    logger.event(TAG, 'Bot started playing');
                    logger.info(TAG, `Started playing: ${queue[0].effect} in ${queue[0].channelName}`);
                });
                dispatcher.on('error', (err) => {
                    queue[0].textChannel.send('Error during playback, please try again');
                    logger.debug(TAG, `Error while playing ${queue[0].effect} effect: ${err}`);
                });
            })
            .catch((err) => {
                if (failing === false) {
                    logger.event(TAG, 'Bot unable to connect to channel');
                    queue[0].textChannel.send('Error establishing connection, re-trying...')
                        .then(() => {
                            logger.debug(TAG, 'Succesfully sent message');
                        })
                        .catch((errr) => {
                            logger.warning(TAG, `Failed to send message error: ${errr}`);
                        });
                    failing = 0;
                }
                failing++;
                logger.warning(TAG, `voiceChannel.join promise rejected, error: ${err}`);
                queue[0].voiceChannel.leave();
                playEnd(false);
            });
        return true;
    }

    // If sfxCommand is youtube link
    if (sfxCommand[queue[0].effect].source === 'youtube') {
        const source = sfxCommand[queue[0].effect].link;

        // Verify source is good
        if (verification[queue[0].effect] !== true) {
            queue[0].textChannel.send(
                `The SFX *${queue[0].effect}* is currently unavailable, please try a different SFX`,
            )
                .then(() => {
                    logger.debug(TAG, 'Succesfully sent message regarding source');
                })
                .catch((err) => {
                    logger.warning(TAG, `Failed to send message regarding source error: ${err}`);
                });
            playEnd(true);
            return false;
        }

        const stream = yt(source, { audioonly: true });
        const { options } = sfxCommand[queue[0].effect];
        queue[0].voiceChannel.join()
            .then((connection) => {
                logger.event(TAG, `Bot joined channel: ${queue[0].channelName}`);
                connection.on('disconnect', () => {
                    logger.event(TAG, `Bot disconnected from channel: ${queue[0].channelName}`);
                    queue[0].botMessage.delete()
                        .then(() => {
                            logger.info(TAG, 'Succesfully finished playing and deleted message');
                        })
                        .catch((err) => {
                            logger.warning(TAG, `Failed to delete message after playing, ${err}`);
                        });
                    if (failSafe) {
                        clearTimeout(failSafe);
                    }
                    failing = false;
                    playEnd(true);
                });
                connection.on('error', (err) => {
                    logger.event(TAG, `Bot connection error to channel: ${queue[0].channelName}`);
                    queue[0].textChannel.send('Error with connection, please try again')
                        .then(() => {
                            logger.debug(TAG, 'Succesfully sent message');
                        })
                        .catch((errr) => {
                            logger.warning(TAG, `Failed to send message error: ${errr}`);
                        });
                    logger.warning(TAG, `Error from connection: ${err}`);
                });
                const dispatcher = connection.playStream(stream, options);
                dispatcher.on('end', () => {
                    queue[0].voiceChannel.leave();
                    logger.event(TAG, `Bot left channel: ${queue[0].channelName}`);
                });
                dispatcher.on('start', () => {
                    logger.event(TAG,
                        `Bot started playing: ${queue[0].effect} in ${queue[0].channelName}`);
                });
                dispatcher.on('error', (err) => {
                    logger.event(TAG,
                        `Bot playback error: ${queue[0].effect} in ${queue[0].channelName} effect: ${err}`);
                    queue[0].textChannel.send('Error during playback, please try again')
                        .then(() => {
                            logger.debug(TAG, 'Succesfully sent message');
                        })
                        .catch((errr) => {
                            logger.warning(TAG, `Failed to send message error: ${errr}`);
                        });
                });
            })
            .catch((err) => {
                logger.event(TAG, 'Bot unable to connect to channel');
                if (failing === false) {
                    queue[0].textChannel.send('Error establishing connection, re-trying...')
                        .then(() => {
                            logger.debug(TAG, 'Succesfully sent message');
                        })
                        .catch((errr) => {
                            logger.warning(TAG, `Failed to send message error: ${errr}`);
                        });
                    failing = 0;
                }
                failing++;
                logger.warning(TAG, `voiceChannel.join promise rejected, error: ${err}`);
                queue[0].voiceChannel.leave();
                playEnd(false);
            });
        return true;
    }
    return false;
}

// Called when the bot DCs from a voicechannel
function playEnd(success) {
    if (success !== false || failing === 3) {
        queue.splice(0, 1);
    }
    if (queue.length !== 0) {
        setTimeout(play, 1500); // Don't remove, needed to prevent fail cascade
    } else {
        busy = false;
    }
    if (failing > 3) {
        throw new Error(`${TAG}: Fail cascade detected, restarting...`);
    }
}

// Failsafe function called after 30s timeout, reset busy status and leave channel to play next in queue
function release() {
    logger.event(TAG, 'release');
    queue[0].voiceChannel.leave();
    logger.warning(TAG, 'SFX play timed out');
}

// Function to send messages to channels, optional promise functionality to get the new message back
function sendMessageToChannel(channel, message, promise) {
    if (promise === true) {
        return new Promise((resolve, reject) => {
            channel.send(message)
                .then((botMessage) => {
                    logger.debug(TAG, `Succesfully sent message: ${message}`);
                    resolve(botMessage);
                })
                .catch((err) => {
                    logger.warning(TAG, `Failed to send message to channel, ${err}`);
                    reject(err);
                });
        });
    }
    return channel.send(message)
        .then(() => {
            logger.debug(TAG, `Succesfully sent message: ${message}`);
        })
        .catch((err) => {
            logger.warning(TAG, `Failed to send message to channel, ${err}`);
        });
}

// Construct the object to store in the queue
function queueAdd(msg, botMessage) {
    const messageObject = {};
    messageObject.voiceChannel = msg.member.voiceChannel;
    messageObject.channelName = msg.channel.name;
    messageObject.channelSize = msg.member.voiceChannel.members.size;
    messageObject.effect = msg.content.substring(5);
    messageObject.user = msg.member.displayName;
    messageObject.textChannel = msg.channel;
    messageObject.botMessage = botMessage;
    queue.push(messageObject);
    msg.delete()
        .then(() => {
            logger.debug(TAG, `Recieved and Succesfully deleted command: ${msg.content}`);
        })
        .catch((err) => {
            logger.warning(TAG, `Failed to delete !sfx command message: ${msg.content} `
                + `from ${msg.member.displayName}, ${err}`);
        });
}

function verify(source, name) {
    if (source.indexOf('?v=') !== -1) {
        source = source.substring((source.indexOf('?v=') + 3)); // eslint-disable-line no-param-reassign
    }
    const params = {
        part: 'snippet',
        id: source,
    };
    youtube.videos.list(params)
        .then((response) => {
            if (response.data.pageInfo.totalResults === 0) {
                logger.warning(TAG, `Verification process indicates sfx asset: *${name}* is bad`);
                verification[name] = false;
            } else {
                verification[name] = true;
            }
        })
        .catch(() => {
            verification[name] = false;
        });
}
