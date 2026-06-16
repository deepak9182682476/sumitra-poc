import React, { useState, useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import * as olExtent from 'ol/extent';
import Select from 'ol/interaction/Select.js';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Circle as CircleStyle, Icon, Style, Text, Stroke, Fill } from 'ol/style';
import FullScreen from 'ol/control/FullScreen';
import { defaults as defaultControls } from 'ol/control';
import { click } from 'ol/events/condition';
import { pointerMove } from 'ol/events/condition';
import { Cluster } from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LayersIcon from '@mui/icons-material/Layers';
import IconButton from '@mui/material/IconButton';
import { Checkbox, FormControlLabel } from '@mui/material';
import moment from "moment";

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

const createEventStyle = (zoomLevel, isSelected, status) => {
    const eventColor = { 'New': 'New', 'In Progress': 'InProgress', 'Resolved': 'Resolved' }
    const size = zoomLevel < 4 ? '20' : zoomLevel < 8 ? '24' : zoomLevel < 12 ? '28' : zoomLevel < 16 ? '32' : zoomLevel < 20 ? '32' : '40';
    const highlightColor = isSelected ? '#0000FF' : '#000000';

    return new Style({
        image: new Icon({
            opacity: 1,
            src: `/assets/images/AlertIcons/${eventColor[status]}-${size}px.svg`,
            scale: 1,
            stroke: new Stroke({
                color: highlightColor,
                width: isSelected ? 2 : 0
            })
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

const createCameraStyle = (zoomLevel, isSelected = false) => {
    const size = zoomLevel < 4 ? '20' : zoomLevel < 8 ? '24' : zoomLevel < 12 ? '28' : zoomLevel < 16 ? '32' : zoomLevel < 20 ? '32' : '40';
    const selection = isSelected ? '-Selected' : ""
    return new Style({
        image: new Icon({
            opacity: 1,
            src: `/assets/images/CameraIcons/CameraLive-${size}px${selection}.svg`,
            scale: 1,
        }),
    });
};

const createAlertStyle = (eventCount, zoomLevel) => {
    const size = zoomLevel < 4 ? 10 : zoomLevel < 8 ? 12 : zoomLevel < 12 ? 14 : zoomLevel < 16 ? 16 : zoomLevel < 20 ? 18 : 20;
        const offset = size*2; 
        return new Style({
            image: new Icon({
                opacity: 1,
                src: `/assets/images/AlertCluster.svg`,
                displacement: [offset, 0],
            }),
            text: new Text({
                text: eventCount.toString(),
                fill: new Fill({ color: 'black' }),
                font: 'bold 14px sans-serif',
                offsetX: offset,
                offsetY: -4
            })
        });
};

const MapAlert = ({ data, event_id, camerasData, setFilteredDataRows }) => {
    const mapRef = useRef(null);
    const [isMapBase, setMapBase] = useState(false);
    const vectorSourceRef = useRef(new VectorSource());
    const [commisionerateGeojsonObject, setCommisionerateGeojsonObject] = useState(null);
    const [policeGeojsonObject, setPoliceGeojsonObject] = useState(null);
    const previousSelectedPoint = useRef(null);
    const [selectedLayers, setSelectedLayers] = useState({
        commissionerateLayer: true,
        psLayer: true,
        camerasLayer: true,
        eventsLayer: true,
    });
    const [showLayerControls, setShowLayerControls] = useState(false);
    const [features, setFeatures] = useState([]);

    const hoverInformation = (type, data) => {
        if (type === 'cluster') {
            return `<div class="info-container">
                        <div class="info-row">
                            <div class="field-name">${selectedLayers.camerasLayer ? "Cameras" : ""}</div>
                            <div class="field-value">${selectedLayers.camerasLayer ? ': ' + data.numCameras : ""}</div>
                        </div>
                        <div class="info-row">
                            <div class="field-name">${selectedLayers.eventsLayer ? "Alerts" : ""}</div>
                            <div class="field-value">${selectedLayers.eventsLayer ? ': ' + data.numAlerts : ""}</div>
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
            return ` <div class="info-container">
                        <div class="info-row">
                            <div class="field-name">License Number</div>
                            <div class="field-value">: ${data.license_number}</div>
                        </div>
                        <div class="info-row">
                            <div class="field-name">Date & Time</div>
                            <div class="field-value">: ${moment(data.date_time).format('YYYY/MM/DD HH:mm')}</div>
                        </div>
                        <div class="info-row">
                            <div class="field-name">Alert Type</div>
                            <div class="field-value">: Hotlist Alert</div>
                        </div>
                        <div class="info-row">
                            <div class="field-name">Category</div>
                            <div class="field-value">: ${data.hotlist_category}</div>
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
        if (!mapRef.current) {
            mapRef.current = new Map({
                target: 'map1',
                layers: [
                    new TileLayer({
                        source: new XYZ({
                            url: 'http://10.66.40.60:6090/tile/{z}/{x}/{y}.png'
                        }),
                        zIndex: 0
                    })
                ],
                controls: [new FullScreen()],
                view: new View({
                    center: fromLonLat([78.46, 17.44]),
                    zoom: 10
                }),
            });
            setMapBase(true);
        }
    }, [])

    useEffect(() => {
        if (!mapRef.current) return;
        if (!commisionerateGeojsonObject) {
            // Fetch the Commisionerate GeoJSON file
            fetch('Commisionerate_Boundary.geojson')
                .then(response => response.json())
                .then(data => {
                    setCommisionerateGeojsonObject(data);
                    const commisionerateVectorSource = new VectorSource({
                        features: new GeoJSON().readFeatures(data, {
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
                    mapRef.current.addLayer(commisionerateVectorLayer);
                })
                .catch(error => console.error('Error fetching Commisionerate GeoJSON:', error));
        }
    }, [isMapBase, selectedLayers]);

    useEffect(() => {
        if (!mapRef.current) return;
        if (!policeGeojsonObject) {
            // Fetch the PS GeoJSON file
            fetch('PS_Boundary.geojson')
                .then(response => response.json())
                .then(data => {
                    setPoliceGeojsonObject(data);
                    const policeVectorSource = new VectorSource({
                        features: new GeoJSON().readFeatures(data, {
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
                    mapRef.current.addLayer(policeVectorLayer);
                })
                .catch(error => console.error('Error fetching Commisionerate GeoJSON:', error));
        }
    }, [isMapBase, selectedLayers]);

    useEffect(() => {
        if(!data || !event_id || !mapRef || !mapRef.current) return;
        data.map(alert => {
            if(alert.event_id === event_id) {
                const [lon, lat] = [alert.lon, alert.lat];
                mapRef.current.getView().animate({
                    center: fromLonLat([lon, lat]),
                    duration: 1000,
                    zoom: 18,
                });
            }
        })
    }, [event_id, data])

    useEffect(() => {
        if (!mapRef.current) return;

        const combinedSource = new VectorSource();
        combinedSource.clear();

        const clusterSource = new Cluster({
            distance: 25,
            source: combinedSource,
        });

        const clusterLayer = new VectorLayer({
            source: clusterSource,
            style: function (feature) {
                const features = feature.get('features');
                if (features.length > 1 && !features[0].get('expanded')) {
                    return createClusterStyle(features.length);
                } else if(features.length > 1 && features[0].get('expanded')) {
                    const cameraFeatures = features.filter(f => f.get('cameraData'));
                    const alertFeatures = features.filter(f => f.get('alertData'));
                    
                    return [
                        ...cameraFeatures.map(f => createCameraStyle(mapRef.current.getView().getZoom(), true)),
                        ...alertFeatures.map(f => {
                            const eventCount = alertFeatures.filter(af => 
                                af.get('alertData').camera_id === f.get('alertData').camera_id
                            ).length;
                            return createAlertStyle(eventCount, mapRef.current.getView().getZoom());
                        })
                    ];
                } else {
                    return features.map(f => {
                        return f.get('alertData')
                            ? createEventStyle(mapRef.current.getView().getZoom(), f.get('alertData').event_id === event_id, f.get('alertData').status, 0.6)
                            : createCameraStyle(mapRef.current.getView().getZoom());
                    });
                }
            },
            zIndex: 30,
            name: 'clustersLayer'
        });

        const handleClusterClick = (feature) => {
            const geometry = feature.getGeometry();
            const extent = geometry.getExtent();
            const center = olExtent.getCenter(extent);

            const features = feature.get('features');
            features.forEach(f => f.set('expanded', true));

            mapRef.current.getView().animate({
                center: center,
                zoom: Math.min(mapRef.current.getView().getZoom() + 4, 22),
                duration: 1000
            });
        };

        mapRef.current.addLayer(clusterLayer);
        updateClusterSource(selectedLayers);

        const info = document.getElementById('info');

        let currentFeature;
        const displayFeatureInfo = function (pixel) {
            const feature = mapRef.current.forEachFeatureAtPixel(pixel, function (feature) {
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
                    if (numAlerts === 1 && numCameras === 0 && numExpandedFeatures <= 1) {
                        info.style.visibility = 'visible';
                        const alertData = features[0].get('alertData');
                        info.innerHTML = hoverInformation('alert', alertData);
                    }
                    else if ((numAlerts === 0 && numCameras === 1 && numExpandedFeatures <= 1)) {
                        info.style.visibility = 'visible';
                        const cameraData = features[0].get('cameraData');
                        info.innerHTML = hoverInformation('camera', cameraData);
                    }
                    else if (numAlerts + numCameras > 1) {
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

        mapRef.current.on('pointermove', function (evt) {
            if (evt.dragging) {
                info.style.visibility = 'hidden';
                currentFeature = undefined;
                return;
            }
            const pixel = mapRef.current.getEventPixel(evt.originalEvent);
            displayFeatureInfo(pixel, evt.originalEvent.target);
        });

        let expandedCluster = null;

        mapRef.current.on('click', function (evt) {
            if (evt.dragging) {
              info.style.visibility = 'hidden';
              return;
            }
          
            const pixel = mapRef.current.getEventPixel(evt.originalEvent);
            const feature = mapRef.current.forEachFeatureAtPixel(pixel, function (feature) {
              return feature;
            });

            if (!feature) {
                if (expandedCluster) {
                    expandedCluster.get('features').forEach(f => {
                      f.set('expanded', false);
                      // Reset the geometry to its original position
                      if (f.get('alertData')) {
                        f.setGeometry(new Point(f.get('originalCoordinates')));
                      }
                    });
                    expandedCluster = null;
                }
                setFilteredDataRows([]);
                return;
            }

            const features = feature.get('features') || [feature];
            if (expandedCluster && features[0].get('expanded')) {
              expandedCluster.get('features').forEach(f => {
                f.set('expanded', false);
                // Reset the geometry to its original position
                if (f.get('alertData')) {
                  f.setGeometry(new Point(f.get('originalCoordinates')));
                }
              });
              expandedCluster = null;
              setFilteredDataRows([]);
            }

            let numAlerts = 0;
            let numExpandedAlerts = 0;
            features.forEach(f => {
                if (f.get('alertData')) {
                    numAlerts += 1;
                    if (f.get('expanded')) numExpandedAlerts += 1;
                }
            })
          
            if (features.length > 1 && numExpandedAlerts === 0) {
              handleClusterClick(feature);
              expandedCluster = feature;
              // Store original coordinates and expand
              features.forEach(f => {
                if (f.get('alertData')) {
                  f.set('originalCoordinates', f.getGeometry().getCoordinates());
                }
                f.set('expanded', true);
              });
            } else if (numAlerts > 0) {
                const list = [];
                features.forEach(f => {
                    if (f.get('alertData')) {
                        list.push(f.get('alertData'))
                    }
                });
                list.sort((a, b) => a.id - b.id);
                setFilteredDataRows(list);
                // setLocationDataMap(features[0].get('alertData').event_id);
                // setSelectedRowId(features[0].get('alertData').id);
            }
          
            // Trigger a redraw of the layer
            clusterLayer.changed();
          });

    }, [data, camerasData, selectedLayers]);

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
        { id: 'commissionerateLayer', label: 'Commissionerates' },
        { id: 'psLayer', label: 'Police Stations' },
        { id: 'camerasLayer', label: 'Cameras' },
        { id: 'eventsLayer', label: 'Events' }
    ];

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <div id="map1" style={{ width: '100%', height: '45vh' }}></div>
            <div id="info"></div><div id="info1"></div>
            <div style={{ position: 'absolute', top: '37px', right: '10px', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
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
                        display: 'flex',
                        flexDirection: 'column'
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

export default MapAlert;









// import React, { useState, useEffect, useRef } from 'react';
// import 'ol/ol.css';
// import Map from 'ol/Map';
// import View from 'ol/View';
// import TileLayer from 'ol/layer/Tile';
// import VectorLayer from 'ol/layer/Vector';
// import XYZ from 'ol/source/XYZ';
// import VectorSource from 'ol/source/Vector';
// import Feature from 'ol/Feature';
// import Point from 'ol/geom/Point';
// import LineString from 'ol/geom/LineString';
// import { fromLonLat, toLonLat } from 'ol/proj';
// import { Circle as CircleStyle,Icon, Style, Text, Stroke, Fill } from 'ol/style';
// import FullScreen from 'ol/control/FullScreen';
// import { defaults as defaultControls } from 'ol/control';
// import {click} from 'ol/events/condition';
// import {pointerMove} from 'ol/events/condition';
// import { Cluster } from 'ol/source';

// const createHighlightedStyle = (index) => {
//     const highlightRadius = 20;  // Highlighted point radius
//     const highlightColor = 'blue';  // Blue color for highlighting

//     return new Style({
//         image: new CircleStyle({
//             radius: highlightRadius,
//             fill: new Fill({ color: highlightColor }),
//             stroke: new Stroke({
//                 color: 'white',
//                 width: 2
//             })
//         }),
//         text: new Text({
//             text: index,
//             fill: new Fill({ color: 'white' }),
//             font: '14px sans-serif'
//         })
//     });
// };

// const createClusterStyle = (clusterSize) => {
//     // Customize this function to create a style for clusters based on the number of features in the cluster
//     // const clusterRadius = clusterSize * 0.5; // Example: Cluster size multiplied by 10 for radius
//     const clusterRadius = 25;
    
//     return new Style({
//         image: new CircleStyle({
//             radius: clusterRadius,
//             fill: new Fill({ color: 'orange' }), // Customize color as needed
//             stroke: new Stroke({
//                 color: 'white',
//                 width: 2
//             })
//         }),
//         text: new Text({
//             text: clusterSize.toString(),
//             fill: new Fill({ color: 'white' }),
//             font: '14px sans-serif'
//         })
//     });
// };

// const createNumberIconStyle = (text) => {
//     return new Style({
//         image: new Icon({
//             opacity: 1,
//             src:"/assets/images/cc_cam.svg"
//         }),
//         text: new Text({
//             text: text,
//             fill: new Fill({ color: '#ff0000' }), // Red color
//             stroke: new Stroke({ color: '#ffffff', width: 2 }),
//             font: '14px Arial',
//             offsetY: -18, // Adjust the offset to position the text above the icon
//             textAlign: 'center', // Center the text horizontally
//             textBaseline: 'bottom' // Align the text to the bottom of its position
//         }),
//     });
// };
// const addRandomOffset = (coord) => {
//     const offset = Math.random() / 10000; // Adjust the offset value as needed
//     const lon = coord[0] + offset;
//     const lat = coord[1] + offset;
//     return [lon, lat];
// };

// const createLineBlueStyle = () => {
//     return new Style({
//         stroke: new Stroke({
//             color: '#666666',
//             width: 2,
//         }),
//     });
// };

// const MapAlert = ({ data, checked, event_id }) => {
//     const mapRef = useRef(null);
//     const vectorSourceRef = useRef(new VectorSource());
//     const [trackEnabled, setTrackEnabled] = useState(checked);
//     const previousSelectedPoint = useRef(null);

//     useEffect(() => {
//         if (!mapRef.current) {
//             mapRef.current = new Map({
//                 target: 'map1',
//                 layers: [
//                     new TileLayer({
//                         source: new XYZ({
//                             url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
//                         })
//                     }),
//                     new VectorLayer({
//                         source: vectorSourceRef.current,
//                     })
//                 ],
//                 controls: defaultControls().extend([new FullScreen()]),
//                 view: new View({
//                     center: fromLonLat([78.46, 17.44]),
//                     zoom: 10
//                 }),
//             });
//         }

//         // mapRef.current.on('click', (event) => {
//         //     const clickedCoord = event.coordinate;
//         //     const lonLat = toLonLat(clickedCoord);
//         //     console.log('Clicked Longitude:', lonLat[0]);
//         //     console.log('Clicked Latitude:', lonLat[1]);

//         //     // Get the feature ID at the clicked coordinate
//         //     const feature = mapRef.current.forEachFeatureAtPixel(event.pixel, (feature) => feature);

//         //     if (feature) {
//         //         // Get the event ID associated with the clicked feature
//         //         const eventId = data.find(item => fromLonLat([item.lon, item.lat]).toString() === feature.getGeometry().getCoordinates().toString())?.event_id;
//         //         if (eventId) {
//         //             console.log('Clicked Event ID:', eventId);
//         //             // You can display the event ID in a separate component or a popup here
//         //         }
//         //     }
//         // });

//         if (!data || data.length === 0) {
//             console.error('No data provided for mapping.');
//             return;
//         }

//         const clusterSource = new Cluster({
//             distance: 40, // Adjust clustering distance as needed
//             source: vectorSourceRef.current,
//         });
//         const clusterLayer = new VectorLayer({
//             source: clusterSource,
//             style: function (feature) {
//                 const features = feature.get('features');
//                 if (features.length > 1) {
//                     return createClusterStyle(features.length); // Create a style for clustered features
//                 } else {
//                     return features[0].getStyle(); // Use the style of the individual feature
//                 }
//             },
//         });
//         mapRef.current.addLayer(clusterLayer);

//         const sortedData = data.slice().sort((a, b) => b.event_id - a.event_id);

//         vectorSourceRef.current.clear();

//         sortedData.forEach((item, index) => {
//             const lonLat = addRandomOffset([item.lon, item.lat]);
//             const pointFeature = new Feature({
//                 geometry: new Point(fromLonLat(lonLat)),
//                 event_id: item.event_id,
//                 id: index
//             });

//             if (item.event_id === event_id) {
//                 pointFeature.setStyle(createHighlightedStyle((index + 1).toString()));
//                 previousSelectedPoint.current = pointFeature;
//             } else {
//                 pointFeature.setStyle(createNumberIconStyle((index + 1).toString()));
//             }

//             vectorSourceRef.current.addFeature(pointFeature);
//         });

//         if (previousSelectedPoint.current) {
//             // Animate the map to the selected point
//             const selectedCoord = toLonLat(previousSelectedPoint.current.getGeometry().getCoordinates());
//             mapRef.current.getView().animate({
//                 center: fromLonLat(selectedCoord),
//                 // duration: 1000, // Animation duration in milliseconds
//                 zoom: 20, // Adjust the zoom level as needed
//             });
//         }
//     }, [data, event_id]);

//     return (
//         <div style={{ width: '100%' }}>
//             <div id="map1" style={{ width: '100%', height: '45vh' }}></div>
//         </div>
//     );
// };

// export default MapAlert;




