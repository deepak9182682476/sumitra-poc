import React, { Component } from "react";
import PropTypes from 'prop-types';
import './popup.css'
import Overlay from "ol/Overlay";
import ReactDOM from 'react-dom';

class Popup extends Component {

    static contextTypes = {
        mapComp: PropTypes.object
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {

        this.popup = new Overlay({
            element: ReactDOM.findDOMNode(this).querySelector('#popup'),
            stopEvent: false
        });

        this.context.mapComp.olmap.on('click', evt => {
            let lonLat = evt.coordinate;
            this.popupComp.innerHTML = '<p Test></p>';
            this.popup.setPosition(evt.coordinate);
            this.context.mapComp.olmap.addOverlay(this.popup);
            //let popup = this.popup;
            //let closer = ReactDOM.findDOMNode(this).querySelector('#popup-closer');
            //if (closer.onclick === null) {
            //    closer.onclick = function () {
            //        popup.setPosition(undefined);
            //        closer.blur();
            //        return false;
            //    };
            //}

        })

    }

    componentWillReceiveProps(nextProps) {
        if (nextProps !== this.props) {
           


        }
    }

    componentWillUnmount() {
        //this.context.mapComp.olmap.removeLayer(this.layer);
    }

    render() {
        return (
            <div className="ol-popup" id="popup" >
                <div id="popup-closer" className="ol-popup-closer"></div>
                <div id="popup-content" ref={el => this.popupComp = el}>
                </div>
            </div>
        );
    }


}

export default Popup;


