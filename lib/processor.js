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
        const delta = projection[operationsMapping[event.operation]](
            currentProjectionState,
            event);

        return Promise.resolve({
            projectionName,
            delta,
            projectionState: projection.read()
        });
    };
    
    return {
        process,
        projectionName
    };
};

module.exports = create;
