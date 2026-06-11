import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IndividualConfig, ToastrModule, ToastrService } from 'ngx-toastr';
import { SidebarComponent } from './sidebar.component';
import { MainPipe } from '../../shared/pipes/main-pipe.module';
import { config } from 'src/config/config';
import { AlarmService } from 'src/app/services/alarm.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  var service: AlarmService;
  let httpTestingController: HttpTestingController;
  let ROOT_URl = 'http://localhost:5106/api/alarm';
  const toastrService = {
    success: (
      message?: string,
      title?: string,
      override?: Partial<IndividualConfig>
    ) => { },
    error: (
      message?: string,
      title?: string,
      override?: Partial<IndividualConfig>
    ) => { },
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        ToastrModule.forRoot(),
        HttpClientTestingModule,
        MainPipe
      ],
      declarations: [SidebarComponent],
      providers: [{ provide: ToastrService, useValue: toastrService }]

    })
      .compileComponents();
      service = TestBed.get(AlarmService);
      httpTestingController = TestBed.get(HttpTestingController);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call sidebar set user privileges', fakeAsync(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'setUserPrivileges').and.callThrough();
    component.setUserPrivileges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.setUserPrivileges).toHaveBeenCalled();
    flush();
  }));

  it('should call  get alarm properties', fakeAsync(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getAlarmProperties').and.callThrough();
    component.getAlarmProperties();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.getAlarmProperties).toHaveBeenCalled();
    flush();
  }));

  it('should call  validateAck clear alarm', fakeAsync(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'validateAckClearAlarm').and.callThrough();
    component.validateAckClearAlarm();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.validateAckClearAlarm).toHaveBeenCalled();
    flush();
  }));

  it('should call  initSocketConnection', fakeAsync(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'initSocketConnection').and.callThrough();
    component.initSocketConnection();
    fixture.detectChanges();

    expect(component.initSocketConnection).toHaveBeenCalled();
    flush();
  }));

  it('should call  change position', fakeAsync(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'changePosition').and.callThrough();
    component.changePosition();
    fixture.detectChanges();

    expect(component.changePosition).toHaveBeenCalled();
    flush();
  }));

  it('should check modeData', fakeAsync(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    if(component.modeData){
      expect(component.modeData).toEqual('auto');
    }
    expect(component.modeData).toBeDefined();
    flush();
  }));

  it('should call  display radar track', fakeAsync(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    var mockCheckedEvent = {
      target: {
        checked: true
      }
    }

    spyOn(component, 'displayRadarTrack').and.callThrough();
    component.displayRadarTrack(mockCheckedEvent);

    expect(component.displayRadarTrack).toHaveBeenCalled();
    flush();
  }));

  it('should call get translation language key', fakeAsync(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getTranslationLang').and.callThrough();
    component.getTranslationLang('test');
    fixture.detectChanges();

    expect(component.getTranslationLang).toHaveBeenCalled();
    flush();
  }));

  it('should call sideBarUpdateAlarms', fakeAsync(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    let res = {
      alarmData: {
        alarm_id: "10.66.40.61/camera.1",
        alarm_type: 2,
        camera_id: "10.66.40.61/camera.1",
        event_id: "10.66.40.61/camera.1",
        event_type: 0,
        location: [
          76.52890937718453,
          14.38497061623047
        ],
        sensors_triggered: ["camera"],
      },
      alarm_id: "10.66.40.61/camera.1",
      alarm_type: 2,
      camera_id: "10.66.40.61/camera.1",
      category: "alarm",
      event_id: "10.66.40.61/camera.1",
      event_type: 0,
      location: [
        76.52890937718453,
        14.38497061623047],
      mode: "manual",
      sensors_triggered: ["camera"]
    }

    spyOn(component, 'sideBarUpdateAlarms').and.callThrough();
    component.sideBarUpdateAlarms(res);
    fixture.detectChanges();

    expect(component.sideBarUpdateAlarms).toHaveBeenCalled();
    flush();
  }));

  it('should call updateAlarms', fakeAsync(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    let res = {
      alarmData: {
        alarm_id: "10.66.40.61/camera.1",
        alarm_type: 2,
        camera_id: "10.66.40.61/camera.1",
        event_id: "10.66.40.61/camera.1",
        event_type: 0,
        location: [
          76.52890937718453,
          14.38497061623047
        ],
        sensors_triggered: ["camera"],
      },
      alarm_id: "10.66.40.61/camera.1",
      alarm_type: 2,
      camera_id: "10.66.40.61/camera.1",
      category: "alarm",
      event_id: "10.66.40.61/camera.1",
      event_type: 0,
      location: [
        76.52890937718453,
        14.38497061623047],
      mode: "manual",
      sensors_triggered: ["camera"]
    }

    spyOn(component, 'updateAlarms').and.callThrough();
    component.updateAlarms(res);
    fixture.detectChanges();

    expect(component.updateAlarms).toHaveBeenCalled();
    flush();
  }));

  it('should call assignVehicle', fakeAsync(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    let res = {
      alarm_id: "10.66.40.61/camera.3",
      alarm_priority: null,
      alarm_type: 1,
      alarmmsg_time: "2020-12-31T06:13:23.796Z",
      camera_id: "10.66.40.61/camera.3",
      event_id: "10.66.40.61/camera.3",
      event_type: 1,
      formatted_zone_id: "zone-20",
      id: 248,
      isAssigned: true,
      location: {
        coordinates: [
          76.53959529789988,
          14.390935849079591]
      },
      crs: {
        properties: {
          name: "EPSG:4326"
        },
        type: "name"
      },
      type: "Point",
      sensors_triggered: ["camera"],
      timeofevent: "2020-12-31T06:13:23.856Z",
      zone_id: "20"
    }

    spyOn(component, 'assignVehicle').and.callThrough();
    component.assignVehicle(res, 'ugv');
    fixture.detectChanges();

    expect(component.assignVehicle).toHaveBeenCalled();
    flush();
  }));

  it('should call assignToResponse', fakeAsync(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.assignments = [
      {
          "src":"assets/sensor-icons/UAV-26px.svg",
          "isAssigned": false,
          "type":"uav"
      },
      {
          "src":"assets/sensor-icons/UGV-26px.svg",
          "isAssigned": false,
          "type":"ugv"
      },
      {
          "src":"assets/sensor-icons/QRT-42px.svg",
          "isAssigned": false,
          "type":"qrt"
  
      }
  ];
    fixture.detectChanges();

    let res = {
      alarm_id: "10.66.40.61/camera.3",
      alarm_priority: null,
      alarm_type: 1,
      alarmmsg_time: "2020-12-31T06:13:23.796Z",
      camera_id: "10.66.40.61/camera.3",
      event_id: "10.66.40.61/camera.3",
      event_type: 1,
      formatted_zone_id: "zone-20",
      id: 248,
      isAssigned: true,
      location: {
        coordinates: [
          76.53959529789988,
          14.390935849079591]
      },
      crs: {
        properties: {
          name: "EPSG:4326"
        },
        type: "name"
      },
      type: "Point",
      sensors_triggered: ["camera"],
      timeofevent: "2020-12-31T06:13:23.856Z",
      zone_id: "20"
    }

    component.alarms_list = {
      "Confirmatory_Alarm": [
        {
          "alarm_id": "10.66.40.61/camera.2",
          "alarmmsg_time": "2021-01-04T04:36:09.351Z",
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
          "timeofevent": "2021-01-04T04:36:38.671Z",
          "formatted_zone_id": "zone-19"
        }
      ],
      "Early_Alarm": [
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
          "timeofevent": "2020-12-31T06:13:22.620Z",
          "formatted_zone_id": "zone-null"
        },
        {
          "alarm_id": "10.66.40.61/camera.1",
          "alarmmsg_time": "2021-01-04T04:35:23.552Z",
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
          "timeofevent": "2021-01-04T04:35:23.672Z",
          "formatted_zone_id": "zone-null"
        }
      ]
    };
    fixture.detectChanges();

    spyOn(component, 'assignToResponse').and.callThrough();
    component.assignToResponse(res, 20, 'ugv', 1, 0);
    fixture.detectChanges();

    expect(component.assignToResponse).toHaveBeenCalled();
    flush();
  }));

  it('should call acknowledgeClearAlarm', fakeAsync(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    let res = {
      acknowledged_cleared: 1,
      alarm_id: "10.66.40.61/camera.2",
      alarm_priority: null,
      alarm_type: 1,
      alarmmsg_time: "2021-01-03T18:01:21.416Z",
      camera_id: "10.66.40.61/camera.2",
      event_id: "10.66.40.61/camera.2",
      event_type: 1,
      formatted_zone_id: "zone-19",
      id: 246,
      location: {
        coordinates: [
          76.53645158861788,
          14.387097877362908]
      },
      crs: {
        properties: {
          name: "EPSG:4326"
        },
        type: "name"
      },
      type: "Point",
      sensors_triggered: ["camera"],
      timeofevent: "2021-01-03T18:01:21.442Z",
      zone_id: "19"
    }

    component.assignments = config.assignments;
    fixture.detectChanges();

    spyOn(component, 'acknowledgeClearAlarm').and.callThrough();
    component.acknowledgeClearAlarm(res, true, 1);
    fixture.detectChanges();

    expect(component.acknowledgeClearAlarm).toHaveBeenCalled();
    flush();
  }));


  it('should set item in local storage', () => {
    component.commonService.setInLocalStorage('test', 'testvalue');
    fixture.detectChanges();
    expect(localStorage.getItem('test')).toEqual('testvalue');
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

});
