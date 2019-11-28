const { RESOLVER, Lifetime } = require('awilix');

module.exports = class CommandRegister extends Map {
    /**
     * Constructor is necessary as the container tries to insert the cradle which causes problems.
     */
    constructor() {
        super();

        this.groups = new Map();
    }

    /**
     * @param key
     * @param value
     */
    set(key, value, group = 'default') {
        super.set(key.toUpperCase(), value);

        if (!this.groups.has(group)) {
            this.groups.set(group, []);
        }

        this.getGroup(group)
            .push(value);
    }

    getGroup(name) {
        const group = this.groups.get(name) || [];

        if (this.groups.has(name)) {
            this.groups.set(group);
        }

        return group;
    }

    /**
     * @param key
     * @return {V}
     */
    get(key) {
        return super.get(key.toUpperCase());
    }
};

module.exports[RESOLVER] = {
    lifetime: Lifetime.SINGLETON,
};
