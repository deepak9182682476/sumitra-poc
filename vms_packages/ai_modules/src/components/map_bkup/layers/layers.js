import React, { useEffect } from 'react';
import Vector from './vector';
import Heatmap from './heatmap';

export const Layers = (props) => {

    useEffect(() => {
        // Anything in here is fired on component mount.

        return () => {
            // Anything in here is fired on component unmount.
        }

    }, []);

    return (
        <div>
            {
                props.layerlist.map((layer, index) => (
                    {
                        'Vector': <Vector key={index} layer={layer} olmap={props.olmap} extent={props.extent} />,
                        'Heatmap': <Heatmap key={index} layer={layer} />,
                    }[layer.LayerType]
                ))
            }
        </div>
    )
}