import React, { useContext, useEffect, useState } from 'react';
import MapContext from '../mapcontext';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Circle as CircleStyle, Fill, Stroke, Icon } from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import moment from "moment";

const createNumberIconStyle = (zoomLevel, status) => {
    const eventColor = { 'New': 'New', 'In Progress': 'InProgress', 'Resolved': 'Resolved' }
    const size = zoomLevel < 4 ? '24' : zoomLevel < 8 ? '28' : zoomLevel < 12 ? '32' : zoomLevel < 16 ? '36' : zoomLevel < 20 ? '40' : '44';
    return new Style({
        image: new Icon({
            opacity: 1,
            src: `/assets/images/AlertIcons/${eventColor[status]}-${size}px.svg`,
            scale: 1,
        }),
    });
};

const AlertsLayer = ({ alertsData, visibility }) => {
    const { map } = useContext(MapContext);
    const [features, setFeatures] = useState([]);

    useEffect(() => {
        if (!map || !alertsData || alertsData.length === 0) return;

        const alertSource = new VectorSource();
        const alertLayer = new VectorLayer({
            source: alertSource,
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
            zIndex: 40,
            visible: visibility,
        });

        const newFeatures = alertsData.reduce((acc, alert) => {
            const [lon, lat] = [alert.lon, alert.lat];
            const feature = new Feature({
                geometry: new Point(fromLonLat([lon, lat])),
                alertData: alert
            });
            feature.setStyle(createNumberIconStyle(map.getView().getZoom(), alert.status));
            feature.set('layerId', 'alertLayer');
            acc.push(feature);
            return acc;
        }, []);

        setFeatures(newFeatures);
        alertSource.addFeatures(newFeatures);
        map.addLayer(alertLayer);

        const info = document.getElementById('info1');

        let currentFeature;
        const displayFeatureInfo = function (pixel, target) {
            const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
                if (feature.get('layerId') === 'alertLayer') {
                  return feature;
                }
            });
            if (feature) {
                info.style.left = (pixel[0] - info.offsetWidth / 2) + 'px';
                info.style.top = (pixel[1] - info.offsetHeight - 10) + 'px';
                if (feature !== currentFeature) {
                    const alertData = feature.get('alertData');
                    info.style.visibility = 'visible';
                    info.innerHTML = `
                        <div class="info-container">
                            <div class="info-row">
                                <div class="field-name">License Number</div>
                                <div class="field-value">: ${alertData.license_number}</div>
                            </div>
                            <div class="info-row">
                                <div class="field-name">Date & Time</div>
                                <div class="field-value">: ${moment(alertData.date_time).format('YYYY/MM/DD HH:mm')}</div>
                            </div>
                            <div class="info-row">
                                <div class="field-name">Alert Type</div>
                                <div class="field-value">: Hotlist Alert</div>
                            </div>
                            <div class="info-row">
                                <div class="field-name">Category</div>
                                <div class="field-value">: ${alertData.hotlist_category}</div>
                            </div>
                            <div class="info-row">
                                <div class="field-name">Camera Name</div>
                                <div class="field-value">: ${alertData.camera_name}</div>
                            </div>
                            <div class="info-row">
                                <div class="field-name">Status</div>
                                <div class="field-value">: ${alertData.status}</div>
                            </div>
                        </div>
                    `
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

        map.on('moveend', () => {
            newFeatures.forEach((feature) => {
                feature.setStyle(createNumberIconStyle(map.getView().getZoom(), feature.get('alertData').status));
            });
            alertSource.changed();
        });

        return () => {
            if (map) {
                map.removeLayer(alertLayer);
            }
        };
    }, [map, alertsData, visibility]);

    return null;
};

export default AlertsLayer;
