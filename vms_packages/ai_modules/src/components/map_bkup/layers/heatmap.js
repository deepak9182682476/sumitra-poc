import React, { Component } from "react";
import PropTypes from 'prop-types';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import HeatmapLayer from 'ol/layer/Heatmap';

class Heatmap extends Component {

    static contextTypes = {
        mapComp: PropTypes.object
    };

    constructor(props) {
        super(props);  

        this.layer = new HeatmapLayer();

    }

    componentDidMount() {

        this.context.mapComp.olmap.getView().on('change:resolution', (evt) => {
            let getzoom = this.context.mapComp.olmap.getView().getZoom();
            let blur;
            let heamap_radius;
            if (getzoom < 5) {
                heamap_radius = getzoom / 6 - 2;
                blur = heamap_radius + 2;
            } else if (getzoom >= 5 && getzoom < 6) {
                heamap_radius = 0.2;
                blur = heamap_radius + 2;
            } else if (getzoom >= 6 && getzoom < 7) {
                heamap_radius = 0.4;
                blur = heamap_radius + 2;
            } else if (getzoom >= 7 && getzoom < 8) {
                heamap_radius = 0.5;
                blur = heamap_radius + 2;
            }
            else if (getzoom >= 8 && getzoom < 9) {
                heamap_radius = 0.6;
                blur = heamap_radius + 2;
            }
            else if (getzoom >= 9 && getzoom < 10) {
                heamap_radius = 0.7;
                blur = heamap_radius + 2;
            }
            else if (getzoom >= 10 && getzoom < 11) {
                heamap_radius = 0.7;
                blur = heamap_radius + 2;
            }
            else if (getzoom >= 11 && getzoom < 12) {
                heamap_radius = 0.9;
                blur = heamap_radius + 2;
            }
            else if (getzoom >= 12 && getzoom < 13) {
                heamap_radius = 1.5;
                blur = heamap_radius + 2;
            }
            else if (getzoom >= 13 && getzoom < 14) {
                heamap_radius = 2;
                blur = heamap_radius + 2;
            }
            else if (getzoom >= 14 && getzoom < 15) {
                heamap_radius = getzoom / 6 + 1;
                blur = heamap_radius + 2;
            }
            else {
                heamap_radius = getzoom / 6 + 2;
                blur = heamap_radius + 2;
            }


                    this.layer.setRadius(heamap_radius);
                    this.layer.setBlur(blur);

        })

        let options = this.props.layer;

       this.context.mapComp.olmap.removeLayer(this.layer);


        this.layer = new HeatmapLayer({
            title: options.LayerTitle,
            visible: true,
            zIndex: 98,
            projection: options.LayerProjection,
            source: new VectorSource({
                features: (new GeoJSON()).readFeatures(options.Source)
            }),
            //blur: 0,
            //radius: function (feature) {
            //      return 8;
            //    //var value = feature.get('value');
            //    //var magnitude = parseInt(value);
            //    //return magnitude;
            //},
            //radius: 8,
            gradient: ['#00f', '#0ff', '#0f0', '#ff0', '#f00'],
            weight: function (feature) {
                  return 1;
                //var value = feature.get('value');
                //var magnitude = parseInt(value) * 0.1;
                //return magnitude;
            }

        })


        this.context.mapComp.olmap.addLayer(this.layer)
    } 

    //componentWillReceiveProps(nextProps) {
    //    if (nextProps !== this.props) {
    //        let options = nextProps.layer;

    //        this.context.mapComp.olmap.removeLayer(this.layer);


    //        this.layer = new HeatmapLayer({
    //            title: options.LayerTitle,
    //            visible: true,
    //            projection: options.LayerProjection,
    //            source: new VectorSource({
    //                features: (new GeoJSON()).readFeatures(options.Source)
    //            }),
    //            blur: 0,
    //            radius: 9,
    //            weight: function (feature) {
    //              //  return 1;
    //                var value = feature.get('value');
    //                var magnitude = parseFloat(value) * 0.1;
    //                return magnitude;
    //            }

    //        })
           

    //        this.context.mapComp.olmap.addLayer(this.layer)

           
    //    }
    //}

    componentWillUnmount() {
        this.context.mapComp.olmap.removeLayer(this.layer);
    }

    render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
    

}

export default Heatmap;


