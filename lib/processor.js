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
        const projectionInstance = projection({
            initialState: currentProjectionState
        });

        return projectionInstance.reduce(event)
            .then(({ delta, state, applied }) => ({
                projectionName,
                delta,
                event,
                applied,
                projectionState: state
            }));
    };
    
    return {
        process,
        projectionName
    };
};

module.exports = create;
