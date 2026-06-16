import React, { useRef, useState, useEffect } from "react";
import MapContext from "./mapcontext";
import * as ol from "ol";
import './map.css';
import { makeStyles } from "@mui/styles";
import { fromLonLat } from 'ol/proj';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LayersIcon from '@mui/icons-material/Layers';
import IconButton from '@mui/material/IconButton';
import { Checkbox, FormControlLabel } from '@mui/material';

const useStyles = makeStyles((theme) => ({
    main: {
        backgroundColor : theme.palette.background.paper,
        // color: theme.palette.primary.color,
        position: 'relative'
    },
    button: {
        width: '20px',
        height: '20px',
        backgroundColor: '#08264c',
        color: 'white',
        marginBottom: '7px',
        padding: '5px',
        borderRadius: '2px',
        boxShadow: 'none'
    }
}));

const Map = (props) => {
    const classes = useStyles();
    const mapRef = useRef();
    const [map, setMap] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [mapHeight, setMapHeight] = useState(window.innerHeight - 235 + "px");
    const [showLayerControls, setShowLayerControls] = useState(false);
  
    useEffect(() => {
        let options = {
            view: new ol.View({
                center: fromLonLat(props.center),
                zoom: props.zoom,
                projection: props.projection
            }),
            layers: [],
            controls: [],
            overlays: []
        };

        let mapObject = new ol.Map(options);
        mapObject.setTarget(mapRef.current);
        setMap(mapObject);

        return () => mapObject.setTarget(undefined);
    }, []);

    const zoom = (mode) => {
        if (map) { 
            const view = map.getView();
            const currentZoom = view.getZoom();
            view.animate({
                zoom: mode === "in" ? currentZoom + 1 : currentZoom - 1,
                duration: 500
            });
        }
    };
    const handleLayerToggle = (layerName) => {
        props.setSelectedLayers(prevLayers => {
            const updatedLayers = { ...prevLayers, [layerName]: !prevLayers[layerName] };
            return updatedLayers;
        });
    };

    const handleLayerIconClick = () => {
        setShowLayerControls(!showLayerControls);
    };

    const buttons = [
        { icon: <AddIcon />, onClick: () => zoom("in") },
        { icon: <RemoveIcon />, onClick: () => zoom("out") },
        { icon: <LayersIcon />, onClick: handleLayerIconClick }
    ];

    const layers = [
        { id: 'commissionerateLayer', label: 'Commissionerate Layer' },
        { id: 'psLayer', label: 'PS Layer' },
        { id: 'camerasLayer', label: 'Camera Layer' },
        { id: 'hotlistAlertLayer', label: 'Hotlist Alerts Layer' }
    ];

    return (
        <MapContext.Provider value={{ map }}>
            <div style={{ height: mapHeight, width: "100%", position: 'relative' }} ref={mapRef} className={`ol-map ${classes.main}`}>
                <div id="info"></div><div id="info1"></div><div id="info2"></div>
                <div style={{ position: 'absolute', top: '37px', right: '10px', zIndex: 1000, display: 'flex', flexDirection: 'column', color: 'white' }}>
                    {buttons.map((btn, index) => (
                        <IconButton key={index} className={classes.button} onClick={btn.onClick}>
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
                            width: '200px',
                            color: 'white'
                        }}>
                            {layers.map(({ id, label }) => (
                                <div><FormControlLabel
                                    key={id}
                                    control={
                                        <Checkbox
                                            id={id}
                                            checked={props.selectedLayers[id]}
                                            onChange={() => handleLayerToggle(id)}
                                            sx={{ 
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
                                /></div>
                            ))}
                        </div>
                    )}
                </div>
                {props.children}
            </div>
        </MapContext.Provider>
    )
}

export default Map;