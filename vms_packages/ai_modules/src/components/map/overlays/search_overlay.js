import React, { useContext, useEffect, useState } from "react";
import {OverviewMap, defaults as defaultControls} from 'ol/control';
import MapContext from "../mapcontext";

const SearchOverlay = () => {
    const { map } = useContext(MapContext);
    // var source = new OSM();
        var overviewMapControl = new OverviewMap({
        layers: [
             ],
        });

	useEffect(() => {
		if (!map) return;

		let fullScreenControl = defaultControls().extend([overviewMapControl]);

		map.controls.push(fullScreenControl);

		return () => map.controls.remove(fullScreenControl);
	}, [map]);

	return null;
};

export default SearchOverlay;