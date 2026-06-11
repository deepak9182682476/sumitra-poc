import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  Input,
  ChangeDetectorRef,
  TemplateRef,
} from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormBuilder, FormGroup, Validators, NgForm } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import * as turf from "@turf/turf";
import "ol/ol.css";
//import { Map, View, Overlay } from "ol";
import Map from 'ol/Map';
import View from 'ol/View';
import Overlay from 'ol/Overlay';

import Draw, { createBox, createRegularPolygon } from "ol/interaction/Draw";
import { Select } from "ol/interaction";
import { MultiPoint, Polygon, Circle, LineString } from "ol/geom";
import { fromCircle } from "ol/geom/Polygon";
import Point from "ol/geom/Point";
import { GeoJSON } from "ol/format";
import { getWidth } from "ol/extent";
import Feature from "ol/Feature";
import KML from "ol/format/KML";
import { Circle as CircleStyle, Fill, Stroke, Style, Icon } from "ol/style";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { TileWMS, XYZ, Vector as VectorSource, Cluster } from "ol/source";
import { DataService } from "../../services/data.service";
import { EventService } from "../../services/event.service";
import { CommonService } from "../../services/common.service";
import { AlarmService } from "../../services/alarm.service";
import { Subscription } from "rxjs";
import { ThemeService } from "../../theme/theme.service";
import { RndfService } from "src/app/services/rndf.service";
import { ActivatedRoute, Router } from "@angular/router";
import { DiagnosticsService } from "src/app/services/diagnostics.service";
import { AlarmDataService } from '../../shared/alarm-data.service';

const CustomGeoJson = require("geojson");

