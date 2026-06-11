import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SystemConfigurationService } from './system-configuration.service';

describe('SystemConfiguration', () => {
  var service: SystemConfigurationService;
  let httpTestingController: HttpTestingController;
  let ROOT_URl = 'http://localhost:5107/api/sensor';
  let MAP_URL = 'http://localhost:5105/api/map';
  let ADAPTER_URL = 'http://localhost:9090/api/ros/web/adapter';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SystemConfigurationService]
    });
    service = TestBed.get(SystemConfigurationService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Api call for getSystemConfiguration', () => {
    let result = [
      {
        "config_id": 10,
        "sensors": "15,3",
        "role": 1,
        "updated_time": "2020-11-27T06:30:46.362Z"
      },
      {
        "config_id": 11,
        "sensors": "15,2",
        "role": 1,
        "updated_time": "2020-11-27T06:30:46.362Z"
      }];
    service.getSystemConfiguration().subscribe(posts => {
      expect(posts.length).toBeGreaterThan(0);
    });

    const request = httpTestingController.expectOne(`${ROOT_URl}/system-configuration`);
    expect(request.request.method).toBe('GET');
    request.flush(result);
  });

  it('Api call for get map-config', () => {
    let result = [
      {
        "geojson": {
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "geometry": {
                "type": "MultiPolygon",
                "coordinates": [
                  [
                    [
                      [
                        76.53368128,
                        14.383131829
                      ],
                      [
                        76.537717141,
                        14.390050447
                      ],
                      [
                        76.541272542,
                        14.397161249
                      ],
                      [
                        76.543578748,
                        14.401869753
                      ],
                      [
                        76.544635759,
                        14.402542396
                      ],
                      [
                        76.545788862,
                        14.40321504
                      ],
                      [
                        76.547422425,
                        14.403887683
                      ],
                      [
                        76.548767711,
                        14.404752511
                      ],
                      [
                        76.550112998,
                        14.40523297
                      ],
                      [
                        76.552034837,
                        14.405425154
                      ],
                      [
                        76.553956675,
                        14.40571343
                      ],
                      [
                        76.556743341,
                        14.40571343
                      ],
                      [
                        76.559241731,
                        14.40523297
                      ],
                      [
                        76.561932304,
                        14.404656419
                      ],
                      [
                        76.565199429,
                        14.403695499
                      ],
                      [
                        76.5667369,
                        14.403599408
                      ],
                      [
                        76.56875483,
                        14.402926764
                      ],
                      [
                        76.570772761,
                        14.402254121
                      ],
                      [
                        76.570868853,
                        14.402158029
                      ],
                      [
                        76.572118048,
                        14.401869753
                      ],
                      [
                        76.572118048,
                        14.401869753
                      ],
                      [
                        76.573367242,
                        14.401485385
                      ],
                      [
                        76.575000805,
                        14.401389293
                      ],
                      [
                        76.575673448,
                        14.40119711
                      ],
                      [
                        76.576057816,
                        14.400908834
                      ],
                      [
                        76.575481265,
                        14.398506536
                      ],
                      [
                        76.57625,
                        14.397641709
                      ],
                      [
                        76.577595287,
                        14.396680789
                      ],
                      [
                        76.579517125,
                        14.394662859
                      ],
                      [
                        76.580670228,
                        14.39370194
                      ],
                      [
                        76.583072526,
                        14.392644929
                      ],
                      [
                        76.584706089,
                        14.392548837
                      ],
                      [
                        76.587588846,
                        14.391780102
                      ],
                      [
                        76.589991144,
                        14.391587918
                      ],
                      [
                        76.593162178,
                        14.391107458
                      ],
                      [
                        76.595084016,
                        14.391107458
                      ],
                      [
                        76.596717579,
                        14.391107458
                      ],
                      [
                        76.597005854,
                        14.388993436
                      ],
                      [
                        76.597198038,
                        14.386879414
                      ],
                      [
                        76.595948843,
                        14.386398954
                      ],
                      [
                        76.593834821,
                        14.384861484
                      ],
                      [
                        76.592201258,
                        14.383227921
                      ],
                      [
                        76.591720799,
                        14.379576428
                      ],
                      [
                        76.591528615,
                        14.376501487
                      ],
                      [
                        76.591720799,
                        14.371792983
                      ],
                      [
                        76.58979896,
                        14.371216431
                      ],
                      [
                        76.588838041,
                        14.372849994
                      ],
                      [
                        76.551073918,
                        14.373042178
                      ],
                      [
                        76.549152079,
                        14.382747461
                      ],
                      [
                        76.533777372,
                        14.383035737
                      ],
                      [
                        76.53368128,
                        14.383131829
                      ]
                    ]
                  ]
                ]
              },
              "properties": {
                "site_area": 2,
                "default_center": {
                  "type": "Point",
                  "coordinates": [
                    76.5628308,
                    14.3876045
                  ]
                },
                "updated_time": "2020-11-26T11:27:05.881223"
              }
            }
          ]
        }
      }
    ];
    service.getMapConfiguration().subscribe(geoJson => {
      expect(geoJson.length).toBeGreaterThan(0);
    });

    const request = httpTestingController.expectOne(`${MAP_URL}/get-mapconfig`);
    expect(request.request.method).toBe('GET');
    request.flush(result);
  });

  it('Api call for getSensors list for system-configuration', () => {
    let result = [
      {
        "sensor_id": 88,
        "sensor_type": "TI",
        "sensor_location": {
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "type": "Point",
          "coordinates": [
            76.5344,
            14.384
          ]
        },
        "current_status": true,
        "ip": null,
        "mac_address": null,
        "height": null,
        "radius": null,
        "installed_on": null,
        "zone_id": null,
        "azimuth": null,
        "username": null,
        "password": null,
        "normal": null,
        "low": null,
        "high": null,
        "short": null,
        "short_low": null,
        "min_distance": null,
        "min_detection": null,
        "target_velocity": null,
        "port": null,
        "address_offset": null,
        "no_of_connections": null,
        "load_modbus_map": null,
        "primary_server_url": null,
        "backup_server_url": null,
        "da_ch1_tocken": null,
        "das_ch2_tocken": null,
        "update_rate": null,
        "rtsp": null,
        "http": null,
        "ssh_port": null,
        "rtsp_port": null,
        "https_port": null,
        "heart_beat": null,
        "health_status": null,
        "silence_period": null,
        "threshold_sensitivity": null,
        "enable_disable": null,
        "alarm_time": null,
        "node_id": null,
        "network_id": null,
        "battery_percentage": null,
        "battery_status": null,
        "signal_strength": null,
        "mean": null,
        "deviation": null
      },
      {
        "sensor_id": 87,
        "sensor_type": "TI",
        "sensor_location": {
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "type": "Point",
          "coordinates": [
            76.539,
            14.3921
          ]
        },
        "current_status": true,
        "ip": null,
        "mac_address": null,
        "height": null,
        "radius": null,
        "installed_on": null,
        "zone_id": null,
        "azimuth": null,
        "username": null,
        "password": null,
        "normal": null,
        "low": null,
        "high": null,
        "short": null,
        "short_low": null,
        "min_distance": null,
        "min_detection": null,
        "target_velocity": null,
        "port": null,
        "address_offset": null,
        "no_of_connections": null,
        "load_modbus_map": null,
        "primary_server_url": null,
        "backup_server_url": null,
        "da_ch1_tocken": null,
        "das_ch2_tocken": null,
        "update_rate": null,
        "rtsp": null,
        "http": null,
        "ssh_port": null,
        "rtsp_port": null,
        "https_port": null,
        "heart_beat": null,
        "health_status": null,
        "silence_period": null,
        "threshold_sensitivity": null,
        "enable_disable": null,
        "alarm_time": null,
        "node_id": null,
        "network_id": null,
        "battery_percentage": null,
        "battery_status": null,
        "signal_strength": null,
        "mean": null,
        "deviation": null
      }
    ];
    service.getSensors().subscribe(sensors => {
      expect(sensors.length).toBeGreaterThan(0);
    });

    const request = httpTestingController.expectOne(`${ROOT_URl}/system-configuration/sensors`);
    expect(request.request.method).toBe('GET');
    request.flush(result);
  });

  it("should getSystemConfiguration throw error", () => {
    let error: string;
    service.getSystemConfiguration().subscribe({
      next: () => { }, error: (e) => {
        error = e;
      }
    });

    let req = httpTestingController.expectOne(`${ROOT_URl}/system-configuration`);
    req.flush("Something went wrong", {
      status: 404,
      statusText: "Network error"
    });

    expect(error.indexOf("Network error") >= 0).toBeTruthy();
  });

  it("should getSensors throw error", () => {
    let error: string;
    service.getSensors().subscribe({
      next: () => { }, error: (e) => {
        error = e;
      }
    });

    let req = httpTestingController.expectOne(`${ROOT_URl}/system-configuration/sensors`);
    req.flush("Something went wrong", {
      status: 404,
      statusText: "Network error"
    });
    expect(error.indexOf("Network error") >= 0).toBeTruthy();
  });

  it("should getMapConfig throw error", () => {
    let error: string;
    service.getMapConfiguration().subscribe({
      next: () => { }, error: (e) => {
        error = e;
      }
    });

    let req = httpTestingController.expectOne(`${MAP_URL}/get-mapconfig`);
    req.flush("Something went wrong", {
      status: 404,
      statusText: "Network error"
    });
    expect(error.indexOf("Network error") >= 0).toBeTruthy();
  });

  it("should call updateSystemConfiguration API", () => {
    let data = {
      "role":1,
      "sensors":["15","3"],
      "isUpdate":true,
      "id":10
    };
    service.updateSystemConfiguration(data).subscribe();
  
    let req = httpTestingController.expectOne({ method: "PUT", url: `${ADAPTER_URL}/configuration/system` });
    expect(req.request.body).toEqual(data);
  });

  it("should call saveSystemConfiguration API", () => {
    let data = {
      "role":1,
      "sensors":["15","3"],
      "isUpdate":false,
      "id":null
    };
    service.saveSystemConfiguration(data).subscribe();
  
    let req = httpTestingController.expectOne({ method: "POST", url: `${ROOT_URl}/system-configuration` });
    expect(req.request.body).toEqual(data);
  });

});
