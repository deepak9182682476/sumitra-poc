import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { IndividualConfig, ToastrModule, ToastrService } from 'ngx-toastr';
import { THEMES } from 'src/app/theme/symbols';
import { Map } from 'ol';
import { ThemeService } from 'src/app/theme/theme.service';

import { SystemConfigurationComponent } from './system-configuration.component';
import { OlmapService } from 'src/app/services/olmap.service';

describe('SystemConfigurationComponent', () => {
  let component: SystemConfigurationComponent;
  let fixture: ComponentFixture<SystemConfigurationComponent>;
  let service: OlmapService;
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
    info: (
      message?: string,
      title?: string,
      override?: Partial<IndividualConfig>
    ) => { },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SystemConfigurationComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule, ToastrModule.forRoot(),],
      providers: [OlmapService, { provide: ThemeService, useValue: THEMES }, { provide: ToastrService, useValue: toastrService }],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
      service = TestBed.get(OlmapService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getMapConfiguration() on init method', () => {
    spyOn(component, 'getMapConfiguration').and.callThrough();
    component.ngOnInit();
    expect(component.getMapConfiguration).toHaveBeenCalled()
  });

  it('should call getAllSensors() on init method', () => {
    spyOn(component, 'getAllSensors').and.callThrough();
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.getAllSensors).toHaveBeenCalled()
  });

  it('should call getSystemConfiguration() on init method', () => {
    spyOn(component, 'getSystemConfiguration').and.callThrough();
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.getSystemConfiguration).toHaveBeenCalled()
  });

  it('should call update config', () => {
    component.updateConfig();
    expect(component.checkedSensors.length).toEqual(0);
    fixture.detectChanges();
  });

  it('should call getCheckedCheckbox ', () => {
    spyOn(component, "getCheckedCheckbox").and.callThrough();
    component.getCheckedCheckbox(1);
    fixture.detectChanges();

    expect(component.checkedSensors.length).toEqual(1);
    fixture.detectChanges();
    expect(component.getCheckedCheckbox).toHaveBeenCalled();
  });

  it('should call themeSelection ', () => {
    component.olmap = service.get();
    fixture.detectChanges();

    spyOn(component, "themeSelection").and.callThrough();
    component.themeSelection('dark');
    fixture.detectChanges();

    expect(component.themeSelection).toHaveBeenCalled();
  });

  it('should call drawSiteArea ', () => {
    component.olmap = service.get();
    fixture.detectChanges();

    spyOn(component, "drawSiteArea").and.callThrough();
    component.drawSiteArea();
    fixture.detectChanges();

    expect(component.drawSiteArea).toHaveBeenCalled();
  });

  it('should call saveSiteArea ', () => {
    spyOn(component, "saveSiteArea").and.callThrough();
    component.saveSiteArea([]);
    fixture.detectChanges();
    
    expect(component.saveSiteArea).toHaveBeenCalled();
  });

  it('getTranslationLang method should be called', () => {
    spyOn(component, "getTranslationLang").and.callThrough();
    component.getTranslationLang('test');
    fixture.detectChanges();

    expect(component).toBeDefined();
    expect(component.getTranslationLang).toHaveBeenCalled();
  });

  it('onFileChange method should be called', () => {
    spyOn(component, "onFileChange").and.callThrough();

    let ev = {"isTrusted": true}
    component.onFileChange(ev);
    fixture.detectChanges();

    expect(component.onFileChange).toHaveBeenCalled();

    expect(component).toBeDefined();
  });

  it('plotSiteArea method should be called', () => {
    component.olmap = service.get();
    fixture.detectChanges();

    var spy = spyOn(component, "plotSiteArea").and.callThrough();
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
    component.plotSiteArea(result[0].geojson);
    fixture.detectChanges();

    expect(component.plotSiteArea).toHaveBeenCalled();
    expect(component).toBeDefined();
    expect(spy);
  });

  // it('should call update config',()=>{
  //   component.selectedMembersCount = 0;
  //   component.getDataFromWidget();
  //   expect(component.selectedMembersCount).toEqual(1);
  //   fixture.detectChanges();
  //   const htmlEle  = fixture.debugElement.nativeElement.querySelector('#some-count'); // For class try query(By.css('.some-count')).nativeElement;
  //   expect(htmlEle.innerHTML).toBe(1);        
  // })
});
