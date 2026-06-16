import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Map as OlMap, Overlay, View as OlView } from "ol";
import { Tile as OlLayerTile } from "ol/layer";
import { OSM as OlSourceOSM, XYZ } from "ol/source";
import { Layers } from "./layers/layers";
import "ol/ol.css";
import "./overlays/popup.css";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => {
  return {
    mapsection: {
      width: "41vw",
      height: "48vh",
      [theme.breakpoints.between(750, 1400)]: {
        width: "41vw !important",
        height: "47.5vh !important"
      },
      [theme.breakpoints.up(1401)]: {
        width: "41vw !important",
        height: "48.5vh !important"
      }
    }
  };
});

const Map = (props) => {
  const classes = useStyles();

  const olmap = new OlMap({
    target: undefined,
    view: new OlView({
      center: props.mapProps.DefaultCenter,
      zoom: props.mapProps.DefaultZoom,
      minZoom: props.mapProps.MinZoom,
      maxZoom: props.mapProps.MaxZoom,
      projection: props.mapProps.Projection,
    }),
  });

  const [state, setState] = useState({ extent: null });

  let popup = null;
  let popupComp = null;
  let mapDiv = useRef(null);

  // useMemo(() => {
  //     // componentWillReceiveProps
  //     const nextProps = useRef(props);
  //     if (nextProps.mapProps !== props.mapProps) {
  //         olmap.getView().setCenter(nextProps.mapProps.DefaultCenter);
  //         olmap.getView().setZoom(nextProps.mapProps.DefaultZoom);
  //     }
  // }, [...props]);

  useEffect(() => {
    // Initialize the map
    setInitialData();

    return () => {
      if (olmap) {
        // Anything in here is fired on component unmount.
        olmap.setTarget(undefined);
      }
    };
  }, []);

  //   useEffect(() => {
  //     const nextProps = useRef(props);
  //     if (nextProps.mapProps !== props.mapProps) {
  //       olmap.getView().setCenter(nextProps.mapProps.DefaultCenter);
  //       olmap.getView().setZoom(nextProps.mapProps.DefaultZoom);
  //     }
  //   }, [props]);

  const setInitialData = () => {
    themeselection();
    olmap.setTarget("map");

    popup = new Overlay({
      element: ReactDOM.findDOMNode(mapDiv.current).querySelector("#popup"),
      stopEvent: false,
    });

    olmap.on("click", (evt) => {
      let layername;
      let layers = props.layers;

      let feature = olmap.forEachFeatureAtPixel(
        evt.pixel,
        function (feature, layer) {
          layername = layer.get("title");
          return feature;
        }
      );

      if (feature) {
        layers.forEach((layer) => {
          if (layer.LayerTitle === layername && layer.Popup === "Yes") {
            setPopupData(layer, feature);
            popup.setPosition(evt.coordinate);
            olmap.addOverlay(popup);
            let popupElement = popup;
            let closer = ReactDOM.findDOMNode(mapDiv.current).querySelector(
              "#popup-closer"
            );
            if (closer.onclick === null) {
              closer.onclick = function () {
                popupElement.setPosition(undefined);
                closer.blur();
                return false;
              };
            }
          }
        });
      }
    });

    olmap.on("pointermove", (evt) => {
      let layername;
      let layers = props.layers;
      let feature = olmap.forEachFeatureAtPixel(
        evt.pixel,
        function (feature, layer) {
          layername = layer.get("title");
          return feature;
        }
      );

      if (feature) {
        layers.forEach((layer) => {
          if (layer.LayerTitle === layername && layer.MouseHover === "Yes") {
            setPopupData(layer, feature);
            popup.setPosition(evt.coordinate);
            olmap.addOverlay(popup);
            let popupElement = popup;
            let closer = ReactDOM.findDOMNode(mapDiv.current).querySelector(
              "#popup-closer"
            );
            if (closer.onclick === null) {
              closer.onclick = function () {
                popupElement.setPosition(undefined);
                closer.blur();
                return false;
              };
            }
          }
        });
      }
    });
  };

  const setPopupData = (layer, feature) => {
    popupComp.innerHTML = "";
    let data = layer.PopupData;
    let fields = layer.PopupDataFields;
    for (var i = 0; i < data.length; i++) {
      popupComp.innerHTML =
        popupComp.innerHTML +
        "<table><tr><td>" +
        fields[i] +
        "</td><th>" +
        feature.get(data[i]) +
        "</th></tr></table>";
    }
  };

  const themeselection = () => {
    if (props.mapProps.Theme === "black") {
      switch (props.mapProps.Type) {
        case "Open Street Map":
          olmap.addLayer(
            new OlLayerTile({
              source: new OlSourceOSM({
                url: "http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              }),
              zIndex: -1,
            })
          );
          break;
        case "Google":
          olmap.addLayer(
            new OlLayerTile({
              source: new OlSourceOSM({
                url: "http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}",
              }),
              zIndex: -1,
            })
          );
          break;
        case "ESRI":
          olmap.addLayer(
            new OlLayerTile({
              source: new XYZ({
                attributions:
                  'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
                  'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
                url:
                  "https://server.arcgisonline.com/ArcGIS/rest/services/" +
                  "World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
              }),
              zIndex: -1,
            })
          );
          break;
        default:
          return null;
      }
    } else if (props.mapProps.Theme === "white") {
      switch (props.mapProps.Type) {
        case "Open Street Map":
          olmap.addLayer(
            new OlLayerTile({
              source: new OlSourceOSM(),
              zIndex: -1,
            })
          );
          break;
        case "Google":
          olmap.addLayer(
            new OlLayerTile({
              source: new OlSourceOSM({
                url: "http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}",
              }),
              zIndex: -1,
            })
          );
          break;
        case "ESRI":
          olmap.addLayer(
            new OlLayerTile({
              source: new XYZ({
                attributions:
                  'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
                  'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
                url:
                  "https://server.arcgisonline.com/ArcGIS/rest/services/" +
                  "World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
              }),
              zIndex: -1,
            })
          );
          break;
        default:
          return null;
      }
    }

    setState({
      extent: olmap.getView().calculateExtent(),
    });
  };

  return (
    <div ref={mapDiv} id="map" className={classes.mapsection}>
      {props.children}
      <Layers
        layerlist={props.layers}
        olmap={olmap}
        extent={state.extent}
      ></Layers>
      {/* <Overlays></Overlays>*/}
      <div className="ol-popup" id="popup">
        <div id="popup-closer" className="ol-popup-closer"></div>
        <div id="popup-content" ref={(el) => (popupComp = el)}></div>
      </div>
    </div>
  );
};

export default Map;
