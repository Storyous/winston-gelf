'use strict';

const os = require('os');
const process = require('process');
const Transport = require('winston-transport');


class GELFTransport extends Transport {

    constructor (options = {}) {
        super(options);
        this._version = options.version || '0.0';
        this._hostname = options.hostname || os.hostname();
        this._environment = options.environment || process.env.NODE_ENV;
        this._service = options.service || 'nodejs';
        this._silent = options.silent || false;
        this._level = GELFTransport._levelToGELF(options.level || 'info');
        this._reporters = options.reporters || [];
    }

    addReporter (reporter) {
        this._reporters.push(reporter);
    }

    log (level, msg, meta, callback) {

        if (this._silent) {
            return;
        }

        level = GELFTransport._levelToGELF(level);

        if (level > this._level) {
            return;
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const payload = {
            version: this._version,
            host: this._hostname,
            short_message: msg,
            full_message: null,
            timestamp,
            level,
            _environment: this._environment,
            _service: this._service
        };
        GELFTransport._populatePayloadWithMeta(payload, meta);

        this._reporters.forEach((reporter) => {
            reporter.report(payload);
        });

        callback(null, true);
    }

    static _populatePayloadWithMeta (payload, meta = {}) {
        if (meta instanceof Error) {
            payload.short_message = meta.message;
            payload.full_message = meta.stack;

            // extract error file and line
            let fileinfo = meta.stack.split('\n')[1];
            fileinfo = fileinfo.substr(fileinfo.indexOf('(') + 1, fileinfo.indexOf(')'));
            fileinfo = fileinfo.split(':');
            const [file, line] = fileinfo;

            payload._file = file;
            payload._line = line;
        } else {
            for (const key in meta) {
                if (Object.prototype.hasOwnProperty.call(meta, key)) {
                    if (Object.prototype.hasOwnProperty.call(payload, key)) {
                        payload[key] = meta[key];
                    } else {
                        payload[`_${key}`] = meta[key];
                    }
                }
            }
        }

        // _id is reserved for Graylog
        if (payload._id) {
            payload.__id = payload._id;
            delete payload._id;
        }

        return payload;
    }

    static _levelToGELF (winstonLevel) {
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
