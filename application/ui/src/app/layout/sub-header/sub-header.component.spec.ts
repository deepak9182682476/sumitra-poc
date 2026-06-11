import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IndividualConfig, ToastrModule, ToastrService } from 'ngx-toastr';
import { AppComponent } from 'src/app/app.component';
import { DocumentService } from 'src/app/services/document.service';
import { EventService } from 'src/app/services/event.service';
import { THEMES } from 'src/app/theme/symbols';
import { ThemeService } from 'src/app/theme/theme.service';

import { SubHeaderComponent } from './sub-header.component';

describe('SubHeaderComponent', () => {
  let component: SubHeaderComponent;
  let fixture: ComponentFixture<SubHeaderComponent>;

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
        HttpClientTestingModule,
        RouterTestingModule,
        ToastrModule.forRoot(),
      ],
      declarations: [SubHeaderComponent],
      providers: [AppComponent, DocumentService, EventService, { provide: ThemeService, useValue: THEMES },
        { provide: ToastrService, useValue: toastrService }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call  enableEmergencyButton', fakeAsync(() => {
    fixture = TestBed.createComponent(SubHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'enableEmergencyButton').and.callThrough();
    component.enableEmergencyButton();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.enableEmergencyButton).toHaveBeenCalled();
    flush();
  }));

  it('should call  findZonesAlarmList', fakeAsync(() => {
    fixture = TestBed.createComponent(SubHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'findZonesAlarmList').and.callThrough();
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
    component.findZonesAlarmList(data);
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.findZonesAlarmList).toHaveBeenCalled();
    flush();
  }));

  it('should call get translation language key', fakeAsync(() => {
    fixture = TestBed.createComponent(SubHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getTranslationLang').and.callThrough();
    component.getTranslationLang('test');

    expect(component.getTranslationLang).toHaveBeenCalled();
    flush();
  }));

  it('should call changeLayerVisibility', fakeAsync(() => {
    fixture = TestBed.createComponent(SubHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'changeLayerVisibility').and.callThrough();
    let evt = {
      bubbles: true,
      cancelBubble: false,
      cancelable: false,
      composed: false,
      currentTarget: null,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: true,
      returnValue: true,
      timeStamp: 26535.695000027772,
      type: "change"
    }
    component.changeLayerVisibility(evt);

    expect(component.changeLayerVisibility).toHaveBeenCalled();
    flush();
  }));

  it('should call accPanelChange', fakeAsync(() => {
    fixture = TestBed.createComponent(SubHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'accPanelChange').and.callThrough();
    let evt = {
      bubbles: true,
      cancelBubble: false,
      cancelable: false,
      composed: false,
      currentTarget: null,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: true,
      returnValue: true,
      timeStamp: 26535.695000027772,
      type: "change",
      panelId: 2
    }
    component.accPanelChange(evt);

    expect(component.accPanelChange).toHaveBeenCalled();
    flush();
  }));

  it('should call assignToDefault', fakeAsync(() => {
    fixture = TestBed.createComponent(SubHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'assignToDefault').and.callThrough();
    let evt = {
      geometry: {
        coordinates: [
          76.5393,
          14.3924],
        type: "Point",
      },
      properties: {
        current_status: true,
        ip: "127.0.0.1",
        is_assigned: 1,
        uav_id: "RTHZ - 1",
        zone_id: "20"
      },
      type: "Feature"
    }
    component.assignToDefault(evt, 'UAV');

    expect(component.assignToDefault).toHaveBeenCalled();
    flush();
  }));

  it('should call  getaccordionZones', fakeAsync(() => {
    fixture = TestBed.createComponent(SubHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.alarmService.getaccordionZones.subscribe();
    fixture.detectChanges();

    expect( component.alarmService.getaccordionZones).toBeDefined();
    flush();
  }));

  // it('should remove in local storage', () => {
  //   component.commonService.removeLocalStorage('test');
  //   fixture.detectChanges();
  //   expect(localStorage.getItem('test')).toBeNull();
  // });

  it('should check event service broadcast message', () => {
    component.eventService.broadcastMessage('ugv', {assignToDefault: true, ip: '10.66.40.61', zone_id: 21});
    fixture.detectChanges();
    expect(component.eventService.broadcastMessage).toBeDefined();
  });

});
