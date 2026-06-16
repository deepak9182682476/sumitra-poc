import React, { useEffect, useRef, useState } from "react";
import VectorSource from 'ol/source/Vector';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import CircleStyle from 'ol/style/Circle';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';

const Vector = (props) => {
    const [layer, setLayer] = useState(new VectorLayer());
    const nextProps = useRef(props.layer);

    useEffect(() => {
        // Anything in here is fired on component mount.

        return () => {
            // Anything in here is fired on component unmount.
            props.olmap.removeLayer(layer);
        }

    }, []);

    useEffect(() => {
        if (props && layer && nextProps !== props) {
            let options = nextProps.current;
            props.olmap.removeLayer(layer);

            var image;
            if (options.Style.type === "image") {
                image = new Icon({
                    src: options.Style.source
                });
            }

            var styles = {
                'Point': new Style({
                    image: image
                }),
                'LineString': new Style({
                    stroke: new Stroke({
                        color: options.Style.color,
                        width: options.Style.width
                    })
                }),
                'MultiLineString': new Style({
                    stroke: new Stroke({
                        color: options.Style.color,
                        width: options.Style.width
                    })
                }),
                'MultiPoint': new Style({
                    image: image
                }),
                'MultiPolygon': new Style({
                    stroke: new Stroke({
                        color: options.Style.color,
                        width: options.Style.width
                    }),
                    fill: new Fill({
                        color: options.Style.fill
                    })
                }),
                'Polygon': new Style({
                    stroke: new Stroke({
                        color: options.Style.color,
                        //lineDash: [4],
                        width: options.Style.width
                    }),
                    fill: new Fill({
                        color: options.Style.fill
                    })
                }),
                'GeometryCollection': new Style({
                    stroke: new Stroke({
                        color: 'magenta',
                        width: 2
                    }),
                    fill: new Fill({
                        color: 'magenta'
                    }),
                    image: new CircleStyle({
                        radius: 10,
                        fill: null,
                        stroke: new Stroke({
                            color: 'magenta'
                        })
                    })
                }),
                'Circle': new Style({
                    stroke: new Stroke({
                        color: 'red',
                        width: 2
                    }),
                    fill: new Fill({
                        color: 'rgba(255,0,0,0.2)'
                    })
                })
            };

            var styleFunction = function (feature) {
                if (options.Selected === feature.get(options.SelectField)) {
                    return selectedStyle;
                }
                else if (options.Style.type === "density") {
                    return densityStyle(feature);
                }
                else {
                    return styles[feature.getGeometry().getType()];
                }
            };

            var selectedStyle = new Style({
                stroke: new Stroke({
                    color: options.SelectedStyle.color,
                    width: options.SelectedStyle.width
                })
            });

            let normalize = function (val, max, min) {
                return (val - min) / (max - min);
            }

            let densityStyle = (feature) => {
                let zoom = props.olmap.getView().getZoom();
                let opacity = normalize(feature.get('value'), 10, 0);
                opacity = opacity * 0.8 + 0.2;
                let radius1 = normalize(feature.get('value'), 10, 0);
                let radius = radius1 * 12 + 2;
                if (zoom <= 5) {
                    radius = radius1 * 4 + 1;
                } else if (zoom > 5 & zoom <= 8) {
                    radius = radius1 * 7 + 2;
                } else if (zoom > 8 & zoom <= 10) {
                    radius = radius1 * 9 + 2;
                } else if (zoom > 10 & zoom <= 11) {
                    radius = radius1 * 11 + 2;
                } else if (zoom > 11 & zoom <= 12) {
                    radius = radius1 * 12 + 2;
                } else if (zoom > 12 & zoom <= 13) {
                    radius = radius1 * 13 + 2;
                } else if (zoom > 13 & zoom <= 14) {
                    radius = radius1 * 14 + 2;
                }
                else if (zoom > 14 & zoom <= 17) {
                    radius = radius1 * 15 + 2;
                } else if (zoom > 17 & zoom <= 19) {
                    radius = radius1 * 17 + 2;
                }
                return new Style({
                    image: new CircleStyle({
                        radius: radius,
                        fill: new Fill({
                            color: [20, 142, 230, opacity]
                        }),
                        stroke: new Stroke({ color: [20, 142, 230], width: 1 })
                    })
                })
            }

            setLayer(new VectorLayer({
                title: options.LayerTitle,
                visible: true,
                projection: options.Projection,
                source: new VectorSource({
                    features: (new GeoJSON()).readFeatures(options.Source)
                }),
                style: styleFunction
            }));

            props.olmap.addLayer(layer);

            // if (options.ZoomToLayer === "Yes") {
            //     props.olmap.getView().fit(props.extent, { padding: [30, 30, 30, 30] });
            // }
        }
    }, [props]);

    return (
        <div>
            {props.children}
        </div>
    );
}

export default Vector;


