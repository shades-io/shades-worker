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

    log.debug('Creating worker');
    const worker = createWorker({
        log,
        namespaces,
        broker,
        store,
        projections
    });

    log.debug('Starting worker');
    worker.start();
};

start();
