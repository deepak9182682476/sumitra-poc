import { useContext, useEffect } from "react";
// import VectorSource from "ol/source/Vector";
import Fill from "ol/style/Fill";
import Icon from "ol/style/Icon";
import CircleStyle from "ol/style/Circle";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
// import OLVectorLayer from "ol/layer/Vector";
// import GeoJSON from "ol/format/GeoJSON";
import MapContext from "../mapcontext";
import * as olExtent from "ol/extent";
import { Point } from "ol/geom";
import Feature from "ol/Feature";
import Layer from "../../map/layerlist";
const CustomGeoJson = require('geojson');

const DensityLayer = (props) => {
  const { map } = useContext(MapContext);

  const addLayerToMap = (MapData) => {

    var options = Object.assign({}, Layer, {
      LayerTitle: "Camera_Violation_Index",
      LayerType: "Vector",
      Source: MapData,
      SourceType: "GeoJSON",
      Popup: "Yes",
      MouseHover: "Yes",
      ZoomToLayer: "Yes",
      Style: { type: "density" },
      styleColor: "#35ACD2",
      styleRadius: 2,
      styleFillColor: "#35ACD2",
      PopupData: ["camera_name", "value"],
      PopupDataFields: ["Camera", "Violation Index"],
    });

    var image;
    if (options.SourceType === "image") {
      image = new Icon({
        src: options.Source,
      });
    }

    if (options.Style.type === "image") {
      image = new Icon({
        src: options.Style.source,
        scale: options.Style.scale,
      });
    } else {
      image = new CircleStyle({
        radius: 3,
        fill: new Fill({
          color: options.styleFillColor,
        }),
        stroke: new Stroke({
          color: options.styleColor,
          width: options.styleRadius,
        }),
      });
    }

    var styles = {
      Point: new Style({
        image: image,
      }),
      LineString: new Style({
        stroke: new Stroke({
          color: options.Style.color,
          width: options.Style.width,
        }),
      }),
      MultiLineString: new Style({
        stroke: new Stroke({
          color: options.Style.color,
          width: options.Style.width,
        }),
      }),
      MultiPoint: new Style({
        image: image,
      }),
      MultiPolygon: new Style({
        stroke: new Stroke({
          color: options.Style.color,
          width: options.Style.width,
        }),
        fill: new Fill({
          color: options.Style.fill,
        }),
      }),
      Polygon: new Style({
        stroke: new Stroke({
          color: options.Style.color,
          //lineDash: [4],
          width: options.Style.width,
        }),
        fill: new Fill({
          color: options.Style.fill,
        }),
      }),
      GeometryCollection: new Style({
        stroke: new Stroke({
          color: "magenta",
          width: 2,
        }),
        fill: new Fill({
          color: "magenta",
        }),
        image: new CircleStyle({
          radius: 10,
          fill: null,
          stroke: new Stroke({
            color: "magenta",
          }),
        }),
      }),
      Circle: new Style({
        stroke: new Stroke({
          color: "red",
          width: 2,
        }),
        fill: new Fill({
          color: "rgba(255,0,0,0.2)",
        }),
      }),
    };

    // eslint-disable-next-line no-unused-vars
    var styleFunction = (feature) => {
      if (options.Selected === feature.get(options.SelectField)) {
        return selectedStyle;
      }
      //   else if (options.Style.type === "density") {
      //     return densityStyle(feature);
      //   } 
      else {
        return styles[feature.getGeometry().getType()];
      }
    };

    var selectedStyle = new Style({
      stroke: new Stroke({
        color: options.styleColor,
        width: options.styleRadius,
      }),
      fill: new Fill({
        color: options.styleFillColor,
      }),
    });

    let normalize = function (val, max, min) {
      return (val - min) / (max - min);
    };

    // eslint-disable-next-line no-unused-vars
    let densityStyle = (feature) => {
      let zoom = map.getView().getZoom();
      let opacity = normalize(feature.get("value"), 10, 0);
      opacity = opacity * 0.8 + 0.2;

      let radius1 = normalize(feature.get("value"), 10, 0);

      let radius = radius1 * 12 + 2;
      if (zoom <= 5) {
        radius = radius1 * 4 + 1;
      } else if ((zoom > 5) & (zoom <= 8)) {
        radius = radius1 * 7 + 2;
      } else if ((zoom > 8) & (zoom <= 10)) {
        radius = radius1 * 9 + 2;
      } else if ((zoom > 10) & (zoom <= 11)) {
        radius = radius1 * 11 + 2;
      } else if ((zoom > 11) & (zoom <= 12)) {
        // radius = radius1 * 12 + 2;
      } else if ((zoom > 12) & (zoom <= 13)) {
        radius = radius1 * 13 + 2;
      } else if ((zoom > 13) & (zoom <= 14)) {
        radius = radius1 * 14 + 2;
      } else if ((zoom > 14) & (zoom <= 17)) {
        radius = radius1 * 15 + 2;
      } else if ((zoom > 17) & (zoom <= 19)) {
        radius = radius1 * 17 + 2;
      }
      return new Style({
        image: new CircleStyle({
          radius: radius,
          fill: new Fill({
            color: [options.styleFillColor, opacity],
          }),
          stroke: new Stroke({ color: options.styleColor, width: 1 }),
        }),
      });
    };

    //let vectorLayer = new OLVectorLayer({
     // title: options.LayerTitle,
     // source: new VectorSource({
     //   features: new GeoJSON().readFeatures(options.Source),
     // }),
    //  style: styleFunction
    //});

   // vectorLayer.setZIndex(2);
    // vectorLayer.setOpacity(0.4);
    //map.addLayer(vectorLayer);
  }

  useEffect(async () => {
    if (!map) return;
    if (props.features && props.features.length <= 0) return;

    let MapData = CustomGeoJson.parse(props.features, { Point: ["lat", "lon"] });
    // console.log("--MapData--", MapData);

    let layers = map.getLayers().getArray();
    let isExisted = false, existedLayer = undefined;
    for (let index = 0; index < layers.length; index++) {
      const layer = layers[index];
      if (layer.get("title") !== undefined && layer.get("title").indexOf("Camera_Violation_Index") !== -1) {
        isExisted = true;
        existedLayer = layer;
        break;
      }
    }

    if (isExisted) {
      // adding of features
      for (let index = 0; index < MapData.features.length; index++) {
        const feat = MapData.features[index];
        let featureExist = existedLayer.getSource().getFeatures().some((el) => {
          return el.getProperties().event_id === feat.properties.event_id;
        })

        if (!featureExist && feat.geometry && feat.geometry.coordinates) {
          existedLayer.getSource().addFeature(new Feature({
            geometry: new Point(feat.geometry.coordinates),
            properties: feat.properties
          }));
        }
      }
      // existedLayer.getSource().addFeatures(MapData.features);

      var extension = olExtent.createEmpty();
      let zoom = map.getView().getZoom();

      olExtent.extend(extension, existedLayer.getSource().getExtent());
      map.getView().fit(extension);
      map.getView().setZoom(zoom);
    }
    else {
      addLayerToMap(MapData);
    }

    // return () => {
    //   if (map) {
    //     map.removeLayer(vectorLayer);
    //   }
    // };
  }, [map, props]);

  return null;
};

export default DensityLayer;
