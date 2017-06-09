/*
 * Worker process entry point.
 */

'use strict';

const requiredArgs = [
    'broker',
    'store',
    'projection'
];
const argv = require('minimist')(process.argv.slice(), {
    string: requiredArgs,
    alias: requiredArgs
        .reduce((aggr, key) => Object.assign(aggr, { [key]: key[0] }), {})
});
const log = require('bunyan').createLogger({
    name: 'shades-worker',
    level: 'debug'
});
/* Match namespaced, module-specific args, e.g. "shades-store-redis:hostname",
   capturing the module name and the key of the argument */
const namespacedArgsRegex = /^(shades-.+):(.+)$/;

const createWorker = require('./lib/worker');

const start = () => {
    log.debug('argv', argv);
    const options = parseArgs();
    log.info('Starting with options', options);

    const worker = createWorker({
        broker: importModule(
            options.brokerModuleName,
            options.moduleOptions[options.brokerModuleName]),
        store: importModule(
            options.storeModuleName,
            options.moduleOptions[options.storeModuleName]),
        projections: options.projectionModuleNames.map(name => importModule(
            name,
            options.moduleOptions[name]))
    });
};

const parseArgs = () => {
    validateArgs();
    const projectionArgs = [].concat(argv.projection);
    const projectionModuleNames = projectionArgs
        .map(projection => `shades-projection-${projection}`);

    const moduleOptions = Object
        .keys(argv)
        .filter(key => namespacedArgsRegex.test(key))
        .reduce((aggr, key) => {
            const [_, moduleName, optionKey] = namespacedArgsRegex.exec(key);
            aggr[moduleName] = Object.assign({}, aggr[moduleName], {
                [optionKey]: argv[key]
            });
            return aggr;
        }, {});

    return {
        brokerModuleName: `shades-broker-${argv.broker}`,
        storeModuleName: `shades-store-${argv.store}`,
        projectionModuleNames,
        moduleOptions
    };
};

const validateArgs = () => {
    requiredArgs.forEach(key => {
        if (argv[key] === undefined) {
            throw new Error(`Argument "${key}" is required.`);
        }
    });
};

const importModule = (name, options) => {
    log.debug(`Importing module ${name}`);
    /* TODO temp hack: mock "require" */
    const require = () => (() => {});

    return require(name)(options);
}

start();
