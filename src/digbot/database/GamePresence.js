const mongoose = require('./Mongoose');
const gamePresenceSchema = require('./schemas/GamePresenceSchema');

module.exports = mongoose.model('gamepresencelog', gamePresenceSchema);
