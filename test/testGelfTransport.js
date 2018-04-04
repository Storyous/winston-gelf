'use strict';

const assert = require('assert');
const { describe, it } = require('mocha');
const { GELFTransport } = require('../lib');

const testGelfTransportPayload = (level, msg, meta = {}, test) => {
    new GELFTransport({ reporters: [{ report: test }] })
        .log(level, msg, meta, () => {});
};

describe('GELFTransport', () => {

    it('should transform winston levels to GELF levels', () => {
        assert.equal(GELFTransport._levelToGELF('info'), 2);
        assert.equal(GELFTransport._levelToGELF('debug'), 4);
        assert.equal(GELFTransport._levelToGELF('gibberish'), 2); // fallback to info
    });

    it('should prepare payload compatible with GELF format', () => {

        testGelfTransportPayload('info', 'Test', {}, (payload) => {
            assert.equal(payload.short_message, 'Test');
            assert.equal(payload.level, 2);
            assert.ok(
                Object.prototype.hasOwnProperty.call(payload, 'full_message') &&
                Object.prototype.hasOwnProperty.call(payload, 'timestamp') &&
                Object.prototype.hasOwnProperty.call(payload, 'host') &&
                Object.prototype.hasOwnProperty.call(payload, 'version')
            );
        });

    });

    it('should prefix keys in payload with underscore', () => {
        testGelfTransportPayload('info', 'Foo', { bar: 'foo', foo: 'bar', host: 'foo.bar' }, (payload) => {
            assert.equal(payload.host, 'foo.bar');
            assert.equal(payload._bar, 'foo');
            assert.equal(payload._foo, 'bar');
        });
    });

    it('should accept Error instance as meta', () => {
        testGelfTransportPayload('info', null, new Error('Error message'), (payload) => {
            assert.equal(payload.short_message, 'Error message');
            assert.ok(payload.full_message.length !== 0);
            assert.ok(
                Object.prototype.hasOwnProperty.call(payload, '_file') &&
                Object.prototype.hasOwnProperty.call(payload, '_line')
            );
        });
    });

    it('should not report if _silent is set', () => {
        new GELFTransport({
            silent: true,
            reporters: [{ report: () => { throw new Error('Error should not be called'); } }]
        }).log('info', 'foo', {}, () => {});
    });


    it('should not report if level is too low', () => {
        new GELFTransport({
            level: 'warn',
            reporters: [{ report: () => { throw new Error('Error should not be called'); } }]
        }).log('info', 'foo', {}, () => {});
    });

    it('should be able to use multiple reporters', () => {
        let calls = 0;
        const reporter = { report: () => { calls++; } };
        const transport = new GELFTransport({
            reporters: [
                reporter,
                reporter
            ]
        });

        transport.log('info', 'foo', {}, () => {});
        assert.equal(calls, 2);

        calls = 0;
        transport.addReporter(reporter);
        transport.log('info', 'foo', {}, () => {});
        assert.equal(calls, 3);
    });
});
