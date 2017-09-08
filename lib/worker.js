/*
 * Worker that listens to the work queue, manages projection state and forwards
 * event/projection state to projection modules to generate diffs on top off the
 * current projection state.
 */

'use strict';

const validOperations = ['create', 'update', 'delete'];

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

    const isValidRelationship = relationship => {
        const { a, b } = relationship;
        return !!a && !!b
            && !!a.type && !!a.id
            && !!b.type && !!b.id;
    };

    const matchesSchema = event => {
        const hasBasicFields = !!event.operation && !!event.namespace;
        if (!hasBasicFields) {
            return false;
        }
        const validOperation = validOperations.includes(event.operation);
        if (!validOperation) {
            return false;
        }
        if (event.entity) {
            return !!event.entity.id && !!event.entity.type;
        }
        if (event.relationship) {
            return isValidRelationship(event.relationship);
        }
        return false;
    };

    const shouldProcess = event => {
        return namespaces.includes(event.namespace)
            && matchesSchema(event);
    };

    const handleEvent = event => {
        if (!shouldProcess(event)) {
            log.debug('Ignoring event', event);
            return Promise.resolve();
        }
        log.debug('Processing event', event);

        const { namespace } = event;

        const loadProjection = projectionName => {
            return store.projectionStates.get(namespace, projectionName);
        };
        const storeEvent = res => {
            return store.events.append(namespace, event)
                .then(() => res);
        };
        const storeProjection = res => {
            return store.projectionStates.put(namespace, res.projectionName, res.projectionState)
                .then(() => res);
        };

        const publishDelta = res => broker.updates.publish({
            namespace,
            projection_name: res.projectionName,
            delta: res.delta,
            event // TODO appending the original event for debugging purposes; remove
        });

        const process = processor =>
            loadProjection(processor.projectionName)
                .then(projectionState =>
                    processor.process(projectionState, event))
                .then(storeEvent)
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
