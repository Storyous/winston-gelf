'use strict';


class Payload {

    /**
     * @param version {string}
     * @param host {string}
     * @param environment {string}
     * @param service {string}
     * @param level {number}
     * @param message {string|Error}
     * @param meta {Object|Error|null}
     */
    constructor (version, host, environment, service, level, message, meta = {}) {
        this._version = version;
        this._host = host;
        this._environment = environment;
        this._service = service;

        this._level = level;
        this._message = message;
        this._meta = meta;

        this._timestamp = Math.floor(Date.now() / 1000);
    }

    /**
     * @returns {Object}
     */
    toObject () {
        return this._createPayloadObject();
    }

    /**
     * @returns {string}
     */
    toString () {
        return JSON.stringify(this.toObject());
    }

    /**
     *
     * @returns {Object}
     * @private
     */
    _createPayloadObject () {

        let message = this._message;
        let meta = this._meta;

        const res = {
            version: this._version,
            host: this._host,
            level: this._level,
            short_message: null,
            full_message: null,
            timestamp: this._timestamp
        };

        let error = null;

        if (message instanceof Error) {
            error = message;
            message = null;
        }

        if (meta instanceof Error) {
            error = meta;
            meta = {};
        }

        if (error) {
            message = message || error.message;
            res.full_message = error.stack;

            // extract error file and line
            let fileinfo = error.stack.split('\n')[1];
            fileinfo = fileinfo.substr(fileinfo.indexOf('(') + 1, fileinfo.indexOf(')'));
            fileinfo = fileinfo.split(':');
            const [file, line] = fileinfo;

            meta = Object.assign({ file, line }, meta);
        }

        res.short_message = message;

        meta = Object.assign({
            environment: this._environment,
            service: this._service
        }, meta);

        for (const key in meta) {
            if (Object.prototype.hasOwnProperty.call(meta, key)) {
                res[(key in res) ? key : `_${key}`] = meta[key];
            }
        }

        // _id is reserved for Graylog
        if (res._id) {
            res.__id = res._id;
            delete res._id;
        }

        return res;
    }
}

module.exports = Payload;
