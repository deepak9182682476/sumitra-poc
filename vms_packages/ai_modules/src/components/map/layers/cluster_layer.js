import React, { useContext, useEffect, useState } from 'react';
import MapContext from '../mapcontext';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Circle as CircleStyle, Fill, Stroke, Icon, Text } from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Cluster } from 'ol/source';
import moment from "moment";

const createEventStyle = (zoomLevel, status) => {
    const eventColor = { 'New': 'New', 'In Progress': 'InProgress', 'Resolved': 'Resolved' }
    const size = zoomLevel < 4 ? '20' : zoomLevel < 8 ? '24' : zoomLevel < 12 ? '28' : zoomLevel < 16 ? '32' : zoomLevel < 20 ? '32' : '40';

    return new Style({
        image: new Icon({
            opacity: 1,
            src: `/assets/images/AlertIcons/${eventColor[status]}-${size}px.svg`,
            scale: 1
        }),
    });
};

const createClusterStyle = (clusterSize) => {
    // Customize this function to create a style for clusters based on the number of features in the cluster
    // const clusterRadius = clusterSize * 0.5; // Example: Cluster size multiplied by 10 for radius
    // const clusterRadius = clusterSize > 100 ? 25 : clusterSize > 75 ? 22 : clusterSize > 50 ? 19 : clusterSize > 25 ? 17 : 15;
    const clusterText = clusterSize > 50 ? "50+" : clusterSize.toString()

    return new Style({
        image: new Icon({
            opacity: 1,
            src: `/assets/images/ClusterIcon.svg`,
            scale: 1,
        }),
        text: new Text({
            text: clusterText,
            fill: new Fill({ color: 'white' }),
            font: 'bold 14px montserrat',
            offsetY: -4
        })
    });
};

const createCameraStyle = (zoomLevel) => {
    const size = zoomLevel < 4 ? '20' : zoomLevel < 8 ? '24' : zoomLevel < 12 ? '28' : zoomLevel < 16 ? '32' : zoomLevel < 20 ? '32' : '40';
    const isSelected = true;
    return new Style({
        image: new Icon({
            opacity: 1,
            src: `/assets/images/CameraIcons/CameraLive-${size}px.svg`,
            scale: 1,
            stroke: isSelected ? 'black' : 'none',
            strokeWidth: isSelected ? 2 : 0,
        }),
    });
};

