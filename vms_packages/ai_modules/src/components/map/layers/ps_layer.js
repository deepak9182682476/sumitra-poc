// ps_layer.js
import React, { useContext, useEffect, useState } from 'react';
import MapContext from '../mapcontext';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Stroke, Fill, Text } from 'ol/style';

const createTextStyle = function (feature, zoomLevel) {
  const align = "center";
  const baseline = "middle";
  const size = zoomLevel > 16 ? "20px" : "15px";
  const overflow = true;
  const fillColor = "white";
  const font = `bold ${size} Montserrat`;


  return new Text({
    textAlign: align,
    textBaseline: baseline,
    text: feature.get('Name'),
    fill: new Fill({color: fillColor}),
    overflow: overflow,
    font: font,
    overflow: overflow
  });
};

const PSLayer = ({ geoJsonUrl, visibility }) => {
  const { map } = useContext(MapContext);
  const [psGeojsonObject, setPSGeojsonObject] = useState(null);

  useEffect(() => {
    // Fetch the PS GeoJSON file
    fetch(geoJsonUrl)
      .then(response => response.json())
      .then(data => setPSGeojsonObject(data))
      .catch(error => console.error('Error fetching PS GeoJSON:', error));
  }, [geoJsonUrl]);

  useEffect(() => {
    if (!map || !psGeojsonObject) return;

    const psVectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(psGeojsonObject, {
        featureProjection: 'EPSG:3857'
      })
    });

    const psVectorLayer = new VectorLayer({
      source: psVectorSource,
      style: feature => {
        const zoomLevel = map.getView().getZoom();
        return new Style({
          stroke: new Stroke({
            color: '#FFA836',
            width: 1
          }),
          text: zoomLevel > 14.8 ? createTextStyle(feature, zoomLevel) : undefined
        });
      },
      zIndex: 10,
      minZoom: 14,
      visible: visibility,
    });

    map.addLayer(psVectorLayer);

    return () => {
      if (map) {
        map.removeLayer(psVectorLayer);
      }
    };
  }, [map, psGeojsonObject, geoJsonUrl, visibility]);

  return null;
};

export default PSLayer;
