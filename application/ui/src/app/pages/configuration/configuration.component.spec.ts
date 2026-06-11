import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigurationComponent } from './configuration.component';
import { EventService } from 'src/app/services/event.service';
import { IndividualConfig, ToastrModule, ToastrService } from 'ngx-toastr';

describe('ConfigurationComponent', () => {
  let component: ConfigurationComponent;
  let fixture: ComponentFixture<ConfigurationComponent>;

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
        ReactiveFormsModule,
        ModalModule.forRoot(),
        ToastrModule.forRoot(),
      ],
      declarations: [ConfigurationComponent],
      providers: [BsModalService, EventService, { provide: ToastrService, useValue: toastrService }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call set configurable data', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    component.config_type = "sensor";
    fixture.detectChanges();

    spyOn(component, 'setConfigurableData').and.callThrough();
    component.setConfigurableData(component.config_type);
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.setConfigurableData).toHaveBeenCalled();
    expect(component.setConfigurableData).toBeDefined();
    flush();
  }));

  it('should call configured alarm service getSensorDetails', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    spyOn(component.alarmService, 'getSensorDetails').and.callThrough();
    component.alarmService.getSensorDetails();
    fixture.detectChanges();

    expect(component.alarmService.getSensorDetails).toHaveBeenCalled();
    expect(component.alarmService.getSensorDetails).toBeDefined();
    flush();
  }));

  it('should call configured data service getUserDetails', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    spyOn(component.dataService, 'getUserDetails').and.callThrough();
    component.dataService.getUserDetails();
    fixture.detectChanges();

    expect(component.dataService.getUserDetails).toHaveBeenCalled();
    expect(component.dataService.getUserDetails).toBeDefined();
    flush();
  }));

  it('should call open modal when clicked ', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    let tempRef = component.templateRef;
    component.dataJson = require('../../../config/sensor_configuration.json');
    fixture.detectChanges();

    var mockModalObj = {
      azimuth: null,
      current_status: false,
      height: "1.5",
      installed_on: "2020-10-12T13:29:55.518Z",
      ip: "10.66.40.61",
      latitude: 9.9555087,
      longitude: 76.238227,
      mac_address: "08:00:2b:01:02:03",
      password: null,
      radius: null,
      sensor_id: 15,
      sensor_type: "EOIR",
      username: null,
      zone_id: "21"
    }

    spyOn(component, 'openModal').and.callThrough();
    const sensor_config = require('../../../config/sensor_configuration.json');
    component.clonedDataJson = JSON.parse(JSON.stringify(sensor_config));
    component.openModal(tempRef, mockModalObj);
    fixture.detectChanges();

    expect(component.openModal).toHaveBeenCalled();
    expect(component.openModal).toBeDefined();
    flush();
  }));

  it('should call open usermodal when clicked ', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    let temp1Ref = component.template1Ref;
    component.dataJson = require('../../../config/sensor_configuration.json');
    fixture.detectChanges();

    var mockUserModalObj = {
      lastlogin_attempt: "2020-10-30T18:30:00.000Z",
      role_name: "super admin",
      user_id: 1,
      user_name: "admin",
      user_role: 1
    }

    spyOn(component, 'openUserModal').and.callThrough();
    component.openUserModal(temp1Ref, mockUserModalObj);
    fixture.detectChanges();

    expect(component.openUserModal).toHaveBeenCalled();
    expect(component.openUserModal).toBeDefined();
    flush();
  }));

  it('should call change status', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    let temp1Ref = component.template1Ref;
    fixture.detectChanges();

    var mockStatusObj = { "sensor_id": 15, "sensor_type": "EOIR", "sensor_location": { "crs": { "type": "name", "properties": { "name": "EPSG:4326" } }, "type": "Point", "coordinates": [76.55860360767105, 14.381159351709739] }, "current_status": false, "ip": "10.66.40.61", "mac_address": "08:00:2b:01:02:03", "height": "1.5", "radius": null, "installed_on": "2020-10-12T13:29:55.518Z", "zone_id": "21", "azimuth": null, "username": null, "password": null }
    var mockevtService = {
      target:{
        checked: true
      }
    }
    spyOn(component, 'changeStatus').and.callThrough();
    component.changeStatus(mockevtService, mockStatusObj);
    fixture.detectChanges();

    expect(component.changeStatus).toHaveBeenCalled();
    expect(component.changeStatus).toBeDefined();
    flush();
  }));

  it('should call change status for delete', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    var mockDeleteStatusObj = { "sensor_id": 15, "sensor_type": "EOIR", "sensor_location": { "crs": { "type": "name", "properties": { "name": "EPSG:4326" } }, "type": "Point", "coordinates": [76.55860360767105, 14.381159351709739] }, "current_status": false, "ip": "10.66.40.61", "mac_address": "08:00:2b:01:02:03", "height": "1.5", "radius": null, "installed_on": "2020-10-12T13:29:55.518Z", "zone_id": "21", "azimuth": null, "username": null, "password": null }

    spyOn(component, 'changeStatus').and.callThrough();
    component.changeStatus(null, mockDeleteStatusObj);
    fixture.detectChanges();

    expect(component.changeStatus).toHaveBeenCalled();
    expect(component.changeStatus).toBeDefined();
    flush();
  }));

  it('should call change user status', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    var mockUsrStatusObj = { user_id: 5, user_name: "maingate_user", user_role: 5, role_name: "maingate_user", lastlogin_attempt: null }

    spyOn(component, 'changeUserStatus').and.callThrough();
    component.changeUserStatus(mockUsrStatusObj);
    fixture.detectChanges();

    expect(component.changeUserStatus).toHaveBeenCalled();
    expect(component.changeUserStatus).toBeDefined();
    flush();
  }));

  it('should call change user status for delete', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    var mockDeleteUsrStatusObj = { user_id: 2, user_name: "maingate_user", user_role: 5, role_name: "maingate_user", lastlogin_attempt: null }

    spyOn(component, 'changeUserStatus').and.callThrough();
    component.changeUserStatus(mockDeleteUsrStatusObj);
    fixture.detectChanges();

    expect(component.changeUserStatus).toHaveBeenCalled();
    expect(component.changeUserStatus).toBeDefined();
    flush();
  }));

  it('should call update form', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'updateForm').and.callThrough();
    component.updateForm('2', {});
    fixture.detectChanges();

    expect(component.updateForm).toHaveBeenCalled();
    expect(component.updateForm).toBeDefined();
    flush();
  }));

  it('should call user config submit form', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    var userConfigObj = {
      confirmpassword: "admin",
      user_id: 1,
      password: "admin",
      user_name: "admin"
    }

    spyOn(component, 'onUserConfigSubmit').and.callThrough();
    component.onUserConfigSubmit(userConfigObj);
    fixture.detectChanges();

    expect(component.onUserConfigSubmit).toHaveBeenCalled();
    expect(component.onUserConfigSubmit).toBeDefined();
    flush();
  }));

  it('should call sensor configuration onsubmit form for save', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    var saveConfigSubmitObj = { "sensor_type": "AGU", "zone_id": "12", "ip": "172.16.09", "mac_address": "08.00.2b:01:02:03", "longitude": "76.54", "latitude": "14:396", "azimuth": "azi", "height": "1.4", "current_status": "", "sensor_id": "" }

    spyOn(component, 'onSubmit').and.callThrough();
    component.onSubmit(saveConfigSubmitObj);
    fixture.detectChanges();

    expect(component.onSubmit).toHaveBeenCalled();
    expect(component.onSubmit).toBeDefined();
    flush();
  }));

  it('should call sensor configuration onsubmit form for edit', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    var editConfigSubmitObj = { "sensor_type": "IFF", "zone_id": "21", "ip": "172.16.0.9", "mac_address": "08:00:2b:01:02:03", "longitude": 76.5572354396884, "latitude": 14.378743395789671, "azimuth": "azi", "height": "1.5", "current_status": true, "sensor_id": 16 }

    spyOn(component, 'onSubmit').and.callThrough();
    component.onSubmit(editConfigSubmitObj);
    fixture.detectChanges();

    expect(component.onSubmit).toHaveBeenCalled();
    expect(component.onSubmit).toBeDefined();
    flush();
  }));

  it('should call setFormFields', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const sensor_config = require('../../../config/sensor_configuration.json');
    component.dataJson = sensor_config;
    fixture.detectChanges();
    
    spyOn(component, 'setFormFields').and.callThrough();
    component.setFormFields();
    fixture.detectChanges();

    expect(component.setFormFields).toHaveBeenCalled();
    expect(component.setFormFields).toBeDefined();
    flush();
  }));

  it('should call getRndfFiles', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getRndfFiles').and.callThrough();
    component.getRndfFiles();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.getRndfFiles).toHaveBeenCalled();
    expect(component.getRndfFiles).toBeDefined();
    flush();
  }));

  it('should call saveRndfConfig', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'saveRndfConfig').and.callThrough();
    component.saveRndfConfig();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.saveRndfConfig).toHaveBeenCalled();
    expect(component.saveRndfConfig).toBeDefined();
    flush();
  }));

  it('should call saveRndfCallback', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'saveRndfCallback').and.callThrough();
    component.saveRndfCallback();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.saveRndfCallback).toHaveBeenCalled();
    expect(component.saveRndfCallback).toBeDefined();
    flush();
  }));

  it('should call uploadFiles', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'uploadFiles').and.callThrough();
    component.uploadFiles();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.uploadFiles).toHaveBeenCalled();
    expect(component.uploadFiles).toBeDefined();
    flush();
  }));

  it('should call editRndfConfig', fakeAsync(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    let data = {
      title: '',
      file_name: '',
      id: 1
    }
    spyOn(component, 'editRndfConfig').and.callThrough();
    component.editRndfConfig(data);
    fixture.detectChanges();

    expect(component.editRndfConfig).toHaveBeenCalled();
    expect(component.editRndfConfig).toBeDefined();
    flush();
  }));

});