const ClusterLayer = ({ camerasData, alertsData, cameraVisibility, alertVisibility }) => {
    const { map } = useContext(MapContext);
    const [cameraFeatures, setCameraFeatures] = useState([]);
    const [alertFeatures, setAlertFeatures] = useState([]);

    const hoverInformation = (type, data) => {
        if (type === 'cluster') {
            return `<div class="info-container">
                        <div class="info-row">
                            <div class="field-name">${cameraVisibility ? "Cameras" : ""}</div>
                            <div class="field-value">${cameraVisibility ? ': ' + data.numCameras : ""}</div>
                        </div>
                        <div class="info-row">
                            <div class="field-name">${alertVisibility ? "Alerts" : ""}</div>
                            <div class="field-value">${alertVisibility ? ': ' + data.numAlerts : ""}</div>
                        </div>
                    </div>`
        }
        else if (type === 'camera') {
            return `<div class="info-container">
                        <div class="info-row">
                            <div class="field-name">Camera Name</div>
                            <div class="field-value">: ${data.camera_name}</div>
                        </div>
                        <div class="info-row">
                            <div class="field-name">Police Station</div>
                            <div class="field-value">: ${data.police_station}</div>
                        </div>
                    </div>`
        }
        else if (type === 'alert') {
            return `<div class="info-container">
                        <div class="info-row">
                            <div class="field-name">Date & Time</div>
                            <div class="field-value">: ${moment(data.date_time).format('YYYY/MM/DD HH:mm')}</div>
                        </div>
                        <div class="info-row">
                            <div class="field-name">Alert Type</div>
                            <div class="field-value">:  ${data.model_name}</div>
                        </div>
                        <div class="info-row">
                            <div class="field-name">Camera Name</div>
                            <div class="field-value">: ${data.camera_name}</div>
                        </div>
                        <div class="info-row">
                            <div class="field-name">Status</div>
                            <div class="field-value">: ${data.status}</div>
                        </div>
                    </div>`
        }
    }

    useEffect(() => {
        if (!map) return;

        const combinedSource = new VectorSource();

        if (camerasData && cameraVisibility) {
            const newFeatures = camerasData.reduce((acc, camera) => {
                if (camera.geolocation && camera.geolocation.coordinates) {
                  const [lon, lat] = camera.geolocation.coordinates;
                  const coords = fromLonLat([lon, lat]);
                  const feature = new Feature({
                    geometry: new Point(coords),
                    cameraData: camera
                  });
                  feature.set('layerId', 'clusterLayer');
                  acc.push(feature);
                } else {
                  console.log('Invalid geolocation data:', camera.geolocation);
                }
                return acc;
              }, []);
              setCameraFeatures(newFeatures);
              combinedSource.addFeatures(newFeatures);
        }

        if (alertsData && alertVisibility) {
            const newFeatures = alertsData.reduce((acc, alert) => {
                const [lon, lat] = [alert.lon, alert.lat];
                const feature = new Feature({
                    geometry: new Point(fromLonLat([lon, lat])),
                    alertData: alert
                });
                feature.set('layerId', 'clusterLayer');
                acc.push(feature);
                return acc;
            }, []);
    
            setAlertFeatures(newFeatures);
            combinedSource.addFeatures(newFeatures);
        }

        const clusterSource = new Cluster({
            distance: 25,
            source: combinedSource,
        });
        const clusterLayer = new VectorLayer({
            source: clusterSource,
            style: function (feature) {
                const features = feature.get('features') || [feature];
                if (features.length > 1) {
                    return createClusterStyle(features.length);
                } else {
                    return features[0].get('alertData')
                            ? createEventStyle(map.getView().getZoom(), features[0].get('alertData').status, 1)
                            : createCameraStyle(map.getView().getZoom());
                }
            },
            zIndex: 50,
            name: 'clustersLayer'
        });
        map.addLayer(clusterLayer);

        console.log("cameraa", cameraFeatures);
        console.log("alert", alertFeatures);

        const info = document.getElementById('info2');

        let currentFeature;
        const displayFeatureInfo = function (pixel, target) {
            const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
                return feature;
            });
            if (feature) {
                const features = feature.get('features') || [feature];

                let numCameras = 0;
                let numAlerts = 0;
                let numExpandedFeatures = 0;
                features.forEach(f => {
                    if (f.get('cameraData')) numCameras++;
                    if (f.get('alertData')) numAlerts++;
                    if (f.get('expanded')) numExpandedFeatures++;
                });
                if (numAlerts + numCameras === 0) return;
                info.style.left = (pixel[0] - info.offsetWidth / 2) + 'px';
                info.style.top = (pixel[1] - info.offsetHeight - 10) + 'px';
                if (feature !== currentFeature) {
                    if (numAlerts === 1 && numCameras === 0) {
                        info.style.visibility = 'visible';
                        const alertData = features[0].get('alertData');
                        info.innerHTML = hoverInformation('alert', alertData);
                    }
                    else if ((numAlerts === 0 && numCameras === 1) || (numAlerts + numCameras - numExpandedFeatures < 1)) {
                        info.style.visibility = 'visible';
                        const cameraData = features[0].get('cameraData');
                        info.innerHTML = hoverInformation('camera', cameraData);
                    }
                    else if ((numAlerts + numCameras > 1) || (numAlerts + numCameras - numExpandedFeatures >= 1)) {
                        info.style.visibility = 'visible';
                        info.innerHTML = hoverInformation('cluster', { 'numAlerts': numAlerts, 'numCameras': numCameras });
                    }
                    else {
                        info.style.visibility = 'hidden'
                    }
                }
            } else {
                info.style.visibility = 'hidden';
            }
            currentFeature = feature;
        };

        map.on('pointermove', function (evt) {
            if (evt.dragging) {
                info.style.visibility = 'hidden';
                currentFeature = undefined;
                return;
            }
            const pixel = map.getEventPixel(evt.originalEvent);
            displayFeatureInfo(pixel, evt.originalEvent.target);
        });


        return () => {
            if (map) {
                map.removeLayer(clusterLayer);
            }
        };
    }, [map, camerasData, alertsData, cameraVisibility, alertVisibility]);

    return null;
};

export default ClusterLayer;
