'use strict';

const Reporter = require('./reporter');


class ConsoleReporter extends Reporter {
    report (payload) {
        console.log(JSON.stringify(payload)); // eslint-disable-line
    }
}

module.exports = ConsoleReporter;
