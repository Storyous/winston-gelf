'use strict';

const Reporter = require('./reporter');
const udp = require('graylog2');


class UDPReporter extends Reporter {

    constructor (options) {
        super();
        this._udp = udp.graylog(options);
    }

    report (payload) {
        const additionalFields = {};
        Object.keys(payload).forEach((key) => {
            if (key.startsWith('_')) {
                additionalFields[key.replace('_', '')] = payload[key];
            }
        });

        this._udp.log(
            payload.short_message,
            payload.full_message,
            additionalFields,
            new Date(payload.timestamp * 1000),
            payload.level
        );
    }
}

module.exports = UDPReporter;
