import React, { useState, useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Circle as CircleStyle,Icon, Style, Text, Stroke, Fill } from 'ol/style';
import FullScreen from 'ol/control/FullScreen';
import { defaults as defaultControls } from 'ol/control';
import {click} from 'ol/events/condition';
import {pointerMove} from 'ol/events/condition';
import GeoJSON from 'ol/format/GeoJSON';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LayersIcon from '@mui/icons-material/Layers';
import IconButton from '@mui/material/IconButton';
import { Checkbox, FormControlLabel } from '@mui/material';
import AlertsService from '../../services/alerts';
import moment from "moment";
import { Cluster } from 'ol/source';

var polyLineDecode = function(str, precision) {    
    var index = 0, lat = 0, lng = 0, coordinates = [], shift = 0, result = 0, byte = null, latitude_change, longitude_change, factor = Math.pow(10, precision || 6);   
    while (index < str.length) {      
    byte = null;        
    shift = 0;        
    result = 0;        
    do {            
        byte = str.charCodeAt(index++) - 63;            
        result |= (byte & 0x1f) << shift;            
        shift += 5;        } while (byte >= 0x20);        
        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));        
        shift = result = 0;        
        do {            
            byte = str.charCodeAt(index++) - 63;            
            result |= (byte & 0x1f) << shift;            
            shift += 5;        
        } while (byte >= 0x20);        
        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));        
        lat += latitude_change;        
        lng += longitude_change;        
        coordinates.push([lng / factor, lat / factor]);    
    }    
    return coordinates;
};

const splitIntoSegments = (points, segmentLength) => {
    const segments = [];
    for (let i = 0; i < points.length; i += segmentLength-1) {
        if (i === points.length-1) continue;
        segments.push(points.slice(i, i + segmentLength));
    }
    return segments;
};

const createTextStyle = function (feature, zoomLevel, isPSLayer) {
    const align = "center";
    const baseline = "middle";
    const size = isPSLayer ? zoomLevel > 16 ? "20px" : "14px" : "15px";
    const overflow = isPSLayer ? true : false;
    const fillColor = "white";
    const font = `bold ${size} Montserrat`;

    return new Text({
        textAlign: align,
        textBaseline: baseline,
        text: isPSLayer ? feature.get('Name') : feature.get('Commissionerate'),
        fill: new Fill({ color: fillColor }),
        overflow: overflow,
        font: font
    });
};

const createCameraIconStyle = (zoomLevel) => {
    const size = zoomLevel < 4 ? '20' : zoomLevel < 8 ? '24' : zoomLevel < 12 ? '28' : zoomLevel < 16 ? '32' : zoomLevel < 20 ? '32' : '40';
    return new Style({
        image: new Icon({
        opacity: 1,
        src: `/assets/images/CameraIcons/CameraLive-${size}px.svg`,
        scale: 1,
        }),
    });
  };


  const createEventStyle = (index, isSelected, zoomLevel) => {
    const size = zoomLevel < 4 ? '24' : zoomLevel < 8 ? '28' : zoomLevel < 12 ? '32' : zoomLevel < 16 ? '36' : zoomLevel < 20 ? '40' : '44';
    const highlightColor = isSelected ? '#ffffff' : '#ff0000';
    const highlightedWidth = isSelected ? 2 : 0;
    const highlightedSize = isSelected ? (parseInt(size)) / 2 + 5 : parseInt(size) / 2

    return new Style({
        image: new CircleStyle({
          radius: highlightedSize,
          fill: new Fill({
            color: '#ff0000'
          }),
          stroke: new Stroke({color: highlightColor, width: highlightedWidth})
        }),
        text: new Text({
          text: index.toString(),
          font: `10px Arial`,
          fill: new Fill({
            color: 'white'
          }),
          offsetX: 0,
          offsetY: 0,
          backgroundFill: new Fill({color: '#ff0000'})
        })
      });
}; 

const createClusterStyle = (clusterSize) => {
    const clusterRadius = clusterSize > 100 ? 25 : clusterSize > 75 ? 22 : clusterSize > 50 ? 19 : clusterSize > 25 ? 17 : 15;

    return new Style({
        image: new CircleStyle({
            radius: clusterRadius,
            fill: new Fill({ color: '#D0B90F' }),
            stroke: new Stroke({
                color: '#D0B90F',
                width: 2
            })
        }),
        text: new Text({
            text: clusterSize.toString(),
            fill: new Fill({ color: 'white' }),
            font: 'bold 14px montserrat'
        })
    });
};

