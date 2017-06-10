/*
 * 
 */

'use strict';

const operationsMapping = {
    c: 'create',
    u: 'update',
    d: 'delete'
};

const create = ({
    log,
    projection,
    projectionName
}) => {
    const process = (currentProjectionState, event) => {
        const eventType = event.relationship ? 'relationship' : 'entity';

        const projectionInstance = projection({
            initialState: currentProjectionState
        });

        const op = operationsMapping[event.operation];
        const delta = projectionInstance[eventType][op](event);

        return Promise.resolve({
            projectionName,
            delta,
            projectionState: projectionInstance.serialize()
        });
    };
    
    return {
        process,
        projectionName
    };
};

module.exports = create;
