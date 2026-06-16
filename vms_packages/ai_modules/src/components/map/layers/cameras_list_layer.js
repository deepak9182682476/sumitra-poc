import React, { useContext, useEffect, useState } from 'react';
import MapContext from '../mapcontext';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Circle as CircleStyle, Icon, Fill, Stroke } from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';

const createNumberIconStyle = (zoomLevel) => {
  const size = zoomLevel < 4 ? '20' : zoomLevel < 8 ? '24' : zoomLevel < 12 ? '28' : zoomLevel < 16 ? '32' : zoomLevel < 20 ? '32' : '40';
  return new Style({
    image: new Icon({
      opacity: 1,
      src: `/assets/images/CameraIcons/CameraLive-${size}px.svg`,
      scale: 1,
    }),
  });
};

const CamerasListLayer = ({ camerasData, visibility }) => {
  const { map } = useContext(MapContext);
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    if (!map || !camerasData || camerasData.length === 0) return;

    const cameraSource = new VectorSource();
    const cameraLayer = new VectorLayer({
      source: cameraSource,
      style: new Style({
        image: new CircleStyle({
          radius: 25,
          fill: new Fill({ color: '#034694' }),
          stroke: new Stroke({
            color: 'white',
            width: 1,
          }),
        }),
      }),
      zIndex: 30,
      visible: visibility,
    });

    const newFeatures = camerasData.reduce((acc, camera) => {
      if (camera.geolocation && camera.geolocation.coordinates) {
        const [lon, lat] = camera.geolocation.coordinates;
        const coords = fromLonLat([lon, lat]);
        const feature = new Feature({
          geometry: new Point(coords),
          cameraData: camera
        });
        feature.setStyle(createNumberIconStyle(map.getView().getZoom()));
        // Add an identifier to check layer-specific features
        feature.set('layerId', 'cameraLayer');
        acc.push(feature);
      } else {
        console.log('Invalid geolocation data:', camera.geolocation);
      }
      return acc;
    }, []);

    setFeatures(newFeatures);
    cameraSource.addFeatures(newFeatures);
    map.addLayer(cameraLayer);

    const info = document.getElementById('info');

    let currentFeature;
    const displayFeatureInfo = function (pixel) {
      // Check if feature belongs to the cameraLayer
      const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
        if (feature.get('layerId') === 'cameraLayer') {
          return feature;
        }
      });
      if (feature) {
        info.style.left = (pixel[0] - info.offsetWidth / 2) + 'px';
        info.style.top = (pixel[1] - info.offsetHeight - 10) + 'px';
        if (feature !== currentFeature) {
          const cameraData = feature.get('cameraData');
          info.style.visibility = 'visible';
          info.innerHTML = `
            <div class="info-container">
              <div class="info-row">
                <div class="field-name">Camera Name</div>
                <div class="field-value">: ${cameraData.camera_name}</div>
              </div>
              <div class="info-row">
                <div class="field-name">Police Station</div>
                <div class="field-value">: ${cameraData.police_station}</div>
              </div>
            </div>
          `;
        }
      } else {
        info.style.visibility = 'hidden';
      }
      currentFeature = feature;
    };

    const isAlertFeatureAtPixel = (pixel) => {
      return map.forEachFeatureAtPixel(pixel, (feature) => feature.get('layerId') === 'alertLayer');
    };

    map.on('pointermove', function (evt) {
      if (evt.dragging) {
        info.style.visibility = 'hidden';
        currentFeature = undefined;
        return;
      }
      const pixel = map.getEventPixel(evt.originalEvent);
      if (!isAlertFeatureAtPixel(pixel)) {
        displayFeatureInfo(pixel);
      } else {
        info.style.visibility = 'hidden';
        currentFeature = undefined;
      }
    });

    map.on('moveend', () => {
      newFeatures.forEach((feature) => {
        feature.setStyle(createNumberIconStyle(map.getView().getZoom()));
      });
      cameraSource.changed();
    });

    return () => {
      if (map) {
        map.removeLayer(cameraLayer);
      }
    };
  }, [map, camerasData, visibility]);

  return null;
};

export default CamerasListLayer;


// import React, { useContext, useEffect } from 'react';
// import MapContext from '../mapcontext';
// import VectorLayer from 'ol/layer/Vector';
// import VectorSource from 'ol/source/Vector';
// import { Style, Circle as CircleStyle, Fill, Stroke, Icon } from 'ol/style';
// import Feature from 'ol/Feature';
// import Point from 'ol/geom/Point';
// import { fromLonLat } from 'ol/proj';

// const createNumberIconStyle = () => new Style({
//     image: new Icon({
//         opacity: 1,
//         src: "/assets/images/CameraIcons/CameraLive-36px.svg",
//     }),
// });

// const CamerasListLayer = ({ camerasData, visibility }) => {
//   const { map } = useContext(MapContext);

//   useEffect(() => {
//     if (!map || !camerasData || camerasData.length === 0) return;

//     const cameraSource = new VectorSource();

//     const cameraLayer = new VectorLayer({
//       source: cameraSource,
//       style: new Style({
//         image: new CircleStyle({
//           radius: 25,
//           fill: new Fill({ color: '#034694' }),
//           stroke: new Stroke({
//             color: 'white',
//             width: 1
//           })
//         })
//       }),
//       zIndex: 30,
//       visible: visibility,
//     });

//     camerasData.forEach(camera => {
//       if (camera.geolocation && camera.geolocation.coordinates) {
//         const [lon, lat] = camera.geolocation.coordinates;
//         const coords = fromLonLat([lon, lat]);
//         const feature = new Feature({
//           geometry: new Point(coords)
//         });
//         feature.setStyle(createNumberIconStyle());
//         cameraSource.addFeature(feature);
//       } else {
//         console.log('Invalid geolocation data:', camera.geolocation);
//       }
//     });

//     map.addLayer(cameraLayer);

//     return () => {
//       if (map) {
//         map.removeLayer(cameraLayer);
//       }
//     };
//   }, [map, camerasData, visibility]);

//   return null;
// };

// export default CamerasListLayer;