const MapTracking = ({ data, checked, camerasData, event_id }) => {
    const mapRef = useRef(null);
    const vectorSourceRef = useRef(new VectorSource());
    const trackingSourceRef = useRef(new VectorSource());
    const [trackEnabled, setTrackEnabled] = useState(checked);
    const previousSelectedPoint = useRef(null);
    const [commisionerateGeojsonObject, setCommisionerateGeojsonObject] = useState(null);
    const [policeGeojsonObject, setPoliceGeojsonObject] = useState(null);
    const [selectedLayers, setSelectedLayers] = useState({
        commissionerateLayer: true,
        psLayer: true,
        camerasLayer: true,
        eventsLayer: true,
        clustersLayer: true
    });
    const [showLayerControls, setShowLayerControls] = useState(false);
    const [dataPoints, setDataPoints] = useState([]);
    const [trackData, setTrackData] = useState([]);
    const [features, setFeatures] = useState([]);

    const updateClusterSource = (layers) => {
        const clusterLayer = mapRef.current.getLayers().getArray().find(layer => layer.get('name') === 'clustersLayer');
        if (!clusterLayer) return;
    
        const clusterSource = clusterLayer.getSource();
        const combinedSource = clusterSource.getSource();
    
        combinedSource.clear();
    
        if (layers.eventsLayer && data) {
            data.forEach((alert) => {
                const [lon, lat] = [alert.lon, alert.lat];
                const feature = new Feature({
                    geometry: new Point(fromLonLat([lon, lat])),
                    alertData: alert,
                    type: 'event'
                });
                combinedSource.addFeature(feature);
            });
        }
    
        if (layers.camerasLayer && camerasData) {
            camerasData.forEach((camera) => {
                if (camera.geolocation && camera.geolocation.coordinates) {
                    const [lon, lat] = camera.geolocation.coordinates;
                    const coords = fromLonLat([lon, lat]);
                    const feature = new Feature({
                        geometry: new Point(coords),
                        cameraData: camera,
                        type: 'camera'
                    });
                    combinedSource.addFeature(feature);
                }
            });
        }
    
        clusterSource.refresh();
    };

    useEffect(() => {
        // Fetch the Commisionerate GeoJSON file
        fetch('Commisionerate_Boundary.geojson')
            .then(response => response.json())
            .then(data => setCommisionerateGeojsonObject(data))
            .catch(error => console.error('Error fetching Commisionerate GeoJSON:', error));
    }, []);

    useEffect(() => {
        // Fetch the PS GeoJSON file
        fetch('PS_Boundary.geojson')
            .then(response => response.json())
            .then(data => setPoliceGeojsonObject(data))
            .catch(error => console.error('Error fetching PS GeoJSON:', error));
    }, []);

    useEffect(() => {
        if(!dataPoints || !dataPoints.length) return;
        var obj = { "locations" : [] };
        // obj = {
        //     "locations": [
        //         { "lat": 17.390083, "lon": 78.4699722, "type": "through" },
        //         { "lat": 17.390083, "lon": 78.4699722, "type": "through" },
        //         { "lat": 17.390111, "lon": 78.47, "type": "through" },
        //         { "lat": 17.33714, "lon": 78.550167, "type": "through" },
        //         { "lat": 17.390028, "lon": 78.4702222, "type": "through" },
        //         { "lat": 17.45886, "lon": 78.43279, "type": "through" },
        //         { "lat": 17.45886, "lon": 78.43279, "type": "through" },
        //         { "lat": 17.390083, "lon": 78.4699722, "type": "through" },
        //         { "lat": 17.33733, "lon": 78.55, "type": "through" },
        //         { "lat": 17.390083, "lon": 78.4699722, "type": "through" },
        //         { "lat": 17.390028, "lon": 78.47025, "type": "through" },
        //         { "lat": 17.390028, "lon": 78.4702222, "type": "through" },
        //         { "lat": 17.45886, "lon": 78.43279, "type": "through" }
        //     ]
        // };
        dataPoints.map(val => {
            obj.locations.push({
                lat: val.lat,
                lon: val.lon,
                type: 'through'
              })
        })
    
        const segmentLength = 50;
        const points = obj.locations.map(loc => [loc.lon, loc.lat]);
    
        const segments = splitIntoSegments(points, segmentLength);
        const fetchSegmentData = async (segment) => {
            try {
                const response = await AlertsService.getTrackingRoute({ locations: segment.map(([lon, lat]) => ({ lon, lat, type: 'through' })) });
                if (response && response.data) {
                    console.log('Segment data:', response.data);
                    return response.data;
                }
            } catch (error) {
                console.error('Fetching segment error:', error);
            }
        };
    
        const fetchAllSegments = async () => {
            const results = await Promise.all(segments.map(fetchSegmentData));
            setTrackData(results.flat());
        };
    
        fetchAllSegments();
    }, [dataPoints]);
    

    useEffect(() => {

        if (!commisionerateGeojsonObject || !policeGeojsonObject) return;

        if (!mapRef.current) {
            mapRef.current = new Map({
                target: 'map',
                layers: [
                    new TileLayer({
                        source: new XYZ({
                            url: 'http://10.66.40.60:6090/tile/{z}/{x}/{y}.png'
                        }),
                        zIndex: 0
                    }),
                ],
                controls: [],
                view: new View({
                    center: fromLonLat([78.46, 17.44]),
                    zoom: 10
                }),
            });
        }

        const commisionerateVectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(commisionerateGeojsonObject, {
                featureProjection: 'EPSG:3857'
            })
        });

        const commisionerateVectorLayer = new VectorLayer({
            source: commisionerateVectorSource,
            style: feature => {
                const zoomLevel = mapRef.current.getView().getZoom();
                return new Style({
                  stroke: new Stroke({
                    color: '#FFA836',
                    width: 1
                  }),
                  text: createTextStyle(feature, zoomLevel, false)
                });
            },
            maxZoom: 14,
            visible: selectedLayers.commissionerateLayer,
            name: 'commissionerateLayer'
        });

        const policeVectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(policeGeojsonObject, {
                featureProjection: 'EPSG:3857'
            })
        });

        const policeVectorLayer = new VectorLayer({
            source: policeVectorSource,
            style: feature => {
                const zoomLevel = mapRef.current.getView().getZoom();
                return new Style({
                  stroke: new Stroke({
                    color: '#FFA836',
                    width: 1
                  }),
                  text: zoomLevel > 14.8 ? createTextStyle(feature, zoomLevel, true) : undefined
                });
              },
            minZoom: 14,
            visible: selectedLayers.psLayer,
            name: 'psLayer'
        });

        mapRef.current.addLayer(commisionerateVectorLayer);
        mapRef.current.addLayer(policeVectorLayer);

        const combinedSource = new VectorSource();
        combinedSource.clear();

        const clusterSource = new Cluster({
            distance: 40,
            source: combinedSource,
        });
        const clusterLayer = new VectorLayer({
            source: clusterSource,
            style: function (feature) {
                const features = feature.get('features');
                if (features.length > 1) {
                    return createClusterStyle(features.length);
                }
            },
            zIndex: 30,
            visible: selectedLayers.clustersLayer && (selectedLayers.camerasLayer || selectedLayers.eventsLayer),
            name: 'clustersLayer'
        });
        mapRef.current.addLayer(clusterLayer);

        updateClusterSource(selectedLayers);

        if (camerasData) {
            const cameraSource = new VectorSource();

            const cameraLayer = new VectorLayer({
                source: cameraSource,
                style: new Style({
                    image: new CircleStyle({
                    radius: 20,
                    fill: new Fill({ color: '#034694' }),
                    stroke: new Stroke({
                        color: 'white',
                        width: 1
                    })
                    })
                }),
                zIndex: 10,
                visible: selectedLayers.camerasLayer,
                name: 'camerasLayer'
            });

            const newFeatures = camerasData.reduce((acc, camera) => {
                if (camera.geolocation && camera.geolocation.coordinates) {
                    const [lon, lat] = camera.geolocation.coordinates;
                    const coords = fromLonLat([lon, lat]);
                    const feature = new Feature({
                        geometry: new Point(coords),
                        cameraData: camera
                    });
                    feature.setStyle(createCameraIconStyle(mapRef.current.getView().getZoom()));
                    feature.set('layerId', 'cameraLayer');
                    acc.push(feature);
                } else {
                    console.log('Invalid geolocation data:', camera.geolocation);
                }
                return acc;
            }, []);

            setFeatures(newFeatures);
            cameraSource.addFeatures(newFeatures);
            mapRef.current.addLayer(cameraLayer);

            const info = document.getElementById('info2');

            let currentFeature;
            const displayFeatureInfo = function (pixel) {
                const feature = mapRef.current.forEachFeatureAtPixel(pixel, function (feature) {
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
                return mapRef.current.forEachFeatureAtPixel(pixel, (feature) => feature.get('layerId') === 'eventLayer');
                // return false
            };

            mapRef.current.on('pointermove', function (evt) {
                if (evt.dragging) {
                    info.style.visibility = 'hidden';
                    currentFeature = undefined;
                    return;
                }
                const pixel = mapRef.current.getEventPixel(evt.originalEvent);
                if (!isAlertFeatureAtPixel(pixel)) {
                    displayFeatureInfo(pixel);
                } else {
                    info.style.visibility = 'hidden';
                    currentFeature = undefined;
                }
            });

            mapRef.current.on('moveend', () => {
                newFeatures.forEach((feature) => {
                    feature.setStyle(createCameraIconStyle(mapRef.current.getView().getZoom()));
                });
                cameraSource.changed();
            });
        }

        const sortedData = data.slice().map((item, index) => {
            return {
                id: index+1,
                ...item,
                lon: item.lon,
                lat: item.lat
            };
        }).sort((a, b) => a.event_id - b.event_id);

        vectorSourceRef.current.clear();

        var dataDetails = []

        const newFeatures = sortedData.reduce((acc, alert, index) => {
            dataDetails.push({ lat: alert.lat, lon: alert.lon })
            const pointFeature = new Feature({
                geometry: new Point(fromLonLat([alert.lon, alert.lat])),
                alertData: alert
            });
            pointFeature.setStyle(createEventStyle(alert.id.toString(), alert.event_id === event_id, mapRef.current.getView().getZoom()));
            if(alert.event_id === event_id) {
                previousSelectedPoint.current = pointFeature;
            }
            pointFeature.set('layerId', 'eventLayer');
            acc.push(pointFeature);
            return acc;
        }, []);
        setFeatures(newFeatures);
        vectorSourceRef.current.addFeatures(newFeatures);

        const eventsLayer = new VectorLayer({
            source: vectorSourceRef.current,
            style: createEventStyle,
            visible: selectedLayers.eventsLayer,
            name: 'eventsLayer',
            zIndex: 20
        });

        mapRef.current.addLayer(eventsLayer);
        setDataPoints(dataDetails);
        if (previousSelectedPoint.current) {
            // Animate the map to the selected point
            const selectedCoord = toLonLat(previousSelectedPoint.current.getGeometry().getCoordinates());
            mapRef.current.getView().animate({
                center: fromLonLat(selectedCoord),
                zoom: 15,
            });
        }

        const info = document.getElementById('info3');

        let currentFeature;
        const displayFeatureInfo = function (pixel, target) {
            const feature = mapRef.current.forEachFeatureAtPixel(pixel, function (feature) {
                if (feature.get('layerId') === 'eventLayer') {
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
                                <div class="field-value">: ${alertData.transaction_type ? alertData.transaction_type : 'Hotlist Alert'}</div>
                            </div>
                            <div class="info-row">
                                <div class="field-name">Category</div>
                                <div class="field-value">: ${alertData.hotlist_category ? alertData.hotlist_category : alertData.category ? alertData.category : 'Not Available'}</div>
                            </div>
                            <div class="info-row">
                                <div class="field-name">Camera Name</div>
                                <div class="field-value">: ${alertData.camera_name}</div>
                            </div>
                            <div class="info-row">
                                <div class="field-name">Status</div>
                                <div class="field-value">: ${alertData.status ? alertData.status : 'New'}</div>
                            </div>
                        </div>
                    `
                }
            } else {
                info.style.visibility = 'hidden';
            }
            currentFeature = feature;
        };

        mapRef.current.on('pointermove', function (evt) {
            if (evt.dragging) {
                info.style.visibility = 'hidden';
                currentFeature = undefined;
                return;
            }
            const pixel = mapRef.current.getEventPixel(evt.originalEvent);
            displayFeatureInfo(pixel, evt.originalEvent.target);
        });

        mapRef.current.on('moveend', () => {
            newFeatures.forEach((feature) => {
                feature.setStyle(createEventStyle(feature.get('alertData').id, feature.get('alertData').event_id === event_id, mapRef.current.getView().getZoom()));
            });
            vectorSourceRef.current.changed();
        });

    }, [commisionerateGeojsonObject, policeGeojsonObject, data, event_id, camerasData, selectedLayers]);

    useEffect(() => {
        
        if(!mapRef || !mapRef.current) return;
        mapRef.current.getLayers().forEach(layer => {
            if (layer.get('name') === 'polylineLayer' && layer.getSource() instanceof VectorSource) {
                layer.getSource().clear();
            }
        });

        if (trackData && trackData.length > 0 && checked) {
    
            trackData.forEach(lineStringData => {
                if(!lineStringData) return;
                const decodedPolyline = polyLineDecode(lineStringData);
                const polylineFeature = new Feature({
                    geometry: new LineString(decodedPolyline.map(coord => fromLonLat(coord)))
                });
    
                const polylineLayer = new VectorLayer({
                    source: new VectorSource({
                        features: [polylineFeature]
                    }),
                    style: new Style({
                        stroke: new Stroke({
                            color: '#0f53ff',
                            width: 4
                        })
                    }),
                    zIndex: 8,
                    name: 'polylineLayer'
                });
    
                mapRef.current.addLayer(polylineLayer);
            });
        }
    }, [trackData, checked]);

    const zoom = (mode) => {
        const view = mapRef.current.getView();
        const currentZoom = view.getZoom();
        view.animate({
          zoom: mode === "in" ? currentZoom + 1 : currentZoom - 1,
          duration: 500
        });
    };

    const handleLayerToggle = (layerName) => {
        setSelectedLayers(prevLayers => {
            const updatedLayers = { ...prevLayers, [layerName]: !prevLayers[layerName] };
            mapRef.current.getLayers().forEach(layer => {
                if (layer.get('name') === layerName) {
                    layer.setVisible(updatedLayers[layerName]);
                }
            });
            updateClusterSource(updatedLayers);
    
            return updatedLayers;
        });
    };

    const handleButton4Click = () => {
        setShowLayerControls(!showLayerControls);
    };

    const buttonStyle = {
        width: '20px',
        height: '20px',
        backgroundColor: '#08264c',
        color: 'white',
        marginBottom: '7px',
        padding: '5px',
        borderRadius: '2px',
        boxShadow: 'none'
    };


    const buttons = [
        { icon: <AddIcon />, onClick: () => zoom("in") },
        { icon: <RemoveIcon />, onClick: () => zoom("out") },
        { icon: <LayersIcon />, onClick: handleButton4Click }
    ];

    const layers = [
        { id: 'commissionerateLayer', label: 'Commissionerate Layer' },
        { id: 'psLayer', label: 'PS Layer' },
        { id: 'camerasLayer', label: 'Camera Layer' },
        { id: 'eventsLayer', label: 'Hotlist Records Layer' },
        { id: 'clustersLayer', label: 'Cluster Layer' }
    ];

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <div id="map" style={{ width: '100%', height: '800px' }}></div>
            <div id="info2"></div><div id="info3"></div>
            <div style={{ position: 'absolute', top: '10px', right: '8px', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
                {buttons.map((btn, index) => (
                    <IconButton key={index} style={buttonStyle} onClick={btn.onClick}>
                        {btn.icon}
                    </IconButton>
                ))}
                {showLayerControls && (
                    <div style={{
                        position: 'absolute',
                        top: '65px',
                        right: '25px',
                        backgroundColor: '#08264c',
                        paddingLeft: '10px',
                        borderRadius: '5px',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                        width: '240px'
                    }}>
                        {layers.map(({ id, label }) => (
                            <FormControlLabel
                                key={id}
                                control={
                                    <Checkbox
                                        id={id}
                                        checked={selectedLayers[id]}
                                        onChange={() => handleLayerToggle(id)}
                                        sx={{ 
                                            color: 'white',
                                            '&.Mui-checked': {
                                                color: 'white', 
                                            },
                                            '& .MuiSvgIcon-root': {
                                                fontSize: 15,
                                            },
                                        }}
                                    />
                                }
                                label={label}
                                sx={{ color: 'white' }} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapTracking;