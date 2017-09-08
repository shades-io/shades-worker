/*
 * 
 */

'use strict';

const create = ({
    log,
    projection,
    projectionName
}) => {
    const process = (currentProjectionState, event) => {
        const eventType = event.relationship ? 'relationship' : 'entities';
        const body = event.entity || event.relationship;

        const projectionInstance = projection({
            initialState: currentProjectionState
        });

        const { operation } = event;
        const delta = projectionInstance[eventType][operation](body);

        return Promise.resolve({
            projectionName,
            delta,
            event,
            projectionState: projectionInstance.serialize()
        });
    };
    
    return {
        process,
        projectionName
    };
};

module.exports = create;
