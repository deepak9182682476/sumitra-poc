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
  NgZone,
  TemplateRef,
  HostListener,
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
import { isValidTrackId, isZeroTrackPush, radarTrackIdOf } from "../../shared/track-id";
import Feature from "ol/Feature";
import KML from "ol/format/KML";
import { Circle as CircleStyle, Fill, Stroke, Style, Icon, Text } from "ol/style";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { TileWMS, XYZ, Vector as VectorSource, Cluster } from "ol/source";
import { DataService } from "../../services/data.service";
import { EventService } from "../../services/event.service";
import { CommonService } from "../../services/common.service";
import { AlarmService } from "../../services/alarm.service";
import { Subscription, Subject, merge } from "rxjs";
import { ThemeService } from "../../theme/theme.service";
import { RndfService } from "src/app/services/rndf.service";
import { ActivatedRoute, Router } from "@angular/router";
import { DiagnosticsService } from "src/app/services/diagnostics.service";
import { AlarmDataService } from '../../shared/alarm-data.service';
import { server_info, stream_urls } from "../../../config/config";

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
  isPtzExpanded = false;
  enableUavVideo = false;
  //uavStreamUrl = 'http://192.168.2.146:8091/uav';
  // live video links come from config.ts -> stream_urls (links from the RTS team)
  uavStreamUrl = stream_urls.UAV;
  isThermalFeed = false;
  //slewDayUrl = 'http://192.168.2.146:8091/';
  slewDayUrl = stream_urls.DAY;
  slewThermalUrl = stream_urls.THERMAL;
  get slewFeedUrl(): string { return this.isThermalFeed ? this.slewThermalUrl : this.slewDayUrl; }
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
  olmap: Map;
  mrolmap: Map;
  view: View;
  view1: View;
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
  uavCommandSubscription: Subscription;
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
  @ViewChild("daPopupCloser") daPopupCloser!: ElementRef;
  @ViewChild("daOverlayElement") daOverlayElement: ElementRef;

  // Manual camera steering (spec v2: POST :8000/move)
  ptzControls: any = {
    pan: 0,
    tilt: 0,
    zoom_distance_m: 1000,
    gimbal_mode: 0, // 0 Position, 1 Stabilize, 2 Velocity, 4 Halt
  };
  ptzSelected = {
    pan: false,
    tilt: false,
    zoom: false
  };
  slewTiWidth = 200; // was 220
  slewTiHeightOffset = 0;
  isResizing = false;
  private startX = 0;
  private startY = 0;
  private startWidth = 220;
  private startHeightOffset = 0;
  uavWidth = 200; // was 220
  uavHeight = 160; // was 180
  isUavResizing = false;
  private startUavX = 0;
  private startUavY = 0;
  private startUavWidth = 220;
  private startUavHeight = 180;
  activeSlewAlarm: any = null;
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
    private alarmDataService: AlarmDataService,
    private ngZone: NgZone
  ) {
    this.mapParams = this.dataService.config.MapConfig;
    this.view = new View({
      // extent: this.mapParams.DefaultExtent,
      center: this.mapParams.DefaultCenter,
      zoom: this.mapParams.DefaultZoom,
      minZoom: this.mapParams.MinZoom,
      maxZoom: this.mapParams.MaxZoom,
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
        let { selectedRobots, algo_type } = response.message;
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
    if (this.enableVideo) this.camDockOut = false;
  }

  onUavToggle(event: any) {
    this.enableUavVideo = event.target.checked;
    if (this.enableUavVideo) this.camDockOut = false;
  }

  // ---- Slew TI / UAV docked in a column on the right of the map ----
  camDockOut = false;   // column hidden with its tab (videos keep running)
  get camDockActive(): boolean {
    return (this.enableVideo || this.enableUavVideo) && !this.camDockOut;
  }
  toggleCamDock() {
    this.camDockOut = !this.camDockOut;
  }
  // Opening one panel's controls folds the other one, so both videos fit without scrolling
  toggleSlewSection() {
    this.isPtzExpanded = !this.isPtzExpanded;
    if (this.isPtzExpanded && this.enableUavVideo) this.isUavCtlExpanded = false;
  }
  toggleUavSection() {
    this.isUavCtlExpanded = !this.isUavCtlExpanded;
    if (this.isUavCtlExpanded && this.enableVideo) this.isPtzExpanded = false;
  }
  // The map gets narrower / wider when the column opens or closes: tell OpenLayers to re-measure
  private lastCamDockState: any = null;
  ngDoCheck() {
    const now: any = this.camDockActive + "|" + document.body.classList.contains("sub-nav-empty");
    if (now === this.lastCamDockState) return;
    this.lastCamDockState = now;
    setTimeout(() => { if (this.olmap) this.olmap.updateSize(); }, 0);
    setTimeout(() => { if (this.olmap) this.olmap.updateSize(); }, 300);
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
    this.startCamHealth();
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
      this.setUavMarker("uav-home", this.uavHome, false);
      this.startDemoFeeds();
      this.startUavPolling();
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
      // hide the static QRT placeholder (0,0) until a live QRT position arrives
      const qrtPlaceholderLayer = this.findLayer("QRT");
      if (qrtPlaceholderLayer) { qrtPlaceholderLayer.setVisible(false); }
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
        // (try/catch: an error here used to unsubscribe this listener, so the map stopped following the theme)
        try {
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
        } catch (e) {
          console.error("Map theme update failed", e);
        }
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
          if (this.overlayElement && this.overlayElement.nativeElement) {
            this.overlayElement.nativeElement.innerHTML = "";
          }
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
              if (layer.get("id") !== 1 && layer.values_.id !== "tileLayer") {
                if (layer.get("title") === layername) {
                  this.isSlewPopupEnabled = true;
                  // this.overlayElement.nativeElement.innerHTML =
                  //   `<p>` + evt.coordinate + `</p>`;
                  this.updateOpacity(true, feature);
                  this.popup.setPosition(this.olmap.getEventCoordinate(evt));
                  this.olmap.addOverlay(this.popup);
                  let popup = this.popup;
                  let closer = this.popupCloser ? this.popupCloser.nativeElement : null;
                  if (closer && closer.onclick === null) {
                    closer.onclick = () => {
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
              if (layer.get("id") !== 1 && layer.values_.id !== "tileLayer") {
                if (layer.get("title") === layername) {
                  this.isCameraPopupEnabled = true;
                  // this.overlayElement.nativeElement.innerHTML =
                  //   `<p>` + evt.coordinate + `</p>`;
                  // this.updateOpacity(true, feature);
                  this.popup.setPosition(this.olmap.getEventCoordinate(evt));
                  this.olmap.addOverlay(this.popup);
                  let popup = this.popup;
                  let closer = this.popupCloser ? this.popupCloser.nativeElement : null;
                  if (closer && closer.onclick === null) {
                    closer.onclick = () => {
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
                let closer = this.popupCloser ? this.popupCloser.nativeElement : null;
                if (closer && closer.onclick === null) {
                  closer.onclick = () => {
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
              if (layer.get("title") !== "Perimeter" && layer.get("id") !== 1) {
                this.olmap.removeLayer(layer);
              }
            });
            this.initializeDiagnosticMapComponent(res.data);
          } else {
            let getLayerData: any = {};
            layers.forEach((layer, i) => {
              if (layer.get("title") !== "Perimeter" && layer.get("id") !== 1 && layer.values_.id !== "tileLayer") {
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
    // "go to default location" button is wired in the template: (click)="goToDefaultLocation()"
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
        <div class="post-analysis-alarm-id" id="alarm_id-${this.escapeHtml(elem.alarm_id)} style='width:20vw;hight:10vh'">
          <span style="float: right;cursor: pointer;" class="${this.escapeHtml(elem.alarm_id)}" id="close-popup">X</span>
          <span>Alarm ID: ${this.escapeHtml(elem.alarm_id)}</span>
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
        <td>${this.escapeHtml(data.sensors_triggered[0] ? data.sensors_triggered[0] : "NA")}</td>
      </tr>
      <tr>
        <td>Latitude: </td>
        <td>${this.escapeHtml(data.location.coordinates[1])}</td>
      </tr>
      <tr>
        <td>Longtitude: </td>
        <td>${this.escapeHtml(data.location.coordinates[0])}</td>
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
        <td>${this.escapeHtml(data.zone_id ? data.zone_id : "NA")}</td>
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
      try {
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
      } catch (e) {
        console.error("Map theme update failed", e);
      }
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

              if (layer.get("id") !== 1 && layer.values_.id !== "tileLayer") {
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
                    color: this.singleTrackColor || "orange",
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
    this.dataService.getPerimeterCoordinates({ type: "Perimeter" }).subscribe((result: any) => {
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

    this.dataService.getPerimeterCoordinates({ type: "Road" }).subscribe((result: any) => {
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

    this.withIndiaBorder((border) => {
      this.addLayerToMap(
        Object.assign({}, this.layers, {
          LayerTitle: "Border",
          LayerType: "Vector",
          ApplyClustering: "No",
          Source: border,
          SourceType: "GeoJSON",
          Style: {
            color: "#00FFF6",
            width: 1.5, // was 3: thinner India boundary lines
            fill: "rgba(0, 0, 0, 0)",
            type: "Polygon",
          },
          zIndex: 3,
          Popup: "No",
        })
      );
    });

    // India - Bangladesh international border: dashed red, separate from the cyan island outlines
    this.withIntlBorder((intl) => {
      this.addLayerToMap(
        Object.assign({}, this.layers, {
          LayerTitle: "International Border",
          LayerType: "Vector",
          ApplyClustering: "No",
          Source: intl,
          SourceType: "GeoJSON",
          Style: {
            color: "#ff3b30",
            width: 3,
            linedash: [14, 6],
            fill: "rgba(0, 0, 0, 0)",
            type: "Polygon",
          },
          zIndex: 4,
          Popup: "No",
        })
      );
    });
  }

  // India boundary drawn in cyan. assets/india-border.geojson = OpenStreetMap boundary of India incl. every island
  // (DataMeet india-osm, same source as the offline map tiles): ~2 m Sundarbans, ~10 m West Bengal, ~150 m elsewhere.
  // If the file can't be loaded, the old coarse outline in config.ts (border_layer) is used.
  private indiaBorderGeo: any = null;
  private withIndiaBorder(cb: (geojson: any) => void) {
    if (this.indiaBorderGeo) { cb(this.indiaBorderGeo); return; }
    fetch("assets/india-border.geojson")
      .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then((geo) => { this.indiaBorderGeo = geo; cb(geo); })
      .catch((err) => {
        console.log("India border file not loaded, using the outline from config.ts:", err && err.message);
        if (this.dataService.config.border_layer) cb(this.dataService.config.border_layer);
      });
  }

  // All of India's international land borders (assets/international-border.geojson): Pakistan, China,
  // Nepal, Bhutan, Myanmar, Bangladesh (river border at the Sundarbans) and Afghanistan. Official boundary of
  // India (DataMeet india-composite / LSIB) with the sea coast removed. Sir Creek to the Sundarbans.
  private intlBorderGeo: any = null;
  private withIntlBorder(cb: (geojson: any) => void) {
    if (this.intlBorderGeo) { cb(this.intlBorderGeo); return; }
    fetch("assets/international-border.geojson")
      .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then((geo) => { this.intlBorderGeo = geo; cb(geo); })
      .catch((err) => console.log("International border file not loaded:", err && err.message));
  }

  getPerimeterCoordinates1() {
    this.dataService.getPerimeterCoordinates({ type: "Perimeter" }).subscribe((result: any) => {
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

    this.withIndiaBorder((border) => {
      this.addLayerToMap1(
        Object.assign({}, this.layers, {
          LayerTitle: "Border",
          LayerType: "Vector",
          ApplyClustering: "No",
          Source: border,
          SourceType: "GeoJSON",
          Style: {
            color: "#00FFF6",
            width: 1.5, // was 3: thinner India boundary lines
            fill: "rgba(0, 0, 0, 0)",
            type: "Polygon",
          },
          zIndex: 3,
          Popup: "No",
        })
      );
    });

    // India - Bangladesh international border: dashed red, separate from the cyan island outlines
    this.withIntlBorder((intl) => {
      this.addLayerToMap1(
        Object.assign({}, this.layers, {
          LayerTitle: "International Border",
          LayerType: "Vector",
          ApplyClustering: "No",
          Source: intl,
          SourceType: "GeoJSON",
          Style: {
            color: "#ff3b30",
            width: 3,
            linedash: [14, 6],
            fill: "rgba(0, 0, 0, 0)",
            type: "Polygon",
          },
          zIndex: 4,
          Popup: "No",
        })
      );
    });
  }

  // Sensors placed outside India (old test entries, e.g. a radar saved in the sea west of Kutch) are not drawn.
  // The test uses the India outline polygon in config.ts (border_layer); anything inside the Sundarbans site
  // box is always shown, so a sensor on the coast is never hidden by the coarse outline. The database is untouched.
  private indiaRings: number[][][] = null;
  private isInsideIndia(lonlat: number[]): boolean {
    if (!lonlat || lonlat.length < 2) return true;
    const x = +lonlat[0], y = +lonlat[1];
    if (x > 88.0 && x < 89.3 && y > 21.3 && y < 22.9) return true; // Sundarbans site (Indian side and border)
    if (!this.indiaRings) {
      const geo: any = this.dataService.config && this.dataService.config.border_layer;
      const rings: number[][][] = [];
      ((geo && geo.features) || []).forEach((f: any) => {
        const g = f && f.geometry;
        if (!g) return;
        if (g.type === "Polygon") rings.push(g.coordinates[0]);
        if (g.type === "MultiPolygon") g.coordinates.forEach((p: any) => rings.push(p[0]));
      });
      this.indiaRings = rings;
    }
    if (!this.indiaRings.length) return true; // no outline: show everything, as before
    for (const ring of this.indiaRings) {
      let hit = false;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
      }
      if (hit) return true;
    }
    return false;
  }
  private keepSensorsInsideIndia(result: any): any {
    if (!result || !Array.isArray(result.features)) return result;
    const kept = result.features.filter((f: any) => this.isInsideIndia(f && f.geometry && f.geometry.coordinates));
    if (kept.length !== result.features.length) {
      console.log("Sensors outside India not drawn:", result.features.filter((f: any) => kept.indexOf(f) === -1).map((f: any) => f.properties && f.properties.sensor_type + " " + f.properties.sensor_id));
    }
    return Object.assign({}, result, { features: kept });
  }

  getSensorCoordinates() {
    this.loadSensorLayers();
  }

  private loadSensorLayers() {
    var sensor_types = this.commonService.apiConfig.sensor_types
    const updateList = [];
    sensor_types.forEach((element) => {
      this.dataService.getSensorCoordinates(element.sensor_type).subscribe(
        (result: any) => {
          result = this.keepSensorsInsideIndia(result);
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

  // Remove all zone layers. (Was done while looping over the live layer list: removing one layer shifted
  // the next one past the loop, so the Masked layer stayed and every reload added a second copy -
  // the Zones menu then showed every zone twice.)
  private removeZoneLayers() {
    const zoneLayers = this.olmap
      .getLayers()
      .getArray()
      .filter((layer: any) =>
        layer.get("id") !== 1 && layer.values_.id !== "tileLayer" &&
        (layer.get("title") === "Unmasked Zones" || layer.get("title") === "Masked Zones"));
    zoneLayers.forEach((layer: any) => this.olmap.removeLayer(layer));
  }

  private zoneLoadSeq = 0;
  getZoneCoordinates(reload = null) {
    if (reload === true) {
      this.removeZoneLayers();
    }
    const seq = ++this.zoneLoadSeq;
    this.dataService.getZoneCoordinates().subscribe((result: any) => {
      if (seq !== this.zoneLoadSeq) return; // a newer reload is on its way - only the latest one draws
      this.removeZoneLayers();              // never draw the zones on top of an older copy
      if (result && result.data.length > 0) {
        // Zones start unselected (hidden); the user ticks the ones to show in the Zones menu.
        // A tick is remembered while the page is open, and a zone drawn after the page opened shows straight away.
        const firstLoad = this.zoneSeen === null;
        if (firstLoad) this.zoneSeen = {};
        result.data.forEach((element) => {
          const feats = (element && element.geojson && element.geojson.features) || [];
          feats.forEach((f) => {
            if (!f || !f.properties) return;
            const area = String(f.properties.zone_area);
            if (!(area in this.zoneSeen)) this.zoneSeen[area] = !firstLoad; // new zone drawn now -> shown
            f.properties.checked = this.zoneSeen[area];
          });
        });
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
        this.hideUncheckedZones();
        this.getUpdatedLayers();
      }
    });
  }

  // zone_area -> ticked in the Zones menu (null until the zones are first loaded)
  private zoneSeen: { [area: string]: boolean } = null;

  // Same look as un-ticking a zone in the Zones menu: no fill, no outline
  private hideUncheckedZones() {
    this.olmap.getLayers().getArray().forEach((layer: any) => {
      const title = layer.get("title");
      if (title !== "Unmasked Zones" && title !== "Masked Zones") return;
      const source = layer.getSource && layer.getSource();
      if (!source || !source.getFeatures) return;
      source.getFeatures().forEach((feature: any) => {
        const area = String(feature.getProperties().zone_area);
        if (this.zoneSeen && this.zoneSeen[area] === false) {
          feature.setStyle(new Style({ fill: new Fill({ color: "transparent" }) }));
        }
      });
    });
  }

  // Zones menu -> click a zone -> "Delete zone" (asks for a second click, then deletes it from the database)
  zoneDeleteArmed: any = null;
  private zoneDeleteTimer: any = null;
  deleteZone(props: any) {
    const id = props && props.zone_area;
    if (id === undefined || id === null) return;
    if (this.zoneDeleteArmed !== id) {
      this.zoneDeleteArmed = id;
      clearTimeout(this.zoneDeleteTimer);
      this.zoneDeleteTimer = setTimeout(() => (this.zoneDeleteArmed = null), 4000);
      return;
    }
    this.zoneDeleteArmed = null;
    clearTimeout(this.zoneDeleteTimer);
    this.dataService.deleteZone(id).subscribe(
      () => {
        this.toastr.success("Zone-" + id + " deleted");
        this.getZoneCoordinates(true); // removes the zone layers and loads what is left
        this.getUpdatedLayers();       // refresh the Zones list (also when no zone is left)
      },
      (err: any) => this.toastr.error("Could not delete zone-" + id + ": " + ((err && err.error && err.error.message) || "server not reachable"))
    );
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


  generateSector(lat, lon, azimuth, range) {
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
    finalSec.push([lon, lat])
    let point_found = 0
    for (let index = 0; index < points.length; index++) {
      const point = points[index];
      const angle = turf.bearing(startPoint, turf.point(point));
      console.log(angle, startAngle, endAngle, Math.abs(angle - startAngle))
      if (Math.abs(angle - startAngle) < -2 && !point_found) {
        console.log("matched")
        finalSec.push(point)
        finalSec.push([lon, lat])
        point_found = 1
      }

      if (angle > startAngle && angle < endAngle) {
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
    // collect the old base-map layers first, then remove them
    // (removing inside forEach skips the next layer, which could leave an old light/dark map behind)
    const oldBaseLayers = this.olmap.getLayers().getArray().filter((layer) =>
      layer && layer.get("id") && (layer.get("id") == 1 || layer.get("id") == 2)
    );
    oldBaseLayers.forEach((layer) => this.olmap.removeLayer(layer));
    if ($event === "default" || $event?.target?.checked) {
      if ($event?.target?.checked) this.mapParams.Theme = $event?.target?.value;
      let url = undefined;
      // url: 'http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      if (this.mapParams.Theme === "dark") {
        // url =
        //   this.dataService.config.LOCAL_MAP_URL +
        //   "/styles/dark-matter/{z}/{x}/{y}.png";
       // url = 'http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
        url = 'http://localhost:6090/tile/{z}/{x}/{y}.png';
      } else if (this.mapParams.Theme === "light") {
        // url =
        //   this.dataService.config.LOCAL_MAP_URL +
        //   "/styles/osm-bright/{z}/{x}/{y}.png";
        // CARTO light tiles need an API key ("API KEY REQUIRED") and don't work offline:
        // use the offline map server, shown in light colours (.light-map-tiles in the scss)
        url = 'http://localhost:6090/tile/{z}/{x}/{y}.png';
      } if (this.mapParams.Theme === "satellite") {
        // url =
        // this.dataService.config.LOCAL_SAT_MAP_URL +
        // "/wmts/gm_layer/gm_grid/{z}/{x}/{y}.png";
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      }

      // url =
      // this.dataService.config.LOCAL_SAT_MAP_URL +
      // "/wmts/gm_layer/gm_grid/{z}/{x}/{y}.png";
      //url = 'http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
      // (removed) url = 'http://localhost:6090/tile/{z}/{x}/{y}.png';  <- this line overwrote the Satellite choice
      if (url == undefined) {
        url = 'http://localhost:6090/tile/{z}/{x}/{y}.png'; // any other theme -> offline dark map
      }

      if (url != undefined) {
        // keep the Satellite tick-box in step with the map that is shown
        this.mapParams.satelliteThemeChecked = this.mapParams.Theme === "satellite";
        const tileOpts: any = { id: 1, source: this.createTileSource(url), zIndex: -1 };
        // base map gets its own canvas; the light filter is switched by a class on the map element,
        // so switching back to dark always removes it (no page refresh needed)
        tileOpts.className = "ol-layer base-map-tiles";
        this.setLightMapClass(this.olmap, this.mapParams.Theme === "light");
        this.olmap.addLayer(new TileLayer(tileOpts));
        // Add labels overlay on satellite so place names are visible
        if (this.mapParams.Theme === "satellite") {
          const labelsUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';
          this.olmap.addLayer(new TileLayer({
            id: 2,
            source: new XYZ({ url: labelsUrl, crossOrigin: "anonymous" }),
            zIndex: 0
          } as any));
        }
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

  // Light theme = the dark offline tiles shown inverted (.light-map .base-map-tiles in the scss).
  // The class sits on the map element, so it follows the theme immediately.
  private setLightMapClass(map: any, light: boolean) {
    if (!map) return;
    map.set("lightTheme", light);
    const el = map.getTargetElement ? map.getTargetElement() : null;
    if (el && el.classList) {
      el.classList.toggle("light-map", light);
    } else {
      // map not attached to the page yet: apply when it is
      map.once("change:target", () => this.setLightMapClass(map, map.get("lightTheme")));
    }
  }

  private createTileSource(url: string) {
    return new XYZ({
      attributions: "",
      url: url,
      crossOrigin: "anonymous",
      tileLoadFunction: (imageTile: any, src: string) => {
        const img = imageTile.getImage();
        if (src.indexOf(":6090") === -1 && src.indexOf(":8088") === -1 && src.indexOf(":5101") === -1 && src.indexOf("dark") === -1) {
          img.src = src;
          return;
        }

        const match = src.match(/\/(\d+)\/(\d+)\/(\d+)\.(png|jpg)/);
        if (!match) {
          img.src = src;
          return;
        }

        const z = parseInt(match[1], 10);
        const tileX = parseInt(match[2], 10);
        const tileY = parseInt(match[3], 10);
        const totalTiles = Math.pow(2, z);

        // Tile longitude range
        const minLon = (tileX / totalTiles) * 360 - 180;
        const maxLon = ((tileX + 1) / totalTiles) * 360 - 180;

        // Tile latitude range
        const nTop = Math.PI - (2 * Math.PI * tileY) / totalTiles;
        const maxLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(nTop) - Math.exp(-nTop)));
        const nBottom = Math.PI - (2 * Math.PI * (tileY + 1)) / totalTiles;
        const minLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(nBottom) - Math.exp(-nBottom)));

        // If the tile is completely outside Bangladesh Sundarbans region:
        // Indian Sundarbans (west of border) keeps all blue dotted lines naturally!
        // (Now every tile is processed: the bright blue wetland dashes on the Indian side are softened to a
        //  grey-blue so they no longer show as dark-blue edges next to the cyan boundary lines.)
        // if (maxLon < 88.9 || minLon > 91.5 || minLat > 23.5 || maxLat < 21.0) {
        //   img.src = src;
        //   return;
        // }
        const outsideBdRegion = maxLon < 88.9 || minLon > 91.5 || minLat > 23.5 || maxLat < 21.0;

        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth || image.width;
            canvas.height = image.naturalHeight || image.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              img.src = src;
              return;
            }
            ctx.drawImage(image, 0, 0);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;
            let modified = false;

            const totalPx = 256 * totalTiles;

            for (let py = 0; py < canvas.height; py++) {
              const globalY = tileY * 256 + py;
              const n = Math.PI - (2 * Math.PI * globalY) / totalPx;
              const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

              // International border line longitude between India and Bangladesh
              // Each value is shifted ~0.008-0.01° east of the actual border to ensure
              // Indian islands near the border keep all their water dots.
              let borderLon = 89.100;
              if (lat < 21.65) borderLon = 89.100;
              else if (lat < 21.72) borderLon = 89.085;
              else if (lat < 21.78) borderLon = 89.060;
              else if (lat < 21.88) borderLon = 89.045; // West of Talpatti island
              else if (lat < 21.95) borderLon = 89.038; // River channel north of Talpatti
              else if (lat < 22.13) borderLon = 89.065;
              else if (lat < 22.25) borderLon = 89.076;
              else if (lat < 22.45) borderLon = 89.010;
              else if (lat < 22.70) borderLon = 88.940;
              else borderLon = 88.890;
              if (outsideBdRegion) borderLon = 999; // no Bangladesh land in this tile: whole tile is the Indian side

              for (let px = 0; px < canvas.width; px++) {
                const idx = (py * canvas.width + px) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                // Check for blue wetland / mangrove water features (wider threshold
                // to catch all blue variants on Bangladesh side)
                if (b > 150 && r < 130 && g > 90) {
                  const globalX = tileX * 256 + px;
                  const lon = (globalX / totalPx) * 360 - 180;

                  // ONLY remove blue dotted lines if located in Bangladesh!
                  // In Indian Sundarbans (lon <= borderLon), KEEP the blue dotted lines!
                  if (lon > borderLon) {
                    data[idx] = 58;
                    data[idx + 1] = 58;
                    data[idx + 2] = 58;
                    modified = true;
                  } else {
                    // Indian side: keep the Sundarbans water dashes, in a soft grey-blue instead of bright blue
                    // (bright blue blended into a dark-blue wash when zoomed out)
                    data[idx] = 96;
                    data[idx + 1] = 140;
                    data[idx + 2] = 160;
                    modified = true;
                  }
                }
              }
            }

            if (modified) {
              ctx.putImageData(imgData, 0, 0);
              img.src = canvas.toDataURL();
            } else {
              img.src = src;
            }
          } catch (e) {
            img.src = src;
          }
        };
        image.onerror = () => {
          img.src = src;
        };
        image.src = src;
      },
    });
  }

  mapThemeSelection($event = null) {
    // collect the old base-map layers first, then remove them
    // (removing inside forEach skips the next layer, which could leave an old light/dark map behind)
    const oldBaseLayers = this.mrolmap.getLayers().getArray().filter((layer) =>
      layer && layer.get("id") && (layer.get("id") == 1 || layer.get("id") == 2)
    );
    oldBaseLayers.forEach((layer) => this.mrolmap.removeLayer(layer));
    if ($event === "default" || $event?.target?.checked) {
      if ($event?.target?.checked) this.mapParams.Theme = $event?.target?.value;

      // url: 'http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      // let url =
      //     this.dataService.config.LOCAL_SAT_MAP_URL +
      //     "/wmts/gm_layer/gm_grid/{z}/{x}/{y}.png";
      // let url = 'http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
      let url = 'http://localhost:6090/tile/{z}/{x}/{y}.png'
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
        // CARTO light tiles need an API key ("API KEY REQUIRED") and don't work offline:
        // use the offline map server, shown in light colours (.light-map-tiles in the scss)
        url = 'http://localhost:6090/tile/{z}/{x}/{y}.png';
      } if (this.mapParams.Theme === "satellite") {
        // url =
        //   this.dataService.config.LOCAL_SAT_MAP_URL +
        //   "/wmts/gm_layer/gm_grid/{z}/{x}/{y}.png";
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      }

      if (url != undefined) {
        // this.mapParams.satelliteThemeChecked = false;
        const tileOpts: any = { id: 1, source: this.createTileSource(url), zIndex: -1 };
        tileOpts.className = "ol-layer base-map-tiles";
        this.setLightMapClass(this.mrolmap, this.mapParams.Theme === "light");
        this.mrolmap.addLayer(new TileLayer(tileOpts));
        // Add labels overlay on satellite so place names are visible
        if (this.mapParams.Theme === "satellite") {
          const labelsUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';
          this.mrolmap.addLayer(new TileLayer({
            id: 2,
            source: new XYZ({ url: labelsUrl, crossOrigin: "anonymous" }),
            zIndex: 0
          } as any));
        }
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
            tableHtml += "<td>" + this.escapeHtml(tdData) + "</td>";
          } else {
            var tdData = cfeatures[0].get(data[i])
              ? cfeatures[0].get(data[i])
              : "--";
            tableHtml += "<td>" + this.escapeHtml(tdData) + "</td>";
          }
        }
        tableHtml += "</tr>";
      }
      tableHtml += "</table>";
      if (this.overlayElement && this.overlayElement.nativeElement) {
        this.overlayElement.nativeElement.innerHTML = tableHtml;
      }
    }
  }

  // Get Alarm Data
  getServerData(): void {
    // Subscribe Alarm Data
    // isTrackReceived = false
    // "Clear Tracks" in the alarm list publishes this event; nothing on the map listened to it before
    this.clearedTracksSubscription = this.alarmService.clearedAlarmData.subscribe((res: any) => {
      if (res && res.type === "clear_all_tracks") {
        this.clearAllTracksOnMap();
      }
    });

    // localPush lets the Manual Input panel feed the same handler when the backend is unavailable
    this.alarmSubscription = merge(this.alarmService.getServerPushData(), this.localPush)
      .subscribe((results: any) => {
        // console.log(results)
        // Track ID 0 is not a real target: never draw it, never list it, never sound the alarm for it
        if (isZeroTrackPush(results)) {
          console.log("[MAPS] ignored " + results.category + " message with track ID 0");
          return;
        }
        if (results && results.category === "alarm_archived") {
          this.onAlarmArchived(results);
          return;
        }
        if (results && results.category === "uav_status") {
          this.updateUavPosition(results);
        } else if (results && results.category === "drone_telemetry") {
          this.onKafkaDroneTelemetry(results.data);
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
              layer.setVisible(true); // live QRT position received, show the marker
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
            console.log("[MAPS] WebSocket Alarm Received:", JSON.stringify(results));
            this.modeSubscription = this.commonService.publishModeData(
              results.mode
            );
            this.commonService.storeInLocalStorage("mode", results.mode, false);
            if (results.alarmData) {
              if ((!results.alarmData.location || !results.alarmData.location.coordinates || results.alarmData.location.coordinates.length === 0) && results.location) {
                results.alarmData.location = results.location;
              }
            }
            const mergedAlarm = {
              ...results,
              ...results.alarmData,
            };
            console.log("[MAPS] Publishing Alarm Socket Data (merged):", JSON.stringify(mergedAlarm));
            this.alarmService.publishAlarmSocketData(mergedAlarm);
            this.olmap
              .getOverlays()
              .getArray()
              .forEach((overlay) => {

                if (String(overlay.id) === String(results.alarmData.alarm_id)) {
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
          console.log("Received radar track update: ", results);
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
              newFeature.setStyle(this.trackStyle(gJson.properties.id)); // each track ID gets its own colour
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
            if (String(overlay.id) === String(gJson.properties.id)) {
              const coords = gJson.geometry.coordinates;
              const lastCoord = coords[coords.length - 1];
              // console.log("gJson Properties: ", gJson.properties)
              // Update marker position
              overlay.setPosition(lastCoord);

              // Live update the label values
              const el = overlay.getElement();
              if (el) {
                const span = el.querySelector('.ca-alarm-id, .ca-ack-alarm-id, .ea-alarm-id');
                if (span) {
                  console.log("kkkl", gJson)
                  span.innerHTML = `
                    Track ID: ${this.escapeHtml(gJson.properties.track_id ?? gJson.properties.id)}<br/>
                    Range: ${gJson.properties.range !== undefined && gJson.properties.range !== null && !isNaN(Number(gJson.properties.range)) ? Math.round(Number(gJson.properties.range) * 1000) : 'N/A'} m<br/>
                    Lat: ${this.escapeHtml(lastCoord[1])}<br/>
                    Lon: ${this.escapeHtml(lastCoord[0])}
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
          console.log("[MAPS] receive updatedAlarmData:", JSON.stringify(results));
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
              this.removeOverlay(results, false); // also removes a copy hidden by the Early Warning switch
            } else {
              let hasOverlay = false;
              if (results && results[0]) {
                hasOverlay = this.olmap.getOverlays().getArray().some(overlay => String(overlay.id) === String(results[0].alarm_id));
              }
              if (hasOverlay) {
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
          if (results.type === "ea") this.hiddenEarlyAlarms = []; // early alarms cleared
          if (results.type === "ea" || results.type === "ca") {
            {
              let overlays = this.olmap.getOverlays().getArray();
              for (let index = 0; index < overlays.length; index++) {
                const overlay = overlays[index];
                const overlayType = overlay.get ? overlay.get('type') : (overlay.type || (overlay as any).options?.type);
                if (results.type == "ea" && overlayType === 2) {
                  overlayIndexes.push(overlay); // push the early alarms
                } else if (results.type == "ca" && overlayType === 1) {
                  overlayIndexes.push(overlay); // push the confirmatory alarms
                }
              }
              overlayIndexes.forEach((overlay) => {
                self.olmap.removeOverlay(overlay); // remove the alarms from overlays
              });
            }
          }
          if (results.type !== "ca") {
            let layer = this.findLayer("radar_tracks");
            if (layer) {
              let source = layer.getSource();
              let features = source.getFeatures().map((feature, key) => {
                return {
                  alarm_id: feature.getProperties().id ?? feature.getId(),
                  track_length: feature.getGeometry().getCoordinates().length,
                };
              });
              this.alarmService
                .clearAlarmTracks({ intrusion_tracks: features })
                .subscribe(
                  (res) => {
                    source.clear();
                  },
                  (err) => {
                    console.log("--- err --- ", err);
                  }
                );
            }
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

  // ---------------- Slew TI window buttons: feedback ----------------
  demoCamState = "";       // shown in the DEMO picture after a button press
  private demoCamStateAt = 0;

  // Start / Stop Tracking need an alarm: open Slew TI from an alarm card (camera icon) to select one.
  private needSlewAlarm(action: string): boolean {
    if (this.activeSlewAlarm) return true;
    this.toastr.warning(action + ": no alarm selected. Open Slew TI from an alarm card in the left list.");
    return false;
  }

  // In DEMO mode the buttons act on the demo picture instead of a real camera.
  private camDemo(state: string, message: string): boolean {
    if (!this.useDemoFeed("slew")) return false;
    this.demoCamState = state;
    this.demoCamStateAt = Date.now();
    this.demoCamApply(state);
    console.log("DEMO: " + message);
    return true;
  }

  private camOk(message: string, res: any) {
    console.log(message, res);
    this.toastr.success(message);
  }

  private camFail(err: any) {
    console.log("Camera server error:", err);
    this.toastr.error(this.apiErrorText(err, "Camera server", server_info.CAMERA_API));
  }

  // Server answered with an error (e.g. 400 + {"status":"error","message":...}) -> show its message.
  // No answer at all (status 0 / network error) -> "not reachable".
  apiErrorText(err: any, name: string, url: string): string {
    const status = err && typeof err.status === "number" ? err.status : 0;
    if (status > 0) {
      const msg = err.error && (err.error.message || err.error.detail);
      return name + ": " + (msg ? msg : "error " + status);
    }
    return name + " not reachable (" + url + ")";
  }

  // Camera service health (spec v2: GET :8000/health) - shown as CAM LINK UP / DOWN in the Slew TI window
  camLink: "unknown" | "up" | "down" = "unknown";
  camHealth: any = null;
  private camHealthTimer: any = null;
  private startCamHealth() {
    if (this.camHealthTimer) return;
    this.camHealthTimer = setInterval(() => this.pollCamHealth(), 5000);
  }
  private stopCamHealth() {
    if (this.camHealthTimer) clearInterval(this.camHealthTimer);
    this.camHealthTimer = null;
  }
  pollCamHealth() {
    if (!this.enableVideo || this.useDemoFeed("slew")) { this.camLink = "unknown"; return; }
    this.dataService.cameraHealth().subscribe(
      (h: any) => { this.camHealth = h; this.camLink = "up"; },
      () => { this.camHealth = null; this.camLink = "down"; }
    );
  }
  get camHealthTitle(): string {
    const h = this.camHealth;
    if (!h) return "Camera server " + (this.camLink === "down" ? "not reachable" : "");
    return "Camera " + (h.camera || "") + (h.zoom ? " | EO preset " + h.zoom.last_eo + ", IR preset " + h.zoom.last_ir : "") + (h.kafka ? " | Kafka " + h.kafka : "");
  }

  // ---------------- UAV Controls (Drone API spec v2) ----------------
  // Panel under the UAV video. DRONE_DEMO = true drives the simulated drone instead of the real one.
  isUavCtlExpanded = false;
  uavCtl = { trackId: null as number, lat: 22.1320, lon: 89.0550, alt: 250, setAlt: 250 };
  uavLink: "unknown" | "up" | "down" = "unknown";
  uavTelemetry: any = null;   // last /telemetry drone entry
  uavHealth: any = null;      // last /health response
  private uavPollTimer: any = null;
  private uavPollSkip = 0;
  demoDroneAlt = 250;
  demoCamTilt = -30;
  demoCamZoom = 1;
  demoPursuitTrack: number = null;
  private demoPursuitTimer: any = null;
  private demoHeading = 0; // degrees, for nudges

  get droneDemo(): boolean {
    return !!(server_info as any).DRONE_DEMO;
  }

  // Track ID to pursue: typed in the box, else the alarm selected with the camera icon, else the Manual Input target
  // shown under Pursue so the operator sees which target the drone will chase
  get pursueTarget(): number { return this.uavTargetTrack(); }

  private uavTargetTrack(): number {
    const typed = parseInt(String(this.uavCtl.trackId), 10);
    if (!isNaN(typed) && isValidTrackId(typed)) return typed;   // track ID 0 is never a target
    if (this.activeSlewAlarm) {
      const id = radarTrackIdOf(this.activeSlewAlarm);
      if (id !== null) return id;
    }
    return null;
  }

  private droneOk(msg: string) { this.toastr.success(msg); }
  private droneFail(err: any) {
    console.log("Drone API error:", err);
    this.toastr.error(this.apiErrorText(err, "Drone server", (server_info as any).DRONE_API));
  }
  // onOk (optional): run when the drone server accepted the command
  private droneCall(obs: any, okMsg: string, onOk?: () => void) {
    obs.subscribe(
      (res: any) => {
        if (res && res.status === "error") { this.toastr.error(res.message || "Drone server returned an error"); return; }
        // /fly_track: accepted, but no fresh radar position yet -> the drone leaves when the next radar packet arrives
        if (res && res.immediate_send === false) {
          this.toastr.info(okMsg + " - waiting for fresh radar data" + (res.reason ? " (" + res.reason + ")" : ""));
          if (onOk) onOk();
          return;
        }
        this.droneOk(okMsg);
        if (onOk) onOk();
      },
      (err: any) => this.droneFail(err)
    );
  }

  // 1. Pursue radar track (POST /fly_track)
  uavPursue() {
    if (this.uavLockedWarn()) return;
    const id = this.uavTargetTrack();
    if (id === null) { this.toastr.warning("No target: click the camera icon on an alarm card first."); return; }
    if (this.droneDemo) {
      if (Number(this.simRadar.id) !== id || !this.simRadarTail.length) {
        console.log("DEMO: no simulated target with Track ID " + id + ". Start one in Manual Input (current: " + this.simRadar.id + ").");
        return;
      }
      this.startDemoPursuit(id);
      console.log("DEMO: pursuing track " + id);
      this.setUavMission(this.missionForTrack(id));
      return;
    }
    this.droneCall(this.dataService.droneFlyTrack(id), "Drone pursuing track " + id, () => this.setUavMission(this.missionForTrack(id)));
  }

  // ---- Which alarm / track the UAV was sent to: label on the UAV window + highlighted alarm card ----
  uavMission: any = null;
  private setUavMission(m: any) {
    this.uavMission = m;
    this.alarmService.publishUavMission(m);
  }
  // Pursue from UAV Controls: use the alarm picked with the camera icon if it is the same track
  private missionForTrack(id: number): any {
    const a: any = this.activeSlewAlarm;
    const same = a && radarTrackIdOf(a) === id;
    return { track_id: id, alarm_id: same ? a.alarm_id : null, alarm_no: same ? a.id : null, zone_id: same ? a.zone_id : null, at: Date.now() };
  }

  // 2. Fly to a point (POST /fly_to)
  uavFlyTo() {
    if (this.uavLockedWarn()) return;
    const lat = Number(this.uavCtl.lat), lon = Number(this.uavCtl.lon), alt = Number(this.uavCtl.alt);
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) { this.toastr.warning("Enter a valid latitude and longitude."); return; }
    if (this.droneDemo) {
      this.stopDemoPursuit();
      if (!isNaN(alt)) this.demoDroneAlt = alt;
      this.flySimUav([lon, lat]);
      console.log("DEMO: flying to " + lat.toFixed(5) + ", " + lon.toFixed(5));
      return;
    }
    this.droneCall(this.dataService.droneFlyTo(lat, lon, isNaN(alt) ? undefined : alt), "Drone flying to " + lat.toFixed(5) + ", " + lon.toFixed(5));
  }

  // 3. Set mission altitude (POST /set_altitude, 0-5000 m)
  uavSetAltitude() {
    if (this.uavLockedWarn()) return;
    const alt = Number(this.uavCtl.setAlt);
    if (isNaN(alt) || alt < 0 || alt > 5000) { this.toastr.warning("Altitude must be 0 - 5000 m."); return; }
    if (this.droneDemo) { this.demoDroneAlt = alt; console.log("DEMO: altitude set to " + alt + " m"); return; }
    this.droneCall(this.dataService.droneSetAltitude(alt), "Altitude set to " + alt + " m");
  }

  // The radar re-used a track id for a new target. The old alarm stays (as "<id>@<start time>") in the list;
  // its marker and trail leave the map so the new target with the same id starts clean.
  onAlarmArchived(msg: any) {
    if (!msg || msg.old_id === undefined || msg.old_id === null) return;
    const oldId = String(msg.old_id);
    this.removeOverlay([{ alarm_id: oldId }], false);
    this.tracksList = (this.tracksList || []).filter((t: any) => !(t && t.properties && String(t.properties.id) === oldId));
    if (this.activeSlewAlarm && String(this.activeSlewAlarm.alarm_id) === oldId && msg.archived_id) {
      this.activeSlewAlarm = { ...this.activeSlewAlarm, alarm_id: msg.archived_id };
    }
    this.alarmService.publishAlarmArchived(msg);
  }

  // Alarm card buttons: "Assign UAV" = pursue that alarm's track, "Return Home" = RTL.
  // Same behaviour and messages as the UAV Controls panel, including DEMO mode.
  onAlarmCardUavCommand(cmd: any) {
    if (!cmd) return;
    if (cmd.type === "rtl") { this.uavRtl(); return; }
    if (cmd.type !== "pursue") return;
    if (this.uavLockedWarn()) return;
    const id = Number(cmd.track_id);
    if (isNaN(id) || !isValidTrackId(id)) { this.toastr.warning("This alarm has no valid track ID - cannot assign the UAV."); return; }
    const mission = { track_id: id, alarm_id: cmd.alarm_id, alarm_no: cmd.alarm_no, zone_id: cmd.zone_id, at: Date.now() };
    if (this.droneDemo) {
      if (Number(this.simRadar.id) === id && this.simRadarTail.length) {
        this.startDemoPursuit(id);
        console.log("DEMO: UAV assigned - pursuing track " + id);
        this.setUavMission(mission);
        return;
      }
      // no moving demo target with this ID: fly the demo drone to where the alarm is
      const loc = cmd.location;
      if (loc && loc.length >= 2 && !isNaN(Number(loc[0])) && !isNaN(Number(loc[1]))) {
        this.stopDemoPursuit();
        this.flySimUav([Number(loc[0]), Number(loc[1])]);
        console.log("DEMO: UAV assigned - flying to the alarm of track " + id);
        this.setUavMission(mission);
        return;
      }
      console.log("DEMO: no position for track " + id + " - start a target in Manual Input.");
      return;
    }
    this.droneCall(this.dataService.droneFlyTrack(id), "UAV assigned - pursuing track " + id, () => this.setUavMission(mission));
  }

  // 4. Return to launch (POST /rtl)
  uavRtl() {
    if (this.droneDemo) { this.stopDemoPursuit(); this.returnSimUavHome(); console.log("DEMO: returning to launch"); this.setUavMission(null); return; }
    this.droneCall(this.dataService.droneRtl(), "Drone returning to launch", () => {
      this.setUavMission(null);
      this.uavTrackingActive = false;   // RTL stops visual tracking first (integrator spec 3)
      this.lastUavTarget = null;
    });
  }

  // ---------- Detection mode: on / off switch, only the operator turns it off ----------
  uavDetectionOn = false;
  uavDetectionBusy = false;

  // header icons: setUavDetection(true) = start, setUavDetection(false) = stop
  setUavDetection(turnOn: boolean) {
    if (this.uavDetectionBusy) return;
    if (turnOn === this.uavDetectionOn) {
      this.toastr.info(turnOn ? "Detection is already on" : "Detection is already off");
      return;
    }
    if (this.droneDemo) {
      this.uavDetectionOn = turnOn;
      console.log("DEMO: detection mode " + (turnOn ? "on" : "off"));
      return;
    }
    this.uavDetectionBusy = true;
    const call = turnOn ? this.dataService.droneDetectionStart() : this.dataService.droneDetectionStop();
    call.subscribe(
      (res: any) => {
        this.uavDetectionBusy = false;
        if (res && res.status === "error") { this.toastr.error(res.message || "Drone server returned an error"); return; }
        this.uavDetectionOn = turnOn; // only changes when the drone accepted it
        this.droneOk(turnOn ? "Detection mode on" : "Detection mode off");
      },
      (err: any) => {
        this.uavDetectionBusy = false;
        this.droneFail(err);
      }
    );
  }

  // ---------- Tracking mode: click one point on the UAV video ----------
  // Button turns the video interactive; the next click sends that pixel (x, y) and switches the mode off.
  uavPickMode = false;
  uavPickMarker: { left: number; top: number } | null = null;
  private uavPickMarkerTimer: any = null;

  toggleUavPickMode() {
    this.uavPickMode = !this.uavPickMode;
  }

  // message shown inside the video box (visible in full screen too, where pop-up toasts are hidden)
  uavPickStatus: string | null = null;
  private uavPickStatusTimer: any = null;
  showUavPickStatus(msg: string) {
    this.uavPickStatus = msg;
    if (this.uavPickStatusTimer) clearTimeout(this.uavPickStatusTimer);
    this.uavPickStatusTimer = setTimeout(() => (this.uavPickStatus = null), 3000);
  }

  // Full screen of a whole video panel: open its controls while in full screen, put them back after
  fsPanel: string | null = null;
  private fsRestore: { uav: boolean; ptz: boolean } | null = null;

  @HostListener("document:fullscreenchange")
  @HostListener("document:webkitfullscreenchange")
  onPanelFullscreenChange() {
    const d: any = document;
    const el: any = d.fullscreenElement || d.webkitFullscreenElement;
    const id = el && (el.id === "uav-panel" || el.id === "slew-ti-panel") ? el.id : null;
    if (id) {
      if (!this.fsRestore) this.fsRestore = { uav: this.isUavCtlExpanded, ptz: this.isPtzExpanded };
      if (id === "uav-panel") this.isUavCtlExpanded = true;
      if (id === "slew-ti-panel") this.isPtzExpanded = true;
    } else if (this.fsRestore) {
      this.isUavCtlExpanded = this.fsRestore.uav;
      this.isPtzExpanded = this.fsRestore.ptz;
      this.fsRestore = null;
    }
    this.fsPanel = id;
  }

  exitUavFullscreen() {
    const d: any = document;
    if (d.fullscreenElement && d.exitFullscreen) d.exitFullscreen();
    else if (d.webkitFullscreenElement && d.webkitExitFullscreen) d.webkitExitFullscreen();
  }

  @HostListener("document:keydown.escape")
  cancelUavPickMode() {
    if (this.uavPickMode) this.uavPickMode = false;
  }

  onUavVideoClick(event: MouseEvent) {
    if (!this.uavPickMode) return;
    const wrapper = event.currentTarget as HTMLElement;
    const media: any = wrapper && wrapper.querySelector("#uav-video, #uav-demo-canvas");
    if (!media) return;

    // size of the video frame itself (MJPEG image or demo canvas)
    const rect = media.getBoundingClientRect();
    const frameW = media.naturalWidth || media.width || 0;
    const frameH = media.naturalHeight || media.height || 0;
    if (!frameW || !frameH || !rect.width || !rect.height) {
      this.toastr.warning("No video picture yet - try again when the video is showing.");
      this.showUavPickStatus("No video picture yet");
      return; // stay in tracking mode
    }

    // undo the CSS object-fit scaling/cropping (the video uses "cover")
    const fit = getComputedStyle(media).objectFit;
    let scale = 1, offX = 0, offY = 0, sx = rect.width / frameW, sy = rect.height / frameH;
    if (fit === "cover" || fit === "contain" || fit === "scale-down") {
      scale = fit === "cover" ? Math.max(sx, sy) : Math.min(sx, sy, fit === "scale-down" ? 1 : Infinity);
      sx = sy = scale;
      offX = (rect.width - frameW * scale) / 2;
      offY = (rect.height - frameH * scale) / 2;
    }
    // The browser reports the screen pixel that was clicked; use its centre (+0.5), then
    // floor = the picture pixel the click is inside (0 .. width-1, 0 .. height-1).
    // A click on the outermost screen pixel of the picture is kept inside it (clamped), not refused.
    const px = (event.clientX + 0.5 - rect.left - offX) / sx;
    const py = (event.clientY + 0.5 - rect.top - offY) / sy;
    const edge = 1 / Math.min(sx, sy); // one screen pixel, in picture pixels
    if (px < -edge || py < -edge || px >= frameW + edge || py >= frameH + edge) {
      this.toastr.warning("Click inside the video picture.");
      this.showUavPickStatus("Click inside the picture");
      return; // stay in tracking mode
    }
    const x = Math.max(0, Math.min(frameW - 1, Math.floor(px)));
    const y = Math.max(0, Math.min(frameH - 1, Math.floor(py)));

    // Send the point in the UAV camera's own resolution (ICD 6.2: 1280x720), whatever size the player is.
    // The picture is shown with its true aspect ratio ("contain"), so the scale is the same across and down.
    const srcW = +(server_info as any).UAV_VIDEO_WIDTH || frameW;
    const srcH = +(server_info as any).UAV_VIDEO_HEIGHT || frameH;
    const sendX = Math.min(srcW - 1, Math.floor(((x + 0.5) * srcW) / frameW));
    const sendY = Math.min(srcH - 1, Math.floor(((y + 0.5) * srcH) / frameH));

    // one click only: leave tracking mode straight away
    this.uavPickMode = false;

    // small marker where the user clicked
    const wRect = wrapper.getBoundingClientRect();
    this.uavPickMarker = { left: event.clientX - wRect.left, top: event.clientY - wRect.top };
    if (this.uavPickMarkerTimer) clearTimeout(this.uavPickMarkerTimer);
    this.uavPickMarkerTimer = setTimeout(() => (this.uavPickMarker = null), 1500);

    if (this.droneDemo) {
      console.log("DEMO: tracking point x=" + sendX + ", y=" + sendY + " of " + srcW + "x" + srcH + " (picture shown " + frameW + "x" + frameH + ")");
      this.showUavPickStatus("Tracking point x " + sendX + ", y " + sendY);
      this.lastUavTarget = { x: sendX, y: sendY, w: srcW, h: srcH };
      this.uavTrackingActive = true;
      return;
    }
    const okMsg = "Target sent: x " + sendX + ", y " + sendY + " (" + srcW + "x" + srcH + ")";
    this.showUavPickStatus("Sending x " + sendX + ", y " + sendY + "...");
    this.lastUavTarget = { x: sendX, y: sendY, w: srcW, h: srcH };
    this.dataService.droneTrackPixel(sendX, sendY, srcW, srcH).subscribe(
      (res: any) => {
        if (res && res.status === "error") {
          const m = res.message || "Drone server returned an error";
          this.toastr.error(m);
          this.showUavPickStatus("Not sent: " + m);
          return;
        }
        this.droneOk(okMsg);
        this.showUavPickStatus(okMsg);
        this.uavTrackingActive = true;   // ICD: until STOP / ACK OFF;  drone_api: "status":"tracking" (VISUAL_TRACKING)
        if (!this.uavIcdMode) this.uavAutoMode = (res && res.auto_mode) || "VISUAL_TRACKING";
      },
      (err: any) => {
        this.droneFail(err);
        this.showUavPickStatus("Not sent: drone server error");
      }
    );
  }

  // 5. Stop tracking and loiter (POST /stop_tracking)
  uavStopTracking() {
    if (this.droneDemo) { this.stopDemoPursuit(); this.stopSimUav(); console.log("DEMO: stopped, holding position"); return; }
    this.droneCall(this.dataService.droneStopTracking(), "Tracking stopped - drone holding position");
  }

  // ---------- SDE ICD target tracking state (from the backend: TRACK_STATUS_ACK / DETECTION_STATUS_ACK) ----------
  get uavIcdMode(): boolean { return (server_info as any).UAV_CONTROL !== "drone_api"; }
  uavTrackingActive = false;          // target tracking on (ACK ON, or target sent and not stopped yet)
  uavAutoMode = "";                   // drone_api: IDLE | RADAR_PURSUIT | VISUAL_TRACKING (from GET /health or telemetry)

  // Visual (click-to-track) tracking is on: drone movement, Pursue, Fly To and altitude are locked;
  // camera, Stop tracking and RTL stay allowed (ICD sections 8 / 10, integrator spec section 3).
  get uavTrackLock(): boolean {
    return this.uavTrackingActive || this.uavAutoMode === "VISUAL_TRACKING";
  }
  private uavLockedWarn(): boolean {
    if (!this.uavTrackLock) return false;
    this.toastr.warning("Visual tracking is on - stop tracking first (camera controls and RTL still work).");
    return true;
  }

  // drone_api: keep the buttons in step with the drone (GET /health and Kafka drone_telemetry carry these fields)
  syncUavState(h: any) {
    if (!h || this.uavIcdMode || this.droneDemo) return;
    if (typeof h.auto_mode === "string") this.uavAutoMode = h.auto_mode;
    if (typeof h.visual_tracking_active === "boolean") {
      this.uavTrackingActive = h.visual_tracking_active;
      if (!h.visual_tracking_active) this.lastUavTarget = null;
    }
    if (typeof h.detection_enabled === "boolean" && !this.uavDetectionBusy) this.uavDetectionOn = h.detection_enabled;
  }
  uavTrackAck: "" | "ON" | "OFF" = ""; // last TRACK_STATUS_ACK from the GCS
  uavDetectAck: "" | "ON" | "OFF" = "";
  lastUavTarget: { x: number; y: number; w: number; h: number } = null;
  private uavIcdPollBusy = false;

  private pollUavIcd() {
    if (!this.uavIcdMode || this.droneDemo || this.uavIcdPollBusy) return;
    this.uavIcdPollBusy = true;
    this.dataService.uavIcdStatus().subscribe(
      (s: any) => {
        this.uavIcdPollBusy = false;
        if (!s || s.status === "error") return;
        this.uavTrackingActive = !!s.trackingActive;
        this.uavTrackAck = s.tracking || "";
        this.uavDetectAck = s.detection || "";
        if (s.detection === "ON" || s.detection === "OFF") this.uavDetectionOn = s.detection === "ON";
      },
      () => (this.uavIcdPollBusy = false)
    );
  }

  // {"type":"STOP_TRACKING",...} (ICD 6.3): stops target tracking; movement commands are allowed again
  uavStopTargetTracking() {
    if (this.droneDemo) { this.uavTrackingActive = false; this.lastUavTarget = null; console.log("DEMO: target tracking stopped"); return; }
    // drone_api: POST /visual_track/stop -> the drone loiters where it is (no RTL, no radar pursuit)
    this.droneCall(this.dataService.uavStopTargetTracking(), "Visual tracking stopped - drone holding position", () => {
      this.uavTrackingActive = false;
      this.uavAutoMode = this.uavIcdMode ? this.uavAutoMode : "IDLE";
      this.lastUavTarget = null;
    });
    if (this.uavIcdMode) { this.uavTrackingActive = false; this.lastUavTarget = null; }
  }

  // Manual nudge (POST /move/<direction>)
  uavMove(direction: string) {
    // ICD section 8 / integrator spec 3: UAV movement is not sent while visual tracking is active
    if (this.uavLockedWarn()) return;
    if (this.droneDemo) {
      this.stopDemoPursuit();
      this.stopSimUav();
      if (direction === "yaw_left") { this.demoHeading = (this.demoHeading + 345) % 360; }
      else if (direction === "yaw_right") { this.demoHeading = (this.demoHeading + 15) % 360; }
      else {
        const rel = { forward: 0, right: 90, backward: 180, left: 270 }[direction];
        const start = this.simUavStart();
        this.simUavPos = this.simMove(start, (this.demoHeading + rel) % 360, 25);
        this.simSendUav(this.simUavPos);
      }
      console.log("DEMO: " + direction.replace("_", " "));
      return;
    }
    this.droneCall(this.dataService.droneMove(direction), "Sent: " + direction.replace("_", " "));
  }

  // Payload camera gimbal (POST /camera/<action>)
  uavCamera(action: string) {
    if (this.droneDemo) {
      if (action === "up") this.demoCamTilt = Math.min(0, this.demoCamTilt + 5);
      if (action === "down") this.demoCamTilt = Math.max(-90, this.demoCamTilt - 5);
      if (action === "zoom_in") this.demoCamZoom = Math.min(30, this.demoCamZoom + 1);
      if (action === "zoom_out") this.demoCamZoom = Math.max(1, this.demoCamZoom - 1);
      console.log("DEMO: camera " + action.replace("_", " ") + " (tilt " + this.demoCamTilt + "°, zoom " + this.demoCamZoom + "x)");
      return;
    }
    this.droneCall(this.dataService.droneCamera(action), "Camera: " + action.replace("_", " "));
  }

  // Demo pursuit: keep re-vectoring the simulated drone to the moving simulated target
  private startDemoPursuit(trackId: number) {
    this.stopDemoPursuit();
    this.demoPursuitTrack = trackId;
    const go = () => {
      if (!this.simRadarTail.length) return;
      const t = this.simRadarTail[this.simRadarTail.length - 1];
      this.flySimUav([t[0], t[1]]);
    };
    go();
    this.demoPursuitTimer = setInterval(go, 3000);
  }

  private stopDemoPursuit() {
    if (this.demoPursuitTimer) clearInterval(this.demoPursuitTimer);
    this.demoPursuitTimer = null;
    this.demoPursuitTrack = null;
  }

  // Telemetry: poll GET /telemetry + /health every second while the UAV window is open.
  // Positions the drone marker on the map (heading, altitude, battery).
  private startUavPolling() {
    if (this.uavPollTimer) return;
    this.uavPollTimer = setInterval(() => this.pollUav(), 1000);
  }

  private stopUavPolling() {
    if (this.uavPollTimer) clearInterval(this.uavPollTimer);
    this.uavPollTimer = null;
  }

  private pollUav() {
    if (!this.enableUavVideo) return;
    this.pollUavIcd();
    if (this.droneDemo) {
      const m = this.uavMarkers["sim-uav"] || this.uavMarkers["uav-home"];
      const p = m ? m.getGeometry().getCoordinates() : this.uavHome;
      this.uavLink = "up";
      this.uavTelemetry = { latitude: p[1], longitude: p[0], altitude: this.demoDroneAlt, heading: this.demoHeading, battery_voltage: 24.6, stale: false };
      return;
    }
    // Kafka drone_telemetry arrived in the last 3 s -> no need to ask /telemetry (it is the backup)
    if (this.kafkaTelemetryFresh()) {
      this.dataService.droneHealth().subscribe((h: any) => { this.uavHealth = h; this.syncUavState(h); }, () => (this.uavHealth = null));
      return;
    }
    if (this.uavPollSkip > 0) { this.uavPollSkip--; return; } // back off after a failure
    this.dataService.droneTelemetry().subscribe(
      (res: any) => {
        const drones = res && res.drones ? res.drones : {};
        const key = drones["default"] ? "default" : Object.keys(drones)[0]; // "default" = mission UAV SDE52
        this.applyDroneTelemetry(key ? drones[key] : null, key);
      },
      () => { this.uavLink = "down"; this.uavPollSkip = 4; }
    );
    this.dataService.droneHealth().subscribe((h: any) => { this.uavHealth = h; this.syncUavState(h); }, () => (this.uavHealth = null));
  }

  // Drone position from the Kafka topic drone_telemetry (backend forwards it over the WebSocket).
  // Same data as GET /telemetry, but pushed as soon as it arrives. Ignored while DRONE_DEMO is on.
  telemetrySource: "" | "kafka" | "poll" = "";
  private lastKafkaTelemetryAt = 0;

  kafkaTelemetryFresh(): boolean {
    return Date.now() - this.lastKafkaTelemetryAt < 3000;
  }

  onKafkaDroneTelemetry(d: any) {
    if (this.droneDemo || !d) return;
    this.lastKafkaTelemetryAt = Date.now();
    this.syncUavState(d);
    this.applyDroneTelemetry(d, d.drone_key || d.drone_id || "default", "kafka");
  }

  private applyDroneTelemetry(raw: any, key: string, source: "kafka" | "poll" = "poll") {
    // API spec v2: always use altitude_m / heading_deg (altitude / heading kept only as a fallback)
    const d = raw ? {
      ...raw,
      altitude: raw.altitude_m !== undefined && raw.altitude_m !== null ? raw.altitude_m : raw.altitude,
      heading: raw.heading_deg !== undefined && raw.heading_deg !== null ? raw.heading_deg : raw.heading,
    } : null;
    this.uavTelemetry = d;
    this.uavLink = d && !d.stale ? "up" : "down";
    if (d) this.telemetrySource = source;
    if (d && d.latitude !== undefined && d.longitude !== undefined) {
      this.updateUavPosition({
        category: "uav_status",
        data: {
          // one marker whichever source (Kafka says "SDE52", /telemetry says "default")
          ip: "drone-uav", lat: d.latitude, lon: d.longitude, heading: d.heading,
          remaining_time: d.battery_voltage !== undefined ? d.battery_voltage + "V" : "",
        },
      });
    }
  }

  // ---------------- DEMO video for Slew TI / UAV windows ----------------
  // Animated, clearly-labelled DEMO picture drawn on a canvas, for testing without real cameras.
  // Controlled by config.ts -> stream_urls.DEMO_FEED ('on' | 'auto' | 'off').
  feedFailed = { slew: false, uav: false };
  private demoTimer: any = null;
  private demoScene: any = null;

  useDemoFeed(which: "slew" | "uav"): boolean {
    const mode = (stream_urls as any).DEMO_FEED || "off";
    if (mode === "on") return true;
    if (mode === "auto") return this.feedFailed[which];
    return false;
  }

  onFeedError(which: "slew" | "uav") {
    this.feedFailed[which] = true; // only used in 'auto' mode
  }

  private startDemoFeeds() {
    if (this.demoTimer) return;
    // build a fixed random scene once
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    this.demoScene = {
      trees: Array.from({ length: 200 }, () => ({ x: rnd(0, 1), h: rnd(0.08, 0.22), w: rnd(0.02, 0.05) })),
      patches: Array.from({ length: 70 }, () => ({ x: rnd(0, 1), y: rnd(0, 1), r: rnd(0.03, 0.09) })),
      t0: Date.now(),
    };
    // draw ~12 frames/second outside Angular so the map page doesn't re-render every frame
    this.ngZone.runOutsideAngular(() => {
      this.demoTimer = setInterval(() => this.drawDemoFrames(), 80);
    });
  }

  private stopDemoFeeds() {
    if (this.demoTimer) clearInterval(this.demoTimer);
    this.demoTimer = null;
  }

  private fitCanvas(c: HTMLCanvasElement): CanvasRenderingContext2D {
    const w = c.clientWidth || 220, h = c.clientHeight || 140;
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    return c.getContext("2d");
  }

  private demoHud(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, lines: string[]) {
    const t = new Date();
    const time = t.toTimeString().slice(0, 8);
    ctx.font = "bold 10px monospace";
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, w, 14);
    ctx.fillStyle = "#e6e6e6";
    ctx.textAlign = "left";
    ctx.fillText(title, 4, 10);
    ctx.textAlign = "right";
    ctx.fillText(time, w - 4, 10);
    // blinking DEMO badge on its own line, top-right under the clock (never overlaps the title)
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(w - 74, 14, 74, 12);
    if (Math.floor(Date.now() / 600) % 2 === 0) {
      ctx.fillStyle = "#ff3b30";
      ctx.beginPath(); ctx.arc(w - 66, 20, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "#ff3b30";
    ctx.textAlign = "right";
    ctx.fillText("DEMO FEED", w - 4, 23);
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, h - 12 * lines.length - 4, w, 12 * lines.length + 4);
    ctx.fillStyle = "#9be7a1";
    ctx.font = "9px monospace";
    lines.forEach((l, i) => ctx.fillText(l, 4, h - 12 * (lines.length - i) + 6));
  }

  private demoCrosshair(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    ctx.strokeStyle = color; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 14, y); ctx.lineTo(x - 4, y); ctx.moveTo(x + 4, y); ctx.lineTo(x + 14, y);
    ctx.moveTo(x, y - 14); ctx.lineTo(x, y - 4); ctx.moveTo(x, y + 4); ctx.lineTo(x, y + 14);
    ctx.stroke();
    ctx.strokeRect(x - 20, y - 14, 40, 28);
  }

  private drawDemoFrames() {
    if (!this.demoScene) return;
    const sec = (Date.now() - this.demoScene.t0) / 1000;
    const slew = document.getElementById("slew-demo-canvas") as HTMLCanvasElement;
    if (slew) this.drawSlewDemo(slew, sec);
    const uav = document.getElementById("uav-demo-canvas") as HTMLCanvasElement;
    if (uav) this.drawUavDemo(uav, sec);
  }

  // ---- Demo Slew TI camera model: where the pretend tower camera is looking ----
  // az/el/fov move smoothly towards tAz/tEl/tFov; every camera button changes these, so the picture really reacts.
  private dcam = { az: 124, el: -2, fov: 40, tAz: 124, tEl: -2, tFov: 40, mode: "idle" as "idle" | "track" | "search", searchAt: 0 };
  private readonly DEMO_HOME_AZ = 124;
  demoZoomM: number = null;

  private angDiff(a: number, b: number): number { return ((a - b + 540) % 360) - 180; }
  private demoTargetAz(sec: number): number { return this.DEMO_HOME_AZ + Math.sin(sec * 0.12) * 15; }

  // called from camDemo(): turn a button press into a camera movement
  private demoCamApply(state: string) {
    const d = this.dcam;
    const sec = this.demoScene ? (Date.now() - this.demoScene.t0) / 1000 : 0;
    if (state === "TRACKING STOPPED" || state === "TRACK CANCELLED" || state === "AUTO ACQUIRE OFF") { d.mode = "idle"; d.tAz = d.az; d.tEl = d.el; }
    else if (state.indexOf("TRACKING ") === 0 || state === "MANUAL LOCK") d.mode = "track";
    else if (state === "RETURNING HOME") { d.mode = "idle"; d.tAz = 0; d.tEl = 0; d.tFov = 40; } // spec: home = pan 0, tilt 0
    else if (state === "AUTO ACQUIRE") { d.mode = "search"; d.searchAt = Date.now(); }
    else if (state.indexOf("SLEW") === 0) { d.mode = "idle"; d.tAz = this.demoTargetAz(sec); d.tEl = -2; d.tFov = 20; }
    else if (state.indexOf("MOVE") === 0) {
      d.mode = "idle";
      if (this.demoPan !== null) d.tAz = Number(this.demoPan);
      if (this.demoTilt !== null) d.tEl = Number(this.demoTilt);
      if (this.demoZoomM !== null) d.tFov = Math.max(1.5, Math.min(40, 40 * 250 / Math.max(250, this.demoZoomM)));
    }
  }

  private drawSlewDemo(c: HTMLCanvasElement, sec: number) {
    const ctx = this.fitCanvas(c); if (!ctx) return;
    const w = c.width, h = c.height, thermal = this.isThermalFeed;
    const d = this.dcam;
    const targetAz = this.demoTargetAz(sec);
    // camera behaviour
    if (d.mode === "track") { d.tAz = targetAz; d.tEl = -2; }
    if (d.mode === "search") {
      if (Date.now() - d.searchAt < 2500) { d.tAz = this.DEMO_HOME_AZ + Math.sin(sec * 1.5) * 25; d.tEl = -2; }
      else { d.mode = "track"; this.demoCamState = "AUTO ACQUIRED"; this.demoCamStateAt = Date.now(); }
    }
    const k = d.mode === "idle" ? 0.12 : 0.25;
    d.az = (d.az + this.angDiff(d.tAz, d.az) * k + 360) % 360;
    d.el += (d.tEl - d.el) * k;
    d.fov += (d.tFov - d.fov) * k;
    const fov = d.fov, vfov = fov * h / w, mag = 40 / fov;
    const xOf = (az: number) => w / 2 + this.angDiff(az, d.az) / fov * w;
    const yOf = (el: number) => h * 0.45 + (d.el - el) / vfov * h;
    const horizon = yOf(0);
    // sky + ground
    const hy = Math.max(0, Math.min(h, horizon));
    let g = ctx.createLinearGradient(0, hy - h, 0, hy);
    g.addColorStop(0, thermal ? "#050505" : "#6f8fa8"); g.addColorStop(1, thermal ? "#1a1a1a" : "#b9c8d2");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, hy);
    g = ctx.createLinearGradient(0, hy, 0, hy + h);
    g.addColorStop(0, thermal ? "#2a2a2a" : "#4d5b34"); g.addColorStop(1, thermal ? "#121212" : "#2f3a22");
    ctx.fillStyle = g; ctx.fillRect(0, hy, w, h - hy);
    // river band (between 5 and 7.5 degrees below the horizon)
    ctx.fillStyle = thermal ? "#0b0b0b" : "#5f7a86";
    ctx.beginPath();
    for (let sx = 0; sx <= w; sx += 6) {
      const az = d.az + (sx - w / 2) / w * fov;
      const y = yOf(-5) + Math.sin(az * 0.5 + sec * 0.3) * 3;
      if (sx === 0) ctx.moveTo(sx, y); else ctx.lineTo(sx, y);
    }
    ctx.lineTo(w, yOf(-7.5)); ctx.lineTo(0, yOf(-7.5)); ctx.fill();
    // mangrove tree line all around the tower (360 degrees)
    ctx.fillStyle = thermal ? "#3a3a3a" : "#24331c";
    this.demoScene.trees.forEach((t: any) => {
      const x = xOf(t.x * 360);
      const tw = t.w * 40 / fov * w, th = t.h * 12 / vfov * h;
      if (x < -tw || x > w + tw) return;
      ctx.beginPath(); ctx.ellipse(x, horizon - th * 0.8, tw, th, 0, 0, Math.PI * 2); ctx.fill();
    });
    // moving target (person / small boat) - only visible when the camera points at it
    const tx = xOf(targetAz), ty = yOf(-2) + Math.sin(sec * 1.7) * 1.5;
    const sz = Math.min(mag, 6);
    if (tx > -30 && tx < w + 30) {
      if (thermal) {
        const rg = ctx.createRadialGradient(tx, ty - 5 * sz, 1, tx, ty - 5 * sz, 14 * sz);
        rg.addColorStop(0, "rgba(255,255,255,1)"); rg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = rg; ctx.fillRect(tx - 14 * sz, ty - 19 * sz, 28 * sz, 28 * sz);
        ctx.fillStyle = "#ffffff";
      } else {
        ctx.fillStyle = "#1b1b1b";
      }
      ctx.fillRect(tx - 2 * sz, ty - 9 * sz, 4 * sz, 9 * sz);
      ctx.beginPath(); ctx.arc(tx, ty - 11 * sz, 2.5 * sz, 0, Math.PI * 2); ctx.fill();
    }
    // sensor noise
    ctx.fillStyle = thermal ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    for (let i = 0; i < 160; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    // boresight crosshair (centre of the camera)
    this.demoCrosshair(ctx, w / 2, h / 2, thermal ? "#ffcc00" : "#00e5ff");
    // lock box on the target while tracking / searching box while acquiring
    ctx.font = "bold 9px monospace"; ctx.textAlign = "left";
    if (d.mode === "track" && tx > 0 && tx < w) {
      const bw = 12 * sz + 8, bh = 16 * sz + 8;
      ctx.strokeStyle = "#34c759"; ctx.lineWidth = 2;
      ctx.strokeRect(tx - bw / 2, ty - 13 * sz - 4, bw, bh);
      ctx.fillStyle = "#34c759"; ctx.fillText("LOCK", tx - bw / 2, ty - 13 * sz - 7);
    } else if (d.mode === "search") {
      ctx.strokeStyle = "#ffcc00"; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
      ctx.strokeRect(w / 2 - 34, h / 2 - 22, 68, 44); ctx.setLineDash([]);
      ctx.fillStyle = "#ffcc00"; ctx.fillText("SEARCHING", w / 2 - 34, h / 2 - 25);
    }
    const trk = this.activeSlewAlarm ? "TRK " + (this.activeSlewAlarm.alarm_id || this.activeSlewAlarm.id) : "NO TRACK";
    if (this.demoCamState && Date.now() - this.demoCamStateAt < 60000) {
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(w / 2 - 70, 36, 140, 15);
      const good = this.demoCamState.indexOf("TRACKING ") === 0 && this.demoCamState !== "TRACKING STOPPED";
      ctx.fillStyle = good || this.demoCamState === "MANUAL LOCK" || this.demoCamState === "AUTO ACQUIRED" ? "#9be7a1" : "#ffcc00";
      ctx.fillText(this.demoCamState, w / 2, 47);
      ctx.textAlign = "left";
    }
    const modeTxt = d.mode === "track" ? "TRACKING" : (d.mode === "search" ? "SEARCHING" : "MANUAL");
    this.demoHud(ctx, w, h, "TI-1 " + (thermal ? "THERMAL" : "DAY"), [
      trk + "  " + modeTxt,
      "AZ " + d.az.toFixed(1) + "°  EL " + d.el.toFixed(1) + "°  ZOOM " + mag.toFixed(1) + "x",
    ]);
  }

  // ---- Demo UAV camera: top-down view that follows the drone's real (simulated) position, heading,
  // altitude and camera tilt/zoom - so Fly To, arrows, yaw, altitude and camera buttons all change the picture.
  private uavView = { hdg: 0, zoom: 1, tilt: -30, alt: 250 };

  private drawUavDemo(c: HTMLCanvasElement, sec: number) {
    const ctx = this.fitCanvas(c); if (!ctx) return;
    const w = c.width, h = c.height;
    const m = this.uavMarkers["sim-uav"] || this.uavMarkers["uav-home"];
    const pos = m ? m.getGeometry().getCoordinates() : this.uavHome;
    const flying = this.simUavRunning;
    // smooth the camera so changes are visible as movement
    const v = this.uavView;
    v.hdg = (v.hdg + this.angDiff(this.demoHeading, v.hdg) * 0.2 + 360) % 360;
    v.zoom += (this.demoCamZoom - v.zoom) * 0.2;
    v.tilt += (this.demoCamTilt - v.tilt) * 0.2;
    v.alt += (this.demoDroneAlt - v.alt) * 0.1;
    // metres east / north of the home point
    const cosLat = Math.cos(this.uavHome[1] * Math.PI / 180);
    const toM = (lon: number, lat: number) => [(lon - this.uavHome[0]) * 111320 * cosLat, (lat - this.uavHome[1]) * 110540];
    const [dx, dy] = toM(pos[0], pos[1]);
    const alt = Math.max(20, v.alt);
    const ppm = (w / 300) * (250 / alt) * v.zoom;                                    // pixels per metre
    const look = Math.min(150, alt * Math.tan((90 + v.tilt) * Math.PI / 180) * 0.25); // camera tilted forward looks a little ahead
    const hr = v.hdg * Math.PI / 180, cs = Math.cos(hr), sn = Math.sin(hr);
    const cx = dx + sn * look, cy = dy + cs * look;
    const toS = (x: number, y: number) => {
      const ex = x - cx, ny = y - cy;
      return [w / 2 + (ex * cs - ny * sn) * ppm, h / 2 - (ex * sn + ny * cs) * ppm];  // heading always points up
    };
    const R = Math.hypot(w, h) / 2 / ppm;   // view radius in metres
    // ground
    ctx.fillStyle = "#3d4a2a"; ctx.fillRect(0, 0, w, h);
    const cell = 400;
    if (R < cell * 4) {
      ctx.fillStyle = "#2a3520";
      for (let i = Math.floor((cx - R) / cell); i <= Math.floor((cx + R) / cell); i++) {
        for (let j = Math.floor((cy - R) / cell); j <= Math.floor((cy + R) / cell); j++) {
          this.demoScene.patches.forEach((p: any) => {
            const [sx, sy] = toS(i * cell + p.x * cell, j * cell + p.y * cell);
            const r = p.r * 300 * ppm;
            if (sx < -r || sx > w + r || sy < -r || sy > h + r) return;
            ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
          });
        }
      }
    }
    // winding creek (fixed on the ground, north-south)
    ctx.strokeStyle = "#56707b"; ctx.lineWidth = Math.max(2, 14 * ppm);
    ctx.beginPath();
    for (let k = 0; k <= 60; k++) {
      const y = cy - R + (2 * R) * k / 60;
      const [sx, sy] = toS(60 + 80 * Math.sin(y / 120), y);
      if (k === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    // target on the ground: the Manual Input radar target if there is one, else a small boat near home
    let tgt: number[];
    if (this.simRadarTail && this.simRadarTail.length) {
      const last: any = this.simRadarTail[this.simRadarTail.length - 1];
      tgt = toM(last[0], last[1]);
    } else {
      tgt = [120 + Math.sin(sec * 0.5) * 15, 80 + Math.cos(sec * 0.4) * 10];
    }
    const [tx, ty] = toS(tgt[0], tgt[1]);
    const tr = Math.max(2, Math.min(10, 4 * ppm));
    ctx.fillStyle = "#f2f2f2"; ctx.beginPath(); ctx.arc(tx, ty, tr, 0, Math.PI * 2); ctx.fill();
    // sky at the top when the camera is tilted up towards the horizon
    if (v.tilt > -25) {
      const sky = h * Math.min(1, (v.tilt + 25) / 25) * 0.45;
      const g = ctx.createLinearGradient(0, 0, 0, sky);
      g.addColorStop(0, "#6f8fa8"); g.addColorStop(1, "#b9c8d2");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, sky);
    }
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    for (let i = 0; i < 120; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    this.demoCrosshair(ctx, w / 2, h / 2, "#00e5ff");
    // lock box while pursuing
    if (this.demoPursuitTrack && tx > 0 && tx < w && ty > 0 && ty < h) {
      ctx.strokeStyle = "#34c759"; ctx.lineWidth = 2; ctx.strokeRect(tx - tr - 6, ty - tr - 6, 2 * tr + 12, 2 * tr + 12);
      ctx.fillStyle = "#34c759"; ctx.font = "bold 9px monospace"; ctx.textAlign = "left"; ctx.fillText("LOCK " + this.demoPursuitTrack, tx - tr - 6, ty - tr - 9);
    }
    // compass: arrow shows where North is
    const ccx = 14, ccy = 32;
    ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.beginPath(); ctx.arc(ccx, ccy, 10, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(ccx, ccy); ctx.rotate(-hr);
    ctx.fillStyle = "#ff3b30"; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(3, 0); ctx.lineTo(-3, 0); ctx.fill();
    ctx.fillStyle = "#e6e6e6"; ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(3, 0); ctx.lineTo(-3, 0); ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#e6e6e6"; ctx.font = "bold 8px monospace"; ctx.textAlign = "center"; ctx.fillText("N", ccx, ccy - 12 < 16 ? ccy + 19 : ccy - 12); ctx.textAlign = "left";
    const bat = Math.max(15, 100 - Math.floor(sec / 30));
    this.demoHud(ctx, w, h, "UAV SDE52  " + (this.demoPursuitTrack ? "PURSUE " + this.demoPursuitTrack : (flying ? "FLYING" : "HOVER")), [
      "ALT " + Math.round(this.demoDroneAlt) + "m HDG " + Math.round(this.demoHeading) + "° BAT " + bat + "%" + (flying ? " " + this.simUav.speed + "m/s" : ""),
      "CAM " + this.demoCamTilt + "° Z" + this.demoCamZoom + "x " + Number(pos[1]).toFixed(5) + "," + Number(pos[0]).toFixed(5),
    ]);
  }

  // ---------------- Default location button ----------------
  // Sundarbans site: between the radar (89.05194, 22.13) and the thermal camera (89.0529, 22.12855).
  siteCenter: number[] = [89.0525, 22.1310]; // [lon, lat]
  siteZoom = 14;

  goToDefaultLocation() {
    // use the map's current view (the view object can be replaced when the map is rebuilt)
    const view = this.olmap && this.olmap.getView();
    if (!view) return;
    view.animate({ center: this.siteCenter, zoom: this.siteZoom, duration: 1500 });
  }

  // ---------------- Clear Tracks ----------------
  private clearedTracksSubscription: Subscription;

  // Removes the dotted radar track lines (live and history) from the map.
  // Alarm markers and the alarm list are left alone - use Clear All / acknowledge for those.
  clearAllTracksOnMap() {
    if (!this.olmap) return;
    const layers = [...this.olmap.getLayers().getArray()];
    layers.forEach((layer: any) => {
      const title = layer && layer.get ? layer.get("title") : "";
      if (!title) return;
      if (title === "radar_tracks" || title === "uav_tracks") {
        const source = layer.getSource && layer.getSource();
        if (source && source.clear) source.clear(); // keep the layer so new tracks still draw
      } else if (String(title).indexOf("radartrack-") === 0) {
        this.olmap.removeLayer(layer); // history tracks drawn per alarm
      }
    });
    if (this.simTargetLayer) this.simTargetLayer.getSource().clear();
    this.simRadarTail = [];
    this.tracksList = [];
  }

  // ---------------- VMS (Video Management System) ----------------
  showVms = false;

  // ---------------- Track History (dashboard + path on the map) ----------------
  showTrackHistory = false;
  private historyLayer: any = null;

  toggleTrackHistory(open?: boolean) {
    this.showTrackHistory = open === undefined ? !this.showTrackHistory : open;
    if (!this.showTrackHistory) this.clearHistoryPath();
  }

  // Draw a saved track: dashed red line (orange if singleTrackColor is ""), green start, red end, small dots for each position; zoom to it.
  showHistoryPath(evt: { track: any; points: any[] }) {
    if (!this.olmap || !evt || !evt.points || !evt.points.length) return;
    this.clearHistoryPath();
    const coords = evt.points.map((p: any) => [Number(p.longitude), Number(p.latitude)]);
    const source = new VectorSource();
    if (coords.length > 1) {
      const line = new Feature({ geometry: new LineString(coords) });
      line.setStyle([
        new Style({ stroke: new Stroke({ color: "rgba(0,0,0,0.55)", width: 6 }) }),
        new Style({ stroke: new Stroke({ color: this.singleTrackColor || "#ffb020", width: 3, lineDash: [8, 6] }) }),
      ]);
      source.addFeature(line);
      const step = Math.max(1, Math.floor(coords.length / 200));
      for (let i = 0; i < coords.length; i += step) {
        const d = new Feature({ geometry: new Point(coords[i]) });
        d.setStyle(new Style({ image: new CircleStyle({ radius: 2, fill: new Fill({ color: this.singleTrackColor ? "#ff8a80" : "#ffd27a" }) }) }));
        source.addFeature(d);
      }
    }
    const mark = (c: number[], color: string, label: string) => {
      const f = new Feature({ geometry: new Point(c) });
      f.setStyle(new Style({
        image: new CircleStyle({ radius: 7, fill: new Fill({ color }), stroke: new Stroke({ color: "#fff", width: 2 }) }),
        text: new Text({ text: label, offsetY: -16, font: "bold 11px sans-serif", fill: new Fill({ color: "#fff" }), stroke: new Stroke({ color: "#000", width: 3 }) }),
      }));
      source.addFeature(f);
    };
    mark(coords[0], "#34c759", "START " + evt.track.track_id);
    if (coords.length > 1) mark(coords[coords.length - 1], "#ff3b30", "END");
    this.historyLayer = new VectorLayer({ source, zIndex: 25 } as any);
    this.historyLayer.set("title", "track_history");
    this.olmap.addLayer(this.historyLayer);
    try {
      const extent = source.getExtent();
      this.olmap.getView().fit(extent, { padding: [80, 700, 80, 380], maxZoom: 16, duration: 600 });
    } catch (e) { }
  }

  clearHistoryPath() {
    if (this.historyLayer && this.olmap) this.olmap.removeLayer(this.historyLayer);
    this.historyLayer = null;
  }

  // ---------------- Radar track colours ----------------
  // All radar tracks are drawn in ONE colour (red). To go back to a different colour per track ID,
  // set singleTrackColor to "" - the per-ID list below is then used again.
  singleTrackColor = "#ff3b30";
  // Distinct colours so tracks with different IDs can be told apart on the map.
  trackColors: string[] = ["#ff3b30", "#ffcc00", "#34c759", "#00e5ff", "#ff2dff", "#ff9500", "#5ac8fa", "#af52de", "#a2ff00", "#ff6f91"];

  trackColor(id: any): string {
    if (this.singleTrackColor) return this.singleTrackColor;
    const n = Math.abs(parseInt(String(id), 10));
    const index = isNaN(n)
      ? String(id).split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % this.trackColors.length
      : n % this.trackColors.length;
    return this.trackColors[index];
  }

  trackStyle(id: any) {
    return new Style({
      stroke: new Stroke({ color: this.trackColor(id), width: 4, lineDash: [1, 7], lineCap: "round" }),
    });
  }

  // Stop the looping alarm sound (it normally stops only when the alarm is acknowledged)
  stopAlarmSound() {
    try {
      this.audio.pause();
      this.audio.currentTime = 0;
    } catch (e) { }
  }

  // ---------------- Manual Input (simulate radar / UAV from the UI) ----------------
  // Messages pushed here go through the same handler as live WebSocket data.
  private localPush = new Subject<any>();
  showSimPanel = false;
  simMode: "auto" | "ui" = "auto"; // auto = send through backend, fall back to UI only if it fails

  // ---------- Manual Input panel resize ----------
  isSimResizing = false;
  private simResizeDir = '';
  private simResizeStartX = 0;
  private simResizeStartY = 0;
  private simStartRect = { top: 0, left: 0, width: 0, height: 0 };
  private readonly SIM_MIN_W = 280;
  private readonly SIM_MIN_H = 200;

  startSimResize(event: MouseEvent, dir: string) {
    event.preventDefault();
    event.stopPropagation();
    this.isSimResizing = true;
    this.simResizeDir = dir;
    this.simResizeStartX = event.clientX;
    this.simResizeStartY = event.clientY;
    const panel = (event.target as HTMLElement).closest('.sim-panel') as HTMLElement;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    this.simStartRect = { top: r.top, left: r.left, width: r.width, height: r.height };
  }

  @HostListener('document:mousemove', ['$event'])
  onSimResizeMove(event: MouseEvent) {
    if (!this.isSimResizing) return;
    event.preventDefault();
    const dx = event.clientX - this.simResizeStartX;
    const dy = event.clientY - this.simResizeStartY;
    const dir = this.simResizeDir;
    const s = this.simStartRect;
    let newTop = s.top, newLeft = s.left, newW = s.width, newH = s.height;
    if (dir.includes('e')) { newW = Math.max(this.SIM_MIN_W, s.width + dx); }
    if (dir.includes('w')) { newW = Math.max(this.SIM_MIN_W, s.width - dx); newLeft = s.left + (s.width - newW); }
    if (dir.includes('s')) { newH = Math.max(this.SIM_MIN_H, s.height + dy); }
    if (dir.includes('n')) { newH = Math.max(this.SIM_MIN_H, s.height - dy); newTop = s.top + (s.height - newH); }
    const panel = document.querySelector('.sim-panel') as HTMLElement;
    if (!panel) return;
    panel.style.width = newW + 'px';
    panel.style.height = newH + 'px';
    panel.style.top = newTop + 'px';
    panel.style.left = newLeft + 'px';
    panel.style.bottom = 'auto';
    panel.style.maxHeight = 'none';
  }

  @HostListener('document:mouseup')
  onSimResizeEnd() {
    if (this.isSimResizing) {
      this.isSimResizing = false;
      this.simResizeDir = '';
    }
  }

  // Radar position (sensor 161 in the sensors table) - used to compute target range.
  simRadarOrigin: number[] = [89.05194, 22.13]; // [lon, lat]
  simRadar = { id: MapsComponent.simNextTrackId(), lat: 22.1340, lon: 89.0560, heading: 270, speed: 5 };

  // Track IDs already used are remembered in this browser, so a refresh doesn't reuse one
  // (the backend ignores a track ID it has already seen, so a reused ID would not create a new alarm).
  private static simLastTrackId(): number {
    try {
      const v = Number(localStorage.getItem("simLastTrackId"));
      return v > 0 ? v : 9100; // 9001-9011 were used in earlier tests
    } catch (e) {
      return 9100;
    }
  }
  private static simNextTrackId(): number {
    return MapsComponent.simLastTrackId() + 1;
  }
  private simRememberTrackId(id: number) {
    try {
      if (id > MapsComponent.simLastTrackId()) localStorage.setItem("simLastTrackId", String(id));
    } catch (e) { }
  }
  simRadarRunning = false;
  simRadarStatus = "";
  private simRadarTimer: any;
  private simRadarTail: number[][] = [];

  simUav = { lat: 22.1320, lon: 89.0550, speed: 15 };
  simUavRunning = false;
  simUavStatus = "";
  private simUavTimer: any;
  private simUavPos: number[] = null; // [lon, lat]
  private simTargetLayer: any;

  private simApi(path: string) {
    return this.dataService.config.serverApiUrl.map.replace(/\/map$/, "") + path;
  }

  private simRadarRun = 0;
  private simRadarNewTrack = false; // true until the first point of a new track has been shown
  private simUavRun = 0;
  private simRadarBusy = false;
  private simUavBusy = false;
  private simAborts: { [key: string]: AbortController } = {};

  private simAbort(key: string) {
    if (this.simAborts[key]) {
      this.simAborts[key].abort();
      delete this.simAborts[key];
    }
  }

  private async simPost(path: string, body: any, key: string): Promise<boolean> {
    if (this.simMode === "ui") return false;
    const controller = new AbortController();
    this.simAborts[key] = controller;
    const timeout = setTimeout(() => controller.abort(), 3000); // a slow backend counts as failed
    try {
      const res = await fetch(this.simApi(path), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      return res.ok;
    } catch (e) {
      return false;
    } finally {
      clearTimeout(timeout);
      if (this.simAborts[key] === controller) delete this.simAborts[key];
    }
  }

  // metres -> degrees helpers
  private simMove(lonlat: number[], headingDeg: number, metres: number): number[] {
    const h = (headingDeg * Math.PI) / 180;
    const dLat = (metres * Math.cos(h)) / 111320;
    const dLon = (metres * Math.sin(h)) / (111320 * Math.cos((lonlat[1] * Math.PI) / 180));
    return [lonlat[0] + dLon, lonlat[1] + dLat];
  }

  private simDistance(a: number[], b: number[]): number {
    const dLat = (b[1] - a[1]) * 111320;
    const dLon = (b[0] - a[0]) * 111320 * Math.cos((a[1] * Math.PI) / 180);
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  private simShowTargetDot(lonlat: number[]) {
    if (!this.simTargetLayer) {
      this.simTargetLayer = new VectorLayer({ source: new VectorSource(), zIndex: 19 });
      this.simTargetLayer.set("title", "sim_target");
    }
    if (this.olmap.getLayers().getArray().indexOf(this.simTargetLayer) === -1) {
      this.olmap.addLayer(this.simTargetLayer);
    }
    const source = this.simTargetLayer.getSource();
    source.clear();
    const f = new Feature({ geometry: new Point(lonlat) });
    f.setStyle(new Style({
      image: new CircleStyle({ radius: 7, fill: new Fill({ color: "#ff3b30" }), stroke: new Stroke({ color: "#ffffff", width: 2 }) }),
      text: new Text({
        text: "Track " + this.simRadar.id, offsetY: -16, font: "bold 11px sans-serif",
        fill: new Fill({ color: "#ff3b30" }), stroke: new Stroke({ color: "#000000", width: 3 }),
      }),
    }));
    source.addFeature(f);
  }

  // ---- Radar ----
  private async simSendRadarPoint(point: number[]) {
    const run = this.simRadarRun;
    const range = Math.round(this.simDistance(this.simRadarOrigin, point));
    this.simRadarTail.push(point);
    this.simRadar.lat = Number(point[1].toFixed(7));
    this.simRadar.lon = Number(point[0].toFixed(7));
    // same body the backend builds from Kafka (topic.js -> /api/map/radar/track); range is in km like the real radar
    const ok = await this.simPost("/map/radar/track", {
      track: [{ id: this.simRadar.id, radarId: 223, ip: "195.67.6.3", tail: [point], range: range / 1000 }],
    }, "radar");
    if (run !== this.simRadarRun) return; // stopped while this point was being sent
    const firstPoint = this.simRadarNewTrack;
    this.simRadarNewTrack = false;
    if (ok) {
      this.simRadarStatus = "Track " + this.simRadar.id + (firstPoint ? " - new alarm raised" : "") + " - via backend - range " + range + " m";
    } else {
      // backend not available: draw it directly in the UI
      this.localPush.next({
        category: "radar_tracks",
        gJson: {
          type: "Feature",
          geometry: { type: "LineString", coordinates: this.simRadarTail.slice() },
          properties: { id: this.simRadar.id, track_id: this.simRadar.id, range: range / 1000 },
        },
      });
      this.simShowTargetDot(point);
      // no backend = no alarm from the server, so sound the alarm here for a new track
      if (firstPoint) {
        try { this.playAlarmAudio(); } catch (e) { }
      }
      this.simRadarStatus = "Track " + this.simRadar.id + " - " + (this.simMode === "ui" ? "UI only" : "Backend unavailable - shown in UI only") + " - range " + range + " m";
    }
  }

  // Start = a NEW detection. The backend raises an alarm (and the alarm sound) only the first
  // time it sees a track ID, so a Track ID that was already used gets the next free one.
  startSimRadar() {
    this.stopSimRadar();
    let id = Number(this.simRadar.id);
    if (!isValidTrackId(this.simRadar.id)) {
      this.toastr.warning("Track ID 0 is not allowed - using the next free Track ID.");
    }
    if (!(id > 0) || id <= MapsComponent.simLastTrackId()) {
      id = MapsComponent.simLastTrackId() + 1;
    }
    this.simRadar.id = id;
    this.simRememberTrackId(id);
    this.simRadarTail = [];
    if (this.simTargetLayer) this.simTargetLayer.getSource().clear();
    this.simRunRadar(true);
  }

  // Resume = keep moving the stopped target (same Track ID, no new alarm - like the real radar).
  resumeSimRadar() {
    if (this.simRadarRunning || !this.simRadarTail.length) return;
    this.simRunRadar(false);
  }

  get canResumeSimRadar(): boolean {
    return !this.simRadarRunning && this.simRadarTail.length > 0;
  }

  private simRunRadar(isNewTrack: boolean) {
    this.stopSimRadar();
    this.simRadarRunning = true;
    this.simRadarNewTrack = isNewTrack;
    const run = ++this.simRadarRun;
    let pos = isNewTrack
      ? [Number(this.simRadar.lon), Number(this.simRadar.lat)]
      : this.simMove(this.simRadarTail[this.simRadarTail.length - 1], Number(this.simRadar.heading), Number(this.simRadar.speed));
    const tick = async () => {
      if (run !== this.simRadarRun) return;
      if (this.simRadarBusy) return; // previous point still being sent - skip, don't pile up requests
      this.simRadarBusy = true;
      try {
        await this.simSendRadarPoint(pos);
      } finally {
        this.simRadarBusy = false;
      }
      pos = this.simMove(pos, Number(this.simRadar.heading), Number(this.simRadar.speed));
    };
    tick();
    this.simRadarTimer = setInterval(tick, 1000);
  }

  stopSimRadar() {
    this.simRadarRun++; // invalidates any tick or request still in flight
    if (this.simRadarTimer) clearInterval(this.simRadarTimer);
    this.simRadarTimer = null;
    this.simRadarRunning = false;
    this.simRadarBusy = false;
    this.simAbort("radar");
    if (this.simRadarStatus && this.simRadarStatus.indexOf("Stopped") !== 0) this.simRadarStatus = "Stopped - Track " + this.simRadar.id + " (Resume to continue it, Start for a new target)";
  }

  newSimRadarTrack() {
    this.stopSimRadar();
    this.simRadar.id = Math.max(Number(this.simRadar.id), MapsComponent.simLastTrackId()) + 1;
    this.simRadarTail = [];
    if (this.simTargetLayer) this.simTargetLayer.getSource().clear();
    this.simRadarStatus = "New track ID " + this.simRadar.id;
  }

  // ---- UAV ----
  private async simSendUav(pos: number[], battery: string = "") {
    const run = this.simUavRun;
    const msg = { category: "uav_status", data: { ip: "sim-uav", lat: pos[1], lon: pos[0], remaining_time: battery, zone_id: "" } };
    // same message tcp.client.js sends; backend relays it to every open screen
    const ok = await this.simPost("/communication/to-ui", msg, "uav");
    if (run !== this.simUavRun) return ok; // stopped meanwhile
    if (!ok) this.localPush.next(msg);
    return ok;
  }

  private simUavStart(): number[] {
    if (this.simUavPos) return this.simUavPos;
    const home = this.uavMarkers["uav-home"] || this.uavMarkers["sim-uav"];
    return home ? home.getGeometry().getCoordinates().slice() : this.uavHome.slice();
  }

  async setSimUavPosition() {
    this.stopSimUav();
    this.simUavPos = [Number(this.simUav.lon), Number(this.simUav.lat)];
    const ok = await this.simSendUav(this.simUavPos);
    this.simUavStatus = ok ? "Position sent via backend" : "Position shown in UI only";
  }

  flySimUav(target?: number[]) {
    this.stopSimUav();
    const dest = target || [Number(this.simUav.lon), Number(this.simUav.lat)];
    this.simUavPos = this.simUavStart();
    this.simUavRunning = true;
    const run = ++this.simUavRun;
    this.simUavTimer = setInterval(async () => {
      if (run !== this.simUavRun || this.simUavBusy) return;
      this.simUavBusy = true;
      const remaining = this.simDistance(this.simUavPos, dest);
      const step = Number(this.simUav.speed);
      if (remaining <= step) {
        this.simUavPos = dest.slice();
        this.stopSimUav();
      } else {
        const heading = (Math.atan2(
          (dest[0] - this.simUavPos[0]) * Math.cos((this.simUavPos[1] * Math.PI) / 180),
          dest[1] - this.simUavPos[1]) * 180) / Math.PI;
        this.simUavPos = this.simMove(this.simUavPos, heading, step);
      }
      const arrived = !this.simUavRunning;
      let ok = false;
      try {
        ok = await this.simSendUav(this.simUavPos);
      } finally {
        this.simUavBusy = false;
      }
      if (run !== this.simUavRun && !arrived) return; // stopped by the user meanwhile
      this.simUavStatus = (arrived ? "Arrived" : "Flying - " + Math.round(Math.max(remaining - step, 0)) + " m to go")
        + (ok ? " (via backend)" : " (UI only)");
    }, 1000);
  }

  flySimUavToTrack() {
    this.flySimUav([Number(this.simRadar.lon), Number(this.simRadar.lat)]);
  }

  returnSimUavHome() {
    this.flySimUav(this.uavHome.slice());
  }

  stopSimUav() {
    this.simUavRun++;
    if (this.simUavTimer) clearInterval(this.simUavTimer);
    this.simUavTimer = null;
    this.simUavRunning = false;
    this.simUavBusy = false;
    this.simAbort("uav");
  }

  stopAllSim() {
    this.stopSimRadar();
    this.stopAlarmSound();
    this.stopSimUav();
    this.simUavStatus = "Stopped";
  }

  // ---------------- Drone (UAV) marker ----------------
  // Default spot where the drone icon is shown until live position arrives.
  // Taken from the default coordinates in integration/uav/uav_server.py - change to the real launch point.
  uavHome: number[] = [89.0579166667, 22.1356333333]; // [lon, lat]
  private uavMarkerLayer: any;
  private uavMarkers: { [ip: string]: any } = {};

  private ensureUavMarkerLayer() {
    if (!this.uavMarkerLayer) {
      this.uavMarkerLayer = new VectorLayer({ source: new VectorSource(), zIndex: 20 });
      this.uavMarkerLayer.set("title", "uav_marker");
    }
    // re-attach if the map was rebuilt or its layers were cleared (e.g. on refresh)
    if (this.olmap && this.olmap.getLayers().getArray().indexOf(this.uavMarkerLayer) === -1) {
      this.olmap.addLayer(this.uavMarkerLayer);
    }
    return this.uavMarkerLayer;
  }

  private uavStyle(rotation: number, live: boolean, label: string) {
    return new Style({
      image: new Icon({
        src: "assets/sensor-icons/UAV-26px.svg",
        scale: 1.3,
        rotation: rotation,
        rotateWithView: true,
        opacity: live ? 1 : 0.6,
      }),
      text: new Text({
        text: label,
        offsetY: 24,
        font: "bold 11px sans-serif",
        fill: new Fill({ color: live ? "#00e5ff" : "#bbbbbb" }),
        stroke: new Stroke({ color: "#000000", width: 3 }),
      }),
    });
  }

  // Place (or move) the drone icon. coord is [lon, lat].
  setUavMarker(ip: string, coord: number[], live: boolean, info: string = "", headingDeg: number = null) {
    if (!coord || coord.length < 2 || isNaN(Number(coord[0])) || isNaN(Number(coord[1]))) return;
    const point = [Number(coord[0]), Number(coord[1])];
    const source = this.ensureUavMarkerLayer().getSource();
    let feature = this.uavMarkers[ip];
    let rotation = 0;
    if (feature) {
      const prev = feature.getGeometry().getCoordinates();
      const dx = point[0] - prev[0];
      const dy = point[1] - prev[1];
      rotation = dx !== 0 || dy !== 0 ? Math.atan2(dx, dy) : feature.get("rotation") || 0;
      feature.getGeometry().setCoordinates(point);
    } else {
      feature = new Feature({ geometry: new Point(point), ip: ip, category: "uav_marker" });
      source.addFeature(feature);
      this.uavMarkers[ip] = feature;
    }
    if (headingDeg !== null && headingDeg !== undefined && !isNaN(Number(headingDeg))) {
      rotation = (Number(headingDeg) * Math.PI) / 180; // real heading from telemetry
    }
    feature.set("rotation", rotation);
    const label = live ? "UAV" + (info ? " " + info : "") : "UAV (no live data)";
    feature.setStyle(this.uavStyle(rotation, live, label));
  }

  // Handles both formats: tcp.client.js sends { data: { lat, lon, ip, remaining_time } },
  // older code sends { gJson: { geometry: { coordinates: [[lon, lat], ...] }, properties: { ip } } }.
  updateUavPosition(results: any) {
    let ip = "uav";
    let coord: number[] = null;
    let info = "";
    if (results.data && results.data.lat !== undefined && results.data.lat !== "") {
      ip = results.data.ip || ip;
      coord = [Number(results.data.lon), Number(results.data.lat)];
      if (results.data.remaining_time !== undefined && results.data.remaining_time !== "") {
        info = "| batt " + results.data.remaining_time;
      }
    } else if (results.gJson && results.gJson.geometry) {
      ip = (results.gJson.properties && results.gJson.properties.ip) || ip;
      const c = results.gJson.geometry.coordinates;
      coord = Array.isArray(c[0]) ? c[c.length - 1] : c;
      // keep the flight path line as before
      const layer = this.findLayer("uav_tracks");
      if (layer && Array.isArray(c[0])) {
        const existing = layer.getSource().getFeatures().find((f) => f.getProperties().ip === ip);
        if (existing) {
          existing.getGeometry().setCoordinates(c);
        } else {
          this.createFeatureOnGeoJSON(layer, results);
        }
      }
    }
    if (!coord) return;
    const headingDeg = results.data && results.data.heading !== undefined ? results.data.heading : null;
    // the first live fix replaces the "no live data" placeholder
    if (this.uavMarkers["uav-home"] && ip !== "uav-home") {
      this.ensureUavMarkerLayer().getSource().removeFeature(this.uavMarkers["uav-home"]);
      delete this.uavMarkers["uav-home"];
    }
    this.setUavMarker(ip, coord, true, info, headingDeg);
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


  // Show data as text inside HTML built by hand (stops script injection through alarm / track data)
  escapeHtml(value: any): string {
    return String(value) // same text as before for normal values (null stays "null")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  removeOverlay(results, acknowledged) {
    if (!results || !results[0]) {
      return;
    }
    const targetAlarmId = results[0].alarm_id;
    const wasHidden = this.hiddenEarlyAlarms.some((h: any) => String(h.id) === String(targetAlarmId));
    this.hiddenEarlyAlarms = this.hiddenEarlyAlarms.filter((h: any) => String(h.id) !== String(targetAlarmId));
    const overlaysToRemove = [];
    this.olmap
      .getOverlays()
      .getArray()
      .forEach((overlay) => {
        if (String(overlay.id) === String(targetAlarmId)) {
          overlaysToRemove.push(overlay);
        }
      });

    overlaysToRemove.forEach((overlay) => {
      this.olmap.removeOverlay(overlay);
    });

    if (acknowledged) {
      this.addSensors(results);
    } else {
      overlaysToRemove.forEach((overlay) => {
        this.removeTrack(overlay.id);
      });
      if (wasHidden && !overlaysToRemove.length) this.removeTrack(targetAlarmId);
    }
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
                if (String(res.data.disabledAlarm[i].alarm_id) === String(overlay.id)) {
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
    const playing: any = this.audio.play();
    if (playing && playing.catch) playing.catch(() => { }); // browser may block sound until the page is clicked
  }

  // Add Sensors
  addSensors(results, acknowledged?: Boolean): void {
    console.log("[MAPS] addSensors results:", JSON.stringify(results));
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
            .some(({ id: id2 }) => String(id2) === String(id1))
      );
      console.log("[MAPS] addSensors getNonExistingData:", JSON.stringify(getNonExistingData));
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
                  element.track_id,
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
            marker.set('id', element.alarm_id);
            marker.set('type', element.alarm_type);
            (marker as any).id = element.alarm_id;
            (marker as any).type = element.alarm_type;
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
                const getCategory = e.srcElement.getAttribute ? e.srcElement.getAttribute("cat") : e.srcElement.cat;
                const getCordinates = [
                  parseFloat(getId[0]),
                  parseFloat(getId[1]),
                ];
                that.popup.setPosition(getCordinates);
                that.olmap.addOverlay(that.popup);
                let popup = that.popup;
                let closer = that.popupCloser ? that.popupCloser.nativeElement : null;
                if (closer && closer.onclick === null) {
                  closer.onclick = () => {
                    popup.setPosition(undefined);
                    closer.blur();
                    return false;
                  };
                }
                if (that.overlayElement && that.overlayElement.nativeElement) {
                  that.overlayElement.nativeElement.innerHTML = `
                    <table class="table table-sm table-bordered">
                      <tbody>
                        <tr>
                          <th>${self.getTranslationLang("latitude")}: </th>
                          <td>${self.escapeHtml(getCordinates[1])}</td>
                        </tr>
                        <tr>
                          <th>${self.getTranslationLang("longitude")}: </th> 
                          <td>${self.escapeHtml(getCordinates[0])}</td>
                        </tr>
                        <tr>
                          <th>${self.getTranslationLang("alarm_id")}: </th> 
                          <td>${self.escapeHtml(getAlarmId)}</td>
                        </tr>
                        <tr>
                          <th>${self.getTranslationLang("alarm_type")}: </th> 
                          <td>${self.escapeHtml(getTypeZoneID[0])}</td>
                        </tr>
                        <!-- <tr>
                          <th>${self.getTranslationLang("zone_id")}: </th> 
                          <td>${getTypeZoneID[1]}</td>
                        </tr> -->
                        <tr>
                          <th>${self.getTranslationLang("category")}: </th> 
                          <td>${getCategory}</td>
                        </tr>
                      </tbody>
                    </table>                
                  `;
                }
              }
            };
            if (element.alarm_type === 2 && !this.earlyWarningVisible) {
              this.keepHiddenEarlyAlarm(marker); // Early Warning switch is off
            } else {
              this.olmap.addOverlay(marker);
            }
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
                /*this.dataService.assignToResponse(res.data).subscribe(
                  (res: any) => { },
                  (err) => {
                    // this.toasterService.error('Error Occured. Please try later.');
                  }
                ); */
              }
            });
        }
      }
    );

    // Assign UAV / Return Home buttons on the alarm cards
    this.uavCommandSubscription = this.alarmService.receiveUavCommand.subscribe((cmd: any) => this.onAlarmCardUavCommand(cmd));

    this.slewTISubscription = this.alarmService.receiveSlewTIEvent.subscribe(
      (res) => {
        if (res) {
          if (res.isSlewPopupEnabled === false) {
            this.isSlewPopupEnabled = false;
            this.enableUAVModal = false;
            this.enableVideo = false;
            if (this.popup) {
              this.popup.setPosition(undefined);
            }
            this.updateOpacity(false, false);
            this.activeSlewAlarm = null;
            return;
          }
          console.log("Slew TI Event Received: ", res.data);

          this.activeSlewAlarm = res.data;
          if (this.useDemoFeed("slew") && res.data && res.data.alarm_id !== undefined) {
            this.demoPan = null; this.demoTilt = null; this.demoZoomM = null;
            this.camDemo("SLEW -> TRK " + res.data.alarm_id, "camera slewed to track " + res.data.alarm_id);
          }
          this.enableVideo = true;

          if (!this.isSlewPopupEnabled) {
            if (this.overlayElement && this.overlayElement.nativeElement) {
              this.overlayElement.nativeElement.innerHTML = "";
            }
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
                if (layer.get("id") !== 1 && layer.values_.id !== "tileLayer") {
                  if (layer.get("title") === layername) {
                    this.isSlewPopupEnabled = true;
                    this.enableUAVModal = true;

                    // this.overlayElement.nativeElement.innerHTML =
                    //   `<p>` + evt.coordinate + `</p>`;
                    this.updateOpacity(true, feature);
                    this.popup.setPosition(coordinates);
                    this.olmap.addOverlay(this.popup);
                    let popup = this.popup;
                    let closer = this.popupCloser ? this.popupCloser.nativeElement : null;
                    if (closer) {
                      if (closer.onclick === null) {
                        closer.onclick = () => {
                          popup.setPosition(undefined);
                          closer.blur();
                          this.updateOpacity(false, feature);
                          return false;
                        };
                      }
                    }
                  }
                }
              });
              // setting the camera ip as globally
              this.ti_camera_ip = camera_ip;
              this.ti_location = coordinates;
              this.setPTZControls(camera_ip);
            }
          }
        }
      }
    );
  }

  isFullScreen = false;
  // Allow video in full screen mode
  openFullscreen(type): void {
    // already full screen: the same button takes the panel back to normal size
    const d: any = document;
    if (d.fullscreenElement || d.webkitFullscreenElement) { this.exitUavFullscreen(); return; }
    // the whole panel goes full screen: video on the left, its own controls on the right (see .video-sec:fullscreen)
    const elem: any = (type === 'ti')
      ? (document.getElementById("slew-ti-panel") || document.getElementById("slew-ti-video") || document.getElementById("slew-demo-canvas"))
      : (document.getElementById("uav-panel") || document.getElementById("uav-video-wrapper") || document.getElementById("camera-video") || document.getElementById("uav-demo-canvas"));
    if (!elem) return;
    this.isFullScreen = true;
    this.commonService.enableFullScreen(elem);
  }
  manualTrack(type): void {
    if (this.camDemo("MANUAL LOCK", "Manual lock")) return;
    let body = {
      mode: "manual_lock"          // Add the IP to the body
    };
    this.dataService.doAutoTrack(body).subscribe(
      (res: any) => this.camOk("Manual lock sent", res),
      (err) => this.camFail(err)
    );

  }

  cancelTrack(type): void {
    if (this.camDemo("TRACK CANCELLED", "Track cancelled")) return;
    let body = {
      mode: "cancel"
    };
    this.dataService.doAutoTrack(body).subscribe(
      (res: any) => this.camOk("Track cancelled", res),
      (err) => this.camFail(err)
    );

    //kkl documented
    // this.dataService.returnCameraHome().subscribe(
    //   (res: any) => {
    //     console.log("Return camera home response:", res);
    //   },
    //   (err) => {
    //     console.log("Return camera home error:", err);
    //   }
    // );

   /* if (this.activeSlewAlarm) {
      this.activeSlewAlarm.acknowledged_cleared = 10; // Slew TI Stopped
      this.alarmService.acknowledgeClearAlarms(this.activeSlewAlarm).subscribe(
        (res) => {
          if (!res.error) {
            this.activeSlewAlarm.event_type = 10;
            this.alarmService.publishUpdatedAlarmData([this.activeSlewAlarm]);
            this.activeSlewAlarm = null;
          }
        },
        (err) => {
          console.log("Error updating cancel track event in DB:", err);
        }
      );
    } */
  }

  startTrack(type): void {
    if (!this.needSlewAlarm("Start Tracking")) return;
    const trackNo = radarTrackIdOf(this.activeSlewAlarm);
    if (trackNo === null) {
      this.toastr.warning("Track ID 0 is not a valid target - tracking not started.");
      return;
    }
    if (this.camDemo("TRACKING " + trackNo, "Tracking started for track " + trackNo)) return;
    if (this.activeSlewAlarm) {
      // spec v2: track_id must be an integer (the radar track id)
      let body = {
        track_id: trackNo
      };
      this.dataService.startContinuousTrack(body).subscribe(
        (res: any) => this.camOk("Tracking started for track " + body.track_id, res),
        (err) => this.camFail(err)
      );

      // this.activeSlewAlarm.acknowledged_cleared = 9; // Slew TI Started
      // this.alarmService.acknowledgeClearAlarms(this.activeSlewAlarm).subscribe(
      //   (res) => {
      //     if (!res.error) {
      //       this.activeSlewAlarm.event_type = 9;
      //       this.alarmService.publishUpdatedAlarmData([this.activeSlewAlarm]);
      //     }
      //   },
      //   (err) => {
      //     console.log("Error starting slew TI event in DB:", err);
      //   }
      // );
    }
  }

  stopTrack(type): void {
    if (!this.needSlewAlarm("Stop Tracking")) return;
    if (this.camDemo("TRACKING STOPPED", "Tracking stopped")) return;
    if (this.activeSlewAlarm) {
      this.dataService.stopContinuousTrack().subscribe(
        (res: any) => this.camOk("Tracking stopped", res),
        (err) => this.camFail(err)
      );

      // this.activeSlewAlarm.acknowledged_cleared = 10; // Slew TI Stopped
      // this.alarmService.acknowledgeClearAlarms(this.activeSlewAlarm).subscribe(
      //   (res) => {
      //     if (!res.error) {
      //       this.activeSlewAlarm.event_type = 10;
      //       this.alarmService.publishUpdatedAlarmData([this.activeSlewAlarm]);
      //     }
      //   },
      //   (err) => {
      //     console.log("Error stopping slew TI event in DB:", err);
      //   }
      // );
    }
  }

  returnHome(type): void {
    if (this.camDemo("RETURNING HOME", "Camera returning home")) return;
    {
      this.dataService.returnCameraHome().subscribe(
        (res: any) => this.camOk("Camera returning home", res),
        (err) => this.camFail(err)
      );

      // this.activeSlewAlarm.acknowledged_cleared = 10; // Slew TI Stopped
      // this.alarmService.acknowledgeClearAlarms(this.activeSlewAlarm).subscribe(
      //   (res) => {
      //     if (!res.error) {
      //       this.activeSlewAlarm.event_type = 10;
      //       this.alarmService.publishUpdatedAlarmData([this.activeSlewAlarm]);
      //     }
      //   },
      //   (err) => {
      //     console.log("Error returning camera home event in DB:", err);
      //   }
      // );
    }
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

  // "Early Warning" switch (sub-header): hide / show the radar alarm markers (alarm_type 2) on the map.
  // Hidden markers are kept here and put back when the switch is turned on again.
  earlyWarningVisible = true;
  private hiddenEarlyAlarms: any[] = [];

  enableDisableLayers(results, sources, type) {
    if (!results || !results.target || type !== "overlay") return;
    this.earlyWarningVisible = !!results.target.checked;
    if (!this.earlyWarningVisible) {
      (sources || []).slice().forEach((o: any) => {
        if (o && o.options && o.options.type == 2) {
          this.keepHiddenEarlyAlarm(o);
          this.olmap.removeOverlay(o);
        }
      });
    } else {
      const onMap = this.olmap.getOverlays().getArray();
      this.hiddenEarlyAlarms.forEach((o: any) => {
        if (onMap.indexOf(o) === -1) this.olmap.addOverlay(o);
      });
      this.hiddenEarlyAlarms = [];
    }
  }

  // one entry per alarm id (a newer marker for the same alarm replaces the old one)
  private keepHiddenEarlyAlarm(o: any) {
    const id = String(o.id !== undefined ? o.id : (o.options && o.options.id));
    this.hiddenEarlyAlarms = this.hiddenEarlyAlarms.filter((h: any) => String(h.id !== undefined ? h.id : (h.options && h.options.id)) !== id);
    this.hiddenEarlyAlarms.push(o);
  }

  ngOnDestroy(): void {
    this.stopCamHealth();
    this.stopDemoFeeds();
    this.stopUavPolling();
    this.stopDemoPursuit();
    if (this.clearedTracksSubscription) {
      this.clearedTracksSubscription.unsubscribe();
    }
    this.stopSimRadar();
    this.stopSimUav();
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
    if (this.uavCommandSubscription) {
      this.uavCommandSubscription.unsubscribe();
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
          if (olLayer.get("id") !== 1 && olLayer.values_.id !== "tileLayer") {
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
          if (olLayer.get("id") !== 1 && olLayer.values_.id !== "tileLayer") {
            if (olLayer.get("title") === layer.LayerTitle) {
              layer.checked = false;
              olLayer.setOpacity(0);
            }
          }
        });
    }
  }

  onZoneChkBoxChange(event, zonelayer, zone, zoneindex, index) {
    if (this.zoneSeen && zone && zone.properties) this.zoneSeen[String(zone.properties.zone_area)] = !!event.target.checked;
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
        if (layer.get("id") !== 1 && layer.values_.id !== "tileLayer") {
          // only icon layers: polygon layers (e.g. Border, International Border) have no icon source,
          // and new Icon() without one throws (OpenLayers error #6), which stopped the theme switch
          const iconSrc = layer.get("options") && layer.get("options").Style && layer.get("options").Style.source;
          if (
            iconSrc &&
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
  // Right-click on the TI icon / slew event: remember which camera. The spec has no "query position"
  // call, so nothing is sent here (the old code posted an unsupported body to /ptz).
  setPTZControls(camera_ip?: string) {
    if (camera_ip) this.ti_camera_ip = camera_ip;
  }

  applyPTZControls(type, event) {
    this.ptzControls[type] = event.target.value;
  }

  // PTZ CONTROLS -> Submit: spec v2 POST :8000/move with only the ticked fields
  submitPTZControls() {
    const body: any = {};
    if (this.ptzSelected.pan) body.pan = Number(this.ptzControls.pan || 0);
    if (this.ptzSelected.tilt) body.tilt = Math.max(-45, Math.min(45, Number(this.ptzControls.tilt || 0)));
    if (this.ptzSelected.zoom) body.zoom_distance_m = Math.max(0, Number(this.ptzControls.zoom_distance_m || 0));
    if (!Object.keys(body).length) {
      this.toastr.warning("Nothing to send: move a slider or tick Pan, Tilt or Zoom first.");
      return;
    }
    body.gimbal_mode = Number(this.ptzControls.gimbal_mode || 0);

    if (this.useDemoFeed("slew")) {
      if (body.pan !== undefined) this.demoPan = body.pan;
      if (body.tilt !== undefined) this.demoTilt = body.tilt;
      if (body.zoom_distance_m !== undefined) { this.demoZoomBand = this.zoomBandFor(body.zoom_distance_m); this.demoZoomM = body.zoom_distance_m; }
      this.camDemo("MOVE " + (body.pan !== undefined ? "P" + body.pan + " " : "") + (body.tilt !== undefined ? "T" + body.tilt : ""),
        "camera moved" + (body.zoom_distance_m !== undefined ? ", zoom band " + this.demoZoomBand : ""));
      return;
    }
    // API spec v2: "Call /track/stop first if radar tracking is active, otherwise the next radar packet
    // will override the manual move". /track/stop is harmless when not tracking (camera just holds).
    this.dataService.stopContinuousTrack().subscribe(
      () => this.sendCameraMove(body),
      (err) => {
        if (err && typeof err.status === "number" && err.status > 0) this.sendCameraMove(body); // server answered: still move
        else this.camFail(err);                                                                // not reachable
      }
    );
  }

  private sendCameraMove(body: any) {
    this.dataService.cameraMove(body).subscribe(
      (res: any) => {
        const z = res && res.zoom;
        const band = z && z.band ? " (zoom " + z.band + ")" : (z === "unchanged" ? " (zoom unchanged)" : "");
        this.toastr.success("Camera moved" + band);
      },
      (err) => this.camFail(err)
    );
  }

  // PTZ - / + buttons: Pan 1 deg (wraps 0-360), Tilt 1 deg (-45..45), Zoom 100 m (0-10000). Ticks that control.
  ptzStep(type: "pan" | "tilt" | "zoom", dir: number) {
    const c = this.ptzControls;
    if (type === "pan") {
      c.pan = Math.round(((Number(c.pan) || 0) + dir + 360) % 360 * 10) / 10;
    } else if (type === "tilt") {
      c.tilt = Math.max(-45, Math.min(45, Math.round(((Number(c.tilt) || 0) + dir) * 10) / 10));
    } else {
      c.zoom_distance_m = Math.max(0, Math.min(10000, Math.round(((Number(c.zoom_distance_m) || 0) + dir * 100) / 50) * 50));
    }
    this.ptzSelected[type] = true;
  }

  // Camera's own visual tracker: automatic target acquisition (spec: /tracker auto_start | auto_stop)
  autoAcquire(start: boolean) {
    const mode = start ? "auto_start" : "auto_stop";
    if (this.camDemo(start ? "AUTO ACQUIRE" : "AUTO ACQUIRE OFF", start ? "automatic acquisition started" : "automatic acquisition stopped")) return;
    this.dataService.doAutoTrack({ mode }).subscribe(
      (res: any) => this.camOk(start ? "Automatic acquisition started" : "Automatic acquisition stopped", res),
      (err) => this.camFail(err)
    );
  }

  // demo display of the manual camera move
  demoPan: number = null;
  demoTilt: number = null;
  demoZoomBand = "";
  private zoomBandFor(m: number): string {
    const bands = [0, 250, 500, 1000, 1500, 2500, 4000, 6000, 10000];
    for (let i = bands.length - 1; i >= 0; i--) if (m >= bands[i]) return bands[i] + "m+";
    return "0m+";
  }

  onResizeStart(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isResizing = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startWidth = this.slewTiWidth;
    this.startHeightOffset = this.slewTiHeightOffset;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!this.isResizing) return;
      const dx = moveEvent.clientX - this.startX;
      const dy = moveEvent.clientY - this.startY;
      
      this.slewTiWidth = Math.max(200, Math.min(450, this.startWidth + dx));
      this.slewTiHeightOffset = Math.max(0, Math.min(300, this.startHeightOffset + dy));
      
      this.cdr.detectChanges();
    };

    const onMouseUp = () => {
      this.isResizing = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  onUavResizeStart(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isUavResizing = true;
    this.startUavX = event.clientX;
    this.startUavY = event.clientY;
    this.startUavWidth = this.uavWidth;
    this.startUavHeight = this.uavHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!this.isUavResizing) return;
      const dx = moveEvent.clientX - this.startUavX;
      const dy = moveEvent.clientY - this.startUavY;
      
      this.uavWidth = Math.max(200, Math.min(450, this.startUavWidth + dx));
      this.uavHeight = Math.max(160, Math.min(450, this.startUavHeight + dy));
      
      this.cdr.detectChanges();
    };

    const onMouseUp = () => {
      this.isUavResizing = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
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
          // color: layeroptions.Style.color || '#ffffffff',
          // width: layeroptions.Style.width || 5,
          // lineDash: layeroptions.Style.linedash || [1, 7],
          color: '#ffffffff',
          width: 5,
          lineDash: [1, 7],
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
      minZoom: layeroptions.minZoom !== undefined ? layeroptions.minZoom : undefined,
      maxZoom: layeroptions.maxZoom !== undefined ? layeroptions.maxZoom : undefined,
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
          lineDash: [1, 7],
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
      minZoom: layeroptions.minZoom !== undefined ? layeroptions.minZoom : undefined,
      maxZoom: layeroptions.maxZoom !== undefined ? layeroptions.maxZoom : undefined,
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
    let closer = this.popupCloser ? this.popupCloser.nativeElement : null;
    if (popup) {
      popup.setPosition(undefined);
      if (closer) {
        closer.blur();
      }
    }
    this.removeCoverage();
  }

  onZoneSwitchShown() {
    let popup = this.popup;
    let closer = this.popupCloser ? this.popupCloser.nativeElement : null;
    if (popup) {
      popup.setPosition(undefined);
      if (closer) {
        closer.blur();
      }
    }
    this.getUpdatedLayers();
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