@Component({
  selector: "app-maps",
  templateUrl: "./maps.component.html",
  styleUrls: ["./maps.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class MapsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() isPostAnalysis: boolean;
  @Input() isManualRouteMap: boolean;

  signedInUserInfo = {
    isSignedIn: false,
    role: null,
  };
  modeSubscription: Subscription;
  enableUAVModal = false;
  enableVideo = false;
  enableUavVideo = false;
  uavStreamUrl = 'http://192.168.2.146:8091/uav';
  isSlewPopupEnabled = true; // *** thermal
  isCameraPopupEnabled = false; // *** thermal
  enableCameraVideo = false;
  selectedShape: String;
  clonedLayers: any = [];
  rndfLayers: any = [];
  zoneLayers: any = [];
  checkedLayers: any = [];
  isTrackReceived = false;
  uavTrack = []
  olmap : Map;
  mrolmap : Map;
  view : View;
  view1 : View;
  mapParams;
  layerlist: Array<any> = [];
  layers = {
    LayerTitle: "",
    LayerType: "",
    ApplyClustering: "No",
    Source: "",
    SourceType: "",
    LayerProjection: "EPSG:4326",
    Style: "",
    SelectField: "",
    Selected: "",
    SelectedStyle: "",
    Popup: "Yes",
    PopupFields: "",
    PopupData: "",
    MouseHover: "No",
    ZoomToLayer: "No",
  };

  popup: any;
  alarmSubscription: Subscription;
  alarmDataSubscription: Subscription;
  clearedAlarmSubscription: Subscription;
  radarTrackSubscription: Subscription;
  mapLayerSubscription: Subscription;
  roleAuthSubscription: Subscription;
  slewTISubscription: Subscription;
  tracksList = [];
  isMaskTypeSelected: boolean = false;
  isMapView: boolean = true;
  audio = new Audio();
  applyOpacityFeature = null;
  getAssignedData = null;
  getAllAlarms = [];
  activeRouteUrl: any = "";
  alarmsData = [];
  sensorsData = [];
  resultIp = [];

  @ViewChild("manualRouteTemplate") manualRouteTemplateRef: TemplateRef<any>;
  smrFormGroup: FormGroup;
  @ViewChild("smrForm") smrForm: NgForm;
  modalRef: BsModalRef;
  config = {
    keyboard: false,
    backdrop: true,
    ignoreBackdropClick: true,
    class: "modal-lg popupModal",
  };

  @ViewChild("popupElement") popupElement: ElementRef;
  @ViewChild("popupCloser") popupCloser: ElementRef;
  @ViewChild("overlayElement") overlayElement: ElementRef;
  @ViewChild("maskType") maskType: ElementRef;

  @ViewChild("paPopupElement") paPopupElement: ElementRef;
  @ViewChild("paPopupCloser") paPopupCloser: ElementRef;
  @ViewChild("paOverlayElement") paOverlayElement: ElementRef;

  @ViewChild("daPopupElement") daPopupElement: ElementRef;
  @ViewChild("daPopupCloser") daPopupCloser: ElementRef;
  @ViewChild("daOverlayElement") daOverlayElement: ElementRef;

  ptzControls = {
    query: "position",
    camera: 2,
    track_id: null
  };
  ti_camera_ip: any = "";
  ti_location: any = [];
  eoir_camera_ip: any = "";
  eoir_location: any = [];
  addedRobotsForManualRoute: any = [];
  selectedAlgoType: any = null;
  selectedRoutePoints: any = [];

  constructor(
    public element: ElementRef,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private themeService: ThemeService,
    private alarmService: AlarmService,
    private commonService: CommonService,
    private eventService: EventService,
    private RndfService: RndfService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public diagnosticsService: DiagnosticsService,
    private cdr: ChangeDetectorRef,
    private alarmDataService: AlarmDataService
  ) {
    this.mapParams = this.dataService.config.MapConfig;
    this.view = new View({
      // extent: this.mapParams.DefaultExtent,
      center: this.mapParams.DefaultCenter,
      zoom: this.mapParams.DefaultZoom,
      // minZoom: this.mapParams.MinZoom,
      // maxZoom: this.mapParams.MaxZoom,
      projection: this.mapParams.Projection,
    });

    this.olmap = new Map({
      target: null,
      view: this.view,
    });

    this.view1 = new View({
      // extent: this.mapParams.DefaultExtent,
      center: this.mapParams.DefaultCenter,
      zoom: this.mapParams.DefaultZoom,
      minZoom: this.mapParams.MinZoom,
      maxZoom: this.mapParams.MaxZoom,
      projection: this.mapParams.Projection,
    });

    this.mrolmap = new Map({
      target: null,
      view: this.view1,
    });



    /* the below code is not required as UGV layer cannot be removed any point of time */

    this.eventService.emitter.subscribe((response: any) => {
      if (response.type == "manual_route") {      
        let {selectedRobots, algo_type} = response.message;
        let uvg_robots = selectedRobots.length && selectedRobots.map((item) => {
          return {
            ugv_name: item.split("_")[0],
            ugv_id: item.split("_")[1],
            ip_address: item.split("_")[2]
          }
        })
        this.addedRobotsForManualRoute = uvg_robots;
        this.selectedAlgoType = algo_type;
        this.openModal(this.manualRouteTemplateRef);
      }
      // if (
      //   Object.keys(response.message).length > 0 &&
      //   response.message.hasOwnProperty("assignToDefault") &&
      //   response.message.assignToDefault == true
      // ) {
      //   // Removing layer from the Map
      //   let layer = this.olmap
      //     .getLayers()
      //     .getArray()
      //     .find((layer) => {
      //       if (layer.get("title") === `UGV-Path-${response.message.ip}`) {
      //         return true;
      //       }
      //     });
      //   if (layer) {
      //     this.removeLayer(layer);
      //   }
      //   this.ShowSensor({
      //     type: response.type,
      //     zone_id: response.message.zone_id,
      //   });
      // }
    });
  }
  
  onSlewToggle(event: any) {
    this.enableVideo = event.target.checked;
  }

  onUavToggle(event: any) {
    this.enableUavVideo = event.target.checked;
  }
  
  closeSlewPopup() {
    this.enableVideo = false;
    this.isSlewPopupEnabled = false;
  }
  
  getSmrMapId(event) {
    this.mrolmap.setTarget("mr_map");

    const getSignedInData = this.commonService.getDecryptedUserData();
    const userInfo = getSignedInData ? JSON.parse(getSignedInData) : false;
    const theme = userInfo && userInfo.theme ? userInfo.theme : "dark";
    this.mapThemeSelection(theme);
    
    this.getPerimeterCoordinates1();
    this.retriveRNDFFileData1();
  }

  robotSelection(event) {
    this.smrFormGroup.controls['route_type'].setValue({ route_type: "" });
    if (this.selectedRoutePoints.length > 0) {
      this.olmap.getLayers().getArray().filter((layer, i) => {
        if (layer.get("title") !== "Perimeter" && layer.get("title") === "RNDF_Points") {
          layer.getSource().getFeatures().filter((layerfeature) => {
            const selIndex = this.selectedRoutePoints.indexOf(layerfeature.getProperties().id);
            if (selIndex > 0) {
              const style = new Style({
                image: new CircleStyle({
                  radius: 3,
                  fill: new Fill({
                    color: 'transparent'
                  }),
                  stroke: new Stroke({
                    color: 'Yellow',
                    width: 2
                  })
                })
              });
              this.selectedRoutePoints.splice(selIndex, 1);
              return layerfeature.setStyle(style);
            }
          });
        }
      });
    }
  }

  defineRoute(event) {
    if (event.target.value === "new_route") {
      if (this.selectedRoutePoints.length > 0) {
        this.mrolmap.getLayers().getArray().filter((layer, i) => {
          if (layer.get("title") !== "Perimeter" && layer.get("title") === "RNDF_Points") {
            layer.getSource().getFeatures().filter((layerfeature) => {
              const selIndex = this.selectedRoutePoints.indexOf(layerfeature.getProperties().id);
              if (selIndex > 0) {
                const style = new Style({
                  image: new CircleStyle({
                    radius: 3,
                    fill: new Fill({
                      color: 'transparent'
                    }),
                    stroke: new Stroke({
                      color: 'Yellow',
                      width: 2
                    })
                  })
                });
                this.selectedRoutePoints.splice(selIndex, 1);
                return layerfeature.setStyle(style);
              }
            });
          }
        });
      }
    }
    else {
      let ugv_id = this.smrFormGroup.get('robot_id').value.split("_")[0];
      this.dataService.getUGVManualRoute(ugv_id).subscribe(
        (res: any) => {
          if (res && !res.error && !res.errorInfo) {
            let waypoints = res.data.manual_route;
            if (waypoints && waypoints.length > 0) {
              this.mrolmap.getLayers().getArray().filter((layer, i) => {
                if (layer.get("title") !== "Perimeter" && layer.get("title") === "RNDF_Points") {
                  layer.getSource().getFeatures().filter((layerfeature) => {
                    let vectorfeature = layerfeature.getProperties();
                    if (waypoints.includes(vectorfeature.id)) {
                      const style = new Style({
                        image: new CircleStyle({
                          radius: 3,
                          fill: new Fill({
                            color: '#80c0e0'
                          }),
                          stroke: new Stroke({
                            color: '#80c0e0',
                            width: 2
                          })
                        })
                      });
                      this.selectedRoutePoints.push(layerfeature.getProperties().id);
                      return layerfeature.setStyle(style);
                    }
                  });
                }
              });
            }
          }
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }

  ngOnInit(): void {
    /* var mousePosition = new MousePosition({
      coordinateFormat: createStringXY(7),
      projection: 'EPSG:4326',
      target: <HTMLDivElement>document.getElementById('mouseposition'),
      undefinedHTML: '&nbsp;',
    });

    this.olmap.addControl(mousePosition); */
  }

  getUpdatedLayers() {
    let layers = this.olmap.getLayers().getArray();
    this.zoneLayers = []
    this.rndfLayers = []
    this.clonedLayers = []
    layers.forEach((layer) => {
      if (
        layer.get("title") === "Unmasked Zones" ||
        layer.get("title") === "Masked Zones"
      ) {
        this.zoneLayers.push(layer.get("options"));
      } else if (layer.values_.id !== 1) {
        let layerOptions = layer.get("options")
        if (layerOptions) {
          layerOptions.checked = layerOptions.checked == undefined ? true : layerOptions.checked;
          if ((layerOptions.LayerTitle !== "RNDF" && layerOptions.LayerTitle !== "QRT" && layerOptions.LayerTitle !== "E_Warning")) {
            this.clonedLayers.push(layerOptions)
          }
          if (layerOptions.LayerTitle === "RNDF") {
            this.rndfLayers.push(layerOptions)
          }
        }
      }
    });
  }

  ngAfterViewInit(): void {
    const routeUrl = this.activatedRoute["_routerState"].snapshot.url;
    let routePath = routeUrl.split("/");
    this.activeRouteUrl = routePath[routePath.length - 1];
    this.cdr.detectChanges();
    let self = this;
    var filteredZonesData = [];
    // console.log("diagnosticsService before");
    if (filteredZonesData.length == 0) {
      self.diagnosticsService.getDiagnosticsData().subscribe((zones) => {
        // console.log("diagnosticsService after");
        if (!zones.error) {
          filteredZonesData = zones.data;
          if (filteredZonesData.length) {
            this.resultIp =
              filteredZonesData.length &&
              filteredZonesData.map((senData) => senData.ip);
          }
        }
      });
    }
    if (this.activeRouteUrl == "") {
      this.router.navigate(["/maps"]);
    }
    if (this.activeRouteUrl == "maps") {
      this.smrFormGroup = this.formBuilder.group({
        robot_id: ["", [Validators.required]],
        route_type: ["", [Validators.required]],
      });

      localStorage.removeItem("postAnalysisFilter");
      this.createTrackLayer("radar_tracks");
      this.createTrackLayer("uav_tracks");
      // this.createTrackLayer("ugv_tracks");
      this.getPerimeterCoordinates();
      this.getZoneCoordinates();
      this.getSensorCoordinates();
      this.getUgvsUavs();
      this.updateRadarTrack();
      this.getServerData();
      this.olmap.setTarget("map");
      this.changeVisibility();
      this.checkAuthendication();
      // this.retriveRNDFFileData();
      let qrt_location = { "type": "Feature", "geometry": { "type": "Point", "coordinates": [0, 0] }, "properties": { "category": "qrt_location", "current_status": true } };
      this.addLayerToMap(
        Object.assign({}, this.layers, {
          LayerTitle: "QRT",
          LayerType: "Vector",
          ApplyClustering: "No",
          Source: qrt_location,
          SourceType: "GeoJSON",
          Style: { type: "image", source: "./assets/sensor-icons/QRT-42px.svg", scale: 0.65 },
          zIndex: 7,
          Popup: "No",
          opacity: "Yes"
        })
      );
      if (!this.commonService.getLocalStorage("userInfo")) {
        this.themeSelection("default");
      } else {
        const getSignedInData = this.commonService.getDecryptedUserData();
        const userInfo = getSignedInData ? JSON.parse(getSignedInData) : false;
        const theme = userInfo && userInfo.theme ? userInfo.theme : "dark";
        const selected_font =
          userInfo && userInfo.selected_font
            ? userInfo.selected_font
            : "Medium";
        this.themeSelection(theme);
        this.changeMaskedAreaTheme(theme);
        this.changeIconScale(selected_font);
      }

      this.commonService.watchStorage().subscribe((data: string) => {
        // this will call whenever your localStorage data changes
        const getSignedInData = this.commonService.getDecryptedUserData();
        const userInfo = getSignedInData ? JSON.parse(getSignedInData) : false;
        const theme = userInfo && userInfo.theme ? userInfo.theme : "dark";
        const selected_font =
          userInfo && userInfo.selected_font
            ? userInfo.selected_font
            : "Medium";
        const event = {
          target: {
            checked: true,
            value: theme,
          },
        };
        this.themeSelection(event);
        this.changeMaskedAreaTheme(theme);
        this.changeIconScale(selected_font);
      });
      this.popup = new Overlay({
        element: <HTMLDivElement>document.getElementById("popup"),
        stopEvent: true,
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        },
      });

      this.olmap.getViewport().addEventListener("click", (evt) => {
        // this.updateOpacity();
        if (this.isSlewPopupEnabled) {
          if (!this.enableUAVModal && !this.enableVideo) {
            this.popup.setPosition(undefined);
            this.isSlewPopupEnabled = false;
            this.enableUAVModal = false;
            this.enableVideo = false;
          }
        }
        else if (this.isCameraPopupEnabled) {
          this.popup.setPosition(undefined);
          this.isCameraPopupEnabled = false;
        }
      });

      this.olmap.getViewport().addEventListener("contextmenu", (evt) => {
        evt.preventDefault();
        if (!this.isSlewPopupEnabled && !this.isCameraPopupEnabled) {
          this.overlayElement.nativeElement.innerHTML = "";
          this.olmap.removeOverlay(this.popup);
          let layername;
          let layers = this.olmap.getLayers().getArray();
          let feature = this.olmap.forEachFeatureAtPixel(
            this.olmap.getEventPixel(evt),
            function (feature, layer) {
              layername = layer && layer.get("title") ? layer.get("title") : "";
              return feature;
            }
          );
          if (feature && layername && layername.toLowerCase() !== "perimeter" && layername.toLowerCase() === "ti") {
            const camera_ip = feature.get("features")[0].getProperties().ip;
            const ti_location = feature.getGeometry().getCoordinates();
            layers.forEach((layer, i) => {
              if (i !== 0 && layer.values_.id !== "tileLayer") {
                if (layer.get("title") === layername) {
                  this.isSlewPopupEnabled = true;
                  // this.overlayElement.nativeElement.innerHTML =
                  //   `<p>` + evt.coordinate + `</p>`;
                  this.updateOpacity(true, feature);
                  this.popup.setPosition(this.olmap.getEventCoordinate(evt));
                  this.olmap.addOverlay(this.popup);
                  let popup = this.popup;
                  let closer = this.popupCloser.nativeElement;
                  if (closer.onclick === null) {
                    closer.onclick = function () {
                      popup.setPosition(undefined);
                      closer.blur();
                      this.updateOpacity(false, feature);
                      return false;
                    };
                  }
                }
              }
            });
            // setting the camera ip as globally
            this.ti_camera_ip = camera_ip;
            this.ti_location = ti_location;
            this.setPTZControls(camera_ip);
          }
          else if (feature && layername && layername.toLowerCase() !== "perimeter" && layername.toLowerCase() === "eoir") {
            const camera_ip = feature.get("features")[0].getProperties().ip;
            const eoir_location = feature.getGeometry().getCoordinates();
            layers.forEach((layer, i) => {
              if (i !== 0 && layer.values_.id !== "tileLayer") {
                if (layer.get("title") === layername) {
                  this.isCameraPopupEnabled = true;
                  // this.overlayElement.nativeElement.innerHTML =
                  //   `<p>` + evt.coordinate + `</p>`;
                  // this.updateOpacity(true, feature);
                  this.popup.setPosition(this.olmap.getEventCoordinate(evt));
                  this.olmap.addOverlay(this.popup);
                  let popup = this.popup;
                  let closer = this.popupCloser.nativeElement;
                  if (closer.onclick === null) {
                    closer.onclick = function () {
                      popup.setPosition(undefined);
                      closer.blur();
                      // this.updateOpacity(false, feature);
                      return false;
                    };
                  }
                }
              }
            });
            // setting the camera ip as globally
            this.eoir_camera_ip = camera_ip;
            this.eoir_location = eoir_location;
          }
        }
      });

      this.olmap.on("click", (evt) => {
        if (!self.isSlewPopupEnabled && !self.isCameraPopupEnabled) {
          let layername, featName;
          let allfeatures = this.olmap.getFeaturesAtPixel(evt.pixel);
          let pixelInfo = this.olmap.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
            let selectedFeature = feature;
            if (layer.get("opacity") == 0) {
              allfeatures.length && allfeatures.map((rec) => {
                let recFeatures = rec.get("features");
                let existingFeat = recFeatures && recFeatures.filter(
                  (feat) => feat.get("sensor_type") !== layer.get("title")
                );

                if (existingFeat && existingFeat.length) {
                  featName = existingFeat[0].get('sensor_type');
                  selectedFeature = rec;
                  return;
                }
              });
            }
            layername = layer && layer.get("title") && layer.get("opacity") !== 0 ? layer.get("title") : featName;
            self.removeCoverage();
            if (layername == "RADAR") {
              self.drawCoverage(selectedFeature);
            } else if (layername == "EOIR") {
              for (var fe = 0; fe < selectedFeature.get("features").length; fe++) {
                let base = 0,
                  coverage_range = null,
                  feature_props = selectedFeature.get("features")[fe].getProperties();
                if (parseInt(feature_props.ip.split(".")[3]) % 2 == 1) {
                  base = 23 / Math.tan(60); //65m -> Coverage : Effective Range
                  coverage_range = "long";
                } else if (parseInt(feature_props.ip.split(".")[3]) % 2 == 0) {
                  base = 65 / Math.tan(78); //23m -> Coverage : Effective Range
                  coverage_range = "short";
                }
                let sensor_location = selectedFeature.get("features")[fe].getGeometry().getCoordinates();
                let dest1 = turf.destination(sensor_location, -Math.abs(base / Math.sin(45) / 1000), 360 - (feature_props.azimuth - 45)).geometry.coordinates;
                let dest2 = turf.destination(sensor_location, -Math.abs(base / Math.sin(45) / 1000), feature_props.azimuth + 45).geometry.coordinates;
                var line = turf.lineString([sensor_location, dest1, dest2, sensor_location],
                  {
                    title: "camera_coverage_" + selectedFeature.get("features")[fe].getProperties().ip,
                  }
                );
                var polygon = turf.lineToPolygon(line);
                self.cameraCoverage(polygon, coverage_range);
              }
            }
            return { "feature": selectedFeature, "layer": layer };
          });

          if (pixelInfo) {
            let layer = pixelInfo.layer
            if (layer.values_.id !== "tileLayer") {
              if (layer.get("title") === layername && layer.get("options").Popup === "Yes") {
                this.setPopupData(layer.get("options"), pixelInfo.feature);
                this.popup.setPosition(evt.coordinate);
                this.olmap.addOverlay(this.popup);
                let popup = this.popup;
                let closer = this.popupCloser.nativeElement;
                if (closer.onclick === null) {
                  closer.onclick = function () {
                    popup.setPosition(undefined);
                    self.removeCoverage();
                    closer.blur();
                    return false;
                  };
                }
              }
            }
          }
        } else {
          if (!this.enableUAVModal) {
            let feature = this.olmap.forEachFeatureAtPixel(
              evt.pixel,
              function (feature, layer) {
                return feature;
              }
            );
            this.updateOpacity(false, false);
          }
        }
      });

      this.olmap.on("rendercomplete", (evt) => {
        this.getUpdatedLayers();
      });

      const unHighlightStyle = new Style({
        image: new CircleStyle({
          radius: 3,
          fill: new Fill({
            color: 'transparent'
          }),
          stroke: new Stroke({
            color: 'Yellow',
            width: 2
          })
        })
      });

      const highlightStyle = new Style({
        image: new CircleStyle({
          radius: 3,
          fill: new Fill({
            color: '#80c0e0'
          }),
          stroke: new Stroke({
            color: '#80c0e0',
            width: 2
          })
        })
      });

      this.mrolmap.on('singleclick', function (e) {
        self.mrolmap.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
          if (layer.get("title") !== "Perimeter" && layer.get("title") === "RNDF_Points") {
            const selIndex = self.selectedRoutePoints.indexOf(feature.getProperties().id);
            if (selIndex < 0) {
              self.selectedRoutePoints.push(feature.getProperties().id);
              feature.setStyle(highlightStyle);
            } else {
              self.selectedRoutePoints.splice(selIndex, 1);
              feature.setStyle(unHighlightStyle);
            }
          }
        });
      });

    } else if (this.activeRouteUrl == "post-analysis") {
      if (!this.commonService.getLocalStorage("userInfo")) {
        this.themeSelection("default");
      } else {
        const getSignedInData = this.commonService.getDecryptedUserData();
        const userInfo = getSignedInData ? JSON.parse(getSignedInData) : false;
        const theme = userInfo && userInfo.theme ? userInfo.theme : "dark";
        this.themeSelection(theme);
      }
      this.getWatchStorage();
    } else if (this.activeRouteUrl == "diagnostics" || this.activeRouteUrl == "sensor") {
      // Check user has logged in/not
      if (!this.commonService.getDecryptedUserData()) {
        this.router.navigate(["/maps"]);
      }
      this.olmap.setTarget("diagnostics-map");
      this.getPerimeterCoordinates();
      if (!this.commonService.getLocalStorage("userInfo")) {
        this.themeSelection("default");
      } else {
        const getSignedInData = this.commonService.getDecryptedUserData();
        const userInfo = getSignedInData ? JSON.parse(getSignedInData) : false;
        const theme = userInfo && userInfo.theme ? userInfo.theme : "dark";
        this.themeSelection(theme);
      }
      this.getWatchStorage();

      this.popup = new Overlay({
        element: <HTMLDivElement>document.getElementById("da-popup"),
        stopEvent: true,
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        },
      });

      this.diagnosticsService.diagnosticsDataEmitter.subscribe((res) => {
        if (this.olmap) {
          const layers = [...this.olmap.getLayers().getArray()];
          if (res.type === "refresh") {
            layers.forEach((layer, i) => {
              if (layer.get("title") !== "Perimeter" && i !== 0) {
                this.olmap.removeLayer(layer);
              }
            });
            this.initializeDiagnosticMapComponent(res.data);
          } else {
            let getLayerData: any = {};
            layers.forEach((layer, i) => {
              if (layer.get("title") !== "Perimeter" && i !== 0 && layer.values_.id !== "tileLayer") {
                const source = layer.getSource();
                const features = source.getFeatures();
                features.filter((feature) => {
                  if (res.data[0].sensor_location.coordinates[0] === feature.getGeometry().getCoordinates()[0] && res.data[0].sensor_location.coordinates[1] === feature.getGeometry().getCoordinates()[1]) {
                    getLayerData = res.data[0];
                    this.olmap.removeLayer(layer);
                  }
                });
              }
            });
            // this.initializeMapComponent([getLayerData]);
          }
        } else {
          this.initializeDiagnosticMapComponent(res.data);
        }
      });

      if (this.activeRouteUrl == "sensor") {
        let self = this;
        this.olmap.on("singleclick", function (evt) {
          self.daOverlayElement.nativeElement.innerHTML = `<div> 
                                                              <p>Longitude: ${evt.coordinate[0]}</p>
                                                              <p>Latitude: ${evt.coordinate[1]}</p>
                                                              <p><button type="button" class="btn btn-sm btn-primary" (click)="${self.addToSensor(evt.coordinate)}">OK</button></p>
                                                         </div>`;
          self.popup.setPosition(evt.coordinate);
          self.olmap.addOverlay(self.popup);
          let popup = self.popup;
          let closer = self.daPopupCloser.nativeElement;
          if (closer.onclick === null) {
            closer.onclick = function (e) {
              popup.setPosition(undefined);
              closer.blur();
              e.preventDefault();
              return false;
            };
          }
        });
      }
      if (this.activeRouteUrl == "diagnostics") {
        let self = this;
        this.olmap.on("click", function (evt) {
          let feature = self.olmap.forEachFeatureAtPixel(
            evt.pixel,
            function (feature, layer) {
              let layername =
                layer && layer.get("title") ? layer.get("title") : "";
              if (layername == "Diagnostics") {
                self.daOverlayElement.nativeElement.innerHTML = ` <table class='table table-bordered table-sm'>
               <tr>
               <th>${self.getTranslationLang("longitude")}: </th>
               <td>${evt.coordinate[0]}</td>
               </tr>
               <tr>
               <th>${self.getTranslationLang("latitude")}: </th>
               <td> ${evt.coordinate[1]}</td>
               </tr>
               </table>`;
                self.popup.setPosition(evt.coordinate);
                self.olmap.addOverlay(self.popup);
                let popup = self.popup;
                let closer = self.daPopupCloser.nativeElement;
                if (closer.onclick === null) {
                  closer.onclick = function (e) {
                    popup.setPosition(undefined);
                    closer.blur();
                    e.preventDefault();
                    return false;
                  };
                }
              }
            }
          );
        });
      }
      this.getDiagnosticsData();
    }
    // else if (this.activeRouteUrl == "system-configuration") {
    // }
    var centerPosition = <HTMLElement>(
      document.getElementById("default-location")
    );
    centerPosition.addEventListener("click", function () {
      self.view.animate({
        center: self.mapParams.DefaultCenter,
        zoom: self.mapParams.DefaultZoom,
        duration: 2000,
      });
    });
  }

  loadSystemConfigurationMap(data) {
    let mapTarget = this.olmap.getTarget("system-config-map");
    if (!mapTarget) {
      this.olmap.setTarget("system-config-map");
    }
    const activeTheme = this.themeService.getActiveTheme();
    this.themeSelection(activeTheme.name);

    var iconFeature = new Feature({
      geometry: new Point([data.longitude, data.latitude]),
    });

    var iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 46],
        anchorXUnits: "fraction",
        anchorYUnits: "pixels",
        src: "./assets/Location.svg",
      }),
    });

    iconFeature.setStyle(iconStyle);

    var vectorSource = new VectorSource({
      features: [iconFeature],
    });

    var vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    this.olmap.addLayer(vectorLayer);
    return this.olmap;
  }

  // Get Staored Data
  getStoredData() {
    return this.commonService.getDecryptedUserData();
  }

  addToSensor(coordinates) {
    this.eventService.broadcastMessage("addcoords", coordinates);
  }

  initializeDiagnosticMapComponent(data) {
    this.sensorsData = data;
    if (data && data.length) {
      this.addDiagnosticSensors();
    }
  }

  getDiagnosticsData() {
    const diagnosticsData = [];
    this.diagnosticsService.getAllSensors().subscribe((sensors) => {
      if (!sensors.error) {
        this.diagnosticsService.getDiagnosticsData().subscribe((zones) => {
          if (!zones.error) {
            const filteredZonesData = zones.data;
            let result = filteredZonesData.map((senData) => senData.zone_id);
            let resultIp = filteredZonesData.map((senData) => senData.ip);

            sensors.data.forEach((element) => {
              if (
                resultIp.indexOf(element.ip) !== -1 &&
                result.indexOf(element.zone_id) !== -1 &&
                element.current_status === false
              ) {
                element.isAddOpacity = false;
                diagnosticsData.push(element);
              } else {
                element.isAddOpacity = true;
                diagnosticsData.push(element);
              }
            });

            this.initializeDiagnosticMapComponent(diagnosticsData);
          } else {
            console.log("zones.error", zones.error);
          }
        });
      }
    });
  }

  openModal(template) {
    this.modalRef = this.modalService.show(template, this.config);
  }

  smrPopupClose() {
    this.modalRef.hide();
    this.mrolmap.setTarget(undefined);
    this.eventService.broadcastMessage("smrpopup_close", true);
  }

  sendManualRoute(form: any) {
    form = Object.assign(form, { 
      waypoints: this.selectedRoutePoints,
      algo_type: this.selectedAlgoType 
    });

    let params = {
      ugv_id: form.robot_id.split("_")[0],
      ip_address: form.robot_id.split("_")[1],
      waypoints: this.selectedRoutePoints,
      algo_type: this.selectedAlgoType
    }

    if (form.route_type === "new_route") {
      this.dataService.saveUGVManualRoute(params).subscribe(
        (res: any) => {
          if (res && !res.error && !res.errorInfo) {
            console.log("success");
          }
        },
        (err) => {
          console.log(err);
        }
      );
    }

    this.dataService.addRobotToRos(form).subscribe(
      (res: any) => {
        if (res && !res.error && !res.errorInfo) {
          this.selectedRoutePoints = [];
          this.addedRobotsForManualRoute = [];
          this.selectedAlgoType = null;
          this.modalRef.hide();
          this.smrFormGroup.reset();
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  initializeMapComponent(filteredData) {
    let mapTarget = this.olmap.getTarget();
    if (!mapTarget) {
      const result = [];
      filteredData.forEach(
        (function (hash) {
          return function (a) {
            if (!hash[a.alarm_id]) {
              hash[a.alarm_id] = {
                alarm_id: a.alarm_id,
                alarmmsg_time: a.alarmmsg_time,
                alarm_type: a.alarm_type,
                event_id: a.event_id,
                camera_id: a.camera_id,
                location: a.location,
                sensors_triggered: a.sensors_triggered,
                zone_id: a.zone_id,
                alarm_priority: a.alarm_priority,
                alarm_events: [],
              };
              result.push(hash[a.alarm_id]);
            }
            hash[a.alarm_id].alarm_events.push({
              event_type: a.event_type,
              timeofevent: a.timeofevent,
              event_location: a.event_location,
            });
          };
        })(Object.create(null))
      );
      filteredData = result;
      this.alarmsData = filteredData;
      this.alarmDataService.setAlarms(this.alarmsData);
      this.olmap = new Map({
        target: null,
        view: new View({
          center: this.mapParams.DefaultCenter,
          zoom: this.mapParams.DefaultZoom,
          projection: this.mapParams.Projection,
        }),
      });

      this.themeSelection("default");
      this.getPerimeterCoordinates();
      this.olmap.setTarget("post-analysismap");
      this.popupInitialization();
      this.addPostAnalysisSensors();
      this.getAlarmRadarTracks();
    }
  }

  // Add Sensors on the map
  addDiagnosticSensors() {
    const iconsData = {
      img: [
        "EOIR-26px.svg",
        "AGU-26px.svg",
        "IFF-26px.svg",
        "RADAR-26px.svg",
        "TI-26px.svg",
        "UAV-26px.svg",
        "UGV-26px.svg",
      ],
      sensorName: ["EOIR", "AGU", "IFF", "RADAR", "TI", "UAV", "UGV"],
    };

    this.sensorsData.forEach((elem) => {
      if (elem && elem.sensor_type) {
        const iconFeature = new Feature({
          geometry: new Point(elem.sensor_location.coordinates),
          name: elem.sensor_type,
        });
        const icon: any = {
          anchor: [0.5, 46],
          anchorXUnits: "fraction",
          anchorYUnits: "pixels",
          scale: 0.9,
          src: !elem.isAddOpacity
            ? "./assets/icons/diagnostics/" +
            iconsData.img[iconsData.sensorName.indexOf(elem.sensor_type)]
            : "./assets/sensor-icons/" +
            iconsData.img[iconsData.sensorName.indexOf(elem.sensor_type)],
        };
        if (elem.isAddOpacity) {
          icon.opacity = 0.8;
        }

        const iconStyle = new Style({
          image: new Icon(icon),
        });

        iconFeature.setStyle(iconStyle);

        const vectorSource = new VectorSource({
          features: [iconFeature],
        });

        const vectorLayer = new VectorLayer({
          title: "Diagnostics",
          source: vectorSource,
        });

        this.olmap.addLayer(vectorLayer);
      }
    });
  }

  // Add Sensors on the map
  addPostAnalysisSensors() {
    this.alarmsData.forEach((elem) => {
      const wrapper: any = document.createElement("div");
      wrapper.setAttribute("id", elem.alarm_id);
      wrapper.setAttribute("class", elem.location.coordinates.toString());

      let alarmIcon = `Confirmatory-Alarm_42px.svg`;
      if (elem.alarm_type === 0 || elem.alarm_type === 2) {
        alarmIcon = `Early-Alarm_32px.svg`;
      }

      wrapper.innerHTML = `<div>
        <div class="post-analysis-alarm-id" id="alarm_id-${elem.alarm_id} style='width:20vw;hight:10vh'">
          <span style="float: right;cursor: pointer;" class="${elem.alarm_id}" id="close-popup">X</span>
          <span>Alarm ID: ${elem.alarm_id}</span>
        </div>
        <img class='acknowledgedAlarm' src="./assets/sensor-icons/${alarmIcon}" />
        </div>`;
      const marker = new Overlay({
        position: elem.location.coordinates,
        positioning: "center-center",
        element: wrapper,
      });
      console.log("alarm icon.........")
      let that = this;
      wrapper.onclick = function (e) {
        if (
          !e.target.outerHTML.includes("alarm_id") &&
          !(e.target.id === "close-popup")
        ) {
          const getAlarmData = that.alarmsData.find((data) => {
            return data.alarm_id === this.id;
          });
          that.enablePopup(getAlarmData);
        } else if (e.target.id === "close-popup") {
          e.target.parentElement.style.display = "none";
        }
      };
      if (this.olmap) {
        this.olmap.addOverlay(marker);
      }
    });
  }

  enablePopup(data) {
    const now = new Date(data.alarmmsg_time);
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    this.paOverlayElement.nativeElement.innerHTML = `<table>
      <tr>
        <td>Detected By: </td>
        <td>${data.sensors_triggered[0] ? data.sensors_triggered[0] : "NA"}</td>
      </tr>
      <tr>
        <td>Latitude: </td>
        <td>${data.location.coordinates[1]}</td>
      </tr>
      <tr>
        <td>Longtitude: </td>
        <td>${data.location.coordinates[0]}</td>
      </tr>
      <tr>
        <td>Time: </td>
        <td>${time}</td>
      </tr>
      <tr>
        <td>Date: </td>
        <td>${date}</td>
      </tr>
      <tr>
        <td>Zone ID: </td>
        <td>${data.zone_id ? data.zone_id : "NA"}</td>
      </tr>
      </table>
      `;

    if (data.location) {
      this.popup.setPosition(data.location.coordinates);
    }
    if (this.olmap) {
      this.olmap.addOverlay(this.popup);
    }
    let popup = this.popup;
    let closer = this.paPopupCloser.nativeElement;
    if (closer.onclick === null) {
      closer.onclick = function () {
        popup.setPosition(undefined);
        closer.blur();
        return false;
      };
    }
  }

  popupInitialization() {
    this.popup = new Overlay({
      element: <HTMLDivElement>document.getElementById("pa-popup"),
      stopEvent: false,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });
  }

  getWatchStorage() {
    this.commonService.watchStorage().subscribe((data: string) => {
      // this will call whenever your localStorage data changes
      const getSignedInData = this.commonService.getDecryptedUserData();
      const userInfo = getSignedInData ? JSON.parse(getSignedInData) : false;
      const theme = userInfo && userInfo.theme ? userInfo.theme : "dark";
      const event = {
        target: {
          checked: true,
          value: theme,
        },
      };
      this.themeSelection(event);
    });
  }

  getAlarmRadarTracks() {
    this.alarmService.getAlarmTailInfo().subscribe((result) => {
      if (result && result.data.length) {
        result.data.forEach((rec) => {
          if (rec.tail) {
            let trackObj = {
              type: "Feature",
              geometry: rec.tail,
            };
            var isExisted = false;
            var existedLayer = undefined;
            var existedLayerIndex = undefined;
            var layerlist = this.olmap.getLayers().getArray();
            for (let index = 0; index < layerlist.length; index++) {
              var layer = layerlist[index];

              if (index !== 0 && layer.values_.id !== "tileLayer") {
                if (
                  layer.values_ &&
                  layer.values_.title == "radartrack-" + rec.alarm_id
                ) {
                  isExisted = true;
                  existedLayer = layer;
                  existedLayerIndex = index;
                  break;
                }
              }
            }
            if (isExisted == false) {
              this.addLayerToMap(
                Object.assign({}, this.layers, {
                  LayerTitle: "radartrack-" + rec.alarm_id,
                  LayerType: "Vector",
                  Source: trackObj,
                  SourceType: "GeoJSON",
                  Style: {
                    color: "orange",
                    width: 1,
                    fill: "transparent",
                  },
                  zIndex: 5,
                  Popup: "No",
                })
              );
            } else {
              existedLayer
                .getSource()
                .getFeatures()[0]
                .getGeometry()
                .setCoordinates(rec.tail.coordinates);
            }
          }
        });
      }
    });
  }

  createTrackLayer(layer_name) {
    this.addLayerToMap(
      Object.assign({}, this.layers, {
        LayerTitle: layer_name,
        LayerType: "Vector",
        Style: { color: "#ff9500", width: 1, fill: "rgba(255,255,255,0)", type: "LineString" },
        zIndex: 1,
        Popup: "No",
      })
    );
  }

  getPerimeterCoordinates() {
    this.dataService.getPerimeterCoordinates({type: "Perimeter"}).subscribe((result: any) => {
      // console.log(result)
      this.addLayerToMap(
        Object.assign({}, this.layers, {
          LayerTitle: "Perimeter",
          LayerType: "Vector",
          Source: result,
          SourceType: "GeoJSON",
          Style: { color: "#00FFF6", width: 3, fill: "rgba(255,255,255,0)" },
          zIndex: 1,
          Popup: "No",
        })
      );
    });

    this.dataService.getPerimeterCoordinates({type: "Road"}).subscribe((result: any) => {
      this.addLayerToMap(
        Object.assign({}, this.layers, {
          LayerTitle: "Road",
          LayerType: "Vector",
          Source: result,
          SourceType: "GeoJSON",
          Style: { color: "red", width: 3, fill: "rgba(255,255,255,0)" },
          zIndex: 1,
          Popup: "No",
        })
      );
    });

    // console.log("border details", this.dataService.config.border_layer)
    // this.addLayerToMap( Object.assign({}, this.layers, {
    //   LayerTitle: "Border",
    //   LayerType: "Vector",
    //   ApplyClustering: "No",
    //   Source: this.dataService.config.border_layer,
    //   SourceType: "GeoJSON",
    //   Style: { color: "#00FFF6", width: 6, fill: "rgba(212, 66, 66, 0)", type: "Polygon" },
    //   zIndex: 3,
    //   Popup: "No"
    // }))

  }

  getPerimeterCoordinates1() {
    this.dataService.getPerimeterCoordinates({type: "Perimeter"}).subscribe((result: any) => {
      this.addLayerToMap1(
        Object.assign({}, this.layers, {
          LayerTitle: "Perimeter",
          LayerType: "Vector",
          Source: result,
          SourceType: "GeoJSON",
          Style: { color: "#00FFF6", width: 3, fill: "rgba(255,255,255,0)" },
          zIndex: 1,
          Popup: "No",
        })
      );
    });
  }

  getSensorCoordinates() {
    var sensor_types = this.commonService.apiConfig.sensor_types
    const updateList = [];
    sensor_types.forEach((element) => {
      this.dataService.getSensorCoordinates(element.sensor_type).subscribe(
        (result: any) => {
          updateList.push(element);
          if (element.sensor_type === "LF") {
            let LFCoordinates = {
              points: [],
              options: [],
            };
            result.features.forEach((element) => {
              let properties = element.properties;
              LFCoordinates.points.push(element.geometry.coordinates);
              LFCoordinates.options.push(properties);
            });
            const geoJson = CustomGeoJson.parse(LFCoordinates, {
              LineString: "points",
            });

            this.addLayerToMap(
              Object.assign({}, this.layers, {
                LayerTitle: element.sensor_type,
                LayerType: "Vector",
                ApplyClustering: "No",
                Source: geoJson,
                SourceType: "GeoJSON",
                Style: {
                  iconWithStyle: "Yes",
                  color: "#F0C419",
                  width: 2,
                  type: element.type,
                  source: element.source,
                },
                zIndex: 3,
                Popup: "No",
              })
            );
          } else {
            this.addLayerToMap(
              Object.assign({}, this.layers, {
                LayerTitle: element.sensor_type,
                LayerType: "Vector",
                ApplyClustering: "Yes",
                Source: result,
                SourceType: "GeoJSON",
                Style: { type: element.type, source: element.source },
                zIndex: 4,
                Popup: "Yes",
                PopupDataFields: [
                  "Latitude",
                  "Longitude",
                  "Sensor Type",
                  "Zone ID",
                  "Sensor_ID",
                ],
                PopupData: [
                  "latitude",
                  "longitude",
                  "sensor_type",
                  "zone_id",
                  "sensor_id",
                ],
              })
            );
          }
          this.sendLayersList(updateList, sensor_types);
        },
        (err) => {
          updateList.push(element);
          this.sendLayersList(updateList, sensor_types);
        }
      );
    });
  }

  getUgvsUavs() {
    var types = this.commonService.apiConfig.types;
    const getUAVUGVList = [];
    types.forEach((element) => {
      // console.log("source is ", element.source)
      this.dataService.getGeoJsonInfo(element.sensor_type).subscribe(
        (result: any) => {
          if (element.sensor_type === "ugv") {
            this.eventService.broadcastMessage("UGV", result.data.features);
          }
          if (element.sensor_type === "uav") {
            this.eventService.broadcastMessage("UAV", result.data.features);
            this.addLayerToMap(
              Object.assign({}, this.layers, {
                LayerTitle: element.sensor_type,
                LayerType: "Vector",
                ApplyClustering: "Yes",
                Source: result.data,
                SourceType: "GeoJSON",
                Style: { type: element.type, source: element.source },
                zIndex: 4,
                Popup: "Yes",
                PopupDataFields: [
                  "Latitude",
                  "Longitude",
                  "Sensor Type",
                  "Zone ID",
                ],
                PopupData: ["latitude", "longitude", "sensor_type", "zone_id"],
              })
            );
            // let source = new VectorSource({
            //   format: new GeoJSON(),
            // })
            // this.addLayerToMap(
            //   Object.assign({}, this.layers, {
            //     LayerTitle: "UAV_Tracks",
            //     LayerType: "Vector",
            //     ApplyClustering: "Yes",
            //     Source: source,
            //     SourceType: "GeoJSON",
            //     Style: { type: "LineString", source: element.source },
            //     zIndex: 5,
            //   })
            // );
            getUAVUGVList.push(result);
            this.sendLayersList(getUAVUGVList, types);
          }
        },
        (err) => {
          // console.log(err);
          getUAVUGVList.push(err);
          this.sendLayersList(getUAVUGVList, types);
        }
      );
    });

  }

  getZoneCoordinates(reload = null) {
    if (reload === true) {
      this.olmap
        .getLayers()
        .getArray()
        .filter((layer, i) => {
          if (i !== 0 && layer.values_.id !== "tileLayer") {
            if (
              layer.get("title") === "Unmasked Zones" ||
              layer.get("title") === "Masked Zones"
            ) {
              this.olmap.removeLayer(layer);
            }
          }
        });
    }
    this.dataService.getZoneCoordinates().subscribe((result: any) => {
      if (result && result.data.length > 0) {
        result.data.forEach((element) => {
          if (element.zone_priority) {
            this.addLayerToMap(
              Object.assign({}, this.layers, {
                LayerTitle: "Unmasked Zones",
                LayerType: "Vector",
                Source: element.geojson,
                SourceType: "GeoJSON",
                Style: {
                  color: "#656565",
                  width: 2,
                  fill: "rgba(255,255,255,0)",
                  linedash: [3, 6],
                  masked_zone: "No",
                },
                zIndex: 2,
                Popup: "No",
              })
            );
          } else {
            const activeTheme = this.themeService.getActiveTheme();
            const color =
              activeTheme && activeTheme.name === "light"
                ? "rgba(255,255,255,1)"
                : "rgba(39,39,39,1)";
            this.addLayerToMap(
              Object.assign({}, this.layers, {
                LayerTitle: "Masked Zones",
                LayerType: "Vector",
                Source: element.geojson,
                SourceType: "GeoJSON",
                Style: {
                  color: "#656565",
                  width: 1,
                  maskfill: color,
                  linedash: [3, 6],
                  masked_zone: "Yes",
                },
                zIndex: 98,
                Popup: "No",
              })
            );
          }
        });


      }
    });
  }

  setZoneCoordinates(zonedata) {
    var data = {
      zone_type: "User Defined",
      zone_shape: zonedata.zone_shape,
      zone_center: zonedata.zone_center ? zonedata.zone_center : null,
      zone_radius: zonedata.zone_radius ? zonedata.zone_radius : null,
      zone_area: zonedata.coordinates ? zonedata.coordinates : null,
      zone_priority: zonedata.masktype,
      current_status: 1,
    };
    this.dataService.setZoneCoordinates(data).subscribe((result: any) => {
      this.getZoneCoordinates(true);
    });
  }

  // Publish Layers List
  sendLayersList(updateList, sensorTypes): void {
    this.getUpdatedLayers()
    if (updateList.length === sensorTypes.length) {
      this.dataService.publishMapLayers(this.clonedLayers);
    }
  }

  duration = 3000;
  coverageAreaLayer = [];
  coverageAreaSource;
  drawpolygon;
  drawpolygonLayer;

  
  generateSector(lat, lon, azimuth, range){
    // Turf.js to create a sector polygon
    const startPoint = turf.point([lon, lat]);
    let circle = turf.circle(startPoint, range, {
      units: "kilometers",
      steps: 64, // More steps = smoother curve
    });

    // const sectorPolygon = turf.booleanWithin(startPoint, sector)
    //   ? sector.geometry.coordinates[0]
    //   : sector.geometry.coordinates;

    // Adjust the sector for the given azimuth
    // console.log(sectorPolygon)
    // const sectorAdjusted = turf.transformRotate(sectorPolygon, azimuth);

    const startAngle = azimuth - 30;  // 30° to the left of the azimuth
    const endAngle = azimuth + 30;    // 30° to the right of the azimuth
    const points = circle.geometry.coordinates[0]
    let finalSec = []
    finalSec.push([lon,lat])
    let point_found = 0
    for (let index = 0; index < points.length; index++) {
      const point = points[index];
      const angle = turf.bearing(startPoint, turf.point(point));
      console.log(angle, startAngle, endAngle, Math.abs(angle - startAngle))
      if(Math.abs(angle - startAngle) < -2 && !point_found)
      {
        console.log("matched")
        finalSec.push(point)
        finalSec.push([lon,lat])
        point_found = 1
      }
      
      if (angle > startAngle && angle < endAngle)
      {
        finalSec.push(point)
      }
    }
    // finalSec.pop()
    // finalSec.push([lon,lat])
   
    // console.log(finalSec, [lat,lon])
    // Generate a polygon by clipping the circle into a sector
    const sector = turf.polygon(
      [finalSec]
    );
    const olFeature = new Feature({
      geometry: new Polygon(sector.geometry.coordinates),
    });

    return olFeature;
  }
  drawCoverage(feature) {
    var center = feature.getGeometry().flatCoordinates;
    if (this.coverageAreaLayer.length == 0) {
      // const props = feature.values_.features[0].values_
      // console.log(center)
      // props.azimuth
      const sectorCoverage = this.generateSector(center[1], center[0], 10, 1);
      this.coverageAreaSource = new VectorSource({ features: [sectorCoverage] });
      let layer = new VectorLayer({
        title: 'RadarCoverageArea',
        source: this.coverageAreaSource,
        style: new Style({
          fill: new Fill({
            color: "rgba(255, 0, 0, 0.3)", // Red color with some transparency
          }),
          stroke: new Stroke({
            color: "red",
            width: 2,
          }),
        }),
      });
      layer.setZIndex(3);
      this.olmap.addLayer(layer);
      this.coverageAreaLayer.push(layer);
    }
    // this.coverageAreaSource.addFeature(
    //   new Feature(new Circle(center, 0.009729))
    // );
  }

  cameraCoverage(geojson, coverage_range) {
    var coverageVector = new VectorLayer({
      title: 'CameraCoverageArea',
      source: new VectorSource({
        features: new GeoJSON().readFeatures(geojson),
      }),
      style: new Style({
        stroke: new Stroke({
          color: coverage_range == "long" ? "#00FFF6" : "rgba(90, 129, 255, 1)",
          width: 1,
        }),
        fill: new Fill({
          color: "rgba(150, 150, 255, 0.2)",
        }),
      }),
    });
    this.coverageAreaLayer.push(coverageVector);
    this.olmap.addLayer(coverageVector);
  }

  changeMaskType(evt) {
    if (evt.target.value != "None") {
      this.isMaskTypeSelected = true;
    } else {
      this.isMaskTypeSelected = false;
    }
  }

  addInteractions() {
    var draw, modify, select; // global so we can remove them later
    var map = this.olmap;
    let maskType = this.maskType.nativeElement;
    let geometryType = this.selectedShape;
    let self = this;
    let zoneWithin = false;

    var source = new VectorSource({ wrapX: false });
    var vector = new VectorLayer({
      source: source,
      style: new Style({
        fill: new Fill({
          color: maskType.value === "1" ? "transparent" : "#656565",
        }),
        stroke: new Stroke({
          color: "#262626",
          width: 1,
          linedash: [3, 6],
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: "#262626",
          }),
        }),
      }),
    });
    map.addLayer(vector);

    var value = geometryType;
    if (value !== "None") {
      var geometryFunction;
      if (value === "Square") {
        value = "Circle";
        geometryFunction = createRegularPolygon(4);
      } else if (value === "Box") {
        value = "Circle";
        geometryFunction = createBox();
      } else if (value === "Star") {
        value = "Circle";
        geometryFunction = function (coordinates, geometry) {
          var center = coordinates[0];
          var last = coordinates[1];
          var dx = center[0] - last[0];
          var dy = center[1] - last[1];
          var radius = Math.sqrt(dx * dx + dy * dy);
          var rotation = Math.atan2(dy, dx);
          var newCoordinates = [];
          var numPoints = 12;
          for (var i = 0; i < numPoints; ++i) {
            var angle = rotation + (i * 2 * Math.PI) / numPoints;
            var fraction = i % 2 === 0 ? 1 : 0.5;
            var offsetX = radius * fraction * Math.cos(angle);
            var offsetY = radius * fraction * Math.sin(angle);
            newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
          }
          newCoordinates.push(newCoordinates[0].slice());
          if (!geometry) {
            geometry = new Polygon([newCoordinates]);
          } else {
            geometry.setCoordinates([newCoordinates]);
          }
          return geometry;
        };
      }

      draw = new Draw({
        source: source,
        type: value,
        geometryFunction: geometryFunction,
        stopClick: true,
      });
      map.addInteraction(draw);

      var formatGeoJSON = new GeoJSON();
      draw.on("drawend", function (e) {
        var feature = e.feature;
        // remove draw interaction:
        map.removeInteraction(draw);
        // Create a select interaction and add it to the map:
        select = new Select();
        map.addInteraction(select);
        // select feature:
        select.getFeatures().push(feature);
        // clone feature:
        var featureClone = feature.clone();
        if (featureClone.getGeometry().getType() === "Circle") {
          var center = featureClone.getGeometry().getCenter();
          var radius = featureClone.getGeometry().getRadius();

          var polygonFromCircle = fromCircle(new Circle(center, radius));
          var polygonGeometry = formatGeoJSON.writeGeometry(polygonFromCircle);
          var geojson = polygonGeometry;
          var coordinates = polygonFromCircle.getCoordinates();
        } else {
          var geojson = formatGeoJSON.writeFeature(featureClone);
          var coordinates = featureClone.getGeometry().getCoordinates();
        }

        zoneWithin = self.checkFeatureAccess(
          coordinates,
          "userDefinedZone",
          null
        );

        if (!zoneWithin) {
          self.olmap.removeLayer(vector);
          map.removeInteraction(select);
          let errMsg = self.getTranslationLang("please_choose_sensor");
          return self.toastr.error(errMsg);
        } else {
          // save or do whatever...
          // console.log(geojson);
          var zone_data = {
            masktype: maskType.value,
            zone_shape: geometryType,
            zone_center: center,
            zone_radius: radius,
            coordinates: coordinates,
            geojson: geojson,
          };

          self.setZoneCoordinates(zone_data);
          map.removeInteraction(select);
        }

        // Create a modify interaction and add to the map:
        /* modify = new Modify({ features: select.getFeatures() });
        map.addInteraction(modify);
    
        // set listener on "modifyend":
        modify.on('modifyend', function (evt) {
          // get features:
          var collection = evt.features;
          // There's only one feature, so get the first and only one:
          var featureClone = collection.item(0).clone();
          var geojson = formatGeoJSON.writeFeature(featureClone);
          var coordinates = featureClone.getGeometry().getCoordinates();
          // save or do whatever...       
          console.log(geojson);
        }); */
      });
    }
  }

  checkFeatureAccess(coordinates, keyType, zoneData) {
    let returnValue = false;

    this.olmap
      .getLayers()
      .getArray()
      .filter((layer, i) => {
        if (layer.get("title") === "EOIR" || layer.get("title") === "TI" || layer.get("title") === "RADAR") {
          layer
            .getSource()
            .getFeatures()
            .filter((layerfeature) => {
              let vectorfeature = layerfeature.getProperties();
              if (keyType == "userDefinedZone" && coordinates) {
                let elem = vectorfeature.geometry.flatCoordinates;
                const pt = turf.point(elem);
                const poly = turf.polygon(coordinates);
                if (turf.booleanWithin(pt, poly)) {
                  returnValue = true;
                  return returnValue;
                }
              }
            });
        }

        if (layer.get("title") === "Unmasked Zones") {
          layer
            .getSource()
            .getFeatures()
            .filter((layerfeature) => {
              let vectorfeature = layerfeature.getProperties();
              if (
                keyType == "toggleZone" &&
                vectorfeature.zone_area == zoneData.zone_area
              ) {
                vectorfeature.current_status = zoneData.current_status;
                if (!vectorfeature.current_status) {
                  var style = new Style({
                    fill: new Fill({
                      color: "transparent",
                      opacity: 0,
                    }),
                  });
                  return layerfeature.setStyle(style);
                } else if (vectorfeature.current_status) {
                  let color;
                  if (zoneData.zone_priority === 1) {
                    color = "rgba(255,255,255,0)";
                  } else {
                    const activeTheme = this.themeService.getActiveTheme();
                    color =
                      activeTheme && activeTheme.name === "light"
                        ? "rgba(255,255,255,1)"
                        : "rgba(39,39,39,1)";
                  }
                  var style = new Style({
                    stroke: new Stroke({
                      color: "#656565",
                      width: 1,
                      lineDash: [3, 4],
                    }),
                    fill: new Fill({
                      color: color,
                    }),
                  });
                  return layerfeature.setStyle(style);
                }
              }
            });
        }
      });
    return returnValue;
  }

  themeSelection($event = null) {
    this.olmap.getLayers().forEach((layer) => {
      if (
        layer &&
        layer.get("id") &&
        (layer.get("id") == 1 || layer.get("id") == 2)
      ) {
        this.olmap.removeLayer(layer);
      }
    });
    if ($event === "default" || $event?.target?.checked) {
      if ($event?.target?.checked) this.mapParams.Theme = $event?.target?.value;
      let url = undefined;
      // url: 'http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      if (this.mapParams.Theme === "dark") {
        // url =
        //   this.dataService.config.LOCAL_MAP_URL +
        //   "/styles/dark-matter/{z}/{x}/{y}.png";
        // url = 'http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
        url = 'http://192.168.2.146:6090/tile/{z}/{x}/{y}.png';
      } else if (this.mapParams.Theme === "light") {
        // url =
        //   this.dataService.config.LOCAL_MAP_URL +
        //   "/styles/osm-bright/{z}/{x}/{y}.png";
          url = 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
      } if (this.mapParams.Theme === "satellite") {
        // url =
          // this.dataService.config.LOCAL_SAT_MAP_URL +
          // "/wmts/gm_layer/gm_grid/{z}/{x}/{y}.png";
          url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      }

      // url =
      // this.dataService.config.LOCAL_SAT_MAP_URL +
      // "/wmts/gm_layer/gm_grid/{z}/{x}/{y}.png";
      // url = 'http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
      url = 'http://192.168.2.146:6090/tile/{z}/{x}/{y}.png';
      
      if (url != undefined) {
        this.mapParams.satelliteThemeChecked = false;
        this.olmap.addLayer(
          new TileLayer({
            id: 1,
            source: new XYZ({
              attributions: "",
              url: url,
              crossOrigin: "anonymous",
            }),
            zIndex: -1,
          })
        );
        this.olmap.getView().setMinZoom(this.mapParams.MinZoom);
      }
    } else if (!$event?.target?.checked) {
      const activeTheme = this.themeService.getActiveTheme();
      const event = {
        target: {
          checked: true,
          value: activeTheme.name,
        },
      };
      this.themeSelection(event);
    }
  }

  mapThemeSelection($event = null) {
    this.mrolmap.getLayers().forEach((layer) => {
      if (
        layer &&
        layer.get("id") &&
        (layer.get("id") == 1 || layer.get("id") == 2)
      ) {
        this.mrolmap.removeLayer(layer);
      }
    });
    if ($event === "default" || $event?.target?.checked) {
      if ($event?.target?.checked) this.mapParams.Theme = $event?.target?.value;

      // url: 'http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      // let url =
      //     this.dataService.config.LOCAL_SAT_MAP_URL +
      //     "/wmts/gm_layer/gm_grid/{z}/{x}/{y}.png";
      // let url = 'http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
      let url = 'http://192.168.2.146:6090/tile/{z}/{x}/{y}.png'
      if (this.mapParams.Theme === "dark") {
        url =
          this.dataService.config.LOCAL_MAP_URL +
          "/styles/dark-matter/{z}/{x}/{y}.png";
        url =
          this.dataService.config.LOCAL_SAT_MAP_URL +
          "/wmts/gm_layer/gm_grid/{z}/{x}/{y}.png";
      } else if (this.mapParams.Theme === "light") {
        // url =
        //   this.dataService.config.LOCAL_MAP_URL +
        //   "/styles/osm-bright/{z}/{x}/{y}.png";
        url = 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
      } if (this.mapParams.Theme === "satellite") {
        // url =
        //   this.dataService.config.LOCAL_SAT_MAP_URL +
        //   "/wmts/gm_layer/gm_grid/{z}/{x}/{y}.png";
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      }
      
      if (url != undefined) {
        // this.mapParams.satelliteThemeChecked = false;
        this.mrolmap.addLayer(
          new TileLayer({
            id: 1,
            source: new XYZ({
              attributions: "",
              url: url,
              crossOrigin: "anonymous",
            }),
            zIndex: -1,
          })
        );
        this.mrolmap.getView().setMinZoom(this.mapParams.MinZoom);
      }
    } else if (!$event?.target?.checked) {
      const activeTheme = this.themeService.getActiveTheme();
      const event = {
        target: {
          checked: true,
          value: activeTheme.name,
        },
      };
      this.mapThemeSelection(event);
    }
  }

  setPopupData(layer, feature) {
    var tableHtml = "";
    if (typeof feature.get("features") === "undefined") {
      tableHtml +=
        "<table class='table table-bordered table-sm'><tr><td>Unable to fetch</td></tr></table>";
    } else {
      var cfeatures = feature.get("features");
      let data = layer.PopupData;
      let fields = this.getPopupDataFields(layer.PopupDataFields);
      tableHtml += "<table class='table table-bordered table-sm'>";
      for (var i = 0; i < data.length; i++) {
        tableHtml += "<tr>";
        tableHtml += "<th>" + fields[i] + ": &nbsp;" + "</th>";
        if (cfeatures.length > 1) {
          for (var fe = 0; fe < cfeatures.length; fe++) {
            if (data[i] === "latitude" || data[i] === "longitude") {
              var coordinates = cfeatures[fe].getGeometry().getCoordinates();
              var tdData =
                data[i] === "latitude" ? coordinates[1] : coordinates[0];
              tableHtml += "<td  class='tdCls'>" + tdData + "</td>";
            } else {
              var tdData = cfeatures[fe].get(data[i])
                ? cfeatures[fe].get(data[i])
                : "--";
              tableHtml += "<td class='tdCls'>" + tdData + "</td>";
            }
          }
        }
        if (cfeatures.length == 1) {
          if (data[i] === "latitude" || data[i] === "longitude") {
            var coordinates = cfeatures[0].getGeometry().getCoordinates();
            var tdData =
              data[i] === "latitude" ? coordinates[1] : coordinates[0];
            tableHtml += "<td>" + tdData + "</td>";
          } else {
            var tdData = cfeatures[0].get(data[i])
              ? cfeatures[0].get(data[i])
              : "--";
            tableHtml += "<td>" + tdData + "</td>";
          }
        }
        tableHtml += "</tr>";
      }
      tableHtml += "</table>";
      this.overlayElement.nativeElement.innerHTML = tableHtml;
    }
  }

  // Get Alarm Data
   getServerData(): void {
    // Subscribe Alarm Data
    // isTrackReceived = false
    this.alarmSubscription = this.alarmService
      .getServerPushData()
      .subscribe((results) => {
        // console.log(results)
        if (results && results.category === "uav_status") {
          let layer = this.findLayer("uav_tracks")
          if (layer) {
            const features = layer.getSource().getFeatures();
            let feature = features.find((feature) => {
              if (feature.getProperties().ip === results.gJson.properties.ip) {
                feature.getGeometry().setCoordinates(results.gJson.geometry.coordinates);
                return true
              }
            });
            if (!feature) {
              this.createFeatureOnGeoJSON(layer, results)
            }
          }
        } else if (results && results.category === "ugvpath") {
          if (results) {
            let layer = this.findLayer("ugvpath");
            if (layer) {
              const features = layer.getSource().getFeatures();
              let feature = features.find((feature) => {
                if (feature.getProperties().ip === results.gJson.properties.ip) {
                  feature.getGeometry().setCoordinates(results.gJson.geometry.coordinates);
                  return true
                }
              });
              if (!feature) {
                this.createFeatureOnGeoJSON(layer, results)
              }
            } else {
              var track = this.createLayer(results.gJson, "ugvpath");
              this.addLayerToMap(track);
            }
          }
        } else if (results && results.category === "qrt_location") {
          if (results) {
            let layer = this.findLayer("QRT");
            if (layer) {
              const features = layer.getSource().getFeatures();
              features.find((feature) => {
                if (feature.getProperties().category === "qrt_location") {
                  var style = new Style({
                    image: new Icon({
                      src: layer.get("options").Style.source,
                      scale: layer.get("options").Style.scale,
                      opacity: 1,
                    }),
                  });
                  feature.setStyle(style);
                  feature.getGeometry().setCoordinates(results.gJson.geometry.coordinates);
                  return true;
                }
              });
            } else {
              var track = this.createLayer(results.gJson, "qrt_location");
              this.addLayerToMap(track);
            }
          }
        } else if (results && results.category === "alarm") {
          if (results) {
            this.modeSubscription = this.commonService.publishModeData(
              results.mode
            );
            this.commonService.storeInLocalStorage("mode", results.mode, false);
            this.alarmService.publishAlarmSocketData({
              ...results,
              ...results.alarmData,
            });
            this.olmap
              .getOverlays()
              .getArray()
              .forEach((overlay) => {

                if (overlay.id === results.alarmData.alarm_id) {
                  try {
                    overlay.setPosition(results.alarmData.location.coordinates)
                  } catch {
                    console.log("error")
                  }
                }
              });
          }
        } 
        // else if (results && results.category === "radar_tracks") {
        //   let gJson = results.gJson
        //   this.tracksList.push(gJson);
        //   let layer = this.findLayer("radar_tracks");
        //   if (layer.get("options")) {
        //     if (layer) {
        //       let isFeaturePresent = false
        //       let features = layer.getSource().getFeatures()
        //       try {
        //         if (layer.getSource().getFeatures().length > 0) {
        //           for (let index = 0; index < features.length; index++) {
        //             const feature = features[index];
        //             if (feature.getId() == gJson.properties.id) {
        //               feature.getGeometry().setCoordinates(gJson.geometry.coordinates)
        //               isFeaturePresent = true
        //               break;
        //             }
        //           }
        //         }
        //         if (!isFeaturePresent) {
        //           let f = { "id": gJson.properties.id, "type": "Feature", "geometry": { "type": "LineString", "coordinates": gJson.geometry.coordinates }, "properties": { "id": gJson.properties.id, "current_status": true } };
        //           let geoJson = new GeoJSON();
        //           layer.getSource().addFeature(geoJson.readFeatureFromObject(f))
        //         }
        //       } catch (error) {
        //         console.log("error in adding the feature", error)
        //       }
        //     }
        //   }
        //   this.olmap.getOverlays().getArray().forEach(element => {
        //     if (element.id == gJson.properties.id) {
        //       element.setPosition(gJson.geometry.coordinates.pop())
        //     }
        //   });
        // } 
        else if (results && results.category === "radar_tracks") {
          const gJson = results.gJson;
          this.tracksList.push(gJson);
        
          const layer = this.findLayer("radar_tracks") as VectorLayer<any>;
        
          if (layer && layer.get("options")) {
            const features = layer.getSource().getFeatures();
            let isFeaturePresent = false;
        
            // Check if a feature with this id already exists and update it
            for (const feature of features) {
              if (feature.getId() == gJson.properties.id) {
                feature.getGeometry().setCoordinates(gJson.geometry.coordinates);
                isFeaturePresent = true;
                break;
              }
            }
        
            // Only add a new feature if it doesn't exist yet
            if (!isFeaturePresent) {
              const featureObject = {
                type: "Feature",
                id: gJson.properties.id,           // top-level id so GeoJSON sets feature ID
                geometry: {
                  type: "LineString",
                  coordinates: gJson.geometry.coordinates
                },
                properties: {
                  id: gJson.properties.id,
                  current_status: true
                }
              };
              const geoJsonFormat = new GeoJSON();
              const newFeature = geoJsonFormat.readFeature(featureObject, {
                featureProjection: 'EPSG:4326'
              });
              newFeature.setId(gJson.properties.id); // ensure ID is set for future lookups
              layer.getSource().addFeature(newFeature);
            }
          }
        
          // Only move the overlay that matches this track's id
          // this.olmap.getOverlays().getArray().forEach(overlay => {
          //   if (overlay.id == gJson.properties.id) {
          //     const coords = gJson.geometry.coordinates;
          //     overlay.setPosition(coords[coords.length - 1]);
          //   }
          // });

          this.olmap.getOverlays().getArray().forEach(overlay => {
            if (overlay.id == gJson.properties.id) {
              const coords = gJson.geometry.coordinates;
              const lastCoord = coords[coords.length - 1];
              console.log("gJson Properties: ",gJson.properties)
              // Update marker position
              overlay.setPosition(lastCoord);
          
              // Live update the label values
              const el = overlay.getElement();
              if (el) {
                const span = el.querySelector('.ca-alarm-id, .ca-ack-alarm-id, .ea-alarm-id');
                if (span) {
                  span.innerHTML = `
                    Track ID: ${gJson.properties.track_id ?? gJson.properties.id}<br/>
                    Lat: ${lastCoord[1]}<br/>
                    Lon: ${lastCoord[0]}
                  `;
                }
              }
            }
          });
        }   
         
        else if (results && results.category === "ugv_track") {
          let gJson = results.gJson
          this.tracksList.push(gJson);
          let layer = this.findLayer("ugv_tracks");
          if (layer) {
            const features = layer.getSource().getFeatures();
            let feature = features.find((feature) => {
              if (feature.getProperties().ip === results.gJson.properties.ip) {
                feature.getGeometry().setCoordinates(results.gJson.geometry.coordinates);
                return true
              }
            });
            if (!feature) {
              this.createFeatureOnGeoJSON(layer, results)
            }
          }
        }
        else {
          this.updateConfirmatoryEarlyWarning({
            ...results,
            ...results.alarmData,
          });
        }
      });

    // Get Cleared / Acknowledged Alarm
    this.alarmDataSubscription = this.alarmService.updatedAlarmData.subscribe(
      (results) => {
        if (results) {
          if (results && results[0] && results[0].isAssigmentEnabled) {
            this.getAssignedData = results;
          } else {
            if (
              results &&
              results.length === 1 &&
              results[0].event_type &&
              results[0].event_type === 1
            ) {
              this.audio.pause();
            }
            if (
              results &&
              results.length === 1 &&
              results[0].event_type &&
              results[0].event_type === 2
            ) {
              if (this.olmap.getOverlays().getArray().length) {
                this.removeOverlay(results, false);
              }
            } else {
              if (this.olmap.getOverlays().getArray().length) {
                this.removeOverlay(results, true);
              } else {
                this.addSensors(results);
              }
            }
          }
          //  this.removeAlarmFromMap({ zone_area: null }); // Remove alarm in disabled zones
        }
      }
    );
    // Get Cleared Early Alarms
    this.clearedAlarmSubscription =
      this.alarmService.clearedAlarmData.subscribe((results) => {
        if (results) {
          let self = this;
          let overlayIndexes = []
          if (results.type === "ea" || results.type === "ca") {
            {
              let overlays = this.olmap.getOverlays().getArray();
              for (let index = 0; index < overlays.length; index++) {
                const overlay = overlays[index];
                if (results.type == "ea" && overlay.options.type === 2) {
                  overlayIndexes.push(overlay); // push the early alarms
                } else if (results.type == "ca" && overlay.options.type === 1) {
                  overlayIndexes.push(overlay); // push the confirmatory alarms
                }
              }
              overlayIndexes.forEach((overlay) => {
                self.olmap.removeOverlay(overlay); // remove the alarms from overlays
              });
            }
          }
          if (results.type !== "ca") {
            let layer = this.findLayer("radar_tracks")
            let source = layer.getSource()
            let features = source.getFeatures().map((feature, key) => {
              return {
                alarm_id: feature.getProperties().alarm_id,
                track_length: feature.getGeometry().getCoordinates().length,
              };
            });
            this.alarmService
              .clearAlarmTracks({ intrusion_tracks: features })
              .subscribe(
                (res) => {
                  source.clear()
                },
                (err) => {
                  console.log("--- err --- ", err);
                }
              );
          }
        }
      });
  }


  findLayer(type) {
    let layers = this.olmap.getLayers().getArray();
    for (let index = 0; index < layers.length; index++) {
      const layer = layers[index];
      if (layer.get("title") != undefined && layer.get("title").indexOf(type) !== -1) {
        return layer;
      }
    }
    return
  }

  createFeatureOnGeoJSON(layer, results) {
    layer.getSource().addFeature(
      new Feature({
        geometry: new LineString(
          results.gJson.geometry.coordinates
        ),
        id: results.gJson.properties.id,
        type: results.gJson.properties.type,
        zone_id: results.gJson.properties.zone_id,
        ip: results.gJson.properties.ip,
      })
    );
  }

  createLayer(gJson, title) {
    return Object.assign({}, this.layers, {
      LayerTitle: title,
      LayerType: "Vector",
      Source: gJson,
      SourceType: "GeoJSON",
      Style: {
        color: "yellow",
        width: 1,
        fill: "transparent",
      },
      zIndex: 6,
      Popup: "No",
    });
  }

  removeOverlay(results, acknowledged) {
    this.olmap
      .getOverlays()
      .getArray()
      .forEach((overlay) => {
        if (overlay.id === results[0].alarm_id) {
          // Remove Acknowledged Alarm
          this.olmap.removeOverlay(overlay);
          if (acknowledged) {
            this.addSensors(results);
          } else {
            this.removeTrack(overlay.id);
          }
        }
      });
  }

  removeTrack(id) {
    let removableLayer = undefined;
    this.olmap
      .getLayers()
      .getArray()
      .forEach((layer) => {
        if (layer && layer.get("title") == "radartrack-" + id) {
          removableLayer = layer;
        }
      });
    if (removableLayer != undefined) {
      this.olmap.removeLayer(removableLayer);
    }
  }

  // Remove Alarm From Map When Zone has Disabled
  removeAlarmFromMap(item) {
    this.commonService.getDisabledAlarm(item.zone_area).subscribe((res) => {
      if (!res.error) {
        if (res.data.disabledAlarm && res.data.disabledAlarm.length) {
          this.olmap
            .getOverlays()
            .getArray()
            .forEach((overlay) => {
              for (let i = 0; i < res.data.disabledAlarm.length; i++) {
                if (res.data.disabledAlarm[i].alarm_id === overlay.id) {
                  // this.olmap.removeOverlay([overlay]);
                  this.olmap.removeOverlay(overlay);
                  // this.removeOverlay([overlay], false);
                }
              }
            });
        }
        if (
          res.data.addAlarm &&
          res.data.addAlarm.data &&
          res.data.addAlarm.data.length
        ) {
          // Add Event Type
          for (let i = 0; i < res.data.addAlarm.data.length; i++) {
            for (let j = 0; j < res.data.addAlarm.events.length; j++) {
              if (
                res.data.addAlarm.data[i].alarm_id ===
                res.data.addAlarm.events[j].alarm_id
              ) {
                res.data.addAlarm.data[i].event_type =
                  res.data.addAlarm.events[j].event_type;
              }
            }
          }
          this.addSensors({ data: res.data.addAlarm.data });
        }
      }
    });
  }

  playAlarmAudio(): void {
    this.audio.src = "../../../assets/audio/alarm.wav";
    this.audio.loop = true;
    this.audio.load();
    this.audio.play();
  }

  // Add Sensors
  addSensors(results, acknowledged?: Boolean): void {
    // console.log("adding again")
    var self = this;
    if (results) {
      if (results.data) {
        results = results.data;
      }
      const getNonExistingData = results.filter(
        ({ alarm_id: id1 }) =>
          !this.olmap
            .getOverlays()
            .getArray()
            .some(({ id: id2 }) => id2 === id1)
      );
      if (getNonExistingData.length) {
        getNonExistingData.forEach((element) => {
          element.id = element.id ? element.id : element.alarm_id;
          element.location =
            element.location && element.location.hasOwnProperty("coordinates")
              ? element.location
              : { coordinates: element.location };

          if (element.event_type != 2) {
            const wrapper: any = document.createElement("div");
            if (element.alarm_type === 2) {
              wrapper.innerHTML = this.alarmService.alarmDomContent(
                "early_alarm_icon",
                element.track_id ?? element.id, 
                element
              ).earlyAlarm;
            } else if (element.alarm_type === 1) {
              if (element.event_type === 0) {
                // console.log("==element iff===", element);

                if (element.iff_data && element.iff_data.is_iff) {
                  wrapper.innerHTML = this.alarmService.alarmDomContent(
                    "IFF-26px",
                    element.track_id ?? element.id, 
                    element
                  ).iff;
                }
                else {
                  wrapper.innerHTML = this.alarmService.alarmDomContent(
                    "Confirmatory-Alarm_42px",
                    element.track_id ?? element.id, 
                    element
                  ).unAcknowledged;
                }
              } else {
                wrapper.innerHTML = this.alarmService.alarmDomContent(
                  "Confirmatory-Alarm_42px",
                  element.track_id ?? element.id, 
                  element
                ).acknowledged;
              }
            }
            /* set translations alarm id */
            let alarmId = self.getTranslationLang("alarm_id");
            wrapper.innerHTML = wrapper.innerHTML.replaceAll(
              "Alarm ID",
              alarmId
            );
            const marker = new Overlay({
              position: element.location.coordinates[0]
                ? element.location.coordinates
                : element.location,
              positioning: "center-center",
              id: element.alarm_id,
              type: element.alarm_type,
              element: wrapper,
              stopEvent: false,
            });
            let that = this;
            wrapper.onclick = function (eRef) {
              const e: any = eRef;
              setTimeout(() => {
                if (e.target.className === "close-popup") {
                  e.target.parentElement.style.display = "none";
                }
              }, 100);
              // Popup with alarm property
              if (e.srcElement.id) {
                const getTypeZoneID = e.srcElement.alt.split("-");
                const getAlarmId = e.srcElement.id.split("-")[1];
                const getId = e.srcElement.id.split("-")[0].split(",");
                const getCategory = e.srcElement.cat;
                const getCordinates = [
                  parseFloat(getId[0]),
                  parseFloat(getId[1]),
                ];
                that.popup.setPosition(getCordinates);
                that.olmap.addOverlay(that.popup);
                let popup = that.popup;
                let closer = that.popupCloser.nativeElement;
                if (closer.onclick === null) {
                  closer.onclick = function () {
                    popup.setPosition(undefined);
                    closer.blur();
                    return false;
                  };
                }
                that.overlayElement.nativeElement.innerHTML = `
                  <table class="table table-sm table-bordered">
                    <tbody>
                      <tr>
                        <th>${self.getTranslationLang("latitude")}: </th>
                        <td>${getCordinates[1]}</td>
                      </tr>
                      <tr>
                        <th>${self.getTranslationLang("longitude")}: </th> 
                        <td>${getCordinates[0]}</td>
                      </tr>
                      <tr>
                        <th>${self.getTranslationLang("alarm_id")}: </th> 
                        <td>${getAlarmId}</td>
                      </tr>
                      <tr>
                        <th>${self.getTranslationLang("alarm_type")}: </th> 
                        <td>${getTypeZoneID[0]}</td>
                      </tr>
                      <tr>
                        <th>${self.getTranslationLang("zone_id")}: </th> 
                        <td>${getTypeZoneID[1]}</td>
                      </tr>
                      <tr>
                        <th>${self.getTranslationLang("category")}: </th> 
                        <td>${getCategory}</td>
                      </tr>
                    </tbody>
                  </table>                
                `;
              }
            };
            this.olmap.addOverlay(marker);
          }
        });
      }
    }
  }

  // Update Radar Track
  updateRadarTrack(): void {
    this.radarTrackSubscription = this.alarmService.updateRadarTrack.subscribe(
      (res) => {
        if (res) {
          this.olmap
            .getLayers()
            .getArray()
            .forEach((layer) => {
              if (layer.values_.title === res.data.id) {
                this.dataService.assignToResponse(res.data).subscribe(
                  (res: any) => { },
                  (err) => {
                    // this.toasterService.error('Error Occured. Please try later.');
                  }
                );
              }
            });
        }
      }
    );

    this.slewTISubscription = this.alarmService.receiveSlewTIEvent.subscribe(
      (res) => {
        if (res && !this.isSlewPopupEnabled) {
          this.overlayElement.nativeElement.innerHTML = "";
          this.olmap.removeOverlay(this.popup);

          const projWidth = getWidth(
            this.olmap.getView().getProjection().getExtent()
          );
          const lng = Math.round(res.ti_coordinates[0] / projWidth);
          const lat = Math.round(res.ti_coordinates[1] / projWidth);
          var coordinates = [
            res.ti_coordinates[0] + lng * projWidth,
            res.ti_coordinates[1] + lat * projWidth,
          ];

          let layername;
          let layers = this.olmap.getLayers().getArray();
          let feature = this.olmap.forEachFeatureAtPixel(
            this.olmap.getPixelFromCoordinate(coordinates),
            function (feature, layer) {
              layername = layer && layer.get("title") ? layer.get("title") : "";
              return feature;
            }
          );

          if (
            feature &&
            layername &&
            layername.toLowerCase() !== "perimeter" &&
            layername.toLowerCase() === "ti"
          ) {
            const camera_ip = feature.get("features")[0].getProperties().ip;
            // console.log("layer has found");
            layers.forEach((layer, i) => {
              if (i !== 0 && layer.values_.id !== "tileLayer") {
                if (layer.get("title") === layername) {
                  // this.setPopupData(layer, feature);
                  this.isSlewPopupEnabled = true;
                  this.enableUAVModal = true;

                  // this.overlayElement.nativeElement.innerHTML =
                  //   `<p>` + evt.coordinate + `</p>`;
                  this.updateOpacity(true, feature);
                  this.popup.setPosition(coordinates);
                  this.olmap.addOverlay(this.popup);
                  let popup = this.popup;
                  let closer = this.popupCloser.nativeElement;
                  if (closer.onclick === null) {
                    closer.onclick = function () {
                      popup.setPosition(undefined);
                      closer.blur();
                      this.updateOpacity(false, feature);
                      return false;
                    };
                  }
                }
              }
            });
            // setting the camera ip as globally
            this.ti_camera_ip = camera_ip;
            this.setPTZControls(camera_ip);
          }
        }
      }
    );
  }

  isFullScreen = false;
  // Allow video in full screen mode
  openFullscreen(type): void {
    const elem: any = (type === 'ti') ? document.getElementById("slew-ti-video") : document.getElementById("camera-video");
    this.isFullScreen = true;
    this.commonService.enableFullScreen(elem);
  }
  manualTrack(type): void {
    let body = {
      mode: "manual_lock"          // Add the IP to the body
    };
      this.dataService.doAutoTrack(body).subscribe(
        (res: any) => {
          if (res && !res.error && !res.errorInfo) {
            console.log(res);
          } else {
            console.log(res);
          }
        },
        (err) => {
          console.log(err);
        }
      );

  }

  cancelTrack(type): void {
    let body = {
      mode: "cancel"          // Add the IP to the body
    };
      this.dataService.doAutoTrack(body).subscribe(
        (res: any) => {
          if (res && !res.error && !res.errorInfo) {
            console.log(res);
          } else {
            console.log(res);
          }
        },
        (err) => {
          console.log(err);
        }
      );

  }
  displayRadarTrack: Boolean;

  // Place Alarms on the map
  updateConfirmatoryEarlyWarning(results): void {
    if (results && results.category == "map") {
      var gJson = results.gJson;
      var gJsonIp = gJson.properties.ip;
      var alarmType = gJson.properties.type;
      results.alarm_type = alarmType;
      results.event_type = 0;
      results.location = gJson.geometry.coordinates;
      results.alarm_id = gJson.properties.id;
      results.id = gJson.properties.id
        ? gJson.properties.id
        : gJson.properties.alarm_id;
      if (alarmType == 1) {
        this.playAlarmAudio();
      }
      this.addSensors([results], false);
    }
  } // end of funtion

  thisLayerExists = function (layer_name) {
    var layers = this.olmap.getLayers().getArray();
    var layer_;
    var found = layers.some(function (layer) {
      if (layer.get("title") === layer_name) {
        layer_ = layer;
        return true;
      } else {
        return false;
      }
    });
    if (found) {
      return layer_;
    } else {
      return false;
    }
  };

  removedLayersAlarmLayers = [];
  //removedLayersAlarmLayerIndexes = [];
  changeVisibility(): void {
    //console.log(event.target.checked,  this.olmap);
    var earlyLayerIndex = -1;
    this.dataService.alarmVisibility.subscribe((results) => {
      var overlays = this.olmap.getOverlays().getArray();
      // console.log(overlays);
      this.enableDisableLayers(results, overlays, "overlay");
    });
  }

  enableDisableLayers(results, sources, type) {
    if (results) {
      if (!results.target.checked) {
        if (sources) {
          for (var index = 0; index < sources.length; index++) {
            var src = sources[index];
            if (src.options && src.options.type == 2) {
              this.removedLayersAlarmLayers.push(src);
            } else {
              this.checkedLayers.push(src);
            }
          }
        }
        if (this.removedLayersAlarmLayers.length > 0 && type === "overlay") {
          for (
            var index = 0;
            index < this.removedLayersAlarmLayers.length;
            index++
          ) {
            this.olmap.removeOverlay(this.removedLayersAlarmLayers[index]);
          }
        } else if (this.checkedLayers.length > 0) {
          for (var index = 0; index < this.checkedLayers.length; index++) {
            this.olmap.removeLayer(this.checkedLayers[index]);
          }
        }
      } else {
        if (this.removedLayersAlarmLayers.length > 0 && type === "overlay") {
          for (
            var index = 0;
            index < this.removedLayersAlarmLayers.length;
            index++
          ) {
            this.olmap.addOverlay(this.removedLayersAlarmLayers[index]);
          }
        } else if (this.checkedLayers.length > 0) {
          for (var index = 0; index < this.checkedLayers.length; index++) {
            this.addLayerToMap(this.checkedLayers[index]);
          }
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.alarmSubscription) {
      this.alarmSubscription.unsubscribe();
    }
    if (this.alarmDataSubscription) {
      this.alarmDataSubscription.unsubscribe();
    }
    if (this.clearedAlarmSubscription) {
      this.clearedAlarmSubscription.unsubscribe();
    }
    if (this.radarTrackSubscription) {
      this.radarTrackSubscription.unsubscribe();
    }
    if (this.slewTISubscription) {
      this.slewTISubscription.unsubscribe();
    }
    if (this.modeSubscription) {
      this.modeSubscription.unsubscribe();
    }
    if (this.roleAuthSubscription) {
      this.roleAuthSubscription.unsubscribe();
    }
    this.olmap.setTarget(null);
  }

  onChkBoxChange(event, layer) {
    if (event.target.checked) {
      this.olmap
        .getLayers()
        .getArray()
        .filter((olLayer, i) => {
          if (i !== 0 && olLayer.values_.id !== "tileLayer") {
            if (olLayer.get("title") === layer.LayerTitle) {
              layer.checked = true;
              olLayer.setOpacity(1);
            }
          }
        });
    } else {
      this.olmap
        .getLayers()
        .getArray()
        .filter((olLayer, i) => {
          if (i !== 0 && olLayer.values_.id !== "tileLayer") {
            if (olLayer.get("title") === layer.LayerTitle) {
              layer.checked = false;
              olLayer.setOpacity(0);
            }
          }
        });
    }
  }

  onZoneChkBoxChange(event, zonelayer, zone, zoneindex, index) {
    if (event.target.checked) {
      this.olmap
        .getLayers()
        .getArray()
        .filter((layer, i) => {
          // console.log(layer.get("title"), zonelayer.LayerTitle)
          if (layer.get("title") === zonelayer.LayerTitle) {
            let zone_feature = layer
              .getSource()
              .getFeatures()
              .find(
                (feature) =>
                  feature.getProperties().zone_area ===
                  zone.properties.zone_area
              );
            if (zone_feature) {
              let color;
              if (zone.properties.zone_priority === 1) {
                color = "rgba(255,255,255,0)";
              } else {
                const activeTheme = this.themeService.getActiveTheme();
                color =
                  activeTheme && activeTheme.name === "light"
                    ? "rgba(255,255,255,1)"
                    : "rgba(39,39,39,1)";
              }
              var style = new Style({
                stroke: new Stroke({
                  color: "#656565",
                  width: 1,
                  lineDash: [3, 4],
                }),
                fill: new Fill({
                  color: color,
                }),
              });
              zone_feature.setStyle(style);
              this.zoneLayers[zoneindex].Source.features[
                index
              ].properties.checked = true;
            }
          }
        });
    } else {
      this.olmap
        .getLayers()
        .getArray()
        .filter((layer, i) => {
          if (layer.get("title") === zonelayer.LayerTitle) {
            let zone_feature = layer
              .getSource()
              .getFeatures()
              .find(
                (feature) =>
                  feature.getProperties().zone_area ===
                  zone.properties.zone_area
              );
            if (zone_feature) {
              var style = new Style({
                fill: new Fill({
                  color: "transparent",
                  opacity: 0,
                }),
              });
              zone_feature.setStyle(style);
              this.zoneLayers[zoneindex].Source.features[
                index
              ].properties.checked = false;
            }
          }
        });
    }
  }

  getZoneFeature(zonelayer) {
    return zonelayer.Source.features && zonelayer.Source.features.length > 0
      ? zonelayer.Source.features
      : [];
  }

  clickedShape(event, shape) {
    this.selectedShape = shape;
  }

  cancel(popover: any) {
    this.maskType.nativeElement.value = "None";
    this.isMaskTypeSelected = false;
    this.selectedShape = "";
    popover.hide();
  }

  show(popover: any) {
    this.isMaskTypeSelected = false;
    this.selectedShape = "";
    popover.show();
  }

  drawZone(popover: any) {
    popover.hide();
    this.addInteractions();
  }

  changeStatus(event = null, item) {
    let data,
      self = this;
    if (event !== null) {
      data = { zone_id: item.zone_area, status: event.target.checked };
    } else {
      data = { zone_id: item.zone_area, status: 2 }; // 2 for disable
    }
    this.dataService.enableDisableZone(data).subscribe((res) => {
      data;
      item.current_status = !item.current_status;
      if (!res.error && !res.errorInfo) {
        this.removeAlarmFromMap(item); // Remove alarm in disabled zones
        // // Todo check features and removed zone feature based on selected id
        // this.olmap.getLayers().getArray().filter((layer, i) => {
        //   if (i !== 0 && layer.values_.id !== 'tileLayer') {
        //     const source = layer.getSource();
        //     const features = source.getFeatures();
        //   }
        // });
        self.checkFeatureAccess(null, "toggleZone", item);
      }
    });
  }

  changeMaskedAreaTheme(theme) {
    this.olmap
      .getLayers()
      .getArray()
      .filter((layer, i) => {
        if (layer.get("title") === "Masked Zones") {
          let zone_feature = layer
            .getSource()
            .getFeatures()
            .find((feature) => feature.getProperties().zone_priority === 0);
          if (zone_feature) {
            var style = new Style({
              stroke: new Stroke({
                color: "#656565",
                width: 1,
                lineDash: [3, 4],
              }),
              fill: new Fill({
                color:
                  theme && theme === "light"
                    ? "rgba(255,255,255,1)"
                    : "rgba(39,39,39,1)",
              }),
            });
            zone_feature.setStyle(style);
          }
        }
      });
  }

  changeIconScale(value) {
    this.olmap
      .getLayers()
      .getArray()
      .filter((layer, i) => {
        if (i !== 0 && layer.values_.id !== "tileLayer") {
          if (
            layer.get("title") !== "LF" &&
            layer.get("title") !== "RNDF" &&
            (layer.get("zIndex") === 3 || layer.get("zIndex") === 4)
          ) {
            var style = new Style({
              image: new Icon({
                src: layer.get("options").Style.source,
                scale: this.getIconScale(value),
              }),
            });
            layer.setStyle(style);
          }
        }
      });
  }

  getIconScale(value): number {
    let scale = null;
    switch (value) {
      case "Small":
        scale = 0.8;
        break;
      case "Medium":
        scale = 1;
        break;
      case "Large":
        scale = 1.2;
        break;
      default:
        scale = 1;
        break;
    }
    return scale;
  }

  checkAuthendication() {
    // Subscribe Signin Details
    this.roleAuthSubscription =
      this.commonService.getRoleAuthentication.subscribe((res) => {
        this.signedInUserInfo = res;
      });
    const getSignedInData = this.commonService.getDecryptedUserData();
    if (
      getSignedInData &&
      JSON.parse(getSignedInData) &&
      JSON.parse(getSignedInData).role
    ) {
      this.signedInUserInfo = {
        role: JSON.parse(getSignedInData).role,
        isSignedIn: true,
      };
    }
  }

  updateOpacity(isAddOpacity, selectedFeature) {
    if (selectedFeature) {
      this.applyOpacityFeature = selectedFeature;
    }
    const that = this;
    let feature = this.olmap.forEachFeatureAtPixel(
      this.olmap.getPixelFromCoordinate([76.543, 14.3861]),
      function (feature, layer) {
        // Enable When Add Opacity
        if (isAddOpacity) {
          const features = that.applyOpacityFeature.setStyle(
            new Style({
              image: new Icon({
                opacity: 0.8,
                crossOrigin: "anonymous",
                src: "/assets/sensor-icons/TI-26px.svg",
              }),
            })
          );
        } else if (!selectedFeature) {
          const features = that.applyOpacityFeature.setStyle(
            new Style({
              image: new Icon({
                opacity: 10,
                crossOrigin: "anonymous",
                src: "/assets/sensor-icons/TI-26px.svg",
              }),
            })
          );
        }
        return true;
      }
    );
  }

  // Render KML File Data on the map
  retriveRNDFFileData() {
    this.RndfService.getRndfConfiguration().subscribe((res) => {
      if (res && !res.error) {
        let rndfData = res.data.find((result) => {
          if (result.is_selected === true) {
            return result;
          }
        });

        if (rndfData) {
          const file_ext = rndfData.file_name.split(".").pop();
          if (file_ext === "kml") {
            const features = new KML().readFeatures(rndfData.file_data, {
              dataProjection: "EPSG:4326",
            });
            const kmlSource = new VectorSource({});
            const layer = new VectorLayer({
              title: "KML",
              source: kmlSource,
              visibility: true,
            });
            kmlSource.addFeatures(features);
            // Enable to display kml file on the map
            // setTimeout(() => {
            // this.olmap.addLayer(layer);
            // }, 1000);
          }
          if (file_ext === "json" || file_ext === "txt") {
            let filedata = JSON.parse(JSON.stringify(rndfData.file_data));
            // console.log('filedata', rndfData);
            let lsInnerArray = [], lswaypoints = [], wpInnerArray = [], waypoints = [];
            filedata.segments.filter((obj) =>
              obj.lanes.filter((lane) =>
                lane.waypoints.filter((wp, index) => {
                  lsInnerArray.push([parseFloat(wp.lon), parseFloat(wp.lat)]);
                  if (lane.waypoints.length - 1 === index) {
                    lswaypoints.push({ points: lsInnerArray });
                    lsInnerArray = [];
                  }

                  wpInnerArray.push({ id: wp.id, coords: [parseFloat(wp.lon), parseFloat(wp.lat)] });
                  if (lane.waypoints.length - 1 === index) {
                    let geoPoints = CustomGeoJson.parse(wpInnerArray, { Point: "coords" });
                    waypoints.push(geoPoints);
                    wpInnerArray = [];
                  }
                })
              )
            );

            if (waypoints.length > 0) {
              const geoJson = CustomGeoJson.parse(lswaypoints, {
                LineString: "points"
              });

              this.addLayerToMap(
                Object.assign({}, this.layers, {
                  LayerTitle: "RNDF",
                  LayerType: "Vector",
                  Source: geoJson,
                  SourceType: "GeoJSON",
                  Style: { color: "#C70CAD", width: 3 },
                  opacity: "No",
                  zIndex: 3,
                  Popup: "No",
                })
              );

              for (let index = 0; index < waypoints.length; index++) {
                const featureCollection = waypoints[index];
                this.addLayerToMap(
                  Object.assign({}, this.layers, {
                    LayerTitle: "RNDF_Points",
                    LayerType: "Vector",
                    Source: featureCollection,
                    SourceType: "GeoJSON",
                    Style: { color: "Yellow", width: 2 },
                    opacity: "Yes",
                    zIndex: 3,
                    Popup: "No",
                  })
                );
              }
            }
          }
        }
      }
    });
  }

  retriveRNDFFileData1() {
    this.RndfService.getRndfConfiguration().subscribe((res) => {
      if (res && !res.error) {
        let rndfData = res.data.find((result) => {
          if (result.is_selected === true) {
            return result;
          }
        });

        if (rndfData) {
          const file_ext = rndfData.file_name.split(".").pop();
          if (file_ext === "json" || file_ext === "txt") {
            let filedata = JSON.parse(JSON.stringify(rndfData.file_data));
            // console.log('filedata', rndfData);
            let lsInnerArray = [], lswaypoints = [], wpInnerArray = [], waypoints = [];

            let epwpInnerArray = [], epwaypoints = [];
            filedata.segments.filter((obj) =>
              obj.lanes.filter((lane) => {
                lane.exitpoints.filter((ep, index) => {
                  let obj = lane.waypoints.find(wp => ep.includes(wp.id));
                  // console.log("---obj---", obj);

                  epwpInnerArray.push({ id: obj.id, lane_id: lane.id, coords: [parseFloat(obj.lon), parseFloat(obj.lat)] });
                  if (lane.exitpoints.length - 1 === index) {
                    let geoPoints = CustomGeoJson.parse(epwpInnerArray, { Point: "coords" });
                    epwaypoints.push(geoPoints);
                    epwpInnerArray = [];
                  }
                })

                lane.waypoints.filter((wp, index) => {
                  lsInnerArray.push([parseFloat(wp.lon), parseFloat(wp.lat)]);
                  if (lane.waypoints.length - 1 === index) {
                    lswaypoints.push({ points: lsInnerArray });
                    lsInnerArray = [];
                  }

                  wpInnerArray.push({ id: wp.id, coords: [parseFloat(wp.lon), parseFloat(wp.lat)] });
                  if (lane.waypoints.length - 1 === index) {
                    let geoPoints = CustomGeoJson.parse(wpInnerArray, { Point: "coords" });
                    waypoints.push(geoPoints);
                    wpInnerArray = [];
                  }
                })
              })
            );

            if (epwaypoints.length > 0) {
              for (let index = 0; index < epwaypoints.length; index++) {
                const featureCollection = epwaypoints[index];
                this.addLayerToMap1(
                  Object.assign({}, this.layers, {
                    LayerTitle: "RNDF_ExitPoints",
                    LayerType: "Vector",
                    Source: featureCollection,
                    SourceType: "GeoJSON",
                    Style: { color: "Red", width: 2 },
                    opacity: "Yes",
                    zIndex: 4,
                    Popup: "No",
                  })
                );
              }
            }

            if (waypoints.length > 0) {
              const geoJson = CustomGeoJson.parse(lswaypoints, {
                LineString: "points"
              });

              /* this.addLayerToMap1(
                Object.assign({}, this.layers, {
                  LayerTitle: "RNDF",
                  LayerType: "Vector",
                  Source: geoJson,
                  SourceType: "GeoJSON",
                  Style: { color: "#C70CAD", width: 3 },
                  opacity: "Yes",
                  zIndex: 3,
                  Popup: "No",
                })
              ); */

              for (let index = 0; index < waypoints.length; index++) {
                const featureCollection = waypoints[index];
                this.addLayerToMap1(
                  Object.assign({}, this.layers, {
                    LayerTitle: "RNDF_Points",
                    LayerType: "Vector",
                    Source: featureCollection,
                    SourceType: "GeoJSON",
                    Style: { color: "Yellow", width: 2 },
                    opacity: "Yes",
                    zIndex: 3,
                    Popup: "No",
                  })
                );
              }
            }
          }
        }
      }
    });
  }

  // Hide Sensors During Assignment
  hideSensor(data) {
    // Hiding the sensor during UAV,UGV & QRT Assignment
    this.olmap
      .getLayers()
      .getArray()
      .filter((layer, i) => {
        if (layer.get("title") === data[0].type.toUpperCase()) {
          return layer
            .getSource()
            .getFeatures()
            .filter((layerfeature) => {
              let vectorfeature = layerfeature.getProperties();
              let ismatchedFeature = vectorfeature.features.find(
                (f) => f.getProperties().zone_id === data[0].sensorData.zone_id
              );
              if (ismatchedFeature) {
                var style = new Style({
                  image: new Icon({
                    src: layer.get("options").Style.source,
                    opacity: 4,
                  }),
                });
                layerfeature.setStyle(style);
              }
              return vectorfeature;
            });
        }
      });
  }

  // Show Sensors During Assignment
  ShowSensor(data) {
    // Showing the sensor during UAV,UGV & QRT Assignment
    this.olmap
      .getLayers()
      .getArray()
      .filter((layer, i) => {
        if (layer.get("title") === data.type.toUpperCase()) {
          return layer
            .getSource()
            .getFeatures()
            .filter((layerfeature) => {
              let vectorfeature = layerfeature.getProperties();
              let ismatchedFeature = vectorfeature.features.find(
                (f) => f.getProperties().zone_id === data.zone_id
              );
              if (ismatchedFeature) {
                var style = new Style({
                  image: new Icon({
                    src: layer.get("options").Style.source,
                    opacity: 1,
                  }),
                });
                layerfeature.setStyle(style);
              }
              return vectorfeature;
            });
        }
      });
  }
  // showVideoPopup: boolean = false;

  // openVideoPopup() {
  //   this.showVideoPopup = true;
  
  //   // hide map popups to avoid white block
  //   this.isSlewPopupEnabled = false;
  //   this.isCameraPopupEnabled = false;
  
  //   if (this.popup) {
  //     this.popup.setPosition(undefined);
  //   }
  // }
  // setPTZControls(camera_ip) {
  //   //var slew_data = { "origin": "slew", "ip": camera_ip, "data": { "latitude": "", 'longitude': "", "sensor_id": "", "ip_address": camera_ip, "target_id": "" } };
  //   //this.alarmService.sendSlewTIToAGU(slew_data).subscribe((results) => { console.log(results); });
  //   let queryParams = `${Object.keys(this.ptzControls)
  //     .map((key) => `${key}` + "=" + `${this.ptzControls[key]}`)
  //     .join("&")}`;
    
  //   let url = "http://localhost";
  //   queryParams = queryParams + "&ip=" + camera_ip;
  //   // console.log(queryParams)
  //   this.dataService.getPTZControls(url, queryParams).subscribe(
  //     (res: any) => {
  //       if (res && !res.error && !res.errorInfo) {
  //         this.ptzControls = res;
  //       } else {
  //         console.log(res);
  //       }
  //     },
  //     (err) => {
  //       console.log(err);
  //     }
  //   );
  // }
  // setPTZControls(camera_ip?: string) {
  //   const ip = camera_ip || '192.168.30.71';
  
  //   // Build query string
  //   let queryParams = Object.keys(this.ptzControls)
  //     .map((key) => `${key}=${this.ptzControls[key]}`)
  //     .join("&");
  
  //   // Append IP
  //   queryParams = `${queryParams}&ip=${ip}`;
  
  //   let url = `http://192.168.30.52:8000`;
  // console.log("queryParams",queryParams);
  
  //   this.dataService.getPTZControls(url, queryParams).subscribe(
  //     (res: any) => {
  //       if (res && !res.error && !res.errorInfo) {
  //         this.ptzControls = res;
  //       } else {
  //         console.log(res);
  //       }
  //     },
  //     (err) => {
  //       console.log(err);
  //     }
  //   );
  // }
  setPTZControls(camera_ip?: string) {
    const ip = camera_ip || '192.168.30.71';
  
    // Build the body object
    let body = {
      ...this.ptzControls, // Include the current PTZ control data
      ip: ip              // Add the IP to the body
    };
    console.log("*** body",);
    
  
    // Define the URL
    let url = `http://192.168.2.100:8000`;
  
     console.log("Body:", body);
  
    // Use POST method to send the body as a request payload
    this.dataService.postPTZControls(url, body).subscribe(
      (res: any) => {
        if (res && !res.error && !res.errorInfo) {
          this.ptzControls = res;
        } else {
          console.log(res);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  

  applyPTZControls(type, event) {
    this.ptzControls[type] = event.target.value;
    this.setPTZControls(this.ti_camera_ip);
  }

  uavLayerInfo: any = {};

  addLayerToMap(layeroptions: any) {
    var image;
    if (layeroptions && layeroptions.Style.type === "image") {
      image = new Icon({
        src: layeroptions.Style.source,
        scale: layeroptions.Style.scale,
      });
    } else {
      image = new CircleStyle({
        radius: 3,
        fill: new Fill({
          color: layeroptions.Style.fill,
        }),
        stroke: new Stroke({
          color: layeroptions.Style.color,
          width: layeroptions.Style.width,
        }),
      });
    }

    var styles = {
      Point: new Style({
        image: image,
      }),
      LineString: new Style({
        stroke: new Stroke({
          color: 'white',
          width: 5,
          lineDash:[1, 7],
        }),
      }),
      MultiLineString: new Style({
        stroke: new Stroke({
          color: layeroptions.Style.color,
          width: layeroptions.Style.width,
          lineDash: layeroptions.Style.linedash
            ? layeroptions.Style.linedash
            : [],
        }),
      }),
      MultiPoint: new Style({
        image: image,
      }),
      MultiPolygon: new Style({
        stroke: new Stroke({
          color: layeroptions.Style.color,
          width: layeroptions.Style.width,
          lineDash: layeroptions.Style.linedash
            ? layeroptions.Style.linedash
            : [],
        }),
        fill: new Fill({
          color: layeroptions.Style.fill,
        }),
      }),
      Polygon: new Style({
        stroke: new Stroke({
          color: layeroptions.Style.color,
          //lineDash: [4],
          width: layeroptions.Style.width,
        }),
        fill: new Fill({
          color: layeroptions.Style.fill,
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

    var self = this;

    var styleFunction = function (feature) {
      try {
        if (
          layeroptions.Style.masked_zone &&
          layeroptions.Style.masked_zone === "Yes"
        ) {
          if (feature.get("zone_priority") === 0) {
            styles["MultiPolygon"] = new Style({
              stroke: new Stroke({
                color: layeroptions.Style.color,
                width: layeroptions.Style.width,
                lineDash: layeroptions.Style.linedash
                  ? layeroptions.Style.linedash
                  : [],
              }),
              fill: new Fill({
                color: layeroptions.Style.maskfill,
              }),
            });
          } else {
            styles["MultiPolygon"] = new Style({
              stroke: new Stroke({
                color: layeroptions.Style.color,
                width: layeroptions.Style.width,
                lineDash: layeroptions.Style.linedash
                  ? layeroptions.Style.linedash
                  : [],
              }),
              fill: new Fill({
                color: layeroptions.Style.fill,
              }),
            });
          }
          return styles[feature.getGeometry().getType()];
        } else {
          try {
            let vectorfeature = feature.getProperties();
            var iconStyle;

            if (
              feature.getGeometry().getType() == "Point" &&
              layeroptions.Style.type == "image"
            ) {

              if (
                vectorfeature.features && vectorfeature.features[0].get("current_status") == false &&
                self.resultIp && self.resultIp.indexOf(vectorfeature.features[0].get("ip")) !== -1
              ) {
                iconStyle = new Style({
                  image: new Icon({
                    src:
                      "./assets/icons/diagnostics/" +
                      vectorfeature.features[0].get("sensor_type") +
                      "-26px.svg",
                  }),
                });
                feature.setStyle(iconStyle);
                return styles[feature.getGeometry().getType()];
              }
            }
          } catch { }

        }
        if (
          layeroptions.Style.iconWithStyle &&
          layeroptions.Style.iconWithStyle === "Yes"
        ) {
          if (layeroptions.Style.type === "lsimage") {
            var geometry = feature.getGeometry();
            var style = [
              // linestring
              new Style({
                stroke: new Stroke({
                  color: layeroptions.Style.color,
                  width: layeroptions.Style.width,
                }),
              }),
            ];
            var count = 0;
            geometry.forEachSegment(function (start, end) {
              var dx = end[0] - start[0];
              var dy = end[1] - start[1];
              var rotation = Math.atan2(dy, dx);
              // arrows
              style.push(
                new Style({
                  geometry: new MultiPoint([start, end]),
                  image: new Icon({
                    src:
                      feature.getProperties().options[count] &&
                        feature.getProperties().options[count].current_status &&
                        self.resultIp &&
                        self.resultIp.indexOf(
                          feature.getProperties().options[count].ip
                        ) == -1
                        ? layeroptions.Style.source
                        : "./assets/icons/diagnostics/LF-26px.svg",
                    anchor: [0.75, 0.5],
                    scale: 0.4,
                    rotateWithView: false,
                    rotation: -rotation,
                  }),
                })
              );
              count++;
            });

            styles["LineString"] = style;
          } else {
            styles["LineString"] = new Style({
              stroke: new Stroke({
                color: layeroptions.Style.color,
                width: layeroptions.Style.width,
                lineDash: layeroptions.Style.linedash
                  ? layeroptions.Style.linedash
                  : [],
              }),
            });
          }
          return styles[feature.getGeometry().getType()];
        } else {
          try {
            return styles[feature.getGeometry().getType()];
          } catch (err) {
            return styles["LineString"]
          }
        }
      } catch (err) {
        console.log(err)
      }
    };

    var clusterSource = function () {
      // This is to create a layer with no features in it like early warnings
      if (!layeroptions.Source) {
        return new VectorSource({ features: [] });
      }
      if (layeroptions.ApplyClustering === "Yes") {
        return new Cluster({
          distance: 40,
          source: new VectorSource({
            features: new GeoJSON().readFeatures(layeroptions.Source),
          }),
        });
      } else {
        return new VectorSource({
          features: new GeoJSON().readFeatures(layeroptions.Source),
        });
      }
    };

    const vectorLayer = new VectorLayer({
      title: layeroptions.LayerTitle,
      visible: true,
      projection: layeroptions.Projection,
      source: clusterSource(),
      zIndex: layeroptions.zIndex,
      style: styleFunction,
      opacity: layeroptions.opacity === "No" ? 0 : 1,
      options: layeroptions,
    });
    if (layeroptions.LayerTitle.toLowerCase() === "uav") {
      this.uavLayerInfo = vectorLayer;
    }
    this.olmap.addLayer(vectorLayer);
  }

  addLayerToMap1(layeroptions: any) {
    var image;
    if (layeroptions && layeroptions.Style.type === "image") {
      image = new Icon({
        src: layeroptions.Style.source,
        scale: layeroptions.Style.scale,
      });
    } else {
      image = new CircleStyle({
        radius: 3,
        fill: new Fill({
          color: layeroptions.Style.fill,
        }),
        stroke: new Stroke({
          color: layeroptions.Style.color,
          width: layeroptions.Style.width,
        }),
      });
    }


    // new Style({
    //   stroke: new Stroke({
    //     color: 'white',        // white color
    //     width: 5,              // thick line (adjust number as needed)
    //     lineDash: [1, 10],     // dotted: 1px line, 10px gap
    //   }),
    // });

    var styles = {
      Point: new Style({
        image: image,
      }),
      LineString: new Style({ //*** track_color
        stroke: new Stroke({
          color: 'white',
          width: 5,
          lineDash:[1, 7],
        }),
      }),
      // LineString: new Style({ //*** track_color
      //   stroke: new Stroke({
      //     color: layeroptions.Style.color,
      //     width: layeroptions.Style.width,
      //     lineDash: layeroptions.Style.linedash
      //       ? layeroptions.Style.linedash
      //       : [],
      //   }),
      // }),
      MultiLineString: new Style({
        stroke: new Stroke({
          color: layeroptions.Style.color,
          width: layeroptions.Style.width,
          lineDash: layeroptions.Style.linedash
            ? layeroptions.Style.linedash
            : [],
        }),
      }),
      MultiPoint: new Style({
        image: image,
      }),
      MultiPolygon: new Style({
        stroke: new Stroke({
          color: layeroptions.Style.color,
          width: layeroptions.Style.width,
          lineDash: layeroptions.Style.linedash
            ? layeroptions.Style.linedash
            : [],
        }),
        fill: new Fill({
          color: layeroptions.Style.fill,
        }),
      }),
      Polygon: new Style({
        stroke: new Stroke({
          color: layeroptions.Style.color,
          //lineDash: [4],
          width: layeroptions.Style.width,
        }),
        fill: new Fill({
          color: layeroptions.Style.fill,
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

    var self = this;

    var styleFunction = function (feature) {
      try {
        if (
          layeroptions.Style.masked_zone &&
          layeroptions.Style.masked_zone === "Yes"
        ) {
          if (feature.get("zone_priority") === 0) {
            styles["MultiPolygon"] = new Style({
              stroke: new Stroke({
                color: layeroptions.Style.color,
                width: layeroptions.Style.width,
                lineDash: layeroptions.Style.linedash
                  ? layeroptions.Style.linedash
                  : [],
              }),
              fill: new Fill({
                color: layeroptions.Style.maskfill,
              }),
            });
          } else {
            styles["MultiPolygon"] = new Style({
              stroke: new Stroke({
                color: layeroptions.Style.color,
                width: layeroptions.Style.width,
                lineDash: layeroptions.Style.linedash
                  ? layeroptions.Style.linedash
                  : [],
              }),
              fill: new Fill({
                color: layeroptions.Style.fill,
              }),
            });
          }
          return styles[feature.getGeometry().getType()];
        } else {
          try {
            let vectorfeature = feature.getProperties();
            var iconStyle;

            if (
              feature.getGeometry().getType() == "Point" &&
              layeroptions.Style.type == "image"
            ) {

              if (
                vectorfeature.features && vectorfeature.features[0].get("current_status") == false &&
                self.resultIp && self.resultIp.indexOf(vectorfeature.features[0].get("ip")) !== -1
              ) {
                iconStyle = new Style({
                  image: new Icon({
                    src:
                      "./assets/icons/diagnostics/" +
                      vectorfeature.features[0].get("sensor_type") +
                      "-26px.svg",
                  }),
                });
                feature.setStyle(iconStyle);
                return styles[feature.getGeometry().getType()];
              }
            }
          } catch { }

        }
        if (
          layeroptions.Style.iconWithStyle &&
          layeroptions.Style.iconWithStyle === "Yes"
        ) {
          if (layeroptions.Style.type === "lsimage") {
            var geometry = feature.getGeometry();
            var style = [
              // linestring
              new Style({
                stroke: new Stroke({
                  color: layeroptions.Style.color,
                  width: layeroptions.Style.width,
                }),
              }),
            ];
            var count = 0;
            geometry.forEachSegment(function (start, end) {
              var dx = end[0] - start[0];
              var dy = end[1] - start[1];
              var rotation = Math.atan2(dy, dx);
              // arrows
              style.push(
                new Style({
                  geometry: new MultiPoint([start, end]),
                  image: new Icon({
                    src:
                      feature.getProperties().options[count] &&
                        feature.getProperties().options[count].current_status &&
                        self.resultIp &&
                        self.resultIp.indexOf(
                          feature.getProperties().options[count].ip
                        ) == -1
                        ? layeroptions.Style.source
                        : "./assets/icons/diagnostics/LF-26px.svg",
                    anchor: [0.75, 0.5],
                    scale: 0.4,
                    rotateWithView: false,
                    rotation: -rotation,
                  }),
                })
              );
              count++;
            });

            styles["LineString"] = style;
          } else {
            styles["LineString"] = new Style({
              stroke: new Stroke({
                color: layeroptions.Style.color,
                width: layeroptions.Style.width,
                lineDash: layeroptions.Style.linedash
                  ? layeroptions.Style.linedash
                  : [],
              }),
            });
          }
          return styles[feature.getGeometry().getType()];
        } else {
          try {
            return styles[feature.getGeometry().getType()];
          } catch (err) {
            return styles["LineString"]
          }
        }
      } catch (err) {
        console.log(err)
      }
    };

    var clusterSource = function () {
      // This is to create a layer with no features in it like early warnings
      if (!layeroptions.Source) {
        return new VectorSource({ features: [] });
      }
      if (layeroptions.ApplyClustering === "Yes") {
        return new Cluster({
          distance: 40,
          source: new VectorSource({
            features: new GeoJSON().readFeatures(layeroptions.Source),
          }),
        });
      } else {
        return new VectorSource({
          features: new GeoJSON().readFeatures(layeroptions.Source),
        });
      }
    };

    const vectorLayer = new VectorLayer({
      title: layeroptions.LayerTitle,
      visible: true,
      projection: layeroptions.Projection,
      source: clusterSource(),
      zIndex: layeroptions.zIndex,
      style: styleFunction,
      opacity: layeroptions.opacity === "No" ? 0 : 1,
      options: layeroptions,
    });
    if (layeroptions.LayerTitle.toLowerCase() === "uav") {
      this.uavLayerInfo = vectorLayer;
    }
    this.mrolmap.addLayer(vectorLayer);
  }

  removeLayer(layer) {
    this.olmap.removeLayer(layer);
  }

  getTranslationLang(key) {
    return this.commonService.getTranslationKey(key);
  }

  getZoneLayerTitle(zoneLayerTitle) {
    const titleValue =
      zoneLayerTitle && zoneLayerTitle == "Masked Zones"
        ? this.getTranslationLang("masked_zones")
        : this.getTranslationLang("unmasked_zones");
    return titleValue || zoneLayerTitle;
  }

  getPopupDataFields(fieldsArr) {
    const translatedFieldsArr = [];
    var translatedText;

    fieldsArr.map((item) => {
      item = item.replace(/ +/g, "");
      switch (item) {
        case "Latitude":
          translatedText = this.getTranslationLang("latitude");
          translatedFieldsArr.push(translatedText);
        case "Longitude":
          translatedText = this.getTranslationLang("longitude");
          translatedFieldsArr.push(translatedText);
        case "SensorType":
          translatedText = this.getTranslationLang("sensor_type");
          translatedFieldsArr.push(translatedText);
        case "ZoneID":
          translatedText = this.getTranslationLang("zone_id");
          translatedFieldsArr.push(translatedText);
        case "Sensor_ID":
          translatedText = this.getTranslationLang("sensor_id");
          translatedFieldsArr.push(translatedText);
        default:
          translatedText = item;
          translatedFieldsArr.push(translatedText);
      }
    });
    return translatedFieldsArr;
  }

  onLayerSwitchShown() {
    let popup = this.popup;
    let closer = this.popupCloser.nativeElement;
    if (popup) {
      popup.setPosition(undefined);
      closer.blur();
    }
    this.removeCoverage();
  }

  removeCoverage() {
    var self = this;
    if (self.coverageAreaLayer.length > 0) {
      for (
        let index = 0;
        index < self.coverageAreaLayer.length;
        index++
      ) {
        const element = self.coverageAreaLayer[index];
        self.olmap.removeLayer(element);
      }
      self.coverageAreaLayer = [];
    }
  }
}
