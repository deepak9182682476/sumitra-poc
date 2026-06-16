import { useContext, useEffect } from "react";
import MapContext from "../mapcontext";
import OLVectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import "ol/ol.css";

import Fill from "ol/style/Fill";
import CircleStyle from "ol/style/Circle";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import GeoJSON from "ol/format/GeoJSON";
import Icon from "ol/style/Icon";
import * as olExtent from "ol/extent";

const CamerasLayer = (props) => {
  const { map } = useContext(MapContext);

  useEffect(() => {
    if (!map) return;

    if (props.layer === undefined) return;

    let color = props.layer.styleColor;
    let radius = props.layer.styleRadius;
    let fillColor = props.layer.styleFillColor;
    let DataSource = props.layer.Source;

    var image;

    if (props.layer.SourceType === "image") {
      image = new Icon({
        src: DataSource,
      });
    }

    if (props.layer && props.layer.Style.type === "image") {
      image = new Icon({
        src: props.layer.Style.source,
        scale: props.layer.Style.scale,
      });
    } else {
      image = new CircleStyle({
        radius: 3,
        fill: new Fill({
          color: fillColor,
        }),
        stroke: new Stroke({
          color: color,
          width: 2,
        }),
      });
    }

    var data = props.layer.Source;

    var styles = {
      Point: new Style({
        image: image,
      }),
      LineString: new Style({
        stroke: new Stroke({
          color,
          width: radius,
        }),
      }),
      MultiLineString: new Style({
        stroke: new Stroke({
          color,
          width: radius,
        }),
      }),
      MultiPoint: new Style({
        image: image,
      }),
      MultiPolygon: new Style({
        stroke: new Stroke({
          color,
          width: radius,
        }),
        fill: new Fill({
          color: fillColor,
        }),
      }),
      Polygon: new Style({
        stroke: new Stroke({
          color,
          //lineDash: [4],
          width: radius,
        }),
        fill: new Fill({
          color: fillColor,
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

    var styleFunction = (feature) => {
      if (props.layer.Selected === feature.get(props.layer.SelectField)) {
        return selectedStyle(color, radius, fillColor);
      } else {
        return styles[feature.getGeometry().getType()];
      }
    };

    const selectedStyle = (color, radius, fillColor) =>
      new Style({
        stroke: new Stroke({
          color,
          width: radius,
        }),
        fill: new Fill({
          color: fillColor,
        }),
      });

    const featuresAccess = (data && data.features) || (data && data.length > 0);

    let vectorLayer = new OLVectorLayer({
      title: props.layer.LayerTitle,
      source: new VectorSource({
        features: featuresAccess ? new GeoJSON().readFeatures(data) : [],
      }),
      style: styleFunction,
    });

    vectorLayer.setZIndex(2);
    vectorLayer.setOpacity(0.4);
  
    map.addLayer(vectorLayer);

    map
      .getLayers()
      .getArray()
      .forEach(function (layer) {
        if (
          layer.get("title") === "cc-cameras" &&
          Object.keys(layer.getSource().uidIndex_).length
        ) {
          var extension = olExtent.createEmpty();
          let zoom = map.getView().getZoom();
          olExtent.extend(extension, layer.getSource().getExtent());
          map.getView().fit(extension);
          map.getView().setZoom(zoom);
        }
      });

    return () => {
      if (map) {
        map.removeLayer(vectorLayer);
      }
    };
  }, [map, props]);

  return null;
};

export default CamerasLayer;
