'use strict';

const os = require('os');
const process = require('process');
const Transport = require('winston-transport');

const Payload = require('./payload');


class GELFTransport extends Transport {

    /**
     * @param options {{
     *     version: String|null,
     *     hostname: String|null,
     *     environment: String|null,
     *     service: String|null,
     *     silent: Boolean|null,
     *     level: String|null,
     *     reporters: Array|null
     * }}
     */
    constructor (options = {}) {
        super();
        this._version = options.version || '0.0';
        this._hostname = options.hostname || os.hostname();
        this._environment = options.environment || process.env.NODE_ENV;
        this._service = options.service || 'nodejs';
        this._silent = options.silent || false;
        this._level = GELFTransport.winstonLevelToGelfLevel(options.level || 'info');
        this._reporters = options.reporters || [];
    }

    /**
     * @param reporter <Reporter>
     */
    addReporter (reporter) {
        this._reporters.push(reporter);
    }

    /**
     * @param level {String}
     * @param message {String}
     * @param meta {Object|null}
     * @param callback {Function}
     */
    log (level, message, meta = {}, callback) {

        if (this._silent) {
            return;
        }

        level = GELFTransport.winstonLevelToGelfLevel(level);

        if (level > this._level) {
            return;
        }

        const payload = new Payload(
            this._version,
            this._hostname,
            this._environment,
            this._service,
            level,
            message,
            meta
        );

        this._reporters.forEach((reporter) => {
            reporter.report(payload);
        });

        callback(null, true);
    }

    /**
     * @param winstonLevel {String}
     * @returns {number}
     */
    static winstonLevelToGelfLevel (winstonLevel) {
        const levels = {
            error: 0,
            warn: 1,
            info: 2,
            verbose: 3,
            debug: 4,
            silly: 5
        };
        return Object.prototype.hasOwnProperty.call(levels, winstonLevel) ? levels[winstonLevel] : levels.info;
    }
}

module.exports = GELFTransport;
