import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, flush, inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IndividualConfig, ToastrModule, ToastrService } from 'ngx-toastr';
import { AppComponent } from 'src/app/app.component';
import { AlarmService } from 'src/app/services/alarm.service';
import { DocumentService } from 'src/app/services/document.service';
import { EventService } from 'src/app/services/event.service';
import { THEMES } from 'src/app/theme/symbols';
import { ThemeService } from 'src/app/theme/theme.service';
import { SharedModule } from '../../shared/shared.module';
import { MapsComponent } from './maps.component';

describe('MapsComponent', () => {
  let component: MapsComponent;
  let fixture: ComponentFixture<MapsComponent>;

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
        RouterTestingModule,
        HttpClientTestingModule,
        SharedModule,
        ToastrModule.forRoot(),
      ],
      declarations: [MapsComponent],
      providers: [AppComponent, DocumentService, EventService, { provide: ThemeService, useValue: THEMES },
        { provide: ToastrService, useValue: toastrService },]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#getObservableValue should return value from observable',
    inject([AlarmService], (alarmService: AlarmService, done: DoneFn) => {
      console.log('value22', alarmService.getAlarmInfo().subscribe(val =>
        console.log('value', val)));
      alarmService.getAlarmInfo().subscribe(value => {
        console.log('value', value);
        expect(value).toBe('observable value');
        done();
      });
    }));

  it('should call update radar track', () => {
    const spy = spyOn(component, "updateRadarTrack");
    component.updateRadarTrack();
    expect(spy).toHaveBeenCalled();
  });

  it('should call theme selection', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    // component.olmap = fixture.debugElement.query(By.css['#diagnostics-map']);
    fixture.detectChanges();

    spyOn(component, 'themeSelection').and.callThrough();
    // component.themeSelection('default');

    // expect(component.themeSelection).toHaveBeenCalled();
    expect(component.themeSelection).toThrowMatching(err => err);

    flush();
  }));

  it('should call changeVisibility ', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'changeVisibility').and.callThrough();
    component.changeVisibility();

    expect(component.changeVisibility).toHaveBeenCalled();
    flush();
  }));

  it('should call checkAuthendication ', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'checkAuthendication').and.callThrough();
    component.checkAuthendication();

    expect(component.checkAuthendication).toHaveBeenCalled();
    flush();
  }));

  it('should call changeMaskType ', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    var evntMask = {
      target: {
        value: 'None'
      }
    }

    spyOn(component, 'changeMaskType').and.callThrough();
    component.changeMaskType(evntMask);

    expect(component.changeMaskType).toHaveBeenCalled();
    flush();
  }));

  it('should call AddInteractions ', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'addInteractions').and.callThrough();
    // component.addInteractions();

    // expect(component.addInteractions).toHaveBeenCalled();
    expect(component.addInteractions).toThrowMatching(err => err);
    flush();
  }));

  it('should call playAlarmAudio ', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'playAlarmAudio').and.callThrough();
    component.playAlarmAudio();

    expect(component.playAlarmAudio).toHaveBeenCalled();
    flush();
  }));

  it('should call openFullscreen ', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'openFullscreen').and.callThrough();
    // component.openFullscreen();

    // expect(component.openFullscreen).toHaveBeenCalled();
    expect(component.openFullscreen).toThrowMatching(err => err);
    flush();
  }));

  it('should call getPerimeterCoordinates', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getPerimeterCoordinates').and.callThrough();
    component.getPerimeterCoordinates();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.getPerimeterCoordinates).toHaveBeenCalled();
    expect(component.getPerimeterCoordinates).toBeDefined();
    flush();
  }));

  it('should call getZoneCoordinates', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getZoneCoordinates').and.callThrough();
    component.getZoneCoordinates();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.getZoneCoordinates).toHaveBeenCalled();
    expect(component.getZoneCoordinates).toBeDefined();
    flush();
  }));


  it('should call getSensorCoordinates', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getSensorCoordinates').and.callThrough();
    component.getSensorCoordinates();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.getSensorCoordinates).toHaveBeenCalled();
    expect(component.getSensorCoordinates).toBeDefined();
    flush();
  }));


  it('should call getUgvsUavs', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getUgvsUavs').and.callThrough();
    component.getUgvsUavs();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.getUgvsUavs).toHaveBeenCalled();
    expect(component.getUgvsUavs).toBeDefined();
    flush();
  }));

  it('should call updateRadarTrack', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'updateRadarTrack').and.callThrough();
    component.updateRadarTrack();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.updateRadarTrack).toHaveBeenCalled();
    expect(component.updateRadarTrack).toBeDefined();
    flush();
  }));

  it('should call getServerData', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getServerData').and.callThrough();
    component.getServerData();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.getServerData).toHaveBeenCalled();
    expect(component.getServerData).toBeDefined();
    flush();
  }));

  it('should call changeVisibility', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'changeVisibility').and.callThrough();
    component.changeVisibility();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.changeVisibility).toHaveBeenCalled();
    expect(component.changeVisibility).toBeDefined();
    flush();
  }));

  it('should call checkAuthendication', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'checkAuthendication').and.callThrough();
    component.checkAuthendication();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.checkAuthendication).toHaveBeenCalled();
    expect(component.checkAuthendication).toBeDefined();
    flush();
  }));

  it('should call retriveRNDFFileData', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'retriveRNDFFileData').and.callThrough();
    component.retriveRNDFFileData();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.retriveRNDFFileData).toHaveBeenCalled();
    expect(component.retriveRNDFFileData).toBeDefined();
    flush();
  }));

  it('should call themeSelection', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'themeSelection').and.callThrough();
    component.themeSelection('default');
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.themeSelection).toHaveBeenCalled();
    expect(component.themeSelection).toBeDefined();
    flush();
  }));

  it('should call changeMaskedAreaTheme', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'changeMaskedAreaTheme').and.callThrough();
    component.changeMaskedAreaTheme('dark');
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.changeMaskedAreaTheme).toHaveBeenCalled();
    expect(component.changeMaskedAreaTheme).toBeDefined();
    flush();
  }));

  it('should call changeIconScale', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'changeIconScale').and.callThrough();
    component.changeIconScale('Medium');
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.changeIconScale).toHaveBeenCalled();
    expect(component.changeIconScale).toBeDefined();
    flush();
  }));

  it('should call setPTZControls', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'setPTZControls').and.callThrough();
    component.setPTZControls('10.66.44.1');
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.setPTZControls).toHaveBeenCalled();
    expect(component.setPTZControls).toBeDefined();
    flush();
  }));

  it('should call updateOpacity', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'updateOpacity').and.callThrough();
    component.updateOpacity(false, false);
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.updateOpacity).toHaveBeenCalled();
    expect(component.updateOpacity).toBeDefined();
    flush();
  }));

  it('should call getUpdatedLayers', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'getUpdatedLayers').and.callThrough();
    component.getUpdatedLayers();
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.getUpdatedLayers).toHaveBeenCalled();
    expect(component.getUpdatedLayers).toBeDefined();
    flush();
  }));

  it('set zone coordinates', fakeAsync(() => {
    fixture = TestBed.createComponent(MapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    var data = {
      zone_type: 'User Defined',
      zone_shape: 'multipolygon',
      zone_center:  null,
      zone_radius:  null,
      zone_area:  null,
      zone_priority: 1,
      current_status: 1
    };

    spyOn(component, 'setZoneCoordinates').and.callThrough();
    component.setZoneCoordinates(data);
    fixture.detectChanges();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.setZoneCoordinates).toHaveBeenCalled();
    expect(component.setZoneCoordinates).toBeDefined();
    flush();
  }));
});
