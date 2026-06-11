import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { MaintenanceUserSidebarComponent } from './maintenance-user-sidebar.component';
import { IndividualConfig, ToastrModule, ToastrService } from 'ngx-toastr';

describe('MaintenanceUserSidebarComponent', () => {
  let component: MaintenanceUserSidebarComponent;
  let fixture: ComponentFixture<MaintenanceUserSidebarComponent>;
  let toastr: ToastrService;
  const toastrService = {
    success: (
      message?: string,
      title?: string,
      override?: Partial<IndividualConfig>
    ) => {},
    error: (
      message?: string,
      title?: string,
      override?: Partial<IndividualConfig>
    ) => {},
    info: (
      message?: string,
      title?: string,
      override?: Partial<IndividualConfig>
    ) => {},
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[
        HttpClientTestingModule,
        ModalModule.forRoot(),
        ToastrModule.forRoot(),
      ],
      declarations: [ MaintenanceUserSidebarComponent ],
      providers: [BsModalService,  {provide: ToastrService, useValue: toastrService}]
    })
    .compileComponents();
    toastr = TestBed.get(ToastrService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceUserSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call set user privileges', fakeAsync(() => {
    fixture = TestBed.createComponent(MaintenanceUserSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'setUserPrivileges').and.callThrough();
    component.setUserPrivileges();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.setUserPrivileges).toHaveBeenCalled();
    flush();
  }));

  it('should call get sensors data', fakeAsync(() => {
    fixture = TestBed.createComponent(MaintenanceUserSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getSensorsData').and.callThrough();
    component.getSensorsData();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.getSensorsData).toHaveBeenCalled();
    flush();
  }));

  it('should call get translation language key', fakeAsync(() => {
    fixture = TestBed.createComponent(MaintenanceUserSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getTranslationLang').and.callThrough();
    component.getTranslationLang('test');
    fixture.detectChanges();

    expect(component.getTranslationLang).toHaveBeenCalled();
    flush();
  }));


  it('should call modify configuration', fakeAsync(() => {
    var mockSensorData = {"sensor_id":10,"sensor_type":"AGU","sensor_location":{"crs":{"type":"name","properties":{"name":"EPSG:4326"}},"type":"Point","coordinates":[76.54007139292038,14.386687230021375]},"current_status":true,"ip":"172.16.0.9","mac_address":"08:00:2b:01:02:03","height":"1.5","radius":null,"installed_on":null,"zone_id":"19","azimuth":null,"username":null,"password":null,"zone_shape":"Polygon","zone_type":"System Defined","zone_area":{"type":"MultiPolygon","coordinates":[[[[76.5407852216359,14.3952536364078],[76.5369021614683,14.3879643831108],[76.5344497024151,14.3836725797676],[76.5391502489338,14.3831957127295],[76.5490282090093,14.3831957127295],[76.5503225623985,14.3876918876604],[76.5523662782761,14.3891906126374],[76.5539331271157,14.3899399751259],[76.5557724714056,14.3902124705762],[76.5566580816193,14.3905530898892],[76.5535243839402,14.3963436182093],[76.5525706498639,14.3955942557208],[76.5509356771618,14.3949811409575],[76.5495050760474,14.3947086455071],[76.5473251124445,14.3947086455071],[76.5454857681546,14.3948448932323],[76.5444639102158,14.3949811409575],[76.5437145477273,14.3945042739194],[76.5424883182007,14.3945042739194],[76.5418752034374,14.3951173886827],[76.5407852216359,14.3952536364078]]]]},"no_of_qrts":null,"no_of_ugvs":null,"no_of_uavs":null,"zone_priority":1}

    fixture = TestBed.createComponent(MaintenanceUserSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick(500);

    const tempRef = component.templateRef;
    fixture.autoDetectChanges();
    tick(100);
    
    spyOn(component, 'modifyConfiguration').and.callThrough();
    component.modifyConfiguration(tempRef, mockSensorData);

    expect(component.modifyConfiguration).toHaveBeenCalled();
    flush();
  }));

  it('should call get selected user sensors after checkbox select', fakeAsync(() => {
    fixture = TestBed.createComponent(MaintenanceUserSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const mockevent = {
      target:{
        checked: true
      }
    }

    const defaultId = 10;

    spyOn(component, 'getSelectedSensors').and.callThrough();
    component.getSelectedSensors(mockevent, defaultId);

    expect(component.getSelectedSensors).toHaveBeenCalled();
    flush();
  }));

  it('should call  discard sensors after discard click', fakeAsync(() => {
    fixture = TestBed.createComponent(MaintenanceUserSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    let sensorList = [
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

    component.sensorsList = sensorList;
    fixture.detectChanges();
    
    const defaultSensorId = 10;
    const mocksensorIndex = 0;

    spyOn(component, 'discardSensor').and.callThrough();
    component.discardSensor(defaultSensorId, mocksensorIndex);
    fixture.detectChanges();

    expect(component.discardSensor).toHaveBeenCalled();
    expect(component.discardSensor).toBeDefined();

    flush();
  }));

  it('should call  fixed sensors after fixed click', fakeAsync(() => {
    fixture = TestBed.createComponent(MaintenanceUserSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'fixedSensor').and.callThrough();
    component.fixedSensor();
    fixture.detectChanges();

    component.toastr = toastr;
    fixture.detectChanges();

    expect(component.fixedSensor).toHaveBeenCalled();
    expect(component.fixedSensor).toBeDefined();
    flush();
  }));

  it('should call  update sensors information', fakeAsync(() => {
    fixture = TestBed.createComponent(MaintenanceUserSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'updateSensorData').and.callThrough();
    component.updateSensorData();
    fixture.detectChanges();

    expect(component.updateSensorData).toHaveBeenCalled();
    expect(component.updateSensorData).toBeDefined();
    flush();
  }));

  it('should call  receive sensors information', fakeAsync(() => {
    fixture = TestBed.createComponent(MaintenanceUserSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'receivesSensorData').and.callThrough();
    component.receivesSensorData();

    expect(component.receivesSensorData).toHaveBeenCalled();
    flush();
  }));

});
