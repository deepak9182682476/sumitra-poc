/**
 * Name : Kanaka lakshmi
 * Date of creation: 02-01-2021
 * E-Mail: kanaka-lakshmi@lntecc.com
 * Note: It's purely created to use map functions  in unit test cases.
 */
import { Injectable } from '@angular/core';
import { Map, View } from 'ol';
import { config } from '../../config/config'
import { Vector as VectorLayer } from 'ol/layer';


@Injectable({
  providedIn: 'root'
})
export class OlmapService {

  olmap: Map;
  mapParams: any;

  constructor() {
    this.mapParams = config.MapConfig;
   }

  getVectorLayer(): any {
    return new VectorLayer();
  }

  get(): any {
    this.olmap = new Map({
      target: null,
      view: new View({
        center: this.mapParams.DefaultCenter,
        zoom: this.mapParams.DefaultZoom,
        projection: this.mapParams.Projection,
      }),
    });
    return this.olmap;
  }
}
