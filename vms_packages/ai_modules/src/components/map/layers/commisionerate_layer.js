// commisionerate_layer.js
import React, { useContext, useEffect, useState } from 'react';
import MapContext from '../mapcontext';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Stroke, Fill, Text } from 'ol/style';

const createTextStyle = function (feature) {
  const align = "center";
  const baseline = "middle";
  const size = "15px";
  const fillColor = "white";
  const font = `bold ${size} Montserrat`;
  const overflow = false;

  return new Text({
    textAlign: align,
    textBaseline: baseline,
    text: feature.get('Commissionerate'),
    fill: new Fill({color: fillColor}),
    overflow: overflow,
    font: font,
    overflow: overflow
  });
};

const CommisionerateLayer = ({ geoJsonUrl, visibility }) => {
  const { map } = useContext(MapContext);
  const [commisionerateGeojsonObject, setCommisionerateGeojsonObject] = useState(null);

  useEffect(() => {
    // Fetch the Commisionerate GeoJSON file
    fetch(geoJsonUrl)
      .then(response => response.json())
      .then(data => setCommisionerateGeojsonObject(data))
      .catch(error => console.error('Error fetching Commisionerate GeoJSON:', error));
  }, [geoJsonUrl]);

  useEffect(() => {
    if (!map || !commisionerateGeojsonObject) return;

    const commisionerateVectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(commisionerateGeojsonObject, {
        featureProjection: 'EPSG:3857'
      })
    });

    const commisionerateVectorLayer = new VectorLayer({
      source: commisionerateVectorSource,
      style: feature => {
        return new Style({
          stroke: new Stroke({
            color: '#FFA836',
            width: 1
          }),
          text: createTextStyle(feature)
        });
      },
      zIndex: 5,
      maxZoom: 14,
      visible: visibility,
    });

    map.addLayer(commisionerateVectorLayer);

    return () => {
      if (map) {
        map.removeLayer(commisionerateVectorLayer);
      }
    };
  }, [map, commisionerateGeojsonObject, geoJsonUrl, visibility]);

  return null;
};

export default CommisionerateLayer;
