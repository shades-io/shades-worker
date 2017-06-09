/*
 * Worker process entry point.
 */

'use strict';

const log = require('bunyan').createLogger({
    name: 'shades-worker',
    level: 'debug'
});

const createWorker = require('./lib/worker');

const start = () => {
    const { store, broker, projections } = require('shades-module-loader');

    /* TODO get from worker config */
    const namespaces = ['npp'];

    const worker = createWorker({
        log,
        namespaces,
        broker,
        store,
        projections
    });
};

start();
