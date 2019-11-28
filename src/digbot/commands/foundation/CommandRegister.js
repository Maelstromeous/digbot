const { RESOLVER, Lifetime } = require('awilix');

module.exports = class CommandRegister extends Map {
    /**
     * Constructor is necessary as the container tries to insert the cradle which causes problems.
     */
    constructor() {
        super();
    }

    /**
     * @param key
     * @param value
     */
    set(key, value) {
        super.set(key.toUpperCase(), value);
    }

    /**
     * @param key
     * @return {V}
     */
    get(key) {
        return super.get(key.toUpperCase());
    }

    /**
     * @return {Array}
     */
    toArray() {
        return Array.from(this.values());
    }
};

module.exports[RESOLVER] = {
    lifetime: Lifetime.SINGLETON,
};
