import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';
import { AlarmService } from './alarm.service';

describe('AlarmService', () => {
  var service: AlarmService;
  let httpTestingController: HttpTestingController;
  let ROOT_URl = 'http://localhost:5106/api/alarm';
  let SENSOR_URL = 'http://localhost:5107/api/sensor';
  let NOTIFICATION_URL = 'http://localhost:5110/api/notification';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [AlarmService]
    });
    service = TestBed.get(AlarmService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Api call getAlarmData', (done) => {
    let result = [
      {
        "alarm_id": "10.66.40.61/camera.1",
        "alarmmsg_time": "2020-12-31T02:38:21.094Z",
        "alarm_type": 2,
        "event_id": "10.66.40.61/camera.1",
        "camera_id": "10.66.40.61/camera.1",
        "location": {
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "type": "Point",
          "coordinates": [
            76.52890937718453,
            14.38497061623047
          ]
        },
        "sensors_triggered": [
          "camera"
        ],
        "zone_id": null,
        "alarm_priority": null,
        "id": 245,
        "event_type": 0,
        "timeofevent": "2020-12-31T02:38:21.153Z"
      },
      {
        "alarm_id": "10.66.40.61/camera.2",
        "alarmmsg_time": "2020-12-31T02:38:24.953Z",
        "alarm_type": 1,
        "event_id": "10.66.40.61/camera.2",
        "camera_id": "10.66.40.61/camera.2",
        "location": {
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "type": "Point",
          "coordinates": [
            76.53645158861788,
            14.387097877362908
          ]
        },
        "sensors_triggered": [
          "camera"
        ],
        "zone_id": "19",
        "alarm_priority": null,
        "id": 246,
        "event_type": 0,
        "timeofevent": "2020-12-31T02:38:25.033Z"
      },
      {
        "alarm_id": "10.66.40.61/camera.4",
        "alarmmsg_time": "2020-12-31T06:13:22.516Z",
        "alarm_type": 2,
        "event_id": "10.66.40.61/camera.4",
        "camera_id": "10.66.40.61/camera.4",
        "location": {
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "type": "Point",
          "coordinates": [
            76.5366985121638,
            14.39393992317627
          ]
        },
        "sensors_triggered": [
          "camera"
        ],
        "zone_id": null,
        "alarm_priority": null,
        "id": 247,
        "event_type": 0,
        "timeofevent": "2020-12-31T06:13:22.620Z"
      },
      {
        "alarm_id": "10.66.40.61/camera.3",
        "alarmmsg_time": "2020-12-31T06:13:23.796Z",
        "alarm_type": 1,
        "event_id": "10.66.40.61/camera.3",
        "camera_id": "10.66.40.61/camera.3",
        "location": {
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "type": "Point",
          "coordinates": [
            76.53959529789988,
            14.390935849079591
          ]
        },
        "sensors_triggered": [
          "camera"
        ],
        "zone_id": "20",
        "alarm_priority": null,
        "id": 248,
        "event_type": 0,
        "timeofevent": "2020-12-31T06:13:23.856Z"
      },
      {
        "alarm_id": "10.66.40.61/camera.3",
        "alarmmsg_time": "2020-12-31T06:13:23.796Z",
        "alarm_type": 1,
        "event_id": "10.66.40.61/camera.3",
        "camera_id": "10.66.40.61/camera.3",
        "location": {
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "type": "Point",
          "coordinates": [
            76.53959529789988,
            14.390935849079591
          ]
        },
        "sensors_triggered": [
          "camera"
        ],
        "zone_id": "20",
        "alarm_priority": null,
        "id": 248,
        "event_type": 1,
        "timeofevent": "2020-12-31T06:13:37.936Z"
      },
      {
        "alarm_id": "10.66.40.61/camera.2",
        "alarmmsg_time": "2020-12-31T02:38:24.953Z",
        "alarm_type": 1,
        "event_id": "10.66.40.61/camera.2",
        "camera_id": "10.66.40.61/camera.2",
        "location": {
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "type": "Point",
          "coordinates": [
            76.53645158861788,
            14.387097877362908
          ]
        },
        "sensors_triggered": [
          "camera"
        ],
        "zone_id": "19",
        "alarm_priority": null,
        "id": 246,
        "event_type": 1,
        "timeofevent": "2020-12-31T06:13:38.876Z"
      }
    ];
    service.getAlarmInfo().subscribe((res) => {
      if (res.length) {
        expect(res.length).toBeGreaterThan(0);
        done();
      } else {
        expect(res.error).toThrowMatching(err => err);
        done();
      }
    });

    const request = httpTestingController.expectOne(`${ROOT_URl}/alarm-info`);
    expect(request.request.method).toBe('GET');
    request.flush(result);
  });

  it('Api call to Acknowledge clear alarms', (done) => {
    let param = {
      "alarm_id": "10.66.40.61/camera.2",
      "alarmmsg_time": "2020-12-31T02:38:24.953Z",
      "alarm_type": 1,
      "event_id": "10.66.40.61/camera.2",
      "camera_id": "10.66.40.61/camera.2",
      "location": {
        "crs": {
          "type": "name",
          "properties": {
            "name": "EPSG:4326"
          }
        },
        "type": "Point",
        "coordinates": [
          76.53645158861788,
          14.387097877362908
        ]
      },
      "sensors_triggered": [
        "camera"
      ],
      "zone_id": "19",
      "alarm_priority": null,
      "id": 246,
      "event_type": 1,
      "timeofevent": "2020-12-31T02:38:25.033Z",
      "formatted_zone_id": "zone-19",
      "acknowledged_cleared": 2
    };
    let fakeResponse = {
      "error": false,
      "message": "Updated successfully",
      "statusCode": 200,
      "status": "success"
    };
    service.acknowledgeClearAlarms(param).subscribe((res) => {
      if (res) {
        expect(res.statusCode).toEqual(200);
        done();
      } else {
        expect(res.error).toThrowMatching(err => err);
        done();
      }
    });

    const request = httpTestingController.expectOne(`${ROOT_URl}/acknowledge-clear`);
    expect(request.request.method).toBe('PUT');
    request.flush(fakeResponse);
  });

  it('Api call getAlarmTimeLineInfo', (done) => {
    let allfilter = {
      alarmId: "",
      endDate: "",
      startDate: "",
      zoneId: ""
    };
    let result = [
      {
        "alarm_id": "10.66.40.61/camera.1",
        "alarmmsg_time": "2020-12-31T02:38:21.094Z",
        "alarm_type": 2,
        "event_id": "10.66.40.61/camera.1",
        "camera_id": "10.66.40.61/camera.1",
        "location": {
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "type": "Point",
          "coordinates": [
            76.52890937718453,
            14.38497061623047
          ]
        },
        "sensors_triggered": [
          "camera"
        ],
        "zone_id": null,
        "alarm_priority": null,
        "id": 245,
        "event_type": 0,
        "timeofevent": "2020-12-31T02:38:21.153Z"
      },
      {
        "alarm_id": "10.66.40.61/camera.2",
        "alarmmsg_time": "2020-12-31T02:38:24.953Z",
        "alarm_type": 1,
        "event_id": "10.66.40.61/camera.2",
        "camera_id": "10.66.40.61/camera.2",
        "location": {
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "type": "Point",
          "coordinates": [
            76.53645158861788,
            14.387097877362908
          ]
        },
        "sensors_triggered": [
          "camera"
        ],
        "zone_id": "19",
        "alarm_priority": null,
        "id": 246,
        "event_type": 0,
        "timeofevent": "2020-12-31T02:38:25.033Z"
      },
      {
        "alarm_id": "10.66.40.61/camera.4",
        "alarmmsg_time": "2020-12-31T06:13:22.516Z",
        "alarm_type": 2,
        "event_id": "10.66.40.61/camera.4",
        "camera_id": "10.66.40.61/camera.4",
        "location": {
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "type": "Point",
          "coordinates": [
            76.5366985121638,
            14.39393992317627
          ]
        },
        "sensors_triggered": [
          "camera"
        ],
        "zone_id": null,
        "alarm_priority": null,
        "id": 247,
        "event_type": 0,
        "timeofevent": "2020-12-31T06:13:22.620Z"
      },
      {
        "alarm_id": "10.66.40.61/camera.3",
        "alarmmsg_time": "2020-12-31T06:13:23.796Z",
        "alarm_type": 1,
        "event_id": "10.66.40.61/camera.3",
        "camera_id": "10.66.40.61/camera.3",
        "location": {
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "type": "Point",
          "coordinates": [
            76.53959529789988,
            14.390935849079591
          ]
        },
        "sensors_triggered": [
          "camera"
        ],
        "zone_id": "20",
        "alarm_priority": null,
        "id": 248,
        "event_type": 0,
        "timeofevent": "2020-12-31T06:13:23.856Z"
      },
      {
        "alarm_id": "10.66.40.61/camera.3",
        "alarmmsg_time": "2020-12-31T06:13:23.796Z",
        "alarm_type": 1,
        "event_id": "10.66.40.61/camera.3",
        "camera_id": "10.66.40.61/camera.3",
        "location": {
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "type": "Point",
          "coordinates": [
            76.53959529789988,
            14.390935849079591
          ]
        },
        "sensors_triggered": [
          "camera"
        ],
        "zone_id": "20",
        "alarm_priority": null,
        "id": 248,
        "event_type": 1,
        "timeofevent": "2020-12-31T06:13:37.936Z"
      },
      {
        "alarm_id": "10.66.40.61/camera.2",
        "alarmmsg_time": "2020-12-31T02:38:24.953Z",
        "alarm_type": 1,
        "event_id": "10.66.40.61/camera.2",
        "camera_id": "10.66.40.61/camera.2",
        "location": {
          "crs": {
            "type": "name",
            "properties": {
              "name": "EPSG:4326"
            }
          },
          "type": "Point",
          "coordinates": [
            76.53645158861788,
            14.387097877362908
          ]
        },
        "sensors_triggered": [
          "camera"
        ],
        "zone_id": "19",
        "alarm_priority": null,
        "id": 246,
        "event_type": 1,
        "timeofevent": "2020-12-31T06:13:38.876Z"
      }
    ];
    let param = 'filterName=filter'

    service.getAlarmTimelineInfo('filter', allfilter).subscribe((res) => {
      if (res.length) {
        expect(res.length).toBeGreaterThan(0);
        done();
      } else {
        expect(res.error).toThrowMatching(err => err);
        done();
      }
    });

    const request = httpTestingController.expectOne(`${ROOT_URl}/alarm-timeline?${param}`);
    expect(request.request.method).toBe('GET');
    request.flush(result);
  });

  it('Api call getNotifications', (done) => {
    let result = [
      {
        "id": 32,
        "type": "notification",
        "origin": "RADOR",
        "time": "2020-10-27",
        "data": {
          "sensor_id": 1,
          "sensor_type": "EOIR",
          "error_data": "Camera Problem"
        },
        "read_by": [
          1
        ],
        "cleared_by": [
          1
        ]
      },
      {
        "id": 31,
        "type": "notification",
        "origin": "RADOR",
        "time": "2020-10-27",
        "data": {
          "sensor_id": 1,
          "sensor_type": "EOIR",
          "error_data": "Camera Problem"
        },
        "read_by": null,
        "cleared_by": [
          1
        ]
      },
      {
        "id": 30,
        "type": "notification",
        "origin": "RADOR",
        "time": "2020-10-27",
        "data": {
          "sensor_id": 1,
          "sensor_type": "EOIR",
          "error_data": "Camera Problem"
        },
        "read_by": null,
        "cleared_by": [
          1
        ]
      },
      {
        "id": 29,
        "type": "notification",
        "origin": "RADOR",
        "time": "2020-10-21",
        "data": {
          "sensor_id": 1,
          "sensor_type": "EOIR",
          "error_data": "Camera Problem"
        },
        "read_by": null,
        "cleared_by": [
          1,
          2
        ]
      },
      {
        "id": 28,
        "type": "notification",
        "origin": "RADOR",
        "time": "2020-10-21",
        "data": {
          "sensor_id": 1,
          "sensor_type": "EOIR",
          "error_data": "Camera Problem"
        },
        "read_by": [
          1
        ],
        "cleared_by": [
          1,
          2
        ]
      },
      {
        "id": 27,
        "type": "notification",
        "origin": "RADOR",
        "time": "2020-10-21",
        "data": {
          "sensor_id": 1,
          "sensor_type": "EOIR",
          "error_data": "Network Problem"
        },
        "read_by": [
          1
        ],
        "cleared_by": [
          2,
          1
        ]
      },
      {
        "id": 26,
        "type": "notification",
        "origin": "RADOR",
        "time": "2020-10-21",
        "data": {
          "sensor_id": 1,
          "sensor_type": "EOIR",
          "error_data": "Network Problem"
        },
        "read_by": [
          2
        ],
        "cleared_by": [
          1,
          2
        ]
      },
      {
        "id": 25,
        "type": "notification",
        "origin": "RADOR",
        "time": "2020-10-21",
        "data": {
          "sensor_id": 1,
          "sensor_type": "EOIR",
          "error_data": "Network Problem"
        },
        "read_by": null,
        "cleared_by": [
          1,
          2
        ]
      }
    ];
    service.getNotifications().subscribe((res) => {
      if (res.length) {
        expect(res.length).toBeGreaterThan(0);
        done();
      } else {
        expect(res.error).toThrowMatching(err => err);
        done();
      }
    });

    const request = httpTestingController.expectOne(`${NOTIFICATION_URL}/all`);
    expect(request.request.method).toBe('GET');
    request.flush(result);
  });

  it("should call Update notification API", () => {
    let data = {
      id: 30,
      status: 1,
      user_id: 2
    };

    service.updateNotification(data).subscribe();

    let req = httpTestingController.expectOne({ method: "PUT", url: `${NOTIFICATION_URL}/change-status/${data.id}` });
    expect(req.request.body).toEqual(data);
  });

  it("should call Update auto manual mode API", () => {
    let data = {
      mode: "manual"
    };

    service.updateMode(data).subscribe();

    let req = httpTestingController.expectOne({ method: "PUT", url: `${ROOT_URl}/update-auto-manual-mode` });
     console.log('reqqqqqq', req.request.body)
    expect(req.request.body.mode).toEqual(data);
  });

  it('Api call getmode status', (done) => {
    let result = [
      {
        "mode": "manual"
      }
    ];
    service.getModeStatus().subscribe((res) => {
      if (res.length) {
        expect(res.length).toBeGreaterThan(0);
        done();
      } else {
        expect(res.error).toThrowMatching(err => err);
        done();
      }
    });

    const request = httpTestingController.expectOne(`${ROOT_URl}/get-auto-manual-mode`);
    expect(request.request.method).toBe('GET');
    request.flush(result);
  });

  it('Api call getSensor Details status', (done) => {
    let result = [
      {
        "header": {
          "params": [
            "S.No",
            "Sensor Type",
            "Sensor ID",
            "Zone ID",
            "IP Address",
            "MAC Address",
            "Longitude",
            "Latitude",
            "Azimuth",
            "Height",
            "Status",
            "Last Update",
            "Actions"
          ]
        },
        "body": [
          {
            "sensor_id": 40,
            "sensor_type": "LF",
            "sensor_location": {
              "crs": {
                "type": "name",
                "properties": {
                  "name": "EPSG:4326"
                }
              },
              "type": "LineString",
              "coordinates": [
                [
                  76.540760462425,
                  14.39560788486
                ],
                [
                  76.5378411320457,
                  14.3897141423961
                ],
                [
                  76.5340404943821,
                  14.3832695828796
                ],
                [
                  76.549353208447,
                  14.3829941743533
                ],
                [
                  76.5502,
                  14.3785
                ]
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
            "sensor_id": 5,
            "sensor_type": "RADAR",
            "sensor_location": {
              "crs": {
                "type": "name",
                "properties": {
                  "name": "EPSG:4326"
                }
              },
              "type": "Point",
              "coordinates": [
                76.53941565216552,
                14.39192916630717
              ]
            },
            "current_status": true,
            "ip": "195.60.68.14",
            "mac_address": "08:00:2b:01:02:03",
            "height": "1.5",
            "radius": {
              "crs": {
                "type": "name",
                "properties": {
                  "name": "EPSG:2805"
                }
              },
              "type": "MultiPolygon",
              "coordinates": [
                [
                  [
                    [
                      235670.354215375,
                      894016.780856
                    ],
                    [
                      235668.324215375,
                      894025.050856
                    ],
                    [
                      235681.154215375,
                      894028.210856
                    ],
                    [
                      235683.184215375,
                      894019.940856
                    ],
                    [
                      235670.354215375,
                      894016.780856
                    ]
                  ]
                ]
              ]
            },
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
            "sensor_id": 4,
            "sensor_type": "RADAR",
            "sensor_location": {
              "crs": {
                "type": "name",
                "properties": {
                  "name": "EPSG:4326"
                }
              },
              "type": "Point",
              "coordinates": [
                76.53460785352429,
                14.38410397498325
              ]
            },
            "current_status": true,
            "ip": "195.60.68.14",
            "mac_address": "08:00:2b:01:02:03",
            "height": "1.5",
            "radius": {
              "crs": {
                "type": "name",
                "properties": {
                  "name": "EPSG:2805"
                }
              },
              "type": "MultiPolygon",
              "coordinates": [
                [
                  [
                    [
                      235670.354215375,
                      894016.780856
                    ],
                    [
                      235668.324215375,
                      894025.050856
                    ],
                    [
                      235681.154215375,
                      894028.210856
                    ],
                    [
                      235683.184215375,
                      894019.940856
                    ],
                    [
                      235670.354215375,
                      894016.780856
                    ]
                  ]
                ]
              ]
            },
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
            "sensor_id": 3,
            "sensor_type": "RADAR",
            "sensor_location": {
              "crs": {
                "type": "name",
                "properties": {
                  "name": "EPSG:4326"
                }
              },
              "type": "Point",
              "coordinates": [
                76.54429196677874,
                14.38295621195001
              ]
            },
            "current_status": true,
            "ip": "195.60.68.14",
            "mac_address": "08:00:2b:01:02:03",
            "height": "1.5",
            "radius": {
              "crs": {
                "type": "name",
                "properties": {
                  "name": "EPSG:2805"
                }
              },
              "type": "MultiPolygon",
              "coordinates": [
                [
                  [
                    [
                      235670.354215375,
                      894016.780856
                    ],
                    [
                      235668.324215375,
                      894025.050856
                    ],
                    [
                      235681.154215375,
                      894028.210856
                    ],
                    [
                      235683.184215375,
                      894019.940856
                    ],
                    [
                      235670.354215375,
                      894016.780856
                    ]
                  ]
                ]
              ]
            },
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
        ]
      }
    ];
    service.getSensorDetails().subscribe((res) => {
      if (res.length) {
        expect(res.length).toBeGreaterThan(0);
        done();
      } else {
        expect(res.error).toThrowMatching(err => err);
        done();
      }
    });

    const request = httpTestingController.expectOne(`${SENSOR_URL}/all`);
    expect(request.request.method).toBe('GET');
    request.flush(result);
  });

  it("should call Update Sensor details API", () => {
    let data = {
      current_status: true,
      http: "1111",
      https_port: "8088",
      latitude: 14.3831,
      location_marker: "",
      longitude: "76.5448",
      password: "12345",
      rtsp_port: "3233",
      sensor_id: 89,
      sensor_type: "TI",
      ssh_port: "2323",
      username: "2"
    };

    service.updateSensorDetails(data).subscribe();

    let req = httpTestingController.expectOne({ method: "PUT", url: `${SENSOR_URL}/update` });
    expect(req.request.body).toEqual(data);
  });

  it("should call Update Sensor status API", () => {
    let data = {
      id: 89,
      status: false
    };

    service.updateSensorStatus(data).subscribe();

    let req = httpTestingController.expectOne({ method: "PUT", url: `${SENSOR_URL}/status-update` });
    expect(req.request.body).toEqual(data);
  });

  it("should call save sensor details API", () => {
    let data = {
      current_status: true,
      http: "1111",
      https_port: "8088",
      latitude: "14.5678",
      location_marker: "",
      longitude: "76.5448",
      password: "12345",
      rtsp_port: "3233",
      sensor_id: "",
      sensor_type: "TI",
      ssh_port: "2323",
      username: "12"
    };
    service.postSensorDetails(data).subscribe();

    let req = httpTestingController.expectOne({ method: "POST", url: `${SENSOR_URL}/create` });
    expect(req.request.body).toEqual(data);
  });

  it('Api call get/find zone alarms list', (done) => {
    let data = [
      {
        alarm_id: "10.66.40.61/camera.3",
        alarm_priority: null,
        alarm_type: 1,
        alarmmsg_time: "2020-12-31T06:13:23.796Z",
        camera_id: "10.66.40.61/camera.3",
        event_id: "10.66.40.61/camera.3",
        event_type: 1,
        formatted_zone_id: "zone-20",
        id: 248,
        location: {
          crs:
          {
            type: "name",
            properties: { name: "EPSG:4326" }
          }, type: "Point"
        },
        sensors_triggered: ["camera"],
        timeofevent: "2020-12-31T06:13:23.856Z",
        zone_id: "20"
      }
    ];
    let result = [{
      "zone_lists": []
    }]
    service.getZonesAlarmList(data).subscribe((res) => {
      if (res.length) {
        expect(res.length).toBeGreaterThan(0);
        done();
      } else {
        expect(res.error).toThrowMatching(err => err);
        done();
      }
    });

    const request = httpTestingController.expectOne(`${ROOT_URl}/find-zones-alarm-list`);
    expect(request.request.method).toBe('POST');
    request.flush(result);
  });

});
