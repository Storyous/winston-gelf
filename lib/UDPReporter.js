'use strict';

const Reporter = require('./reporter');
const log = require('gelf-pro');


class UDPReporter extends Reporter {

    /**
     * @param options {Object}
     */
    constructor (options) {
        super();
        this._client = log;
        this._client.setConfig(options);
    }

    /**
     *
     * @param payload {Payload}
     */
    report (payload) {
        this._client.send(payload.toObject(), (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
}

module.exports = UDPReporter;
