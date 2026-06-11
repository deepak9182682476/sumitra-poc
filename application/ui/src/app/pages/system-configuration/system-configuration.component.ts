import {
  Component,
  OnInit,
  AfterViewInit,
  ViewEncapsulation,
  ViewChild,
} from "@angular/core";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import moment from "moment";
import "ol/ol.css";
import { Map, View, Feature } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { XYZ, TileWMS, Vector as VectorSource } from "ol/source";
import Draw from "ol/interaction/Draw";
import { Point } from "ol/geom";
import { GeoJSON, KML } from "ol/format";
import { Fill, Stroke, Style, Icon } from "ol/style";
import * as XLSX from "xlsx";
import { CommonService } from "src/app/services/common.service";
import { AlarmService } from "../../services/alarm.service";
import { SystemConfigurationService } from "../../services/system-configuration.service";
import { DataService } from "../../services/data.service";
import { ThemeService } from "../../theme/theme.service";
import { MapsComponent } from "../maps/maps.component";
import _ from "lodash";

@Component({
  selector: "app-system-configuration",
  templateUrl: "./system-configuration.component.html",
  styleUrls: ["./system-configuration.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class SystemConfigurationComponent implements OnInit, AfterViewInit {
  systemConfig = [];
  isLoading = false;
  checkedSensors = [];
  isUpdate = false;
  definedSensors = ["agu", "eoir", "radar"];
  definedAssignments = {
    id: null,
    data: [
      { value: "ugv", title: "UGV" },
      { value: "uav", title: "UAV" },
    ],
  };
  checkedAssignments = [];
  getConfig = [];
  updateLoader = false;

  olmap = Map;
  source: any;
  draw: any;
  vector: any;
  isDrawing: boolean = false;
  isDrawingDone: boolean = false;
  isDrawingApply: boolean = false;
  pointsGeoJson: any = [];

  formGroup: FormGroup;
  dbConfigForm: FormGroup;
  timeConfigForm: FormGroup;
  isSubmitted = false;
  getMapConfig: any = {};
  isMapConfigUpdate: boolean = false;
  isMapLoaded: boolean = false;
  isTimeConfigUpdate: boolean = false;

  zoneWiseData = [];
  originalZoneWiseData = [];
  sensorsData = {
    radorData: [],
    tiData: [],
    uavData: [],
    ugvData: [],
  };

  mccsUsers = {
    maintenanceUser: false,
    isOperator: false,
    isWatchTower: false,
    isSuperUser: false,
    isDeveloper: false,
  };

  // Map wms Configuration
  uploadMapConfig = {
    isUploadFile: false,
    isFormSubmitted: false,
    isLoading: false,
    formData: {
      type: "url",
      title: "",
      file: null,
      url: null,
    },
    columns: ["Title", "File Name", "Updated Date", "Actions"],
    configData: [],
    isUpdate: false,
    updateData: {
      file_name: "",
      id: null,
    },
    submit: {
      isFormSubmitted: false,
    },
  };

  @ViewChild(MapsComponent, { static: false }) mapsComponent: MapsComponent;

  constructor(
    private formBuilder: FormBuilder,
    private systemConfigurationService: SystemConfigurationService,
    private dataService: DataService,
    private themeService: ThemeService,
    public commonService: CommonService,
    public alarmService: AlarmService,
    public toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: [""],
      latitude: ["", Validators.required],
      longitude: ["", Validators.required],
    });

    this.dbConfigForm = this.formBuilder.group({
      dbname: ["", Validators.required],
      hostname: ["", Validators.required],
      username: ["", Validators.required],
      password: ["", Validators.required],
      environment: ["Development", Validators.required],
    });

    this.timeConfigForm = this.formBuilder.group({
      id: [""],
      start_time: ["", Validators.required],
      end_time: ["", Validators.required],
      session_timeout: ["", Validators.required],
    });

    this.getMapConfiguration();
    this.getAllSensors();
    this.getSystemConfiguration();
    this.getUploadedMapFiles();
    this.getZoneWiseInfo();
    this.getActiveTimeConfig();
    this.getAssignmentRules();

    this.commonService.watchStorage().subscribe((data: string) => {
      // this will call whenever your localStorage data changes
      const getSignedInData = this.commonService.getDecryptedUserData();
      const userInfo = getSignedInData ? JSON.parse(getSignedInData) : false;
      const theme = userInfo && userInfo.theme ? userInfo.theme : "dark";
      this.themeSelection(theme);
    });

    // Check Signed In/Not
    const getSignedInData = this.commonService.getDecryptedUserData();
    if (
      getSignedInData &&
      JSON.parse(getSignedInData) &&
      JSON.parse(getSignedInData).role
    ) {
      this.mccsUsers = this.commonService.getUserRoles(
        JSON.parse(getSignedInData)
      );
    }
  }

  /**
   * Get All Sensors
   */
  getAllSensors() {
    this.systemConfig = [];
    this.isLoading = true;
    this.systemConfigurationService.getSensors().subscribe(
      (result) => {
        let data = result.data;
        if (data && !data.error) {
          const sensors = [];
          data.forEach((element) => {
            if (sensors.indexOf(element.sensor_type.toLowerCase()) === -1) {
              element.sensor_id = element.sensor_id + "";
              this.systemConfig.push(element);
              sensors.push(element.sensor_type.toLowerCase());
            }
          });
        }
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  /**
   * @param id Checked Sensors ID
   */
  getCheckedCheckbox(id) {
    if (!this.checkedSensors.includes(id)) {
      this.checkedSensors.push(id + "");
    } else {
      this.checkedSensors.splice(this.checkedSensors.indexOf(id + ""), 1);
    }
  }

  /**
   * Update Config
   */
  updateConfig() {
    if (this.checkedSensors.length) {
      const data = {
        role: 1,
        sensors: this.checkedSensors,
        isUpdate: this.isUpdate,
        id:
          this.getConfig[0] && this.getConfig[0].config_id
            ? this.getConfig[0].config_id
            : null,
      };
      this.updateLoader = true;
      this.systemConfigurationService.saveSystemConfiguration(data).subscribe(
        (res) => {
          this.updateLoader = false;
          if (!res.error) {
            this.toastr.success(
              this.getTranslationLang("updated_successfully")
            );
          }
        },
        (error) => {
          this.updateLoader = false;
        }
      );
    } else {
      this.toastr.info(this.getTranslationLang("please_choose_sensor"));
    }
  }

  /**
   * Get Assignment Rules
   */
  getAssignmentRules() {
    this.getConfig = [];
    this.systemConfigurationService.getAssignmentRules().subscribe((result) => {
      let data = result.data;
      if (data && !data.error) {
        this.definedAssignments.id = data && data.id ? data.id : null;
        this.checkedAssignments =
          data && data.assignments ? data.assignments.split(",") : [];
        this.isUpdate = this.checkedAssignments.length === 0 ? false : true;
      }
    });
  }

  /**
   * @param value Checked Assignment Value
   */
  getCheckedAssignments(value) {
    if (!this.checkedAssignments.includes(value)) {
      this.checkedAssignments.push(value);
    } else {
      this.checkedAssignments.splice(this.checkedAssignments.indexOf(value), 1);
    }
  }

  /**
   * Save/Update Assignment Rules
   */
  saveAssignmentRules() {
    if (this.checkedAssignments.length) {
      const data = {
        id: this.definedAssignments.id,
        assignments: this.checkedAssignments,
        isUpdate: this.isUpdate,
      };
      this.updateLoader = true;
      this.systemConfigurationService.saveAssignmentRules(data).subscribe(
        (res) => {
          this.updateLoader = false;
          if (!res.error) {
            this.toastr.success(this.getTranslationLang("saved_successfully"));
          }
        },
        (error) => {
          this.updateLoader = false;
        }
      );
    } else {
      this.toastr.info(this.getTranslationLang("please_choose_assignment"));
    }
  }

  /**
   * Get System Config
   */
  getSystemConfiguration() {
    this.getConfig = [];
    this.systemConfigurationService
      .getSystemConfiguration()
      .subscribe((result) => {
        let data = result.data;
        if (data && !data.error) {
          this.getConfig = data;
          this.checkedSensors = data[0].sensors
            ? data[0].sensors.split(",")
            : [];
          this.isUpdate = data.length === 0 ? false : true;
        }
      });
  }

  getSystemMappedConfig() {
    this.systemConfigurationService.getSystemMappedConfig().subscribe((res) => {
      if (!res.error && !res.errorInfo) {
        this.zoneWiseData.filter((item) => {
          return res.data.find((o2) => {
            if (item.selected_options.zone_id === o2.zone_id) {
              item.selected_options = o2;
              return item;
            }
          });
        });
      }
    });
  }

  loadMap(data) {
    this.formGroup.patchValue({
      longitude: data.longitude,
      latitude: data.latitude,
    });
    this.olmap = this.mapsComponent.loadSystemConfigurationMap(data);
    if (this.olmap) {
      this.olmap.getView().setCenter([data.longitude, data.latitude]);
      this.olmap.getView().setZoom(13);
    } 
    // console.log('target',this.olmap.getLayers());
  }

  themeSelection(theme, map_url = null) {
    this.olmap.getLayers().forEach((layer) => {
      if (
        layer &&
        layer.get("id") &&
        (layer.get("id") == 1 || layer.get("id") == 2)
      ) {
        this.olmap.removeLayer(layer);
      }
    });
    if (theme === "dark") {
      this.olmap.addLayer(
        new TileLayer({
          id: 1,
          source: new XYZ({
            attributions: "",
            url: (map_url) ? map_url : 'http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            // url: map_url
            //   ? map_url
            //   : this.dataService.config.LOCAL_SAT_MAP_URL +
            //   "/wmts/gm_layer/gm_grid/{z}/{x}/{y}.png",
            crossOrigin: "anonymous",
          }),
          zIndex: -1,
        })
      );
      this.olmap.getView().setMinZoom(3);
    } else if (theme === "light") {
      this.olmap.addLayer(
        new TileLayer({
          id: 1,
          source: new XYZ({
            attributions: "",
            // url: (map_url) ? map_url : 'http://{a-c}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
            // url: map_url
            //   ? map_url
            //   : this.dataService.config.LOCAL_MAP_URL +
            //     "/styles/osm-bright/{z}/{x}/{y}.png",
            crossOrigin: "anonymous",
          }),
          zIndex: -1,
        })
      );
      this.olmap.getView().setMinZoom(3);
    } else if (theme === "satellite") {
      this.olmap.addLayer(
        new TileLayer({
          id: 2,
          source: new TileWMS({
            url: this.dataService.config.GEO_SERVER_URL + "/chitradurga/wms",
            params: {
              LAYERS: "chitradurga:chitrdurgh_airport_S2_render2_3857",
            },
            serverType: "geoserver",
            crossOrigin: "anonymous",
          }),
          zIndex: -1,
        })
      );
      this.olmap.getView().setMinZoom(12);
    }
  }

  ngAfterViewInit() {
    this.setMapDrawFeatures();
  }

  setMapDrawFeatures() {
    this.source = new VectorSource({ wrapX: false });
    this.draw = new Draw({
      source: this.source,
      type: "Polygon",
      stopClick: true,
    });
  }

  drawSiteArea() {
    this.isDrawing = true;
    this.vector = new VectorLayer({
      source: this.source,
      title: "SiteArea",
      vectorId: "1001",
    });
    this.addInteraction(true);
  }

  addInteraction(toAddAccess) {
    let addVectorLayer = true;
    let map = this.olmap;
    let formatGeoJSON = new GeoJSON();
    let self = this;

    if (toAddAccess) {
      this.olmap.getLayers().forEach((element) => {
        if (element.values_.vectorId && element.values_.vectorId == "1001") {
          addVectorLayer = false;
        }
      });
      if (addVectorLayer) {
        this.olmap.addLayer(this.vector);
      }
      this.olmap.addInteraction(this.draw);

      this.draw.on("drawend", function (event) {
        var feature = event.feature;
        var featureClone = feature.clone();
        var geojson = formatGeoJSON.writeFeature(featureClone);
        var coordinates = featureClone.getGeometry().getCoordinates();
        self.pointsGeoJson = coordinates;
        self.addStyleToShape(geojson);
      });
    } else if (!toAddAccess) {
      this.olmap.removeInteraction(this.draw);
      this.olmap.removeLayer(this.vector);
    }
  }

  addStyleToShape(geojson) {
    let map = this.olmap;
    map.removeLayer(this.vector);

    let existedLayerIndex = undefined;
    let existedLayer = undefined;
    let isExisted = false;

    let title = "Perimeter";

    var layerlist = this.olmap.getLayers().getArray();
    for (let index = 0; index < layerlist.length; index++) {
      var layer = layerlist[index];
      if (index !== 0 && layer.values_.id !== "tileLayer") {
        if (
          layer.get("options") &&
          layer.get("options").Source &&
          layer.get("options").Source.properties != undefined &&
          layer.get("options").LayerTitle == title
        ) {
          isExisted = true;
          existedLayer = layer;
          existedLayerIndex = index;
          break;
        }
      }
    }

    if (existedLayerIndex === undefined) {
      this.createLayer({
        LayerTitle: title,
        LayerType: "Vector",
        Source: geojson,
        SourceType: "GeoJSON",
        zIndex: 1,
      });
    } else {
      const features = layer.getSource().getFeatures();
      if (features.length)
        features[0].getGeometry().setCoordinates(geojson.geometry.coordinates);
    }
  }

  createLayer(layeroptions) {
    var styles = {
      MultiPolygon: new Style({
        stroke: new Stroke({
          color: "#00FFF6",
          width: 3,
        }),
        fill: new Fill({
          color: "rgba(255,255,255,0)",
        }),
      }),
      Polygon: new Style({
        stroke: new Stroke({
          color: "#00FFF6",
          width: 3,
        }),
        fill: new Fill({
          color: "rgba(255,255,255,0)",
        }),
      }),
    };

    var styleFunction = function (feature) {
      return styles[feature.getGeometry().getType()];
    };

    const vectorLayer = new VectorLayer({
      title: layeroptions.LayerTitle,
      visible: true,
      projection: "EPSG:4326",
      source: new VectorSource({
        features: new GeoJSON().readFeatures(layeroptions.Source),
      }),
      zIndex: layeroptions.zIndex,
      style: styleFunction,
    });

    this.olmap.addLayer(vectorLayer);
  }

  onSiteAreaDelete() {
    this.olmap.getLayers().forEach((layer) => {
      if (layer && layer.get("title") == "Perimeter") {
        this.olmap.removeLayer(layer);
        this.pointsGeoJson = [];
        this.isDrawingDone = false;
        this.isDrawingApply = false;
        this.isDrawing = true;
      }
    });
  }

  onSiteAreaDone() {
    this.isDrawingDone = true;
    this.isDrawing = false;
  }

  onSiteAreaApply() {
    this.addInteraction(false);
    if (this.pointsGeoJson.length) {
      this.isDrawingApply = true;
      // save or do whatever...
      var site_data = {
        id: this.formGroup.get("id").value,
        longitude: this.formGroup.get("longitude").value,
        latitude: this.formGroup.get("latitude").value,
        site_area: this.pointsGeoJson,
      };
      Object.assign(site_data, { isUpdate: this.isMapConfigUpdate });
      this.systemConfigurationService.saveMapConfiguration(site_data).subscribe(
        (res: any) => {
          if (!res.error && !res.errorInfo) {
            this.getMapConfiguration();
          }
        },
        (err) => {
          console.log(err);
        }
      );
    } else {
      let errMsg = this.getTranslationLang("draw_way_points");
      return this.toastr.error(errMsg);
    }
  }

  saveSiteArea(data) {
    Object.assign(data, { isUpdate: this.isMapConfigUpdate });
    this.systemConfigurationService
      .saveMapConfiguration(data)
      .subscribe((res) => {
        if (!res.error && !res.errorInfo) {
          this.getMapConfiguration();
        }
      });
  }

  /**
   * Get Map Config
   */
  getMapConfiguration() {
    this.getMapConfig = [];
    this.systemConfigurationService
      .getMapConfiguration()
      .subscribe((result) => {
        let data = result.data;
        if (data && !data.error) {
          this.getMapConfig =
            data && data.geojson.features.length > 0
              ? data.geojson.features[0].properties
              : {};
          if (Object.keys(this.getMapConfig).length > 0) {
            this.formGroup.setValue({
              id: this.getMapConfig.site_area,
              longitude:
                this.getMapConfig.hasOwnProperty("default_center") &&
                this.getMapConfig.default_center.coordinates.length === 2
                  ? this.getMapConfig.default_center.coordinates[0]
                  : null,
              latitude:
                this.getMapConfig.hasOwnProperty("default_center") &&
                this.getMapConfig.default_center.coordinates.length === 2
                  ? this.getMapConfig.default_center.coordinates[1]
                  : null,
            });

            if (
              this.getMapConfig.hasOwnProperty("default_center") &&
              this.getMapConfig.default_center.coordinates.length === 2
            ) {
              const latlongs = {
                longitude: this.getMapConfig.default_center.coordinates[0],
                latitude: this.getMapConfig.default_center.coordinates[1],
              };
              this.loadMap(latlongs);
              this.plotSiteArea(data.geojson);
            }
          }
          this.isMapConfigUpdate = data.length === 0 ? false : true;
        }
      });
  }

  plotSiteArea(site_area) {
    /* var styles = {
      MultiPolygon: new Style({
        stroke: new Stroke({
          color: "#00FFF6",
          width: 3
        }),
        fill: new Fill({
          color: "rgba(255,255,255,0)"
        })
      }),
      Polygon: new Style({
        stroke: new Stroke({
          color: "#00FFF6",
          width: 3
        }),
        fill: new Fill({
          color: "rgba(255,255,255,0)"
        })
      })
    };

    var styleFunction = function (feature) {
      return styles[feature.getGeometry().getType()];
    };

    var vector = new VectorLayer({
      title: 'Perimeter',
      visible: true,
      projection: 'EPSG:4326',
      source: new VectorSource({
        features: new GeoJSON().readFeatures(site_area),
      }),
      zIndex: 1,
      style: styleFunction
    });
    this.olmap.addLayer(vector); */
  }

  /**
   * Convert Excel to json
   */

  onFileChange(ev) {
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: "binary" });
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        let sheet = workBook.Sheets[name];

        let lan = XLSX.utils.sheet_to_csv(sheet).toString();
        var rows = lan.split("\n");
        let l_names = rows[0].split(",");
        var translation = { trans: {} };
        l_names.forEach((name) => {
          if (name.length > 1) {
            translation.trans[name] = {};
          }
        });
        for (let index = 1; index < rows.length; index++) {
          let row = rows[index];
          var cols = row.split(",");
          if (cols[0].length > 1) {
            for (let j = 1; j < l_names.length; j++) {
              translation.trans[l_names[j]][cols[0]] = cols[j];
            }
          }
        }
        return initial;
      }, {});
    };
    reader.readAsBinaryString(file);
  }

  getTranslationLang(key) {
    return this.commonService.getTranslationKey(key);
  }

  get f() {
    return this.dbConfigForm.controls;
  }
  get atc() {
    return this.timeConfigForm.controls;
  }

  onSubmitDbconfig() {
    this.isSubmitted = true;

    // stop here if form is invalid
    if (this.dbConfigForm.invalid) {
      return;
    }

    this.systemConfigurationService
      .dbConfiguration({ config: this.dbConfigForm.value })
      .subscribe((res) => {
        if (!res.error) {
          this.toastr.success(this.getTranslationLang("updated_successfully"));
        }
      });
  }

  onSubmitTimeconfig() {
    this.isSubmitted = true;
    // stop here if form is invalid
    if (this.timeConfigForm.invalid) {
      return;
    }

    let data = this.timeConfigForm.value;
    Object.assign(data, { isUpdate: this.isTimeConfigUpdate });

    this.systemConfigurationService.timeConfiguration(data).subscribe((res) => {
      if (!res.error) {
        this.toastr.success(this.getTranslationLang("updated_successfully"));
        this.getActiveTimeConfig();
      }
    });
  }

  getActiveTimeConfig() {
    this.systemConfigurationService
      .getTimeConfiguration()
      .subscribe((result) => {
        let data = result.data;
        if (result && !result.error) {
          this.timeConfigForm.setValue({
            id: data && data.id ? data.id : null,
            start_time: moment(data.start_time).format("YYYY-MM-DDTHH:mm"),
            end_time: moment(data.end_time).format("YYYY-MM-DDTHH:mm"),
            session_timeout:
              data && data.session_timeout ? data.session_timeout : "1h",
          });
          this.isTimeConfigUpdate =
            Object.keys(data).length === 0 ? false : true;
        }
      });
  }

  onConfigFileChange(ev) {
    const selectedFile = ev.target.files[0];
    const filename =
      selectedFile &&
      (selectedFile.name.split(".")[1] === "js" ||
        selectedFile.name.split(".")[1] === "json");
    if (filename) {
      const fileReader: any = new FileReader();
      fileReader.readAsText(selectedFile, "UTF-8");
      fileReader.onload = () => {
        this.systemConfigurationService
          .rosConfig({ config: JSON.parse(fileReader.result) })
          .subscribe((res) => {
            if (!res.error) {
              this.toastr.success(
                this.getTranslationLang("updated_successfully")
              );
            }
          });
      };
      fileReader.onerror = (error) => {
        console.log(error);
      };
    }
  }

  // Save uploaded map Configuration
  saveUploadedMap() {
    this.uploadMapConfig.isFormSubmitted = true;

    // Check Name is Already Exists/Not
    let isExists = false;
    this.uploadMapConfig.configData.forEach((elem, index) => {
      if (elem.title === this.uploadMapConfig.formData.title) {
        isExists = true;
      }
    });

    if (!this.uploadMapConfig.isUpdate) {
      if (
        this.uploadMapConfig.formData.file &&
        this.uploadMapConfig.formData.title
      ) {
        if (isExists) {
          this.toastr.info("Sorry the entered title is already exists");
          return;
        }
        // this.toastr.info('Please wait');
        const formData = new FormData();
        formData.append("file", this.uploadMapConfig.formData.file);
        formData.append("file_name", this.uploadMapConfig.formData.title);
        formData.append("type", this.uploadMapConfig.formData.type);

        this.uploadMapConfig.submit.isFormSubmitted = true;
        this.systemConfigurationService.saveUploadedMap(formData).subscribe(
          (res) => {
            this.uploadMapConfig.isFormSubmitted = false;
            this.uploadMapConfig.submit.isFormSubmitted = false;
            if (!res.error) {
              this.saveUploadMapCallback();
              this.toastr.success(res.message);
            }
          },
          (error) => {
            this.uploadMapConfig.isFormSubmitted = false;
            this.uploadMapConfig.submit.isFormSubmitted = false;
          }
        );
      }
    } else {
      if (
        this.uploadMapConfig.formData.title &&
        (this.uploadMapConfig.formData.file ||
          this.uploadMapConfig.updateData.file_name)
      ) {
        const formData = new FormData();
        formData.append("file_name", this.uploadMapConfig.formData.title);
        formData.append("id", this.uploadMapConfig.updateData.id);
        if (this.uploadMapConfig.formData.file) {
          formData.append(
            "old_file_name",
            this.uploadMapConfig.updateData.file_name
          );
          formData.append("file", this.uploadMapConfig.formData.file);
        }
        formData.append("type", this.uploadMapConfig.formData.type);

        this.uploadMapConfig.submit.isFormSubmitted = true;
        this.systemConfigurationService.updateUploadedMap(formData).subscribe(
          (res) => {
            this.uploadMapConfig.isFormSubmitted = false;
            this.uploadMapConfig.submit.isFormSubmitted = false;
            if (!res.error) {
              this.saveUploadMapCallback();
              this.toastr.success(res.message);
            }
          },
          (error) => {
            this.uploadMapConfig.isFormSubmitted = false;
            this.uploadMapConfig.submit.isFormSubmitted = false;
          }
        );
      }
    }
  }

  saveUploadMapCallback() {
    this.uploadMapConfig.formData = {
      type: "url",
      title: "",
      file: null,
      url: null,
    };
    this.getUploadedMapFiles();
    this.uploadMapConfig.isUploadFile = false;
    this.uploadMapConfig.isUpdate = false;
    this.uploadMapConfig.updateData = {
      file_name: "",
      id: null,
    };
  }

  // File Upload Selection
  selectFile(event): void {
    // this.uploadMapConfig.updateData.file_name = '';
    this.uploadMapConfig.formData.file = event.target.files.item(0);
  }

  // Get All Uploaded Map Files
  getUploadedMapFiles() {
    this.uploadMapConfig.isLoading = true;
    this.systemConfigurationService.getUploadedMap().subscribe(
      (res) => {
        this.uploadMapConfig.configData = res.data.filter(
          (item) => item.type == "file"
        );
        res.data.forEach((data) => {
          if (data.type == "file") {
            const file_ext = data.file_name.split(".").pop();
            if (file_ext === "kml" || file_ext.toLowerCase() === "wmc") {
              const features = new KML().readFeatures(data.file_data, {
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
              this.olmap.addLayer(layer);
            }
          }
        });

        this.uploadMapConfig.isLoading = false;
      },
      (error) => {
        this.uploadMapConfig.isLoading = false;
      }
    );
  }

  // Delete Uploaded File
  deleteUploadedMap(config, index) {
    this.toastr.info("Please wait");
    this.uploadMapConfig.isUploadFile = false;
    this.systemConfigurationService
      .deleteUploadedMap(config)
      .subscribe((res) => {
        this.toastr.success(res.message);
        this.uploadMapConfig.configData.splice(index, 1);
      });
  }

  uploadMapFiles() {
    this.uploadMapConfig.isFormSubmitted = false;
    this.uploadMapConfig.formData = {
      type: "file",
      title: "",
      file: null,
      url: null,
    };
    this.uploadMapConfig.isUpdate = false;
  }

  // Edit Uploaded Map Config
  editUploadedMapConfig(data) {
    this.uploadMapConfig.isUploadFile = true;
    this.uploadMapConfig.isUpdate = true;
    this.uploadMapConfig.formData.title = data.title;
    this.uploadMapConfig.updateData.file_name = data.file_name;
    this.uploadMapConfig.updateData.id = data.id;
  }

  serviceType(event) {
    this.uploadMapConfig.formData.type = event.target.value;
  }

  saveMapFromUrl() {
    const url = this.uploadMapConfig.formData.url;
    const hostUrl = url.substr(0, url.indexOf("?"));
    console.log(url)
    const urlParams = this.getQueryStringParameters(url);
    this.olmap.addLayer(
      new TileLayer({
        source: new TileWMS({
          url: hostUrl,
          params: {
            LAYERS: urlParams.layers,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        zIndex: -1,
      })
    );

    this.uploadMapConfig.formData.url = JSON.stringify(url);
    this.systemConfigurationService
      .saveUploadedMap(this.uploadMapConfig.formData)
      .subscribe(
        (res) => {
          this.uploadMapConfig.isFormSubmitted = false;
          this.uploadMapConfig.submit.isFormSubmitted = false;
          if (!res.error) {
            this.saveUploadMapCallback();
            this.toastr.success(res.message);
          }
        },
        (error) => {
          this.uploadMapConfig.isFormSubmitted = false;
          this.uploadMapConfig.submit.isFormSubmitted = false;
        }
      );
  }

  getQueryStringParameters = (url) => {
    let queryString;
    if (url) {
      if (url.split("?").length > 0) {
        queryString = url.split("?")[1];
      }
    } else {
      url = window.location.href;
      queryString = window.location.search.substring(1);
    }
    return (/^[?#]/.test(queryString) ? queryString.slice(1) : queryString)
      .split("&")
      .reduce((params, param) => {
        let [key, value] = param.split("=");
        params[key] = value
          ? decodeURIComponent(value.replace(/\+/g, " "))
          : "";
        return params;
      }, {});
  };

  /**
   * Get zone wise info
   */
  getZoneWiseInfo(): void {
    this.alarmService.getZoneWiseInfo().subscribe((result) => {
      if (!result.error && !result.errorInfo) {
        let zoneWiseResData = result.data
          .filter((item) => item.zone_priority === 1)
          .map((item) => {
            return item.geojson.features;
          })[0];
        this.zoneWiseData = zoneWiseResData.map((item) => {
          return Object.assign(item.properties, {
            selected_options: {
              zone_id: item.properties.zone_area,
              radar_id: null,
              ti_id: null,
              uav_id: null,
              ugv_id: null,
            },
          });
        });
        this.originalZoneWiseData = _.cloneDeep(this.zoneWiseData);
        this.getSensorsData();

        // Get the system mapped config details
        this.getSystemMappedConfig();
      }
    });
  }

  getSensorsData(): void {
    this.systemConfigurationService.getSensors().subscribe((result) => {
      if (result && !result.error) {
        this.sensorsData.radorData = result.data
          .filter((item) => item.sensor_type === "RADAR")
          .map((item) => {
            return { ...item, ...{ selected: false } };
          });
        this.sensorsData.tiData = result.data
          .filter((item) => item.sensor_type === "TI")
          .map((item) => {
            return { ...item, ...{ selected: false } };
          });
      }
    });

    this.dataService.getGeoJsonInfo("UGV").subscribe((result: any) => {
      if (result && !result.error) {
        this.sensorsData.ugvData = result.data.features.map((item) => {
          return { ...item.properties, ...{ selected: false } };
        });
      }
    });

    this.dataService.getGeoJsonInfo("UAV").subscribe((result: any) => {
      if (result && !result.error) {
        this.sensorsData.uavData = result.data.features.map((item) => {
          return { ...item.properties, ...{ selected: false } };
        });
      }
    });
  }

  saveMappedConfig() {
    let zoneWiseArr = this.zoneWiseData;
    let originalzonewiseArr = this.originalZoneWiseData;
    const results = _.differenceWith(
      zoneWiseArr,
      originalzonewiseArr,
      _.isEqual
    );
    // console.log(
    //   "save config",
    //   zoneWiseArr,
    //   originalzonewiseArr,
    //   "results -----",
    //   results
    // );
    // if (results.length) {
      const data = this.zoneWiseData
        .filter((item) => item)
        .map((item) => item.selected_options);
      console.log("data ----", data);

      this.systemConfigurationService
        .systemMappedConfig({ selected_options: data })
        .subscribe((res) => {
          if (!res.error && !res.errorInfo) {
            this.toastr.success("Saved Successfully");
          }
        });
    // }
    // return this.toastr.warning("No changes made !!");
  }

  onCancel() {
    this.zoneWiseData = [];
    this.getZoneWiseInfo();
  }
  selectSensorType(value, type, zone_id) {
    let zoneIndex = this.zoneWiseData.findIndex(
      (item) => item.zone_area === zone_id
    );
    let selected_options = this.zoneWiseData[zoneIndex].selected_options;

    if (type === "radar") {
      this.sensorsData.radorData.filter((item) => {
        if (item.sensor_id === value) {
          item.selected = true;
        }
      });
      selected_options.radar_id = value;
    } else if (type === "ti") {
      this.sensorsData.tiData.filter((item) => {
        if (item.sensor_id === value) {
          item.selected = true;
        }
      });
      selected_options.ti_id = value;
    } else if (type === "uav") {
      this.sensorsData.uavData.filter((item) => {
        if (item.uav_id === value) {
          item.selected = true;
        }
      });
      selected_options.uav_id = value;
    } else if (type === "ugv") {
      this.sensorsData.ugvData.filter((item) => {
        if (item.ugv_id === value) {
          item.selected = true;
        }
      });
      selected_options.ugv_id = value;
    }
  }
}
