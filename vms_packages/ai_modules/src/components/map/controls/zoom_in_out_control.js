import { useContext, useEffect } from "react";
import { Zoom } from "ol/control";

import MapContext from "../mapcontext";
import '../map.css'

const ZoomInOutControl = (props) => {
	const { map } = useContext(MapContext);

	useEffect(() => {
		if (!map) return;
		let fullScreenControl = new Zoom({});

		map.controls.push(fullScreenControl);

		return () => map.controls.remove(fullScreenControl);
	}, [map]);

	return null;
};

export default ZoomInOutControl;