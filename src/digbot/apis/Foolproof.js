const { create } = require('axios');

module.exports = class Foolproof {
    constructor() {
        this.axios = create({
            baseURL: 'https://yesno.wtf/api',
        });
    }

    /**
     * @return {PromiseLike<String>}
     */
    getAnswer() {
        return this.axios.get('/')
            .then(({ data }) => data);
    }
};
