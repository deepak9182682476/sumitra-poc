import React, { useContext, useEffect } from "react";
import ReactDOM from 'react-dom';
import MapContext from "../MapContext";
import { alarmDomContent } from '../../Common/Util';
import '../Map.scss';
import { Overlay } from "ol";
import { toLonLat } from "ol/proj";

const InfoOverlay = (props) => {
    const { map } = useContext(MapContext);

    const displayFeatureInfo = (pixel) => {
        const wrapper = document.createElement('div');
        const marker = new Overlay({
            position: '',
            positioning: 'center-center',
            id: 'overlay_id',
            type: 'un-acknowledged',
            element: wrapper,
            stopEvent: false
        });
        let layername;
        let feature = map.forEachFeatureAtPixel(pixel, function (
            feature,
            layer
        ) {
            layername = layer && layer.get('title') ? layer.get('title') : '';
            layer = layer || null;
            return feature;
        });

        if (feature && layername && (layername == 'CrimeShiftDensity' || layername == 'CrimeTrend' || layername == 'CrimePrediction')) {
            // var coord = toLonLat([feature.get('lat'), feature.get('lon')]);
            // reverseGeocode(coord, feature);

            wrapper.onclick = function (eRef) {
                setTimeout(() => {
                    if (eRef.target.className === 'ol-popup-closer') {
                        eRef.target.parentElement.style.display = 'none';
                    }
                }, 100);
            }
            const displayFields = layername == 'CrimePrediction'  ? 'prediction' : layername == 'CrimeTrend' ? 'trend' : 'unAcknowledged'
            wrapper.innerHTML = alarmDomContent(feature)[displayFields];
            let arr = map.getOverlays().array_ || [];
            if (arr.length) {
                arr.forEach(element => {
                    map.removeOverlay(element);
                });
            }

            marker.setPosition([feature.getGeometry().flatCoordinates[0], feature.getGeometry().flatCoordinates[1]]);
            map.addOverlay(marker);

        }else{
            let arr = map.getOverlays().array_ || [];
            if (arr.length) {
                arr.forEach(element => {
                    map.removeOverlay(element);
                });
            }
        }
    }
    async function reverseGeocode(coords, feature) {
        await fetch('http://nominatim.openstreetmap.org/reverse?format=json&lon=' + coords[0] + '&lat=' + coords[1])
            .then(function (response) {
                if (response.ok) {
                    return response.clone().json();
                }
            }).then(function (json) {
                let display_name = json.display_name;
                feature.values_.crime_area = display_name;
                return feature;
            });
    }
    useEffect(() => {
        if (!map) return;
        map.on('pointermove', function (evt) {
            if (evt.dragging) {
                return;
            }
            var pixel = map.getEventPixel(evt.originalEvent);
            displayFeatureInfo(pixel);
        });

        return () => {
            if (map) {
                // map.removeLayer(tileLayer);
            }
        };
    }, [map, props]);

    return null;
};

export default InfoOverlay;