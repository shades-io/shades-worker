/*
 * Worker that listens to the work queue, manages projection state and forwards
 * event/projection state to projection module sto generate diffs on top off the
 * current projection state.
 */

'use strict';

const create = ({
    log,
    broker,
    store,
    projections,
    namespaces
}) => {
    const processors = Object
        .keys(projections)
        .map(projectionName => require('./processor')({
            log,
            projectionName,
            projection: projections[projectionName]
        }));

    const shouldProcess = event => {
        return namespaces.includes(event.namespace);
    };

    const handleEvent = event => {
        if (!shouldProcess(event)) {
            log.debug('Ignoring event', event);
            return Promise.resolve();
        }
        log.debug('Processing event', event);

        const { namespace } = event;

        const loadProjection = projectionName =>
            store.projectionStates.get(namespace, projectionName);
        const storeProjection = res =>
            store.projectionStates.put(namespace, res.projectionName, res.projectionState)
                .then(() => res);

        const publishDelta = res => broker.updates.publish({
            namespace,
            projection_name: res.projectionName,
            delta: res.delta,
            event // TODO appending the original event for debugging purposes; remove
        });

        /* TODO: persist events to store */

        const process = processor =>
            loadProjection(processor.projectionName)
                .then(projectionState =>
                    processor.process(projectionState, event))
                .then(storeProjection)
                .then(publishDelta);

        return Promise.all(processors.map(process));
    };

    const start = () => {
        broker.queue.subscribe(handleEvent);
    };

    return {
        start
    };
};

module.exports = create;
