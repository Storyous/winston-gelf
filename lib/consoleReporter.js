'use strict';

const Reporter = require('./reporter');


class ConsoleReporter extends Reporter {

    /**
     * @param payload {Payload}
     */
    report (payload) {
        console.log(payload.toString()); // eslint-disable-line
    }
}

module.exports = ConsoleReporter;
