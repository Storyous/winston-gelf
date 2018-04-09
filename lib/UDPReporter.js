'use strict';

const Reporter = require('./reporter');
const log = require('gelf-pro');


class UDPReporter extends Reporter {

    constructor (options) {
        super();
        this._client = log;
        this._client.setConfig(options);
    }

    report (payload) {
        this._client.send(payload);
    }
}

module.exports = UDPReporter;
